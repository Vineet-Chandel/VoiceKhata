// src/components/Pages/VoiceCapturePage.tsx
"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { VoiceCaptureCard } from "@/components/ui/Dashboard_UI/voice-capture-card"

export default function VoiceCapturePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 py-4 px-4 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Header matching prototype */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
          VOICEKHATA WORKSPACE
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Voice capture
        </h1>
        <p className="text-sm text-muted-foreground">
          Say what happened. Review it. Save with confidence.
        </p>
      </div>

      {/* Voice Capture Hero Card */}
      <VoiceCaptureCard onBack={() => navigate("/dashboard")} showBackLink={true} />
    </div>
  )
}
