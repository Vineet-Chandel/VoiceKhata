// src/components/ui/Shopkeeper/ShopkeeperPainPoints.tsx
import React, { useState } from "react";
import { 
  X, 
  Check, 
  Zap, 
  Globe2, 
  WifiOff, 
  Clock, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export function ShopkeeperPainPoints() {
  const [activeTab, setActiveTab] = useState<"grid" | "compare">("grid");

  const comparisonItems = [
    {
      pain: "During rush hours with customers waiting, you have no time to write in a paper diary — transactions get missed.",
      solution: "Log in 3 seconds flat: Just say 'Ramesh ne ₹200 diye'. Your ledger updates in front of the customer without touching a pen.",
      icon: <Clock className="size-5 text-[#0B0F15]" />,
      tag: "Rush Hour Speed"
    },
    {
      pain: "Searching customer names on small phone keyboards is slow, clumsy, and frustrating with shop-dusted hands.",
      solution: "Zero Typing! Just speak the customer name and amount. VoiceKhata matches the account and logs the entry.",
      icon: <Zap className="size-5 text-[#0B0F15]" />,
      tag: "Zero Typing"
    },
    {
      pain: "Physical red paper bahi-khata books get torn, water-damaged, or lost, causing unrecoverable losses.",
      solution: "100% automated secure cloud backup. Switch or lose your phone, your entire ledger is restored in 60 seconds.",
      icon: <ShieldCheck className="size-5 text-[#0B0F15]" />,
      tag: "Bank-Grade Backup"
    },
    {
      pain: "Poor mobile network or internet blackouts freeze conventional accounting apps.",
      solution: "Offline-first capability: Keep speaking and recording entries even without internet. Everything auto-syncs when online.",
      icon: <WifiOff className="size-5 text-[#0B0F15]" />,
      tag: "Works Offline"
    },
    {
      pain: "Complicated English financial apps are confusing to operate and don't understand Indian accent nuances.",
      solution: "Engineered specifically for Indian English, Hinglish, and retail speech patterns. Speaks and understands like you do.",
      icon: <Globe2 className="size-5 text-[#0B0F15]" />,
      tag: "Natural Dialects"
    }
  ];

  return (
    <section id="benefits" className="py-16 sm:py-24 bg-slate-50/60 dark:bg-[#070A11] transition-colors border-t border-slate-200/80 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Layout: Left Heading + Right Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
              Say Goodbye to Slow Paper Diaries & Manual Typing
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              See why modern shopkeepers and business owners are switching from manual notebooks to hands-free voice accounting.
            </p>

            {/* View Switcher Toggle */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("grid")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "grid"
                    ? "bg-[#0B0F15] text-white dark:bg-white dark:text-[#0B0F15] shadow-xs"
                    : "bg-white dark:bg-[#0E1320] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                Key Advantages
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("compare")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "compare"
                    ? "bg-[#0B0F15] text-white dark:bg-white dark:text-[#0B0F15] shadow-xs"
                    : "bg-white dark:bg-[#0E1320] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                Old Way vs VoiceKhata
              </button>
            </div>

            {/* Quick Summary Pill */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#D2F832]" />
                <span className="text-xs font-bold text-[#0B0F15] dark:text-white">
                  The VoiceKhata Way: Speak & Settle
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Fast, verified by voice, instant digital accuracy. Built for the reality of Indian retail counters.
              </p>
            </div>
          </div>

          {/* Right Column: 2x2 Bento Feature Grid with Lime Circular Badges */}
          <div className="lg:col-span-7">
            {activeTab === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {comparisonItems.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="group rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] p-6 sm:p-7 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Signature Lime Circular Badge */}
                      <div className="size-12 rounded-full bg-[#D2F832] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                        {item.icon}
                      </div>

                      <h3 className="text-lg font-bold text-[#0B0F15] dark:text-white tracking-tight">
                        {item.tag}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.solution}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        VoiceKhata Advantage
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B0F15] dark:text-[#D2F832] group-hover:underline">
                        <span>Learn More</span>
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </div>
                ))}

                {/* 5th Item banner spanning bottom */}
                <div className="sm:col-span-2 rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1320] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-[#D2F832] flex items-center justify-center shrink-0">
                      <Globe2 className="size-5 text-[#0B0F15]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#0B0F15] dark:text-white">
                        {comparisonItems[4].tag}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {comparisonItems[4].solution}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Full Comparison View (Old Way vs VoiceKhata) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Old Way Column */}
                <div className="rounded-[24px] border border-red-200/80 dark:border-red-950/60 bg-white dark:bg-[#0E1320] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600">
                      <X className="size-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B0F15] dark:text-white">The Old Way</h3>
                      <p className="text-[11px] text-slate-500">Paper registers & clumsy apps</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {comparisonItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                        <span className="text-red-500 font-bold text-sm shrink-0">✕</span>
                        <p className="leading-relaxed">{item.pain}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VoiceKhata Way Column */}
                <div className="rounded-[24px] border border-[#D2F832] dark:border-[#D2F832]/60 bg-white dark:bg-[#0E1320] p-6 space-y-4 shadow-md">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#0B0F15] text-[#D2F832]">
                      <img src={logoImg} alt="VoiceKhata Logo" className="w-5 h-5 object-contain invert brightness-125" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B0F15] dark:text-white">The VoiceKhata Way</h3>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Speak & settle in 3 seconds</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {comparisonItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">✓</span>
                        <p className="leading-relaxed">{item.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

export default ShopkeeperPainPoints;
