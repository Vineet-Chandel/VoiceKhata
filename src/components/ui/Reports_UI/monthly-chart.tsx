// src/components/ui/Reports_UI/monthly-chart.tsx
"use client"

import type { Transaction } from "@/components/hooks/use-transactions"
import type { MonthlyTrend } from "@/lib/financial-metrics"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function MonthlyChart({
  transactions,
  monthlyTrends,
}: {
  transactions: Transaction[]
  monthlyTrends?: MonthlyTrend[]
}) {
  const fallbackMap: Record<string, { month: string; income: number; expense: number }> = {}

  transactions.forEach((t) => {
    const d = new Date(t.date)
    const key = MONTH_NAMES[d.getMonth()]
    if (!fallbackMap[key]) fallbackMap[key] = { month: key, income: 0, expense: 0 }
    if (t.type === "Credit") fallbackMap[key].income += t.amount
    else fallbackMap[key].expense += t.amount
  })

  const fallbackData = MONTH_NAMES
    .filter((m) => fallbackMap[m])
    .map((m) => fallbackMap[m])

  const data = monthlyTrends && monthlyTrends.length > 0
    ? monthlyTrends.map((trend) => ({
      month: trend.monthLabel,
      income: trend.income,
      expense: trend.expense,
    }))
    : fallbackData

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 flex items-center justify-center h-64 text-sm text-muted-foreground">
        No data for chart
      </div>
    )
  }
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const income = payload.find((p: any) => p.dataKey === "income")?.value || 0
    const expense = payload.find((p: any) => p.dataKey === "expense")?.value || 0

    return (
      <div
        style={{
          background: "var(--surface-card)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 13,
          color: "#fff"
        }}
      >
        <p style={{ marginBottom: 6, fontWeight: 600 }}>{label}</p>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
          <span style={{ color: "#9ca3af" }}>Income</span>
          <span>₹{income.toLocaleString("en-IN")}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
          <span style={{ color: "#9ca3af" }}>Expense</span>
          <span>₹{expense.toLocaleString("en-IN")}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--surface-card)] p-5">
      <p className="font-semibold text-sm text-[#979797] mb-3">Monthly Overview</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={4} barCategoryGap="30%" style={{ backgroundColor: "transparent" }}>

          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0.2} />
            </linearGradient>

            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.2} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#ffffffff" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#ffffffff" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
            }
          />

          <Tooltip
            cursor={{ fill: "transparent" }}
            content={<CustomTooltip />}
          />

          <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />

          <Bar
            dataKey="income"
            name="Income"
            fill="url(#incomeGradient)"
            radius={[6, 6, 0, 0]}
          />

          <Bar
            dataKey="expense"
            name="Expense"
            fill="url(#expenseGradient)"
            radius={[6, 6, 0, 0]}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
