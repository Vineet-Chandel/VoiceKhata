// src/components/ui/Shopkeeper/ShopkeeperNavbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Globe } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function ShopkeeperNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E2D4A]/80 bg-[#060A12]/90 backdrop-blur-md font-sans">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand Logo (Synex style: clean modern bold with blue accent dot) */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#0F172A] border border-blue-500/30 p-1.5 shadow-sm group-hover:border-blue-400/60 transition-colors">
            <img src={logoImg} alt="VoiceKhata Logo" className="w-full h-full object-contain invert brightness-125" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#F8FAFC] leading-none flex items-center gap-1">
              voicekhata
              <span className="size-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            </span>
            <span className="text-[10px] font-medium text-slate-400 leading-tight mt-0.5">
              Khata likhna. Ab bas bolkar.
            </span>
          </div>
        </Link>

        {/* Centered Navigation (Synex style uppercase with wide tracking) */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-300">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#businesses" className="hover:text-white transition-colors">Categories</a>
          <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
          <Link to="/feedback" className="hover:text-white text-blue-400 transition-colors flex items-center gap-1">
            <span>Feedback</span>
          </Link>
          <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
        </div>

        {/* Right CTAs (Synex style pill button with arrow + Theme toggle) */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            to="/login"
            className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Log In
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-full bg-[#0F172A] hover:bg-[#1E293B] border border-blue-500/40 hover:border-blue-400 px-4.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/10 active:scale-[0.98] transition-all"
          >
            <span>Launch app</span>
            <ArrowRight className="size-3.5 text-blue-400" />
          </Link>
        </div>

      </nav>
    </header>
  );
}

export default ShopkeeperNavbar;
