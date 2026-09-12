import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mic, ArrowRight } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function ShopkeeperNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#334155] bg-[#0F172A]/95 backdrop-blur-xs font-sans">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-[8px] bg-[#1E293B] border border-[#5C6BC0]/30 p-1.5 shadow-xs">
            <img src={logoImg} alt="VoiceKhata Logo" className="w-full h-full object-contain invert brightness-125" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#F8FAFC] leading-none">
              Voice<span className="text-[#818CF8]">Khata</span>
            </span>
            <span className="text-[10px] font-medium text-[#94A3B8] leading-tight mt-0.5">
              Khata likhna. Ab bas bolkar.
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#94A3B8]">
          <a href="#how-it-works" className="hover:text-[#F8FAFC] transition-colors">How Voice Works</a>
          <a href="#preview" className="hover:text-[#F8FAFC] transition-colors">Product Preview</a>
          <a href="#businesses" className="hover:text-[#F8FAFC] transition-colors">Who It's For</a>
          <a href="#benefits" className="hover:text-[#F8FAFC] transition-colors">Benefits</a>
          <a href="#faqs" className="hover:text-[#F8FAFC] transition-colors">FAQs</a>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-[8px] bg-[#5C6BC0] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#4F5B93] active:scale-[0.98] transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default ShopkeeperNavbar;

