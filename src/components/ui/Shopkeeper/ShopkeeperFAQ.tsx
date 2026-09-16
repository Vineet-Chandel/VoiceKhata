// src/components/ui/Shopkeeper/ShopkeeperFAQ.tsx
import React, { useState } from "react";
import { ChevronDown, HelpCircle, Plus, Minus } from "lucide-react";

export function ShopkeeperFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does VoiceKhata understand Indian accents and Hinglish?",
      a: "Yes. Our speech parser is trained on real Indian retail phrasing. Whether you say 'Ramesh ne ₹1,200 UPI se diye' or 'Received 1200 rupees from Ramesh', it extracts the party, amount, and payment method accurately."
    },
    {
      q: "Does VoiceKhata verify with me before saving transactions?",
      a: "Always. Every spoken phrase is presented in a clear review card ('I understood: Person, Amount, Method, Date'). You can confirm or adjust details before anything is written to your ledger. Plus, a 6-second undo button is provided for peace of mind."
    },
    {
      q: "How does the WhatsApp payment reminder work?",
      a: "Instead of making awkward collection phone calls, VoiceKhata creates a polite payment summary with direct UPI links (PhonePe, Google Pay, Paytm). Customers can settle in one click from their phones."
    },
    {
      q: "Can I use VoiceKhata on both my phone and desktop?",
      a: "Yes. VoiceKhata is fully responsive. Open it on your phone's browser for quick counter entries, and log into your desktop for weekly reports, supplier reconciliations, and cashflow analysis."
    },
    {
      q: "What happens if I change or lose my phone?",
      a: "All your data is securely stored and encrypted in the cloud. Simply log in with your email or Google account on any device, and your entire digital ledger is restored immediately."
    }
  ];

  return (
    <section id="faqs" className="py-16 sm:py-24 bg-slate-50/60 dark:bg-[#070A11] transition-colors border-t border-slate-200/80 dark:border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Clear answers about voice recording, privacy, and khata management.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-[20px] border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E1320] shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0E1320]/70 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 sm:p-6 text-left text-sm sm:text-base font-bold text-[#0B0F15] dark:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3 pr-4">
                    <span className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-500 shrink-0">
                      0{idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <div className={`size-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? "bg-[#D2F832] text-[#0B0F15]" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {isOpen ? <Minus className="size-4 stroke-[2.5]" /> : <Plus className="size-4 stroke-[2.5]" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-14">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperFAQ;
