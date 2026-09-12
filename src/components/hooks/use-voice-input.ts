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
  const vadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasSpokenRef = useRef(false)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const cleanupHardware = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current)
      vadIntervalRef.current = null
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
    hasSpokenRef.current = false
    audioChunksRef.current = []
  }, [cleanupHardware])

  // Internal: Finalize transcription using Groq Whisper as PRIMARY engine
  const finalizeTranscription = useCallback(async () => {
    setVoiceState("processing")

    let resultText = ""
    const chunks = audioChunksRef.current

    // 1. ALWAYS prioritize Groq Whisper AI (whisper-large-v3-turbo) for highest accuracy
    if (chunks.length > 0) {
      try {
        const mimeType = mediaRecorderRef.current?.mimeType || chunks[0]?.type || "audio/webm"
        const audioBlob = new Blob(chunks, { type: mimeType })

        if (audioBlob.size > 800) {
          console.log("[useVoiceInput] Transcribing with Groq Whisper AI (size:", audioBlob.size, "bytes)...")
          const whisperText = await transcribeAudioBlob(audioBlob)
          if (whisperText && whisperText.trim()) {
            resultText = whisperText.trim()
            console.log("[useVoiceInput] Groq Whisper result:", resultText)
          }
        }
      } catch (err: any) {
        console.warn("[useVoiceInput] Groq Whisper transcription error, falling back to WebSpeech:", err)
      }
    }

    // 2. Fallback to WebSpeech only if Whisper returned no text
    if (!resultText) {
      resultText = webSpeechFinalTranscriptRef.current.trim()
      if (resultText) {
        console.log("[useVoiceInput] Fallback WebSpeech result:", resultText)
      }
    }

    cleanupHardware()

    if (resultText) {
      setTranscript(resultText)
      setVoiceState("idle")
      optionsRef.current?.onTranscript?.(resultText)
    } else {
      setVoiceState("idle")
    }
  }, [cleanupHardware])

  const stopListening = useCallback(() => {
    // Clear silence and VAD timers immediately
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current)
      vadIntervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setVoiceState("processing")

    // Stop WebSpeech if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }

    // Stop MediaRecorder — this triggers recorder.onstop -> finalizeTranscription
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        finalizeTranscription()
      }
    } else {
      finalizeTranscription()
    }
  }, [finalizeTranscription])

  const startListening = useCallback(async () => {
    cleanupHardware()
    setErrorMessage("")
    setTranscript("")
    webSpeechFailedRef.current = false
    webSpeechFinalTranscriptRef.current = ""
    hasSpokenRef.current = false
    audioChunksRef.current = []

    try {
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

      // Setup Web Audio API for visualizer and VAD silence detection
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          const ctx = new AudioCtx()
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 128
          const source = ctx.createMediaStreamSource(stream)
          source.connect(analyser)
          audioContextRef.current = ctx
          analyserRef.current = analyser

          // VAD Silence Detection: checks audio volume every 120ms
          const bufferLength = analyser.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)

          vadIntervalRef.current = setInterval(() => {
            if (!analyserRef.current) return
            analyserRef.current.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i]
            }
            const avgVolume = sum / bufferLength

            // Volume threshold: user is speaking
            if (avgVolume > 14) {
              hasSpokenRef.current = true
              // Reset silence timer because user is actively speaking
              if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current)
                silenceTimeoutRef.current = null
              }
            } else if (hasSpokenRef.current) {
              // User has spoken at least once, and has now paused
              if (!silenceTimeoutRef.current) {
                silenceTimeoutRef.current = setTimeout(() => {
                  console.log("[useVoiceInput] 1.8s of silence detected after speech, auto-completing...")
                  stopListening()
                }, 1800)
              }
            }
          }, 120)
        }
      } catch (e) {
        console.warn("[useVoiceInput] AudioContext visualizer/VAD init error:", e)
      }

      // Setup MediaRecorder to capture clean audio for Groq Whisper
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

      recorder.start(150) // Collect 150ms chunks
      setVoiceState("listening")

      // WebSpeech API for live visual preview while speaking
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass()
          // Continuous=true ensures the browser doesn't cut off after 1 word!
          recognition.continuous = true
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
            // WebSpeech ended internally; do NOT kill MediaRecorder!
            // Let VAD silence detection or manual Done button handle completion
            console.log("[useVoiceInput] WebSpeech cycle ended; audio recording continues via MediaRecorder.")
          }

          recognitionRef.current = recognition
          recognition.start()
        } catch (e) {
          console.warn("[useVoiceInput] WebSpeech start error, recording via Whisper:", e)
          webSpeechFailedRef.current = true
        }
      } else {
        webSpeechFailedRef.current = true
      }

      // Safety cap: 25 seconds max recording
      timeoutRef.current = setTimeout(() => {
        stopListening()
      }, 25000)

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
