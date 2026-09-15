// src/components/Pages/ShopkeeperLanding.tsx
"use client"

import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight, 
  Mic, 
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";

import ShopkeeperNavbar from "@/components/ui/Shopkeeper/ShopkeeperNavbar";
import ShopkeeperHero from "@/components/ui/Shopkeeper/ShopkeeperHero";
import ShopkeeperPainPoints from "@/components/ui/Shopkeeper/ShopkeeperPainPoints";
import ShopkeeperCategories from "@/components/ui/Shopkeeper/ShopkeeperCategories";
import ShopkeeperTestimonials from "@/components/ui/Shopkeeper/ShopkeeperTestimonials";
import ShopkeeperFeedback from "@/components/ui/Shopkeeper/ShopkeeperFeedback";
import ShopkeeperFAQ from "@/components/ui/Shopkeeper/ShopkeeperFAQ";
import ShopkeeperBottomStickyCTA from "@/components/ui/Shopkeeper/ShopkeeperBottomStickyCTA";
import logoImg from "@/assets/logo.png";
import stepMicImg from "@/assets/step_mic.png";
import stepVerifyImg from "@/assets/step_verify.png";
import stepLedgerImg from "@/assets/step_ledger.png";

export function ShopkeeperLanding() {
  return (
    <div className="relative min-h-screen w-full bg-[#0B0F19] text-[#F8FAFC] font-sans pb-16 md:pb-0">
      
      {/* 1. Header Navigation */}
      <ShopkeeperNavbar />

      <main className="relative z-10">
        {/* 2. Hero Section with Interactive Voice & Khata Simulation */}
        <ShopkeeperHero />

        {/* 3. Core Capability Highlights */}
        <section className="border-b border-slate-700/40 bg-[#131B2E] py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-400 tabular-nums">&lt; 3 Sec</p>
                <p className="text-xs text-[#94A3B8] font-medium mt-1">Voice-to-Ledger Entry</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tabular-nums">0</p>
                <p className="text-xs text-[#94A3B8] font-medium mt-1">Typing Required</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#34D399] tabular-nums">1-Click</p>
                <p className="text-xs text-[#94A3B8] font-medium mt-1">Instant UPI Reminders</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tabular-nums">100%</p>
                <p className="text-xs text-[#94A3B8] font-medium mt-1">Private & Cloud-Backed</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How Voice Works (3 Simple Steps) */}
        <section id="how-it-works" className="py-16 sm:py-20 bg-[#0B0F19] border-b border-slate-700/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
                How It Works
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
                Three Simple Steps. Zero Typing.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
                VoiceKhata turns natural speech into verified accounting entries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="group relative rounded-[16px] border border-slate-700/40 bg-[#131B2E] p-6 sm:p-7 shadow-xs transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-2xl hover:shadow-black/70 hover:border-blue-500/50 flex flex-col justify-between">
                <div>
                  {/* Top Bar: Icon Container & Step Badge */}
                  <div className="flex items-center justify-between mb-5">
                    {/* Step 1 Slot: [Icon Placeholder: Speak / Mic] */}
                    <div className="size-16 sm:size-20 rounded-[14px] bg-[#0B0F19] border border-slate-800 p-2 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
                      <img src={stepMicImg} alt="[Icon Placeholder: Speak / Mic]" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full shadow-xs">
                      Step 01
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F8FAFC]">Bolkar Batayein</h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                    Speak naturally in Hindi or English: "Received ₹1,200 from Ramesh via UPI" or "Gupta ji ko ₹500 diye".
                  </p>
                </div>

                {/* Desktop Flow Connector: Step 1 ➔ Step 2 (Dashed connector line & arrow) */}
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 size-7 rounded-full bg-[#0E1322] border border-dashed border-slate-700/90 items-center justify-center text-blue-400 shadow-md pointer-events-none group-hover:border-blue-400">
                  <ArrowRight size={13} />
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative rounded-[16px] border border-slate-700/40 bg-[#131B2E] p-6 sm:p-7 shadow-xs transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-2xl hover:shadow-black/70 hover:border-blue-500/50 flex flex-col justify-between">
                <div>
                  {/* Top Bar: Icon Container & Step Badge */}
                  <div className="flex items-center justify-between mb-5">
                    {/* Step 2 Slot: [Icon Placeholder: Verification / Card Review] */}
                    <div className="size-16 sm:size-20 rounded-[14px] bg-[#0B0F19] border border-slate-800 p-2 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
                      <img src={stepVerifyImg} alt="[Icon Placeholder: Verification / Card Review]" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full shadow-xs">
                      Step 02
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F8FAFC]">Review Before Save</h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                    VoiceKhata displays an instant confirmation card: Person, Amount, Money direction, and Payment mode.
                  </p>
                </div>

                {/* Desktop Flow Connector: Step 2 ➔ Step 3 (Dashed connector line & arrow) */}
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 size-7 rounded-full bg-[#0E1322] border border-dashed border-slate-700/90 items-center justify-center text-blue-400 shadow-md pointer-events-none group-hover:border-blue-400">
                  <ArrowRight size={13} />
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative rounded-[16px] border border-slate-700/40 bg-[#131B2E] p-6 sm:p-7 shadow-xs transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer hover:shadow-2xl hover:shadow-black/70 hover:border-blue-500/50 flex flex-col justify-between">
                <div>
                  {/* Top Bar: Icon Container & Step Badge */}
                  <div className="flex items-center justify-between mb-5">
                    {/* Step 3 Slot: [Icon Placeholder: Ledger / Success Check] */}
                    <div className="size-16 sm:size-20 rounded-[14px] bg-[#0B0F19] border border-slate-800 p-2 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
                      <img src={stepLedgerImg} alt="[Icon Placeholder: Ledger / Success Check]" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-600/20 border border-emerald-500/30 px-3 py-1 rounded-full shadow-xs">
                      Step 03
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F8FAFC]">Khata Updated</h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                    Customer balance and cashflow update instantly, with an accessible 6-second undo option.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Target Verticals (Retailers, Kiranas, Services) */}
        <ShopkeeperCategories />

        {/* 6. Why VoiceKhata (Pain Points vs Solution) */}
        <ShopkeeperPainPoints />

        {/* 7. Authentic Testimonials */}
        <ShopkeeperTestimonials />

        {/* 8. Community Feedback from Repo */}
        <ShopkeeperFeedback />

        {/* 9. FAQs */}
        <ShopkeeperFAQ />

        {/* 10. Final Call to Action */}
        <section className="py-16 sm:py-20 bg-[#131B2E] border-b border-slate-700/40">
          <div className="mx-auto max-w-4xl px-4 text-center space-y-5">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
              Ready to Simplify Your Daily Khata?
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
              Open VoiceKhata today. Record customer dues, supplier payments, and cash movement in seconds.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-[8px] bg-blue-600 hover:bg-blue-500 active:scale-[0.98] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all"
              >
                <span>Launch Digital Khata</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 11. Clean Fintech Footer */}
      <footer className="border-t border-slate-700/40 bg-[#0B0F19] py-10 text-xs text-[#94A3B8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-[6px] bg-[#0E1322] border border-slate-800 p-1 shadow-xs">
                <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
              </div>
              <span className="text-sm font-bold text-[#F8FAFC]">Voice<span className="text-blue-500">Khata</span></span>
              <span className="text-[#94A3B8]">— Digital Voice Ledger</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Engineered for retail counters, kirana stores, and small businesses in India 🇮🇳
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[#94A3B8]">
            <a href="#how-it-works" className="hover:text-[#F8FAFC]">How Voice Works</a>
            <a href="#businesses" className="hover:text-[#F8FAFC]">Who It's For</a>
            <a href="#benefits" className="hover:text-[#F8FAFC]">Benefits</a>
            <a href="#reviews" className="hover:text-[#F8FAFC]">Reviews</a>
            <a href="#feedback" className="hover:text-[#F8FAFC] text-blue-400">Feedback</a>
            <a href="#faqs" className="hover:text-[#F8FAFC]">FAQs</a>
          </div>

          <p className="text-[11px] text-[#94A3B8]">© 2026 VoiceKhata. All rights reserved.</p>
        </div>
      </footer>

      {/* 11. Mobile Sticky Action Bar */}
      <ShopkeeperBottomStickyCTA />

    </div>
  );
}

export default ShopkeeperLanding;

