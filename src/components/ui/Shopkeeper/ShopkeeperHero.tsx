// src/components/ui/Shopkeeper/ShopkeeperHero.tsx
"use client"

import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  MessageSquare,
  Mic,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Store
} from "lucide-react";
import shopkeeperIllustrationImg from "@/assets/shopkeeper_illustration.png";

export function ShopkeeperHero() {
  // 3D Perspective Tilt Physics via Framer Motion
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 22 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPos);
    mouseY.set(yPos);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 bg-white dark:bg-[#070A11] transition-colors overflow-hidden">
      
      {/* Subtle background ambient mesh */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D2F832]/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-slate-200/40 dark:bg-slate-800/20 rounded-full blur-[100px] pointer-events-none -z-0" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Heading & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Tag badge with lime pulse */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F141C] px-3.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
              <span className="size-2 rounded-full bg-[#D2F832] border border-black/20 animate-pulse" />
              <span>Digital Khate for Indian Businesses</span>
            </div>

            {/* Core Positioning with Editorial Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0B0F15] dark:text-white leading-[1.08]">
              Khata likhna. <br />
              <span className="relative inline-block mt-1">
                <span className="relative z-10 text-[#0B0F15] dark:text-white">Ab bas bolkar.</span>
                <span className="absolute -bottom-1 left-0 w-full h-[3px] sm:h-[4px] bg-[#D2F832] rounded-full" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Speak naturally in Hindi or English. VoiceKhata understands the customer, amount, and payment method in 3 seconds — keeping customer balances, receivables, and store cashflow 100% accurate without typing.
            </p>

            {/* Action CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 relative">
              <Link
                to="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full bg-[#0B0F15] hover:bg-black text-white px-7 py-3.5 text-sm font-semibold shadow-md hover:shadow-xl transition-all active:scale-[0.98] group cursor-pointer"
              >
                <span>Launch Digital Khata</span>
                <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-3 stroke-[2.5]" />
                </div>
              </Link>

              <Link
                to="/feedback"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F141C] hover:bg-slate-50 dark:hover:bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                <MessageSquare className="size-4 text-slate-900 dark:text-[#D2F832]" />
                <span>Give Feedback</span>
              </Link>

              {/* Hand-drawn SVG arrow doodle pointing towards the product UI */}
              <div className="hidden lg:block absolute -right-14 -bottom-10 pointer-events-none text-slate-400 dark:text-slate-500">
                <svg width="64" height="42" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10C18 8 36 12 48 24C53 29 57 34 58 37M58 37L49 35M58 37L56 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Micro value pillars */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center font-bold">
                  <Check className="size-2.5 stroke-[3]" />
                </div>
                <span>Zero Typing Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center font-bold">
                  <Check className="size-2.5 stroke-[3]" />
                </div>
                <span>Review Before Save</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center font-bold">
                  <Check className="size-2.5 stroke-[3]" />
                </div>
                <span>Instant Payment Reminders</span>
              </div>
            </div>

          </div>

          {/* Right Column: Layered Floating VoiceKhata Product Showcase */}
          <div className="lg:col-span-6 [perspective:1200px]">
            <motion.div
              ref={cardRef}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="relative mx-auto max-w-[480px] lg:max-w-none"
            >
              {/* Asymmetric Large Lime Accent Panel behind Product UI */}
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-[#D2F832]/25 via-[#D2F832]/15 to-[#CEF23F]/30 dark:from-[#D2F832]/15 dark:to-[#D2F832]/5 border border-[#D2F832]/40 -rotate-1 scale-[1.02] -z-10" />

              {/* Main Product Container */}
              <div className="relative rounded-[28px] border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0E1320]/95 backdrop-blur-sm p-5 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-black/60">
                
                {/* Header: Counter in Action with Live Status */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0B0F15] text-white shadow-2xs">
                      <Store size={13} className="text-[#D2F832]" />
                      <span>Counter in Action</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Ramesh Kirana Store (Dadar)
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#0B0F15] bg-[#D2F832] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-[#0B0F15] animate-ping" />
                    Interactive
                  </span>
                </div>

                {/* Layered Product Composition */}
                <div className="space-y-3.5 relative">
                  
                  {/* Digital Khata Live Display Card */}
                  <div className="rounded-[18px] border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#070A11]/90 p-4 space-y-3">
                    
                    {/* Balance & Daily Summary */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Store Total Receivables (कुल उधारी)
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-black text-[#0B0F15] dark:text-white tabular-nums tracking-tight">
                            ₹14,850.00
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            +₹3,200 Today
                          </span>
                        </div>
                      </div>

                      <div className="size-9 rounded-full bg-[#0B0F15] text-[#D2F832] flex items-center justify-center shadow-xs">
                        <Zap className="size-4 fill-current" />
                      </div>
                    </div>

                    {/* Speech to Structured Transaction Metaphor */}
                    <div className="rounded-[14px] bg-white dark:bg-[#0E1320] border border-slate-200 dark:border-slate-800 p-3 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-semibold text-[#0B0F15] dark:text-white">
                          <div className="size-2 rounded-full bg-[#D2F832] animate-pulse" />
                          <span>Voice Input (बोलकर एंट्री)</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">3.0s processing</span>
                      </div>

                      {/* Spoken voice quote */}
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-[#070A11] px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-800/80">
                        <Mic className="size-3.5 text-slate-900 dark:text-[#D2F832] shrink-0" />
                        <span className="italic">"Sharma ji ne 5kg atta liya ₹210 udhar"</span>
                      </div>

                      {/* Structured Ledger Card Preview */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Customer</span>
                          <span className="text-xs font-bold text-[#0B0F15] dark:text-white truncate block">Sharma Ji</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Amount</span>
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 block">₹210 (Udhar)</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070A11] border border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">Mode</span>
                          <span className="text-xs font-bold text-[#0B0F15] dark:text-white block">Credit / Khata</span>
                        </div>
                      </div>

                      {/* 6-second review before save verification */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="size-3 text-blue-500" />
                          Undo available (6s)
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="size-3 stroke-[3]" /> Verified & Saved
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Indian Shopkeeper Cartoon Illustration */}
                  <div className="relative rounded-[20px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A11] flex items-center justify-center shadow-xs">
                    <img 
                      src={shopkeeperIllustrationImg} 
                      alt="Indian Shopkeeper using VoiceKhata - ₹500 का उधार दिया - रमेश किराना स्टोर (दादर)" 
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* Bottom Metric Cards */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-[12px] bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Daily Transactions</span>
                      <span className="font-bold text-[#0B0F15] dark:text-white text-sm">140+ Entries</span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">Average 2.4s per khata entry</p>
                    </div>
                    <div className="p-3 rounded-[12px] bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Typing Eliminated</span>
                      <span className="font-bold text-[#0B0F15] dark:text-[#D2F832] text-sm">100% Voice</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Hindi, Hinglish & English</p>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ShopkeeperHero;
