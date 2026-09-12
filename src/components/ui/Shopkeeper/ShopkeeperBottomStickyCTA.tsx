import React from "react";
import { Link } from "react-router-dom";
import { Mic, ArrowRight } from "lucide-react";

export function ShopkeeperBottomStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-slate-700/40 bg-[#0B0F19]/95 p-3 backdrop-blur-xl shadow-2xl font-sans">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#F8FAFC]">Voice<span className="text-blue-500">Khata</span></span>
          <span className="text-[10px] text-[#94A3B8] font-medium">
            Zero-Typing Voice Ledger
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-[8px] border border-slate-800 bg-[#131B2E] px-3 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <span>Login</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-[8px] bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-xs active:scale-95 transition-all"
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
