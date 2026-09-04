"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Target, Repeat, Brain, Zap } from "lucide-react"
import { useAuth } from "@/components/hooks/use-auth"
import { useTransactions, type Transaction } from "@/components/hooks/use-transactions"
import { MonthPicker } from "@/components/ui/Reports_UI/month-picker"
import { getProgressColor, isBudgetActiveForMonth, computeBudgetSpent } from "@/lib/budget-utils"
import { getScopedSupabase, supabase } from "@/lib/supabase"
import type { Budget } from "@/components/hooks/use-budgets"

// ─── Types ────────────────────────────────────────────────────────────────────

type SavingsGoalRow = {
  id: string
  name: string
  target_amount: number
  saved_amount: number
  deadline: string | null
  color: string | null
}

type SIPPlanRow = {
  id: string
  monthly_amount: number
  active: boolean
}

type ManualInvestmentRow = {
  id: string
  name: string
  amount_invested: number
  quantity: number | null
  bought_price: number | null
  current_price: number | null
}

type RecurringTransactionRow = {
  id: string
  transaction: string
  amount: number
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  next_run: string
  active: boolean
}

type RecurringSavingRow = {
  id: string
  amount: number
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  active: boolean
}

type MerchantMemoryRow = {
  normalized_name: string
  category: string | null
  hit_count: number | null
}

type UserProfileRow = {
  savings_goal: number | null
  monthly_income: number | null
}

type ReportsData = {
  budgets: Budget[]
  savingsGoals: SavingsGoalRow[]
  sipPlans: SIPPlanRow[]
  manualInvestments: ManualInvestmentRow[]
  recurringTransactions: RecurringTransactionRow[]
  recurringSavings: RecurringSavingRow[]
  merchantMemory: MerchantMemoryRow[]
  userProfile: UserProfileRow | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DONUT_COLORS = [
  "#60a5fa", "#34d399", "#f59e0b", "#f87171",
  "#a78bfa", "#22d3ee", "#9ca3af", "#fb923c",
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function addMonths(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number)
  return new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "short", year: "2-digit" })
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function median(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function savingsRate(income: number, expense: number) {
  if (income <= 0) return 0
  return ((income - expense) / income) * 100
}

function normalizeMonthlyAmount(amount: number, frequency: string) {
  if (frequency === "daily") return amount * 30
  if (frequency === "weekly") return amount * 4.345
  if (frequency === "yearly") return amount / 12
  return amount
}

function buildMonthSeries(transactions: Transaction[], endMonth: string, count = 12) {
  const months = Array.from({ length: count }, (_, idx) => addMonths(endMonth, -(count - 1 - idx)))
  return months.map((month) => {
    const rows = transactions.filter((tx) => tx.date.startsWith(month))
    const income = rows.filter((tx) => tx.type === "Credit").reduce((sum, tx) => sum + toNumber(tx.amount), 0)
    const expense = rows.filter((tx) => tx.type === "Debit").reduce((sum, tx) => sum + toNumber(tx.amount), 0)
    return { month, label: monthLabel(month), income, expense, savings: income - expense, count: rows.length }
  })
}

function momDelta(current: number, previous: number) {
  return previous === 0 ? 0 : ((current - previous) / previous) * 100
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

// ── Global scrollbar hider injected once ──────────────────────────────────────
// Hides scrollbars on all overflow containers without disabling scroll functionality.
function GlobalScrollbarStyle() {
  return (
    <style>{`
      * {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      *::-webkit-scrollbar {
        display: none;
      }
    `}</style>
  )
}

function SurfaceCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
}: {
  title: string
  subtitle?: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        "rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--surface-card)] p-4 flex flex-col gap-3",
        // Hover transition: subtle border brighten + faint background lift
        "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:border-border-secondary hover:bg-[#1d1d1d]",
        // Mobile tap feedback
        "active:scale-[0.995] active:border-border-secondary",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
        <div>
          <p className="text-sm font-semibold text-[#979797]">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── KPI card ────────────────────────────────────────────────────────────────
// CHANGE: Merged the two 4-card KPI rows into one 8-card row at the call site.
// The card itself now has a proper hover lift + glow ring + sparkline fade-in,
// and an :active press-down for touch devices.
function KpiCard({
  label,
  value,
  change,
  positive,
  trend,
  sub,
}: {
  label: string
  value: string
  change?: number
  positive?: boolean
  trend?: { v: number }[]
  sub?: string
}) {
  const Icon = positive ? TrendingUp : TrendingDown
  const color = positive ? "text-emerald-400" : "text-red-400"

  return (
    <div
      className={[
        "group relative rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--surface-card)] p-3",
        "flex flex-col gap-2 min-h-[130px] overflow-hidden",
        // Smooth transition for all interactive properties
        "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        // Desktop hover: lift + border brighten + shadow
        "hover:-translate-y-0.5 hover:border-border-secondary hover:bg-[#1d1d1d]",
        "hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
        // Mobile tap: slight press-down, no lift
        "active:translate-y-0 active:scale-[0.985] active:border-border-secondary active:bg-[#1d1d1d]",
      ].join(" ")}
    >
      {/* Radial glow that fades in on hover */}
      <div
        className={[
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200",
          "group-hover:opacity-100",
          positive === true
            ? "bg-[radial-gradient(ellipse_at_top_left,rgba(52,211,153,0.10),transparent_70%)]"
            : positive === false
              ? "bg-[radial-gradient(ellipse_at_top_left,rgba(248,113,113,0.10),transparent_70%)]"
              : "bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.04),transparent_70%)]",
        ].join(" ")}
      />

      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        {positive !== undefined && <Icon size={15} className={color} />}
        <p className={`text-lg font-semibold ${positive !== undefined ? color : "text-text-primary"}`}>{value}</p>
        {typeof change === "number" && change !== 0 && (
          <span className={`text-xs ml-auto ${positive ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <p className="text-[11px] text-muted-foreground -mt-1">{sub}</p>}
      {trend && trend.length > 0 && (
        // Sparkline brightens on hover
        <div className="mt-auto h-10 w-full opacity-50 transition-opacity duration-200 group-hover:opacity-90">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} style={{ backgroundColor: "transparent" }}>
              <Line type="monotone" dataKey="v" stroke="#9ca3af" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ─── Budget row ───────────────────────────────────────────────────────────────
// CHANGE: Added hover transition + active press for mobile.
function BudgetRow({ label, spent, total, pct }: { label: string; spent: number; total: number; pct: number }) {
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-400" : "bg-emerald-500"
  return (
    <div
      className={[
        "rounded-lg border border-white/5 p-2.5",
        "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:border-border-secondary hover:bg-white/[0.025]",
        "active:scale-[0.99] active:border-border-secondary",
      ].join(" ")}
    >
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-text-primary">{label}</span>
        <span className="text-muted-foreground">{fmt(spent)} / {fmt(total)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">{pct.toFixed(1)}% used · {fmt(total - spent)} remaining</p>
    </div>
  )
}

// Tooltip wrappers matching old style
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#fff" }}>
      {label && <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>}
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
          <span style={{ color: "#9ca3af", textTransform: "capitalize" }}>{p.name ?? p.dataKey}</span>
          <span>{typeof p.value === "number" ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stat item (used in Velocity + Income Quality panels) ────────────────────
// CHANGE: Inline stat rows now get hover/active feedback instead of just a bare div.
function StatItem({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div
      className={[
        "flex items-center justify-between text-xs border-b border-white/5 pb-1.5 last:border-0",
        "rounded-md px-1.5 -mx-1.5",
        "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:bg-white/[0.025] hover:px-2.5",
        "active:bg-surface-secondary",
      ].join(" ")}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-text-primary font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { user } = useAuth()
  const { transactions, loading: txLoading } = useTransactions()
  const [month, setMonth] = React.useState(getCurrentMonth())
  const [reportsData, setReportsData] = React.useState<ReportsData>({
    budgets: [], savingsGoals: [], sipPlans: [], manualInvestments: [],
    recurringTransactions: [], recurringSavings: [], merchantMemory: [], userProfile: null,
  })
  const [extraLoading, setExtraLoading] = React.useState(true)

  React.useEffect(() => {
    if (!user?.uid) return
    let active = true
      ; (async () => {
        setExtraLoading(true)
        await getScopedSupabase(user.uid)
        const [
          budgetsRes, goalsRes, sipRes, investmentsRes,
          recurringRes, recurringSavingsRes, merchantRes, profileRes,
        ] = await Promise.all([
          supabase.from("budgets").select("*").eq("firebase_uid", user.uid).order("month", { ascending: true }),
          supabase.from("savings_goals").select("*").eq("firebase_uid", user.uid),
          supabase.from("sip_plans").select("*").eq("firebase_uid", user.uid),
          supabase.from("manual_investments").select("*").eq("firebase_uid", user.uid),
          supabase.from("recurring_transactions").select("*").eq("firebase_uid", user.uid),
          supabase.from("recurring_savings").select("*").eq("firebase_uid", user.uid),
          supabase.from("merchant_memory").select("normalized_name, category, hit_count").eq("firebase_uid", user.uid),
          supabase.from("user_profiles").select("savings_goal, monthly_income").eq("firebase_uid", user.uid).maybeSingle(),
        ])
        if (!active) return
        setReportsData({
          budgets: (budgetsRes.data ?? []) as Budget[],
          savingsGoals: (goalsRes.data ?? []) as SavingsGoalRow[],
          sipPlans: (sipRes.data ?? []) as SIPPlanRow[],
          manualInvestments: (investmentsRes.data ?? []) as ManualInvestmentRow[],
          recurringTransactions: (recurringRes.data ?? []) as RecurringTransactionRow[],
          recurringSavings: (recurringSavingsRes.data ?? []) as RecurringSavingRow[],
          merchantMemory: (merchantRes.data ?? []) as MerchantMemoryRow[],
          userProfile: (profileRes.data as UserProfileRow | null) ?? null,
        })
        setExtraLoading(false)
      })()
    return () => { active = false }
  }, [user?.uid])

  // ── Derived data ────────────────────────────────────────────────────────────

  const prevMonth = React.useMemo(() => addMonths(month, -1), [month])
  const now = new Date()
  const currentMonth = getCurrentMonth()

  const monthTx = React.useMemo(() => transactions.filter((tx) => tx.date.startsWith(month)), [transactions, month])
  const prevTx = React.useMemo(() => transactions.filter((tx) => tx.date.startsWith(prevMonth)), [transactions, prevMonth])

  const monthIncome = React.useMemo(() => monthTx.filter((tx) => tx.type === "Credit").reduce((s, tx) => s + toNumber(tx.amount), 0), [monthTx])
  const monthExpense = React.useMemo(() => monthTx.filter((tx) => tx.type === "Debit").reduce((s, tx) => s + toNumber(tx.amount), 0), [monthTx])
  const prevIncome = React.useMemo(() => prevTx.filter((tx) => tx.type === "Credit").reduce((s, tx) => s + toNumber(tx.amount), 0), [prevTx])
  const prevExpense = React.useMemo(() => prevTx.filter((tx) => tx.type === "Debit").reduce((s, tx) => s + toNumber(tx.amount), 0), [prevTx])

  const monthNet = monthIncome - monthExpense
  const prevNet = prevIncome - prevExpense
  const avgTx = monthTx.length ? monthTx.reduce((s, tx) => s + toNumber(tx.amount), 0) / monthTx.length : 0
  const medianTx = median(monthTx.map((tx) => toNumber(tx.amount)))
  const expenseRatio = monthIncome > 0 ? (monthExpense / monthIncome) * 100 : 0
  const monthSavingsRate = savingsRate(monthIncome, monthExpense)

  const monthlyOverview = React.useMemo(() => buildMonthSeries(transactions, month, 12), [transactions, month])

  // Sparkline trends
  const incomeTrend = React.useMemo(() => monthlyOverview.slice(-6).map((r) => ({ v: r.income })), [monthlyOverview])
  const expenseTrend = React.useMemo(() => monthlyOverview.slice(-6).map((r) => ({ v: r.expense })), [monthlyOverview])
  const netTrend = React.useMemo(() => monthlyOverview.slice(-6).map((r) => ({ v: r.savings })), [monthlyOverview])

  // Cash flow timeline
  const cashFlow = React.useMemo(() => {
    const [year, mon] = month.split("-").map(Number)
    const daysInMonth = new Date(year, mon, 0).getDate()
    const dailyNet = new Map<number, number>()
    const hasExpense = new Set<number>()
    monthTx.forEach((tx) => {
      const day = Number(tx.date.slice(8, 10))
      dailyNet.set(day, (dailyNet.get(day) ?? 0) + toNumber(tx.amount) * (tx.type === "Credit" ? 1 : -1))
      if (tx.type === "Debit") hasExpense.add(day)
    })
    let running = 0
    const series = []
    const expensePoints = []
    for (let day = 1; day <= daysInMonth; day++) {
      running += dailyNet.get(day) ?? 0
      const item = { day, balance: running }
      series.push(item)
      if (hasExpense.has(day)) expensePoints.push(item)
    }
    return { series, expensePoints }
  }, [month, monthTx])

  // Budget
  const activeBudgets = React.useMemo(() => reportsData.budgets.filter((b) => isBudgetActiveForMonth(b, month)), [reportsData.budgets, month])
  const budgetSpentById = React.useMemo(() => computeBudgetSpent(activeBudgets, transactions, month), [activeBudgets, transactions, month])
  const budgetRows = React.useMemo(() => activeBudgets.map((b) => {
    const spent = budgetSpentById.get(b.id) ?? 0
    const amount = toNumber(b.amount)
    return { ...b, spent, remaining: amount - spent, pct: amount > 0 ? (spent / amount) * 100 : 0 }
  }), [activeBudgets, budgetSpentById])
  const budgetTotal = budgetRows.reduce((s, r) => s + toNumber(r.amount), 0)
  const budgetSpent = budgetRows.reduce((s, r) => s + r.spent, 0)
  const budgetUtilPct = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0

  // Categories
  const catCurrent = React.useMemo(() => {
    const map = new Map<string, number>()
    monthTx.filter((tx) => tx.type === "Debit").forEach((tx) => map.set(tx.category, (map.get(tx.category) ?? 0) + toNumber(tx.amount)))
    return map
  }, [monthTx])

  const catPrev = React.useMemo(() => {
    const map = new Map<string, number>()
    prevTx.filter((tx) => tx.type === "Debit").forEach((tx) => map.set(tx.category, (map.get(tx.category) ?? 0) + toNumber(tx.amount)))
    return map
  }, [prevTx])

  const categoryDonut = React.useMemo(() =>
    Array.from(catCurrent.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    [catCurrent]
  )

  const categoryComparison = React.useMemo(() => {
    const cats = new Set([...Array.from(catCurrent.keys()), ...Array.from(catPrev.keys())])
    return Array.from(cats).map((cat) => ({
      category: cat,
      current: catCurrent.get(cat) ?? 0,
      previous: catPrev.get(cat) ?? 0,
      mom: catPrev.get(cat) ? (((catCurrent.get(cat) ?? 0) - (catPrev.get(cat) ?? 0)) / (catPrev.get(cat) ?? 1)) * 100 : 0,
    }))
  }, [catCurrent, catPrev])

  // Health score
  const monthlyIncomeSeries = monthlyOverview.slice(-6).map((r) => r.income)
  const incomeMean = monthlyIncomeSeries.length ? monthlyIncomeSeries.reduce((s, v) => s + v, 0) / monthlyIncomeSeries.length : 0
  const incomeStdDev = monthlyIncomeSeries.length > 0
    ? Math.sqrt(monthlyIncomeSeries.reduce((s, v) => s + (v - incomeMean) ** 2, 0) / monthlyIncomeSeries.length)
    : 0
  const incomeCv = incomeMean > 0 ? incomeStdDev / incomeMean : 1
  const incomeStabilityLabel = incomeCv < 0.15 ? "Highly stable" : incomeCv < 0.35 ? "Moderately stable" : "Volatile"

  const healthScores = React.useMemo(() => {
    const savingsRateScore = clamp(monthSavingsRate)
    const expenseControlScore = prevExpense <= 0 ? 100 : clamp(100 - ((monthExpense - prevExpense) / prevExpense) * 100)
    const budgetUtilScore = budgetTotal <= 0 ? 50 : budgetUtilPct <= 70 ? 100 : budgetUtilPct >= 120 ? 0 : clamp(100 - ((budgetUtilPct - 70) / 50) * 100)
    const totalExpByCat = Array.from(catCurrent.values()).reduce((s, v) => s + v, 0)
    const maxShare = totalExpByCat > 0 ? Math.max(...Array.from(catCurrent.values()).map((v) => v / totalExpByCat)) : 0
    const diversityScore = clamp((1 - maxShare) * 100)
    const incomeStabilityScore = clamp(100 - incomeCv * 100)
    const composite = savingsRateScore * 0.3 + expenseControlScore * 0.2 + budgetUtilScore * 0.2 + diversityScore * 0.15 + incomeStabilityScore * 0.15
    return { savingsRateScore, expenseControlScore, budgetUtilScore, diversityScore, incomeStabilityScore, composite: Math.round(composite) }
  }, [monthSavingsRate, prevExpense, monthExpense, budgetTotal, budgetUtilPct, catCurrent, incomeCv])

  const healthScoreData = [{ name: "Score", value: healthScores.composite }]

  // Spending velocity
  const velocity = React.useMemo(() => {
    const [year, mon] = month.split("-").map(Number)
    const daysInMonth = new Date(year, mon, 0).getDate()
    const daysElapsed = month === currentMonth ? now.getDate() : daysInMonth
    const burnRate = daysElapsed > 0 ? monthExpense / daysElapsed : 0
    const expenseByDay = new Map<string, number>()
    monthTx.filter((tx) => tx.type === "Debit").forEach((tx) => {
      expenseByDay.set(tx.date, (expenseByDay.get(tx.date) ?? 0) + toNumber(tx.amount))
    })
    let largestDay = { date: "-", amount: 0 }
    for (const [date, amount] of expenseByDay.entries()) {
      if (amount > largestDay.amount) largestDay = { date, amount }
    }
    return { burnRate, projectedEnd: burnRate * daysInMonth, daysWithSpend: expenseByDay.size, daysWithoutSpend: Math.max(daysElapsed - expenseByDay.size, 0), largestDay }
  }, [currentMonth, month, monthExpense, monthTx, now])

  // Savings projection
  const projection = React.useMemo(() => {
    const monthlySip = reportsData.sipPlans.filter((p) => p.active).reduce((s, p) => s + toNumber(p.monthly_amount), 0)
    const monthlyRecurring = reportsData.recurringSavings.filter((r) => r.active).reduce((s, r) => s + normalizeMonthlyAmount(toNumber(r.amount), r.frequency), 0)
    const pmt = Math.max(monthNet, 0) + monthlySip + monthlyRecurring
    const r = 0.06 / 12
    const rows = Array.from({ length: 12 }, (_, idx) => {
      const n = idx + 1
      return { month: `M${n}`, corpus: r === 0 ? pmt * n : pmt * ((Math.pow(1 + r, n) - 1) / r), simple: pmt * n }
    })
    return { pmt, rows }
  }, [monthNet, reportsData.recurringSavings, reportsData.sipPlans])

  // Goals
  const goalsStatus = React.useMemo(() => {
    const today = new Date()
    return reportsData.savingsGoals.map((goal) => {
      const target = toNumber(goal.target_amount)
      const saved = toNumber(goal.saved_amount)
      const remaining = Math.max(target - saved, 0)
      const percent = target > 0 ? (saved / target) * 100 : 0
      const daysRemaining = goal.deadline
        ? Math.max(Math.ceil((new Date(goal.deadline).getTime() - today.getTime()) / 86400000), 0)
        : null
      return { ...goal, target, saved, remaining, percent, daysRemaining, requiredDaily: daysRemaining && daysRemaining > 0 ? remaining / daysRemaining : remaining }
    })
  }, [reportsData.savingsGoals])

  // Investments
  const investmentStats = React.useMemo(() => {
    const rows = reportsData.manualInvestments.map((inv) => {
      const qty = toNumber(inv.quantity), buy = toNumber(inv.bought_price), cur = toNumber(inv.current_price)
      return { ...inv, pnl: qty > 0 ? (cur - buy) * qty : 0 }
    })
    const monthlySip = reportsData.sipPlans.filter((p) => p.active).reduce((s, p) => s + toNumber(p.monthly_amount), 0)
    return { rows, monthlySip, totalPnl: rows.reduce((s, r) => s + r.pnl, 0) }
  }, [reportsData.manualInvestments, reportsData.sipPlans])

  // Recurring
  const recurringPanel = React.useMemo(() => {
    const committed = reportsData.recurringTransactions.filter((r) => r.active).reduce((s, r) => s + normalizeMonthlyAmount(toNumber(r.amount), r.frequency), 0)
    const soon = new Date(); soon.setDate(soon.getDate() + 7)
    const renewalsSoon = reportsData.recurringTransactions.filter((r) => {
      if (!r.active) return false
      const d = new Date(r.next_run)
      return d >= new Date() && d <= soon
    })
    return { committed, renewalsSoon }
  }, [reportsData.recurringTransactions])

  // Merchant intelligence
  const merchantStats = React.useMemo(() => {
    const merchantMap = new Map<string, number>()
    const categoryMap = new Map<string, number>()
    reportsData.merchantMemory.forEach((row) => {
      const w = Math.max(toNumber(row.hit_count), 1)
      merchantMap.set(row.normalized_name, (merchantMap.get(row.normalized_name) ?? 0) + w)
      categoryMap.set(row.category ?? "Other", (categoryMap.get(row.category ?? "Other") ?? 0) + w)
    })
    return {
      topMerchants: Array.from(merchantMap.entries()).map(([name, hits]) => ({ name, hits })).sort((a, b) => b.hits - a.hits).slice(0, 8),
      categoryDistribution: Array.from(categoryMap.entries()).map(([category, hits]) => ({ category, hits })),
    }
  }, [reportsData.merchantMemory])

  // Anomaly flags
  const anomalyFlags = React.useMemo(() => {
    const debitTx = transactions.filter((tx) => tx.type === "Debit")
    const byCat = new Map<string, number[]>()
    debitTx.forEach((tx) => { const arr = byCat.get(tx.category) ?? []; arr.push(toNumber(tx.amount)); byCat.set(tx.category, arr) })
    const stats = new Map<string, { mean: number; std: number }>()
    byCat.forEach((vals, cat) => {
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length
      const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length)
      stats.set(cat, { mean, std })
    })
    return monthTx.filter((tx) => tx.type === "Debit").filter((tx) => {
      const s = stats.get(tx.category)
      return s && s.std !== 0 && toNumber(tx.amount) > s.mean + 2 * s.std
    }).map((tx) => { const s = stats.get(tx.category)!; return { ...tx, threshold: s.mean + 2 * s.std } })
  }, [monthTx, transactions])

  // YTD
  const ytd = React.useMemo(() => {
    const [year, selectedMon] = month.split("-").map(Number)
    const ytdTx = transactions.filter((tx) => Number(tx.date.slice(0, 4)) === year && Number(tx.date.slice(5, 7)) <= selectedMon)
    const income = ytdTx.filter((tx) => tx.type === "Credit").reduce((s, tx) => s + toNumber(tx.amount), 0)
    const expense = ytdTx.filter((tx) => tx.type === "Debit").reduce((s, tx) => s + toNumber(tx.amount), 0)
    const savings = income - expense
    const sameYear = monthlyOverview.filter((r) => r.month.startsWith(String(year)))
    const bestMonth = sameYear.reduce((best, r) => r.savings > best.savings ? r : best, sameYear[0] ?? { label: "-", savings: 0 })
    const worstMonth = sameYear.reduce((worst, r) => r.savings < worst.savings ? r : worst, sameYear[0] ?? { label: "-", savings: 0 })
    const annualGoal = toNumber(reportsData.userProfile?.savings_goal)
    const expectedToDate = annualGoal > 0 ? (annualGoal * selectedMon) / 12 : 0
    return { income, expense, savings, rate: savingsRate(income, expense), bestMonth, worstMonth, annualGoal, expectedToDate, onTrack: annualGoal <= 0 ? null : savings >= expectedToDate }
  }, [month, monthlyOverview, reportsData.userProfile?.savings_goal, transactions])

  const loading = txLoading || extraLoading

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Inject invisible-scrollbar rule globally ── */}
      <GlobalScrollbarStyle />

      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Detailed analytics across cash flow, budgets, savings, and investments
              </p>
            </div>
            <MonthPicker value={month} onChange={setMonth} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Loading reports...
            </div>
          ) : (
            <>
              {/*
               * ── CHANGE: Row 1 — Single unified 8-card KPI grid ──────────────────
               * Previously two separate 4-card rows (kpi-row + kpi-row-2) which
               * created a cluttered double-header feel. Merged into one row that
               * collapses to 4 cols on md, 2 cols on sm.
               */}
              <div className="grid grid-cols-2 gap-3 px-4 lg:px-6 md:grid-cols-4 xl:grid-cols-4">
                <KpiCard label="Total Income" value={fmt(monthIncome)} change={momDelta(monthIncome, prevIncome)} positive trend={incomeTrend} />
                <KpiCard label="Total Expenses" value={fmt(monthExpense)} change={momDelta(monthExpense, prevExpense)} positive={false} trend={expenseTrend} />
                <KpiCard label="Net Savings" value={fmt(monthNet)} change={momDelta(monthNet, prevNet)} positive={monthNet >= 0} trend={netTrend} />
                <KpiCard label="Savings Rate" value={`${monthSavingsRate.toFixed(1)}%`} positive={monthSavingsRate >= 20} sub="20% = healthy baseline" />
                <KpiCard label="Expense Ratio" value={`${expenseRatio.toFixed(1)}%`} positive={expenseRatio < 50} sub="income consumed" />
                <KpiCard label="Avg Transaction" value={fmt(avgTx)} sub={`Median ${fmt(medianTx)}`} />
                <KpiCard label="Transactions" value={String(monthTx.length)} sub={`${monthTx.filter(t => t.type === "Debit").length} debits · ${monthTx.filter(t => t.type === "Credit").length} credits`} />
                <KpiCard label="Budget Used" value={`${budgetUtilPct.toFixed(1)}%`} positive={budgetUtilPct <= 80} sub={`${fmt(budgetSpent)} of ${fmt(budgetTotal)}`} />
              </div>

              {/* ── Row 2: Monthly overview + Cash flow ── */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2">
                <SurfaceCard title="Monthly Overview" subtitle="12-month income vs expense · net savings line">
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyOverview} barGap={4} barCategoryGap="30%" style={{ backgroundColor: "transparent" }}>
                        <defs>
                          <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.2} />
                          </linearGradient>
                          <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="label" tick={{ fill: "#fff", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#fff", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
                        <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
                        <Bar dataKey="income" name="Income" fill="url(#incG)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expense" name="Expense" fill="url(#expG)" radius={[6, 6, 0, 0]} />
                        <Line type="monotone" dataKey="savings" name="Net" stroke="#34d399" strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </SurfaceCard>

                <SurfaceCard title="Cash Flow Timeline" subtitle="Daily running balance · expense events highlighted">
                  {cashFlow.series.length === 0 ? (
                    <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">No transactions this month</div>
                  ) : (
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart style={{ backgroundColor: "transparent" }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="day" tick={{ fill: "#fff", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#fff", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
                          <Line data={cashFlow.series} type="monotone" dataKey="balance" name="Balance" stroke="#60a5fa" strokeWidth={2} dot={false} />
                          <Scatter data={cashFlow.expensePoints} dataKey="balance" name="Expense" fill="#f87171" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </SurfaceCard>
              </div>

              {/* ── Row 3: Health score + Velocity + Income quality ── */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-3">
                <SurfaceCard title="Financial Health Score" subtitle="Savings (30%) · Expense ctrl (20%) · Budget (20%) · Diversity (15%) · Stability (15%)" icon={Zap}>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart innerRadius="65%" outerRadius="95%" data={healthScoreData} startAngle={180} endAngle={0} style={{ backgroundColor: "transparent" }}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={10} fill={healthScores.composite >= 70 ? "#34d399" : healthScores.composite >= 40 ? "#f59e0b" : "#f87171"} />
                        <text x="50%" y="62%" textAnchor="middle" fill="#fff" fontSize={28} fontWeight={600}>{healthScores.composite}</text>
                        <text x="50%" y="75%" textAnchor="middle" fill="#9ca3af" fontSize={12}>/ 100</text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    {[
                      ["Savings rate", healthScores.savingsRateScore],
                      ["Expense ctrl", healthScores.expenseControlScore],
                      ["Budget use", healthScores.budgetUtilScore],
                      ["Diversity", healthScores.diversityScore],
                      ["Income stability", healthScores.incomeStabilityScore],
                    ].map(([label, score]) => (
                      <div key={label as string} className="flex justify-between">
                        <span>{label}</span>
                        <span className={Number(score) >= 70 ? "text-emerald-400" : Number(score) >= 40 ? "text-yellow-400" : "text-red-400"}>{Number(score).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>

                {/* CHANGE: stat rows now use StatItem for consistent hover/active feedback */}
                <SurfaceCard title="Spending Velocity" subtitle="Daily burn rate and projected month-end">
                  <div className="space-y-0.5">
                    <StatItem label="Burn rate" value={`${fmt(velocity.burnRate)} / day`} />
                    <StatItem label="Projected month-end" value={fmt(velocity.projectedEnd)} />
                    <StatItem label="Days with spend" value={String(velocity.daysWithSpend)} />
                    <StatItem label="Spend-free days" value={String(velocity.daysWithoutSpend)} />
                    <StatItem label="Largest single day" value={`${fmt(velocity.largestDay.amount)} (${velocity.largestDay.date})`} />
                    <StatItem label="Median transaction" value={fmt(medianTx)} />
                  </div>
                </SurfaceCard>

                <SurfaceCard title="Income Quality" subtitle="Source concentration and consistency">
                  <div className="space-y-0.5">
                    <StatItem label="Unique sources" value={String(new Set(monthTx.filter(t => t.type === "Credit").map(t => t.transaction)).size)} />
                    <StatItem label="Largest credit" value={fmt(Math.max(0, ...monthTx.filter(t => t.type === "Credit").map(t => toNumber(t.amount))))} />
                    <StatItem label="Stability (6mo)" value={incomeStabilityLabel} valueClass={incomeCv < 0.15 ? "text-emerald-400" : incomeCv < 0.35 ? "text-yellow-400" : "text-red-400"} />
                    <StatItem label="Expense ratio" value={`${expenseRatio.toFixed(1)}%`} />
                    <StatItem label="Net retained" value={`${monthSavingsRate.toFixed(1)}%`} />
                    <StatItem label="Monthly SIP" value={fmt(investmentStats.monthlySip)} />
                  </div>
                </SurfaceCard>
              </div>

              {/* ── Row 4: Category breakdown + Budget utilisation ── */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2">
                <SurfaceCard title="Category Breakdown" subtitle="Donut + current vs previous comparison">
                  {categoryDonut.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">No expense data for this month</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart style={{ backgroundColor: "transparent" }}>
                              <Pie data={categoryDonut} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                                {categoryDonut.map((entry, idx) => (
                                  <Cell key={entry.name} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryComparison} layout="vertical" style={{ backgroundColor: "transparent" }}>
                              <defs>
                                <linearGradient id="expenseGradient" x1="0" y1="1" x2="0" y2="0">
                                  <stop offset="0%" stopColor="#1f2937" />
                                  <stop offset="100%" stopColor="#ffffff" />
                                </linearGradient>
                              </defs>
                              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical horizontal={false} />
                              <XAxis type="number" tick={{ fill: "#dcdcdc", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                              <YAxis type="category" dataKey="category" width={80} tick={{ fill: "#dcdcdc", fontSize: 10 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<ChartTooltip />} cursor={false} />
                              <Bar dataKey="current" name="Current" fill="url(#expenseGradient)" radius={[0, 6, 6, 0]} barSize={14} />
                              <Bar dataKey="previous" name="Previous" fill="rgba(156,163,175,0.4)" radius={[0, 6, 6, 0]} barSize={14} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      {/* CHANGE: overflow container — scrollbar now invisible */}
                      <div className="max-h-44 overflow-auto">
                        <table className="w-full text-xs">
                          <thead className="text-muted-foreground sticky top-0 bg-[var(--surface-card)]">
                            <tr>
                              <th className="text-left py-1.5">Category</th>
                              <th className="text-right py-1.5">Current</th>
                              <th className="text-right py-1.5">Previous</th>
                              <th className="text-right py-1.5">MoM</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryComparison.map((row) => (
                              <tr key={row.category} className="border-t border-white/5 transition-colors duration-150 hover:bg-white/[0.025] active:bg-surface-secondary">
                                <td className="py-1">{row.category}</td>
                                <td className="text-right py-1">{fmt(row.current)}</td>
                                <td className="text-right py-1 text-muted-foreground">{fmt(row.previous)}</td>
                                <td className={`text-right py-1 font-medium ${row.mom <= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                  {row.mom >= 0 ? "+" : ""}{row.mom.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </SurfaceCard>

                <SurfaceCard title="Budget Utilisation" subtitle="Allocated vs spent vs remaining">
                  {budgetRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active budgets for this month.</p>
                  ) : (
                    /* CHANGE: scrollbar now invisible via GlobalScrollbarStyle */
                    <div className="space-y-2 max-h-72 overflow-auto">
                      {budgetRows.map((row) => (
                        <BudgetRow key={row.id} label={row.category} spent={row.spent} total={toNumber(row.amount)} pct={row.pct} />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-0.5">Allocated</p>
                      <p className="font-semibold text-text-primary">{fmt(budgetTotal)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground mb-0.5">Spent</p>
                      <p className="font-semibold text-red-400">{fmt(budgetSpent)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground mb-0.5">Remaining</p>
                      <p className="font-semibold text-emerald-400">{fmt(budgetTotal - budgetSpent)}</p>
                    </div>
                  </div>
                </SurfaceCard>
              </div>

              {/* ── Row 5: Savings projection + Goals ── */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2">
                <SurfaceCard title="Savings Projection" subtitle={`12-month at 6% p.a. · monthly contribution ${fmt(projection.pmt)}`} icon={Target}>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projection.rows} style={{ backgroundColor: "transparent" }}>
                        <defs>
                          <linearGradient id="corpusG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="simpleG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="month" tick={{ fill: "#fff", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#fff", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
                        <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
                        <Area type="monotone" dataKey="corpus" name="Compound (6%)" stroke="#60a5fa" fill="url(#corpusG)" strokeWidth={2} />
                        <Area type="monotone" dataKey="simple" name="Simple total" stroke="#9ca3af" fill="url(#simpleG)" strokeWidth={1.5} strokeDasharray="4 3" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SurfaceCard>

                <SurfaceCard title="Savings Goals" subtitle="Completion status and required daily savings" icon={Target}>
                  {goalsStatus.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No savings goals found.</p>
                  ) : (
                    /* CHANGE: scrollbar now invisible */
                    <div className="space-y-2 max-h-[280px] overflow-auto">
                      {goalsStatus.map((goal) => (
                        <div
                          key={goal.id}
                          className={[
                            "rounded-lg border border-white/5 p-2.5",
                            "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                            "hover:border-border-secondary hover:bg-white/[0.025]",
                            "active:scale-[0.99] active:bg-surface-secondary",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-medium text-text-primary">{goal.name}</span>
                            <span className="text-muted-foreground">{goal.percent.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                              style={{ width: `${Math.min(goal.percent, 100)}%`, background: goal.color ?? undefined }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1.5">
                            {fmt(goal.saved)} / {fmt(goal.target)} · {goal.daysRemaining != null ? `${goal.daysRemaining} days left` : "No deadline"} · Need {fmt(goal.requiredDaily)}/day
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </SurfaceCard>
              </div>

              {/* ── Row 6: Investments + Recurring ── */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2">
                <SurfaceCard title="SIP & Investments" subtitle="Monthly SIP totals and holding-level P/L">
                  <div className="flex items-center gap-6 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Monthly SIP</p>
                      <p className="font-semibold text-text-primary">{fmt(investmentStats.monthlySip)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Unrealised P/L</p>
                      <p className={`font-semibold ${investmentStats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(investmentStats.totalPnl)}</p>
                    </div>
                  </div>
                  {investmentStats.rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No investments tracked.</p>
                  ) : (
                    /* CHANGE: scrollbar now invisible */
                    <div className="max-h-48 overflow-auto">
                      <table className="w-full text-xs">
                        <thead className="text-muted-foreground sticky top-0 bg-[var(--surface-card)]">
                          <tr>
                            <th className="text-left py-1.5">Holding</th>
                            <th className="text-right py-1.5">Invested</th>
                            <th className="text-right py-1.5">P/L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investmentStats.rows.map((row) => (
                            <tr key={row.id} className="border-t border-white/5 transition-colors duration-150 hover:bg-white/[0.025] active:bg-surface-secondary">
                              <td className="py-1">{row.name}</td>
                              <td className="text-right py-1">{fmt(toNumber(row.amount_invested))}</td>
                              <td className={`text-right py-1 font-medium ${row.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(row.pnl)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SurfaceCard>

                <SurfaceCard title="Recurring Panel" subtitle="Next runs, monthly committed, renewals in 7 days" icon={Repeat}>
                  <div className="flex items-center gap-6 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Monthly committed</p>
                      <p className="font-semibold text-text-primary">{fmt(recurringPanel.committed)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Renewals in 7 days</p>
                      <p className={`font-semibold ${recurringPanel.renewalsSoon.length > 0 ? "text-amber-400" : "text-text-primary"}`}>{recurringPanel.renewalsSoon.length}</p>
                    </div>
                  </div>
                  {reportsData.recurringTransactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recurring transactions.</p>
                  ) : (
                    /* CHANGE: scrollbar now invisible */
                    <div className="max-h-48 overflow-auto">
                      <table className="w-full text-xs">
                        <thead className="text-muted-foreground sticky top-0 bg-[var(--surface-card)]">
                          <tr>
                            <th className="text-left py-1.5">Name</th>
                            <th className="text-right py-1.5">Amount</th>
                            <th className="text-right py-1.5">Next run</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportsData.recurringTransactions.map((row) => {
                            const soon = recurringPanel.renewalsSoon.some((x) => x.id === row.id)
                            return (
                              <tr key={row.id} className="border-t border-white/5 transition-colors duration-150 hover:bg-white/[0.025] active:bg-surface-secondary">
                                <td className={`py-1 ${soon ? "text-amber-300" : ""}`}>{row.transaction}</td>
                                <td className="text-right py-1">{fmt(toNumber(row.amount))}</td>
                                <td className={`text-right py-1 ${soon ? "text-amber-300" : "text-muted-foreground"}`}>{row.next_run}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SurfaceCard>
              </div>

              {/* ── Row 7: Merchant intelligence + Anomalies ── */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2">
                <SurfaceCard title="Merchant Intelligence" subtitle="Top merchants by hit count and category split" icon={Brain}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      {merchantStats.topMerchants.map((m, idx) => (
                        <div
                          key={m.name}
                          className={[
                            "flex items-center justify-between py-1 border-b border-white/5 text-xs",
                            "rounded-md px-1.5 -mx-1.5",
                            "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
                            "hover:bg-white/[0.025] hover:border-transparent hover:px-2.5",
                            "active:bg-surface-secondary",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-muted-foreground w-4 shrink-0">{idx + 1}</span>
                            <span className="truncate text-text-primary">{m.name}</span>
                          </div>
                          <span className="text-muted-foreground shrink-0 ml-2">{m.hits}×</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart style={{ backgroundColor: "transparent" }}>
                          <Pie data={merchantStats.categoryDistribution} dataKey="hits" nameKey="category" outerRadius={75} innerRadius={40}>
                            {merchantStats.categoryDistribution.map((entry, idx) => (
                              <Cell key={entry.category} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </SurfaceCard>

                <SurfaceCard title="Anomaly Flags" subtitle="Transactions > mean + 2σ per category" icon={AlertTriangle}>
                  {anomalyFlags.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <span>✓</span>
                      <span>No anomalies detected for this month</span>
                    </div>
                  ) : (
                    /* CHANGE: scrollbar now invisible */
                    <div className="max-h-72 overflow-auto">
                      <table className="w-full text-xs">
                        <thead className="text-muted-foreground sticky top-0 bg-[var(--surface-card)]">
                          <tr>
                            <th className="text-left py-1.5">Date</th>
                            <th className="text-left py-1.5">Transaction</th>
                            <th className="text-right py-1.5">Amount</th>
                            <th className="text-right py-1.5">Threshold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {anomalyFlags.map((row) => (
                            <tr key={row.id} className="border-t border-red-500/20 bg-red-500/5 transition-colors duration-150 hover:bg-red-500/10 active:bg-red-500/15">
                              <td className="py-1 text-muted-foreground">{row.date}</td>
                              <td className="py-1 text-text-primary">{row.transaction}</td>
                              <td className="text-right py-1 text-red-300 font-medium">{fmt(toNumber(row.amount))}</td>
                              <td className="text-right py-1 text-muted-foreground">{fmt(row.threshold)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SurfaceCard>
              </div>

              {/* ── Row 8: YTD Summary ── */}
              <div className="px-4 lg:px-6">
                <SurfaceCard title="Year-to-Date Summary" subtitle={`January – ${monthLabel(month)} · ${new Date().getFullYear()}`}>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 text-xs">
                    {[
                      { label: "YTD Income", value: fmt(ytd.income), color: "text-emerald-400" },
                      { label: "YTD Expense", value: fmt(ytd.expense), color: "text-red-400" },
                      { label: "YTD Savings", value: fmt(ytd.savings), color: ytd.savings >= 0 ? "text-emerald-400" : "text-red-400" },
                      { label: "YTD Rate", value: `${ytd.rate.toFixed(1)}%`, color: "text-text-primary" },
                      { label: "Annual Goal", value: fmt(ytd.annualGoal), color: "text-text-primary" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={[
                          "rounded-lg border border-white/5 p-2.5 text-center",
                          "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                          "hover:border-border-secondary hover:bg-white/[0.025] hover:-translate-y-0.5",
                          "active:translate-y-0 active:scale-[0.98] active:bg-surface-secondary",
                        ].join(" ")}
                      >
                        <p className="text-muted-foreground mb-1">{item.label}</p>
                        <p className={`text-base font-semibold ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3 text-xs">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-muted-foreground">Best month</span>
                      <span className="text-emerald-400 font-medium">{ytd.bestMonth.label} · {fmt(ytd.bestMonth.savings)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-muted-foreground">Worst month</span>
                      <span className="text-red-400 font-medium">{ytd.worstMonth.label} · {fmt(ytd.worstMonth.savings)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-muted-foreground">Goal track</span>
                      <span className={ytd.onTrack == null ? "text-muted-foreground" : ytd.onTrack ? "text-emerald-400" : "text-red-400"}>
                        {ytd.onTrack == null ? "No goal set" : ytd.onTrack ? "✓ On track" : "⚠ Behind pace"}
                      </span>
                    </div>
                  </div>
                </SurfaceCard>
              </div>

            </>
          )}
        </div>
      </div>
    </>
  )
}