"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChartAreaInteractive } from "@/components/ui/Dashboard_UI/chart-area-interactive"
import { DataTable } from "@/components/ui/Dashboard_UI/data-table-dashboard"
import { SectionCards } from "@/components/ui/Dashboard_UI/section-cards"
import { QuickLinks } from "@/components/ui/Dashboard_UI/quick-links"
import { AISuggestions } from "@/components/ui/Dashboard_UI/ai-suggestions"
import { useTransactions } from "@/components/hooks/use-transactions"
import { useBudgets } from "@/components/hooks/use-budgets"
import { useAuth } from "@/components/hooks/use-auth"
import { createFinancialMetrics, type FinancialMetrics } from "@/lib/financial-metrics"
import { getScopedSupabase, supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"
import { Sparkles, ArrowRight, Mic } from "lucide-react"
import { useAppMode } from "@/context/AppModeContext"
import type { AppMode } from "@/context/AppModeContext"
import { VoiceCaptureCard } from "@/components/ui/Dashboard_UI/voice-capture-card"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Notification templates ───────────────────────────────────────────────────

function buildInsights(metrics: FinancialMetrics, appMode: AppMode) {
  const { totalIncome: income, totalExpense: expense, balance, savingsRate } = metrics
  const expensePct = income > 0 ? Math.round((expense / income) * 100) : 0

  if (appMode === "BUSINESS") {
    return [
      {
        type: "ai_insight" as const,
        title: "Daily Business Insight",
        message:
          savingsRate >= 30
            ? `Excellent net margin of ${savingsRate}%! Your business is operating highly efficiently. Consider reinvesting surplus into inventory or marketing.`
            : savingsRate >= 15
            ? `Your net margin is ${savingsRate}% — solid progress. Automating supply orders could further reduce operating costs.`
            : savingsRate >= 5
            ? `Your margin is ${savingsRate}%. Trimming ${currency(Math.round((income - expense) * 0.1))} from operating expenses could improve profitability.`
            : `Your margin is ${savingsRate}%. With ${currency(income)} in revenue and ${currency(expense)} in costs, analyze overhead to improve cash flow.`,
      },
      {
        type: "ai_insight" as const,
        title: "Operating Cost Analysis",
        message:
          expensePct > 80
            ? `Your costs are ${currency(expense)} — that's ${expensePct}% of revenue. Review supplier terms for quick margin wins.`
            : `You've kept costs to ${currency(expense)} (${expensePct}% of revenue). Great discipline — working capital stands at ${currency(balance)}.`,
      },
      {
        type: "system" as const,
        title: "Capital Update",
        message: `Your working capital is ${currency(balance)}. ${
          balance > 50000
            ? "You have a healthy reserve — consider expanding inventory."
            : "Monitor cash flow closely to ensure operations run smoothly."
        }`,
      },
      {
        type: "ai_insight" as const,
        title: "Business Tip",
        message: `Keeping operating costs under 70% of revenue ensures healthy cash flow. Your current ratio is ${expensePct}% — ${
          expensePct <= 70 ? "you're running efficiently!" : "try negotiating better rates to improve your ratio."
        }`,
      },
      {
        type: "ai_insight" as const,
        title: "Weekly Summary",
        message: `Consistent tracking is key to business growth. You've recorded ${currency(income)} in sales and ${currency(expense)} in costs — keep it up!`,
      },
    ]
  }

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

// ─── Dashboard Greeting ─────────────────────────────────────────────────────────

function DashboardGreeting({ userName }: { userName: string }) {
  const [greeting, setGreeting] = useState("")
  const [note, setNote] = useState("")
  const [dateStr, setDateStr] = useState("")

  useEffect(() => {
    const now = new Date()
    
    // Format date: "Thursday, 10 September"
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(now)
    
    setDateStr(formattedDate)

    const hour = now.getHours()
    
    // Determine greeting and premium note
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning")
      setNote("A fresh start to optimize your cash flow and track today's opportunities.")
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon")
      setNote("Mid-day check-in. A quick review ensures your ledgers stay perfectly balanced.")
    } else if (hour >= 17 && hour < 22) {
      setGreeting("Good evening")
      setNote("Wrapping up the day's transactions for a clear financial overview.")
    } else {
      setGreeting("Good night")
      setNote("Rest well. Your financial data is securely tracked and ready for tomorrow.")
    }
  }, [])

  const firstName = userName.split(" ")[0] || "User"

  return (
    <div className="flex flex-col gap-1 mb-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        {dateStr}
      </p>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {greeting}, {firstName}
      </h2>
      <p className="text-sm text-muted-foreground max-w-xl">
        {note}
      </p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { transactions, loading } = useTransactions()
  const { budgets } = useBudgets()
  const { user } = useAuth()
  const { appMode } = useAppMode()

  const [carryForwardPrompt, setCarryForwardPrompt] = useState<{
    month: string
    remaining: number
  } | null>(null)
  const [showInlineVoice, setShowInlineVoice] = useState(false)

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
    const insights = buildInsights(metrics, appMode)

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
        .eq("app_mode", appMode)

      if (!prevBudgets || prevBudgets.length === 0 || !active) return

      const { data: prevTx } = await supabase
        .from("transactions")
        .select("category, amount, type, date")
        .eq("firebase_uid", user.uid)
        .eq("type", "Debit")
        .eq("app_mode", appMode)
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
  }, [user?.uid, appMode])

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
        
        {/* Greeting Section */}
        <div className="px-4 lg:px-6">
          <DashboardGreeting userName={user?.displayName || "User"} />
        </div>

        {/* Voice Capture Hero Banner */}
        <div className="px-4 lg:px-6">
          {showInlineVoice ? (
            <div className="rounded-2xl border border-slate-700/60 bg-card p-4 shadow-xl shadow-slate-950/30">
              <VoiceCaptureCard onBack={() => setShowInlineVoice(false)} showBackLink={true} />
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-r from-card via-slate-900 to-card p-5 shadow-lg shadow-slate-950/20">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl" />

              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-inner">
                    <Mic className="h-6 w-6 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                        VoiceKhata Workspace
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">Smart Indian Ledger</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">
                      Say what happened. Review it. Save with confidence.
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                      Speak in Hindi, English, or Hinglish (e.g. <span className="text-blue-300 font-mono">"रमेश ने 500 रुपये दिए"</span> or <span className="text-blue-300 font-mono">"Sharma ji ko ₹1,200 udhar diya"</span>). Auto-parses offline & with AI.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setShowInlineVoice(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Mic className="h-4 w-4" />
                    Record by Voice
                  </button>
                  <Link
                    to="/dashboard/voice-capture"
                    className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2.5 text-sm font-medium text-blue-200 hover:bg-blue-500/20 hover:text-white transition-all"
                  >
                    Full View
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
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

        <QuickLinks />

        <div className="px-4 lg:px-6">
          <ChartAreaInteractive data={metrics.runningBalance} />
        </div>

        <DataTable data={transactions} limit={10} showViewAll={true} />

      </div>
    </div>
  )
}
