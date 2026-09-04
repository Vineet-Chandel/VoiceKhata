"use client"

import type { Transaction } from "@/components/hooks/use-transactions"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const spent = payload[0]?.value ?? 0
  const budget = payload[0]?.payload?.budget ?? 0
  const percent = budget ? Math.round((spent / budget) * 100) : 0

  const color =
    percent > 90 ? "#ef4444" :
    percent > 70 ? "#facc15" :
    "#22c55e"

  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 13,
        color: "#fff",
        minWidth: 180
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        {label}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#9ca3af" }}>Spent</span>
        <span>₹{spent.toLocaleString("en-IN")}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#9ca3af" }}>Budget</span>
        <span>₹{budget.toLocaleString("en-IN")}</span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          marginTop: 8,
          height: 6,
          borderRadius: 6,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: color,
            height: "100%"
          }}
        />
      </div>

      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span style={{ color: "#9ca3af" }}>Used</span>
        <span style={{ color }}>{percent}%</span>
      </div>
    </div>
  )
}

export function CategoryChart({
  transactions,
  budgets
}: {
  transactions: Transaction[]
  budgets: { category: string; amount: number }[]
}) {

  const map: Record<string, { spent: number; budget: number }> = {}

  // Initialize budgets
  budgets.forEach((b) => {
    map[b.category] = {
      spent: 0,
      budget: b.amount
    }
  })

  // Add spending
  transactions
    .filter((t) => t.type === "Debit")
    .forEach((t) => {
      const category = t.category || "Other"

      if (!map[category]) {
        map[category] = { spent: 0, budget: 0 }
      }

      map[category].spent += t.amount
    })

  const data = Object.entries(map)
    .map(([name, values]) => ({
      name,
      value: values.spent,
      budget: values.budget
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--surface-card)] p-6 flex items-center justify-center h-64 text-sm text-muted-foreground">
        No expense data for this month
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--surface-card)] p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold text-[#979797]">
        Expenses by Category
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
          barCategoryGap={20}
          style={{ backgroundColor: "transparent" }}
        >

          {/* Gradient */}
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="40%" stopColor="#6b7280" />
              <stop offset="70%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,0.05)"
            vertical={true}
            horizontal={false}
          />

          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#dcdcdcff", fontSize: 12 }}
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
            }
          />

          <YAxis
            type="category"
            dataKey="name"
            width={90}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#dcdcdcff", fontSize: 12 }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />

          <Bar
            dataKey="value"
            fill="url(#expenseGradient)"
            radius={[0, 6, 6, 0]}
            barSize={18}
            background={false}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
