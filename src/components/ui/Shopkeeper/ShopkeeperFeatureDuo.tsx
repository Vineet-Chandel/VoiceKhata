// src/components/ui/Shopkeeper/ShopkeeperFeatureDuo.tsx
import React from "react";
import { ArrowRight, Mic, TrendingUp, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ShopkeeperFeatureDuo() {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-[#070A11] transition-colors border-t border-slate-100 dark:border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Core Capability
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black text-[#0B0F15] dark:text-white tracking-tight">
            Get the Most Out of Your Daily Khata
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Engineered specifically to handle the high speed and noise of Indian retail counters.
          </p>
        </div>

        {/* 2 Wide Feature Cards side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Voice Speed */}
          <div className="group relative rounded-[28px] border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0E1320] p-7 sm:p-9 flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all">
            <div className="relative z-10 max-w-md space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#D2F832] text-[#0B0F15]">
                <Mic className="size-3" />
                &lt; 3 Sec Voice Entry
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B0F15] dark:text-white tracking-tight">
                Zero Typing. Natural Indian Speech Recognition.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Speak naturally in Hindi or English: "Received ₹1,200 from Ramesh via UPI" or "Gupta ji ko ₹500 diye". VoiceKhata extracts the party, amount, and payment mode automatically without manual typing.
              </p>
              <div className="pt-2">
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B0F15] dark:text-[#D2F832] group-hover:underline"
                >
                  <span>See How Voice Works</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Bottom-right Decorative Pebble Graphic */}
            <div className="relative mt-8 sm:mt-4 flex justify-end">
              <div className="relative size-32 sm:size-40 rounded-[38px] bg-[#D2F832] flex items-center justify-center shadow-inner overflow-hidden rotate-6 group-hover:rotate-12 transition-transform duration-500">
                <div className="absolute -bottom-4 -right-4 size-20 rounded-full bg-[#0B0F15] text-white flex items-center justify-center p-3">
                  <Mic className="size-8 text-[#D2F832]" />
                </div>
                <div className="space-y-1.5 font-mono text-[10px] font-bold text-[#0B0F15] opacity-80">
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-black animate-ping" />
                    <span>HINDI</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-black" />
                    <span>HINGLISH</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-black" />
                    <span>ENGLISH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Analytics & Verification */}
          <div className="group relative rounded-[28px] border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0E1320] p-7 sm:p-9 flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all">
            <div className="relative z-10 max-w-md space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#0B0F15] text-white dark:bg-white dark:text-[#0B0F15]">
                <ShieldCheck className="size-3 text-[#D2F832] dark:text-emerald-600" />
                Review Before Save
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B0F15] dark:text-white tracking-tight">
                Full Analytics & 6-Second Undo Protection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                VoiceKhata displays an instant confirmation card: Person, Amount, Money direction, and Payment mode. Customer balance and store cashflow update with an accessible 6-second undo option.
              </p>
              <div className="pt-2">
                <a
                  href="#benefits"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B0F15] dark:text-[#D2F832] group-hover:underline"
                >
                  <span>Explore Store Benefits</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Bottom-right Doughnut Progress Graphic */}
            <div className="relative mt-8 sm:mt-4 flex justify-end">
              <div className="relative size-32 sm:size-40 flex items-center justify-center">
                {/* SVG Doughnut chart */}
                <svg className="size-32 sm:size-36 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#D2F832"
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset="60"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#0B0F15"
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset="180"
                    strokeLinecap="round"
                    fill="transparent"
                    className="dark:stroke-white"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <TrendingUp className="size-6 text-[#0B0F15] dark:text-[#D2F832]" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    100% SYNC
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default ShopkeeperFeatureDuo;
