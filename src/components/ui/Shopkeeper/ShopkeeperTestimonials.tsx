// src/components/ui/Shopkeeper/ShopkeeperTestimonials.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Star, CheckCircle2, MessageSquareHeart, MessageSquareText, ArrowRight, Quote } from "lucide-react";

export function ShopkeeperTestimonials() {
  const reviews = [
    {
      name: "Rakesh Gupta",
      shop: "Gupta Kirana & Provisions",
      city: "Kanpur, Uttar Pradesh",
      quote:
        "During evening rush hours with 10 customers standing at the counter, writing in a physical diary was impossible. Now I simply speak into my phone — not a single rupee of credit gets missed!",
      savings: "Saved ₹8,000+ in missed credit every month",
      rating: 5
    },
    {
      name: "Sanjay Patel",
      shop: "Patel Hardware & Sanitary Ware",
      city: "Ahmedabad, Gujarat",
      quote:
        "Calling contractors repeatedly to ask for payment felt embarrassing. With VoiceKhata, an automated WhatsApp reminder with a direct UPI payment link goes out in one click. Dues clear within 3 days!",
      savings: "3x faster customer payment recovery",
      rating: 5
    },
    {
      name: "Dr. Anees Ahmed",
      shop: "New Life Medical & Chemist",
      city: "Lucknow, Uttar Pradesh",
      quote:
        "While dispensing medicines, my hands are often sanitized or occupied. Typing on a phone screen was too tedious. Speaking the ledger entry is the most natural innovation for counter retail.",
      savings: "Saves 45 minutes of daily ledger balancing",
      rating: 5
    }
  ];

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-slate-50/60 dark:bg-[#070A11] transition-colors border-t border-slate-200/80 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Real Merchant Stories
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
            How Retailers Transformed Their Daily Cash Flow
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Hear directly from small business owners using VoiceKhata across India.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-[26px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] p-7 sm:p-8 shadow-xs hover:shadow-xl transition-all"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-[#0B0F15] dark:text-white ml-1.5">5.0</span>
                  </div>
                  <Quote className="size-6 text-slate-200 dark:text-slate-700" />
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal mb-6">
                  "{rev.quote}"
                </p>
              </div>

              {/* Merchant Details & Savings */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-[#0B0F15] dark:text-white flex items-center gap-1.5">
                    {rev.name}
                    <CheckCircle2 className="size-3.5 text-emerald-500 fill-emerald-500/20" />
                  </h4>
                  <p className="text-xs text-slate-500">{rev.shop}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{rev.city}</p>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200/80 dark:border-slate-800 p-2.5 text-center text-xs font-bold text-[#0B0F15] dark:text-[#D2F832]">
                  ✨ {rev.savings}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback & Review Community Links */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link
            to="/review"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-black dark:hover:border-white font-semibold transition-all shadow-2xs"
          >
            <MessageSquareHeart className="size-4 text-rose-500" />
            <span>Write a Merchant Review</span>
          </Link>
          <Link
            to="/feedback"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-black dark:hover:border-white font-semibold transition-all shadow-2xs"
          >
            <MessageSquareText className="size-4 text-[#0B0F15] dark:text-[#D2F832]" />
            <span>Share Product Feedback</span>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperTestimonials;
