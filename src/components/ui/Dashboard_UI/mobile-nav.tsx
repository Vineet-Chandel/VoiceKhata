// src/components/ui/Dashboard_UI/mobile-nav.tsx
"use client"

import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  Flame, 
  Mic, 
  X 
} from "lucide-react"
import { useTransactions } from "@/components/hooks/use-transactions"
import { VoiceActionBanner } from "@/components/ui/Dashboard_UI/voice-action-banner"

export function MobileNav() {
  const location = useLocation()
  const { addTransaction, deleteTransaction } = useTransactions()
  const [showVoiceSheet, setShowVoiceSheet] = useState(false)

  const navItems = [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { label: "Khata", path: "/dashboard/khata", icon: Users },
    { label: "Transactions", path: "/dashboard/transactions", icon: ArrowLeftRight },
    { label: "Growth", path: "/dashboard/growth", icon: Flame },
  ]

  return (
    <>
      {/* Voice Bottom Sheet Modal for Mobile */}
      {showVoiceSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs md:hidden">
          <div className="w-full max-w-lg bg-[#131B2E] rounded-t-[18px] sm:rounded-[14px] border border-slate-700/40 p-4 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto text-[#F8FAFC]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
              <span className="text-xs font-bold text-[#F8FAFC] tracking-wide uppercase">
                Quick Voice Entry
              </span>
              <button
                onClick={() => setShowVoiceSheet(false)}
                className="size-8 rounded-full flex items-center justify-center hover:bg-white/10 text-[#94A3B8]"
              >
                <X size={18} />
              </button>
            </div>
            <VoiceActionBanner
              onAddTransaction={async (t) => {
                const res = await addTransaction(t)
                setTimeout(() => setShowVoiceSheet(false), 2500)
                return res
              }}
              onDeleteTransaction={deleteTransaction}
            />
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar (Mobile only) */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-16 bg-[#0E1322] border-t border-slate-800/60 px-2 py-1 shadow-lg md:hidden"
      >
        {/* First 2 items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path))
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
                isActive ? "text-blue-400 font-semibold" : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              <Icon size={19} className={isActive ? "text-blue-400" : "text-[#94A3B8]"} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          )
        })}

        {/* Central Voice FAB */}
        <div className="flex items-center justify-center -mt-5 px-1">
          <button
            onClick={() => setShowVoiceSheet(true)}
            aria-label="Record by voice"
            className="flex items-center justify-center size-13 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            <Mic size={22} />
          </button>
        </div>

        {/* Last 2 items */}
        {navItems.slice(2, 4).map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 text-[11px] font-medium transition-colors ${
                isActive ? "text-blue-400 font-semibold" : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              <Icon size={19} className={isActive ? "text-blue-400" : "text-[#94A3B8]"} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
