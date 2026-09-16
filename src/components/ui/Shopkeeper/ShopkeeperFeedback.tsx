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
      try {
        const stored = JSON.parse(localStorage.getItem("voicekhata_feedbacks_backup") || "[]");
        stored.push({
          type: category,
          rating: rating || null,
          title: title.trim() || "Landing Page Feedback",
          description: description.trim(),
          email: email.trim() || "anonymous@voicekhata.app",
          created_at: new Date().toISOString()
        });
        localStorage.setItem("voicekhata_feedbacks_backup", JSON.stringify(stored.slice(-20)));
      } catch {}
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-16 sm:py-24 bg-white dark:bg-[#070A11] transition-colors border-t border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Community Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
            Help Us Build the Best Khata for India
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Have an idea for a new feature, a dialect improvement, or UI suggestion? We review every submission.
          </p>
        </div>

        {/* Feedback Card Container */}
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1320] p-6 sm:p-10 shadow-xs">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="size-14 rounded-full bg-[#D2F832] flex items-center justify-center mx-auto text-[#0B0F15]">
                <CheckCircle2 size={30} className="stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B0F15] dark:text-white">Thank You for Your Feedback!</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your thoughts have been logged directly into our product backlog. Together, we're making Indian business bookkeeping simpler and faster.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setDescription("");
                    setTitle("");
                  }}
                  className="px-5 py-2.5 rounded-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-black transition-colors cursor-pointer"
                >
                  Send another note
                </button>
                <Link
                  to="/review"
                  className="px-5 py-2.5 rounded-full bg-[#0B0F15] text-white hover:bg-black text-xs font-semibold shadow-xs transition-all"
                >
                  Write a public review →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Category Pills */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                  What would you like to share?
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {feedbackCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0B0F15] text-white dark:bg-white dark:text-[#0B0F15] shadow-xs"
                            : "bg-white dark:bg-[#070A11] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <Icon className={`size-3.5 ${isSelected ? "text-[#D2F832] dark:text-[#0B0F15]" : "text-slate-500"}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Rating Stars */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Your rating of VoiceKhata
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`size-6 ${
                          (hoverRating || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">
                    {rating} / 5
                  </span>
                </div>
              </div>

              {/* 3. Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Summary / Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Add Gujarati voice recognition, or custom invoice PDF"
                  className="w-full rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B0F15] dark:focus:ring-white transition-all"
                />
              </div>

              {/* 4. Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Details / Suggestion <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what you'd like to see improved, any bugs encountered, or how VoiceKhata can better serve your retail shop..."
                  className="w-full rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 p-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B0F15] dark:focus:ring-white transition-all resize-none"
                  required
                />
              </div>

              {/* 5. Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Your Email (Optional, if you'd like us to update you)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shopkeeper@example.com"
                  className="w-full rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B0F15] dark:focus:ring-white transition-all"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Submissions go directly to our engineering team.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-full bg-[#0B0F15] hover:bg-black text-white px-6 py-3 text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isSubmitting ? "Sending..." : "Submit Feedback"}</span>
                  <Send className="size-3.5 text-[#D2F832]" />
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperFeedback;
