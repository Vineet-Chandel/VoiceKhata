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
  ChevronLeft
} from "lucide-react"
import Logo from "@/components/ui/Navbar/logo"

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
    desc: "Something is broken or not working as expected",
    icon: <Bug size={24} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "feature",
    label: "Feature Request",
    desc: "A new idea to track or manage money better",
    icon: <Lightbulb size={24} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "voice",
    label: "Voice & AI Accuracy",
    desc: "Voice transcription, speech recognition, or AI advice",
    icon: <Mic size={24} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "ui",
    label: "UX & Visual Design",
    desc: "Layout, theme aesthetics, navigation, or mobile feel",
    icon: <Palette size={24} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "performance",
    label: "Speed & Performance",
    desc: "Slow loading, receipt scanning speed, or app responsiveness",
    icon: <Zap size={24} className="transition-transform duration-300 group-hover:scale-110" />
  },
  {
    id: "other",
    label: "General Thoughts",
    desc: "Questions, feedback, or appreciation for the team",
    icon: <MessageSquare size={24} className="transition-transform duration-300 group-hover:scale-110" />
  }
]

const focusAreas = [
  "Voice Expense Logging",
  "AI Financial Assistant",
  "Smart Budgeting",
  "Receipt Scanner (OCR)",
  "Reports & Charts",
  "Overall Experience"
]

const discoverySources = [
  "Google / Search Engine",
  "College / University Campus",
  "Friend or Colleague Recommendation",
  "Twitter / X",
  "LinkedIn",
  "GitHub",
  "Other"
]

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

    try {
      // Store submission in localStorage for persistence
      const feedbackEntry = {
        id: "fb_" + Date.now(),
        type,
        rating,
        focusArea,
        title,
        description,
        hasAttachment: !!screenshot,
        name,
        email,
        source,
        createdAt: new Date().toISOString()
      }
      const existing = JSON.parse(localStorage.getItem("voicekhata_feedbacks") || "[]")
      existing.unshift(feedbackEntry)
      localStorage.setItem("voicekhata_feedbacks", JSON.stringify(existing))

      // Simulate smooth network dispatch
      await new Promise((r) => setTimeout(r, 900))
      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setErrorMsg("Failed to submit feedback. Please try again.")
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

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Top Navbar Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <ChevronLeft className="size-5 text-white/50 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            <Logo className="h-7" size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/review"
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors"
            >
              Write a Review instead →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row pt-20">
        {/* Left Side Hero Panel (Sticky Showcase) */}
        <aside className="lg:w-[42%] lg:fixed lg:top-20 lg:bottom-0 left-0 p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-b from-[#0a0a0a] to-[#050505] relative overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Community Feedback Portal
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
              Your Voice <br />
              <span className="bg-gradient-to-r from-white via-white/90 to-white/40 bg-clip-text text-transparent">
                Shapes VoiceKhata.
              </span>
            </h1>

            <p className="text-white/50 text-base leading-relaxed max-w-md mb-8">
              Whether you discovered a small bug, have an idea for automated voice budgeting, or want to suggest an improvement — our engineering team reads every submission directly.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3.5 max-w-sm">
              <div className="flex items-center gap-3 text-xs text-white/70 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                <span>100% Private — never shared with third parties</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/70 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                <Mic className="size-4 text-blue-400 shrink-0" />
                <span>Helps train better Indian-accent voice models</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/70 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                <Zap className="size-4 text-amber-400 shrink-0" />
                <span>Direct influence on upcoming roadmap releases</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
            <span>VoiceKhata Technologies</span>
            <Link to="/" className="hover:text-white transition-colors">
              voicekhata.app
            </Link>
          </div>
        </aside>

        {/* Right Side Form Content */}
        <main className="lg:w-[58%] lg:ml-[42%] flex-1 p-6 sm:p-10 lg:p-16 max-w-3xl mx-auto w-full">
          {isSubmitted ? (
            /* Success View */
            <div className="py-16 text-center animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={42} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Feedback Received!</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Thank you for taking the time to help improve VoiceKhata. We have logged your submission and our team will review it shortly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all"
                >
                  Submit Another Feedback
                </button>
                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            /* Multi-step Form */
            <div>
              {/* Progress Bar & Header */}
              <div className="mb-10">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/40 font-semibold mb-2">
                  <span>Step {step} of 4</span>
                  <span>{step === 1 ? "Category" : step === 2 ? "Experience" : step === 3 ? "Details" : "Submit"}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500 rounded-full"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
                  <span>{errorMsg}</span>
                  <button onClick={() => setErrorMsg("")} className="text-rose-400 hover:text-rose-200">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* STEP 1: CATEGORY SELECTION */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">What kind of feedback is this?</h2>
                  <p className="text-white/50 text-sm mb-8">Select the category that best matches your thought or report.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
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
                          className={`group p-5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.01]"
                              : "bg-[#0f0f11] text-white border-white/5 hover:border-white/20 hover:bg-[#141418]"
                          }`}
                        >
                          <div className={`mb-4 ${isSelected ? "text-black" : "text-white/70"}`}>
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-bold text-sm mb-1">{item.label}</div>
                            <div className={`text-xs leading-relaxed ${isSelected ? "text-black/70" : "text-white/40"}`}>
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
                    className="w-full py-4 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                  >
                    Continue to Experience
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: EXPERIENCE & FOCUS AREA */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">How has your experience been?</h2>
                  <p className="text-white/50 text-sm mb-8">Give us a quick rating and select which area this relates to.</p>

                  {/* Star Rating */}
                  <div className="bg-[#0f0f11] border border-white/5 rounded-2xl p-6 mb-8">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-4">
                      Overall Satisfaction
                    </label>
                    <div className="flex items-center gap-3 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            size={32}
                            className={`transition-colors ${
                              (hoverRating || rating) >= star
                                ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                : "text-white/20"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-white/50 font-medium">
                      {rating === 1 && "1 Star — Needs major improvements"}
                      {rating === 2 && "2 Stars — Fair, hit a few hurdles"}
                      {rating === 3 && "3 Stars — Good, meets expectations"}
                      {rating === 4 && "4 Stars — Great experience!"}
                      {rating === 5 && "5 Stars — Absolutely love VoiceKhata! ❤️"}
                      {rating === 0 && "Click to select 1 to 5 stars"}
                    </span>
                  </div>

                  {/* Focus Area Selection */}
                  <div className="mb-8">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-3">
                      Relevant Feature Area (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {focusAreas.map((area) => {
                        const isSelected = focusArea === area
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => setFocusArea(isSelected ? "" : area)}
                            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-white text-black border-white"
                                : "bg-[#0f0f11] text-white/70 border-white/10 hover:border-white/30 hover:text-white"
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
                      className="px-6 py-3.5 rounded-full border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-3.5 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-[0.99]"
                    >
                      Next: Description <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILS & SCREENSHOT */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Tell us the details</h2>
                  <p className="text-white/50 text-sm mb-8">Be as specific as possible so our developers can replicate or build it.</p>

                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Title / Summary <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Voice recording failed on Chrome mobile or Add monthly budget rollover"
                        maxLength={140}
                        className="w-full bg-[#0f0f11] border border-white/10 focus:border-white/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-white/70">
                          Description <span className="text-emerald-400">*</span>
                        </label>
                        <span className="text-[11px] text-white/30">{description.length}/1000</span>
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explain what happened, what you expected, or why this feature would help your workflow..."
                        maxLength={1000}
                        rows={5}
                        className="w-full bg-[#0f0f11] border border-white/10 focus:border-white/40 rounded-xl p-4 text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Screenshot / File Attachment */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Attachment / Screenshot <span className="text-white/30 font-normal">(Optional)</span>
                      </label>

                      {previewUrl ? (
                        <div className="relative w-fit bg-[#0f0f11] border border-white/15 rounded-xl p-2 flex items-center gap-3">
                          <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                          <div className="text-xs text-white/70 pr-6">
                            <p className="font-semibold truncate max-w-[200px]">{screenshot?.name}</p>
                            <p className="text-[10px] text-white/40">
                              {((screenshot?.size || 0) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute top-2 right-2 text-white/40 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/20 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 hover:border-white/30 rounded-xl cursor-pointer bg-[#0f0f11]/50 hover:bg-[#0f0f11] transition-all group">
                          <Upload size={22} className="text-white/40 group-hover:text-white mb-2 transition-colors" />
                          <span className="text-xs text-white/60 group-hover:text-white font-medium transition-colors">
                            Click to upload an image or screenshot
                          </span>
                          <span className="text-[10px] text-white/30 mt-1">PNG, JPG or WEBP up to 5MB</span>
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
                      className="px-6 py-3.5 rounded-full border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      disabled={!title.trim() || !description.trim()}
                      onClick={() => setStep(4)}
                      className="flex-1 py-3.5 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                    >
                      Next: Contact & Submit <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CONTACT INFO & SUBMISSION */}
              {step === 4 && (
                <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Where should we follow up?</h2>
                  <p className="text-white/50 text-sm mb-8">Leave your details so we can notify you once your feedback is addressed.</p>

                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Your Name <span className="text-white/30 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Arjun Sharma"
                        className="w-full bg-[#0f0f11] border border-white/10 focus:border-white/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Email Address <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-[#0f0f11] border border-white/10 focus:border-white/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        How did you discover VoiceKhata? <span className="text-white/30 font-normal">(Optional)</span>
                      </label>
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full bg-[#0f0f11] border border-white/10 focus:border-white/40 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                      >
                        <option value="" className="bg-black text-white/50">Select an option...</option>
                        {discoverySources.map((s) => (
                          <option key={s} value={s} className="bg-black text-white">
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
                      className="px-6 py-3.5 rounded-full border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-40 transition-all active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Submitting Feedback...
                        </>
                      ) : (
                        <>
                          Submit Feedback
                          <ArrowRight size={18} />
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
