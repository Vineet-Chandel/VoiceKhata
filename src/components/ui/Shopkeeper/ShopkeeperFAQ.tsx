// src/components/ui/Shopkeeper/ShopkeeperFAQ.tsx
import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

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
    <section id="faqs" className="py-16 sm:py-20 bg-[#0F172A] border-b border-[#334155]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#818CF8] bg-[#1E293B] border border-[#5C6BC0]/30 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            Clear answers about voice recording, privacy, and khata management.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-[10px] border border-[#334155] bg-[#1E293B] overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-4.5 text-left text-xs sm:text-sm font-semibold text-[#F8FAFC] hover:text-[#818CF8] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="size-4 text-[#818CF8] shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`size-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? "rotate-180 text-[#818CF8]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[#334155] p-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed bg-[#0F172A]">
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
