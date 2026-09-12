import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mic, ArrowRight, MessageSquare } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function ShopkeeperNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/40 bg-[#0B0F19]/95 backdrop-blur-xs font-sans">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-[8px] bg-[#0E1322] border border-slate-800 p-1.5 shadow-xs">
            <img src={logoImg} alt="VoiceKhata Logo" className="w-full h-full object-contain invert brightness-125" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#F8FAFC] leading-none">
              Voice<span className="text-blue-500">Khata</span>
            </span>
            <span className="text-[10px] font-medium text-[#94A3B8] leading-tight mt-0.5">
              Khata likhna. Ab bas bolkar.
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#94A3B8]">
          <a href="#how-it-works" className="hover:text-[#F8FAFC] transition-colors">How Voice Works</a>
          <a href="#businesses" className="hover:text-[#F8FAFC] transition-colors">Who It's For</a>
          <a href="#benefits" className="hover:text-[#F8FAFC] transition-colors">Benefits</a>
          <a href="#reviews" className="hover:text-[#F8FAFC] transition-colors">Reviews</a>
          <Link to="/feedback" className="flex items-center gap-1.5 hover:text-[#F8FAFC] text-blue-400 transition-colors">
            <MessageSquare className="size-3.5" />
            <span>Feedback</span>
          </Link>
          <a href="#faqs" className="hover:text-[#F8FAFC] transition-colors">FAQs</a>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            Login
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-[8px] bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
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

