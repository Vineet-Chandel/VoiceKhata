import React from "react";
import { Link } from "react-router-dom";
import { Star, CheckCircle2, MessageSquareHeart, MessageSquareText, ArrowRight } from "lucide-react";

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
    <section id="reviews" className="py-16 sm:py-20 bg-[#0B0F19] border-b border-slate-700/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
            Real Merchant Stories
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            How Retailers Transformed Their Daily Cash Flow
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            Hear directly from small business owners using VoiceKhata across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-[16px] border border-slate-700/40 bg-[#131B2E] p-6 sm:p-7 shadow-sm hover:border-blue-500/50 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300"
            >
              <div>
                {/* Rating indicators / Stars aligned cleanly with dark theme aesthetic */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400 drop-shadow-xs" />
                  ))}
                  <span className="text-xs font-semibold text-[#F8FAFC] ml-1.5">5.0</span>
                </div>

                {/* High-contrast slate gray subtext (#94A3B8) for reviewer feedback body */}
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              <div className="border-t border-slate-700/40 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    {/* Crisp white user names */}
                    <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-1.5">
                      {rev.name}
                      <CheckCircle2 className="size-3.5 text-[#34D399]" />
                    </h4>
                    <p className="text-xs text-[#94A3B8]">{rev.shop}</p>
                    <p className="text-[11px] text-blue-400 font-medium">{rev.city}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-[10px] bg-[#0B0F19] border border-blue-500/30 p-2 text-center text-[11px] font-semibold text-blue-300">
                  ✨ {rev.savings}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback & Review Community Links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link
            to="/review"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#131B2E] border border-slate-800 text-[#F8FAFC] hover:border-blue-500/60 hover:text-blue-400 transition-all shadow-xs"
          >
            <MessageSquareHeart className="size-3.5 text-blue-400" />
            <span>Share Your Merchant Review</span>
            <ArrowRight className="size-3" />
          </Link>
          <Link
            to="/feedback"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#131B2E] border border-slate-800 text-[#94A3B8] hover:border-slate-700 hover:text-[#F8FAFC] transition-all shadow-xs"
          >
            <MessageSquareText className="size-3.5 text-[#94A3B8]" />
            <span>Submit Feature Request / Feedback</span>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperTestimonials;

