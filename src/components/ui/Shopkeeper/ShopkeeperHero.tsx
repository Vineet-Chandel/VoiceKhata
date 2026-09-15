// src/components/ui/Shopkeeper/ShopkeeperHero.tsx
"use client"

import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform,
  useScroll,
  AnimatePresence
} from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Mic, 
  Wifi, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Mouse, 
  Layers, 
  Activity, 
  Volume2, 
  Store, 
  CheckCircle2, 
  Zap,
  Play,
  RotateCcw
} from "lucide-react";
import shopkeeperIllustrationImg from "@/assets/shopkeeper_illustration.png";

export function ShopkeeperHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 180, damping: 24 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Scroll-linked transition (Synex hero scroll)
  const { scrollYProgress } = useScroll();

  const scrollScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.94]);
  const scrollRotateX = useTransform(scrollYProgress, [0, 0.15], [0, 8]);
  const scrollY = useTransform(scrollYProgress, [0, 0.15], [0, 40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.8]);

  const mouseRotateX = useTransform(smoothY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const mouseRotateY = useTransform(smoothX, [-0.5, 0.5], ["-3deg", "3deg"]);

  // Interactive Voice Simulation State Machine
  const [activeVoiceSnippet, setActiveVoiceSnippet] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<"idle" | "listening" | "parsing" | "settled">("idle");
  const [totalBalance, setTotalBalance] = useState(142850);

  const voiceSnippets = [
    {
      phrase: "₹500 का उधार दिया - रमेश किराना स्टोर",
      party: "Ramesh Kirana (Dadar)",
      type: "Udhar (Debit)",
      amount: "₹ 500",
      numericAmount: 500,
      time: "2.1s",
      badge: "Udhar Recorded",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/30"
    },
    {
      phrase: "Sunil Verma paid 1200 rupees via PhonePe UPI",
      party: "Sunil Verma",
      type: "Jama (Credit)",
      amount: "₹ 1,200",
      numericAmount: 1200,
      time: "1.8s",
      badge: "UPI Settle",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30"
    },
    {
      phrase: "Sharma ji ne 5kg atta liya ₹210 udhar",
      party: "Sharma ji Provisions",
      type: "Udhar (Debit)",
      amount: "₹ 210",
      numericAmount: 210,
      time: "2.4s",
      badge: "Instant Ledger",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/30"
    }
  ];

  // Trigger live simulation
  const handlePlaySimulation = (index?: number) => {
    const targetIndex = index !== undefined ? index : (activeVoiceSnippet + 1) % voiceSnippets.length;
    setActiveVoiceSnippet(targetIndex);
    setIsSimulating(true);
    setSimulationStep("listening");

    setTimeout(() => {
      setSimulationStep("parsing");
      setTimeout(() => {
        setSimulationStep("settled");
        const added = voiceSnippets[targetIndex].numericAmount;
        setTotalBalance(prev => prev + added);
        setTimeout(() => {
          setIsSimulating(false);
          setSimulationStep("idle");
        }, 2200);
      }, 1000);
    }, 1100);
  };

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
    <section 
      ref={containerRef}
      className="relative pt-16 pb-20 lg:pt-24 lg:pb-36 bg-[#060913] border-b border-[#1E2D4A]/80 overflow-hidden font-sans"
    >
      {/* 1. Atmospheric Ambient Lighting Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1200px] h-[680px] bg-gradient-to-b from-blue-600/20 via-blue-900/10 to-transparent blur-[160px] rounded-full" />
        
        {/* Horizontal Horizon Glow */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-blue-500/12 blur-[140px] rounded-full" />

        {/* Fine Architectural Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2D4A18_1px,transparent_1px),linear-gradient(to_bottom,#1E2D4A18_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_15%,#000_65%,transparent_100%)] opacity-75" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2. Synex Monumental Blur-Fade In Headline Section */}
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          {/* Eyebrow Pill Tag with Blur Reveal */}
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-[#0C1322]/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-300 backdrop-blur-xl shadow-lg shadow-blue-950/50"
          >
            <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
            <span>VOICE FINTECH REIMAGINED</span>
          </motion.div>

          {/* Monumental Editorial Headline with Blur-In Transition */}
          <motion.h1 
            initial={{ opacity: 0, y: 35, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-[-0.04em] text-[#F8FAFC] leading-[1.04]"
          >
            <span className="block bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent font-medium">
              A New Standard
            </span>
            <span className="block mt-1 text-white">
              in Voice Accounting.
            </span>
          </motion.h1>

          {/* Subtitle with Soft Fade */}
          <motion.p 
            initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal pt-1"
          >
            Take full control of your counter receivables, credit dues, and store cashflow with a unified voice-first ledger. Speak in Hindi or English — 100% verified in 3 seconds, zero typing.
          </motion.p>

          {/* Dual Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-blue-600/40 transition-all cursor-pointer group"
            >
              <span>Launch Digital Khata</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={() => handlePlaySimulation()}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full border border-blue-500/40 bg-[#0C1322]/90 hover:bg-[#131C31] hover:border-blue-400 px-7 py-4 text-sm font-semibold text-blue-300 hover:text-white transition-all backdrop-blur-md cursor-pointer shadow-lg shadow-blue-950/40"
            >
              <Play className="size-4 text-blue-400 fill-blue-400" />
              <span>Simulate Voice Recording</span>
            </button>
          </motion.div>

          {/* Value Pillars */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium"
          >
            <div className="flex items-center gap-2">
              <Check className="size-4 text-blue-400" />
              <span>Zero Typing Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-blue-400" />
              <span>Review Before Save</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-blue-400" />
              <span>Instant WhatsApp Reminders</span>
            </div>
          </motion.div>
        </motion.div>

        {/* 3. Synex Panoramic Centerpiece Terminal with Floating Badges & Scroll-Linked 3D Transition */}
        <div className="mt-14 lg:mt-20 [perspective:1400px] flex justify-center relative">
          
          {/* Floating Badge 1: Top-Left (Captured Opportunity / Fast Settle) */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 120 }}
            className="absolute -top-7 left-2 lg:-left-6 z-30 hidden sm:flex items-center gap-3 rounded-2xl border border-blue-500/40 bg-[#0A1020]/95 px-4 py-3 shadow-2xl shadow-black/80 backdrop-blur-xl pointer-events-none"
          >
            <div className="size-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Zap className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">+₹1,200 UPI Jama</span>
                <span className="size-1.5 rounded-full bg-blue-400 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400">Auto-settled via PhonePe in 1.8s</p>
            </div>
          </motion.div>

          {/* Floating Badge 2: Top-Right (Voice Accuracy Signal) */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 120 }}
            className="absolute -top-7 right-2 lg:-right-6 z-30 hidden sm:flex items-center gap-3 rounded-2xl border border-blue-500/40 bg-[#0A1020]/95 px-4 py-3 shadow-2xl shadow-black/80 backdrop-blur-xl pointer-events-none"
          >
            <div className="size-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Activity className="size-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Voice Accuracy: 99.4%</span>
              </div>
              <p className="text-[10px] text-slate-400">Hindi, Hinglish & English Dialects</p>
            </div>
          </motion.div>

          {/* Floating Badge 3: Bottom-Right (Instant Undo Window) */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7, type: "spring", stiffness: 120 }}
            className="absolute -bottom-6 right-4 lg:-right-4 z-30 hidden md:flex items-center gap-3 rounded-2xl border border-blue-500/40 bg-[#0A1020]/95 px-4 py-2.5 shadow-2xl shadow-black/80 backdrop-blur-xl pointer-events-none"
          >
            <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              6-Sec Instant Undo Active · 0 Mistake Guarantee
            </span>
          </motion.div>

          {/* The Main 3D Terminal Container */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 60, scale: 0.94, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              scale: scrollScale,
              rotateX: mouseRotateX,
              rotateY: mouseRotateY,
              y: scrollY,
              transformStyle: "preserve-3d",
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="w-full max-w-6xl rounded-[32px] border border-[#1E2D4A] bg-[#0A0F1D]/95 backdrop-blur-2xl shadow-2xl shadow-black/90 overflow-hidden transition-shadow hover:shadow-blue-900/30"
          >
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D4A] bg-[#070B16]">
              <div className="flex items-center gap-2.5">
                <span className="size-3 rounded-full bg-rose-500/80" />
                <span className="size-3 rounded-full bg-amber-500/80" />
                <span className="size-3 rounded-full bg-blue-500/80" />
                <div className="ml-4 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F172A] border border-slate-800 text-xs text-slate-400 font-mono">
                  <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>voicekhata.app/terminal</span>
                </div>
              </div>

              {/* Timeframe & Mode Pills */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 rounded-full bg-[#0F172A] border border-[#1E2D4A] p-1 text-[10px] font-bold text-slate-300">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">TODAY</span>
                  <span className="px-2.5 py-0.5 rounded-full hover:text-white cursor-pointer transition-colors">WEEK</span>
                  <span className="px-2.5 py-0.5 rounded-full hover:text-white cursor-pointer transition-colors">MONTH</span>
                </div>
                <span className="text-xs font-semibold text-blue-400 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-blue-400 animate-ping" />
                  Live Counter
                </span>
              </div>
            </div>

            {/* Terminal Body: 3-Column Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1E2D4A]">
              
              {/* Left Column: Synex Floating Capsule Sidebar */}
              <div className="lg:col-span-3 p-5 sm:p-6 bg-[#080D1A] flex flex-col justify-between space-y-6">
                
                {/* Store Capsule */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0F172A] border border-[#1E2D4A]">
                    <div className="size-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                      <Store className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">Gupta Kirana Store</p>
                      <p className="text-[10px] text-slate-400">Dadar West, Mumbai</p>
                    </div>
                  </div>

                  {/* Terminal Navigation Menu */}
                  <div className="space-y-1 text-xs font-medium text-slate-400">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold">
                      <span className="flex items-center gap-2">
                        <Activity className="size-3.5" />
                        Counter Terminal
                      </span>
                      <span className="size-1.5 rounded-full bg-blue-400" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      <span className="flex items-center gap-2">
                        <Mic className="size-3.5" />
                        Voice Audio Logs
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">140+</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="size-3.5" />
                        Customer Dues
                      </span>
                      <span className="text-[10px] text-rose-400 font-bold">₹32.4K</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="size-3.5" />
                        Bank Backup
                      </span>
                      <span className="text-[10px] text-blue-400 font-bold">100%</span>
                    </div>
                  </div>
                </div>

                {/* Shopkeeper Photo & Voice Badge */}
                <div className="rounded-2xl border border-[#1E2D4A] bg-[#0B1120] p-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full overflow-hidden border border-blue-500/40 bg-slate-700 shrink-0">
                      <img 
                        src={shopkeeperIllustrationImg} 
                        alt="Indian Shopkeeper" 
                        className="w-full h-full object-cover scale-150 translate-x-1" 
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Ramesh Gupta</p>
                      <p className="text-[10px] text-blue-400 font-medium">Verified Merchant</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Counter rush hour me bolkar khata likhna sabse asan hai."
                  </p>
                </div>

              </div>

              {/* Center & Right Viewport: Financial Terminal + Voice Audio Frequency */}
              <div className="lg:col-span-9 p-6 sm:p-8 space-y-6 bg-[#0A0F1D]">
                
                {/* Capital Under Control / Total Balance Banner */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1E2D4A] pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        TOTAL KHATA BALANCE UNDER CONTROL
                      </span>
                      <span className="rounded-full bg-blue-950/70 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                        +14.2% Today
                      </span>
                    </div>
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mt-1">
                      ₹ {totalBalance.toLocaleString("en-IN")}.00
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Daily customer credits, cash settlements & bank UPI transfers
                    </p>
                  </div>

                  {/* 3 Quick Breakdown Pills */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="px-3.5 py-2 rounded-xl bg-[#0F172A] border border-[#1E2D4A] text-left">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Cash In</span>
                      <span className="text-sm font-bold text-white">₹ 84,200</span>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-[#0F172A] border border-[#1E2D4A] text-left">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Udhar Dues</span>
                      <span className="text-sm font-bold text-rose-400">₹ 32,450</span>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-[#0F172A] border border-[#1E2D4A] text-left">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">UPI Auto</span>
                      <span className="text-sm font-bold text-blue-400">₹ 26,200</span>
                    </div>
                  </div>
                </div>

                {/* Synex High-Frequency Vertical Barcode Chart (Dynamic Reactive Waveform) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span className="flex items-center gap-2 text-white">
                      <Volume2 className={`size-4 text-blue-400 ${isSimulating ? "animate-bounce" : "animate-pulse"}`} />
                      Voice Input Frequency & Real-Time Audio Signal
                    </span>
                    <span className="text-blue-400 font-mono text-[11px]">
                      {isSimulating ? "Active Mic Processing..." : "140 Transactions Logged Today"}
                    </span>
                  </div>

                  <div className="h-20 sm:h-24 w-full rounded-2xl bg-[#080D1A] border border-[#1E2D4A] p-3 flex items-end justify-between gap-1 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none" />
                    
                    {[
                      25, 38, 52, 68, 45, 75, 92, 100, 72, 58, 42, 80, 95, 100, 84, 70, 55, 75, 92, 65,
                      48, 85, 96, 82, 70, 90, 100, 78, 65, 54, 72, 88, 100, 94, 80, 65, 50, 75, 90, 96,
                      70, 60, 82, 95, 100, 90, 75, 65, 80, 92, 100, 85, 72, 60, 75, 90, 95, 80, 65, 50
                    ].map((baseHeight, idx) => {
                      // Dynamically wiggle heights if simulating
                      const animatedHeight = isSimulating 
                        ? Math.min(100, Math.max(15, baseHeight + (idx % 3 === 0 ? 25 : -15)))
                        : baseHeight;
                      
                      return (
                        <div
                          key={idx}
                          style={{ height: `${animatedHeight}%` }}
                          className={`w-1 sm:w-1.5 rounded-full transition-all duration-200 ${
                            isSimulating
                              ? idx % 2 === 0 ? "bg-blue-400 shadow-[0_0_8px_#3B82F6]" : "bg-blue-600"
                              : idx % 5 === 0 
                              ? "bg-blue-400" 
                              : idx % 2 === 0 
                              ? "bg-blue-600/70" 
                              : "bg-[#1E2D4A]"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Live Interactive Voice-to-Ledger Animated Card */}
                <div className="rounded-2xl bg-[#0F172A] border border-blue-500/40 p-4 sm:p-5 space-y-3 shadow-xl relative overflow-hidden">
                  
                  {/* Subtle Shimmer Bar during simulation */}
                  {isSimulating && (
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                      className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                    />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`size-7 rounded-full flex items-center justify-center transition-colors ${
                        simulationStep === "listening"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                          : simulationStep === "parsing"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-spin"
                          : simulationStep === "settled"
                          ? "bg-blue-500/30 text-blue-400 border border-blue-500/50"
                          : "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                      }`}>
                        <Mic className="size-4" />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {simulationStep === "listening" && "Listening to Spoken Audio..."}
                        {simulationStep === "parsing" && "AI Neural Engine Parsing..."}
                        {simulationStep === "settled" && "✓ Verified & Saved to Khata"}
                        {simulationStep === "idle" && "Live Voice Parse Simulation:"}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-300 bg-blue-600/20 px-2 py-0.5 rounded-full">
                        {voiceSnippets[activeVoiceSnippet].badge}
                      </span>
                    </div>

                    {/* Quick Trigger Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlaySimulation()}
                        disabled={isSimulating}
                        className="text-[11px] font-bold text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Play className="size-3 fill-blue-400 text-blue-400" />
                        <span>Run Demo</span>
                      </button>

                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                        {voiceSnippets.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handlePlaySimulation(i)}
                            className={`size-2.5 rounded-full transition-all cursor-pointer ${
                              activeVoiceSnippet === i ? "bg-blue-400 scale-125" : "bg-slate-700 hover:bg-slate-500"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Spoken Text Box */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeVoiceSnippet + simulationStep}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-3 rounded-xl bg-[#080D1A] border border-[#1E2D4A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
                    >
                      <p className="text-slate-200">
                        "{voiceSnippets[activeVoiceSnippet].phrase}"
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-[#0F172A] text-blue-400 border border-blue-500/30 font-bold text-[11px]">
                          {voiceSnippets[activeVoiceSnippet].amount}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Parsed in {voiceSnippets[activeVoiceSnippet].time}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                      <CheckCircle2 className="size-3.5" />
                      Auto-matched: {voiceSnippets[activeVoiceSnippet].party}
                    </span>
                    <span className="text-slate-400 font-medium">
                      Customer balance updated · 6-sec undo available
                    </span>
                  </div>
                </div>

                {/* Synex Bottom Scroll Indicator */}
                <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                  <Mouse className="size-3.5 text-blue-400 animate-bounce" />
                  <span>✦ Scroll to explore features & live merchant reviews</span>
                </div>

              </div>

            </div>

          </motion.div>
        </div>

        {/* 4. Synex Clean Trust Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-14 text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-4">
            TRUSTED BY 50,000+ INDIAN KIRANAS & COUNTER BUSINESSES
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {["Kirana Stores", "Medical Chemists", "Hardware & Electricals", "Apparel & Garments", "Dairy & Sweets", "Wholesale Counters"].map((cat, i) => (
              <span 
                key={i}
                className="text-xs font-semibold text-slate-300 bg-[#0A0F1D] border border-[#1E2D4A] px-4 py-2 rounded-full shadow-sm hover:border-blue-500/40 hover:text-white transition-all"
              >
                {cat}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default ShopkeeperHero;
