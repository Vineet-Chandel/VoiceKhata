import React from "react";
import { Link } from "react-router-dom";
import { Mic, ShieldCheck, PhoneCall, ArrowRight } from "lucide-react";

export function ShopkeeperNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-900/20 bg-neutral-950/95 backdrop-blur-md">
      {/* Top micro-trust banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900/60 to-neutral-950 px-4 py-1 text-center text-[11px] sm:text-xs text-emerald-300 font-medium border-b border-emerald-800/30 flex items-center justify-center gap-2">
        <span>🇮🇳 <strong>100% मेड इन भारत</strong> — 5 लाख+ भारतीय दुकानदारों का भरोसेमंद साथी</span>
        <span className="hidden md:inline text-emerald-400">• सुरक्षित एवं 100% मुफ़्त</span>
      </div>

      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-500/30">
            <Mic className="size-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white leading-none">
              Voice<span className="text-emerald-400">खाता</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-400/90 tracking-wider uppercase mt-0.5">
              बोलकर हिसाब लिखें
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <a href="#demo" className="hover:text-emerald-400 transition-colors">लाइव बोलकर देखें</a>
          <a href="#comparison" className="hover:text-emerald-400 transition-colors">फायदे</a>
          <a href="#dukandar" className="hover:text-emerald-400 transition-colors">किन दुकानों के लिए</a>
          <a href="#reviews" className="hover:text-emerald-400 transition-colors">दुकानदारों की राय</a>
          <a href="#faqs" className="hover:text-emerald-400 transition-colors">सवाल-जवाब</a>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="#demo"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Mic className="size-3.5" />
            फ्री डेमो
          </a>

          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
          >
            <span>शुरू करें (फ्री)</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default ShopkeeperNavbar;
