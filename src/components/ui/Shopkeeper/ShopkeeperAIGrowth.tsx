import React, { useState } from "react";
import { 
  Sparkles, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sliders,
  DollarSign,
  PieChart,
  Repeat
} from "lucide-react";

export function ShopkeeperAIGrowth() {
  const [affordAmount, setAffordAmount] = useState(12000);
  const [affordCategory, setAffordCategory] = useState("Store Inventory");

  const isAffordable = affordAmount <= 15000;

  return (
    <section id="growth" className="py-16 sm:py-24 bg-gradient-to-b from-[#07090e] via-[#0b0e18] to-[#07090e] border-y border-white/10 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-4 py-1.5 text-xs font-semibold text-violet-300 mb-4 backdrop-blur-md">
            <Sparkles className="size-3.5 text-violet-400" />
            <span>Built-in AI Money Growth Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading leading-tight">
            More Than a Khata — <br />
            <span className="bg-gradient-to-r from-violet-400 via-rose-300 to-cyan-400 bg-clip-text text-transparent">
              Your Financial Digital Twin & Copilot
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            VoiceKhata doesn't just record where your money went. Our AI analyzes your cash flow, predicts runway, optimizes category budgets, and recommends your <strong>Next Best Move</strong>.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Financial Health & Next Best Move (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            
            {/* Card 1: Financial Digital Twin Health Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-heading">Financial Health Score</h3>
                    <span className="rounded-full bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 uppercase">
                      Live Twin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Real-time status calculated from income, expenses, and credit recovery.</p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-black/50 border border-white/10 px-5 py-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Score</span>
                    <span className="text-3xl font-black text-cyan-400 font-heading">94<span className="text-base text-slate-500 font-normal">/100</span></span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <span className="flex items-center gap-1 text-xs font-bold text-cyan-300">
                      <TrendingUp className="size-3.5 text-cyan-400" />
                      +6 pts
                    </span>
                    <span className="text-[10px] text-slate-400">Excellent</span>
                  </div>
                </div>
              </div>

              {/* 4 Health Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">Cash Flow</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div className="bg-cyan-400 h-full rounded-full w-[92%]" />
                  </div>
                  <span className="text-xs font-bold text-white font-mono">92%</span>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">Emergency Fund</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div className="bg-indigo-400 h-full rounded-full w-[85%]" />
                  </div>
                  <span className="text-xs font-bold text-white font-mono">85%</span>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">Credit Risk</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div className="bg-rose-500 h-full rounded-full w-[18%]" />
                  </div>
                  <span className="text-xs font-bold text-rose-300 font-mono">Low (18%)</span>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">Savings Rate</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div className="bg-cyan-400 h-full rounded-full w-[78%]" />
                  </div>
                  <span className="text-xs font-bold text-cyan-300 font-mono">38%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Next Best Move Card */}
            <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/90 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-bold text-violet-300 uppercase tracking-widest font-mono">
                  Prescriptive Financial Guidance
                </span>
              </div>

              <h4 className="text-2xl font-black text-white font-heading leading-tight mb-2">
                Your Next Best Move: <span className="text-violet-300">Sweep ₹3,500 surplus into high-yield reserve</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Based on your last 30 days of collected receivables and steady sales, sweeping ₹3,500 extends your store's emergency runway to <strong>4.5 months</strong> without affecting daily operations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
                <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                  <span className="text-slate-400 font-medium block">Why it matters:</span>
                  <span className="text-slate-200 font-semibold">Prepares for festival inventory procurement next month.</span>
                </div>
                <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                  <span className="text-cyan-400 font-medium block">Expected impact:</span>
                  <span className="text-cyan-200 font-semibold">+₹420 passive monthly yield, zero cash crunch.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:brightness-110 active:scale-95 transition-all font-heading"
                >
                  <span>Try Voice Action</span>
                  <ArrowRight className="size-3.5" />
                </a>
                <span className="text-[11px] text-slate-400">Automated 1-click execution</span>
              </div>
            </div>

          </div>

          {/* Right Column: Smart Budgeting & "Can I Afford This?" Simulator (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            
            {/* Card 3: Smart Adaptive Budgeting & Carry-Forward */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Smart Category Budgets</h3>
                  <p className="text-xs text-slate-400">Adapts automatically with carry-forward support</p>
                </div>
                <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
                  Auto-Alerts
                </span>
              </div>

              {/* Carry-Forward Callout */}
              <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs flex items-center gap-2.5 text-cyan-200">
                <Repeat className="size-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Carry-Forward Active:</strong> ₹2,400 unspent from last month was rolled forward to this month's budget.
                </span>
              </div>

              {/* Category Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Inventory & Stock</span>
                    <span className="text-cyan-400 font-mono">₹24,500 / ₹35,000 (70%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full w-[70%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Logistics & Fuel</span>
                    <span className="text-rose-400 font-mono">₹4,200 / ₹5,000 (84% ⚠️)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full w-[84%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Utilities & Electricity</span>
                    <span className="text-indigo-400 font-mono">₹3,100 / ₹6,000 (51%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded-full w-[51%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Interactive "Can I Afford This?" Simulator */}
            <div className="rounded-3xl border border-rose-500/30 bg-[#0d121f] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="size-4 text-rose-400" />
                <h4 className="text-base font-bold text-white font-heading">Interactive Simulator: "Can I Afford This?"</h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Test any upcoming store expense or personal purchase to see its live impact on your runway.
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs text-slate-300 font-medium">Planned Purchase:</label>
                  <span className="text-xs font-bold text-cyan-300 font-mono">₹{affordAmount.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="1000"
                  value={affordAmount}
                  onChange={(e) => setAffordAmount(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Dynamic Verdict */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isAffordable 
                  ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-200" 
                  : "border-rose-500/40 bg-rose-950/40 text-rose-200"
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  {isAffordable ? (
                    <>
                      <CheckCircle2 className="size-4 text-cyan-400" />
                      <span>Safe to Proceed (Recommended)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="size-4 text-rose-400" />
                      <span>Caution: Reduces Emergency Runway</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {isAffordable 
                    ? `At ₹${affordAmount.toLocaleString("en-IN")}, your post-purchase savings rate remains above 28% and cash reserves cover 4+ months of store dues.`
                    : `Spending ₹${affordAmount.toLocaleString("en-IN")} drops your liquidity cushion below the recommended 90-day threshold. Consider splitting payments.`}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ShopkeeperAIGrowth;
