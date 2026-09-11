// src/components/ui/Shopkeeper/ShopkeeperHero.tsx
"use client"

import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";
import { 
  Mic, 
  ArrowRight, 
  Check, 
  ArrowDownRight, 
  ArrowUpRight, 
  MessageSquare,
  ShieldCheck,
  Zap,
  Volume2,
  Sliders,
  Sparkles,
  Store
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import shopkeeperCounterImg from "@/assets/shopkeeper_counter.jpg";

export function ShopkeeperHero() {
  const [activeTab, setActiveTab] = useState<"simulator" | "visual">("simulator");
  const [activePhrase, setActivePhrase] = useState("Ramesh ne ₹1,200 UPI se diye");
  const [demoState, setDemoState] = useState<"idle" | "listening" | "review" | "saved">("idle");
  const [activeCustomer, setActiveCustomer] = useState("Ramesh Kumar");
  const [activeAmount, setActiveAmount] = useState(1200);
  const [activeType, setActiveType] = useState<"Credit" | "Debit">("Credit");
  const [activeMethod, setActiveMethod] = useState("UPI");
  const [customerBalance, setCustomerBalance] = useState(2450);

  // 3D Perspective Tilt Physics via Framer Motion
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 24 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-9deg", "9deg"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPos);
    mouseY.set(yPos);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const samplePhrases = [
    { text: "Ramesh ne ₹1,200 UPI se diye", person: "Ramesh Kumar", amount: 1200, type: "Credit" as const, method: "UPI" },
    { text: "Gupta ji ko ₹500 diye nagad", person: "Gupta Traders", amount: 500, type: "Debit" as const, method: "Cash" },
    { text: "Suresh ne ₹800 jama kiye", person: "Suresh Sharma", amount: 800, type: "Credit" as const, method: "UPI" },
  ];

  const handleTriggerDemo = (phrase: typeof samplePhrases[0]) => {
    setActivePhrase(phrase.text);
    setActiveCustomer(phrase.person);
    setActiveAmount(phrase.amount);
    setActiveType(phrase.type);
    setActiveMethod(phrase.method);
    setDemoState("listening");

    // Speech audio simulation
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(phrase.text);
        u.lang = "hi-IN";
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
      } catch (e) {
        // speech error fallback
      }
    }

    setTimeout(() => {
      setDemoState("review");
    }, 700);
  };

  const handleConfirmSave = () => {
    setDemoState("saved");
    if (activeType === "Credit") {
      setCustomerBalance((prev) => Math.max(0, prev - activeAmount));
    } else {
      setCustomerBalance((prev) => prev + activeAmount);
    }
    setTimeout(() => {
      setDemoState("idle");
    }, 4000);
  };

  return (
    <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 bg-[#07090E] border-b border-[#1E2638] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#5C6BC0]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5C6BC0]/30 bg-[#1E2337] px-3.5 py-1 text-xs font-semibold text-[#818CF8]">
              <span className="size-2 rounded-full bg-[#818CF8] animate-pulse" />
              <span>Digital Khata for Indian Businesses</span>
            </div>

            {/* Core Manus Positioning */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F1F5F9] leading-[1.1]">
              Khata likhna. <br />
              <span className="text-[#818CF8]">Ab bas bolkar.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#94A3B8] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Speak naturally in Hindi or English. VoiceKhata understands the customer, amount, and payment method in 3 seconds — keeping customer balances, receivables, and store cashflow 100% accurate without typing.
            </p>

            {/* Action CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] active:scale-[0.98] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#5C6BC0]/20 transition-all cursor-pointer"
              >
                <span>Launch Digital Khata</span>
                <ArrowRight className="size-4" />
              </Link>

              <button
                onClick={() => {
                  setActiveTab("simulator");
                  handleTriggerDemo(samplePhrases[0]);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[8px] border border-[#1E2638] bg-[#0F131C] hover:bg-[#161B26] active:scale-[0.98] px-6 py-3.5 text-sm font-semibold text-[#F1F5F9] shadow-xs transition-all cursor-pointer"
              >
                <Mic className="size-4 text-[#818CF8]" />
                <span>Try Voice Demo</span>
              </button>
            </div>

            {/* Micro value pillars */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-1.5 font-medium text-[#F1F5F9]">
                <Check className="size-4 text-[#34D399]" />
                <span>Zero Typing Needed</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[#F1F5F9]">
                <Check className="size-4 text-[#34D399]" />
                <span>Review Before Save</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[#F1F5F9]">
                <Check className="size-4 text-[#34D399]" />
                <span>WhatsApp UPI Reminders</span>
              </div>
            </div>

            {/* Merchant proof snippet */}
            <div className="pt-3 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block size-7 rounded-full ring-2 ring-[#07090E] object-cover" src={shopkeeperCounterImg} alt="Shopkeeper" />
                <div className="size-7 rounded-full bg-[#1E2337] border-2 border-[#07090E] flex items-center justify-center text-[10px] font-bold text-[#818CF8]">
                  +5k
                </div>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Used daily by kirana, wholesale & retail merchants across India
              </p>
            </div>

          </div>

          {/* Right Column: 3D Perspective Tilt Interactive Card with Tabs */}
          <div className="lg:col-span-6 [perspective:1200px]">
            <motion.div
              ref={cardRef}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="relative rounded-[16px] border border-[#1E2638] bg-[#0F131C] p-6 sm:p-7 shadow-2xl transition-shadow duration-300 hover:shadow-[#5C6BC0]/10 hover:border-[#5C6BC0]/50"
            >
              {/* Interactive Tab Switcher */}
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("simulator")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "simulator"
                        ? "bg-[#5C6BC0] text-white shadow-xs"
                        : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#161B26]"
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>3D Live Simulator</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("visual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "visual"
                        ? "bg-[#5C6BC0] text-white shadow-xs"
                        : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#161B26]"
                    }`}
                  >
                    <Store size={13} />
                    <span>Counter in Action</span>
                  </button>
                </div>

                <span className="text-[11px] font-semibold text-[#34D399] bg-[#064E3B]/30 border border-[#10B981]/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#34D399] animate-ping" />
                  Interactive
                </span>
              </div>

              {/* ── VIEW 1: 3D INTERACTIVE SIMULATOR ── */}
              {activeTab === "simulator" && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center size-8 rounded-[8px] bg-[#1E2337] border border-[#5C6BC0]/30 p-1.5 shadow-xs">
                        <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#F1F5F9]">VoiceKhata Realtime Parser</h3>
                        <p className="text-[11px] text-[#64748B]">Move mouse to tilt • Drag slider to adjust</p>
                      </div>
                    </div>
                  </div>

                  {/* Sample voice phrase selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#94A3B8] block">
                      Tap a phrase to simulate speaking:
                    </label>
                    <div className="flex flex-col gap-2">
                      {samplePhrases.map((phrase, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTriggerDemo(phrase)}
                          className={`w-full text-left p-2.5 rounded-[8px] border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                            activePhrase === phrase.text
                              ? "border-[#5C6BC0] bg-[#1E2337] text-[#818CF8]"
                              : "border-[#1E2638] bg-[#07090E] text-[#F1F5F9] hover:border-[#5C6BC0]/60"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Volume2 size={14} className="text-[#818CF8] shrink-0" />
                            <span className="truncate">"{phrase.text}"</span>
                          </span>
                          <span className="text-[10px] uppercase font-bold text-[#64748B] shrink-0">Test</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Gesture: Amount Scrubber / Slider */}
                  <div className="rounded-[8px] border border-[#1E2638] bg-[#07090E] p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8] flex items-center gap-1.5">
                        <Sliders size={12} className="text-[#818CF8]" />
                        <span>Tactile Amount Gesture:</span>
                      </span>
                      <span className="font-bold text-[#34D399] tabular-nums">
                        ₹{activeAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={10000}
                      step={100}
                      value={activeAmount}
                      onChange={(e) => setActiveAmount(Number(e.target.value))}
                      className="w-full accent-[#5C6BC0] h-1.5 bg-[#1E2638] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#64748B]">
                      <span>₹100</span>
                      <span>Drag to simulate ledger updates</span>
                      <span>₹10,000</span>
                    </div>
                  </div>

                  {/* Live Flow State Card */}
                  <div className="rounded-[10px] border border-[#1E2638] bg-[#07090E] p-3.5 space-y-3">
                    {demoState === "listening" && (
                      <div className="flex items-center gap-3 py-2 text-xs font-medium text-[#F1F5F9]">
                        <div className="size-3 rounded-full bg-[#34D399] animate-ping" />
                        <span>Listening & understanding voice input...</span>
                      </div>
                    )}

                    {demoState === "review" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#34D399] bg-[#064E3B]/30 border border-[#10B981]/30 px-2 py-0.5 rounded-full">
                            Parsed with 99.8% confidence
                          </span>
                          <span className="text-[11px] text-[#64748B]">Review before save</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-[#0F131C] p-3 rounded-[8px] border border-[#1E2638]">
                          <div>
                            <span className="text-[#64748B] block text-[10px]">Customer / Party</span>
                            <span className="font-bold text-[#F1F5F9]">{activeCustomer}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[10px]">Amount</span>
                            <span className="font-bold text-[#34D399]">₹{activeAmount.toLocaleString("en-IN")}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[10px]">Direction</span>
                            <span className="font-semibold text-[#F1F5F9]">
                              {activeType === "Credit" ? "Money received" : "Money paid"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[10px]">Payment Method</span>
                            <span className="font-semibold text-[#F1F5F9]">{activeMethod}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleConfirmSave}
                            className="flex items-center gap-1.5 h-8 px-4 rounded-[6px] bg-[#5C6BC0] hover:bg-[#4F5B93] text-white text-xs font-semibold cursor-pointer shadow-xs"
                          >
                            <Check size={14} />
                            <span>Save to Khata</span>
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {demoState === "saved" && (
                      <div className="flex items-center justify-between bg-[#064E3B]/30 border border-[#10B981]/30 p-3 rounded-[8px]">
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-[#34D399]" />
                          <span className="text-xs font-bold text-[#34D399]">
                            Saved to {activeCustomer}'s Khata • ₹{activeAmount} recorded!
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#34D399]">Updated</span>
                      </div>
                    )}

                    {demoState === "idle" && (
                      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                        <span>Ready for voice entry</span>
                        <span className="text-[11px] text-[#818CF8] font-semibold">Tap a phrase above</span>
                      </div>
                    )}
                  </div>

                  {/* Customer Balance Preview */}
                  <div className="flex items-center justify-between p-3.5 rounded-[10px] border border-[#1E2638] bg-[#0F131C]">
                    <div>
                      <p className="text-xs font-bold text-[#F1F5F9]">{activeCustomer}</p>
                      <p className="text-[11px] text-[#64748B]">Customer Ledger Balance</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 font-bold text-sm text-[#34D399] tabular-nums">
                        <span>↑</span>
                        <span>₹{customerBalance.toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-[10px] text-[#64748B]">You will receive</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── VIEW 2: DYNAMIC RETAIL IMAGE & SOUNDWAVE SHOWCASE ── */}
              {activeTab === "visual" && (
                <div className="space-y-3.5">
                  <div className="relative rounded-[12px] overflow-hidden border border-[#1E2638] group">
                    <img 
                      src={shopkeeperCounterImg} 
                      alt="Indian Shopkeeper using VoiceKhata" 
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-black/30" />

                    {/* Live waveform audio pulse badge */}
                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-[10px] bg-[#07090E]/90 backdrop-blur-md border border-[#1E2638] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-[#5C6BC0]/30 border border-[#5C6BC0] flex items-center justify-center text-[#818CF8]">
                          <Mic size={16} className="animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#F1F5F9]">Ramesh Kirana Store • Dadar</p>
                          <p className="text-[10px] text-[#34D399] flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-[#34D399]" />
                            Recording Hindi voice ledger entry
                          </p>
                        </div>
                      </div>

                      {/* Animated Soundwave bars */}
                      <div className="flex items-center gap-1 h-5">
                        {[40, 90, 60, 100, 75, 45].map((h, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.3}%`] }}
                            transition={{ repeat: Infinity, duration: 0.8 + i * 0.15, ease: "easeInOut" }}
                            className="w-1 bg-[#818CF8] rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-[8px] bg-[#07090E] border border-[#1E2638]">
                      <span className="text-[10px] text-[#64748B] block">Daily Transactions</span>
                      <span className="font-bold text-[#F1F5F9] text-sm">140+ Entries</span>
                      <p className="text-[10px] text-[#34D399] mt-0.5">Average 2.4s per khata entry</p>
                    </div>
                    <div className="p-3 rounded-[8px] bg-[#07090E] border border-[#1E2638]">
                      <span className="text-[10px] text-[#64748B] block">Typing Eliminated</span>
                      <span className="font-bold text-[#818CF8] text-sm">100% Voice</span>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">Hindi, Hinglish & English</p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ShopkeeperHero;
