// src/components/ui/Dashboard_UI/voice-capture-card.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  X,
  CreditCard,
  Calendar,
  Tag,
  User,
  IndianRupee,
  CheckCircle2,
} from "lucide-react"
import { useVoiceInput } from "@/components/hooks/use-voice-input"
import { VoiceWaveform } from "@/components/ui/AIAssistant_UI/voice-waveform"
import { parseVoiceKhataInput, type ParsedVoiceTransaction } from "@/lib/voice-khata-parser"
import { useTransactions } from "@/components/hooks/use-transactions"
import { useAppMode } from "@/context/AppModeContext"
import { format } from "date-fns"

interface VoiceCaptureCardProps {
  onBack?: () => void
  showBackLink?: boolean
  className?: string
}

const TRY_SAYING_PROMPTS = [
  "Received ₹1,200 from Ramesh by UPI",
  "रमेश ने 500 रुपये दिए",
  "Sharma ji ko 1500 udhar diya",
  "Paid ₹450 for groceries by cash",
  "सुरेश से 2000 रुपये जमा मिला",
  "Spent ₹350 on petrol via GPay",
]

const CATEGORIES = [
  "Income",
  "Food",
  "Shopping",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Debt",
  "Other"
]

const METHODS = ["UPI", "Cash", "Bank Transfer", "Credit Card", "Debit Card"]

export function VoiceCaptureCard({
  onBack,
  showBackLink = true,
  className = "",
}: VoiceCaptureCardProps) {
  const { addTransaction, transactions } = useTransactions()
  const { appMode } = useAppMode()

  const [step, setStep] = useState<"capture" | "review" | "success">("capture")
  const [promptIndex, setPromptIndex] = useState(0)

  // Review form state
  const [person, setPerson] = useState("")
  const [amount, setAmount] = useState<string | number>("")
  const [type, setType] = useState<"Credit" | "Debit">("Credit")
  const [category, setCategory] = useState("Income")
  const [method, setMethod] = useState("UPI")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [rawSpokenText, setRawSpokenText] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("")

  // Rotating suggestion timer
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % TRY_SAYING_PROMPTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Existing customer names for intelligent matching
  const existingCustomers = React.useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.transaction))).filter(Boolean)
  }, [transactions])

  const handleVoiceTranscript = (finalText: string) => {
    if (!finalText.trim()) return
    setRawSpokenText(finalText.trim())

    // Parse with deterministic VoiceKhata parser
    const parsed: ParsedVoiceTransaction = parseVoiceKhataInput(finalText.trim(), existingCustomers)

    setPerson(parsed.person === "Customer / Party" ? "" : parsed.person)
    setAmount(parsed.amount !== null ? parsed.amount : "")
    setType(parsed.type || "Credit")
    setCategory(parsed.category || (parsed.type === "Debit" ? "Shopping" : "Income"))
    setMethod(parsed.method || "UPI")
    setDate(parsed.date || format(new Date(), "yyyy-MM-dd"))

    // Transition to Review state
    setStep("review")
  }

  const {
    voiceState,
    transcript,
    startListening,
    stopListening,
    reset: resetVoice,
    analyserRef,
  } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
  })

  const isListening = voiceState === "listening"

  const handleSave = async () => {
    const numAmount = typeof amount === "number" ? amount : parseFloat(String(amount).replace(/,/g, ""))
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid transaction amount.")
      return
    }

    const txName = person.trim() || (type === "Credit" ? "Payment Received" : "Expense")

    setIsSaving(true)
    try {
      await addTransaction({
        transaction: txName,
        amount: numAmount,
        type,
        category: category || "Other",
        method: method || "Cash",
        date: date || format(new Date(), "yyyy-MM-dd"),
        status: "Completed",
        app_mode: appMode === "COMBO" ? "BUSINESS" : appMode,
      })

      setSaveSuccessMsg(`₹${numAmount.toLocaleString("en-IN")} ${type === "Credit" ? "received from" : "paid to"} ${txName}`)
      setStep("success")
    } catch (err) {
      console.error("Save transaction error:", err)
      alert("Could not save transaction. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetForAnother = () => {
    resetVoice()
    setPerson("")
    setAmount("")
    setType("Credit")
    setCategory("Income")
    setMethod("UPI")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setRawSpokenText("")
    setStep("capture")
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Subnav / Breadcrumbs */}
      {showBackLink && (
        <div className="flex items-center justify-between gap-4 mb-4">
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to overview
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles size={12} />
              Voice-first capture
            </span>
            <span className="text-xs text-slate-400">
              {step === "capture" ? "Step 1 of 1 · Review before saving" : "Review entry"}
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/95 via-[#0E1528] to-slate-950 p-6 md:p-12 shadow-2xl overflow-hidden">
        {/* Soft center ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[480px] h-[340px] md:h-[480px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === "capture" ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              {/* Top Badge */}
              <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
                <Mic size={22} />
              </div>

              {/* Tag & Title */}
              <p className="text-[11px] font-bold tracking-[0.25em] text-indigo-400 uppercase mb-2">
                VOICE ENTRY
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                Say what happened
              </h2>
              <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto mb-8">
                VoiceKhata will prepare the entry for your review.
              </p>

              {/* Hero Circular Mic Button */}
              <div className="relative flex items-center justify-center my-4">
                {/* Listening wave ripples */}
                {isListening && (
                  <>
                    <span className="absolute size-44 rounded-full border-2 border-indigo-500/40 animate-ping pointer-events-none" />
                    <span className="absolute size-36 rounded-full border border-indigo-500/30 animate-pulse pointer-events-none" />
                  </>
                )}

                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening()
                    } else {
                      startListening()
                    }
                  }}
                  className={`relative size-28 md:size-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
                    isListening
                      ? "bg-red-500 text-white shadow-red-500/40 scale-105 ring-8 ring-red-500/20"
                      : "bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 text-white hover:from-indigo-400 hover:to-indigo-500 hover:scale-105 shadow-indigo-500/30 ring-8 ring-indigo-500/10"
                  }`}
                  title={isListening ? "Click to finish speaking" : "Click to speak"}
                >
                  <Mic size={44} className={isListening ? "animate-pulse" : ""} />
                </button>
              </div>

              {/* Active Voice Waveform & Live Feedback */}
              {isListening ? (
                <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-sm animate-in fade-in zoom-in-95">
                  <div className="h-8 flex items-center justify-center w-full">
                    <VoiceWaveform analyserRef={analyserRef} isListening={true} color="rgba(99, 102, 241, 0.95)" />
                  </div>

                  {transcript ? (
                    <p className="text-sm font-medium text-white/90 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-sm max-w-md truncate">
                      "{transcript}"
                    </p>
                  ) : (
                    <p className="text-xs text-indigo-300/80 animate-pulse flex items-center gap-2">
                      <span className="size-2 rounded-full bg-indigo-400 animate-ping" />
                      Listening to your voice... Speak naturally in Hindi or English
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => {
                        stopListening()
                        setTimeout(resetVoice, 50)
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={stopListening}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Check size={14} strokeWidth={3} />
                      Done speaking
                    </button>
                  </div>
                </div>
              ) : (
                /* Rotating Prompt Suggestions */
                <div className="mt-8 flex flex-col items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                    Try saying
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={promptIndex}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm md:text-base font-medium text-indigo-300/90 italic cursor-pointer hover:text-indigo-200 transition-colors"
                      onClick={() => {
                        handleVoiceTranscript(TRY_SAYING_PROMPTS[promptIndex])
                      }}
                      title="Click to try this example"
                    >
                      "{TRY_SAYING_PROMPTS[promptIndex]}"
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : step === "review" ? (
            /* ── Review Before Saving Screen ────────────────────────────── */
            <motion.div
              key="review"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col relative z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <span className="text-[11px] font-bold tracking-[0.2em] text-indigo-400 uppercase">
                    REVIEW ENTRY
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    Review before saving
                  </h3>
                  {rawSpokenText && (
                    <p className="text-xs text-slate-400 mt-0.5 italic">
                      Heard: "{rawSpokenText}"
                    </p>
                  )}
                </div>

                <button
                  onClick={handleResetForAnother}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Record again
                </button>
              </div>

              {/* Direction Selector (Credit / Debit) */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setType("Credit")}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    type === "Credit"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/10"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="size-2 rounded-full bg-emerald-400" />
                  Credit (Money Received / Inflow)
                </button>

                <button
                  type="button"
                  onClick={() => setType("Debit")}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    type === "Debit"
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-md shadow-rose-500/10"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="size-2 rounded-full bg-rose-400" />
                  Debit (Money Paid / Udhaar)
                </button>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Party / Customer Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-indigo-400" />
                    Customer / Party Name
                  </label>
                  <input
                    type="text"
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder="e.g. Ramesh, Suresh Kirana, Salary"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <IndianRupee size={14} className="text-indigo-400" />
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white font-semibold text-base placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag size={14} className="text-indigo-400" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-indigo-400" />
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m} className="bg-slate-900 text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-400" />
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      Save with confidence
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── Success Confirmation Screen ────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center py-6 relative z-10"
            >
              <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-1">
                Saved with confidence!
              </h3>
              <p className="text-sm text-slate-400 mb-6 max-w-sm">
                {saveSuccessMsg}
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetForAnother}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Mic size={16} />
                  Record another entry
                </button>

                {onBack && (
                  <button
                    onClick={onBack}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Back to dashboard
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
