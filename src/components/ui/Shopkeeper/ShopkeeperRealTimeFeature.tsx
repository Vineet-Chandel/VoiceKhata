// src/components/ui/Shopkeeper/ShopkeeperRealTimeFeature.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Check, Clock, Undo2, ArrowUpRight, Zap } from "lucide-react";

export function ShopkeeperRealTimeFeature() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#070A11] transition-colors space-y-20 sm:space-y-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        
        {/* Section 1: Real-Time Cashflow (Dark chart card on Left, text on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Dark Card Mockup with Lime Peek Card behind */}
          <div className="lg:col-span-6 relative">
            {/* Lime peek card behind */}
            <div className="absolute -top-3 -left-3 w-full h-full rounded-[30px] bg-[#D2F832] -rotate-2 -z-10 shadow-sm" />

            {/* Dark Chart Card */}
            <div className="rounded-[28px] bg-[#0B0F15] border border-slate-800 p-6 sm:p-8 text-white space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#D2F832] animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Live Counter Cashflow</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                  +18.4% this week
                </span>
              </div>

              {/* Stat & Sparkline */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Daily Net Recoveries</span>
                <div className="text-3xl font-black text-white tabular-nums">
                  ₹28,640.00
                </div>
              </div>

              {/* Realistic SVG Trend Line Chart */}
              <div className="h-32 w-full pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D2F832" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#D2F832" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 Q40,65 80,70 T160,40 T240,25 T300,10 L300,100 L0,100 Z"
                    fill="url(#limeGrad)"
                  />
                  <path
                    d="M0,80 Q40,65 80,70 T160,40 T240,25 T300,10"
                    fill="none"
                    stroke="#D2F832"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="300" cy="10" r="5" fill="#D2F832" />
                </svg>
              </div>

              {/* 6-Second Undo Indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Undo2 className="size-4 text-[#D2F832]" />
                  <span>Accidental entry? Undo in 6 seconds</span>
                </div>
                <span className="font-mono text-[11px] text-[#D2F832] font-bold">00:06</span>
              </div>
            </div>
          </div>

          {/* Right: Text & Details */}
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Ledger Update
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
              Khata Updated in Real Time
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Customer balance and cashflow update instantly, with an accessible 6-second undo option. No more double entries, lost registers, or confusing tally slips.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Check className="size-3 stroke-[3]" />
                </div>
                <span>Instant ledger balance calculation across customer & supplier accounts</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Check className="size-3 stroke-[3]" />
                </div>
                <span>One-click WhatsApp reminder with direct UPI payment link to clear dues 3x faster</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Check className="size-3 stroke-[3]" />
                </div>
                <span>100% private, encrypted, and backed up to secure cloud storage</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#0B0F15] dark:bg-white text-white dark:text-[#0B0F15] hover:bg-black px-6 py-3 text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                <span>Launch Digital Khata</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

        </div>


        {/* Section 2: 10,000+ Shopkeepers (Text on Left, Stacked Floating Cards over Lime Disc on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-8">
          
          {/* Left: Text & Metrics */}
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              National Scale
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
              10,000+ Indian Retailers on VoiceKhata
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              From busy metropolitan wholesale markets to neighborhood kirana stores, Indian merchants use VoiceKhata every day to eliminate bookkeeping friction and secure daily cashflow.
            </p>

            {/* Metric pill */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800">
                <span className="text-2xl sm:text-3xl font-black text-[#0B0F15] dark:text-white tabular-nums">
                  140+
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daily entries per counter</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800">
                <span className="text-2xl sm:text-3xl font-black text-[#0B0F15] dark:text-[#D2F832] tabular-nums">
                  2.4s
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Average voice entry speed</p>
              </div>
            </div>
          </div>

          {/* Right: Stacked Floating Translucent Cards over Lime Disc */}
          <div className="lg:col-span-6 relative flex justify-center items-center py-6">
            
            {/* Bright Lime Circle Disc */}
            <div className="absolute size-72 sm:size-84 rounded-full bg-[#D2F832] opacity-80 dark:opacity-40 blur-xs -z-10" />

            {/* Stacked Cards */}
            <div className="w-full max-w-[360px] space-y-3.5 relative z-10">
              
              {/* Floating Card 1 */}
              <div className="rounded-2xl bg-white/90 dark:bg-[#0E1320]/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 p-4 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-[#0B0F15] text-[#D2F832] flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <p className="font-bold text-[#0B0F15] dark:text-white text-xs">Sharma Ji (Kirana)</p>
                      <p className="text-[10px] text-slate-500">5kg atta liya udhar</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-600 dark:text-red-400 text-xs">₹210</span>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="rounded-2xl bg-white/95 dark:bg-[#0E1320]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 p-4 shadow-xl transform translate-x-3 rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div>
                      <p className="font-bold text-[#0B0F15] dark:text-white text-xs">Ramesh Bhai (Grocery)</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">UPI Payment Received</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 text-xs">+₹1,200</span>
                </div>
              </div>

              {/* Floating Card 3 */}
              <div className="rounded-2xl bg-white/90 dark:bg-[#0E1320]/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 p-4 shadow-lg transform -translate-x-2 -rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-[#0B0F15] text-white flex items-center justify-center font-bold text-xs">
                      V
                    </div>
                    <div>
                      <p className="font-bold text-[#0B0F15] dark:text-white text-xs">Verma Plumber (Hardware)</p>
                      <p className="text-[10px] text-slate-500">Sanitary pipes advance</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">₹4,500</span>
                </div>
              </div>

              {/* Decorative hand-drawn doodle arrow */}
              <div className="absolute -bottom-10 left-10 pointer-events-none text-[#0B0F15] dark:text-white">
                <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
                  <path d="M4 28 C16 26 30 18 42 6 M42 6 L32 8 M42 6 L40 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ShopkeeperRealTimeFeature;
