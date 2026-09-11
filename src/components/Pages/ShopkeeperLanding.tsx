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
import ShopkeeperReceiptOCR from "@/components/ui/Shopkeeper/ShopkeeperReceiptOCR";
import ShopkeeperPainPoints from "@/components/ui/Shopkeeper/ShopkeeperPainPoints";
import ShopkeeperCategories from "@/components/ui/Shopkeeper/ShopkeeperCategories";
import ShopkeeperFAQ from "@/components/ui/Shopkeeper/ShopkeeperFAQ";
import logoImg from "@/assets/logo.png";

export function ShopkeeperLanding() {
  return (
    <div className="relative min-h-screen w-full bg-[#07090E] text-[#F1F5F9] font-sans pb-16 md:pb-0">
      
      {/* 1. Header Navigation */}
      <ShopkeeperNavbar />

      <main className="relative z-10">
        {/* 2. Hero Section with Interactive Voice & Khata Simulation */}
        <ShopkeeperHero />

        {/* 3. Core Capability Highlights */}
        <section className="border-b border-[#1E2638] bg-[#0C1019] py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#818CF8] tabular-nums">&lt; 3 Sec</p>
                <p className="text-xs text-[#94A3B8] font-medium mt-1">Voice-to-Ledger Entry</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tabular-nums">0</p>
                <p className="text-xs text-[#94A3B8] font-medium mt-1">Typing Required</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#34D399] tabular-nums">1-Click</p>
                <p className="text-xs text-[#94A3B8] font-medium mt-1">WhatsApp UPI Reminders</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] tabular-nums">100%</p>
                <p className="text-xs text-[#94A3B8] font-medium mt-1">Private & Cloud-Backed</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How Voice Works (3 Simple Steps) */}
        <section id="how-it-works" className="py-16 sm:py-20 bg-[#07090E] border-b border-[#1E2638]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#818CF8] bg-[#1E2337] px-3 py-1 rounded-full border border-[#5C6BC0]/30">
                How It Works
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-bold text-[#F1F5F9] tracking-tight">
                Three Simple Steps. Zero Typing.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
                VoiceKhata turns natural speech into verified accounting entries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-[12px] border border-[#1E2638] bg-[#0F131C] p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-center size-9 rounded-[8px] bg-[#1E2337] text-[#818CF8] font-bold text-sm">
                  1
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9]">Bolkar Batayein</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Speak naturally in Hindi or English: "Received ₹1,200 from Ramesh via UPI" or "Gupta ji ko ₹500 diye".
                </p>
              </div>

              <div className="rounded-[12px] border border-[#1E2638] bg-[#0F131C] p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-center size-9 rounded-[8px] bg-[#1E2337] text-[#818CF8] font-bold text-sm">
                  2
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9]">Review Before Save</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  VoiceKhata displays an instant confirmation card: Person, Amount, Money direction, and Payment mode.
                </p>
              </div>

              <div className="rounded-[12px] border border-[#1E2638] bg-[#0F131C] p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-center size-9 rounded-[8px] bg-[#1E2337] text-[#818CF8] font-bold text-sm">
                  3
                </div>
                <h3 className="text-base font-bold text-[#F1F5F9]">Khata Updated</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Customer balance and cashflow update instantly, with an accessible 6-second undo option.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Smart Bill & Receipt Vision Scanner */}
        <ShopkeeperReceiptOCR />

        {/* 6. Target Verticals (Retailers, Kiranas, Services) */}
        <ShopkeeperCategories />

        {/* 7. Why VoiceKhata (Pain Points vs Solution) */}
        <ShopkeeperPainPoints />

        {/* 8. FAQs */}
        <ShopkeeperFAQ />

        {/* 9. Final Call to Action */}
        <section className="py-16 sm:py-20 bg-[#0C1019] border-b border-[#1E2638]">
          <div className="mx-auto max-w-4xl px-4 text-center space-y-5">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F1F5F9] tracking-tight">
              Ready to Simplify Your Daily Khata?
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
              Open VoiceKhata today. Record customer dues, supplier payments, and cash movement in seconds.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] active:scale-[0.98] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all"
              >
                <span>Launch Digital Khata</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Clean Fintech Footer */}
      <footer className="border-t border-[#1E2638] bg-[#07090E] py-10 text-xs text-[#94A3B8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-[6px] bg-[#1E2337] border border-[#5C6BC0]/30 p-1 shadow-xs">
                <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
              </div>
              <span className="text-sm font-bold text-[#F1F5F9]">VoiceKhata</span>
              <span className="text-[#64748B]">— Digital Voice Ledger</span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Engineered for retail counters, kirana stores, and small businesses in India 🇮🇳
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[#94A3B8]">
            <a href="#how-it-works" className="hover:text-[#F1F5F9]">How Voice Works</a>
            <a href="#receipt-ai" className="hover:text-[#F1F5F9]">Bill Scanner</a>
            <a href="#businesses" className="hover:text-[#F1F5F9]">Who It's For</a>
            <a href="#benefits" className="hover:text-[#F1F5F9]">Benefits</a>
            <a href="#faqs" className="hover:text-[#F1F5F9]">FAQs</a>
          </div>

          <p className="text-[11px] text-[#64748B]">© 2026 VoiceKhata. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default ShopkeeperLanding;
