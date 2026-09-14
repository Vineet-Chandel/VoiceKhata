import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppMode } from "@/context/AppModeContext";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Loader2, 
  Sparkles, 
  Store, 
  User, 
  RefreshCw, 
  TrendingUp, 
  ArrowDownRight, 
  Wallet,
  Layers,
  Sliders,
  Activity,
  ArrowRight
} from "lucide-react";

import { useMoneyGrowth } from "@/components/hooks/use-money-growth";
import { useTransactions } from "@/components/hooks/use-transactions";
import { FinancialHealth } from "@/components/ui/MoneyGrowthCenter/FinancialHealth";
import { NextBestMove } from "@/components/ui/MoneyGrowthCenter/NextBestMove";
import { MoneyMoments } from "@/components/ui/MoneyGrowthCenter/MoneyMoments";
import { MoneyFlow } from "@/components/ui/MoneyGrowthCenter/MoneyFlow";
import { RupeeRouter } from "@/components/ui/MoneyGrowthCenter/RupeeRouter";
import { WhatIfSimulator } from "@/components/ui/MoneyGrowthCenter/WhatIfSimulator";
import { CanIAffordThis } from "@/components/ui/MoneyGrowthCenter/CanIAffordThis";
import { BusinessCommandCenter } from "@/components/ui/MoneyGrowthCenter/BusinessCommandCenter";

type GrowthTab = "flow" | "simulator" | "pulse";

export default function BusinessGrowthHubPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { appMode, setAppMode } = useAppMode();
  const { allTransactions, loading: txLoading } = useTransactions();

  // Explicit target mode for Money Growth: either PERSONAL or BUSINESS
  const currentMode: "PERSONAL" | "BUSINESS" = appMode === "PERSONAL" ? "PERSONAL" : "BUSINESS";
  const isBiz = currentMode === "BUSINESS";

  // Active tab state to keep layout clean and uncluttered
  const [activeTab, setActiveTab] = useState<GrowthTab>("flow");
  const [simulatorSubTab, setSimulatorSubTab] = useState<"afford" | "whatif">("afford");

  // ── Money Growth Engine with explicit mode separation ─────────────────────
  const { data: growthData, loading: growthLoading, refresh } = useMoneyGrowth(currentMode);

  // ── Compute Mode-Specific Financial Figures ───────────────────────────────
  const modeTransactions = (allTransactions || []).filter(
    (t) => (t.app_mode || "BUSINESS") === currentMode
  );

  const currentBalance = modeTransactions.reduce(
    (acc, t) => (t.type === "Credit" ? acc + (Number(t.amount) || 0) : acc - (Number(t.amount) || 0)),
    0
  );

  const totalInflow = modeTransactions
    .filter((t) => t.type === "Credit")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalOutflow = modeTransactions
    .filter((t) => t.type === "Debit")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const netSurplus = Math.max(0, totalInflow - totalOutflow);
  const savingsRate = totalInflow > 0 ? Math.round((netSurplus / totalInflow) * 100) : 0;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (growthLoading && !growthData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
          <Loader2 size={44} className="animate-spin text-violet-500 relative z-10" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mt-2">
          {isBiz ? "Analyzing Store Financial Pulse..." : "Analyzing Personal Financial Twin..."}
        </h2>
        <p className="text-sm text-text-muted">
          Computing real-time health score, surplus router, and optimal next move
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* ── Top Bar: Title & Mode Switcher ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className={`size-11 rounded-2xl flex items-center justify-center shrink-0 border ${
            isBiz 
              ? "bg-blue-500/15 border-blue-500/30 text-blue-400" 
              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
          }`}>
            {isBiz ? <Store size={22} /> : <Sparkles size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Money Growth Engine</h1>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isBiz 
                  ? "bg-blue-500/15 text-blue-300 border-blue-500/25" 
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
              }`}>
                {isBiz ? "Store Mode" : "Personal Mode"}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {isBiz 
                ? "Retail cash flow, inventory working capital, and supplier dues management." 
                : "Personal wealth compounding, emergency firewall, and SIP allocation."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Segmented Mode Switcher */}
          <div className="inline-flex p-1 bg-surface-secondary/80 border border-border rounded-xl">
            <button
              onClick={() => setAppMode("PERSONAL")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isBiz
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <User size={14} />
              Personal
            </button>
            <button
              onClick={() => setAppMode("BUSINESS")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isBiz
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/30 shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Store size={14} />
              Business
            </button>
          </div>

          <button
            onClick={refresh}
            disabled={growthLoading}
            title="Recalculate AI financial metrics"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-secondary/70 hover:bg-surface-secondary border border-border rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={growthLoading ? "animate-spin text-violet-400" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── 3 Quick-Glance Summary KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-surface-secondary/40 border border-border rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBiz ? "Store Sales / Inflow" : "Total Monthly Income"}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              ₹{totalInflow.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              {isBiz ? "Collected revenue" : "Recorded credit inflow"}
            </p>
          </div>
        </div>

        <div className="bg-surface-secondary/40 border border-border rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBiz ? "Shop Costs / Outflow" : "Monthly Outflow"}
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowDownRight size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              ₹{totalOutflow.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              {isBiz ? "Inventory, rent & suppliers" : "Living essentials & bills"}
            </p>
          </div>
        </div>

        <div className="bg-surface-secondary/40 border border-border rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isBiz ? "Net Retained Profit" : "Net Monthly Surplus"}
            </span>
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Wallet size={15} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                ₹{netSurplus.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                {savingsRate}% {isBiz ? "margin" : "saved"}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              {isBiz ? "Available for restock & growth" : "Free cash for compounding"}
            </p>
          </div>
        </div>
      </div>

      {growthData ? (
        <>
          {/* ── Hero: Next Best Move & Financial Health ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <NextBestMove data={growthData.nextBestMove} />
            <FinancialHealth health={growthData.financialHealth} mode={currentMode} />
          </div>

          {/* ── Clean Tabbed Section: Eliminates 9-Card Clutter ──────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-3">
              <div className="inline-flex p-1 bg-surface-secondary/70 border border-border rounded-xl">
                <button
                  onClick={() => setActiveTab("flow")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "flow"
                      ? "bg-surface-elevated text-text-primary shadow-sm font-semibold"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Layers size={14} className={activeTab === "flow" ? "text-violet-400" : ""} />
                  Cash Flow & Allocations
                </button>
                <button
                  onClick={() => setActiveTab("simulator")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "simulator"
                      ? "bg-surface-elevated text-text-primary shadow-sm font-semibold"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Sliders size={14} className={activeTab === "simulator" ? "text-emerald-400" : ""} />
                  Decision Tools & Affordability
                </button>
                <button
                  onClick={() => setActiveTab("pulse")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "pulse"
                      ? "bg-surface-elevated text-text-primary shadow-sm font-semibold"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Activity size={14} className={activeTab === "pulse" ? "text-blue-400" : ""} />
                  {isBiz ? "Store Pulse & Insights" : "AI Insights & Alerts"}
                </button>
              </div>

              <span className="text-xs text-text-muted hidden md:inline">
                Mode: <strong className={isBiz ? "text-blue-400" : "text-emerald-400"}>{currentMode}</strong>
              </span>
            </div>

            {/* Tab 1: Cash Flow & Surplus Routing */}
            {activeTab === "flow" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-200">
                <MoneyFlow flow={growthData.moneyFlow} mode={currentMode} />
                <RupeeRouter router={growthData.rupeeRouter} mode={currentMode} />
              </div>
            )}

            {/* Tab 2: Decision Tools (Affordability & Simulator) */}
            {activeTab === "simulator" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-center">
                  <div className="inline-flex p-1 bg-surface-secondary border border-border rounded-xl">
                    <button
                      onClick={() => setSimulatorSubTab("afford")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        simulatorSubTab === "afford"
                          ? "bg-surface-elevated text-text-primary shadow-sm"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      {isBiz ? "Can the Store Afford This?" : "Can I Afford This?"}
                    </button>
                    <button
                      onClick={() => setSimulatorSubTab("whatif")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        simulatorSubTab === "whatif"
                          ? "bg-surface-elevated text-text-primary shadow-sm"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      {isBiz ? "Store Compounding Simulator" : "Wealth Projection Simulator"}
                    </button>
                  </div>
                </div>

                {simulatorSubTab === "afford" ? (
                  <CanIAffordThis
                    flow={growthData.moneyFlow}
                    health={growthData.financialHealth}
                    balance={currentBalance}
                    mode={currentMode}
                  />
                ) : (
                  <WhatIfSimulator
                    flow={growthData.moneyFlow}
                    health={growthData.financialHealth}
                    mode={currentMode}
                  />
                )}
              </div>
            )}

            {/* Tab 3: Pulse & AI Moments */}
            {activeTab === "pulse" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {isBiz && (
                  <BusinessCommandCenter business={growthData.businessCommandCenter} />
                )}
                <MoneyMoments moments={growthData.moneyMoments} />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-surface-secondary/30 rounded-2xl border border-border">
          <p className="text-text-muted text-sm">No transaction records found for {currentMode} mode.</p>
          <p className="text-xs text-text-secondary mt-1">Add transactions or switch mode to calculate growth intelligence.</p>
        </div>
      )}
    </div>
  );
}
