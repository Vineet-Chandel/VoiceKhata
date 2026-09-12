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
  onTranscript?: (transcript: string) => void
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
  const webSpeechFailedRef = useRef(false)
  const isManualStopRef = useRef(false)
  const isCleaningUpRef = useRef(false)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
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
    webSpeechFailedRef.current = false
    isManualStopRef.current = false
    maxVolumeRef.current = 0
    audioChunksRef.current = []
  }, [cleanupHardware])

  // Finalize processing: delivers speech text via WebSpeech or Whisper fallback
  const handleFinalSpeech = useCallback(async () => {
    clearSilenceTimer()
    setVoiceState("processing")

    let finalText = spokenTranscriptRef.current.trim()

    // Dual pipeline: If WebSpeech produced no text OR failed, fall back to Whisper on recorded audio blob
    if (!finalText && audioChunksRef.current.length > 0) {
      try {
        const mimeType = mediaRecorderRef.current?.mimeType || audioChunksRef.current[0]?.type || "audio/webm"
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

        if (audioBlob.size > 2000) {
          console.log("[useVoiceInput] WebSpeech produced no text. Transcribing audio blob via Whisper...")
          const whisperResult = await transcribeAudioBlob(audioBlob)
          if (whisperResult && whisperResult.trim()) {
            finalText = whisperResult.trim()
          }
        }
      } catch (err) {
        console.warn("[useVoiceInput] Whisper fallback error:", err)
      }
    }

    cleanupHardware()

    // Filter out single-word stopword hallucinations
    const cleaned = finalText.toLowerCase().replace(/[^\w\s]/g, "").trim()
    const silenceStopwords = new Set([
      "the", "a", "an", "you", "so", "and", "or", "it", "to", "in", "is", "of",
      "bye", "goodbye", "thank you", "thanks", "subtitles by", "watching", "music",
      "thank you for watching", "please subscribe"
    ])

    if (!finalText || silenceStopwords.has(cleaned) || cleaned.length <= 1) {
      console.log("[useVoiceInput] Discarded silence or empty speech artifact:", finalText)
      setVoiceState("idle")
      setTranscript("")
      return
    }

    console.log("[useVoiceInput] Final accepted speech transcript:", finalText)
    setTranscript(finalText)
    setVoiceState("idle")
    optionsRef.current?.onTranscript?.(finalText)
  }, [cleanupHardware, clearSilenceTimer])

  const stopListening = useCallback(() => {
    isManualStopRef.current = true
    clearSilenceTimer()

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop()
      } catch {}
    }

    handleFinalSpeech()
  }, [clearSilenceTimer, handleFinalSpeech])

  const startListening = useCallback(async () => {
    cleanupHardware()
    setErrorMessage("")
    setTranscript("")
    spokenTranscriptRef.current = ""
    webSpeechFailedRef.current = false
    isManualStopRef.current = false
    maxVolumeRef.current = 0
    audioChunksRef.current = []

    try {
      // 1. Initialize microphone stream
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not supported by your browser.")
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

      // 4. Initialize Web Speech API
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass()
        recognition.lang = "hi-IN" // Standard Indian Hindi/English recognizer
        recognition.interimResults = true
        recognition.continuous = true // Continuous listening: does NOT stop on micro-pauses

        recognition.onresult = (event: any) => {
          let fullFinal = ""
          let interim = ""

          // Accumulate across all results from 0 to preserve prior finalized sentences
          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i]
            const segment = res[0]?.transcript || ""
            if (res.isFinal) {
              fullFinal += (fullFinal ? " " : "") + segment.trim()
            } else {
              interim += (interim ? " " : "") + segment.trim()
            }
          }

          const current = (fullFinal + (interim ? " " + interim : "")).trim().replace(/\s+/g, " ")
          if (current) {
            spokenTranscriptRef.current = current
            setTranscript(current)

            // Reset silence timer on every spoken syllable/word:
            // Gives the user a comfortable 2.5 seconds pause before auto-finalizing
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current)
            }
            silenceTimerRef.current = setTimeout(() => {
              console.log("[useVoiceInput] 2.5s pause detected. Auto-finalizing speech...")
              stopListening()
            }, 2500)
          }
        }

        recognition.onerror = (event: any) => {
          console.warn("[useVoiceInput] SpeechRecognition error:", event.error)
          if (event.error === "network") {
            webSpeechFailedRef.current = true
          } else if (event.error === "not-allowed") {
            setErrorMessage("Microphone access denied. Please allow microphone permission.")
            setVoiceState("error")
            cleanupHardware()
            optionsRef.current?.onError?.("Microphone access denied.")
          }
        }

        recognition.onend = () => {
          console.log("[useVoiceInput] SpeechRecognition onend triggered.")
          if (isManualStopRef.current || isCleaningUpRef.current) {
            return
          }

          // If speech was already accumulated, finalize it
          if (spokenTranscriptRef.current.trim()) {
            handleFinalSpeech()
          } else if (streamRef.current && streamRef.current.active) {
            // If browser ended before user started speaking, safely resume recognition
            try {
              recognition.start()
            } catch {}
          }
        }

        recognitionRef.current = recognition
        recognition.start()
      } else {
        webSpeechFailedRef.current = true
      }

      // Safety timeout: 30s max continuous session
      safetyTimeoutRef.current = setTimeout(() => {
        stopListening()
      }, 30000)

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
  }, [cleanupHardware, stopListening, handleFinalSpeech])

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
