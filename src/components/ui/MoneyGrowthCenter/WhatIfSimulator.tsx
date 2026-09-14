import React, { useState, useMemo } from "react"
import { Sliders, Sparkles, CheckCircle2 } from "lucide-react"

type ScenarioType = "current" | "safe" | "growth" | "custom"

interface WhatIfSimulatorProps {
  flow?: {
    income?: number;
    essentials?: number;
    fixedCommitments?: number;
    debt?: number;
    savings?: number;
    investments?: number;
    leakage?: number;
    untappedCapacity?: number;
  };
  health?: {
    score?: number;
    metrics?: {
      emergencyFund?: number;
      cashFlow?: number;
      savings?: number;
    };
  };
  mode?: "PERSONAL" | "BUSINESS";
}

export function WhatIfSimulator({ flow, health, mode = "PERSONAL" }: WhatIfSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>("growth")
  const [customSavingsDelta, setCustomSavingsDelta] = useState<number>(3000)

  const isBusiness = mode === "BUSINESS"

  const baselineIncome = flow?.income || 50000
  const baselineExpense = (flow?.essentials || 25000) + (flow?.fixedCommitments || 10000) + (flow?.debt || 5000) + (flow?.leakage || 3000)
  const baselineSavings = Math.max(0, baselineIncome - baselineExpense)
  const baselineEmergencyCoverage = health?.metrics?.emergencyFund ?? 45

  // Calculations for scenarios
  const scenarioData = useMemo(() => {
    // Current Path
    const currentSurplus = baselineSavings
    const currentRunwayMos = currentSurplus > 0 ? Math.max(1, Math.round(((100 - baselineEmergencyCoverage) / 100 * (baselineExpense * 3)) / Math.max(1000, currentSurplus))) : 12
    const current1Yr = Math.round(currentSurplus * 12 * 1.04)
    const current3Yr = Math.round(currentSurplus * 36 * 1.08)

    // Safe Path: reduce leakage by 60%
    const leakageSaved = Math.max(2000, Math.round((flow?.leakage || 4000) * 0.6))
    const safeSurplus = baselineSavings + leakageSaved
    const safeRunwayMos = Math.max(1, Math.round(((100 - baselineEmergencyCoverage) / 100 * (baselineExpense * 3)) / Math.max(1000, safeSurplus)))
    const safe1Yr = Math.round(safeSurplus * 12 * 1.05)
    const safe3Yr = Math.round(safeSurplus * 36 * 1.10)

    // Growth Path: increase investable SIP or business inventory reinvestment
    const sipBoost = Math.max(3000, Math.round(baselineSavings * 0.4))
    const growthSurplus = baselineSavings + Math.round((flow?.untappedCapacity || 3000) * 0.5)
    const growth1Yr = Math.round((baselineSavings * 12 * 1.04) + (sipBoost * 12 * 1.12))
    const growth3Yr = Math.round((baselineSavings * 36 * 1.08) + (sipBoost * 36 * 1.35))

    // Custom Path
    const customSurplus = Math.max(0, baselineSavings + customSavingsDelta)
    const custom1Yr = Math.round(customSurplus * 12 * 1.08)
    const custom3Yr = Math.round(customSurplus * 36 * 1.20)
    const customRunwayMos = customSurplus > 0 ? Math.max(1, Math.round(((100 - baselineEmergencyCoverage) / 100 * (baselineExpense * 3)) / Math.max(1000, customSurplus))) : 12

    return {
      current: {
        title: isBusiness ? "Current Business Pace" : "Current Baseline",
        subtitle: isBusiness ? "Maintain store's current sales and supplier payment velocity" : "Maintain existing spending & savings pace",
        monthlySurplus: currentSurplus,
        runwayImpact: isBusiness ? `Operating buffer secure for ~${currentRunwayMos} months` : `Emergency shield in ~${currentRunwayMos} months`,
        oneYearWealth: current1Yr,
        threeYearWealth: current3Yr,
        risk: "Moderate",
        badge: "Status Quo",
        color: "border-border/60 bg-surface-secondary/20",
        activeColor: "border-slate-400 bg-slate-500/10",
      },
      safe: {
        title: isBusiness ? "Working Capital Firewall" : "Safe Firewall Path",
        subtitle: isBusiness
          ? `Cut ~₹${leakageSaved.toLocaleString("en-IN")} overheads into a dedicated distributor payment float`
          : `Trim ~₹${leakageSaved.toLocaleString("en-IN")} discretionary leakage into emergency liquid funds`,
        monthlySurplus: safeSurplus,
        runwayImpact: isBusiness ? `Working capital reserve reaches safe buffer in ~${safeRunwayMos} mos` : `Emergency shield accelerated to ~${safeRunwayMos} months`,
        oneYearWealth: safe1Yr,
        threeYearWealth: safe3Yr,
        risk: "Low Risk (High Resilience)",
        badge: isBusiness ? "Recommended for Cash Flow" : "Recommended for Safety",
        color: "border-emerald-500/30 bg-emerald-500/5",
        activeColor: "border-emerald-500 bg-emerald-500/15 shadow-[0_0_25px_rgba(16,185,129,0.15)]",
      },
      growth: {
        title: isBusiness ? "Inventory Compounding Path" : "Growth & Compounding Path",
        subtitle: isBusiness
          ? `Reinvest ₹${sipBoost.toLocaleString("en-IN")}/mo surplus into high-turnover grocery lines`
          : `Deploy ₹${sipBoost.toLocaleString("en-IN")}/mo into automated index SIPs beating inflation`,
        monthlySurplus: growthSurplus,
        runwayImpact: isBusiness ? `Boosts store 3-yr gross margin by +₹${(growth3Yr - current3Yr).toLocaleString("en-IN")}` : `Adds ₹${(growth3Yr - current3Yr).toLocaleString("en-IN")} extra compound wealth over 3 yrs`,
        oneYearWealth: growth1Yr,
        threeYearWealth: growth3Yr,
        risk: isBusiness ? "Inventory Working Capital Risk" : "Calculated Market Risk",
        badge: isBusiness ? "Highest Margin" : "High Return",
        color: "border-violet-500/30 bg-violet-500/5",
        activeColor: "border-violet-500 bg-violet-500/15 shadow-[0_0_25px_rgba(139,92,246,0.15)]",
      },
      custom: {
        title: isBusiness ? "Custom Store Model" : "Custom Parameter Path",
        subtitle: `Adjust monthly delta by ${customSavingsDelta >= 0 ? "+" : ""}₹${customSavingsDelta.toLocaleString("en-IN")}/mo`,
        monthlySurplus: customSurplus,
        runwayImpact: isBusiness ? `Cash runway modeled for ~${customRunwayMos} months` : `Emergency target in ~${customRunwayMos} months`,
        oneYearWealth: custom1Yr,
        threeYearWealth: custom3Yr,
        risk: customSavingsDelta >= 5000 ? "Ambitious" : "Balanced",
        badge: "User Modeled",
        color: "border-cyan-500/30 bg-cyan-500/5",
        activeColor: "border-cyan-500 bg-cyan-500/15 shadow-[0_0_25px_rgba(6,182,212,0.15)]",
      }
    }
  }, [baselineIncome, baselineExpense, baselineSavings, baselineEmergencyCoverage, flow, customSavingsDelta, isBusiness])

  const active = scenarioData[selectedScenario]

  return (
    <div id="what-if-simulator" className="bg-surface-secondary/40 border border-border rounded-2xl p-5 md:p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Sliders size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">What-If Growth Simulator</h2>
            <p className="text-xs text-text-muted">Simulate trajectory changes before committing your real rupees.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedScenario("growth")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedScenario === "growth" ? "bg-violet-600 text-white" : "bg-surface-elevated text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            Growth SIP
          </button>
          <button
            onClick={() => setSelectedScenario("safe")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedScenario === "safe" ? "bg-emerald-600 text-white" : "bg-surface-elevated text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            Safe Firewall
          </button>
          <button
            onClick={() => setSelectedScenario("custom")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedScenario === "custom" ? "bg-cyan-600 text-white" : "bg-surface-elevated text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(["current", "safe", "growth"] as const).map((key) => {
          const item = scenarioData[key]
          const isSelected = selectedScenario === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedScenario(key)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected ? item.activeColor : item.color
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    {item.title}
                  </h3>
                  {isSelected && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                </div>
                <p className="text-xs text-text-muted mb-4 leading-relaxed">{item.subtitle}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Monthly Surplus</span>
                  <span className="font-bold text-emerald-400 font-mono">₹{item.monthlySurplus.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">3-Yr Projected</span>
                  <span className="font-bold text-text-primary font-mono">₹{item.threeYearWealth.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Custom Slider Drawer if Custom mode is chosen */}
      {selectedScenario === "custom" && (
        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/30 mb-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-cyan-300">Simulate Additional Monthly Savings or Cuts:</span>
            <span className="text-sm font-bold text-cyan-400 font-mono">
              {customSavingsDelta >= 0 ? `+₹${customSavingsDelta.toLocaleString("en-IN")}` : `-₹${Math.abs(customSavingsDelta).toLocaleString("en-IN")}`}/mo
            </span>
          </div>
          <input
            type="range"
            min="-5000"
            max="25000"
            step="1000"
            value={customSavingsDelta}
            onChange={(e) => setCustomSavingsDelta(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer mb-2"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>-₹5,000 (Spend surge)</span>
            <span>₹0 (Neutral)</span>
            <span>+₹25,000 (Aggressive)</span>
          </div>
        </div>
      )}

      {/* Active Scenario Detailed Projection Strip */}
      <div className="p-5 rounded-xl bg-black/30 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Active Projection: <strong className="text-text-primary">{active.title}</strong>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-text-secondary font-medium">
              {active.badge}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {active.runwayImpact}. Risk Profile: <span className="font-semibold text-text-primary">{active.risk}</span>.
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">1-Year Value</span>
            <span className="text-base font-bold text-text-primary font-mono">₹{active.oneYearWealth.toLocaleString("en-IN")}</span>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-right">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">3-Year Wealth</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">₹{active.threeYearWealth.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
