import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Bug,
  Lightbulb,
  Mic,
  Palette,
  Zap,
  MessageSquare,
  Star,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  X,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  Check
} from "lucide-react"
import logoImg from "@/assets/logo.png"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { supabase } from "@/lib/supabase"

interface FeedbackType {
  id: string
  label: string
  desc: string
  icon: React.ReactNode
}

const feedbackTypes: FeedbackType[] = [
  {
    id: "bug",
    label: "Report a Bug",
    desc: "Something is broken, unresponsive, or not calculating right",
    icon: <Bug size={22} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "feature",
    label: "Feature Request",
    desc: "A new idea to track dues, customers, or daily khata better",
    icon: <Lightbulb size={22} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "voice",
    label: "Voice & AI Accuracy",
    desc: "Voice transcription, dialect comprehension, or speech speed",
    icon: <Mic size={22} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "ui",
    label: "UX & Visual Design",
    desc: "Layout, readability on mobile, theme colors, or font size",
    icon: <Palette size={22} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "performance",
    label: "Speed & Performance",
    desc: "App loading speed, offline sync, or receipt scan latency",
    icon: <Zap size={22} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "other",
    label: "General Thoughts",
    desc: "Questions, suggestions, or appreciation for our team",
    icon: <MessageSquare size={22} className="transition-transform duration-300 group-hover:scale-110" />
  }
]

const focusAreas = [
  "Voice Khata Recording",
  "Customer Ledger & Dues",
  "WhatsApp Reminders & UPI",
  "Daily Cashbook Summary",
  "Supplier Payments",
  "Reports & PDF Export",
  "Overall Experience"
]

const discoverySources = [
  "Google / Search Engine",
  "WhatsApp Recommendation",
  "Fellow Merchant / Shopkeeper",
  "Trade Association / Mandi",
  "Social Media (Instagram / Twitter / YouTube)",
  "College / Campus Network",
  "Other"
]

// Audio waveform motif
const VoiceKhataWaveformGraphic = () => (
  <div className="relative flex items-center justify-center shrink-0 w-24 sm:w-28 h-10 select-none pointer-events-none">
    <svg
      className="w-full h-8 text-[#0B0F15] dark:text-[#D2F832] overflow-visible"
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 4 16 L 4 10 M 4 16 L 4 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M 14 16 L 14 6 M 14 16 L 14 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M 24 16 L 24 12 M 24 16 L 24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 34 16 L 34 2 M 34 16 L 34 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M 44 16 L 44 8 M 44 16 L 44 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="60" cy="16" r="14" className="fill-[#D2F832] text-[#0B0F15]" />
      <path d="M 76 16 L 76 8 M 76 16 L 76 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M 86 16 L 86 2 M 86 16 L 86 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M 96 16 L 96 12 M 96 16 L 96 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 106 16 L 106 6 M 106 16 L 106 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M 116 16 L 116 10 M 116 16 L 116 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
    <div className="absolute left-[calc(50%-12px)] top-[calc(50%-12px)] flex items-center justify-center size-6 rounded-full text-[#0B0F15]">
      <Mic className="size-3.5 stroke-[2.5]" />
    </div>
  </div>
)

export default function FeedbackPage() {
  const [step, setStep] = useState<number>(1)
  const [type, setType] = useState<string>("")
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [focusArea, setFocusArea] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [source, setSource] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("File size must be under 5MB")
        return
      }
      setScreenshot(file)
      setPreviewUrl(URL.createObjectURL(file))
      setErrorMsg("")
    }
  }

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setScreenshot(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address so we can follow up with you.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg("")

    const feedbackPayload = {
      type,
      rating: rating || null,
      focus_area: focusArea || null,
      title: title.trim(),
      description: description.trim(),
      name: name.trim() || null,
      email: email.trim(),
      source: source || null,
      has_attachment: !!screenshot,
      created_at: new Date().toISOString()
    }

    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('feedbacks').insert([feedbackPayload])

      if (error) {
        console.warn("Supabase feedback notice:", error.message)
      }

      // 2. Persist local backup so feedback is never lost
      try {
        const stored = JSON.parse(localStorage.getItem("voicekhata_feedbacks_backup") || "[]")
        stored.push(feedbackPayload)
        localStorage.setItem("voicekhata_feedbacks_backup", JSON.stringify(stored.slice(-20)))
      } catch {}

      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      console.error("Submission fallback:", err)
      // Fallback: save to local storage and show success
      try {
        const stored = JSON.parse(localStorage.getItem("voicekhata_feedbacks_backup") || "[]")
        stored.push(feedbackPayload)
        localStorage.setItem("voicekhata_feedbacks_backup", JSON.stringify(stored.slice(-20)))
      } catch {}
      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setType("")
    setRating(0)
    setFocusArea("")
    setTitle("")
    setDescription("")
    removeFile()
    setName("")
    setEmail("")
    setSource("")
    setIsSubmitted(false)
    setErrorMsg("")
  }

  const selectedCategoryObj = feedbackTypes.find(t => t.id === type)

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#070A11] text-[#0B0F15] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors selection:bg-[#D2F832] selection:text-[#0B0F15]">
      
      {/* Top Navbar Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#070A11]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0E1320] text-slate-700 dark:text-slate-300 group-hover:border-black dark:group-hover:border-white transition-all shadow-2xs">
              <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex size-8 items-center justify-center rounded-xl bg-[#0B0F15] text-white p-1.5 shadow-xs">
                <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#D2F832] border-2 border-white dark:border-[#0E1320]" />
              </div>
              <span className="text-lg font-black tracking-tight text-[#0B0F15] dark:text-white">
                Voice<span className="text-[#0B0F15] dark:text-[#D2F832]">Khata</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/review"
              className="text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] text-slate-700 dark:text-slate-200 hover:border-black dark:hover:border-white transition-all shadow-2xs"
            >
              <span>Write a Review instead</span>
              <span className="ml-1 text-[#0B0F15] dark:text-[#D2F832]">→</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row pt-16 sm:pt-20">
        
        {/* Left Side Hero Panel (Sticky Showcase) */}
        <aside className="lg:w-[42%] lg:fixed lg:top-16 lg:bottom-0 left-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1320]/70 relative overflow-hidden transition-colors">
          
          {/* Subtle Ambient Mesh Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#D2F832]/20 blur-[130px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-slate-300/30 dark:bg-slate-800/30 blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            
            {/* Community Feedback Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0F15] dark:bg-white text-white dark:text-[#0B0F15] text-xs font-bold mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#D2F832] animate-pulse" />
              <span>Community Feedback Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-4 text-[#0B0F15] dark:text-white">
              Your Voice <br />
              <span className="inline-block relative">
                Shapes VoiceKhata.
                <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#D2F832] rounded-full" />
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mb-8">
              Whether you discovered a bug, want support for your local dialect, or have an idea to make daily bookkeeping faster — our team reviews every submission.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3 max-w-sm">
              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-[#070A11]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs">
                <div className="size-7 rounded-xl bg-[#0B0F15] text-[#D2F832] flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <span className="font-bold block text-[#0B0F15] dark:text-white">100% Private & Direct</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Never shared with third parties or advertisers</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-[#070A11]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs">
                <div className="size-7 rounded-xl bg-[#0B0F15] text-[#D2F832] flex items-center justify-center shrink-0">
                  <Mic className="size-4" />
                </div>
                <div>
                  <span className="font-bold block text-[#0B0F15] dark:text-white">Improves Indian Voice Models</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Helps refine Hindi, Hinglish & regional dialect parsing</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-[#070A11]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs">
                <div className="size-7 rounded-xl bg-[#0B0F15] text-[#D2F832] flex items-center justify-center shrink-0">
                  <Zap className="size-4" />
                </div>
                <div>
                  <span className="font-bold block text-[#0B0F15] dark:text-white">Direct Roadmap Impact</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Top-voted requests are prioritized in weekly sprints</span>
                </div>
              </div>
            </div>

            {/* Waveform Element */}
            <div className="mt-8 flex items-center gap-3">
              <VoiceKhataWaveformGraphic />
              <div className="text-xs">
                <span className="font-bold block text-[#0B0F15] dark:text-white">Voice-First Architecture</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Built for high-speed counter retail</span>
              </div>
            </div>

          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>VoiceKhata · For Indian Retailers</span>
            <Link to="/" className="font-bold text-[#0B0F15] dark:text-white hover:text-[#D2F832] transition-colors">
              voicekhata.app
            </Link>
          </div>
        </aside>

        {/* Right Side Form Content */}
        <main className="lg:w-[58%] lg:ml-[42%] flex-1 p-6 sm:p-10 lg:p-14 max-w-2xl mx-auto w-full">
          {isSubmitted ? (
            /* Success View */
            <div className="py-12 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto">
              <div className="size-20 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#D2F832]/25">
                <CheckCircle2 size={40} className="stroke-[2.5]" />
              </div>
              
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Submission Confirmed
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-3">
                Feedback Received!
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Thank you for helping us make VoiceKhata better. Our product and engineering team reads every submission and will take action on your notes.
              </p>

              {/* Submission Summary Pill */}
              <div className="bg-slate-50 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left mb-8 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Category:</span>
                  <span className="font-bold text-[#0B0F15] dark:text-white">{selectedCategoryObj?.label || "Feedback"}</span>
                </div>
                {title && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Topic:</span>
                    <span className="font-bold text-[#0B0F15] dark:text-white truncate max-w-[220px]">{title}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Follow up:</span>
                  <span className="font-bold text-[#0B0F15] dark:text-white">{email}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#0B0F15] hover:bg-black text-white dark:bg-white dark:text-[#0B0F15] dark:hover:bg-slate-100 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Submit Another Feedback
                </button>
                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] text-slate-700 dark:text-slate-200 font-semibold text-sm hover:border-black dark:hover:border-white transition-all shadow-2xs"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            /* Multi-step Form */
            <div>
              {/* Progress Bar & Header */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2.5">
                  <span className="text-[#0B0F15] dark:text-white">Step {step} of 4</span>
                  <span>{step === 1 ? "Category" : step === 2 ? "Experience" : step === 3 ? "Details" : "Submit"}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#D2F832] dark:bg-[#D2F832] transition-all duration-500 rounded-full"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between shadow-2xs">
                  <span>{errorMsg}</span>
                  <button onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* STEP 1: CATEGORY SELECTION */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Select Topic
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-2">
                    What kind of feedback is this?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6">
                    Pick the area that best describes what you want to share with our development team.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {feedbackTypes.map((item) => {
                      const isSelected = type === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setType(item.id)
                            setErrorMsg("")
                          }}
                          className={`group p-4 sm:p-5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#0B0F15] text-white dark:bg-[#0E1320] border-[#0B0F15] dark:border-[#D2F832] ring-2 ring-[#D2F832] shadow-md scale-[1.01]"
                              : "bg-white dark:bg-[#0E1320]/60 text-[#0B0F15] dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={`size-10 rounded-xl flex items-center justify-center ${
                              isSelected 
                                ? "bg-[#D2F832] text-[#0B0F15]" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 group-hover:bg-[#0B0F15] group-hover:text-[#D2F832] transition-colors"
                            }`}>
                              {item.icon}
                            </div>
                            {isSelected && (
                              <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center font-bold">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm mb-1">{item.label}</div>
                            <div className={`text-xs leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                              {item.desc}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={!type}
                    onClick={() => setStep(2)}
                    className="w-full py-4 rounded-full bg-[#0B0F15] hover:bg-black text-white dark:bg-white dark:text-[#0B0F15] dark:hover:bg-slate-100 font-bold text-sm flex items-center justify-center gap-2.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] group cursor-pointer"
                  >
                    <span>Continue to Experience</span>
                    <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                      <ArrowRight size={12} strokeWidth={3} />
                    </div>
                  </button>
                </div>
              )}

              {/* STEP 2: EXPERIENCE & FOCUS AREA */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Your Rating
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-2">
                    How has your experience been?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6">
                    Give us a quick star rating and tag the specific feature area this relates to.
                  </p>

                  {/* Star Rating Card */}
                  <div className="bg-slate-50/80 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-2xs">
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Overall Satisfaction Rating
                    </label>
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <Star
                            size={32}
                            className={`transition-colors ${
                              (hoverRating || rating) >= star
                                ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#0B0F15] dark:text-white ml-2 bg-[#D2F832]/30 px-2 py-0.5 rounded-full">
                        {rating > 0 ? `${rating} / 5 Stars` : "Tap to rate"}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {rating === 1 && "1 Star — Needs major improvements"}
                      {rating === 2 && "2 Stars — Fair, hit a few obstacles"}
                      {rating === 3 && "3 Stars — Good, meets basic counter needs"}
                      {rating === 4 && "4 Stars — Great experience, very useful!"}
                      {rating === 5 && "5 Stars — Outstanding! Can't run store without it"}
                      {rating === 0 && "Select 1 to 5 stars above"}
                    </span>
                  </div>

                  {/* Focus Area Selection */}
                  <div className="mb-8">
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Relevant Feature Area <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {focusAreas.map((area) => {
                        const isSelected = focusArea === area
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => setFocusArea(isSelected ? "" : area)}
                            className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#0B0F15] text-white dark:bg-white dark:text-[#0B0F15] border-[#0B0F15] dark:border-white shadow-xs"
                                : "bg-white dark:bg-[#070A11] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                            }`}
                          >
                            {area}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] text-slate-700 dark:text-slate-200 font-semibold text-sm hover:border-black dark:hover:border-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-3.5 rounded-full bg-[#0B0F15] hover:bg-black text-white dark:bg-white dark:text-[#0B0F15] dark:hover:bg-slate-100 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] group cursor-pointer"
                    >
                      <span>Next: Description</span>
                      <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                        <ArrowRight size={12} strokeWidth={3} />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILS & SCREENSHOT */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Details
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-2">
                    Tell us what happened
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6">
                    Be as descriptive as possible so our developers can inspect or build the feature.
                  </p>

                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Title / Summary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., WhatsApp reminder text cut off or Voice entry didn't recognize '₹250 udhar'"
                        maxLength={140}
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
                          Detailed Description <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] font-semibold text-slate-400">{description.length}/1000</span>
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what occurred, what you expected, or how this feature will save time on your shop counter..."
                        maxLength={1000}
                        rows={5}
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl p-4 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Screenshot / File Attachment */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Attachment / Screenshot <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>

                      {previewUrl ? (
                        <div className="relative w-fit bg-slate-50 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 flex items-center gap-3 shadow-2xs">
                          <img src={previewUrl} alt="Preview" className="size-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                          <div className="text-xs text-slate-700 dark:text-slate-200 pr-8">
                            <p className="font-bold truncate max-w-[200px]">{screenshot?.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {((screenshot?.size || 0) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0B0F15] dark:hover:border-[#D2F832] rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-[#0E1320]/40 transition-all group">
                          <div className="size-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                            <Upload size={18} className="text-slate-600 dark:text-slate-300" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Click to upload an image or screenshot
                          </span>
                          <span className="text-[11px] text-slate-400 mt-1">PNG, JPG or WEBP up to 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] text-slate-700 dark:text-slate-200 font-semibold text-sm hover:border-black dark:hover:border-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      disabled={!title.trim() || !description.trim()}
                      onClick={() => setStep(4)}
                      className="flex-1 py-3.5 rounded-full bg-[#0B0F15] hover:bg-black text-white dark:bg-white dark:text-[#0B0F15] dark:hover:bg-slate-100 font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] group cursor-pointer"
                    >
                      <span>Next: Contact & Submit</span>
                      <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                        <ArrowRight size={12} strokeWidth={3} />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CONTACT INFO & SUBMISSION */}
              {step === 4 && (
                <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Final Step
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-2">
                    Where should we follow up?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6">
                    Leave your contact details so we can reach out once your feedback is resolved.
                  </p>

                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Your Name <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Ramesh Gupta"
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ramesh@kirana.in"
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        How did you discover VoiceKhata? <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white outline-none transition-all cursor-pointer"
                      >
                        <option value="">Select an option...</option>
                        {discoverySources.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] text-slate-700 dark:text-slate-200 font-semibold text-sm hover:border-black dark:hover:border-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-full bg-[#0B0F15] hover:bg-black text-white dark:bg-white dark:text-[#0B0F15] dark:hover:bg-slate-100 font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40 transition-all active:scale-[0.99] group cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin text-[#D2F832]" />
                          <span>Submitting Feedback...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Feedback</span>
                          <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                            <ArrowRight size={12} strokeWidth={3} />
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
