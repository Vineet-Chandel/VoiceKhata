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
  UserCheck
} from "lucide-react"
import Logo from "@/components/ui/logo"
import { supabase } from "@/lib/supabase"
const personas = [
  "College Student",
  "Freelancer / Creator",
  "Working Professional",
  "Small Business Owner",
  "CA / Financial Analyst",
  "Other"
]

const favoriteFeatures = [
  "Voice Expense Logging (Natural Language)",
  "AI Financial Assistant & Savings Coach",
  "Automated Smart Budgeting & Cap Alerts",
  "Receipt Scanner (OCR Detection)",
  "Visual Spending Analytics & Reports",
  "Clean & Dark UI Design"
]

const sampleReviews = [
  {
    name: "Arjun Sharma",
    role: "Software Engineer, Bengaluru",
    rating: 5,
    text: "VoiceKhata completely changed how I log expenses. I just speak after UPI payments and it categorizes everything in 2 seconds."
  },
  {
    name: "Sneha Iyer",
    role: "Product Manager, Hyderabad",
    rating: 5,
    text: "The UI is breathtaking and the AI assistant actually helps me stick to my monthly dining out budget. Highly recommend!"
  },
  {
    name: "Vikram Singh",
    role: "Startup Founder, Gurgaon",
    rating: 5,
    text: "Running a startup means chaotic cashflow. VoiceKhata separates personal & business spends effortlessly."
  }
]

export default function ReviewPage() {
  const [step, setStep] = useState<number>(1)
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [headline, setHeadline] = useState<string>("")
  const [reviewText, setReviewText] = useState<string>("")
  const [persona, setPersona] = useState<string>("Working Professional")
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
      setErrorMsg("Please write a few words about your experience.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg("")

    try {
      const { error } = await supabase.from('reviews').insert([{
        rating,
        headline,
        review_text: reviewText,
        persona: persona || null,
        city: city || null,
        favorite_feature: favoriteFeature || null,
        allow_publish: allowPublish,
        display_name: displayName.trim() || "Anonymous User",
        email: email || null
      }]);

      if (error) {
        console.error("Supabase review error:", error);
        throw new Error(error.message);
      }

      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      setErrorMsg("Failed to submit review. " + (err.message || "Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setRating(5)
    setHeadline("")
    setReviewText("")
    setPersona("Working Professional")
    setCity("")
    setFavoriteFeature("Voice Expense Logging (Natural Language)")
    setAllowPublish(true)
    setDisplayName("")
    setEmail("")
    setIsSubmitted(false)
    setErrorMsg("")
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-700/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <ChevronLeft className="size-5 text-white/50 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            <Logo className="h-7" size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/feedback"
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-700/60 text-[#94A3B8] hover:text-[#F8FAFC] hover:border-blue-500/50 hover:bg-[#131B2E] transition-colors"
            >
              Report an issue / Feedback →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row pt-20">
        {/* Left Side Hero Showcase */}
        <aside className="lg:w-[42%] lg:fixed lg:top-20 lg:bottom-0 left-0 p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/40 bg-gradient-to-b from-[#131B2E] to-[#0B0F19] relative overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-xs font-medium text-blue-300 mb-6">
              <Star className="size-3 text-blue-400 fill-blue-400" />
              Community Reviews & Stories
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
              Write a Review <br />
              <span className="bg-gradient-to-r from-[#F8FAFC] via-blue-300 to-blue-500 bg-clip-text text-transparent">
                for VoiceKhata.
              </span>
            </h1>

            <p className="text-[#94A3B8] text-base leading-relaxed max-w-md mb-8">
              Share your honest thoughts, how VoiceKhata simplified your expenses, or what you enjoy most. Your review inspires young Indians to build healthy financial habits.
            </p>

            {/* Social Proof Card */}
            <div className="bg-[#0E1322] border border-slate-700/40 rounded-2xl p-5 mb-6 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 size-10 text-white/5 pointer-events-none" />
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="fill-amber-400" />
                ))}
                <span className="text-xs font-bold text-white ml-1.5">4.9 / 5.0</span>
              </div>
              <p className="text-xs text-white/70 italic leading-relaxed mb-3">
                "{sampleReviews[0].text}"
              </p>
              <div className="text-[11px] text-white/40">
                <span className="font-semibold text-white/80">{sampleReviews[0].name}</span> · {sampleReviews[0].role}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/40">
              <UserCheck size={14} className="text-emerald-400" />
              <span>Over 50,000+ active users across India</span>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-slate-700/40 flex items-center justify-between text-xs text-[#94A3B8]">
            <span>VoiceKhata · Personal Finance</span>
            <Link to="/" className="hover:text-white transition-colors">
              voicekhata.app
            </Link>
          </div>
        </aside>

        {/* Right Side Review Form */}
        <main className="lg:w-[58%] lg:ml-[42%] flex-1 p-6 sm:p-10 lg:p-16 max-w-3xl mx-auto w-full">
          {isSubmitted ? (
            /* Success View */
            <div className="py-16 text-center animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                <MessageSquareHeart size={42} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Review Submitted!</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Thank you for your review! Honest feedback from our community helps everyone manage their wealth with confidence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 active:scale-95 transition-all"
                >
                  Write Another Review
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
            /* Step-by-Step Review Form */
            <div>
              {/* Progress Bar & Header */}
              <div className="mb-10">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/40 font-semibold mb-2">
                  <span>Step {step} of 3</span>
                  <span>{step === 1 ? "Rating & Thoughts" : step === 2 ? "Persona & Highlights" : "Attribution & Publish"}</span>
                </div>
                <div className="w-full h-1.5 bg-[#0E1322] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* STEP 1: RATING & REVIEW BODY */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">How would you rate VoiceKhata?</h2>
                  <p className="text-white/50 text-sm mb-8">Select your star rating and give a short headline for your review.</p>

                  {/* 5-Star Selector */}
                  <div className="bg-[#131B2E] border border-slate-700/40 rounded-2xl p-6 mb-8 text-center sm:text-left">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/60 mb-3">
                      Your Overall Rating
                    </label>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
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
                            size={36}
                            className={`transition-colors ${
                              (hoverRating || rating) >= star
                                ? "text-blue-400 fill-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                                : "text-white/20"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-blue-300 font-semibold">
                      {rating === 5 && "★★★★★ — 5/5: Game changer for my finances"}
                      {rating === 4 && "★★★★☆ — 4/5: Really solid experience"}
                      {rating === 3 && "★★★☆☆ — 3/5: Good, has potential"}
                      {rating === 2 && "★★☆☆☆ — 2/5: Fair, needs fixes"}
                      {rating === 1 && "★☆☆☆☆ — 1/5: Not satisfied"}
                    </p>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Review Title / Headline <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g., The cleanest voice budgeting app I've used"
                        maxLength={100}
                        className="w-full bg-[#0B0F19] border border-slate-700/40 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-white/70">
                          Your Review Story <span className="text-amber-400">*</span>
                        </label>
                        <span className="text-[11px] text-white/30">{reviewText.length}/800</span>
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell others what you love about VoiceKhata, how it simplified your expense tracking, or how the AI financial assistant helped you..."
                        maxLength={800}
                        rows={5}
                        className="w-full bg-[#0B0F19] border border-slate-700/40 focus:border-blue-500 rounded-xl p-4 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!headline.trim() || !reviewText.trim()}
                    onClick={() => setStep(2)}
                    className="w-full py-4 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
                  >
                    Next: Context & Persona <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: PERSONA & FEATURE HIGHLIGHT */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">A bit about you</h2>
                  <p className="text-white/50 text-sm mb-8">This context helps other users like you understand how VoiceKhata fits their lifestyle.</p>

                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-3">
                        Who are you?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {personas.map((p) => {
                          const isSelected = persona === p
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPersona(p)}
                              className={`p-3 rounded-xl text-xs font-medium border text-center transition-all ${
                                isSelected
                                ? "bg-blue-600 text-white border-blue-500 font-bold"
                                : "bg-[#0E1322] text-[#94A3B8] border-slate-700/40 hover:border-blue-500/50 hover:text-[#F8FAFC]"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Your City / Region <span className="text-white/30 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., Bengaluru, Mumbai, Pune, Delhi..."
                        className="w-full bg-[#0B0F19] border border-slate-700/40 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Favorite VoiceKhata Feature
                      </label>
                      <select
                        value={favoriteFeature}
                        onChange={(e) => setFavoriteFeature(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-slate-700/40 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none transition-all"
                      >
                        {favoriteFeatures.map((f) => (
                          <option key={f} value={f} className="bg-[#0B0F19] text-white">
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
                      className="px-6 py-3.5 rounded-full border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-3.5 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-500 transition-all active:scale-[0.99]"
                    >
                      Next: Attribution & Publish <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ATTRIBUTION & PUBLISHING PREFERENCES */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Publishing Preferences</h2>
                  <p className="text-white/50 text-sm mb-8">Decide how your review appears on our website and community page.</p>

                  {/* Toggle Card */}
                  <div
                    onClick={() => setAllowPublish(!allowPublish)}
                    className="bg-[#131B2E] border border-slate-700/40 hover:border-blue-500/50 rounded-2xl p-5 mb-6 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-bold mb-1">Allow VoiceKhata to feature this review</h3>
                      <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                        Your review and attribution name may be showcased on our landing page and social channels.
                      </p>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                        allowPublish ? "bg-emerald-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          allowPublish ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Display Name / Attribution <span className="text-white/30 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g., Arjun Sharma, or leave blank for 'Anonymous User'"
                        className="w-full bg-[#0B0F19] border border-slate-700/40 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-2">
                        Your Email <span className="text-white/30 font-normal">(Private — never displayed publicly)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com (optional)"
                        className="w-full bg-[#0B0F19] border border-slate-700/40 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 outline-none transition-all"
                      />
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
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-40 transition-all active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Publishing Review...
                        </>
                      ) : (
                        <>
                          Publish Review
                          <CheckCircle2 size={18} />
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
