import React from "react";
import { Link } from "react-router-dom";
import { Mic, ArrowRight, ShieldCheck } from "lucide-react";

export function ShopkeeperBottomStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-emerald-500/30 bg-neutral-950/95 p-3 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-white">VoiceKhata</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">
            100% फ्री • बोलकर हिसाब
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#demo"
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300"
          >
            <Mic className="size-3.5" />
            <span>डेमो</span>
          </a>

          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-extrabold text-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform"
          >
            <span>शुरू करें</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ShopkeeperBottomStickyCTA;
