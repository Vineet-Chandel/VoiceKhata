// src/components/ui/Dashboard_UI/voice-action-banner.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Check, RotateCcw, AlertCircle, ArrowUpRight, ArrowDownRight, Edit2, Sparkles, Send } from "lucide-react"
import { useVoiceInput } from "@/components/hooks/use-voice-input"
import { parseVoiceKhataInput, type ParsedVoiceTransaction } from "@/lib/voice-khata-parser"
import type { TransactionInput } from "@/types/finance"

interface VoiceActionBannerProps {
  onAddTransaction: (t: TransactionInput) => Promise<{ error?: string; data?: any } | undefined>
  onDeleteTransaction?: (id: number) => Promise<void>
  onSuccessToast?: (msg: string, undoAction?: () => void) => void
  existingCustomers?: string[]
}

type FlowState = "idle" | "listening" | "processing" | "review" | "ambiguous_person" | "ambiguous_direction" | "success" | "error"

export function VoiceActionBanner({
  onAddTransaction,
  onDeleteTransaction,
  onSuccessToast,
  existingCustomers,
}: VoiceActionBannerProps) {
  const handleVoiceTranscript = (finalText: string) => {
    if (finalText.trim()) {
      processTranscript(finalText.trim())
    }
  }

  const { voiceState, transcript, startListening, stopListening, reset } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    onError: () => setFlowState("error"),
  })
  
  const [flowState, setFlowState] = useState<FlowState>("idle")
  const [parsedTx, setParsedTx] = useState<ParsedVoiceTransaction | null>(null)
  const [manualText, setManualText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  
  // Editable review fields
  const [editPerson, setEditPerson] = useState("")
  const [editAmount, setEditAmount] = useState<number | string>("")
  const [editType, setEditType] = useState<"Credit" | "Debit">("Credit")
  const [editMethod, setEditMethod] = useState("UPI")
  const [editDate, setEditDate] = useState("")

  // Undo state
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null)
  const [undoCountdown, setUndoCountdown] = useState<number>(0)
  const [successMessage, setSuccessMessage] = useState("")

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Listen to voice input state transitions
  useEffect(() => {
    if (voiceState === "listening") {
      setFlowState("listening")
    } else if (voiceState === "processing") {
      setFlowState("processing")
    } else if (voiceState === "error") {
      setFlowState("error")
    }
  }, [voiceState])

  const processTranscript = (text: string) => {
    setFlowState("processing")
    setTimeout(() => {
      const parsed = parseVoiceKhataInput(text, existingCustomers)
      setParsedTx(parsed)
      setEditPerson(parsed.person === "Customer / Party" ? "" : parsed.person)
      setEditAmount(parsed.amount || "")
      setEditType(parsed.type || "Credit")
      setEditMethod(parsed.method || "UPI")
      setEditDate(parsed.date)

      if (parsed.amount && parsed.isAmbiguousPerson) {
        setFlowState("ambiguous_person")
      } else if (parsed.amount && parsed.isAmbiguousDirection) {
        setFlowState("ambiguous_direction")
      } else if (parsed.amount) {
        setFlowState("review")
      } else {
        // Did not catch amount
        setFlowState("review")
      }
    }, 300)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualText.trim()) return
    processTranscript(manualText)
    setManualText("")
  }

  const handleConfirmSave = async () => {
    const finalAmount = Number(editAmount)
    const finalPerson = editPerson.trim() || "Cash Customer"
    
    if (!finalAmount || isNaN(finalAmount)) {
      alert("Please enter a valid amount.")
      return
    }

    try {
      const res = await onAddTransaction({
        transaction: finalPerson,
        amount: finalAmount,
        type: editType,
        method: editMethod,
        category: editType === "Credit" ? "Income" : "Shopping",
        date: editDate || new Date().toISOString().slice(0, 10),
        status: "Completed",
      })

      const newId = res?.data?.id || (res as any)?.id || Date.now()
      setLastCreatedId(newId)

      const msg = `Saved to ${finalPerson}'s Khata • ₹${finalAmount.toLocaleString("en-IN")} ${editType === "Credit" ? "received" : "paid"}`
      setSuccessMessage(msg)
      setFlowState("success")
      setIsEditing(false)

      if (onSuccessToast) {
        onSuccessToast(msg, () => handleUndo(newId))
      }

      // Start 7-second undo countdown
      setUndoCountdown(7)
      if (undoTimerRef.current) clearInterval(undoTimerRef.current)
      undoTimerRef.current = setInterval(() => {
        setUndoCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(undoTimerRef.current!)
            setFlowState("idle")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      reset()
    } catch (err) {
      console.error(err)
      setFlowState("error")
    }
  }

  const handleUndo = async (idToUndo?: number) => {
    const targetId = idToUndo || lastCreatedId
    if (targetId && onDeleteTransaction) {
      await onDeleteTransaction(targetId)
    }
    if (undoTimerRef.current) clearInterval(undoTimerRef.current)
    setUndoCountdown(0)
    setFlowState("idle")
    setLastCreatedId(null)
  }

  const handleTryAgain = () => {
    reset()
    setIsEditing(false)
    setFlowState("idle")
  }

  return (
    <div className="mx-4 lg:mx-6 rounded-[14px] border border-[#334155] bg-[#1E293B] p-5 shadow-xs transition-all text-[#F8FAFC]">
      {/* ── 1. IDLE STATE ──────────────────────────────────────────────────────── */}
      {flowState === "idle" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#818CF8] bg-[#1E293B] border border-[#334155] px-2.5 py-0.5 rounded-full">
                Voice Action
              </span>
              <span className="text-xs font-medium text-[#94A3B8]">WHAT HAPPENED TODAY?</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F8FAFC]">
              Record by voice in 3 seconds
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Say e.g. <span className="text-[#F8FAFC] font-medium">"Received ₹1,200 from Ramesh via UPI"</span> or <span className="text-[#F8FAFC] font-medium">"Suresh ko ₹500 diye cash"</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Optional typing fallback */}
            <form onSubmit={handleManualSubmit} className="relative hidden md:flex items-center">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Or type e.g. Ramesh ₹1200 UPI..."
                className="w-56 lg:w-64 h-10 px-3 pr-8 text-xs rounded-[10px] border border-[#334155] bg-[#0F172A] text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#818CF8]"
              />
              <button
                type="submit"
                disabled={!manualText.trim()}
                className="absolute right-2 text-[#94A3B8] hover:text-[#818CF8] disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </form>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={startListening}
              className="flex items-center justify-center gap-2.5 h-11 px-5 rounded-[10px] bg-[#5C6BC0] hover:bg-[#4F46E5] text-white text-sm font-semibold shadow-lg shadow-[#5C6BC0]/20 transition-all w-full sm:w-auto cursor-pointer"
            >
              <Mic size={18} />
              <span>Record by voice</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* ── 2. LISTENING STATE ─────────────────────────────────────────────────── */}
      {flowState === "listening" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center size-12 rounded-full bg-[#1E293B] text-[#818CF8]">
              <Mic size={22} className="text-[#818CF8] relative z-10" />
              {/* Concentric gesture wave rings */}
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-[#818CF8]"
              />
              <motion.div
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.3, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-[#5C6BC0]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#10B981] animate-pulse" />
                <p className="text-sm font-semibold text-[#F8FAFC]">Listening... Bolna shuru kijiye</p>
                {/* Real-time sound wave bars */}
                <div className="flex items-center gap-0.5 h-3.5 ml-1">
                  {[40, 85, 100, 60, 90, 45].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.2}%`] }}
                      transition={{ repeat: Infinity, duration: 0.6 + i * 0.1, ease: "easeInOut" }}
                      className="w-0.5 bg-[#10B981] rounded-full inline-block"
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5 max-w-md line-clamp-1 italic">
                {transcript || '"Received ₹1,200 from Ramesh via UPI..."'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={stopListening}
              className="flex items-center justify-center gap-2 h-10 px-5 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Check size={16} />
              <span>Done Speaking</span>
            </motion.button>
            <button
              onClick={handleTryAgain}
              className="h-10 px-3.5 rounded-[8px] border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#253349] text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── 3. PROCESSING STATE ────────────────────────────────────────────────── */}
      {flowState === "processing" && (
        <div className="flex items-center justify-center py-6 gap-3 text-sm text-[#94A3B8]">
          <div className="size-5 border-2 border-[#818CF8] border-t-transparent rounded-full animate-spin" />
          <span>Understanding your entry...</span>
        </div>
      )}

      {/* ── 4. REVIEW STATE (MANDATORY TRUST STEP) ──────────────────────────────── */}
      {flowState === "review" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#334155] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#10B981] bg-[#064E3B]/30 border border-[#10B981]/20 px-2 py-0.5 rounded-full">
                I understood
              </span>
              <span className="text-xs text-[#94A3B8]">Review before saving to Khata</span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#818CF8] hover:underline cursor-pointer"
            >
              <Edit2 size={13} />
              <span>{isEditing ? "Close Edit" : "Edit details"}</span>
            </button>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#0F172A] p-3.5 rounded-[10px] border border-[#334155]">
              <div>
                <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Person / Customer</label>
                <input
                  type="text"
                  value={editPerson}
                  onChange={(e) => setEditPerson(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-[#334155] bg-[#1E293B] text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="1200"
                  className="w-full h-9 px-2.5 text-xs rounded-[8px] border border-[#334155] bg-[#1E293B] text-[#F8FAFC] font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Direction</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as "Credit" | "Debit")}
                  className="w-full h-9 px-2 text-xs rounded-[8px] border border-[#334155] bg-[#1E293B] text-[#F8FAFC]"
                >
                  <option value="Credit">Money Received (Inflow)</option>
                  <option value="Debit">Money Paid / Credit Given (Outflow)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#94A3B8] block mb-1">Payment Method</label>
                <select
                  value={editMethod}
                  onChange={(e) => setEditMethod(e.target.value)}
                  className="w-full h-9 px-2 text-xs rounded-[8px] border border-[#334155] bg-[#1E293B] text-[#F8FAFC]"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit">Khata / Credit</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#253349] rounded-[10px] border border-[#334155]">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center size-10 rounded-[10px] ${
                  editType === "Credit" ? "bg-[#064E3B]/30 text-[#10B981]" : "bg-[#450A0A]/30 text-[#EF4444]"
                }`}>
                  {editType === "Credit" ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F8FAFC]">
                    {editPerson || "Party / Customer"}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#94A3B8]">
                    <span className="font-medium text-[#F8FAFC]">
                      {editType === "Credit" ? "Money received" : "Money paid"}
                    </span>
                    <span>•</span>
                    <span>{editMethod}</span>
                    <span>•</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xl font-bold tabular-nums ${
                  editType === "Credit" ? "text-[#10B981]" : "text-[#EF4444]"
                }`}>
                  {editType === "Credit" ? "+" : "-"}₹{Number(editAmount || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  {editType === "Credit" ? "Credit to ledger" : "Debit from ledger"}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={handleTryAgain}
              className="h-9 px-4 rounded-[8px] border border-[#334155] text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#253349] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSave}
              className="flex items-center gap-1.5 h-9 px-5 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Check size={15} />
              <span>Save Entry</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 5. AMBIGUOUS PERSON STATE ───────────────────────────────────────────── */}
      {flowState === "ambiguous_person" && (
        <div className="space-y-3 bg-[#451A03]/30 p-4 rounded-[10px] border border-[#F59E0B]/30">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                "I heard ₹{Number(editAmount || 0).toLocaleString("en-IN")} {editType === "Credit" ? "received" : "going out"}, but I'm not sure who it was for."
              </p>
              <p className="text-xs text-[#94A3B8]">
                Please enter the customer or vendor's name below:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={editPerson}
              onChange={(e) => setEditPerson(e.target.value)}
              placeholder="Enter person name (e.g. Ramesh Kumar)"
              className="flex-1 h-9 px-3 text-xs rounded-[8px] border border-[#334155] bg-[#0F172A] text-[#F8FAFC]"
              autoFocus
            />
            <button
              onClick={() => {
                if (editPerson.trim()) {
                  setFlowState("review")
                }
              }}
              disabled={!editPerson.trim()}
              className="h-9 px-4 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F46E5] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              Confirm Person
            </button>
            <button
              onClick={handleTryAgain}
              className="h-9 px-3 rounded-[8px] border border-[#334155] text-xs font-medium text-[#94A3B8] hover:bg-[#253349] cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── 6. AMBIGUOUS DIRECTION STATE ────────────────────────────────────────── */}
      {flowState === "ambiguous_direction" && (
        <div className="space-y-3 bg-[#451A03]/30 p-4 rounded-[10px] border border-[#F59E0B]/30">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                "I heard ₹{Number(editAmount || 0).toLocaleString("en-IN")} for {editPerson || "this entry"}, but I'm not sure whether you received or paid this amount."
              </p>
              <p className="text-xs text-[#94A3B8]">
                Select the money direction to verify:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {
                setEditType("Credit")
                setFlowState("review")
              }}
              className="flex items-center gap-2 h-9 px-4 rounded-[8px] bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold cursor-pointer"
            >
              <ArrowDownRight size={16} />
              <span>Money Received (Credit)</span>
            </button>
            <button
              onClick={() => {
                setEditType("Debit")
                setFlowState("review")
              }}
              className="flex items-center gap-2 h-9 px-4 rounded-[8px] bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold cursor-pointer"
            >
              <ArrowUpRight size={16} />
              <span>Money Paid (Debit)</span>
            </button>
            <button
              onClick={handleTryAgain}
              className="h-9 px-3 rounded-[8px] border border-[#334155] text-xs font-medium text-[#94A3B8] hover:bg-[#253349] cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── 7. SUCCESS + UNDO STATE (6 SECONDS WINDOW) ────────────────────────── */}
      {flowState === "success" && (
        <div className="flex items-center justify-between bg-[#064E3B]/30 border border-[#10B981]/30 p-3.5 rounded-[10px] transition-all">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-8 rounded-full bg-[#10B981] text-white shrink-0">
              <Check size={16} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#10B981]">
                {successMessage}
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                Ledger and balances have been updated automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUndo()}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[6px] bg-[#253349] border border-[#10B981]/40 text-[#10B981] hover:bg-[#1E293B] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Undo ({undoCountdown}s)</span>
            </button>
            <button
              onClick={() => setFlowState("idle")}
              className="h-8 px-2.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── 8. ERROR STATE ──────────────────────────────────────────────────────── */}
      {flowState === "error" && (
        <div className="flex items-center justify-between bg-[#450A0A]/30 border border-[#EF4444]/30 p-3.5 rounded-[10px]">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-[#EF4444] shrink-0" />
            <p className="text-xs sm:text-sm text-[#EF4444] font-medium">
              We couldn't capture this voice entry. Microphone access or speech was unclear.
            </p>
          </div>
          <button
            onClick={handleTryAgain}
            className="h-8 px-3 rounded-[6px] bg-[#253349] border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#450A0A]/50 text-xs font-semibold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
