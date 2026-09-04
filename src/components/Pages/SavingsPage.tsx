// src/components/Pages/SavingsPage.tsx

import { useState } from "react";
import { useSavings } from "@/components/hooks/use-savings";
import { GoalsTab } from "@/components/ui/Savings_UI/GoalsTab";
import { SIPTab } from "@/components/ui/Savings_UI/SIPTab";
import { PortfolioTab } from "@/components/ui/Savings_UI/PortfolioTab";
import { InsightsTab } from "@/components/ui/Savings_UI/InsightsTab";
import { ProjectionTab } from "@/components/ui/Savings_UI/ProjectionTab";
import { Target, TrendingUp, Briefcase, Lightbulb, BarChart2 } from "lucide-react";

const TABS = [
  { value: "goals", icon: Target, label: "Goals" },
  { value: "sip", icon: TrendingUp, label: "SIP" },
  { value: "portfolio", icon: Briefcase, label: "Portfolio" },
  { value: "insights", icon: Lightbulb, label: "Insights" },
  { value: "projection", icon: BarChart2, label: "Projection" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function SavingsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("goals");

  const {
    goals,
    sipPlans,
    investments,
    recurringSavings,
    loadingGoals,
    loadingSIP,
    loadingInvestments,
    error,
    createGoal,
    editGoal,
    removeGoal,
    createSIP,
    editSIP,
    removeSIP,
    createInvestment,
    editInvestment,
    removeInvestment,
    totalSaved,
    totalInvested,
    totalTarget,
  } = useSavings();

  const anyLoading = loadingGoals || loadingSIP || loadingInvestments;

  return (
    <div className="flex flex-col h-full w-full p-4 sm:p-6 gap-4 sm:gap-6 bg-background text-foreground">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">FinVault</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-snug">
            Track your goals, SIPs, investments, and growth projections
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-[10px] sm:text-xs">Total Saved</span>
            <span className="font-semibold text-green-400 text-xs sm:text-sm">
              ₹{totalSaved.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="w-px bg-border" />
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-[10px] sm:text-xs">Total Invested</span>
            <span className="font-semibold text-blue-400 text-xs sm:text-sm">
              ₹{totalInvested.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="w-px bg-border" />
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-[10px] sm:text-xs">Total Target</span>
            <span className="font-semibold text-purple-400 text-xs sm:text-sm">
              ₹{totalTarget.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Scrollable Tab Bar ── */}
      <div className="relative">
        {/* Fade edges to hint scrollability */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="
          flex gap-1 p-1 rounded-xl bg-muted/40
          overflow-x-auto scroll-smooth
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        ">
          {TABS.map(({ value, icon: Icon, label }) => {
            const isActive = activeTab === value;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`
                  flex items-center gap-1.5 shrink-0
                  px-4 py-1.5 rounded-lg text-xs font-medium
                  whitespace-nowrap transition-all duration-150
                  ${isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }
                `}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading ── */}
      {anyLoading && (
        <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
          Loading your savings data...
        </div>
      )}

      {/* ── Error ── */}
      {error && !anyLoading && (
        <div className="flex items-center justify-center flex-1 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Tab Content ── */}
      {!anyLoading && !error && (
        <div className="flex-1 overflow-auto">
          {activeTab === "goals" && (
            <GoalsTab
              goals={goals}
              loadingGoals={loadingGoals}
              createGoal={createGoal}
              editGoal={editGoal}
              removeGoal={removeGoal}
            />
          )}
          {activeTab === "sip" && (
            <SIPTab
              sipPlans={sipPlans}
              loadingSIP={loadingSIP}
              createSIP={createSIP}
              editSIP={editSIP}
              removeSIP={removeSIP}
            />
          )}
          {activeTab === "portfolio" && (
            <PortfolioTab
              investments={investments}
              loadingInvestments={loadingInvestments}
              createInvestment={createInvestment}
              editInvestment={editInvestment}
              removeInvestment={removeInvestment}
            />
          )}
          {activeTab === "insights" && (
            <InsightsTab
              goals={goals}
              investments={investments}
              recurringSavings={recurringSavings}
              sipPlans={sipPlans}
              totalSaved={totalSaved}
              totalInvested={totalInvested}
              totalTarget={totalTarget}
            />
          )}
          {activeTab === "projection" && (
            <ProjectionTab
              goals={goals}
              sipPlans={sipPlans}
              investments={investments}
            />
          )}
        </div>
      )}
    </div>
  );
}