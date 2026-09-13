// src/components/hooks/use-voice-input.ts
// Aligned dual-pipeline speech recognition engine (WebSpeech + Groq Whisper fallback)
import { useState, useRef, useCallback, useEffect } from "react"
import { transcribeAudioBlob } from "@/lib/groq-whisper"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export type VoiceState = "idle" | "listening" | "processing" | "error"

export interface UseVoiceInputOptions {
  lang?: string
  onTranscript?: (transcript: string) => void
  onLiveTranscript?: (interim: string) => void
  onError?: (errorMessage: string) => void
}

export function useVoiceInput(options?: UseVoiceInputOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [transcript, setTranscript] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const spokenTranscriptRef = useRef("")
  const finalizedPrefixRef = useRef("")
  const webSpeechFailedRef = useRef(false)
  const hasSpokenWebSpeechRef = useRef(false)
  const isManualStopRef = useRef(false)
  const isCleaningUpRef = useRef(false)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const liveWhisperTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const maxVolumeRef = useRef(0)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const cleanupHardware = useCallback(() => {
    isCleaningUpRef.current = true
    clearSilenceTimer()

    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current)
      safetyTimeoutRef.current = null
    }

    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current)
      volumeIntervalRef.current = null
    }

    if (liveWhisperTimerRef.current) {
      clearInterval(liveWhisperTimerRef.current)
      liveWhisperTimerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch {}
      })
      streamRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close()
      } catch {}
      audioContextRef.current = null
    }
    analyserRef.current = null

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
      } catch {}
      recognitionRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop()
      } catch {}
    }
    mediaRecorderRef.current = null
    isCleaningUpRef.current = false
  }, [clearSilenceTimer])

  const reset = useCallback(() => {
    cleanupHardware()
    setVoiceState("idle")
    setTranscript("")
    setErrorMessage("")
    spokenTranscriptRef.current = ""
    finalizedPrefixRef.current = ""
    webSpeechFailedRef.current = false
    hasSpokenWebSpeechRef.current = false
    isManualStopRef.current = false
    maxVolumeRef.current = 0
    audioChunksRef.current = []
    optionsRef.current?.onLiveTranscript?.("")
  }, [cleanupHardware])

  // Finalize processing: delivers speech text via WebSpeech or Whisper fallback
  const handleFinalSpeech = useCallback(async () => {
    clearSilenceTimer()
    setVoiceState("processing")

    let finalText = spokenTranscriptRef.current.trim()

    // Transcribe audio blob via Groq Whisper fallback if WebSpeech did not capture text (e.g. Brave, Firefox, or SpeechRecognition failure)
    if (!finalText && audioChunksRef.current.length > 0) {
      try {
        const mimeType = mediaRecorderRef.current?.mimeType || audioChunksRef.current[0]?.type || "audio/webm"
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

        if (audioBlob.size > 200) {
          console.log(`[useVoiceInput] WebSpeech empty, transcribing audio blob (${audioBlob.size} bytes) via Whisper fallback...`)
          const whisperResult = await transcribeAudioBlob(audioBlob)
          if (whisperResult && whisperResult.trim()) {
            finalText = whisperResult.trim()
            console.log("[useVoiceInput] Using Whisper transcript:", finalText)
          }
        }
      } catch (err) {
        console.warn("[useVoiceInput] Whisper fallback error:", err)
      }
    }

    cleanupHardware()

    // Filter out single-word stopword hallucinations (CRITICAL: preserve Devanagari Unicode \u0900-\u097F)
    const cleaned = finalText.toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, "").trim()
    const silenceStopwords = new Set([
      "the", "a", "an", "you", "so", "and", "or", "it", "to", "in", "is", "of",
      "bye", "goodbye", "thank you", "thanks", "subtitles by", "watching", "music",
      "thank you for watching", "please subscribe"
    ])

    if (!finalText || silenceStopwords.has(cleaned) || cleaned.length === 0) {
      console.log("[useVoiceInput] Discarded silence or empty speech artifact:", finalText)
      setErrorMessage("No clear speech detected. Please speak clearly into your microphone and try again. / आवाज़ साफ़ सुनाई नहीं दी, कृपया पुनः बोलें।")
      setVoiceState("error")
      setTranscript("")
      return
    }

    console.log("[useVoiceInput] Final accepted speech transcript:", finalText)
    setTranscript(finalText)
    setVoiceState("idle")
    optionsRef.current?.onTranscript?.(finalText)
  }, [cleanupHardware, clearSilenceTimer])

  const stopListening = useCallback(async () => {
    isManualStopRef.current = true
    clearSilenceTimer()

    if (liveWhisperTimerRef.current) {
      clearInterval(liveWhisperTimerRef.current)
      liveWhisperTimerRef.current = null
    }

    setVoiceState("processing")

    // Stop MediaRecorder and wait for final chunks to flush
    const recorder = mediaRecorderRef.current
    const recorderPromise = new Promise<void>((resolve) => {
      if (recorder && recorder.state === "recording") {
        recorder.addEventListener("stop", () => resolve(), { once: true })
        try {
          recorder.stop()
        } catch {
          resolve()
        }
        // Fallback timeout in case onstop doesn't fire
        setTimeout(resolve, 500)
      } else {
        resolve()
      }
    })

    // Stop WebSpeech recognition gracefully
    const recognition = recognitionRef.current
    const recognitionPromise = new Promise<void>((resolve) => {
      if (recognition) {
        // If we already have a transcript, wait 200ms for any final punctuation
        // If transcript is empty, wait up to 600ms for Google speech server to return final text
        const waitMs = spokenTranscriptRef.current.trim() ? 200 : 600
        const timer = setTimeout(resolve, waitMs)

        try {
          recognition.stop()
        } catch {
          clearTimeout(timer)
          resolve()
        }
      } else {
        resolve()
      }
    })

    await Promise.all([recorderPromise, recognitionPromise])
    await handleFinalSpeech()
  }, [clearSilenceTimer, handleFinalSpeech])

  const startListening = useCallback(async () => {
    cleanupHardware()
    setErrorMessage("")
    setTranscript("")
    spokenTranscriptRef.current = ""
    finalizedPrefixRef.current = ""
    webSpeechFailedRef.current = false
    hasSpokenWebSpeechRef.current = false
    isManualStopRef.current = false
    maxVolumeRef.current = 0
    audioChunksRef.current = []
    optionsRef.current?.onLiveTranscript?.("")

    try {
      // 0. Check for insecure origin (e.g. testing over LAN IP http://192.168.x.x without HTTPS)
      if (
        typeof window !== "undefined" &&
        !window.isSecureContext &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        throw new Error(
          "Microphone requires HTTPS or http://localhost. Browsers block audio capture on HTTP IP addresses (e.g. 192.168.x.x). Please test on your PC at http://localhost:5173 or use an HTTPS tunnel (e.g., Cloudflare Tunnel / ngrok)."
        )
      }

      // 1. Initialize microphone stream
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not supported by your browser or is blocked by security settings.")
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // 2. Setup Web Audio visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          const ctx = new AudioCtx()
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 64
          const source = ctx.createMediaStreamSource(stream)
          source.connect(analyser)
          audioContextRef.current = ctx
          analyserRef.current = analyser

          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          volumeIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i]
            }
            const avg = sum / dataArray.length
            if (avg > maxVolumeRef.current) {
              maxVolumeRef.current = avg
            }
          }, 80)
        }
      } catch (e) {
        console.warn("[useVoiceInput] AudioContext visualizer init failed:", e)
      }

      // 3. Setup MediaRecorder for continuous fallback capture
      let mimeType = ""
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus"
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm"
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4"
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.start(200) // Collect chunks every 200ms
      setVoiceState("listening")

      // 4. Initialize Web Speech API & Continuous Auto-Recreation
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition

      const createAndStartRecognition = () => {
        if (isManualStopRef.current || isCleaningUpRef.current) return
        if (!SpeechRecognitionClass) {
          webSpeechFailedRef.current = true
          return
        }

        try {
          // Abort previous instance if any
          if (recognitionRef.current) {
            try {
              recognitionRef.current.onresult = null
              recognitionRef.current.onerror = null
              recognitionRef.current.onend = null
              recognitionRef.current.abort()
            } catch {}
            recognitionRef.current = null
          }

          const recognition = new SpeechRecognitionClass()
          recognition.lang = optionsRef.current?.lang || "en-IN"
          recognition.interimResults = true
          recognition.continuous = true
          recognition.maxAlternatives = 1

          recognition.onresult = (event: any) => {
            let sessionFinal = ""
            let sessionInterim = ""

            // Accumulate all finalized and interim segments in current recognition session
            for (let i = 0; i < event.results.length; i++) {
              const res = event.results[i]
              const segment = res[0]?.transcript || ""
              if (res.isFinal) {
                sessionFinal += (sessionFinal ? " " : "") + segment.trim()
              } else {
                sessionInterim += (sessionInterim ? " " : "") + segment.trim()
              }
            }

            const prefix = finalizedPrefixRef.current.trim()
            const combinedFinal = (prefix ? prefix + " " : "") + sessionFinal
            const current = (combinedFinal + (sessionInterim ? " " + sessionInterim : "")).trim().replace(/\s+/g, " ")

            if (current) {
              hasSpokenWebSpeechRef.current = true
              spokenTranscriptRef.current = current
              setTranscript(current)
              optionsRef.current?.onLiveTranscript?.(current)

              // Reset silence timer on every spoken syllable/word:
              // Gives the user a generous 3 seconds pause after speaking before auto-finalizing
              clearSilenceTimer()
              silenceTimerRef.current = setTimeout(() => {
                console.log("[useVoiceInput] 3s silence detected. Auto-finalizing speech...")
                stopListening()
              }, 3000)
            }
          }

          recognition.onerror = (event: any) => {
            console.warn("[useVoiceInput] SpeechRecognition error:", event.error)
            if (event.error === "network") {
              webSpeechFailedRef.current = true
            } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
              const msg = "Microphone access denied. Please click the lock icon in your browser address bar to allow microphone."
              setErrorMessage(msg)
              setVoiceState("error")
              cleanupHardware()
              optionsRef.current?.onError?.(msg)
            } else if (event.error === "no-speech") {
              // Normal silence detection in Chrome; stay listening
            }
          }

          recognition.onend = () => {
            console.log("[useVoiceInput] SpeechRecognition onend triggered.")
            if (isManualStopRef.current || isCleaningUpRef.current) {
              return
            }

            // Save current accumulated text into prefix so restart seamless builds on top
            if (spokenTranscriptRef.current.trim()) {
              finalizedPrefixRef.current = spokenTranscriptRef.current.trim()
            }

            // Seamlessly restart with a FRESH SpeechRecognition instance if user has NOT stopped and mic is alive
            if (streamRef.current && streamRef.current.active) {
              setTimeout(() => {
                if (streamRef.current && streamRef.current.active && !isManualStopRef.current && !isCleaningUpRef.current) {
                  createAndStartRecognition()
                }
              }, 40)
            }
          }

          recognitionRef.current = recognition
          recognition.start()
        } catch (err) {
          console.warn("[useVoiceInput] Recognition start error:", err)
          webSpeechFailedRef.current = true
        }
      }

      createAndStartRecognition()

      // 5. Live Whisper Background Fallback:
      // If WebSpeech is not supported or fails (Brave/Firefox/network error),
      // periodically transcribe recorded audio chunks so live speech STILL writes on screen in real time!
      let whisperBusy = false
      liveWhisperTimerRef.current = setInterval(async () => {
        if (isManualStopRef.current || isCleaningUpRef.current) return
        // If WebSpeech is actively transcribing, let WebSpeech handle live updates
        if (hasSpokenWebSpeechRef.current && !webSpeechFailedRef.current) return
        if (whisperBusy || audioChunksRef.current.length === 0) return

        try {
          whisperBusy = true
          const curMime = mediaRecorderRef.current?.mimeType || audioChunksRef.current[0]?.type || "audio/webm"
          const currentBlob = new Blob(audioChunksRef.current, { type: curMime })
          if (currentBlob.size > 800) {
            const liveText = await transcribeAudioBlob(currentBlob)
            if (liveText && liveText.trim() && !hasSpokenWebSpeechRef.current) {
              spokenTranscriptRef.current = liveText.trim()
              setTranscript(liveText.trim())
              optionsRef.current?.onLiveTranscript?.(liveText.trim())
            }
          }
        } catch (e) {
          console.warn("[useVoiceInput] Live Whisper tick error:", e)
        } finally {
          whisperBusy = false
        }
      }, 1800)

      // Safety timeout: 35s max continuous session
      safetyTimeoutRef.current = setTimeout(() => {
        stopListening()
      }, 35000)

    } catch (err: any) {
      console.error("[useVoiceInput] Start error:", err)
      cleanupHardware()
      const msg = err?.name === "NotAllowedError" || err?.message?.includes("denied")
        ? "Microphone access denied. Please click the lock icon in your browser to allow microphone."
        : (err?.message || "Could not start microphone.")
      setErrorMessage(msg)
      setVoiceState("error")
      optionsRef.current?.onError?.(msg)
    }
  }, [cleanupHardware, stopListening, handleFinalSpeech, clearSilenceTimer])

  useEffect(() => {
    return () => {
      cleanupHardware()
    }
  }, [cleanupHardware])

  return {
    voiceState,
    transcript,
    errorMessage,
    startListening,
    stopListening,
    reset,
    analyserRef,
  }
}
