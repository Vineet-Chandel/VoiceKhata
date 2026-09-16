// src/components/Pages/ShopkeeperLanding.tsx
"use client"

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Lock
} from "lucide-react";

import ShopkeeperNavbar from "@/components/ui/Shopkeeper/ShopkeeperNavbar";
import ShopkeeperHero from "@/components/ui/Shopkeeper/ShopkeeperHero";
import ShopkeeperSteps from "@/components/ui/Shopkeeper/ShopkeeperSteps";
import ShopkeeperFeatureDuo from "@/components/ui/Shopkeeper/ShopkeeperFeatureDuo";
import ShopkeeperPainPoints from "@/components/ui/Shopkeeper/ShopkeeperPainPoints";
import ShopkeeperPulseBanner from "@/components/ui/Shopkeeper/ShopkeeperPulseBanner";
import ShopkeeperRealTimeFeature from "@/components/ui/Shopkeeper/ShopkeeperRealTimeFeature";
import ShopkeeperCategories from "@/components/ui/Shopkeeper/ShopkeeperCategories";
import ShopkeeperTestimonials from "@/components/ui/Shopkeeper/ShopkeeperTestimonials";
import ShopkeeperFeedback from "@/components/ui/Shopkeeper/ShopkeeperFeedback";
import ShopkeeperFAQ from "@/components/ui/Shopkeeper/ShopkeeperFAQ";
import ShopkeeperBottomStickyCTA from "@/components/ui/Shopkeeper/ShopkeeperBottomStickyCTA";
import logoImg from "@/assets/logo.png";

export function ShopkeeperLanding() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-[#070A11] text-[#0B0F15] dark:text-[#F8FAFC] font-sans pb-16 md:pb-0 transition-colors">
      
      {/* 1. Header Navigation */}
      <ShopkeeperNavbar />

      <main className="relative z-10">
        
        {/* 2. Hero Section with Layered Product Visualization */}
        <ShopkeeperHero />

        {/* 3. Core Capability Highlights with Editorial Spacing */}
        <section className="border-y border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1320] py-10 transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
              <div className="pt-4 sm:pt-0 sm:px-4">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-3xl sm:text-4xl font-black text-[#0B0F15] dark:text-white tabular-nums tracking-tight">&lt; 3 Sec</p>
                  <span className="size-2 rounded-full bg-[#D2F832]" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Voice-to-Ledger Entry</p>
              </div>

              <div className="pt-4 sm:pt-0 sm:px-4">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-3xl sm:text-4xl font-black text-[#0B0F15] dark:text-white tabular-nums tracking-tight">0</p>
                  <span className="size-2 rounded-full bg-[#D2F832]" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Typing Required</p>
              </div>

              <div className="pt-4 sm:pt-0 sm:px-4">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-3xl sm:text-4xl font-black text-[#0B0F15] dark:text-white tabular-nums tracking-tight">1-Click</p>
                  <span className="size-2 rounded-full bg-[#D2F832]" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Instant UPI Reminders</p>
              </div>

              <div className="pt-4 sm:pt-0 sm:px-4">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-3xl sm:text-4xl font-black text-[#0B0F15] dark:text-white tabular-nums tracking-tight">100%</p>
                  <span className="size-2 rounded-full bg-[#D2F832]" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Private & Cloud-Backed</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Two Wide Feature Bento Cards ("Get the Most Out of Your Daily Khata") */}
        <ShopkeeperFeatureDuo />

        {/* 5. How Voice Works (Three Simple Steps) */}
        <ShopkeeperSteps />

        {/* 6. Advantages & Pain Points with 2x2 Bento Grid */}
        <ShopkeeperPainPoints />

        {/* 7. Dark Mid-page Pulse Banner with Protruding Phone */}
        <ShopkeeperPulseBanner />

        {/* 9. Real-Time Khata Feature & 10,000+ Shopkeepers */}
        <ShopkeeperRealTimeFeature />

        {/* 10. Target Verticals (Kiranas, Chemists, Hardware, Wholesale) */}
        <ShopkeeperCategories />

        {/* 11. Authentic Merchant Stories & Testimonials */}
        <ShopkeeperTestimonials />

        {/* 12. Community Feedback from Repo */}
        <ShopkeeperFeedback />

        {/* 13. FAQs */}
        <ShopkeeperFAQ />

        {/* 14. Final Call to Action */}
        <section className="py-20 sm:py-28 bg-white dark:bg-[#070A11] transition-colors border-t border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Get Started
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
              Ready to Simplify Your Daily Khata?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
              Open VoiceKhata today. Record customer dues, supplier payments, and cash movement in seconds.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="flex items-center gap-2.5 rounded-full bg-[#0B0F15] hover:bg-black text-white px-8 py-4 text-sm font-bold shadow-lg transition-all active:scale-[0.98] group"
              >
                <span>Launch Digital Khata</span>
                <div className="size-5 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-3 stroke-[2.5]" />
                </div>
              </Link>
            </div>
            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#D2F832] dark:text-emerald-500" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#D2F832] dark:text-emerald-500" />
                Free for Indian Counter Retail
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* 15. Jet-Black Editorial Footer matching Reference Image */}
      <footer className="border-t border-slate-900 bg-[#0B0F15] text-slate-400 pt-16 pb-12 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-1.5 shadow-xs">
                  <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-white tracking-tight">
                    Voice<span className="text-[#D2F832]">Khata</span>
                  </span>
                  <span className="size-1.5 rounded-full bg-[#D2F832]" />
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Engineered for retail counters, kirana stores, and small businesses in India 🇮🇳. Zero-typing voice accounting and instant UPI collection.
              </p>

              <div className="pt-2 flex items-center gap-3 text-slate-500">
                <span className="size-2 rounded-full bg-[#D2F832] animate-pulse" />
                <span className="text-[11px]">Server Status: Operational & Secure</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
              <div className="flex flex-col space-y-2 text-slate-400">
                <a href="#how-it-works" className="hover:text-white transition-colors">How Voice Works</a>
                <a href="#businesses" className="hover:text-white transition-colors">Who It's For</a>
                <a href="#benefits" className="hover:text-white transition-colors">Benefits & Comparison</a>
                <a href="#reviews" className="hover:text-white transition-colors">Merchant Reviews</a>
                <Link to="/feedback" className="hover:text-white transition-colors text-[#D2F832]">Give Product Feedback</Link>
                <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
              </div>
            </div>

            {/* Newsletter Column matching Reference Image */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Updates & Features</h4>
              <p className="text-xs text-slate-400">
                Get weekly merchant tips, tax updates, and feature releases.
              </p>

              <form onSubmit={handleSubscribe} className="pt-1 flex items-center gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-full bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#D2F832] transition-colors"
                />
                <button
                  type="submit"
                  className="size-9 rounded-full bg-[#D2F832] text-[#0B0F15] flex items-center justify-center shrink-0 font-bold hover:bg-[#c2e825] transition-colors cursor-pointer"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </button>
              </form>

              {subscribed && (
                <p className="text-[11px] text-emerald-400">Thank you for subscribing!</p>
              )}
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© 2026 VoiceKhata. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
              <Link to="/about" className="hover:text-slate-400 transition-colors">About Us</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* 16. Mobile Sticky Action Bar */}
      <ShopkeeperBottomStickyCTA />

    </div>
  );
}

export default ShopkeeperLanding;
