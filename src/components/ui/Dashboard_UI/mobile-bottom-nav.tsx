// src/components/ui/Dashboard_UI/mobile-bottom-nav.tsx
"use client"

import React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  IconDashboard,
  IconWallet,
  IconMicrophone,
  IconRobot,
  IconFlame,
} from "@tabler/icons-react"
import { Users } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useAppMode } from "@/context/AppModeContext"

export function MobileBottomNav() {
  const location = useLocation()
  const { t } = useLanguage()
  const { appMode } = useAppMode()

  const isBusiness = appMode === "BUSINESS"
  const currentPath = location.pathname

  // Don't show on voice-capture full page or AI full page if requested
  if (currentPath === "/dashboard/voice-capture") {
    return null
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F15]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-3 py-1.5 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Dashboard */}
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors ${
            currentPath === "/dashboard"
              ? "text-slate-900 dark:text-white font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <IconDashboard className="size-5" />
          <span className="text-[10px] leading-tight">Home</span>
        </Link>

        {/* 2. Khata / Udhaar */}
        <Link
          to={isBusiness ? "/dashboard/khata" : "/dashboard/budget"}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors ${
            currentPath.includes("/khata") || currentPath.includes("/budget")
              ? "text-slate-900 dark:text-white font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="size-5" />
          <span className="text-[10px] leading-tight">{isBusiness ? "Khata" : "Budget"}</span>
        </Link>

        {/* 3. HERO VOICE MIC (Center Elevated) */}
        <div className="relative -top-5 flex flex-col items-center">
          <Link
            to="/dashboard/voice-capture"
            className="group relative flex size-13 items-center justify-center rounded-full bg-[#D2F832] text-black shadow-lg shadow-[#D2F832]/30 hover:scale-105 active:scale-95 transition-all"
            title="Speak Transaction"
            aria-label="Speak Transaction"
          >
            {/* Animated subtle halo */}
            <span className="absolute inset-0 rounded-full bg-[#D2F832]/30 animate-ping pointer-events-none" />
            <IconMicrophone className="size-6 stroke-[2.2] relative z-10 text-black" />
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0B0F15]" />
          </Link>
          <span className="text-[10px] font-bold text-slate-800 dark:text-[#D2F832] mt-1">Bolkar Likhein</span>
        </div>

        {/* 4. Transactions */}
        <Link
          to="/dashboard/transactions"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors ${
            currentPath.includes("/transactions")
              ? "text-slate-900 dark:text-white font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <IconWallet className="size-5" />
          <span className="text-[10px] leading-tight">History</span>
        </Link>

        {/* 5. Munim / AI Assistant */}
        <Link
          to="/dashboard/ai-assistant"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors ${
            currentPath.includes("/ai-assistant")
              ? "text-slate-900 dark:text-white font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <IconRobot className="size-5" />
          <span className="text-[10px] leading-tight">Munim AI</span>
        </Link>
      </div>
    </nav>
  )
}
