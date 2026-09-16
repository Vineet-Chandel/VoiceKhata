// src/components/ui/Shopkeeper/ShopkeeperSteps.tsx
import React from "react";
import { ArrowRight, Mic, CheckCircle2, RefreshCw } from "lucide-react";
import stepMicImg from "@/assets/step_mic.png";
import stepVerifyImg from "@/assets/step_verify.png";
import stepLedgerImg from "@/assets/step_ledger.png";

export function ShopkeeperSteps() {
  const steps = [
    {
      num: "01",
      badge: "Step 01",
      title: "Bolkar Batayein",
      desc: "Speak naturally in Hindi or English: \"Received ₹1,200 from Ramesh via UPI\" or \"Gupta ji ko ₹500 diye\".",
      img: stepMicImg,
      alt: "Speak into phone microphone"
    },
    {
      num: "02",
      badge: "Step 02",
      title: "Review Before Save",
      desc: "VoiceKhata displays an instant confirmation card: Person, Amount, Money direction, and Payment mode.",
      img: stepVerifyImg,
      alt: "Review confirmation card"
    },
    {
      num: "03",
      badge: "Step 03",
      title: "Khata Updated",
      desc: "Customer balance and cashflow update instantly, with an accessible 6-second undo option.",
      img: stepLedgerImg,
      alt: "Khata ledger updated"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white dark:bg-[#070A11] transition-colors border-t border-slate-100 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B0F15] dark:text-white tracking-tight leading-[1.1]">
            Three Simple Steps. Zero Typing.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            VoiceKhata turns natural speech into verified accounting entries.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="group relative rounded-[26px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1320] p-7 sm:p-8 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Bar: Icon Container & Step Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="size-16 sm:size-18 rounded-2xl bg-white dark:bg-[#0B0F15] border border-slate-200 dark:border-slate-800 p-2.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <img src={step.img} alt={step.alt} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0B0F15] bg-[#D2F832] px-3 py-1 rounded-full shadow-2xs">
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#0B0F15] dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              {/* Desktop Arrow Connector */}
              {idx < 2 && (
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 size-7 rounded-full bg-white dark:bg-[#0B0F15] border border-slate-300 dark:border-slate-700 items-center justify-center text-slate-500 shadow-sm pointer-events-none group-hover:bg-[#D2F832] group-hover:text-[#0B0F15] group-hover:border-[#D2F832] transition-colors">
                  <ArrowRight size={13} strokeWidth={2.5} />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ShopkeeperSteps;
