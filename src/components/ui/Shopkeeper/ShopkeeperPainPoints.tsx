// src/components/ui/Shopkeeper/ShopkeeperPainPoints.tsx
import React from "react";
import { 
  X, 
  Check, 
  Zap, 
  Globe2, 
  MessageSquare, 
  WifiOff, 
  Clock, 
  ShieldCheck 
} from "lucide-react";

export function ShopkeeperPainPoints() {
  const comparisonItems = [
    {
      pain: "During rush hours with customers waiting, you have no time to write in a paper diary — transactions get missed.",
      solution: "Log in 3 seconds flat: Just say 'Ramesh ne ₹200 diye'. Your ledger updates in front of the customer without touching a pen.",
      icon: <Clock className="size-4 text-[#3949AB]" />,
      tag: "Rush Hour Speed"
    },
    {
      pain: "Searching customer names on small phone keyboards is slow, clumsy, and frustrating with shop-dusted hands.",
      solution: "Zero Typing! Just speak the customer name and amount. VoiceKhata matches the account and logs the entry.",
      icon: <Zap className="size-4 text-[#3949AB]" />,
      tag: "Zero Typing"
    },
    {
      pain: "Calling customers repeatedly to collect pending credit feels awkward and risks damaging personal relationships.",
      solution: "Automated polite WhatsApp payment reminders with direct UPI links (GPay, PhonePe, Paytm).",
      icon: <MessageSquare className="size-4 text-[#16856A]" />,
      tag: "WhatsApp Collection"
    },
    {
      pain: "Physical red paper bahi-khata books get torn, water-damaged, or lost, causing unrecoverable losses.",
      solution: "100% automated secure cloud backup. Switch or lose your phone, your entire ledger is restored in 60 seconds.",
      icon: <ShieldCheck className="size-4 text-[#3949AB]" />,
      tag: "Bank-Grade Backup"
    },
    {
      pain: "Poor mobile network or internet blackouts freeze conventional accounting apps.",
      solution: "Offline-first capability: Keep speaking and recording entries even without internet. Everything auto-syncs when online.",
      icon: <WifiOff className="size-4 text-[#3949AB]" />,
      tag: "Works Offline"
    },
    {
      pain: "Complicated English financial apps are confusing to operate and don't understand Indian accent nuances.",
      solution: "Engineered specifically for Indian English, Hinglish, and retail speech patterns. Speaks and understands like you do.",
      icon: <Globe2 className="size-4 text-[#3949AB]" />,
      tag: "Natural Dialects"
    }
  ];

  return (
    <section id="benefits" className="py-16 sm:py-20 bg-[#07090E] border-b border-[#1E2638]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#818CF8] bg-[#1E2337] border border-[#5C6BC0]/30 px-3 py-1 rounded-full">
            Why VoiceKhata
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-[#F1F5F9] tracking-tight">
            Say Goodbye to Slow Paper Diaries & Manual Typing
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            See why modern shopkeepers and business owners are switching from manual notebooks to hands-free voice accounting.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Old Way Column */}
          <div className="rounded-[12px] border border-[#1E2638] bg-[#0F131C] p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#1E2638] pb-4">
              <div className="flex size-9 items-center justify-center rounded-[8px] bg-[#7F1D1D]/30 text-[#F87171]">
                <X className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9]">The Old Way: Paper Registers & Clunky Apps</h3>
                <p className="text-xs text-[#64748B]">Time wasted, missed credit, awkward collection calls</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-[#94A3B8]">
                  <span className="text-[#F87171] font-bold text-sm shrink-0">✕</span>
                  <p className="leading-relaxed">{item.pain}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Way Column */}
          <div className="rounded-[12px] border border-[#5C6BC0]/40 bg-[#0F131C] p-6 sm:p-7 space-y-5 shadow-xs relative">
            <div className="flex items-center gap-3 border-b border-[#1E2638] pb-4">
              <div className="flex size-9 items-center justify-center rounded-[8px] bg-[#1E2337] text-[#818CF8]">
                <Check className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9]">The VoiceKhata Way: Speak & Settle</h3>
                <p className="text-xs text-[#34D399] font-medium">Fast, verified by voice, polite automated collections</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-[#F1F5F9]">
                  <span className="text-[#34D399] font-bold text-sm shrink-0">✓</span>
                  <p className="leading-relaxed">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ShopkeeperPainPoints;
