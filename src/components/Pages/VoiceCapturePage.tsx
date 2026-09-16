// src/components/Pages/VoiceCapturePage.tsx
"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { VoiceCaptureCard } from "@/components/ui/Dashboard_UI/voice-capture-card"
import { useLanguage } from "@/context/LanguageContext"

export default function VoiceCapturePage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-6 py-4 px-4 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="size-2 rounded-full bg-[#D2F832]" />
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-700 dark:text-[#D2F832]">
            {t("home.addTransaction")} • Voice Ledger
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t("home.speakReviewSave")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          {t("voice.pageSubtitle")}
        </p>
      </div>

      {/* Voice Capture Hero Card */}
      <VoiceCaptureCard onBack={() => navigate("/dashboard")} showBackLink={true} />
    </div>
  )
}
