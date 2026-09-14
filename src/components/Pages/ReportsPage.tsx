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
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Target, Repeat, Zap, ChevronDown, ChevronUp, Brain } from "lucide-react"
import { useAuth } from "@/components/hooks/use-auth"
import { useTransactions, type Transaction } from "@/components/hooks/use-transactions"
import { MonthPicker } from "@/components/ui/Reports_UI/month-picker"
import { isBudgetActiveForMonth, computeBudgetSpent } from "@/lib/budget-utils"
import { getScopedSupabase, supabase } from "@/lib/supabase"
import type { Budget } from "@/components/hooks/use-budgets"
import { useLanguage } from "@/context/LanguageContext"
import { useAppMode } from "@/context/AppModeContext"

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

type UserProfileRow = {
  savings_goal: number | null
  monthly_income: number | null
}

type ReceivableRow = {
  id: string
  customer_id?: string
  invoice_ref?: string
  amount: number
  amount_paid: number
  amount_outstanding: number
  due_date?: string
  status?: string
}

type PayableRow = {
  id: string
  supplier_id?: string
  invoice_ref?: string
  amount: number
  amount_paid: number
  amount_outstanding: number
  due_date?: string
  status?: string
}

type ReportsData = {
  budgets: Budget[]
  savingsGoals: SavingsGoalRow[]
  sipPlans: SIPPlanRow[]
  manualInvestments: ManualInvestmentRow[]
  recurringTransactions: RecurringTransactionRow[]
  recurringSavings: RecurringSavingRow[]
  userProfile: UserProfileRow | null
  // Business-specific
  receivables: ReceivableRow[]
  payables: PayableRow[]
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
        "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:border-border-secondary hover:bg-[#1d1d1d]",
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
        "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:-translate-y-0.5 hover:border-border-secondary hover:bg-[#1d1d1d]",
        "hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
        "active:translate-y-0 active:scale-[0.985] active:border-border-secondary active:bg-[#1d1d1d]",
      ].join(" ")}
    >
      {/* Radial glow on hover */}
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

// Tooltip wrapper
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

// ─── Stat item ────────────────────────────────────────────────────────────────
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

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 lg:px-6 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { transactions, loading: txLoading } = useTransactions()
  const { appMode } = useAppMode()
  const [month, setMonth] = React.useState(getCurrentMonth())
  const [comboTab, setComboTab] = React.useState<"PERSONAL" | "BUSINESS">("PERSONAL")
  const [reportsData, setReportsData] = React.useState<ReportsData>({
    budgets: [], savingsGoals: [], sipPlans: [], manualInvestments: [],
    recurringTransactions: [], recurringSavings: [], userProfile: null,
    receivables: [], payables: [],
  })
  const [extraLoading, setExtraLoading] = React.useState(true)

  const isBusiness = appMode === "BUSINESS"
  const isPersonal = appMode === "PERSONAL"
  const isCombo = appMode === "COMBO"

  React.useEffect(() => {
    if (!user?.uid) return
    let active = true
    ;(async () => {
      setExtraLoading(true)
      await getScopedSupabase(user.uid)

      // Base queries for all modes
      const baseQueries = [
        supabase.from("budgets").select("*").eq("firebase_uid", user.uid).order("month", { ascending: true }),
        supabase.from("savings_goals").select("*").eq("firebase_uid", user.uid),
        supabase.from("sip_plans").select("*").eq("firebase_uid", user.uid),
        supabase.from("manual_investments").select("*").eq("firebase_uid", user.uid),
        supabase.from("recurring_transactions").select("*").eq("firebase_uid", user.uid),
        supabase.from("recurring_savings").select("*").eq("firebase_uid", user.uid),
        supabase.from("user_profiles").select("savings_goal, monthly_income").eq("firebase_uid", user.uid).maybeSingle(),
      ]

      // Business-specific queries
      const businessQueries = (isBusiness || isCombo) ? [
        supabase.from("business_receivables").select("*").eq("firebase_uid", user.uid),
        supabase.from("business_payables").select("*").eq("firebase_uid", user.uid),
      ] : []

      const results = await Promise.all([...baseQueries, ...businessQueries])
      if (!active) return

      setReportsData({
        budgets: (results[0].data ?? []) as Budget[],
        savingsGoals: (results[1].data ?? []) as SavingsGoalRow[],
        sipPlans: (results[2].data ?? []) as SIPPlanRow[],
        manualInvestments: (results[3].data ?? []) as ManualInvestmentRow[],
        recurringTransactions: (results[4].data ?? []) as RecurringTransactionRow[],
        recurringSavings: (results[5].data ?? []) as RecurringSavingRow[],
        userProfile: (results[6].data as UserProfileRow | null) ?? null,
        receivables: ((isBusiness || isCombo) ? (results[7]?.data ?? []) : []) as ReceivableRow[],
        payables: ((isBusiness || isCombo) ? (results[8]?.data ?? []) : []) as PayableRow[],
      })
      setExtraLoading(false)
    })()
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, appMode])

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

  // Health score
  const monthlyIncomeSeries = monthlyOverview.slice(-6).map((r) => r.income)
  const incomeMean = monthlyIncomeSeries.length ? monthlyIncomeSeries.reduce((s, v) => s + v, 0) / monthlyIncomeSeries.length : 0
  const incomeStdDev = monthlyIncomeSeries.length > 0
    ? Math.sqrt(monthlyIncomeSeries.reduce((s, v) => s + (v - incomeMean) ** 2, 0) / monthlyIncomeSeries.length)
    : 0
  const incomeCv = incomeMean > 0 ? incomeStdDev / incomeMean : 1

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

  // Receivables & Payables (business)
  const receivableStats = React.useMemo(() => {
    const total = reportsData.receivables.reduce((s, r) => s + toNumber(r.amount_outstanding), 0)
    const overdue = reportsData.receivables.filter((r) => r.status === "OVERDUE" || r.status === "LONG_OUTSTANDING")
    const overdueAmt = overdue.reduce((s, r) => s + toNumber(r.amount_outstanding), 0)
    const dueSoon = reportsData.receivables.filter((r) => r.status === "DUE_SOON")
    const dueSoonAmt = dueSoon.reduce((s, r) => s + toNumber(r.amount_outstanding), 0)
    return { total, overdueAmt, overdueCount: overdue.length, dueSoonAmt, dueSoonCount: dueSoon.length, count: reportsData.receivables.length }
  }, [reportsData.receivables])

  const payableStats = React.useMemo(() => {
    const total = reportsData.payables.reduce((s, r) => s + toNumber(r.amount_outstanding), 0)
    const overdue = reportsData.payables.filter((r) => r.status === "OVERDUE" || r.status === "LONG_OUTSTANDING")
    const overdueAmt = overdue.reduce((s, r) => s + toNumber(r.amount_outstanding), 0)
    return { total, overdueAmt, overdueCount: overdue.length, count: reportsData.payables.length }
  }, [reportsData.payables])

  const loading = txLoading || extraLoading


  
// ─── Active Shape for Donut Chart ─────────────────────────────────────────────
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={600}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#9ca3af" fontSize={12}>
        {fmt(value)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0px 0px 8px ${fill}80)` }}
      />
    </g>
  )
}

// ── STRATEGIC INSIGHTS ──────────────────────────────────────────────────────
  function StrategicInsights({ mode }: { mode: "PERSONAL" | "BUSINESS" }) {
    let insightText = ""
    let iconColor = "text-emerald-400"
    
    if (mode === "PERSONAL") {
      if (monthSavingsRate >= 20) {
        insightText = `Great job! Your savings rate is a healthy ${monthSavingsRate.toFixed(1)}%. Keep up the good work.`
      } else if (monthExpense > monthIncome && monthIncome > 0) {
        insightText = `Warning: You've spent more than you earned this month. Consider reviewing your top expense categories.`
        iconColor = "text-red-400"
      } else {
        insightText = `You are on track. Try to limit unnecessary spending to reach a 20% savings goal.`
        iconColor = "text-yellow-400"
      }
    } else {
      if (monthNet > 0 && receivableStats.overdueCount === 0) {
        insightText = `Strong performance! You are operating at a net profit with no overdue receivables.`
      } else if (receivableStats.overdueCount > 0) {
        insightText = `Attention needed: You have ${receivableStats.overdueCount} overdue receivables totaling ${fmt(receivableStats.overdueAmt)}. Consider following up.`
        iconColor = "text-yellow-400"
      } else if (monthExpense > monthIncome) {
        insightText = `Warning: Operating costs exceed revenue this month. Monitor your burn rate closely.`
        iconColor = "text-red-400"
      } else {
        insightText = `Business is steady. Keep an eye on your upcoming payables and maintain positive cash flow.`
      }
    }

    return (
      <div className="px-4 lg:px-6 mb-2">
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-r from-[var(--surface-card)] to-[#1a1a1a] p-4 flex items-start gap-3 transition-all duration-200 ease-in-out hover:border-border-secondary">
          <Brain className={`mt-0.5 shrink-0 ${iconColor}`} size={18} />
          <div>
            <p className="text-sm font-semibold text-text-primary mb-1">Strategic Insight</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{insightText}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── PERSONAL LAYOUT ─────────────────────────────────────────────────────────
  function PersonalLayout() {
    const [activeIndex, setActiveIndex] = React.useState(0)
    const onPieEnter = (_: any, index: number) => { setActiveIndex(index) }

    return (
      <>
        <StrategicInsights mode="PERSONAL" />
        
        {/* Minimal KPIs */}
        <div className="grid grid-cols-2 gap-3 px-4 lg:px-6 md:grid-cols-4">
          <KpiCard label={t("reports.totalIncome")} value={fmt(monthIncome)} change={momDelta(monthIncome, prevIncome)} positive trend={incomeTrend} />
          <KpiCard label={t("reports.totalExpenses")} value={fmt(monthExpense)} change={momDelta(monthExpense, prevExpense)} positive={false} trend={expenseTrend} />
          <KpiCard label={t("reports.netSavings")} value={fmt(monthNet)} change={momDelta(monthNet, prevNet)} positive={monthNet >= 0} trend={netTrend} />
          <KpiCard label={t("reports.budgetUsed")} value={`${budgetUtilPct.toFixed(1)}%`} positive={budgetUtilPct <= 80} sub={`${fmt(budgetSpent)} of ${fmt(budgetTotal)}`} />
        </div>

        {/* Charts: Overview & Interactive Donut */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2">
          <SurfaceCard title={t("reports.monthlyOverview")} subtitle="Income vs Expense with Net Savings">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyOverview} barGap={4} barCategoryGap="30%" style={{ backgroundColor: "transparent" }}>
                  <defs>
                    <linearGradient id="incG2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="expG2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={false} axisLine={false} tickLine={false} width={0} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="income" name={t("reports.income")} fill="url(#incG2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={t("reports.expense")} fill="url(#expG2)" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="savings" name={t("reports.netSavings")} stroke="#34d399" strokeWidth={3} dot={false} style={{ filter: "drop-shadow(0px 4px 6px rgba(52,211,153,0.3))" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>

          <SurfaceCard title={t("reports.categoryBreakdown")} subtitle="Top expense categories">
            {categoryDonut.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">{t("reports.noExpenseData")}</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 h-[240px]">
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ backgroundColor: "transparent" }}>
                      <Pie 
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={categoryDonut.slice(0, 6)} 
                        dataKey="value" 
                        nameKey="name" 
                        innerRadius={50} 
                        outerRadius={75}
                        onMouseEnter={onPieEnter}
                        stroke="none"
                      >
                        {categoryDonut.slice(0, 6).map((entry, idx) => (
                          <Cell key={entry.name} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center gap-2 pr-2">
                  {categoryDonut.slice(0, 6).map((cat, idx) => (
                    <div 
                      key={cat.name} 
                      className={`flex items-center gap-2 text-xs p-1.5 rounded-md transition-all cursor-pointer ${activeIndex === idx ? 'bg-white/10 shadow-sm' : 'hover:bg-white/5'}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                      <span className="text-text-primary truncate flex-1">{cat.name}</span>
                      <span className="text-muted-foreground shrink-0">{fmt(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SurfaceCard>
        </div>

        {/* Wealth Builder & Health */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2">
          <SurfaceCard title="Wealth Builder Projection" subtitle={`12-month projection at current run rate (${fmt(projection.pmt)}/mo)`} icon={Target}>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.rows} style={{ backgroundColor: "transparent" }}>
                  <defs>
                    <linearGradient id="corpusGF2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} dy={5} />
                  <YAxis tick={false} axisLine={false} tickLine={false} width={0} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "3 3" }} />
                  <Area type="monotone" dataKey="corpus" name="Projected Wealth" stroke="#a78bfa" fill="url(#corpusGF2)" strokeWidth={3} style={{ filter: "drop-shadow(0px 4px 10px rgba(167,139,250,0.3))" }} />
                  <Line type="monotone" dataKey="simple" name="Simple Savings" stroke="#9ca3af" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>
          
          <SurfaceCard title={t("reports.financialHealth")} subtitle="Overall performance indicator" icon={Zap}>
            <div className="flex items-center justify-center h-[200px]">
              <div className="w-[180px] h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={healthScoreData} startAngle={180} endAngle={0} style={{ backgroundColor: "transparent" }}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill={healthScores.composite >= 70 ? "#34d399" : healthScores.composite >= 40 ? "#f59e0b" : "#f87171"} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <span className="text-4xl font-bold text-white">{healthScores.composite}</span>
                    <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Health Score</span>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </>
    )
  }

  // ── BUSINESS LAYOUT ─────────────────────────────────────────────────────────
  function BusinessLayout() {
    return (
      <>
        <StrategicInsights mode="BUSINESS" />
        
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 px-4 lg:px-6 md:grid-cols-4">
          <KpiCard label={t("reports.revenue")} value={fmt(monthIncome)} change={momDelta(monthIncome, prevIncome)} positive trend={incomeTrend} />
          <KpiCard label={t("reports.operatingCosts")} value={fmt(monthExpense)} change={momDelta(monthExpense, prevExpense)} positive={monthExpense <= prevExpense} trend={expenseTrend} />
          <KpiCard label={t("reports.netProfit")} value={fmt(monthNet)} change={momDelta(monthNet, prevNet)} positive={monthNet >= 0} trend={netTrend} />
          <KpiCard label={"Net Position"} value={fmt(receivableStats.total - payableStats.total)} positive={(receivableStats.total - payableStats.total) >= 0} />
        </div>

        {/* Advanced Business Charts */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-2">
          
          <SurfaceCard title={t("reports.revenueVsCosts")} subtitle="Performance Margin Overview">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyOverview} barGap={0} style={{ backgroundColor: "transparent" }}>
                  <defs>
                    <linearGradient id="revSolid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="costSolid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#f87171" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={false} axisLine={false} tickLine={false} width={0} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="income" name={t("reports.revenue")} fill="url(#revSolid)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={t("reports.operatingCosts")} fill="url(#costSolid)" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="savings" name={t("reports.netProfit")} stroke="#60a5fa" strokeWidth={3} dot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }} style={{ filter: "drop-shadow(0px 4px 6px rgba(96,165,250,0.4))" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>

          <SurfaceCard title="Daily Cash Flow Velocity" subtitle="Burn rate and reserves timeline">
            {cashFlow.series.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">{t("reports.noTransactions")}</div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart style={{ backgroundColor: "transparent" }}>
                    <defs>
                      <linearGradient id="cfG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={false} axisLine={false} tickLine={false} width={0} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "3 3" }} />
                    <Area data={cashFlow.series} type="monotone" dataKey="balance" name="Balance" stroke="#22d3ee" fill="url(#cfG)" strokeWidth={3} style={{ filter: "drop-shadow(0px 4px 8px rgba(34,211,238,0.25))" }} />
                    <Scatter data={cashFlow.expensePoints} dataKey="balance" name="Expense Event" fill="#f87171" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </SurfaceCard>
          
        </div>

        <div className="px-4 lg:px-6 mb-4">
          <SurfaceCard title={t("reports.receivablesPayables")} subtitle="Current Outstanding Dues">
            <div className="flex flex-col gap-8 py-4 px-2">
              {/* Receivables Bar */}
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-emerald-400 font-medium">{t("reports.outstandingReceivables")}</span>
                  <span className="text-emerald-400 font-bold text-lg">{fmt(receivableStats.total)}</span>
                </div>
                <div className="h-4 w-full bg-surface-secondary rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${receivableStats.total > 0 ? ((receivableStats.total - receivableStats.overdueAmt) / receivableStats.total * 100) : 0}%` }} />
                  <div className="h-full bg-red-400 transition-all duration-700 ease-out" style={{ width: `${receivableStats.total > 0 ? (receivableStats.overdueAmt / receivableStats.total * 100) : 0}%` }} title="Overdue" />
                </div>
                {receivableStats.overdueCount > 0 && (
                  <p className="text-xs text-red-400 mt-2 text-right font-medium">{receivableStats.overdueCount} overdue ({fmt(receivableStats.overdueAmt)})</p>
                )}
              </div>

              {/* Payables Bar */}
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-red-400 font-medium">{t("reports.outstandingPayables")}</span>
                  <span className="text-red-400 font-bold text-lg">{fmt(payableStats.total)}</span>
                </div>
                <div className="h-4 w-full bg-surface-secondary rounded-full overflow-hidden flex">
                  <div className="h-full bg-red-400 transition-all duration-700 ease-out" style={{ width: `${payableStats.total > 0 ? ((payableStats.total - payableStats.overdueAmt) / payableStats.total * 100) : 0}%` }} />
                  <div className="h-full bg-red-600 transition-all duration-700 ease-out" style={{ width: `${payableStats.total > 0 ? (payableStats.overdueAmt / payableStats.total * 100) : 0}%` }} title="Overdue" />
                </div>
                {payableStats.overdueCount > 0 && (
                  <p className="text-xs text-red-500 mt-2 text-right font-medium">{payableStats.overdueCount} overdue ({fmt(payableStats.overdueAmt)})</p>
                )}
              </div>
            </div>
          </SurfaceCard>
        </div>
      </>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const titleKey = isPersonal ? "reports.personalTitle" : isBusiness ? "reports.businessTitle" : "reports.title"
  const subtitleKey = isPersonal ? "reports.personalSubtitle" : isBusiness ? "reports.businessSubtitle" : "reports.subtitle"

  return (
    <>
      <GlobalScrollbarStyle />

      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{t(titleKey)}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t(subtitleKey)}
              </p>
            </div>
            <MonthPicker value={month} onChange={setMonth} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              {t("reports.loading")}
            </div>
          ) : (
            <>
              {isCombo && (
                <div className="px-4 lg:px-6 mb-2">
                  <div className="inline-flex items-center p-1 bg-[var(--surface-card)] rounded-lg border border-white/5">
                    <button
                      onClick={() => setComboTab("PERSONAL")}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${comboTab === "PERSONAL" ? "bg-[#333] text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
                    >
                      {t("reports.personalSection")}
                    </button>
                    <button
                      onClick={() => setComboTab("BUSINESS")}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${comboTab === "BUSINESS" ? "bg-[#333] text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
                    >
                      {t("reports.businessSection")}
                    </button>
                  </div>
                </div>
              )}

              {/* PERSONAL mode */}
              {(isPersonal || (isCombo && comboTab === "PERSONAL")) && <PersonalLayout />}

              {/* BUSINESS mode */}
              {(isBusiness || (isCombo && comboTab === "BUSINESS")) && <BusinessLayout />}
            </>
          )}
        </div>
      </div>
    </>
  )
}
