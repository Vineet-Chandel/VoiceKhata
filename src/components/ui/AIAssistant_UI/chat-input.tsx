// src/components/ui/AIAssistant_UI/chat-input.tsx
"use client"

import * as React from "react"
import { Plus, X, ArrowUp, Receipt, CreditCard, Upload, FileText, Images, Mic, Square, Check } from "lucide-react"
import { useVoiceInput } from "@/components/hooks/use-voice-input"
import { VoiceWaveform } from "@/components/ui/AIAssistant_UI/voice-waveform"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { scanReceiptMulti } from "@/lib/scan-receipt"
import type { GuidedStep, Message } from "@/components/hooks/use-ai-chat"

interface Props {
  onSend:         (msg: string) => void
  loading:        boolean
  guidedStep:     GuidedStep
  replyingTo?:    Message | null
  onCancelReply?: () => void
  onStartGuided:  () => void
  onStartBudgetGuided?: () => void
  onCancelGuided?: () => void
  variant?: "light" | "dark"
}

const GUIDED_STEPS: GuidedStep[] = ["name", "amount", "category", "type", "method", "confirm"]

const STEP_LABELS: Partial<Record<GuidedStep, string>> = {
  name:     "Name",
  amount:   "Amount",
  category: "Category",
  type:     "Type",
  method:   "Payment method",
  confirm:  "Confirm",
}

const MENU_ITEMS = [
  { icon: Plus,    label: "Log transaction",    action: "guided"  },
  { icon: Receipt, label: "Scan receipt",       action: "receipt" },
  { icon: Images,  label: "Import screenshots", action: "bulk"    },
  { icon: CreditCard, label: "Set a budget",   action: "budget"  },
] as const

const COMING_SOON = [
  { icon: Upload,   label: "Import from bank" },
  { icon: FileText, label: "Export report"    },
]


const stripMarkdown = (text: string) => {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\*\*(.*?)\*\*/g, '$1')         // bold
    .replace(/\*(.*?)\*/g, '$1')             // italic
    .replace(/#{1,6}\s+/g, '')               // headings
    .replace(/---+/g, '')                    // horizontal rules
    .replace(/`([^`]+)`/g, '$1')             // inline code
    .replace(/\n+/g, ' ')                    // newlines to space
    .trim()
}

type ScanState =
  | { status: "idle" }
  | { status: "scanning"; current: number; total: number }
  | { status: "error";    message: string }

export function ChatInput({ onSend, loading, guidedStep, replyingTo, onCancelReply, onStartGuided, onStartBudgetGuided, onCancelGuided, variant = "dark" }: Props) {
  const [value,      setValue]      = React.useState("")
  const [focused,    setFocused]    = React.useState(false)
  const [popOpen,    setPopOpen]    = React.useState(false)
  const [scanState,  setScanState]  = React.useState<ScanState>({ status: "idle" })
  const textareaRef                 = React.useRef<HTMLTextAreaElement>(null)

  const {
    voiceState,
    transcript,
    errorMessage,
    startListening,
    stopListening,
    reset: resetVoice,
    analyserRef,
  } = useVoiceInput()

  React.useEffect(() => {
    if (voiceState === "processing") {
      if (transcript) {
        setValue((prev) => (prev ? prev + " " + transcript : transcript))
        if (textareaRef.current) autoResize(textareaRef.current)
      }
      resetVoice()
    } else if (voiceState === "error" && errorMessage) {
      console.error(errorMessage)
      resetVoice()
    }
  }, [voiceState, transcript, errorMessage, resetVoice])

  // Camera input — capture="environment" opens camera directly (Scan Receipt)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)
  // Gallery/multi input — no capture attr, multiple allowed (Import Screenshots)
  const bulkInputRef   = React.useRef<HTMLInputElement>(null)

  const isGuidedActive = guidedStep !== "idle" && guidedStep !== "done"
  const stepIndex      = GUIDED_STEPS.indexOf(guidedStep as GuidedStep)
  const isScanning     = scanState.status === "scanning"
  const canSend        = !!value.trim() && !loading && !isScanning

  const handleSend = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  // ── Build bulk import message from multi-scan results ─────────────────────
  const buildBulkMessage = (
    results: Array<{ file: string; transactions: any[] }>
  ): string => {
    const allTx = results.flatMap((r: any) => r.transactions as any[])
    if (allTx.length === 0) return ""

    const lines = allTx.map((t: any) => {
      const name   = t.transaction ?? "Unknown"
      const amount = t.amount      ? `₹${t.amount}` : "unknown amount"
      const date   = t.date        ?? "today"
      const cat    = t.category    ?? "Other"
      const method = t.method      ?? "Cash"
      const type   = t.type        ?? "Debit"
      return `name "${name}", amount ${amount}, date ${date}, category ${cat}, method ${method}, type ${type}`
    })

    return `Bulk import ${allTx.length} transaction${allTx.length > 1 ? "s" : ""}:\n` +
      lines.map((l, i) => `${i + 1}. ${l}`).join("\n")
  }

  // ── Single receipt handler — camera input ────────────────────────────────
  const handleReceiptCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    setScanState({ status: "scanning", current: 1, total: 1 })

    try {
      const result = await scanReceiptMulti(file)
      setScanState({ status: "idle" })

      if (!result.transactions.length) {
        onSend("I scanned a receipt but couldn't extract details. Can you help me log a transaction?")
        return
      }

      if (result.transactions.length === 1) {
        const t      = result.transactions[0]
        const name   = t.transaction ?? "Unknown"
        const amount = t.amount      ? `₹${t.amount}` : "unknown amount"
        const date   = t.date        ?? "today"
        const cat    = t.category    ?? "Other"
        const method = t.method      ?? "Cash"
        const type   = t.type        ?? "Debit"
        onSend(`Log a transaction: name "${name}", amount ${amount}, date ${date}, category ${cat}, method ${method}, type ${type}.`)
      } else {
        onSend(buildBulkMessage([{ file: file.name, transactions: result.transactions }]))
      }
    } catch (err: any) {
      console.error("[chat-input] Camera scan failed:", err)
      const msg = err?.message || "AI scan unavailable, please fill manually"
      setScanState({ status: "error", message: msg })
      setTimeout(() => setScanState({ status: "idle" }), 4000)
    }
  }

  // ── Bulk / multiple screenshots handler — gallery input (multiple) ────────
  const handleBulkFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ""

    setScanState({ status: "scanning", current: 0, total: files.length })

    const allResults: Array<{ file: string; transactions: any[] }> = []

    for (let i = 0; i < files.length; i++) {
      setScanState({ status: "scanning", current: i + 1, total: files.length })
      try {
        const result = await scanReceiptMulti(files[i])
        if (result.transactions.length) {
          allResults.push({ file: files[i].name, transactions: result.transactions })
        }
      } catch (err) {
        console.error(`[chat-input] Scan failed for ${files[i].name}:`, err)
      }
    }

    setScanState({ status: "idle" })

    if (!allResults.length) {
      setScanState({ status: "error", message: "AI scan unavailable, please fill manually" })
      setTimeout(() => setScanState({ status: "idle" }), 4000)
      onSend("I tried scanning the receipts but the AI scan service was unavailable. Can you help me log them manually?")
      return
    }

    onSend(buildBulkMessage(allResults))
  }

  const handleMenuAction = (action: string) => {
    setPopOpen(false)
    if (action === "guided") {
      onStartGuided()
    } else if (action === "budget") {
      if (onStartBudgetGuided) onStartBudgetGuided()
      else onSend("Help me set a budget for a category")
    } else if (action === "receipt") {
      // Opens camera directly via capture="environment"
      cameraInputRef.current?.click()
    } else if (action === "bulk") {
      // Opens gallery/media picker — multiple selection allowed
      bulkInputRef.current?.click()
    }
  }

  return (
    <div className="flex flex-col gap-2 relative">

      {/* Replying To Preview */}
      {replyingTo && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 mx-auto max-w-[96%] bg-surface-secondary/95 backdrop-blur border border-border rounded-xl p-3 shadow-lg flex items-start gap-3 z-10 animate-in fade-in slide-in-from-bottom-2">
          <div className={`w-1 self-stretch rounded-full ${replyingTo.role === "user" ? "bg-violet-500" : "bg-emerald-500"}`} />
          <div className="flex-1 min-w-0">
            <div className={`text-[11px] font-semibold mb-0.5 ${replyingTo.role === "user" ? "text-violet-400" : "text-emerald-400"}`}>
              Replying to {replyingTo.role === "user" ? "You" : "VoiceKhata AI"}
            </div>
            <p className="text-[13px] text-text-muted line-clamp-1 break-words">
              {stripMarkdown(replyingTo.content)}
            </p>
          </div>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="p-1 rounded hover:bg-white/10 text-text-muted transition-colors shrink-0 cursor-pointer"
              title="Cancel reply"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Camera input — Scan Receipt: capture="environment" opens camera */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleReceiptCamera}
      />

      {/* Gallery input — Import Screenshots: no capture, multiple */}
      <input
        ref={bulkInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleBulkFiles}
      />

      {/* Scan status banner */}
      {scanState.status === "scanning" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-secondary border border-border">
          <svg className="size-3.5 animate-spin text-text-secondary shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
          <span className="text-[12px] text-text-secondary">
            {scanState.total > 1
              ? `Scanning image ${scanState.current} of ${scanState.total}…`
              : "Scanning…"}
          </span>
        </div>
      )}

      {scanState.status === "error" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <X size={12} className="text-red-400 shrink-0" />
          <span className="text-[12px] text-red-400">{scanState.message}</span>
        </div>
      )}

      {/* Guided step progress */}
      {isGuidedActive && (
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            {GUIDED_STEPS.map((step, i) => {
              const done    = i < stepIndex
              const current = i === stepIndex
              return (
                <div
                  key={step}
                  className={[
                    "h-[3px] rounded-full transition-all duration-300",
                    done    ? "bg-white/60 w-5" : "",
                    current ? "bg-white w-7"    : "",
                    !done && !current ? "bg-surface-secondary w-5" : "",
                  ].join(" ")}
                />
              )
            })}
            <span className="ml-1 text-[11px] text-text-muted font-medium">
              {STEP_LABELS[guidedStep]}
            </span>
          </div>
          <button
            onClick={onCancelGuided}
            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-red-400 transition-colors cursor-pointer"
          >
            <X size={11} />
            Cancel
          </button>
        </div>
      )}

      {/* Input or Voice Pill */}
      {voiceState === "listening" ? (
        <div className="flex items-center justify-between gap-4 rounded-full border border-border-secondary bg-surface-secondary px-2 py-2 max-w-[280px] mx-auto w-full animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              // Cancel: stop and clear
              stopListening()
              setTimeout(resetVoice, 50)
            }}
            className="size-9 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex-1 h-8 flex items-center justify-center overflow-hidden">
            <VoiceWaveform analyserRef={analyserRef} isListening={true} />
          </div>
          
          <button
            onClick={stopListening}
            className="size-9 rounded-full bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors shrink-0 cursor-pointer"
          >
            <Check size={18} strokeWidth={3} />
          </button>
        </div>
      ) : (
      <div
        className={[
          "flex items-end gap-2 rounded-2xl border px-3 py-2.5 transition-all duration-150",
          variant === "light"
            ? (focused ? "border-black/[0.12] bg-white shadow-sm" : "border-black/[0.08] bg-white hover:bg-black/[0.02]")
            : (focused ? "border-border-secondary bg-surface-secondary" : "border-border bg-surface-secondary"),
        ].join(" ")}
      >
        {/* Popover trigger */}
        {!isGuidedActive && (
          <Popover open={popOpen} onOpenChange={setPopOpen}>
            <PopoverTrigger asChild>
              <button
                disabled={loading || isScanning}
                title="Add"
                className={[
                  "mb-0.5 size-7 shrink-0 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer",
                  variant === "light"
                    ? "border border-black/[0.06] bg-black/[0.04] text-black hover:bg-black/[0.08] data-[state=open]:bg-black/[0.08] data-[state=open]:border-black/[0.1]"
                    : "border border-border bg-surface-secondary text-text-muted hover:bg-surface-secondary hover:text-text-secondary hover:border-border-secondary data-[state=open]:bg-surface-secondary data-[state=open]:text-text-secondary data-[state=open]:border-border-secondary",
                  "disabled:pointer-events-none disabled:opacity-30",
                ].join(" ")}
              >
                <Plus
                  size={13}
                  className={`transition-transform duration-200 ${popOpen ? "rotate-45" : ""}`}
                />
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="start"
              sideOffset={10}
              className={`w-52 p-1.5 border rounded-2xl shadow-2xl ${variant === "light" ? "bg-white border-black/[0.06]" : "bg-[#161616] border-border"}`}
            >
              {MENU_ITEMS.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={() => handleMenuAction(action)}
                  className={[
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-surface-secondary transition-colors text-left cursor-pointer group",
                    action === "receipt" ? "md:hidden" : "",
                  ].join(" ")}
                >
                  <div className={`size-[28px] rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${variant === "light" ? "bg-black/[0.02] border-black/[0.06] group-hover:bg-black/[0.04]" : "bg-surface-secondary border-border group-hover:bg-white/[0.1]"}`}>
                    <Icon size={13} className={`transition-colors ${variant === "light" ? "text-black/60 group-hover:text-black" : "text-text-secondary group-hover:text-text-primary"}`} />
                  </div>
                  <span className={`text-[13px] transition-colors ${variant === "light" ? "text-black/70 group-hover:text-black" : "text-text-secondary group-hover:text-text-primary"}`}>{label}</span>
                </button>
              ))}

              <div className="h-px bg-surface-secondary my-1.5 mx-1" />
              <p className="text-[10px] text-text-muted px-3 pb-1 tracking-wide uppercase">Coming soon</p>

              {COMING_SOON.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-default"
                >
                  <div className="size-[28px] rounded-lg bg-surface-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-text-muted" />
                  </div>
                  <span className="text-[13px] text-text-muted">{label}</span>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); autoResize(e.target) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            isScanning
              ? "Scanning…"
              : isGuidedActive
              ? "Type your answer…"
              : "Ask anything or say what you spent…"
          }
          rows={1}
          disabled={isScanning || voiceState === "processing"}
          className={`flex-1 resize-none bg-transparent py-1 text-sm focus:outline-none min-h-[32px] max-h-[120px] leading-relaxed disabled:opacity-40 ${variant === "light" ? "text-black/90 placeholder:text-black/40" : "text-text-primary placeholder:text-text-muted"}`}
        />

        {/* Send or Mic button */}
        {canSend ? (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={[
              "mb-0.5 size-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-150",
              variant === "light"
                ? "bg-black text-white hover:bg-black/90"
                : "bg-white text-black hover:bg-white/90",
              "cursor-pointer disabled:pointer-events-none disabled:opacity-30 active:scale-95",
            ].join(" ")}
          >
            {loading || isScanning ? (
              <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
            ) : (
              <ArrowUp size={14} />
            )}
          </button>
        ) : (
          <button
            onClick={startListening}
            disabled={isScanning || loading || voiceState === "processing"}
            className={[
              "mb-0.5 size-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:pointer-events-none",
              variant === "light"
                ? "bg-black/[0.04] text-black hover:bg-black/[0.08]"
                : "bg-surface-secondary text-text-muted hover:text-text-primary hover:bg-white/5",
            ].join(" ")}
          >
            {voiceState === "processing" ? (
              <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
            ) : (
              <Mic size={15} />
            )}
          </button>
        )}
      </div>
      )}

      {/* Keyboard hint */}
      {!isGuidedActive && !focused && !isScanning && (
        <p className="text-center text-[10px] text-text-muted select-none">
          <kbd className="font-mono">Enter</kbd> to send ·{" "}
          <kbd className="font-mono">Shift+Enter</kbd> for new line
        </p>
      )}
    </div>
  )
}
