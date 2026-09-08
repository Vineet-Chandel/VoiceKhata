// src/components/Pages/BudgetPage.tsx
"use client"

import { useBudgets } from "@/components/hooks/use-budgets"
import { BudgetOverview } from "@/components/ui/Budget_UI/budget-overview"
import { BudgetList } from "@/components/ui/Budget_UI/budget-list"
import { AddBudgetDialog } from "@/components/ui/Budget_UI/add-budget-dialog"
import { MonthPicker } from "@/components/ui/Reports_UI/month-picker"
import { useState } from "react";
import { useSavings } from "@/components/hooks/use-savings";
import { GoalsTab } from "@/components/ui/Savings_UI/GoalsTab";
import { SIPTab } from "@/components/ui/Savings_UI/SIPTab";
import { PortfolioTab } from "@/components/ui/Savings_UI/PortfolioTab";
import { InsightsTab } from "@/components/ui/Savings_UI/InsightsTab";
import { ProjectionTab } from "@/components/ui/Savings_UI/ProjectionTab";
import { Target, TrendingUp, Briefcase, Lightbulb, BarChart2, PieChart } from "lucide-react";

const TABS = [
  { value: "budget", icon: PieChart, label: "Budget" },
  { value: "goals", icon: Target, label: "Goals" },
  { value: "sip", icon: TrendingUp, label: "SIP" },
  { value: "portfolio", icon: Briefcase, label: "Portfolio" },
  { value: "insights", icon: Lightbulb, label: "Insights" },
  { value: "projection", icon: BarChart2, label: "Projection" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function BudgetPage() {
  const {
    budgets,
    totalCap,
    setMonthlyTotalCap,
    loading: loadingBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    selectedMonth,
    setSelectedMonth,
  } = useBudgets()

  const [activeTab, setActiveTab] = useState<TabValue>("budget");

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
  const existingCategories = budgets.map((b) => b.category)

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        
        {/* Unified Header */}
        <div className="flex items-start justify-between gap-3 px-4 lg:px-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Budget & Investment</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-snug">
              Track your budget, goals, SIPs, investments, and growth projections
            </p>
          </div>

          {activeTab === "budget" ? (
            <div className="flex items-center gap-2">
              <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
              <AddBudgetDialog onAdd={addBudget} existingCategories={existingCategories} />
            </div>
          ) : (
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
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-4 lg:px-6 relative">
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

        {/* Tab Content */}
        <div className="px-4 lg:px-6">
          {/* Global Loading / Error for Savings */}
          {activeTab !== "budget" && anyLoading && (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Loading your savings data...
            </div>
          )}
          {activeTab !== "budget" && error && !anyLoading && (
            <div className="flex items-center justify-center py-20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="overflow-auto mt-2">
            {/* Budget Tab */}
            {activeTab === "budget" && (
              <>
                {loadingBudgets ? (
                  <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                    Loading budgets…
                  </div>
                ) : (
                  <>
                    <BudgetOverview
                      budgets={budgets}
                      totalCap={totalCap}
                      onSetTotalCap={setMonthlyTotalCap}
                    />
                    <BudgetList
                      budgets={budgets}
                      selectedMonth={selectedMonth}
                      onAddTemplateBudget={addBudget}
                      onEdit={updateBudget}
                      onDelete={deleteBudget}
                      existingCategories={existingCategories}
                    />
                  </>
                )}
              </>
            )}

            {/* Savings Tabs */}
            {!anyLoading && !error && (
              <>
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
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}