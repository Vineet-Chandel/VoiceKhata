"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { IconChevronLeft, IconChevronRight, IconAlertTriangle, IconRefresh } from "@tabler/icons-react"
import { useAISuggestions } from "@/components/hooks/use-ai-suggestions"
import type { Transaction } from "@/components/hooks/use-transactions"
import type { Budget } from "@/components/hooks/use-budgets"
import type { FinancialMetrics } from "@/lib/financial-metrics"   // ← new

interface Props {
  transactions: Transaction[]
  budgets:      Budget[]
  metrics:      FinancialMetrics   // ← new
  dataLoading:  boolean
}

const SLIDE_INTERVAL = 4000

export function AISuggestions({ transactions, budgets, metrics, dataLoading }: Props) {
  // metrics now forwarded into the hook  ← only logic change
  const { suggestions, loading, refresh } = useAISuggestions(transactions, budgets, metrics, dataLoading)
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const [visible, setVisible] = useState(true)

  const suggestionsRef = useRef(suggestions)
  useEffect(() => { suggestionsRef.current = suggestions }, [suggestions])

  const prev = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setCurrent((c) => (c - 1 + suggestionsRef.current.length) % suggestionsRef.current.length)
      setVisible(true)
    }, 180)
  }, [])

  const nextSlide = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setCurrent((c) => (c + 1) % suggestionsRef.current.length)
      setVisible(true)
    }, 180)
  }, [])

  useEffect(() => {
    if (paused || suggestionsRef.current.length <= 1) return
    const timer = setInterval(nextSlide, SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [paused, nextSlide])

  useEffect(() => {
    if (suggestions.length > 0) setCurrent(0)
  }, [suggestions.length])

  // ── Loading state ──
  if (dataLoading || loading) {
    return (
      <div className="mx-4 lg:mx-6 rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h3 className="font-semibold text-foreground text-base leading-none">Smart Suggestions</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Personalised tips based on your spending</p>
          </div>
          <div className="flex items-center gap-1.5 border border-border/60 rounded-full px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
            <span className="text-xs font-medium text-foreground/70">Generating</span>
          </div>
        </div>
        <div className="px-6 pb-5 space-y-2.5">
          <div className="h-2 w-3/5 rounded-full bg-muted-foreground/15 animate-pulse" />
          <div className="h-2 w-2/5 rounded-full bg-muted-foreground/10 animate-pulse" />
        </div>
        <div className="h-0.5 w-full bg-muted/40" />
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div
      className="mx-4 lg:mx-6 rounded-xl border bg-card shadow-sm overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div>
          <h3 className="font-semibold text-foreground text-base leading-none">Smart Suggestions</h3>
          <p className="text-sm text-muted-foreground mt-1.5">Personalised tips based on your spending</p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs tabular-nums text-muted-foreground/50">
            {current + 1} / {suggestions.length}
          </span>

          <div className="flex items-center gap-1.5 border border-border/60 rounded-full px-2.5 py-1">
            <span
              className="size-1.5 rounded-full bg-emerald-400 inline-block"
              style={{ animation: "livepulse 1.8s ease-in-out infinite" }}
            />
            <span className="text-xs font-medium text-foreground/70">Live</span>
          </div>

          <button
            onClick={() => { setCurrent(0); refresh() }}
            title="Generate new suggestions"
            className="flex items-center gap-1.5 border border-border/60 rounded-full px-2.5 py-1 hover:bg-muted transition-colors cursor-pointer group"
          >
            <IconRefresh className="size-3 text-muted-foreground group-hover:text-foreground transition-all group-hover:rotate-180 duration-300" />
            <span className="text-xs font-medium text-foreground/70">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Tip body ── */}
      <div className="flex items-center gap-3 px-4 pb-4">
        <button
          onClick={prev}
          aria-label="Previous suggestion"
          className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer shrink-0"
        >
          <IconChevronLeft className="size-4 text-muted-foreground" />
        </button>

        <p
          className="flex-1 text-sm text-foreground/90 text-center leading-relaxed px-2 transition-all duration-200"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(4px)" }}
        >
          {suggestions[current]}
        </p>

        <button
          onClick={nextSlide}
          aria-label="Next suggestion"
          className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer shrink-0"
        >
          <IconChevronRight className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex justify-center gap-1.5 pb-4">
        {suggestions.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setVisible(false)
              setTimeout(() => { setCurrent(i); setVisible(true) }, 180)
            }}
            aria-label={`Go to suggestion ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
              i === current ? "bg-primary w-4" : "bg-muted-foreground/25 w-1"
            }`}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="h-0.5 w-full bg-muted/40 overflow-hidden">
        {!paused && suggestions.length > 1 && (
          <div
            key={`${current}-${paused}`}
            className="h-full bg-primary/50 rounded-full"
            style={{ animation: `progress ${SLIDE_INTERVAL}ms linear forwards` }}
          />
        )}
      </div>

      {/* ── Warning footer ── */}
      <div className="flex items-center justify-between px-6 py-2.5 border-t border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="size-3 text-muted-foreground/60 shrink-0" />
          <span className="text-xs text-muted-foreground/60">
            AI-generated suggestions — not financial advice.
          </span>
        </div>
        <Link
          to="ai-assistant"
          className="flex items-center gap-1 text-xs font-medium text-primary/70 hover:text-primary transition-colors group"
        >
          <span>Chat with AI</span>
          <IconChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0% }
          to   { width: 100% }
        }
        @keyframes livepulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}