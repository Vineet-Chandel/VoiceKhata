import React, { useState } from "react"
import { Target, CheckCircle2, AlertTriangle, XCircle, Sparkles, Loader2 } from "lucide-react"

interface CanIAffordThisProps {
  flow?: {
    income?: number;
    essentials?: number;
    fixedCommitments?: number;
    savings?: number;
    untappedCapacity?: number;
  };
  health?: {
    score?: number;
    metrics?: {
      emergencyFund?: number;
    };
  };
  balance?: number;
  mode?: "PERSONAL" | "BUSINESS";
}

type AffordResult = {
  status: "AFFORDABLE NOW" | "AFFORDABLE WITH CONDITIONS" | "NOT RECOMMENDED RIGHT NOW";
  item: string;
  amount: number;
  headline: string;
  reason: string;
  postBalance: number;
  surplusImpactPercent: number;
  recoveryTimeline: string;
  recommendedAction: string;
}

export function CanIAffordThis({ flow, health, balance, mode = "PERSONAL" }: CanIAffordThisProps) {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<AffordResult | null>(null)
  const [loading, setLoading] = useState(false)

  const isBusiness = mode === "BUSINESS"

  const quickPresets = isBusiness ? [
    { label: "Bulk Restock (₹25k)", text: "FMCG Wholesale Restock ₹25,000" },
    { label: "Deep Freezer (₹38k)", text: "Commercial Deep Freezer ₹38,000" },
    { label: "Shop Signage (₹12k)", text: "LED Shop Signboard ₹12,000" },
    { label: "Festival Stock (₹75k)", text: "Festival Confectionery Stock ₹75,000" },
  ] : [
    { label: "Phone (₹18k)", text: "New Phone ₹18,000" },
    { label: "Refrigerator (₹35k)", text: "Home Refrigerator ₹35,000" },
    { label: "Weekend Trip (₹8k)", text: "Family Weekend Trip ₹8,000" },
    { label: "Laptop (₹65k)", text: "Laptop ₹65,000" },
  ]

  const parseQuery = (input: string): { item: string; amount: number } => {
    // Extract numbers with optional commas
    const match = input.replace(/,/g, "").match(/(\d+)/)
    const amount = match ? parseInt(match[1], 10) : 0
    let item = input.replace(/₹|rs\.?|inr|\d+|,/gi, "").trim()
    if (!item) item = "Planned Purchase"
    return { item, amount }
  }

  const evaluateAffordability = (amount: number, item: string): AffordResult => {
    const totalIncome = flow?.income || 50000
    const essentialExpenses = (flow?.essentials || 25000) + (flow?.fixedCommitments || 10000)
    const monthlySurplus = Math.max(1000, flow?.savings || Math.max(0, totalIncome - essentialExpenses))
    const currentBalance = typeof balance === "number" ? balance : Math.max(25000, monthlySurplus * 3)
    const emergencyTarget = Math.max(30000, essentialExpenses * 3)

    const postBalance = currentBalance - amount
    const surplusImpactPercent = Math.min(100, Math.round((amount / monthlySurplus) * 100))
    const monthsOfSurplus = (amount / monthlySurplus).toFixed(1)

    // Condition 1: Affordable Now
    if (amount <= monthlySurplus * 0.8 && postBalance >= emergencyTarget) {
      return {
        status: "AFFORDABLE NOW",
        item,
        amount,
        headline: "Safe to proceed with zero disruption to emergency reserves",
        reason: `At ₹${amount.toLocaleString("en-IN")}, this purchase consumes ${surplusImpactPercent}% of your monthly net surplus, leaving your emergency shield fully intact.`,
        postBalance,
        surplusImpactPercent,
        recoveryTimeline: "Within 30 days of standard cash flow",
        recommendedAction: "Pay in single direct settlement to avoid debt obligations.",
      }
    }

    // Condition 2: Affordable With Conditions
    if (postBalance >= emergencyTarget * 0.6 && postBalance >= 10000) {
      const waitDays = Math.min(90, Math.max(15, Math.round((amount / monthlySurplus) * 30)))
      return {
        status: "AFFORDABLE WITH CONDITIONS",
        item,
        amount,
        headline: "Feasible, but temporarily reduces your liquid emergency cushion",
        reason: `You have sufficient funds to cover ₹${amount.toLocaleString("en-IN")}, but it consumes ~${monthsOfSurplus} months of surplus and drops your liquidity buffer to ₹${Math.max(0, postBalance).toLocaleString("en-IN")}.`,
        postBalance,
        surplusImpactPercent,
        recoveryTimeline: `Estimated ${Math.ceil(parseFloat(monthsOfSurplus))} months to replenish reserves`,
        recommendedAction: `Consider waiting ${waitDays} days or exploring a 3-month no-cost EMI to preserve cash flow.`,
      }
    }

    // Condition 3: Not Recommended Right Now
    const requiredMonths = Math.ceil(amount / Math.max(2000, monthlySurplus * 0.5))
    return {
      status: "NOT RECOMMENDED RIGHT NOW",
      item,
      amount,
      headline: "Exceeds safe liquidity threshold and threatens emergency firewall",
      reason: `Spending ₹${amount.toLocaleString("en-IN")} today would leave only ₹${Math.max(0, postBalance).toLocaleString("en-IN")} in reserves (or trigger an overdraft), exposing you to immediate debt if an emergency occurs.`,
      postBalance,
      surplusImpactPercent,
      recoveryTimeline: `${requiredMonths} months of structured accumulation`,
      recommendedAction: `Automate ₹${Math.round(amount / requiredMonths).toLocaleString("en-IN")}/month into a targeted goal for ${requiredMonths} months to buy comfortably.`,
    }
  }

  const handleEvaluate = () => {
    if (!query.trim()) return
    const { item, amount } = parseQuery(query)
    if (amount <= 0) return

    setLoading(true)

    // Compute deterministic financial verdict immediately
    const computed = evaluateAffordability(amount, item)

    // Simulate short digital twin processing for smooth UX
    setTimeout(() => {
      setResult(computed)
      setLoading(false)
    }, 450)
  }

  return (
    <div id="can-i-afford-this" className="bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-transparent border border-violet-500/20 rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
          <Target size={20} className="text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {isBusiness ? "Can the Store Afford This?" : "Can I Afford This?"}
          </h2>
          <p className="text-xs text-text-muted">
            {isBusiness
              ? "Instant working capital check before ordering stock or equipment."
              : "Instant financial firewall check against your real cash flow & runway."}
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEvaluate()}
          placeholder={isBusiness ? "e.g. FMCG wholesale restock ₹30,000 or Store renovation ₹50,000" : "e.g. New smartphone ₹25,000 or Home appliance ₹18,000"} 
          className="flex-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors text-text-primary placeholder:text-text-muted"
        />
        <button 
          onClick={handleEvaluate}
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-600/20"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Evaluate
        </button>
      </div>

      {/* Quick query chips */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-[11px] text-text-muted">Try:</span>
        {quickPresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(preset.text)
              const { item, amount } = parseQuery(preset.text)
              setResult(evaluateAffordability(amount, item))
            }}
            className="text-[11px] px-2.5 py-1 rounded-full bg-surface-elevated border border-border hover:border-violet-500/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-5 rounded-xl border border-violet-500/20 bg-violet-500/5 text-sm text-text-secondary flex items-center gap-3 animate-pulse">
          <Loader2 size={18} className="animate-spin text-violet-400" />
          <span>Consulting Financial Digital Twin and evaluating balance sheet runway...</span>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className={`p-5 rounded-xl border transition-all animate-in fade-in duration-300 ${
          result.status === "AFFORDABLE NOW"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            : result.status === "AFFORDABLE WITH CONDITIONS"
            ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
            : "border-rose-500/30 bg-rose-500/10 text-rose-100"
        }`}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              {result.status === "AFFORDABLE NOW" && <CheckCircle2 size={18} className="text-emerald-400" />}
              {result.status === "AFFORDABLE WITH CONDITIONS" && <AlertTriangle size={18} className="text-amber-400" />}
              {result.status === "NOT RECOMMENDED RIGHT NOW" && <XCircle size={18} className="text-rose-400" />}
              <span className={`text-xs font-black uppercase tracking-wider ${
                result.status === "AFFORDABLE NOW"
                  ? "text-emerald-400"
                  : result.status === "AFFORDABLE WITH CONDITIONS"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}>
                {result.status}
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-black/30 px-2.5 py-1 rounded-md border border-white/10 text-text-primary">
              ₹{result.amount.toLocaleString("en-IN")}
            </span>
          </div>

          <h4 className="text-sm font-bold text-text-primary mb-1">{result.headline}</h4>
          <p className="text-xs text-text-secondary leading-relaxed mb-4">{result.reason}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-black/30 rounded-lg border border-white/5 text-xs mb-3">
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Estimated Post-Balance</span>
              <span className="font-mono font-bold text-text-primary">
                ₹{Math.max(0, result.postBalance).toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Surplus Velocity</span>
              <span className="font-mono font-bold text-text-primary">
                {result.surplusImpactPercent}% consumed
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Replenish Timeline</span>
              <span className="font-mono font-bold text-text-primary">{result.recoveryTimeline}</span>
            </div>
          </div>

          <div className="text-xs font-medium flex items-center gap-1.5 text-text-secondary">
            <span className="text-text-muted font-bold">Recommended Action:</span>
            <span>{result.recommendedAction}</span>
          </div>
        </div>
      )}
    </div>
  )
}
