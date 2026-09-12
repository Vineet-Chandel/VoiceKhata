// src/components/hooks/use-voice-input.ts
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
  const webSpeechFailedRef = useRef(false)
  const webSpeechFinalTranscriptRef = useRef("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const optionsRef = useRef(options)

  // Keep optionsRef up to date with latest props/callbacks
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Clean up all hardware streams and contexts
  const cleanupHardware = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
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

    mediaRecorderRef.current = null
  }, [])

  const reset = useCallback(() => {
    cleanupHardware()
    setVoiceState("idle")
    setTranscript("")
    setErrorMessage("")
    webSpeechFailedRef.current = false
    webSpeechFinalTranscriptRef.current = ""
    audioChunksRef.current = []
  }, [cleanupHardware])

  // Internal: Finalize transcription using Groq Whisper or WebSpeech
  const finalizeTranscription = useCallback(async () => {
    setVoiceState("processing")

    let resultText = webSpeechFinalTranscriptRef.current.trim()

    // If WebSpeech failed or produced no text, use Groq Whisper with the recorded audio
    if (!resultText || webSpeechFailedRef.current) {
      const chunks = audioChunksRef.current
      if (chunks.length > 0) {
        try {
          const mimeType = mediaRecorderRef.current?.mimeType || chunks[0]?.type || "audio/webm"
          const audioBlob = new Blob(chunks, { type: mimeType })

          // Only call Whisper if we actually captured audio data (e.g. > 1KB)
          if (audioBlob.size > 1200) {
            const whisperText = await transcribeAudioBlob(audioBlob)
            if (whisperText.trim()) {
              resultText = whisperText.trim()
            }
          }
        } catch (err: any) {
          console.warn("[useVoiceInput] Whisper transcription fallback failed:", err)
        }
      }
    }

    cleanupHardware()

    if (resultText) {
      setTranscript(resultText)
      setVoiceState("idle")
      optionsRef.current?.onTranscript?.(resultText)
    } else {
      // Nothing heard or transcribed
      setVoiceState("idle")
    }
  }, [cleanupHardware])

  const stopListening = useCallback(() => {
    if (voiceState !== "listening") return

    setVoiceState("processing")

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Stop WebSpeech if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }

    // Stop MediaRecorder — this will trigger mediaRecorder.onstop
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        finalizeTranscription()
      }
    } else {
      finalizeTranscription()
    }
  }, [voiceState, finalizeTranscription])

  const startListening = useCallback(async () => {
    cleanupHardware()
    setErrorMessage("")
    setTranscript("")
    webSpeechFailedRef.current = false
    webSpeechFinalTranscriptRef.current = ""
    audioChunksRef.current = []

    try {
      // 1. Request microphone access
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

      // 2. Setup Web Audio API for live visualizer
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
        }
      } catch (e) {
        console.warn("[useVoiceInput] AudioContext visualizer init failed, using simulated visualizer:", e)
      }

      // 3. Setup MediaRecorder to capture audio for Whisper
      let mimeType = ""
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus"
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm"
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4"
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg"
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        finalizeTranscription()
      }

      recorder.start(100) // Collect 100ms chunks
      setVoiceState("listening")

      // 4. In parallel: Start WebSpeech for live interim preview IF available
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass()
          recognition.continuous = false
          recognition.interimResults = true
          recognition.lang = "en-IN"
          recognition.maxAlternatives = 1

          let finalAcc = ""

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

            if (newFinal) {
              finalAcc = (finalAcc + " " + newFinal).trim()
            }

            const current = (finalAcc + " " + interim).trim()
            if (current) {
              webSpeechFinalTranscriptRef.current = current
              setTranscript(current)
            }
          }

          recognition.onerror = (event: any) => {
            // Note: If WebSpeech fires 'network' error (e.g. Brave browser blocking Google speech servers),
            // we intentionally DO NOT crash or stop recording!
            // We flag it so that finalizeTranscription() will seamlessly use Groq Whisper instead!
            console.warn("[useVoiceInput] WebSpeech interim preview warning:", event.error)
            webSpeechFailedRef.current = true

            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
              setErrorMessage("Microphone access denied. Please allow microphone permission.")
              setVoiceState("error")
              cleanupHardware()
              optionsRef.current?.onError?.("Microphone access denied.")
            }
          }

          recognition.onend = () => {
            // WebSpeech ended (e.g. user paused talking).
            // If still in listening mode, we can finalize cleanly
            if (recorder.state === "recording") {
              try {
                recorder.stop()
              } catch {
                finalizeTranscription()
              }
            }
          }

          recognitionRef.current = recognition
          recognition.start()
        } catch (e) {
          console.warn("[useVoiceInput] WebSpeech start failed, continuing with Whisper recorder:", e)
          webSpeechFailedRef.current = true
        }
      } else {
        webSpeechFailedRef.current = true
      }

      // Safety timeout: 15 seconds max listening
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          stopListening()
        }
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
  }, [cleanupHardware, stopListening, finalizeTranscription])

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
