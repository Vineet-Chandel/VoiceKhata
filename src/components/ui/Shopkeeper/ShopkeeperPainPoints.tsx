// src/components/ui/Shopkeeper/ShopkeeperPainPoints.tsx
import React from "react";
import { 
  X, 
  Check, 
  Zap, 
  Globe2, 
  WifiOff, 
  Clock, 
  ShieldCheck 
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export function ShopkeeperPainPoints() {
  const comparisonItems = [
    {
      pain: "During rush hours with customers waiting, you have no time to write in a paper diary — transactions get missed.",
      solution: "Log in 3 seconds flat: Just say 'Ramesh ne ₹200 diye'. Your ledger updates in front of the customer without touching a pen.",
      icon: <Clock className="size-4 text-blue-400" />,
      tag: "Rush Hour Speed"
    },
    {
      pain: "Searching customer names on small phone keyboards is slow, clumsy, and frustrating with shop-dusted hands.",
      solution: "Zero Typing! Just speak the customer name and amount. VoiceKhata matches the account and logs the entry.",
      icon: <Zap className="size-4 text-blue-400" />,
      tag: "Zero Typing"
    },
    {
      pain: "Physical red paper bahi-khata books get torn, water-damaged, or lost, causing unrecoverable losses.",
      solution: "100% automated secure cloud backup. Switch or lose your phone, your entire ledger is restored in 60 seconds.",
      icon: <ShieldCheck className="size-4 text-blue-400" />,
      tag: "Bank-Grade Backup"
    },
    {
      pain: "Poor mobile network or internet blackouts freeze conventional accounting apps.",
      solution: "Offline-first capability: Keep speaking and recording entries even without internet. Everything auto-syncs when online.",
      icon: <WifiOff className="size-4 text-blue-400" />,
      tag: "Works Offline"
    },
    {
      pain: "Complicated English financial apps are confusing to operate and don't understand Indian accent nuances.",
      solution: "Engineered specifically for Indian English, Hinglish, and retail speech patterns. Speaks and understands like you do.",
      icon: <Globe2 className="size-4 text-blue-400" />,
      tag: "Natural Dialects"
    }
  ];

  return (
    <section id="benefits" className="py-16 sm:py-20 bg-[#0B0F19] border-b border-slate-700/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full">
            Why VoiceKhata
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            Say Goodbye to Slow Paper Diaries & Manual Typing
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
            See why modern shopkeepers and business owners are switching from manual notebooks to hands-free voice accounting.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Old Way Column */}
          <div className="rounded-[14px] border border-slate-700/40 bg-[#131B2E] p-6 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-700/40 pb-4">
              <div className="flex size-9 items-center justify-center rounded-[8px] bg-[#7F1D1D]/30 text-[#F87171]">
                <X className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">The Old Way: Paper Registers & Clunky Apps</h3>
                <p className="text-xs text-[#94A3B8]">Time wasted, missed credit, awkward collection calls</p>
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
          <div className="rounded-[14px] border border-blue-500/40 bg-[#131B2E] p-6 sm:p-7 space-y-5 shadow-sm relative">
            <div className="flex items-center gap-3 border-b border-slate-700/40 pb-4">
              {/* VoiceKhata Symbol / Logo */}
              <div className="flex size-9 items-center justify-center rounded-[8px] bg-[#0E1322] border border-slate-800 p-1.5 shadow-xs">
                <img src={logoImg} alt="VoiceKhata Logo" className="w-full h-full object-contain invert brightness-125" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">The VoiceKhata Way: Speak & Settle</h3>
                <p className="text-xs text-blue-400 font-medium">Fast, verified by voice, instant digital accuracy</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-[#F8FAFC]">
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
