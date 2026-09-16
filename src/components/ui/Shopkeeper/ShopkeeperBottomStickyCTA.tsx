// src/components/ui/Shopkeeper/ShopkeeperBottomStickyCTA.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Mic, ArrowRight } from "lucide-react";

export function ShopkeeperBottomStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F15]/95 p-3 backdrop-blur-xl shadow-2xl font-sans">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#0B0F15] dark:text-white">VoiceKhata</span>
            <span className="size-1.5 rounded-full bg-[#D2F832]" />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Zero-Typing Voice Ledger
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1320] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <span>Login</span>
          </Link>

          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-full bg-[#0B0F15] hover:bg-black text-white px-4 py-2 text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="size-3 text-[#D2F832]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ShopkeeperBottomStickyCTA;
