// src/components/ui/Shopkeeper/ShopkeeperActivityMarquee.tsx
"use client"

import React from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Zap, ShieldCheck, Mic, ArrowUpRight } from "lucide-react";

export function ShopkeeperActivityMarquee() {
  const activities = [
    {
      type: "voice",
      title: "Voice Dialect Auto-Adapted",
      desc: "Hinglish speech logged · Dadar Kirana Store",
      time: "Just now",
      badge: "2.1s"
    },
    {
      type: "upi",
      title: "PhonePe UPI Auto-Matched",
      desc: "₹1,200 Jama verified · Jaipur Hardware",
      time: "1m ago",
      badge: "₹1,200"
    },
    {
      type: "backup",
      title: "Cloud Ledger Encrypted",
      desc: "50,000+ shops synchronized · 0 data loss",
      time: "2m ago",
      badge: "100% Backed"
    },
    {
      type: "reminder",
      title: "WhatsApp Payment Link Sent",
      desc: "Automated gentle reminder · Ramesh Stores",
      time: "3m ago",
      badge: "₹500 Due"
    },
    {
      type: "voice",
      title: "Fast Rush-Hour Record",
      desc: "Sharma ji 5kg atta ₹210 udhar · Zero typing",
      time: "4m ago",
      badge: "1.9s"
    }
  ];

  // Double array for continuous seamless infinite marquee loop
  const marqueeItems = [...activities, ...activities];

  return (
    <div className="py-8 bg-[#070B16] border-y border-[#1E2D4A]/80 overflow-hidden font-sans relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          <Activity className="size-3.5 text-blue-400 animate-pulse" />
          <span>LIVE SYSTEM ACTIVITY</span>
        </div>
        <span className="text-[11px] font-mono text-blue-400 bg-blue-600/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
          Real-Time Sync Active
        </span>
      </div>

      {/* Marquee Track */}
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          className="flex gap-4 shrink-0"
        >
          {marqueeItems.map((item, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-3.5 rounded-2xl border border-[#1E2D4A] bg-[#0A0F1D] px-5 py-3 shadow-md shrink-0 hover:border-blue-500/50 transition-colors"
            >
              <div className="size-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                {item.type === "voice" && <Mic className="size-4" />}
                {item.type === "upi" && <Zap className="size-4" />}
                {item.type === "backup" && <ShieldCheck className="size-4" />}
                {item.type === "reminder" && <CheckCircle2 className="size-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] font-bold text-blue-300 bg-blue-950/80 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ShopkeeperActivityMarquee;
