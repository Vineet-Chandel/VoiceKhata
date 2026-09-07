// src/components/ui/AIAssistant_UI/voice-waveform.tsx
import React, { useRef, useEffect } from "react"

interface VoiceWaveformProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  isListening: boolean
  /** Bar color — defaults to white for dark backgrounds */
  color?: string
}

export function VoiceWaveform({ analyserRef, isListening, color = "rgba(255, 255, 255, 1)" }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    
    let currentVolume = 0
    const maxDataPoints = 150 
    const volumeHistory: number[] = new Array(maxDataPoints).fill(0)

    const render = (time: number) => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
      }

      let barData: number[] = new Array(12).fill(0)
      const numBars = 12
      
      if (isListening && analyserRef.current) {
        const analyser = analyserRef.current
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        
        // Use bins 2 through 38 (skip 0 and 1 which have mic rumble/DC offset)
        const binsPerBar = 3
        
        for (let i = 0; i < numBars; i++) {
          let sum = 0
          for (let j = 0; j < binsPerBar; j++) {
            sum += dataArray[2 + i * binsPerBar + j]
          }
          let avg = sum / binsPerBar
          let val = avg / 255.0
          
          // Noise gate: ignore very quiet ambient noise
          if (val < 0.05) val = 0
          
          // Boost higher frequencies to balance the visualizer (since audio energy drops off at high freq)
          const eqBoost = 1.5 + (i * 0.2) 
          val = val * eqBoost
          
          barData[i] = Math.min(1.0, val)
        }
      }

      ctx.clearRect(0, 0, width, height)

      const barWidth = 3
      const gap = 4
      const totalWidth = numBars * barWidth + (numBars - 1) * gap
      const startX = (width - totalWidth) / 2
      const centerY = height / 2

      ctx.fillStyle = color

      for (let i = 0; i < numBars; i++) {
        // Apply a pill-shaped window envelope: taller in the middle, shorter on the edges
        const normalizedPosition = i / (numBars - 1) // 0.0 to 1.0
        const envelope = 0.3 + 0.7 * Math.sin(normalizedPosition * Math.PI)
        
        // Target volume with the envelope applied
        const targetVol = barData[i] * envelope
        
        const currentVol = volumeHistory[i] || 0
        let newVol = currentVol
        
        // Smooth interpolation
        if (targetVol > currentVol) {
           newVol += (targetVol - currentVol) * 0.4
        } else {
           newVol += (targetVol - currentVol) * 0.1
        }
        
        // Idle animation: breathes gently, also constrained by the envelope
        const idleWave = (Math.sin((time * 0.003) + (i * 0.5)) * 0.05 + 0.1) * envelope
        const finalVol = Math.max(idleWave, newVol)
        volumeHistory[i] = finalVol

        const barHeight = Math.max(4, finalVol * height * 0.9) // min 4px tall
        
        const x = startX + i * (barWidth + gap)
        const y = centerY - barHeight / 2

        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [analyserRef, isListening])

  return (
    <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
        style={{ touchAction: "none" }}
      />
    </div>
  )
}
