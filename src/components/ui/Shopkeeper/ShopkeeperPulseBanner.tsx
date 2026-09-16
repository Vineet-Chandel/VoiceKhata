// src/components/ui/Shopkeeper/ShopkeeperPulseBanner.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mic, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

export function ShopkeeperPulseBanner() {
  return (
    <section className="py-12 sm:py-20 bg-white dark:bg-[#070A11] transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dark Charcoal Curved Container with Protruding Phone Effect */}
        <div className="relative rounded-[32px] bg-[#0B0F15] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl border border-slate-800">
          
          {/* Background Radial & Curved Wave Graphics */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#D2F832]/15 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />
          
          {/* Curved wave lines SVG */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 opacity-20 pointer-events-none">
            <svg width="400" height="200" viewBox="0 0 400 200" fill="none">
              <path d="M0 100 C 100 20, 200 180, 300 100 C 350 60, 380 90, 400 100" stroke="#D2F832" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M0 130 C 120 50, 220 190, 320 110 C 360 80, 390 110, 400 120" stroke="white" strokeWidth="1.5" opacity="0.4" />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#D2F832] border border-white/10">
                <Sparkles className="size-3" />
                <span>Instant Counter Visibility</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
                Keep Your Finger on Your Store Cashflow Pulse
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Counter in Action: 140+ daily entries logged in 2.4s average. Instant customer ledger updates, 1-click WhatsApp payment reminders with UPI links, and automatic cloud backup.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/signup"
                  className="flex items-center gap-2.5 rounded-full bg-[#D2F832] hover:bg-[#c2e825] text-[#0B0F15] px-7 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-[0.98] group"
                >
                  <span>Launch Digital Khata</span>
                  <div className="size-5 rounded-full bg-[#0B0F15] text-[#D2F832] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="size-3 stroke-[2.5]" />
                  </div>
                </Link>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="size-4 text-[#D2F832]" />
                  <span>Free for Indian Merchants</span>
                </div>
              </div>
            </div>

            {/* Right: Sleek Smartphone Mockup Protruding */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[300px] rounded-[30px] border-[5px] border-slate-700 bg-[#121824] p-4 shadow-2xl space-y-3 transform lg:rotate-2 hover:rotate-0 transition-transform duration-300">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#D2F832]" />
                    <span>5G</span>
                  </div>
                </div>

                {/* Total Balance Card */}
                <div className="rounded-[18px] bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 p-3.5 space-y-1 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Today's Total Khata
                  </span>
                  <div className="text-2xl font-black text-white tabular-nums tracking-tight">
                    ₹48,250.00
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <TrendingUp className="size-3" />
                    <span>+₹12,400 Settled via UPI</span>
                  </div>
                </div>

                {/* Transaction Rows */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                        R
                      </div>
                      <div>
                        <p className="font-bold text-white text-[11px]">Ramesh Kirana</p>
                        <p className="text-[9px] text-slate-400">UPI Received • 2s ago</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400 text-xs">+₹1,200</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-red-950 text-red-400 flex items-center justify-center font-bold text-[11px]">
                        V
                      </div>
                      <div>
                        <p className="font-bold text-white text-[11px]">Verma Plumber</p>
                        <p className="text-[9px] text-slate-400">Udhar Debit • 1m ago</p>
                      </div>
                    </div>
                    <span className="font-bold text-red-400 text-xs">-₹4,500</span>
                  </div>
                </div>

                {/* Quick Voice Bar */}
                <div className="rounded-full bg-[#0B0F15] border border-slate-700 p-2 flex items-center justify-between px-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Mic className="size-3.5 text-[#D2F832]" />
                    <span className="text-[10px]">Tap to Speak...</span>
                  </div>
                  <span className="size-2 rounded-full bg-[#D2F832] animate-ping" />
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ShopkeeperPulseBanner;
