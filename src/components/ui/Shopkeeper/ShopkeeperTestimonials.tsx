import React from "react";
import { Star, CheckCircle2 } from "lucide-react";

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
    <section id="reviews" className="py-14 sm:py-20 bg-[#070709]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Real Merchant Stories
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black text-white tracking-tight">
            How Retailers Transformed Their Daily Cash Flow
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Hear directly from small business owners using VoiceKhata across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/50 p-6 sm:p-8 hover:border-indigo-500/40 transition-colors"
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {rev.name}
                      <CheckCircle2 className="size-3.5 text-cyan-400" />
                    </h4>
                    <p className="text-xs text-neutral-400">{rev.shop}</p>
                    <p className="text-[11px] text-indigo-400 font-medium">{rev.city}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-indigo-950/40 border border-indigo-800/30 p-2 text-center text-[11px] font-bold text-cyan-300">
                  ✨ {rev.savings}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperTestimonials;
