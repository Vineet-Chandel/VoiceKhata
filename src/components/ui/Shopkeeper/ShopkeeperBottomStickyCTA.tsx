import React from "react";
import { Link } from "react-router-dom";
import { Mic, ArrowRight } from "lucide-react";

export function ShopkeeperBottomStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-rose-500/30 bg-[#07090e]/95 p-3 backdrop-blur-xl shadow-2xl font-sans">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white font-heading">VoiceKhata</span>
          <span className="text-[10px] text-rose-400 font-semibold">
            Zero-Typing Voice Ledger
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#demo"
            className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300"
          >
            <Mic className="size-3.5 text-rose-400" />
            <span>Demo</span>
          </a>

          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-rose-600/30 active:scale-95 transition-transform font-heading"
          >
            <span>Get Started</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ShopkeeperBottomStickyCTA;
