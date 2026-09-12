// src/components/hooks/use-voice-input.ts
import { useState, useRef, useCallback, useEffect } from "react"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export type VoiceState = "idle" | "listening" | "processing" | "error"

export function useVoiceInput() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [transcript, setTranscript] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
    }
    analyserRef.current = null
  }, [])

  const startListening = useCallback(async () => {
    cleanup()
    setErrorMessage("")
    setTranscript("")
    setVoiceState("listening")

    try {
      // 1. Audio setup
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext
      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      // Smoothing time constant gives built-in smoothing to frequency data
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // 2. Speech Recognition setup
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionClass) {
        throw new Error("Speech recognition is not supported in this browser.")
      }

      const recognition = new SpeechRecognitionClass()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "hi-IN" // Handles both Hindi and English seamlessly

      let finalTranscriptAcc = ""

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let newFinalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const segment = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            newFinalTranscript += segment
          } else {
            interimTranscript += segment
          }
        }

        if (newFinalTranscript) {
          finalTranscriptAcc += " " + newFinalTranscript.trim()
        }

        const currentText = (finalTranscriptAcc + " " + interimTranscript).trim()
        setTranscript(currentText)
      }

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access denied.")
          setVoiceState("error")
          cleanup()
        } else if (event.error !== "aborted") {
          console.error("Speech recognition error:", event.error)
        }
      }

      recognition.onend = () => {
        setVoiceState((prev) => {
          if (prev === "listening") {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop())
            }
            return "processing"
          }
          return prev
        })
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || "Could not start microphone")
      setVoiceState("error")
      cleanup()
    }
  }, [cleanup])

  const stopListening = useCallback(() => {
    if (voiceState === "listening") {
      setVoiceState("processing")
      if (recognitionRef.current) {
        recognitionRef.current.stop() 
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [voiceState])

  const reset = useCallback(() => {
    cleanup()
    setVoiceState("idle")
    setTranscript("")
    setErrorMessage("")
  }, [cleanup])

  useEffect(() => {
    return cleanup
  }, [cleanup])

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
