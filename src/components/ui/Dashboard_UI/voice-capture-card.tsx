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
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useVoiceInput } from "@/components/hooks/use-voice-input"
import { VoiceWaveform } from "@/components/ui/AIAssistant_UI/voice-waveform"
import { parseVoiceKhataInput, type ParsedVoiceTransaction } from "@/lib/voice-khata-parser"
import { useTransactions } from "@/components/hooks/use-transactions"
import { useAITransaction } from "@/components/hooks/use-ai-transaction"
import { useAppMode } from "@/context/AppModeContext"
import { useLanguage } from "@/context/LanguageContext"
import { getCategories } from "@/lib/categories"
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

const METHODS = ["UPI", "Cash", "Bank Transfer", "Credit Card", "Debit Card"]

export function VoiceCaptureCard({
  onBack,
  showBackLink = true,
  className = "",
}: VoiceCaptureCardProps) {
  const { addTransaction, transactions } = useTransactions()
  const { parseAITransaction, isParsing: isAIParsing } = useAITransaction()
  const { appMode } = useAppMode()
  const { language } = useLanguage()

  const activeCategories = React.useMemo(() => {
    const base = getCategories(appMode)
    return Array.from(new Set([...base, "Debt", "Other"]))
  }, [appMode])

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
  const [aiReasoning, setAiReasoning] = useState("")
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

  const handleVoiceTranscript = async (finalText: string) => {
    if (!finalText.trim()) return
    const text = finalText.trim()
    setRawSpokenText(text)
    setAiReasoning("")

    // 1. Instant deterministic parsing with enhanced Khata rules
    const parsed: ParsedVoiceTransaction = parseVoiceKhataInput(text, existingCustomers)
    let parsedType: "Credit" | "Debit" = parsed.type || (parsed.category === "Income" ? "Credit" : "Debit")

    const defaultCat = appMode === "BUSINESS"
      ? (parsedType === "Credit" ? "Sales" : "Inventory/Purchases")
      : (parsedType === "Credit" ? "Income" : "Shopping")

    const defaultPerson = (parsed.person && parsed.person !== "Customer / Party")
      ? parsed.person
      : (parsedType === "Credit" ? "Payment Received" : "General Expense")

    let targetCat = parsed.category || defaultCat
    if (appMode === "BUSINESS") {
      if (targetCat === "Income" || !activeCategories.includes(targetCat)) {
        targetCat = parsedType === "Credit" ? "Sales" : "Inventory/Purchases"
      }
    } else if (appMode === "PERSONAL") {
      if (targetCat === "Sales" || !activeCategories.includes(targetCat)) {
        targetCat = parsedType === "Credit" ? "Income" : "Shopping"
      }
    }

    setPerson(defaultPerson)
    setAmount(parsed.amount !== null ? parsed.amount : "")
    setType(parsedType)
    setCategory(targetCat)
    setMethod(parsed.method || "UPI")
    setDate(parsed.date || format(new Date(), "yyyy-MM-dd"))
    setAiReasoning(parsed.directionLabel ? `Detected: ${parsed.directionLabel}` : "")

    // Always transition to Review state immediately
    setStep("review")

    // 2. Parallel semantic AI refinement via Llama 3.3 on Groq
    try {
      const aiResult = await parseAITransaction(text, appMode, transactions)
      if (aiResult) {
        if (aiResult.type === "Credit" || aiResult.type === "Debit") {
          setType(aiResult.type)
        }
        if (aiResult.transaction && aiResult.transaction !== "Unknown" && (defaultPerson === "General Expense" || defaultPerson === "Payment Received")) {
          setPerson(aiResult.transaction)
        }
        if (aiResult.amount && (parsed.amount === null || Number.isNaN(parsed.amount))) {
          setAmount(aiResult.amount)
        }
        if (aiResult.category && activeCategories.includes(aiResult.category)) {
          setCategory(aiResult.category)
        }
        if (aiResult.method) {
          setMethod(aiResult.method)
        }
        if (aiResult.reasoning) {
          setAiReasoning(aiResult.reasoning)
        }
      }
    } catch (e) {
      console.warn("[VoiceCaptureCard] AI background refinement skipped:", e)
    }
  }

  const [liveSpeech, setLiveSpeech] = useState("")
  const [voiceLang, setVoiceLang] = useState<"en-IN" | "hi-IN">(language === "hi" ? "hi-IN" : "en-IN")


  const {
    voiceState,
    transcript,
    errorMessage,
    startListening,
    stopListening,
    reset: resetVoice,
    analyserRef,
  } = useVoiceInput({
    lang: voiceLang,
    onLiveTranscript: (text) => setLiveSpeech(text),
    onTranscript: handleVoiceTranscript,
    onError: (err) => {
      console.warn("[VoiceCaptureCard] Voice input error:", err)
    },
  })

  const displayedSpeech = liveSpeech || transcript
  const isListening = voiceState === "listening"
  const isProcessing = voiceState === "processing"

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
    setLiveSpeech("")
    setPerson("")
    setAmount("")
    setType("Credit")
    setCategory(appMode === "BUSINESS" ? "Sales" : "Income")
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
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to overview
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400">
              <Sparkles size={12} />
              Voice-first capture
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {step === "capture" ? "Step 1 of 1 · Review before saving" : "Review entry"}
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-[#0E1528] dark:to-slate-950 p-6 md:p-8 shadow-md dark:shadow-2xl overflow-hidden">
        {/* Soft center ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[480px] h-[340px] md:h-[480px] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === "capture" ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              {/* Top Header - changes smoothly based on listening state */}
              {!isListening && !isProcessing ? (
                <>
                  <div className="inline-flex items-center justify-center size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs">
                    <Mic size={20} />
                  </div>

                  <p className="text-[11px] font-bold tracking-[0.25em] text-indigo-600 dark:text-indigo-400 uppercase mb-1">
                    VOICE ENTRY
                  </p>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5">
                    Say what happened
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                    Speak naturally in Hindi, English, or Hinglish.
                  </p>

                  {/* Language Selector Pill */}
                  <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 mb-4 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setVoiceLang("en-IN")}
                      className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        voiceLang === "en-IN"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      English (India)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceLang("hi-IN")}
                      className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        voiceLang === "hi-IN"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      🇮🇳 हिंदी / Hinglish
                    </button>
                  </div>
                </>
              ) : isListening ? (
                /* Sleek listening header */
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-semibold mb-3 shadow-xs animate-in fade-in">
                  <span className="relative flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
                  </span>
                  <span>Listening live ({voiceLang === "hi-IN" ? "हिंदी/Hinglish" : "English"})</span>
                </div>
              ) : null}

              {/* Hero Circular Mic Button */}
              <div className="relative flex items-center justify-center my-2">
                {isListening && (
                  <>
                    <span className="absolute size-40 rounded-full border-2 border-indigo-500/30 animate-ping pointer-events-none" />
                    <span className="absolute size-32 rounded-full border border-indigo-500/25 animate-pulse pointer-events-none" />
                  </>
                )}

                <button
                  disabled={isProcessing}
                  onClick={() => {
                    if (isListening) {
                      stopListening()
                    } else if (!isProcessing) {
                      setLiveSpeech("")
                      startListening()
                    }
                  }}
                  className={`relative size-24 md:size-28 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
                    isListening
                      ? "bg-red-500 text-white shadow-red-500/40 scale-105 ring-8 ring-red-500/20"
                      : isProcessing
                      ? "bg-indigo-600 text-white shadow-indigo-500/40 scale-100 ring-8 ring-indigo-500/20 animate-pulse cursor-wait"
                      : "bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 text-white hover:from-indigo-400 hover:to-indigo-500 hover:scale-105 shadow-indigo-500/30 ring-8 ring-indigo-500/10"
                  }`}
                  title={isListening ? "Click to finish speaking" : isProcessing ? "Processing speech..." : "Click to speak"}
                >
                  {isProcessing ? (
                    <Loader2 size={38} className="animate-spin text-white" />
                  ) : (
                    <Mic size={38} className={isListening ? "animate-pulse" : ""} />
                  )}
                </button>
              </div>

              {/* Active Voice Waveform, Live Transcription & Feedback */}
              {isListening ? (
                <div className="flex flex-col items-center gap-3 mt-3 w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-200">
                  {/* Subtle Waveform */}
                  <div className="h-6 w-32 flex items-center justify-center overflow-hidden">
                    <VoiceWaveform analyserRef={analyserRef} isListening={true} color="rgba(99, 102, 241, 0.9)" />
                  </div>

                  {/* Real-Time Live Spoken Text Display */}
                  <div className="w-full rounded-2xl border border-indigo-200/80 dark:border-indigo-500/20 bg-slate-50/90 dark:bg-slate-900/80 p-5 shadow-lg backdrop-blur-md text-center transition-all duration-150 min-h-[72px] flex items-center justify-center">
                    {displayedSpeech ? (
                      <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed break-words w-full">
                        "{displayedSpeech}"
                        <span className="inline-block w-2 h-4.5 ml-1 bg-indigo-600 dark:bg-indigo-400 align-middle animate-pulse rounded-xs" />
                      </p>
                    ) : (
                      <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 italic text-center animate-pulse">
                        🎙️ Listening... start speaking now
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        stopListening()
                        setLiveSpeech("")
                        setTimeout(resetVoice, 50)
                      }}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 border border-indigo-400/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30 hover:scale-[1.02]"
                    >
                      <Check size={15} strokeWidth={3} />
                      Done Speaking
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Pausing for 3 seconds will automatically finalize
                  </span>
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-md mx-auto animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                    <Loader2 size={16} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs sm:text-sm font-medium">Preparing your transaction review...</span>
                  </div>
                  {displayedSpeech && (
                    <div className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Heard:</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">
                        "{displayedSpeech}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Rotating Prompt Suggestions */
                <div className="mt-8 flex flex-col items-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                    Try saying / बोलकर देखें
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

              {/* Insecure context or microphone permission error notice */}
              {errorMessage && (
                <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-left max-w-md mx-auto animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-red-900 dark:text-red-200 leading-relaxed">
                        {errorMessage}
                      </p>
                      <button
                        onClick={() => {
                          resetVoice()
                          startListening()
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-indigo-700 cursor-pointer pt-1 inline-block"
                      >
                        Try Again / पुनः प्रयास करें
                      </button>
                    </div>
                  </div>
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
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">
                      REVIEW ENTRY
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                      {appMode === "BUSINESS" ? "Business Mode" : appMode === "PERSONAL" ? "Personal Mode" : "Combo Mode"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Review before saving
                  </h3>
                  {rawSpokenText && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 italic">
                      Heard: "{rawSpokenText}"
                    </p>
                  )}
                </div>

                <button
                  onClick={handleResetForAnother}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Record again
                </button>
              </div>

              {/* Direction Selector (Credit / Debit) */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setType("Credit")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center ${
                    type === "Credit"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className={`size-2.5 rounded-full transition-transform ${type === "Credit" ? "bg-emerald-500 scale-125 ring-2 ring-emerald-400/40" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span>+ ₹ Received / जमा मिला (Credit)</span>
                  </div>
                  <span className="text-[10px] mt-0.5 opacity-80">
                    Payment from customer / Income
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("Debit")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center ${
                    type === "Debit"
                      ? "bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className={`size-2.5 rounded-full transition-transform ${type === "Debit" ? "bg-rose-500 scale-125 ring-2 ring-rose-400/40" : "bg-slate-300 dark:bg-slate-600"}`} />
                    <span>- ₹ Paid / उधार दिया (Debit)</span>
                  </div>
                  <span className="text-[10px] mt-0.5 opacity-80">
                    Udhaar to customer / Expense
                  </span>
                </button>
              </div>

              {/* AI Reasoning / Classification Chip */}
              {aiReasoning && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-4">
                  <Sparkles size={14} className="text-indigo-500 shrink-0" />
                  <span>{aiReasoning}</span>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Party / Customer Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Customer / Party Name
                  </label>
                  <input
                    type="text"
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder="e.g. Ramesh, Suresh Kirana, Salary"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900/80 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500 transition-colors text-sm"
                  />
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <IndianRupee size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-base placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900/80 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Tag size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900/80 dark:border-slate-800 dark:text-white transition-colors text-sm"
                  >
                    {activeCategories.map((cat) => (
                      <option key={cat} value={cat} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900/80 dark:border-slate-800 dark:text-white transition-colors text-sm"
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-slate-900/80 dark:border-slate-800 dark:text-white transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 transition-colors text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
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
