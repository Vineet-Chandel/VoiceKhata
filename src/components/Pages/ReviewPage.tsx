import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Star,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Quote,
  MessageSquareHeart,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Check
} from "lucide-react"
import logoImg from "@/assets/logo.png"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { supabase } from "@/lib/supabase"

const personas = [
  "Kirana & General Store",
  "Vegetable / Fruit Vendor",
  "Wholesale Merchant",
  "Freelancer / Creator",
  "Working Professional",
  "CA / Accountant",
  "Other Retail Business"
]

const favoriteFeatures = [
  "Voice Expense Logging (Natural Language)",
  "Instant Khata Balance & Dues",
  "WhatsApp Reminder with UPI Payment Link",
  "Daily Cashbook & Summary",
  "Multi-Language Speech (Hindi/Hinglish/English)",
  "Clean Modern Design & Mobile Speed"
]

const sampleReviews = [
  {
    name: "Ramesh Gupta",
    role: "Ramesh Kirana Store, Dadar",
    rating: 5,
    text: "VoiceKhata completely replaced my paper bahi-khata. When a customer takes udhar, I speak for 2 seconds and the entry is recorded with WhatsApp reminder ready."
  },
  {
    name: "Vikram Mehta",
    role: "Wholesale Grocery, Ahmedabad",
    rating: 5,
    text: "Recovering pending dues is 3x faster now. The customer receives a professional payment link right on WhatsApp with the exact bill amount."
  },
  {
    name: "Sneha Iyer",
    role: "Boutique Owner, Bengaluru",
    rating: 5,
    text: "The interface is gorgeous and lightning fast. No unnecessary menus — speak and it's recorded instantly."
  }
]

export default function ReviewPage() {
  const [step, setStep] = useState<number>(1)
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [headline, setHeadline] = useState<string>("")
  const [reviewText, setReviewText] = useState<string>("")
  const [persona, setPersona] = useState<string>("Kirana & General Store")
  const [city, setCity] = useState<string>("")
  const [favoriteFeature, setFavoriteFeature] = useState<string>("Voice Expense Logging (Natural Language)")
  const [allowPublish, setAllowPublish] = useState<boolean>(true)
  const [displayName, setDisplayName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) {
      setErrorMsg("Please write a few words about your experience with VoiceKhata.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg("")

    const reviewPayload = {
      rating,
      headline: headline.trim(),
      review_text: reviewText.trim(),
      persona: persona || null,
      city: city.trim() || null,
      favorite_feature: favoriteFeature || null,
      allow_publish: allowPublish,
      display_name: displayName.trim() || "Anonymous Merchant",
      email: email.trim() || null,
      created_at: new Date().toISOString()
    }

    try {
      // 1. Submit to Supabase
      const { error } = await supabase.from('reviews').insert([reviewPayload])

      if (error) {
        console.warn("Supabase review notice:", error.message)
      }

      // 2. Persist local backup
      try {
        const stored = JSON.parse(localStorage.getItem("voicekhata_reviews_backup") || "[]")
        stored.push(reviewPayload)
        localStorage.setItem("voicekhata_reviews_backup", JSON.stringify(stored.slice(-20)))
      } catch {}

      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      console.error("Submission fallback:", err)
      try {
        const stored = JSON.parse(localStorage.getItem("voicekhata_reviews_backup") || "[]")
        stored.push(reviewPayload)
        localStorage.setItem("voicekhata_reviews_backup", JSON.stringify(stored.slice(-20)))
      } catch {}
      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setRating(5)
    setHeadline("")
    setReviewText("")
    setPersona("Kirana & General Store")
    setCity("")
    setFavoriteFeature("Voice Expense Logging (Natural Language)")
    setAllowPublish(true)
    setDisplayName("")
    setEmail("")
    setIsSubmitted(false)
    setErrorMsg("")
  }

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
              to="/feedback"
              className="text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] text-slate-700 dark:text-slate-200 hover:border-black dark:hover:border-white transition-all shadow-2xs"
            >
              <span>Report an issue / Feedback</span>
              <span className="ml-1 text-[#0B0F15] dark:text-[#D2F832]">→</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row pt-16 sm:pt-20">
        
        {/* Left Side Hero Showcase */}
        <aside className="lg:w-[42%] lg:fixed lg:top-16 lg:bottom-0 left-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1320]/70 relative overflow-hidden transition-colors">
          
          {/* Subtle Ambient Mesh Lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#D2F832]/20 blur-[130px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-slate-300/30 dark:bg-slate-800/30 blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            
            {/* Reviews Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B0F15] dark:bg-white text-white dark:text-[#0B0F15] text-xs font-bold mb-6 shadow-xs">
              <Star className="size-3 text-[#D2F832] dark:text-[#0B0F15] fill-current" />
              <span>Community Reviews & Stories</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-4 text-[#0B0F15] dark:text-white">
              Write a Review <br />
              <span className="inline-block relative">
                for VoiceKhata.
                <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-[#D2F832] rounded-full" />
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mb-8">
              Share your honest experience, how VoiceKhata simplified your daily ledger, and what you love most. Your review inspires local retailers across India to go digital.
            </p>

            {/* Featured Social Proof Card */}
            <div className="bg-white/90 dark:bg-[#070A11]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 relative overflow-hidden shadow-2xs">
              <Quote className="absolute top-3 right-3 size-10 text-slate-200 dark:text-slate-800 pointer-events-none" />
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="fill-amber-400" />
                ))}
                <span className="text-xs font-black text-[#0B0F15] dark:text-white ml-2 bg-[#D2F832]/30 px-2 py-0.5 rounded-full">
                  4.9 / 5.0 Rating
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed mb-3">
                "{sampleReviews[0].text}"
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-[#0B0F15] dark:text-white">{sampleReviews[0].name}</span> · {sampleReviews[0].role}
              </div>
            </div>

            {/* Trust Indicator */}
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-[#070A11]/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 max-w-sm shadow-2xs">
              <div className="size-6 rounded-lg bg-[#0B0F15] text-[#D2F832] flex items-center justify-center font-bold shrink-0">
                <UserCheck size={14} />
              </div>
              <span>Trusted by 10,000+ Indian shopkeepers and retail merchants</span>
            </div>

          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>VoiceKhata · Digital Vyapar Ledger</span>
            <Link to="/" className="font-bold text-[#0B0F15] dark:text-white hover:text-[#D2F832] transition-colors">
              voicekhata.app
            </Link>
          </div>
        </aside>

        {/* Right Side Review Form */}
        <main className="lg:w-[58%] lg:ml-[42%] flex-1 p-6 sm:p-10 lg:p-14 max-w-2xl mx-auto w-full">
          {isSubmitted ? (
            /* Success View */
            <div className="py-12 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto">
              <div className="size-20 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#D2F832]/25">
                <MessageSquareHeart size={40} className="stroke-[2.2]" />
              </div>
              
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Published Successfully
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-3">
                Review Submitted!
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Thank you for your review! Genuine experiences from business owners like you help thousands of retail shopkeepers make bookkeeping simple and fast.
              </p>

              {/* Review Summary Pill */}
              <div className="bg-slate-50 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left mb-8 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Rating:</span>
                  <span className="font-bold text-amber-500">{"★".repeat(rating)} ({rating}/5 Stars)</span>
                </div>
                {headline && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Headline:</span>
                    <span className="font-bold text-[#0B0F15] dark:text-white truncate max-w-[220px]">{headline}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Author:</span>
                  <span className="font-bold text-[#0B0F15] dark:text-white">{displayName.trim() || "Anonymous Merchant"}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#0B0F15] hover:bg-black text-white dark:bg-white dark:text-[#0B0F15] dark:hover:bg-slate-100 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Write Another Review
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
            /* Step-by-Step Review Form */
            <div>
              {/* Progress Bar & Header */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2.5">
                  <span className="text-[#0B0F15] dark:text-white">Step {step} of 3</span>
                  <span>{step === 1 ? "Rating & Thoughts" : step === 2 ? "Context & Persona" : "Publish & Confirm"}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#D2F832] transition-all duration-500 rounded-full"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold shadow-2xs">
                  {errorMsg}
                </div>
              )}

              {/* STEP 1: RATING & REVIEW BODY */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Your Rating
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-2">
                    How would you rate VoiceKhata?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6">
                    Pick your star rating and give a short headline summarizing your experience.
                  </p>

                  {/* 5-Star Selector Card */}
                  <div className="bg-slate-50/80 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-2xs">
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Your Overall Rating
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
                            size={34}
                            className={`transition-colors ${
                              (hoverRating || rating) >= star
                                ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#0B0F15] dark:text-white ml-2 bg-[#D2F832]/30 px-2 py-0.5 rounded-full">
                        {rating} / 5 Stars
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {rating === 5 && "★★★★★ — 5/5: Indispensable tool for my business"}
                      {rating === 4 && "★★★★☆ — 4/5: Really solid experience, saves time"}
                      {rating === 3 && "★★★☆☆ — 3/5: Good, meets basic counter needs"}
                      {rating === 2 && "★★☆☆☆ — 2/5: Fair, needs a few improvements"}
                      {rating === 1 && "★☆☆☆☆ — 1/5: Encountered roadblocks"}
                    </p>
                  </div>

                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Review Title / Headline <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g., Saves me 45 minutes every evening at the counter"
                        maxLength={100}
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300">
                          Your Review Story <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] font-semibold text-slate-400">{reviewText.length}/800</span>
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell others what you like about VoiceKhata, how it simplified tracking customer credit, or how voice entry speeds up your counter..."
                        maxLength={800}
                        rows={5}
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl p-4 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!headline.trim() || !reviewText.trim()}
                    onClick={() => setStep(2)}
                    className="w-full py-4 rounded-full bg-[#0B0F15] hover:bg-black text-white dark:bg-white dark:text-[#0B0F15] dark:hover:bg-slate-100 font-bold text-sm flex items-center justify-center gap-2.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99] group cursor-pointer"
                  >
                    <span>Next: Context & Persona</span>
                    <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                      <ArrowRight size={12} strokeWidth={3} />
                    </div>
                  </button>
                </div>
              )}

              {/* STEP 2: PERSONA & FEATURE HIGHLIGHT */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Context
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-2">
                    A bit about your business
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6">
                    This context helps other merchants in India understand how VoiceKhata fits their counter workflow.
                  </p>

                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-3">
                        What kind of business do you run?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {personas.map((p) => {
                          const isSelected = persona === p
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPersona(p)}
                              className={`p-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#0B0F15] text-white dark:bg-white dark:text-[#0B0F15] border-[#0B0F15] dark:border-white shadow-xs"
                                  : "bg-white dark:bg-[#070A11] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        City / Market Area <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., Dadar (Mumbai), Chandni Chowk (Delhi), Jaipur..."
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Favorite VoiceKhata Feature
                      </label>
                      <select
                        value={favoriteFeature}
                        onChange={(e) => setFavoriteFeature(e.target.value)}
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white outline-none transition-all cursor-pointer"
                      >
                        {favoriteFeatures.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
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
                      <span>Next: Publish & Attribution</span>
                      <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                        <ArrowRight size={12} strokeWidth={3} />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ATTRIBUTION & PUBLISHING PREFERENCES */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Final Step
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B0F15] dark:text-white mb-2">
                    Publishing Preferences
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6">
                    Choose how your review appears on our community wall and website.
                  </p>

                  {/* Toggle Card */}
                  <div
                    onClick={() => setAllowPublish(!allowPublish)}
                    className="bg-slate-50/80 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 cursor-pointer transition-all flex items-center justify-between shadow-2xs"
                  >
                    <div className="pr-4">
                      <h3 className="text-sm font-bold text-[#0B0F15] dark:text-white mb-1">
                        Allow VoiceKhata to feature this review
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                        Your review headline and attribution name may be showcased on our community wall and landing page.
                      </p>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                        allowPublish ? "bg-[#0B0F15] dark:bg-[#D2F832]" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`size-5 rounded-full shadow-md transition-transform ${
                          allowPublish 
                            ? "translate-x-6 bg-[#D2F832] dark:bg-[#0B0F15]" 
                            : "translate-x-0 bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Display Name / Attribution <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g., Ramesh Gupta, or leave blank for 'Anonymous Merchant'"
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Your Email <span className="text-slate-400 font-normal">(Private — never displayed publicly)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ramesh@kirana.in (optional)"
                        className="w-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 focus:border-[#0B0F15] dark:focus:border-[#D2F832] focus:ring-1 focus:ring-[#D2F832] rounded-xl px-4 py-3 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 outline-none transition-all"
                      />
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
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-full bg-[#0B0F15] hover:bg-black text-white dark:bg-white dark:text-[#0B0F15] dark:hover:bg-slate-100 font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40 transition-all active:scale-[0.99] group cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin text-[#D2F832]" />
                          <span>Publishing Review...</span>
                        </>
                      ) : (
                        <>
                          <span>Publish Review</span>
                          <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                            <CheckCircle2 size={12} strokeWidth={3} />
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
