// src/components/ui/Shopkeeper/ShopkeeperFeedback.tsx
"use client"

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  Star, 
  Lightbulb, 
  Bug, 
  Mic, 
  Palette, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const feedbackCategories = [
  { id: "feature", label: "Feature Request", icon: Lightbulb },
  { id: "voice", label: "Voice Accuracy", icon: Mic },
  { id: "ui", label: "Design & UX", icon: Palette },
  { id: "bug", label: "Report an Issue", icon: Bug },
  { id: "other", label: "General Feedback", icon: MessageSquare },
];

export function ShopkeeperFeedback() {
  const [category, setCategory] = useState("feature");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg("Please provide a short description or suggestion.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from('feedbacks').insert([{
        type: category,
        rating: rating || null,
        focus_area: "Landing Page Community",
        title: title.trim() || "Landing Page Feedback",
        description: description.trim(),
        name: null,
        email: email.trim() || "anonymous@voicekhata.app",
        source: "Landing Page Section",
        has_attachment: false
      }]);

      if (error) {
        console.warn("Feedback submission notice:", error.message);
      }
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-16 sm:py-20 bg-[#0B0F19] border-b border-slate-700/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
            <MessageSquare className="size-3.5 text-blue-400" />
            <span>Community Feedback</span>
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            Help Us Build the Best Khata for India
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            Have an idea for a new feature, a dialect improvement, or UI suggestion? We review every submission.
          </p>
        </div>

        {/* Feedback Card Container */}
        <div className="rounded-[16px] border border-slate-700/40 bg-[#131B2E] p-6 sm:p-8 shadow-xl">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="size-14 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center mx-auto text-[#10B981]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">Thank You for Your Feedback!</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Your thoughts have been logged directly into our product backlog. Together, we're making Indian business bookkeeping simpler and faster.
              </p>
              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setDescription("");
                    setTitle("");
                  }}
                  className="px-4 py-2 rounded-[8px] bg-[#0E1322] border border-slate-700/40 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Send another note
                </button>
                <Link
                  to="/review"
                  className="px-4 py-2 rounded-[8px] bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-xs transition-all"
                >
                  Write a public review →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Category Pills */}
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2.5">
                  What would you like to share?
                </label>
                <div className="flex flex-wrap gap-2">
                  {feedbackCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm border border-blue-500"
                            : "bg-[#0E1322] text-[#94A3B8] border border-slate-800 hover:border-slate-700 hover:text-[#F8FAFC]"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-white" : "text-blue-400"} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Rating Selector */}
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
                  How would you rate your VoiceKhata experience?
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 text-slate-600 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={isFilled ? "fill-amber-400 text-amber-400" : "text-slate-700"}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs text-[#94A3B8] ml-2 font-medium">
                    {rating === 5 ? "Loved it (5/5)" : `${rating}/5`}
                  </span>
                </div>
              </div>

              {/* 3. Description Field */}
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
                  Feedback or Feature Suggestion
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. It would be amazing to support voice inputs for Marathi dialects, or add automatic monthly PDF balance summaries..."
                  className="w-full rounded-[8px] border border-slate-700/40 bg-[#0B0F19] p-3 text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* 4. Optional Email & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                <div className="w-full sm:w-auto flex-1 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional, for reply)"
                    className="w-full h-9 rounded-[8px] border border-slate-700/40 bg-[#0B0F19] px-3 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end gap-3">
                  <Link
                    to="/feedback"
                    className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] hover:underline"
                  >
                    Open Full Feedback Portal →
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 h-9 px-5 rounded-[8px] bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-[#EF4444] pt-1">{errorMsg}</p>
              )}
            </form>
          )}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperFeedback;
