// src/components/ui/Shopkeeper/ShopkeeperDropcardFeature.tsx
"use client"

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, 
  Globe2, 
  ShieldCheck, 
  ArrowRight, 
  Wifi, 
  Sparkles
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export function ShopkeeperDropcardFeature() {
  return (
    <section className="py-20 sm:py-28 bg-[#0B1120] border-b border-[#1E2D4A]/80 font-sans relative overflow-hidden">
      
      {/* Soft background ambient glow */}
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading + Horizontal Card Showcase */}
          <motion.div 
            initial={{ opacity: 0, x: -35, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-8"
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400 bg-blue-600/15 border border-blue-500/30 px-3.5 py-1.5 rounded-full">
                NEXT-GEN VOICE ARCHITECTURE
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight leading-[1.12]">
                Financial ledger experience <br />
                <span className="text-blue-500">built for tomorrow.</span>
              </h2>
            </div>

            {/* Horizontal Smart Card Showcase (Synex + Dropcard styling) */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-md rounded-[26px] bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E3A8A]/50 border border-blue-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden text-white"
            >
              {/* Abstract curve overlays */}
              <div className="absolute -right-12 -bottom-12 size-48 rounded-full border border-blue-500/20 pointer-events-none" />
              <div className="absolute -left-10 -top-10 size-40 rounded-full border border-blue-500/10 pointer-events-none" />

              {/* Card Top: Logo & Contactless */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-[#060A12] border border-[#1E2D4A] p-1 flex items-center justify-center">
                    <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
                    voicekhata
                    <span className="size-1 rounded-full bg-blue-400" />
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-8 h-6 rounded bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-400/50 p-0.5 opacity-90">
                    <div className="w-full h-0.5 bg-amber-700/50 mt-1" />
                  </div>
                  <Wifi className="size-4 rotate-90" />
                </div>
              </div>

              {/* Card Center: Balance & Tagline */}
              <div className="space-y-1 mb-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Digital Voice Ledger</p>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ₹ 1,42,850.00
                </div>
                <p className="text-xs text-blue-400 font-medium">0 Typing · 100% Spoken Accuracy</p>
              </div>

              {/* Card Bottom: Holder Name & Network */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Merchant Account</span>
                  <span className="text-xs font-bold text-slate-200 tracking-wider">RAMESH KIRANA STORE</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Network</span>
                  <span className="text-xs font-black text-blue-400 tracking-widest">RuPay • UPI</span>
                </div>
              </div>

            </motion.div>

          </motion.div>

          {/* Right Column: Narrative + Action + 3 Feature Highlights */}
          <motion.div 
            initial={{ opacity: 0, x: 35, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-7"
          >
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              VoiceKhata was engineered from scratch to inspire effortless retail accounting. We provide the voice recognition and ledger tools you need to stop credit leakage, recover customer dues 3x faster, and run your shop with complete peace of mind.
            </p>

            <div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] px-7 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer group"
              >
                <span>Launch Digital Khata</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Feature Item Rows with Clean Geometric Icons */}
            <div className="space-y-5 pt-3 border-t border-[#1E2D4A]">
              
              {/* Feature 1: Rush Hour Speed */}
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-[#0F172A] border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Streamlined Rush Hour Logging</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Say "Ramesh ne ₹200 diye" in under 3 seconds. The ledger updates instantly in front of the customer without touching a pen or paper book.
                  </p>
                </div>
              </div>

              {/* Feature 2: Natural Dialects */}
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-[#0F172A] border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                  <Globe2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Speaks Your Everyday Retail Language</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Understands Hinglish, Hindi, and Indian retail vocabulary — "udhar", "jama", "baki", "advance", and "UPI payment".
                  </p>
                </div>
              </div>

              {/* Feature 3: Automated WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-[#0F172A] border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Automated Collection Reminders</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Send clean, polite payment links via WhatsApp with 1 tap. Customers click and settle through any UPI app.
                  </p>
                </div>
              </div>

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}

export default ShopkeeperDropcardFeature;
