import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Mic, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Send, 
  Sparkles,
  Volume2,
  Lock,
  MessageSquare
} from "lucide-react";

export function ShopkeeperHero() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkSent, setLinkSent] = useState(false);

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim().length >= 10) {
      setLinkSent(true);
      setTimeout(() => setLinkSent(false), 4000);
      setPhoneNumber("");
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-full max-w-4xl rounded-full bg-emerald-600/15 blur-[120px]" />
        <div className="absolute top-1/2 right-[-10%] h-[350px] w-[400px] rounded-full bg-emerald-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-400 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>भारत का पहला बोलकर हिसाब लिखने वाला खाता ऐप</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]">
            बोलो और हिसाब हो गया! <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Zero Typing Khata
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            किराना, हार्डवेयर, मेडिकल और रिटेल स्टोर के लिए। जब दुकान पर ग्राहकों की भीड़ हो, 
            तो डायरी में लिखने या टाइप करने का झंझट छोड़ें — <strong>बस बोलें और खाता तुरंत दर्ज हो जाए!</strong>
          </p>

          {/* Get App Link Mobile Box / CTA */}
          <div className="mx-auto max-w-md pt-2">
            <form onSubmit={handleSendLink} className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-emerald-500/30 bg-neutral-900/90 p-2 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 w-full px-3 py-2 text-neutral-400">
                <span className="text-sm font-bold text-white border-r border-white/20 pr-2">🇮🇳 +91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="अपना मोबाइल नंबर डालें"
                  className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-bold text-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:scale-95 transition-all"
              >
                <span>ऐप लिंक पाएं</span>
                <Send className="size-3.5" />
              </button>
            </form>

            {linkSent && (
              <p className="mt-2 text-xs font-semibold text-emerald-400 animate-in fade-in">
                ✅ लिंक आपके मोबाइल नंबर पर SMS द्वारा भेज दिया गया है!
              </p>
            )}

            <p className="mt-2 text-[11px] text-neutral-400">
              ⚡ 100% फ्री • कोई क्रेडिट कार्ड नहीं चाहिए • 1 मिनट में शुरू करें
            </p>
          </div>

          {/* Floating Sample Voice Entries (Visual Element) */}
          <div className="pt-6">
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3">
              दुकानदार ऐसे बोलते हैं और खाता तुरंत लिख जाता है:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Voice Badge 1: Udhar */}
              <div className="flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-xs font-semibold text-rose-200 shadow-lg shadow-rose-950/30 backdrop-blur-md hover:scale-105 transition-transform">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/30 text-rose-300">
                  <Mic className="size-3 animate-pulse" />
                </div>
                <span>"रमेश ₹200 उधार"</span>
                <span className="rounded bg-rose-500/30 px-2 py-0.5 text-[10px] text-rose-300 font-mono font-bold">
                  लाल खाता (Udhar)
                </span>
              </div>

              {/* Voice Badge 2: Jama */}
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 text-xs font-semibold text-emerald-200 shadow-lg shadow-emerald-950/30 backdrop-blur-md hover:scale-105 transition-transform">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-300">
                  <Mic className="size-3 animate-pulse" />
                </div>
                <span>"सुनील ₹500 जमा"</span>
                <span className="rounded bg-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-300 font-mono font-bold">
                  हरा खाता (Jama)
                </span>
              </div>

              {/* Voice Badge 3: Kirana store */}
              <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/40 px-4 py-2 text-xs font-semibold text-amber-200 shadow-lg shadow-amber-950/30 backdrop-blur-md hover:scale-105 transition-transform">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/30 text-amber-300">
                  <Mic className="size-3 animate-pulse" />
                </div>
                <span>"शर्मा जी किराना ₹1,450 जमा"</span>
                <span className="rounded bg-amber-500/30 px-2 py-0.5 text-[10px] text-amber-300 font-mono font-bold">
                  UPI Received
                </span>
              </div>

              {/* Voice Badge 4: Hardware */}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-4 py-2 text-xs font-semibold text-cyan-200 shadow-lg shadow-cyan-950/30 backdrop-blur-md hover:scale-105 transition-transform">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/30 text-cyan-300">
                  <Mic className="size-3 animate-pulse" />
                </div>
                <span>"गुप्ता हार्डवेयर ₹600 उधार"</span>
                <span className="rounded bg-cyan-500/30 px-2 py-0.5 text-[10px] text-cyan-300 font-mono font-bold">
                  Pending Due
                </span>
              </div>
            </div>
          </div>

          {/* 3 Value Badges */}
          <div className="pt-6 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto text-center border-t border-white/10">
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">3 सेकंड</p>
              <p className="text-[11px] sm:text-xs text-neutral-400">बोलकर एंट्री</p>
            </div>
            <div className="p-2 border-x border-white/10">
              <p className="text-xl sm:text-2xl font-extrabold text-white">3x तेज़</p>
              <p className="text-[11px] sm:text-xs text-neutral-400">उधार वसूली</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">100% सेफ</p>
              <p className="text-[11px] sm:text-xs text-neutral-400">ऑटोमैटिक बैकअप</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ShopkeeperHero;
