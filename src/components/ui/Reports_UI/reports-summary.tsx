// src/components/ui/Reports_UI/reports-summary.tsx
"use client"

import type { Transaction } from "@/components/hooks/use-transactions"
import type { FinancialMetrics } from "@/lib/financial-metrics"
import { TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n)

const pct = (current: number, previous: number) => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function ReportsSummary({
  transactions,
  metrics,
}: {
  transactions: Transaction[]
  metrics: FinancialMetrics
}) {
  const incomeTx = transactions.filter((t) => t.type === "Credit")
  const expenseTx = transactions.filter((t) => t.type === "Debit")

  const income = metrics.totalIncome
  const expense = metrics.totalExpense
  const net = metrics.savings

  const count = transactions.length
  const avgTx = count > 0 ? expense / count : 0

  const latestTrend = metrics.monthlyTrends[metrics.monthlyTrends.length - 1]
  const previousTrend = metrics.monthlyTrends[metrics.monthlyTrends.length - 2]

  const prevIncome = previousTrend?.income ?? 0
  const prevExpense = previousTrend?.expense ?? 0
  const prevNet = previousTrend?.savings ?? 0

  const incomeChange = pct(latestTrend?.income ?? income, prevIncome)
  const expenseChange = pct(latestTrend?.expense ?? expense, prevExpense)
  const netChange = pct(latestTrend?.savings ?? net, prevNet)

  // trends
  const incomeTrend = incomeTx.slice(-6).map((t) => ({ v: t.amount }))
  const expenseTrend = expenseTx.slice(-6).map((t) => ({ v: t.amount }))
  const allTrend = metrics.monthlyTrends.slice(-6).map((trend) => ({ v: trend.savings }))

  // values for statistics
  const incomeValues = incomeTx.map((t) => t.amount)
  const expenseValues = expenseTx.map((t) => t.amount)
  const allValues = transactions.map((t) => t.amount)

  return (
    <div className="px-4 lg:px-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

      <SummaryCard
        label="Total Income"
        value={fmt(income)}
        change={incomeChange}
        positive
        trend={incomeTrend}
        values={incomeValues}
      />

      <SummaryCard
        label="Total Expenses"
        value={fmt(expense)}
        change={expenseChange}
        positive={false}
        trend={expenseTrend}
        values={expenseValues}
      />

      <SummaryCard
        label="Net Savings"
        value={fmt(net)}
        change={netChange}
        positive={net >= 0}
        trend={allTrend}
        values={allValues}
      />

      <SummaryCard
        label="Avg Transaction"
        value={fmt(avgTx)}
        change={0}
        positive
        trend={allTrend}
        values={allValues}
      />

    </div>
  )
}

function SummaryCard({
  label,
  value,
  change,
  positive,
  trend,
  values
}: {
  label: string
  value: string
  change: number
  positive: boolean
  trend: { v: number }[]
  values: number[]
}) {

  const Icon = positive ? TrendingUp : TrendingDown
  const color = positive ? "text-emerald-400" : "text-red-400"

  const max = values.length ? Math.max(...values) : 0
  const min = values.length ? Math.min(...values) : 0
  const avg =
    values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0

  return (
    <div className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--surface-card)] p-3 flex flex-col gap-2 min-h-[160px] transition-all hover:border-border-secondary hover:bg-[#1d1d1d]">

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <div className="flex items-center gap-2">

        <Icon size={16} className={color} />

        <p className={`text-lg font-semibold ${color}`}>
          {value}
        </p>

        {change !== 0 && (
          <span className={`text-xs ml-auto ${color}`}>
            {positive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}

      </div>

      <div className="mt-2.5 relative h-10 w-full">
        {/* sparkline */}
        <div className="absolute inset-0 transition-opacity duration-200 group-hover:opacity-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} style={{ backgroundColor: "transparent" }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#9ca3af"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* hover statistics */}
        <div className="absolute inset-0 flex flex-col justify-center gap-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">

          <div className="flex justify-between">
            <span className="text-muted-foreground">Transactions</span>
            <span>{values.length}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">High</span>
            <span>{fmt(max)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Low</span>
            <span>{fmt(min)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg</span>
            <span>{fmt(avg)}</span>
          </div>

        </div>

      </div>

    </div>
  )
}
