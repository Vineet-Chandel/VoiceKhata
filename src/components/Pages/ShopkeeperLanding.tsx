// src/components/Pages/ShopkeeperLanding.tsx
"use client"

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles
} from "lucide-react";

import ShopkeeperNavbar from "@/components/ui/Shopkeeper/ShopkeeperNavbar";
import ShopkeeperHero from "@/components/ui/Shopkeeper/ShopkeeperHero";
import ShopkeeperActivityMarquee from "@/components/ui/Shopkeeper/ShopkeeperActivityMarquee";
import ShopkeeperArchitecture from "@/components/ui/Shopkeeper/ShopkeeperArchitecture";
import ShopkeeperDropcardFeature from "@/components/ui/Shopkeeper/ShopkeeperDropcardFeature";
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
    <div className="relative min-h-screen w-full bg-[#F8FAFC] dark:bg-[#060A12] text-slate-900 dark:text-[#F8FAFC] font-sans pb-16 md:pb-0 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* 1. Header Navigation with Theme Toggle */}
      <ShopkeeperNavbar />

      <main className="relative z-10">
        
        {/* 2. Synex Monumental Hero Section with Shopkeeper Voice Illustration & Live Digital Ledger */}
        <ShopkeeperHero />

        {/* 3. Synex Live System Activity Ticker Marquee */}
        <ShopkeeperActivityMarquee />

        {/* 4. Synex 4-Column Stat Divider Bar */}
        <section className="border-b border-slate-200 dark:border-[#1E2D4A]/80 bg-white dark:bg-[#0B1120] py-10 sm:py-12 transition-colors duration-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0.5, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-[#1E2D4A]"
            >
              {/* Stat 1 */}
              <div className="px-4 py-2">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight tabular-nums">&lt; 3 Sec</p>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold mt-2 uppercase tracking-wider">Voice-to-Ledger Entry</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Faster than typing or writing</p>
              </div>

              {/* Stat 2 */}
              <div className="px-4 py-2">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">0</p>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold mt-2 uppercase tracking-wider">Typing Required</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Hindi, Hinglish & English</p>
              </div>

              {/* Stat 3 */}
              <div className="px-4 py-2">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight tabular-nums">1-Click</p>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold mt-2 uppercase tracking-wider">Instant UPI Reminders</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automated WhatsApp payment link</p>
              </div>

              {/* Stat 4 */}
              <div className="px-4 py-2">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">100%</p>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bold mt-2 uppercase tracking-wider">Private & Cloud-Backed</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Restores in 60s on any device</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5. Synex Architecture Network Schematic ("One Platform. Multiple Intelligence Layers.") */}
        <ShopkeeperArchitecture />

        {/* 6. Split Feature Showcase ("Built for tomorrow") */}
        <ShopkeeperDropcardFeature />

        {/* 7. How Voice Works (3 Simple Process Cards with Flow Connectors) */}
        <section id="how-it-works" className="py-18 sm:py-28 bg-[#F8FAFC] dark:bg-[#060A12] border-b border-slate-200 dark:border-[#1E2D4A]/80 font-sans transition-colors duration-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            
            <motion.div 
              initial={{ opacity: 0.5, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/15 px-3.5 py-1.5 rounded-full border border-blue-500/20 dark:border-blue-500/30">
                SIMPLE 3-STEP PROCESS
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                Three Simple Steps. Zero Typing.
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                VoiceKhata turns natural speech into verified accounting entries in seconds.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0.5, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 }}
                whileHover={{ y: -5 }}
                className="group relative rounded-[26px] border border-slate-200 dark:border-[#1E2D4A] bg-white dark:bg-[#0B1120] p-7 shadow-xl hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="size-16 rounded-2xl bg-slate-50 dark:bg-[#060A12] border border-slate-200 dark:border-[#1E2D4A] p-2.5 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
                      <img src={stepMicImg} alt="Step 1 Mic" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 px-3 py-1 rounded-full">
                      Step 01
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bolkar Batayein</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Speak naturally in Hindi or English: "Received ₹1,200 from Ramesh via UPI" or "Gupta ji ko ₹500 diye".
                  </p>
                </div>

                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 size-7 rounded-full bg-white dark:bg-[#060A12] border border-dashed border-slate-300 dark:border-[#1E2D4A] items-center justify-center text-blue-500 dark:text-blue-400 shadow-md pointer-events-none group-hover:border-blue-500">
                  <ArrowRight size={13} />
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0.5, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative rounded-[26px] border border-slate-200 dark:border-[#1E2D4A] bg-white dark:bg-[#0B1120] p-7 shadow-xl hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="size-16 rounded-2xl bg-slate-50 dark:bg-[#060A12] border border-slate-200 dark:border-[#1E2D4A] p-2.5 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
                      <img src={stepVerifyImg} alt="Step 2 Verify" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 px-3 py-1 rounded-full">
                      Step 02
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Before Save</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    VoiceKhata displays an instant confirmation card: Person, Amount, Money direction, and Payment mode.
                  </p>
                </div>

                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 size-7 rounded-full bg-white dark:bg-[#060A12] border border-dashed border-slate-300 dark:border-[#1E2D4A] items-center justify-center text-blue-500 dark:text-blue-400 shadow-md pointer-events-none group-hover:border-blue-500">
                  <ArrowRight size={13} />
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0.5, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                whileHover={{ y: -5 }}
                className="group relative rounded-[26px] border border-slate-200 dark:border-[#1E2D4A] bg-white dark:bg-[#0B1120] p-7 shadow-xl hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="size-16 rounded-2xl bg-slate-50 dark:bg-[#060A12] border border-slate-200 dark:border-[#1E2D4A] p-2.5 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
                      <img src={stepLedgerImg} alt="Step 3 Ledger" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 px-3 py-1 rounded-full">
                      Step 03
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Khata Updated</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Customer balance and store cashflow update immediately, with an accessible 6-second undo option.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* 8. Target Verticals (Kiranas, Chemists, Hardware, etc.) */}
        <ShopkeeperCategories />

        {/* 9. Why VoiceKhata (Synex Elevated Comparison Table) */}
        <ShopkeeperPainPoints />

        {/* 10. Authentic Merchant Testimonials */}
        <ShopkeeperTestimonials />

        {/* 11. Community Feedback (Connected to Supabase) */}
        <ShopkeeperFeedback />

        {/* 12. Frequently Asked Questions (Accordion) */}
        <ShopkeeperFAQ />

        {/* 13. Final Call to Action Banner */}
        <section className="py-20 sm:py-28 bg-slate-100 dark:bg-[#0B1120] border-b border-slate-200 dark:border-[#1E2D4A]/80 transition-colors duration-200">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0.6, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[32px] bg-gradient-to-br from-[#0F172A] via-[#0B1120] to-[#1E3A8A]/50 border border-blue-500/40 p-8 sm:p-14 text-center overflow-hidden shadow-2xl text-white"
            >
              {/* Concentric ambient circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full border border-blue-500/15 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full border border-blue-500/10 pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 bg-blue-600/20 px-4 py-1.5 rounded-full border border-blue-500/30">
                  <Sparkles className="size-3.5 text-blue-400" />
                  <span>START IN 60 SECONDS</span>
                </span>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Ready to Simplify Your Daily Khata?
                </h2>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  Open VoiceKhata today. Record customer dues, supplier payments, and cash movement in 3 seconds — 100% hands-free.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/35 transition-all cursor-pointer group"
                  >
                    <span>Launch Digital Khata</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="px-6 py-3.5 rounded-full border border-slate-700 bg-[#060A12] text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
                  >
                    Explore 3-Step Demo
                  </a>
                </div>
              </div>

            </motion.div>
          </div>
        </section>

      </main>

      {/* 14. Clean Fintech Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1E2D4A]/80 bg-white dark:bg-[#060A12] py-12 text-xs text-slate-500 dark:text-slate-400 font-sans transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E2D4A] p-1 shadow-xs">
                <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain dark:invert dark:brightness-125" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                voicekhata
                <span className="size-1 rounded-full bg-blue-500" />
              </span>
              <span className="text-slate-500 dark:text-slate-400">— Digital Voice Ledger</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Engineered for retail counters, kirana stores, and small businesses in India 🇮🇳
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-white transition-colors">How Voice Works</a>
            <a href="#businesses" className="hover:text-blue-600 dark:hover:text-white transition-colors">Categories</a>
            <a href="#benefits" className="hover:text-blue-600 dark:hover:text-white transition-colors">Benefits</a>
            <a href="#reviews" className="hover:text-blue-600 dark:hover:text-white transition-colors">Reviews</a>
            <a href="#feedback" className="hover:text-blue-600 dark:hover:text-white text-blue-600 dark:text-blue-400 transition-colors">Feedback</a>
            <a href="#faqs" className="hover:text-blue-600 dark:hover:text-white transition-colors">FAQs</a>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">© 2026 VoiceKhata. All rights reserved.</p>
        </div>
      </footer>

      {/* 15. Mobile Sticky Action Bar */}
      <ShopkeeperBottomStickyCTA />

    </div>
  );
}

export default ShopkeeperLanding;
