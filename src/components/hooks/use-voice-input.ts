// src/components/hooks/use-voice-input.ts
// Ported and aligned with avksr/VoiceKhata speech recognition pipeline
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
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const maxVolumeRef = useRef(0)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const cleanupHardware = useCallback(() => {
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
  }, [])

  const reset = useCallback(() => {
    cleanupHardware()
    setVoiceState("idle")
    setTranscript("")
    setErrorMessage("")
    spokenTranscriptRef.current = ""
    webSpeechFailedRef.current = false
    maxVolumeRef.current = 0
    audioChunksRef.current = []
  }, [cleanupHardware])

  // Finalize processing: only delivers text if genuine speech was heard
  const handleFinalSpeech = useCallback(async () => {
    setVoiceState("processing")

    let finalText = spokenTranscriptRef.current.trim()

    // 1. Guard against pure silence/air:
    // If WebSpeech heard nothing AND mic volume never rose above ambient noise threshold (15):
    if (!finalText && maxVolumeRef.current < 15) {
      console.log("[useVoiceInput] Ambient air/silence only (max volume:", maxVolumeRef.current, "). Discarding.")
      cleanupHardware()
      setVoiceState("idle")
      setTranscript("")
      return
    }

    // 2. If WebSpeech had a network error or was empty, try Whisper with recorded audio
    if ((!finalText || webSpeechFailedRef.current) && audioChunksRef.current.length > 0) {
      try {
        const mimeType = mediaRecorderRef.current?.mimeType || audioChunksRef.current[0]?.type || "audio/webm"
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

        // Only call Whisper if audio has non-trivial size (> 3000 bytes) and volume was detected
        if (audioBlob.size > 3000 && maxVolumeRef.current >= 15) {
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

    // 3. Filter out single-word stopword hallucinations (e.g. "The", "a", "you")
    const cleaned = finalText.toLowerCase().replace(/[^\w\s]/g, "").trim()
    const silenceStopwords = new Set([
      "the", "a", "an", "you", "so", "and", "or", "it", "to", "in", "is", "of",
      "bye", "goodbye", "thank you", "thanks", "subtitles by", "watching", "music"
    ])

    if (!finalText || silenceStopwords.has(cleaned) || cleaned.length <= 2) {
      console.log("[useVoiceInput] Discarded silence or empty artifact:", finalText)
      setVoiceState("idle")
      setTranscript("")
      return
    }

    console.log("[useVoiceInput] Final accepted speech:", finalText)
    setTranscript(finalText)
    setVoiceState("idle")
    optionsRef.current?.onTranscript?.(finalText)
  }, [cleanupHardware])

  const stopListening = useCallback(() => {
    if (voiceState !== "listening") return

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }

    handleFinalSpeech()
  }, [voiceState, handleFinalSpeech])

  const startListening = useCallback(async () => {
    cleanupHardware()
    setErrorMessage("")
    setTranscript("")
    spokenTranscriptRef.current = ""
    webSpeechFailedRef.current = false
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

      // 2. Setup Web Audio visualizer and real volume monitoring
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

      // 3. Setup MediaRecorder for fallback
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

      recorder.start() // Clean continuous capture
      setVoiceState("listening")

      // 4. Initialize Web Speech API — aligned with avksr/VoiceKhata
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass()
        recognition.lang = "hi-IN" // Standard Indian Hindi/English recognizer
        recognition.interimResults = true
        recognition.continuous = false // Browser detects natural end of speech

        recognition.onresult = (event: any) => {
          let interim = ""
          let newFinal = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const segment = event.results[i][0]?.transcript || ""
            if (event.results[i].isFinal) {
              newFinal += segment
            } else {
              interim += segment
            }
          }

          const current = (newFinal || interim).trim()
          if (current) {
            spokenTranscriptRef.current = current
            setTranscript(current)
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
          console.log("[useVoiceInput] Natural speech end detected by browser.")
          handleFinalSpeech()
        }

        recognitionRef.current = recognition
        recognition.start()
      } else {
        webSpeechFailedRef.current = true
      }

      // Safety timeout: 15s max
      safetyTimeoutRef.current = setTimeout(() => {
        stopListening()
      }, 15000)

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
