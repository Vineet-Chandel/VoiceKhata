// src/components/ui/Shopkeeper/ShopkeeperHero.tsx
"use client"

import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Store
} from "lucide-react";
import shopkeeperIllustrationImg from "@/assets/shopkeeper_illustration.png";

export function ShopkeeperHero() {
  // 3D Perspective Tilt Physics via Framer Motion
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 24 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-7deg", "7deg"]);

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

  return (
    <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 bg-[#0F172A] border-b border-[#334155] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#5C6BC0]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5C6BC0]/30 bg-[#1E293B] px-3.5 py-1 text-xs font-semibold text-[#818CF8]">
              <span className="size-2 rounded-full bg-[#818CF8] animate-pulse" />
              <span>Digital Khate for Indian Businesses</span>
            </div>

            {/* Core Positioning */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.1]">
              Khata likhna. <br />
              <span className="text-[#818CF8]">Ab bas bolkar.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#94A3B8] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Speak naturally in Hindi or English. VoiceKhata understands the customer, amount, and payment method in 3 seconds — keeping customer balances, receivables, and store cashflow 100% accurate without typing.
            </p>

            {/* Action CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] active:scale-[0.98] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#5C6BC0]/20 transition-all cursor-pointer"
              >
                <span>Launch Digital Khata</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Micro value pillars */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
                <Check className="size-4 text-[#34D399]" />
                <span>Zero Typing Needed</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
                <Check className="size-4 text-[#34D399]" />
                <span>Review Before Save</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
                <Check className="size-4 text-[#34D399]" />
                <span>Instant Payment Reminders</span>
              </div>
            </div>



          </div>

          {/* Right Column: Counter in Action with Image 2 Illustration */}
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
              className="relative rounded-[16px] border border-[#334155] bg-[#1E293B] p-6 sm:p-7 shadow-2xl transition-shadow duration-300 hover:shadow-[#5C6BC0]/10 hover:border-[#5C6BC0]/50"
            >
              {/* Header: Single Active Tab 'Counter in Action' */}
              <div className="flex items-center justify-between border-b border-[#334155] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold bg-[#5C6BC0] text-white shadow-xs">
                    <Store size={14} />
                    <span>Counter in Action</span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-[#34D399] bg-[#064E3B]/30 border border-[#10B981]/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#34D399] animate-ping" />
                  Interactive
                </span>
              </div>

              {/* Illustration matching Image 2 */}
              <div className="space-y-3.5">
                <div className="relative rounded-[12px] overflow-hidden border border-[#334155] bg-[#E9ECEF] flex items-center justify-center shadow-xs">
                  <img 
                    src={shopkeeperIllustrationImg} 
                    alt="Indian Shopkeeper using VoiceKhata - ₹500 का उधार दिया - रमेश किराना स्टोर (दादर)" 
                    className="w-full h-auto object-cover max-h-[320px]"
                  />
                </div>

                {/* Bottom Metric Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-[8px] bg-[#0F172A] border border-[#334155]">
                    <span className="text-[10px] text-[#94A3B8] block">Daily Transactions</span>
                    <span className="font-bold text-[#F8FAFC] text-sm">140+ Entries</span>
                    <p className="text-[10px] text-[#34D399] mt-0.5">Average 2.4s per khata entry</p>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#0F172A] border border-[#334155]">
                    <span className="text-[10px] text-[#94A3B8] block">Typing Eliminated</span>
                    <span className="font-bold text-[#818CF8] text-sm">100% Voice</span>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">Hindi, Hinglish & English</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ShopkeeperHero;
