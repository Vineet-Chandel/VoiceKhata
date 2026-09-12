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
  const hasResultRef = useRef(false)
  // Track the current language to allow fallback
  const langRef = useRef("hi-IN")
  // Safety timeout to prevent infinite listening
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    analyserRef.current = null
  }, [])

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null
    }
    cleanupStream()
  }, [cleanupStream])

  const startListening = useCallback(async () => {
    cleanup()
    setErrorMessage("")
    setTranscript("")
    hasResultRef.current = false
    setVoiceState("listening")

    try {
      // 1. Audio setup for waveform visualization
      if (!navigator.mediaDevices) {
        throw new Error("Microphone API not available. Ensure you are using HTTPS or localhost.")
      }
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
      // Use continuous=false so recognition stops cleanly after a pause
      // This prevents the engine from auto-restarting and causing phantom loops
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = langRef.current // Uses fallback if hi-IN failed
      recognition.maxAlternatives = 1

      let finalTranscriptAcc = ""

      recognition.onresult = (event: any) => {
        hasResultRef.current = true
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
        console.warn("Speech recognition error:", event.error)

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErrorMessage("Microphone access denied. Please allow microphone permission.")
          setVoiceState("error")
          cleanup()
        } else if (event.error === "no-speech") {
          // No speech detected — gracefully go to processing so the UI resets
          // onend will fire after this and handle the state transition
        } else if (event.error === "network") {
          if (langRef.current === "hi-IN") {
            console.warn("Network error with hi-IN, falling back to en-IN")
            langRef.current = "en-IN"
            setErrorMessage("Hindi voice not supported by your device. Switched to English fallback. Please click mic and try again.")
          } else {
            setErrorMessage("Network error. Speech recognition requires an internet connection.")
          }
          setVoiceState("error")
          cleanup()
        } else if (event.error !== "aborted") {
          // For any other unrecognized error, log but don't crash
          console.error("Unexpected speech error:", event.error)
        }
      }

      recognition.onend = () => {
        // Clear safety timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        // Clean up audio stream
        cleanupStream()

        setVoiceState((prev) => {
          if (prev === "listening") {
            return "processing"
          }
          return prev
        })
      }

      recognitionRef.current = recognition
      recognition.start()

      // Safety timeout: if recognition hasn't ended after 15 seconds, force stop
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop()
          } catch (e) {
            // If stop fails, force cleanup
            cleanup()
            setVoiceState("processing")
          }
        }
      }, 15000)

    } catch (err: any) {
      console.error("Voice input start error:", err)
      setErrorMessage(err.message || "Could not start microphone")
      setVoiceState("error")
      cleanup()
    }
  }, [cleanup, cleanupStream])

  const stopListening = useCallback(() => {
    if (voiceState === "listening") {
      setVoiceState("processing")
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // ignore
        }
      }
      cleanupStream()
    }
  }, [voiceState, cleanupStream])

  const reset = useCallback(() => {
    cleanup()
    setVoiceState("idle")
    setTranscript("")
    setErrorMessage("")
    hasResultRef.current = false
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
