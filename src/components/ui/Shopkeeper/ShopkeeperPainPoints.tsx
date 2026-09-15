// src/components/ui/Shopkeeper/ShopkeeperPainPoints.tsx
"use client"

import React from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Check, 
  Zap, 
  Globe2, 
  WifiOff, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  XCircle
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export function ShopkeeperPainPoints() {
  const capabilities = [
    {
      feature: "Rush Hour Speed (<3 Seconds)",
      desc: "Speak and record while handing over items to customers",
      voicekhata: "Instant (Voice)",
      legacy: "Missed / Postponed"
    },
    {
      feature: "Zero Typing Requirement",
      desc: "No small phone keyboard struggles with shop-dusted hands",
      voicekhata: "100% Voice First",
      legacy: "Tedious Typing / Pen"
    },
    {
      feature: "Indian Retail Dialects (Hindi / Hinglish)",
      desc: "Understands udhar, jama, baki, cash and customer names naturally",
      voicekhata: "Native Support",
      legacy: "English-Only / Rigid"
    },
    {
      feature: "Automated Cloud & Offline Sync",
      desc: "Works without active internet, auto-syncs when signal restores",
      voicekhata: "Protected 100%",
      legacy: "Paper Tears / Water Damage"
    },
    {
      feature: "1-Tap WhatsApp Payment Reminders",
      desc: "Recover customer dues 3x faster with gentle payment links",
      voicekhata: "Included",
      legacy: "Awkward Phone Calls"
    }
  ];

  return (
    <section id="benefits" className="py-20 sm:py-28 bg-[#060913] border-b border-[#1E2D4A]/80 font-sans relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/8 blur-[160px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
        
        {/* Synex Section Header with Blur-Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400 bg-blue-600/15 border border-blue-500/30 px-3.5 py-1.5 rounded-full">
            WHY VOICEKHATA
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight leading-[1.1]">
            Built for modern capital. <br />
            <span className="text-slate-400 font-medium">Not legacy systems.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Connect speech, credit ledger, and payments — all synchronized in one unified counter system for real-time visibility and control.
          </p>
        </motion.div>

        {/* Synex 3-Column Comparison Table with Floating VoiceKhata Highlight Card */}
        <motion.div 
          initial={{ opacity: 0.5, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[28px] border border-[#1E2D4A] bg-[#0A0F1D]/90 p-6 sm:p-10 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Column 1: Core Capabilities (md:col-span-5) */}
            <div className="md:col-span-5 space-y-6">
              <div className="border-b border-[#1E2D4A] pb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 block">
                  Core Capabilities
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Essential features for busy Indian shop counters
                </p>
              </div>

              <div className="space-y-6">
                {capabilities.map((cap, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{cap.feature}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Floating Elevated VoiceKhata Card (md:col-span-4) */}
            <div className="md:col-span-4">
              <motion.div 
                whileHover={{ y: -4 }}
                className="rounded-3xl border-2 border-blue-500/60 bg-gradient-to-b from-[#0E172E] via-[#0B1224] to-[#0A0F1D] p-6 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.25)] space-y-6 relative"
              >
                {/* VoiceKhata Top Pill */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-blue-500/30">
                  <div className="size-8 rounded-xl bg-[#060A12] border border-blue-500/40 p-1.5 flex items-center justify-center">
                    <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white tracking-wide flex items-center gap-1.5">
                      VoiceKhata
                      <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                    </span>
                    <span className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">
                      Verified AI Ledger
                    </span>
                  </div>
                </div>

                {/* Capability Rows */}
                <div className="space-y-6">
                  {capabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="size-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {cap.voicekhata}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Tag */}
                <div className="pt-4 border-t border-blue-500/20 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Merchant Setup Cost</span>
                  <span className="text-blue-400 font-black tracking-wide">₹ 0 · Free Forever</span>
                </div>
              </motion.div>
            </div>

            {/* Column 3: Legacy Platforms & Paper (md:col-span-3) */}
            <div className="md:col-span-3 space-y-6 pl-0 md:pl-4 opacity-60">
              <div className="border-b border-[#1E2D4A] pb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 block">
                  Paper & Clunky Apps
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Traditional manual bookkeeping
                </p>
              </div>

              <div className="space-y-6">
                {capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                      <X className="size-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {cap.legacy}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#1E2D4A] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Credit Leakage</span>
                <span className="text-rose-400 font-bold">10-15% Uncollected</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default ShopkeeperPainPoints;
