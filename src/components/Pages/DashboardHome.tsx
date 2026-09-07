"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChartAreaInteractive } from "@/components/ui/Dashboard_UI/chart-area-interactive"
import { DataTable } from "@/components/ui/Dashboard_UI/data-table-dashboard"
import { SectionCards } from "@/components/ui/Dashboard_UI/section-cards"
import { AISuggestions } from "@/components/ui/Dashboard_UI/ai-suggestions"
import { useTransactions } from "@/components/hooks/use-transactions"
import { useBudgets } from "@/components/hooks/use-budgets"
import { useAuth } from "@/components/hooks/use-auth"
import { createFinancialMetrics, type FinancialMetrics } from "@/lib/financial-metrics"
import { getScopedSupabase, supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"
import { Sparkles, ArrowRight } from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Notification templates ───────────────────────────────────────────────────

function buildInsights(metrics: FinancialMetrics) {
  const { totalIncome: income, totalExpense: expense, balance, savingsRate } = metrics
  const expensePct = income > 0 ? Math.round((expense / income) * 100) : 0

  return [
    {
      type: "ai_insight" as const,
      title: "Daily Financial Insight",
      message:
        savingsRate >= 70
          ? `Outstanding savings rate of ${savingsRate}%! You're well ahead of the recommended 20%. Consider directing surplus into an index fund or recurring deposit.`
          : savingsRate >= 40
          ? `Your savings rate is ${savingsRate}% — solid progress. Automating a fixed monthly transfer could push it above 50%.`
          : savingsRate >= 20
          ? `Your savings rate is ${savingsRate}%. The benchmark is 20% — trimming ${currency(Math.round((income - expense) * 0.1))} from monthly expenses could make a big difference.`
          : `Your savings rate is ${savingsRate}%. This is below the recommended 20% minimum. With ${currency(income)} in income and ${currency(expense)} in expenses, look for categories to trim.`,
    },
    {
      type: "ai_insight" as const,
      title: "Spending Pattern Detected",
      message:
        expensePct > 80
          ? `Your expenses are ${currency(expense)} — that's ${expensePct}% of income. Review your top categories for quick savings wins.`
          : `You've kept expenses to ${currency(expense)} (${expensePct}% of income). Great discipline — balance stands at ${currency(balance)}.`,
    },
    {
      type: "system" as const,
      title: "Balance Update",
      message: `Your current balance is ${currency(balance)}. ${
        balance > 10000
          ? "You have a healthy cushion — consider setting a savings goal to put it to work."
          : "Keep an eye on spending to grow your balance this month."
      }`,
    },
    {
      type: "ai_insight" as const,
      title: "Financial Tip",
      message: `The 50/30/20 rule suggests 50% on needs, 30% on wants, and 20% savings. Your current expense ratio is ${expensePct}% — ${
        expensePct <= 80 ? "you're on track!" : "try trimming discretionary spending to improve your ratio."
      }`,
    },
    {
      type: "ai_insight" as const,
      title: "Weekly Insight",
      message: `Tracking your spending consistently is the #1 habit of people who build wealth. You've logged ${currency(expense)} in expenses — keep the momentum going!`,
    },
  ]
}

// ─── Insert with per-day deduplication ───────────────────────────────────────

async function maybeInsert(
  firebaseUid: string,
  type: string,
  title: string,
  message: string
) {
  try {
    await getScopedSupabase(firebaseUid, { force: true })
  } catch {
    return
  }
  const todayStr = new Date().toISOString().slice(0, 10)

  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("firebase_uid", firebaseUid)
    .eq("title", title)
    .gte("created_at", `${todayStr}T00:00:00.000Z`)
    .limit(1)

  if (existing && existing.length > 0) return

  const { error } = await supabase.from("notifications").insert({
    firebase_uid: firebaseUid,
    type,
    title,
    message,
    metadata: {},
    read: false,
    created_at: new Date().toISOString(),
  })

  if (error) console.error("[notifications] insert error:", error.message)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { transactions, loading } = useTransactions()
  const { budgets } = useBudgets()
  const { user } = useAuth()

  const [carryForwardPrompt, setCarryForwardPrompt] = useState<{
    month: string
    remaining: number
  } | null>(null)

  const metrics = useMemo(
    () => createFinancialMetrics(transactions, budgets),
    [transactions, budgets]
  )

  // ── Notification firing — guarded to fire once per session ────────────────
  const hasFiredRef = useRef(false)

  useEffect(() => {
    // Use transactions.length (not metrics) in deps to avoid re-firing on
    // every memo recalculation. hasFiredRef ensures single fire per session.
    if (loading || !user?.uid || transactions.length === 0 || hasFiredRef.current) return
    hasFiredRef.current = true

    const uid = user.uid
    const insights = buildInsights(metrics)

    // First notification immediately
    maybeInsert(uid, insights[0].type, insights[0].title, insights[0].message)

    // Rest staggered every 8s
    insights.slice(1).forEach((n, i) => {
      setTimeout(() => {
        maybeInsert(uid, n.type, n.title, n.message)
      }, (i + 1) * 8000)
    })

    // Budget alerts after 3s — uses metrics for accuracy
    setTimeout(() => {
      for (const row of metrics.budgetUtilization.byCategory) {
        if (row.budget > 0 && row.utilizationRate >= 80) {
          maybeInsert(
            uid,
            "budget_alert",
            `Budget Alert: ${row.category}`,
            `You've used ${row.utilizationRate}% of your ${currency(row.budget)} budget for ${row.category}. ${currency(Math.max(0, row.remaining))} remaining.`
          )
        }
      }
    }, 3000)
  }, [loading, user?.uid, transactions.length]) // ✅ intentionally excludes metrics

  // ── Carry-forward prompt ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return

    let active = true
    ;(async () => {
      try {
        await getScopedSupabase(user.uid, { force: true })
      } catch {
        return
      }

      const now = new Date()
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`

      const { data: prevBudgets } = await supabase
        .from("budgets")
        .select("category, amount")
        .eq("firebase_uid", user.uid)
        .eq("month", prevMonth)

      if (!prevBudgets || prevBudgets.length === 0 || !active) return

      const { data: prevTx } = await supabase
        .from("transactions")
        .select("category, amount, type, date")
        .eq("firebase_uid", user.uid)
        .eq("type", "Debit")
        .gte("date", `${prevMonth}-01`)
        .lte("date", `${prevMonth}-31`)

      const spentByCategory = new Map<string, number>()
      ;(prevTx ?? []).forEach((row) => {
        spentByCategory.set(
          row.category,
          (spentByCategory.get(row.category) ?? 0) + Number(row.amount || 0)
        )
      })

      const remaining = prevBudgets.reduce((sum, row) => {
        const left = Number(row.amount || 0) - (spentByCategory.get(row.category) ?? 0)
        return sum + Math.max(left, 0)
      }, 0)

      if (active && remaining > 0) {
        setCarryForwardPrompt({ month: prevMonth, remaining })
      }
    })()

    return () => { active = false }
  }, [user?.uid])

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 py-20 text-muted-foreground text-sm">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

        {/* Money Growth Engine Spotlight Card */}
        <div className="px-4 lg:px-6">
          <Link
            to="/dashboard/growth"
            className="group relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 via-emerald-500/5 to-surface-secondary/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-violet-500/50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="text-violet-400" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary">AI Money Growth Center</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">New Engine</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  View your Financial Digital Twin, Next Best Move, Rupee Router, and What-If Simulator.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition-colors shrink-0">
              <span>Launch Growth Center</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        <SectionCards
          income={metrics.totalIncome}
          expense={metrics.totalExpense}
          balance={metrics.balance}
          savingsRate={metrics.savingsRate}
        />

        {/* Carry-forward banner — new feature from Codex */}
        {carryForwardPrompt && (
          <div className="px-4 lg:px-6">
            <div className="rounded-xl border border-border bg-card p-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                You had{" "}
                <span className="text-foreground font-medium">
                  {currency(carryForwardPrompt.remaining)}
                </span>{" "}
                left in {carryForwardPrompt.month}. Carry-forward planning is available.
              </p>
              <Link
                to="/dashboard/budget"
                className="text-sm text-primary hover:underline underline-offset-4 shrink-0"
              >
                Review carry-forward →
              </Link>
            </div>
          </div>
        )}

        <AISuggestions
          transactions={transactions}
          budgets={budgets}
          metrics={metrics}
          dataLoading={loading}
        />

        <div className="px-4 lg:px-6">
          <ChartAreaInteractive data={metrics.runningBalance} />
        </div>

        <DataTable data={transactions} limit={10} showViewAll={true} />

      </div>
    </div>
  )
}
