import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Menu, X } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function ShopkeeperNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 dark:bg-[#0B0F15]/90 backdrop-blur-md transition-colors">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-[#0B0F15] text-white shadow-xs p-1.5 transition-transform group-hover:scale-105">
            <img src={logoImg} alt="VoiceKhata Logo" className="w-full h-full object-contain invert brightness-125" />
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#D2F832] border-2 border-white dark:border-[#0B0F15]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#0B0F15] dark:text-white leading-none">
                Voice<span className="text-[#0B0F15] dark:text-[#D2F832]">Khata</span>
              </span>
              <span className="inline-block size-1.5 rounded-full bg-[#D2F832]" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              Khata likhna. Ab bas bolkar.
            </span>
          </div>
        </Link>

        {/* Navigation links (Desktop) */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a href="#how-it-works" className="hover:text-[#0B0F15] dark:hover:text-white transition-colors">
            How Voice Works
          </a>
          <a href="#businesses" className="hover:text-[#0B0F15] dark:hover:text-white transition-colors">
            Who It's For
          </a>
          <a href="#benefits" className="hover:text-[#0B0F15] dark:hover:text-white transition-colors">
            Benefits
          </a>
          <a href="#reviews" className="hover:text-[#0B0F15] dark:hover:text-white transition-colors">
            Reviews
          </a>
          <Link
            to="/feedback"
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors"
          >
            <MessageSquare className="size-3.5 text-slate-900 dark:text-[#D2F832]" />
            <span>Feedback</span>
          </Link>
          <a href="#faqs" className="hover:text-[#0B0F15] dark:hover:text-white transition-colors">
            FAQs
          </a>
        </div>

        {/* Action CTAs (Desktop) */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="flex items-center gap-2 rounded-full bg-[#0B0F15] hover:bg-black text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <span>Get Started</span>
            <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-3 stroke-[2.5]" />
            </div>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F15] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              How Voice Works
            </a>
            <a
              href="#businesses"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Who It's For
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Benefits
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Reviews
            </a>
            <Link
              to="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MessageSquare className="size-4 text-[#D2F832]" />
              <span>Feedback</span>
            </Link>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              FAQs
            </a>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 rounded-full bg-[#0B0F15] text-white px-4 py-2 text-xs font-semibold"
              >
                <span>Get Started</span>
                <ArrowRight className="size-3 text-[#D2F832]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default ShopkeeperNavbar;
