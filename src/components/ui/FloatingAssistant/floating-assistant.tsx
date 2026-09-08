// src/components/ui/FloatingAssistant/floating-assistant.tsx
"use client"

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Mic, X, ArrowUp, Plus, Square, Check,
  TrendingUp, Wallet, PiggyBank, BarChart3, RefreshCw, Lightbulb, Bot, Minus, ExternalLink
} from "lucide-react"
import { useVoiceInput } from "@/components/hooks/use-voice-input"
import { useChatStore } from "@/components/hooks/use-chat-store"
import { useAIChat, type Message } from "@/components/hooks/use-ai-chat"
import { useTransactions } from "@/components/hooks/use-transactions"
import { useBudgets } from "@/components/hooks/use-budgets"
import { useIsMobile } from "@/components/hooks/use-mobile"
import { useAuth } from "@/components/hooks/use-auth"
import { VoiceWaveform } from "@/components/ui/AIAssistant_UI/voice-waveform"
import { ChatWindow } from "@/components/ui/AIAssistant_UI/chat-window"
import { ChatInput } from "@/components/ui/AIAssistant_UI/chat-input"
import "./floating-assistant.css"

// ─── Floating AI Command Bar & Workspace ───────────────────────────────────────
// A centered, adaptive command bar that expands into a full chat workspace.
// ────────────────────────────────────────────────────────────────────────────────

// ── Page-aware configuration ─────────────────────────────────────────────────
const PAGE_CONFIG: Record<string, {
  placeholder: string
  suggestions: string[]
}> = {
  "/dashboard": {
    placeholder: "Ask about your finances…",
    suggestions: [
      "How is my financial health?",
      "Where am I overspending?",
      "What should I focus on this month?",
    ],
  },
  "/dashboard/transactions": {
    placeholder: "Ask about your transactions…",
    suggestions: [
      "Find unusual transactions",
      "Show my biggest expenses",
      "Explain my spending pattern",
    ],
  },
  "/dashboard/budget": {
    placeholder: "Ask about your budget…",
    suggestions: [
      "Am I on track with my budget?",
      "Where am I overspending?",
      "Help me set a new budget",
    ],
  },
  "/dashboard/autopay": {
    placeholder: "Ask about recurring payments…",
    suggestions: [
      "What payments are coming up?",
      "Show recurring expenses",
      "How much do I spend on subscriptions?",
    ],
  },
  "/dashboard/reports": {
    placeholder: "Ask about your reports…",
    suggestions: [
      "Summarize this month's finances",
      "Compare spending to last month",
      "Show income vs expenses trend",
    ],
  },
  "/dashboard/finvault": {
    placeholder: "Ask about your savings…",
    suggestions: [
      "How much have I saved?",
      "Tips to save more money",
      "Track my savings progress",
    ],
  },
  "/dashboard/growth": {
    placeholder: "Ask about business growth…",
    suggestions: [
      "How can I grow my revenue?",
      "Identify cost reduction areas",
      "What's my growth trajectory?",
    ],
  },
}

const DEFAULT_CONFIG = {
  placeholder: "Ask your financial assistant…",
  suggestions: [
    "How much did I spend this month?",
    "Give me tips to reduce my expenses",
    "What's my biggest expense category?",
  ],
}

// ── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: TrendingUp,  label: "Analyze spending",     prompt: "Analyze my spending patterns this month" },
  { icon: Wallet,      label: "Improve cash flow",    prompt: "How can I improve my cash flow?" },
  { icon: PiggyBank,   label: "Review budget",        prompt: "Am I on track with my budget this month?" },
  { icon: RefreshCw,   label: "Check autopay",        prompt: "Show my upcoming recurring payments" },
  { icon: BarChart3,   label: "Financial insights",   prompt: "Give me key financial insights and recommendations" },
  { icon: Lightbulb,   label: "Smart suggestions",    prompt: "What should I focus on to improve my finances?" },
]

export function FloatingAssistant() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user } = useAuth()

  // ── Don't render on the AI assistant page ──────────────────────────────────
  const isOnAssistantPage = location.pathname === "/dashboard/ai-assistant"

  // ── Page-aware config ──────────────────────────────────────────────────────
  const pageConfig = PAGE_CONFIG[location.pathname] ?? DEFAULT_CONFIG

  // ── Chat store (shared with AIAssistantPage) ───────────────────────────────
  const {
    messages, setMessages,
    pendingDraft, setPendingDraft,
    guidedStep, setGuidedStep,
    languageMode, setLanguageMode,
    assistantMode, setAssistantMode,
    multiState, setMultiState,
  } = useChatStore()

  // ── Financial data ─────────────────────────────────────────────────────────
  const { transactions, addTransaction } = useTransactions()
  const { budgets, addBudget } = useBudgets()

  // ── AI Chat engine ─────────────────────────────────────────────────────────
  const { 
    loading, 
    sendMessage, 
    startGuidedFlow, 
    startBudgetFlow, 
    cancelGuidedFlow,
    confirmMultiTransactions,
    cancelMultiTransactions
  } = useAIChat({
    transactions,
    budgets,
    onAddTransaction: addTransaction,
    onAddBudget: addBudget,
    messages,
    setMessages,
    pendingDraft: pendingDraft as never,
    setPendingDraft: setPendingDraft as never,
    guidedStep,
    setGuidedStep,
    languageMode,
    setLanguageMode,
    assistantMode,
    setAssistantMode,
    multiState,
    setMultiState,
  })

  // ── Voice input ────────────────────────────────────────────────────────────
  const {
    voiceState,
    transcript,
    errorMessage,
    startListening,
    stopListening,
    reset: resetVoice,
    analyserRef,
  } = useVoiceInput()

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [inputValue, setInputValue] = React.useState("")
  const [isCompact, setIsCompact] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [menuClosing, setMenuClosing] = React.useState(false)
  const [showSuggestions, setShowSuggestions] = React.useState(true)
  const [micError, setMicError] = React.useState("")
  const [isExpandedWorkspace, setIsExpandedWorkspace] = React.useState(false)
  const [replyingTo, setReplyingTo] = React.useState<Message | null>(null)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const barRef = React.useRef<HTMLDivElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const isListening = voiceState === "listening"
  const isProcessing = voiceState === "processing"
  
  // We consider it active if the workspace is open, or if standard interactions are happening
  const isActive = isListening || isProcessing || loading || isFocused || menuOpen || isExpandedWorkspace
  const canSend = inputValue.trim().length > 0 && !loading

  // ── Handle voice transcript completion ─────────────────────────────────────
  React.useEffect(() => {
    if (voiceState === "processing" && transcript) {
      if (isExpandedWorkspace) {
        // If workspace is open, we can just send it or let the user review
        // For now, let's just send it if it's voice
        sendMessage(transcript)
        resetVoice()
      } else {
        setInputValue((prev) => (prev ? prev + " " + transcript : transcript))
        resetVoice()
      }
    } else if (voiceState === "error" && errorMessage) {
      setMicError(errorMessage)
      resetVoice()
      setTimeout(() => setMicError(""), 4000)
    }
  }, [voiceState, transcript, errorMessage, resetVoice, isExpandedWorkspace, sendMessage])

  // ── Scroll-aware shrink ────────────────────────────────────────────────────
  React.useEffect(() => {
    if (isOnAssistantPage || isExpandedWorkspace) return

    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        // Don't shrink if user is actively interacting
        if (!isActive && !isExpandedWorkspace) {
          setIsCompact(true)
          setShowSuggestions(false)
        }

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = setTimeout(() => {
          // After scroll stops, remain compact (user can hover/tap to expand)
        }, 300)

        ticking = false
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    const mainEl = document.querySelector("main[data-slot='sidebar-inset']")
    if (mainEl) {
      mainEl.addEventListener("scroll", onScroll, { passive: true } as EventListenerOptions)
    }

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (mainEl) {
        mainEl.removeEventListener("scroll", onScroll)
      }
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [isOnAssistantPage, isActive, isExpandedWorkspace])

  // ── Close menu on outside click ────────────────────────────────────────────
  React.useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        barRef.current && !barRef.current.contains(e.target as Node)
      ) {
        closeMenu()
      }
    }
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 50)
    return () => {
      clearTimeout(id)
      document.removeEventListener("mousedown", handler)
    }
  }, [menuOpen])

  // ── Close menu on Escape ───────────────────────────────────────────────────
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuOpen) closeMenu()
        if (isFocused) inputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [menuOpen, isFocused])

  // Auto-expand workspace if there are messages and user interacts
  React.useEffect(() => {
    if (messages.length > 0 && isFocused && !isExpandedWorkspace) {
      setIsExpandedWorkspace(true)
    }
  }, [messages.length, isFocused, isExpandedWorkspace])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const expand = React.useCallback(() => {
    setIsCompact(false)
    setShowSuggestions(true)
  }, [])

  const openWorkspace = () => {
    setIsExpandedWorkspace(true)
    setIsCompact(false)
    setShowSuggestions(false)
  }

  const minimizeWorkspace = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFocused(false)
    setIsExpandedWorkspace(false)
  }

  const navigateToFull = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFocused(false)
    setIsExpandedWorkspace(false)
    navigate("/dashboard/ai-assistant")
  }

  const closeMenu = () => {
    setMenuClosing(true)
    setTimeout(() => {
      setMenuOpen(false)
      setMenuClosing(false)
    }, 150)
  }

  const handleSend = () => {
    const msg = inputValue.trim()
    if (!msg || loading) return
    sendMessage(msg)
    setInputValue("")
    setShowSuggestions(false)
    if (!isExpandedWorkspace) openWorkspace()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMicClick = () => {
    setMicError("")
    if (isListening) {
      stopListening()
    } else {
      startListening()
      if (!isExpandedWorkspace) expand()
    }
  }

  const handleSuggestionClick = (text: string) => {
    sendMessage(text)
    setShowSuggestions(false)
    if (!isExpandedWorkspace) openWorkspace()
  }

  const handleQuickAction = (prompt: string) => {
    closeMenu()
    sendMessage(prompt)
    setShowSuggestions(false)
    if (!isExpandedWorkspace) openWorkspace()
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (messages.length > 0) {
      openWorkspace()
    } else {
      expand()
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleMouseEnter = () => {
    if (isMobile) return
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    expand()
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    if (isActive) return // Don't shrink while active
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isActive) setIsCompact(true)
    }, 800)
  }

  const handleBarTap = () => {
    if (isMobile && isCompact) {
      expand()
      setTimeout(() => inputRef.current?.focus(), 100)
    } else if (messages.length > 0 && !isExpandedWorkspace) {
      openWorkspace()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isOnAssistantPage) return null

  const userAvatar = user?.photoURL ?? null
  const userInitials = (user?.displayName ?? user?.email ?? "U")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <>
      <div
        className={`fixed z-40 transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] animate-in fade-in slide-in-from-bottom-4`}
        style={{
          bottom: isExpandedWorkspace 
            ? isMobile ? "0px" : "24px"
            : isMobile ? "80px" : "24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: isExpandedWorkspace
            ? isMobile ? "100vw" : "min(65vw, 1100px)"
            : isMobile ? "calc(100vw - 24px)" : (!isCompact || isActive ? "480px" : "280px"),
          maxWidth: isExpandedWorkspace
            ? undefined
            : isMobile ? "520px" : undefined,
          height: isExpandedWorkspace
            ? isMobile ? "100dvh" : "min(75vh, 760px)"
            : "auto",
        }}
      >
        <div
          ref={barRef}
          onClick={!isExpandedWorkspace ? handleBarTap : undefined}
          onMouseEnter={!isExpandedWorkspace ? handleMouseEnter : undefined}
          onMouseLeave={!isExpandedWorkspace ? handleMouseLeave : undefined}
          className={`
            relative bg-white shadow-xl border border-black/[0.06] overflow-hidden flex flex-col w-full h-full mx-auto
            transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]
            ${isExpandedWorkspace && isMobile ? "rounded-none" : "rounded-2xl"}
          `}
          style={
            !isExpandedWorkspace && isCompact && !isActive
              ? { boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }
              : { boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)" }
          }
        >
          {isExpandedWorkspace ? (
            /* ── Expanded Workspace UI ──────────────────────────────────── */
            <>
              {/* Floating Controls */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-sm rounded-full p-1">
                <button
                  onClick={navigateToFull}
                  className="size-8 rounded-full flex items-center justify-center hover:bg-black/[0.06] text-black/50 hover:text-black/80 transition-colors cursor-pointer"
                  title="Open full assistant"
                >
                  <ExternalLink size={14} />
                </button>
                <div className="w-px h-4 bg-black/[0.08]" />
                <button
                  onClick={minimizeWorkspace}
                  className="size-8 rounded-full flex items-center justify-center hover:bg-black/[0.06] text-black/50 hover:text-black/80 transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <Minus size={14} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex flex-col flex-1 overflow-hidden bg-white">
                <ChatWindow
                  messages={messages}
                  loading={loading}
                  userAvatar={userAvatar}
                  userInitials={userInitials}
                  onSend={(msg) => {
                    sendMessage(msg, replyingTo ? { id: replyingTo.id, role: replyingTo.role, content: replyingTo.content } : undefined)
                    setReplyingTo(null)
                  }}
                  onReply={(msg) => setReplyingTo(msg)}
                  onConfirmAll={confirmMultiTransactions}
                  onCancel={cancelMultiTransactions}
                  variant="light"
                />
              </div>

              {/* Input */}
              <div className="px-4 py-3 bg-white border-t border-black/[0.06] shrink-0">
                <ChatInput
                  onSend={(msg) => {
                    sendMessage(msg, replyingTo ? { id: replyingTo.id, role: replyingTo.role, content: replyingTo.content } : undefined)
                    setReplyingTo(null)
                  }}
                  loading={loading}
                  guidedStep={guidedStep}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  onStartGuided={startGuidedFlow}
                  onStartBudgetGuided={() => startBudgetFlow()}
                  onCancelGuided={cancelGuidedFlow}
                  variant="light"
                />
              </div>
            </>
          ) : (
            /* ── Compact / Normal Command Bar UI ────────────────────────── */
            <>
              {/* Listening pulse ring */}
              {isListening && (
                <span className="absolute inset-0 border-2 border-violet-400/30 listening-pulse-ring pointer-events-none" />
              )}

              <div className={`flex items-center transition-all duration-[250ms] ${isCompact && !isActive ? "px-3 py-2" : "px-3 py-2.5"}`}>
                {isListening ? (
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={() => { stopListening(); setTimeout(resetVoice, 50) }}
                      className="size-8 rounded-xl bg-black/[0.04] flex items-center justify-center text-black/40 hover:text-black/70 hover:bg-black/[0.08] transition-all cursor-pointer shrink-0"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex-1 h-8 flex items-center justify-center overflow-hidden">
                      <VoiceWaveform analyserRef={analyserRef} isListening={true} color="rgba(0, 0, 0, 0.6)" />
                    </div>
                    <button
                      onClick={stopListening}
                      className="size-8 rounded-xl bg-black flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer shrink-0"
                    >
                      <Check size={15} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (menuOpen) closeMenu()
                        else { setMenuOpen(true); expand() }
                      }}
                      disabled={loading}
                      className={`size-7 shrink-0 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${menuOpen ? "bg-black/[0.08] text-black/80" : "bg-black/[0.06] text-black/60 hover:bg-black/[0.08] hover:text-black/80"} disabled:opacity-30`}
                    >
                      <Plus size={14} className={`transition-transform duration-200 ${menuOpen ? "rotate-45" : ""}`} />
                    </button>

                    <input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={loading ? "Thinking…" : isCompact && !isActive ? "Ask AI…" : pageConfig.placeholder}
                      disabled={isProcessing}
                      className={`flex-1 bg-transparent text-[13px] text-black/80 placeholder:text-black/50 focus:outline-none disabled:opacity-40 transition-all duration-200 min-w-0 ${isCompact && !isActive ? "text-[12px]" : ""}`}
                    />

                    <button
                      onClick={(e) => { e.stopPropagation(); handleMicClick() }}
                      disabled={loading || isProcessing}
                      className={`size-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${isListening ? "bg-violet-500 text-white" : "bg-black/[0.06] text-black/60 hover:bg-black/[0.08] hover:text-black/80"} disabled:opacity-30 active:scale-90`}
                    >
                      {isProcessing ? (
                        <svg className="size-3.5 cmdbar-spinner" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" /></svg>
                      ) : (
                        <Mic size={15} />
                      )}
                    </button>

                    {canSend && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSend() }}
                        className="size-8 shrink-0 rounded-xl flex items-center justify-center bg-black text-white hover:bg-black/80 transition-all duration-150 cursor-pointer active:scale-90"
                      >
                        {loading ? (
                          <svg className="size-3.5 cmdbar-spinner" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" /></svg>
                        ) : (
                          <ArrowUp size={14} />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Extracted Suggestions & Menus (Only in compact bar mode) ── */}
        {!isExpandedWorkspace && showSuggestions && !isCompact && !loading && !isListening && messages.length === 0 && (
          <div className="absolute bottom-full left-0 right-0 flex flex-wrap justify-center gap-1.5 mb-2.5 px-2 pointer-events-none">
            {pageConfig.suggestions.map((text) => (
              <button
                key={text}
                onClick={(e) => { e.stopPropagation(); handleSuggestionClick(text) }}
                className="suggest-enter pointer-events-auto px-3 py-1.5 rounded-full text-[11px] bg-white text-black/70 border border-black/10 hover:bg-black/5 hover:text-black/90 transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {!isExpandedWorkspace && (menuOpen || menuClosing) && (
          <div
            ref={menuRef}
            className={`absolute bottom-[calc(100%+8px)] left-4 ${menuClosing ? "menu-exit" : "menu-enter"}`}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-black/[0.06] p-1.5 w-[220px]">
              {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={(e) => { e.stopPropagation(); handleQuickAction(prompt) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/[0.04] transition-colors text-left cursor-pointer group"
                >
                  <div className="size-7 rounded-lg bg-black/[0.04] flex items-center justify-center shrink-0 group-hover:bg-black/[0.07] transition-colors">
                    <Icon size={13} className="text-black/50 group-hover:text-black/70 transition-colors" />
                  </div>
                  <span className="text-[13px] text-black/70 group-hover:text-black/90 transition-colors">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isExpandedWorkspace && micError && (
          <div className="absolute bottom-full left-0 right-0 mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 mx-auto max-w-[400px]">
            <X size={12} className="text-red-400 shrink-0" />
            <span className="text-[11px] text-red-400">{micError}</span>
          </div>
        )}
      </div>
    </>
  )
}
