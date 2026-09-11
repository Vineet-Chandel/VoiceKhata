import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  PhoneCall, 
  CheckCircle2, 
  Lock, 
  Headphones, 
  Share2 
} from "lucide-react";

import ShopkeeperNavbar from "@/components/ui/Shopkeeper/ShopkeeperNavbar";
import ShopkeeperHero from "@/components/ui/Shopkeeper/ShopkeeperHero";
import ShopkeeperVoiceDemo from "@/components/ui/Shopkeeper/ShopkeeperVoiceDemo";
import ShopkeeperPainPoints from "@/components/ui/Shopkeeper/ShopkeeperPainPoints";
import ShopkeeperCategories from "@/components/ui/Shopkeeper/ShopkeeperCategories";
import ShopkeeperTestimonials from "@/components/ui/Shopkeeper/ShopkeeperTestimonials";
import ShopkeeperFAQ from "@/components/ui/Shopkeeper/ShopkeeperFAQ";
import ShopkeeperBottomStickyCTA from "@/components/ui/Shopkeeper/ShopkeeperBottomStickyCTA";

export function ShopkeeperLanding() {
  return (
    <div className="relative min-h-screen w-full bg-[#070709] text-white selection:bg-emerald-500/30 selection:text-emerald-200 pb-16 md:pb-0">
      
      {/* 1. Header Navigation */}
      <ShopkeeperNavbar />

      <main className="relative z-10">
        {/* 2. Hero Section targeting Indian Shopkeepers */}
        <ShopkeeperHero />

        {/* 3. Interactive Voice Demo & Live Ledger */}
        <ShopkeeperVoiceDemo />

        {/* 4. Pain Points & Solution Comparison */}
        <ShopkeeperPainPoints />

        {/* 5. Shopkeeper Verticals (Kirana, Hardware, Medical, etc.) */}
        <ShopkeeperCategories />

        {/* 6. Authentic Testimonials */}
        <ShopkeeperTestimonials />

        {/* 7. FAQs */}
        <ShopkeeperFAQ />

        {/* 8. Big Final CTA Banner */}
        <section className="py-14 sm:py-20 px-4 sm:px-6">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-neutral-900 to-black p-8 sm:p-14 text-center shadow-2xl">
            {/* Top glow */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl" />
            
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-4">
              🇮🇳 भारत का अपना डिजिटल बही-खाता
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              आज ही अपनी दुकान को बनाएं स्मार्ट डिजिटल दुकान
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto mb-8">
              5 लाख+ भारतीय व्यापारियों के साथ जुड़ें। शून्य टाइपिंग, 100% सुरक्षित और जिंदगी भर के लिए बिल्कुल मुफ़्त।
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-black shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all"
              >
                <span>मुफ़्त खाता शुरू करें</span>
                <ArrowRight className="size-4" />
              </Link>

              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all"
              >
                <span>लाइव बोलकर देखें</span>
              </a>
            </div>

            {/* Bottom trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 border-t border-white/10 pt-6">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-400" />
                256-बिट बैंक-ग्रेड सुरक्षा
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-400" />
                100% मुफ़्त ऑटोमैटिक बैकअप
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 className="size-4 text-emerald-400" />
                WhatsApp पेमेंट रिमाइंडर
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Khatabook-Style Merchant Footer */}
      <footer className="border-t border-white/10 bg-black py-10 text-xs text-neutral-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white">Voice<span className="text-emerald-400">खाता</span></span>
              <span>— बोलो और हिसाब हो गया</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              किराना, हार्डवेयर, मेडिकल और सभी भारतीय व्यापारियों के लिए समर्पित।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-400">
            <a href="#demo" className="hover:text-emerald-400">लाइव डेमो</a>
            <a href="#comparison" className="hover:text-emerald-400">फायदे</a>
            <a href="#dukandar" className="hover:text-emerald-400">दुकानें</a>
            <a href="#reviews" className="hover:text-emerald-400">समीक्षाएं</a>
            <Link to="/privacy" className="hover:text-emerald-400">गोपनीयता (Privacy)</Link>
            <Link to="/terms" className="hover:text-emerald-400">नियम व शर्तें</Link>
          </div>

          <p className="text-center md:text-right">
            © {new Date().getFullYear()} VoiceKhata. गर्व से भारत में निर्मित 🇮🇳
          </p>
        </div>
      </footer>

      {/* 10. Mobile Sticky Bottom Bar */}
      <ShopkeeperBottomStickyCTA />
    </div>
  );
}

export default ShopkeeperLanding;
