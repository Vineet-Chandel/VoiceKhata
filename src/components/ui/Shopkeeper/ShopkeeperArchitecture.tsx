// src/components/ui/Shopkeeper/ShopkeeperArchitecture.tsx
"use client"

import React from "react";
import { motion } from "framer-motion";
import { 
  Mic, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  Globe2, 
  Sparkles 
} from "lucide-react";
import logoImg from "@/assets/logo.png";

export function ShopkeeperArchitecture() {
  return (
    <section className="py-20 sm:py-28 bg-[#060913] border-b border-[#1E2D4A]/80 font-sans relative overflow-hidden">
      
      {/* Ambient glow behind schematic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Synex Section Header with Blur-Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 35, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400 bg-blue-600/15 border border-blue-500/30 px-3.5 py-1.5 rounded-full">
            CORE CAPABILITIES
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-black text-[#F8FAFC] tracking-tight leading-[1.08]">
            One platform. <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-200 to-white bg-clip-text text-transparent">
              Multiple intelligence layers.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Powering every counter interaction with specialized speech processing, automated ledger sync, and instant UPI reconciliation.
          </p>
        </motion.div>

        {/* Synex Interactive Intelligence Network Schematic */}
        <motion.div 
          initial={{ opacity: 0.4, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-[30px] border border-[#1E2D4A] bg-[#0A0F1D]/80 p-8 sm:p-12 backdrop-blur-xl shadow-2xl mb-16 overflow-hidden"
        >
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2D4A15_1px,transparent_1px),linear-gradient(to_bottom,#1E2D4A15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

          {/* SVG Animated Connector Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" xmlns="http://www.w3.org/2000/svg">
            {/* Center to Top-Left */}
            <line x1="50%" y1="50%" x2="20%" y2="22%" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
            {/* Center to Top-Right */}
            <line x1="50%" y1="50%" x2="80%" y2="22%" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
            {/* Center to Bottom-Left */}
            <line x1="50%" y1="50%" x2="20%" y2="78%" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
            {/* Center to Bottom-Right */}
            <line x1="50%" y1="50%" x2="80%" y2="78%" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
          </svg>

          {/* Center Hub: VOICEKHATA CORE */}
          <div className="relative z-10 flex flex-col items-center justify-center my-6 md:my-14">
            <motion.div 
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative p-6 sm:p-8 rounded-3xl border-2 border-blue-500/60 bg-[#0E1528] shadow-[0_0_50px_rgba(59,130,246,0.3)] text-center max-w-xs"
            >
              <div className="size-14 mx-auto rounded-2xl bg-[#060A12] border border-blue-500/40 p-2.5 flex items-center justify-center shadow-inner mb-3">
                <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wider uppercase">
                VOICEKHATA CORE
              </h3>
              <p className="text-[11px] text-blue-300 mt-1 font-mono">
                AI-powered orchestration & central ledger intelligence
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-[10px] font-bold text-blue-300">
                <span className="size-1.5 rounded-full bg-blue-400 animate-ping" />
                99.4% Parsing Engine
              </div>
            </motion.div>
          </div>

          {/* 4 Surrounding Orbit Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10 mt-8">
            
            {/* Node 1: AI Speech Dialect Layer */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "#60A5FA" }}
              className="p-5 rounded-2xl border border-[#1E2D4A] bg-[#0C1222]/90 backdrop-blur-md shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">[ 01 ]</span>
                <div className="size-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Mic className="size-4" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Speech Layer</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Understands Hindi, Hinglish, and retail slang across 50,000+ Indian merchants.
              </p>
            </motion.div>

            {/* Node 2: Automated UPI & Payment Links */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "#60A5FA" }}
              className="p-5 rounded-2xl border border-[#1E2D4A] bg-[#0C1222]/90 backdrop-blur-md shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">[ 02 ]</span>
                <div className="size-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Zap className="size-4" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">UPI Auto-Settle</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Instant WhatsApp payment reminders with dynamic QR codes. Money lands direct in bank.
              </p>
            </motion.div>

            {/* Node 3: Real-Time Ledger Engine */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "#60A5FA" }}
              className="p-5 rounded-2xl border border-[#1E2D4A] bg-[#0C1222]/90 backdrop-blur-md shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">[ 03 ]</span>
                <div className="size-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <TrendingUp className="size-4" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Udhar & Cash Ledger</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Continuous double-entry ledger with automatic customer balances and 6-sec undo.
              </p>
            </motion.div>

            {/* Node 4: Cloud & Offline Security */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "#60A5FA" }}
              className="p-5 rounded-2xl border border-[#1E2D4A] bg-[#0C1222]/90 backdrop-blur-md shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">[ 04 ]</span>
                <div className="size-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="size-4" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cloud Data Engine</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Encrypted bank-grade backups. Works without internet, auto-syncs when online.
              </p>
            </motion.div>

          </div>
        </motion.div>

        {/* Synex 3 Bottom Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-[#1E2D4A]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="size-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Unified Infrastructure</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Connect counter billing, customer ledger, and payment tracking into one structural system.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-start gap-4"
          >
            <div className="size-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Globe2 className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dialect Intelligence</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Analyze and process voice in Hindi, Hinglish, and retail terms with custom neural models.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-start gap-4"
          >
            <div className="size-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Zap className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Seamless Execution</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Say goodbye to fragmented paper books and apps — everything happens in one environment in 3 seconds.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperArchitecture;
