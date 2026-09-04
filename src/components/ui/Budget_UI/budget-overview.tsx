// src/components/ui/Budget_UI/budget-overview.tsx
"use client"

import * as React from "react"
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Budget } from "@/components/hooks/use-budgets"
import { calculateBudgetHealthScore, getProgressColor } from "@/lib/budget-utils"

interface Props {
  budgets:       Budget[]
  totalCap:      number | null
  onSetTotalCap: (cap: number | null) => Promise<{ error?: string } | void>
}

export function BudgetOverview({ budgets, totalCap, onSetTotalCap }: Props) {
  const sumBudget   = budgets.reduce((s, b) => s + b.amount, 0)
  const totalBudget = totalCap ?? sumBudget
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0)
  const remaining   = totalBudget - totalSpent
  const overBudget  = budgets.filter((b) => b.spent > b.amount).length
  const healthScore = calculateBudgetHealthScore(budgets)

  const pct      = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const barColor = getProgressColor(pct)

  // ── edit-cap state ────────────────────────────────────────────────────────
  const [editing,  setEditing]  = React.useState(false)
  const [capInput, setCapInput] = React.useState("")
  const [saving,   setSaving]   = React.useState(false)
  const [capError, setCapError] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const openEdit = () => {
    setCapInput(totalCap !== null ? String(totalCap) : String(sumBudget))
    setCapError("")
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 50)
  }

  const cancelEdit = () => { setEditing(false); setCapError("") }

  const saveCap = async () => {
    const val = capInput.trim()
    if (val === "" || val === "0") {
      setSaving(true)
      await onSetTotalCap(null)
      setSaving(false)
      setEditing(false)
      return
    }
    const num = Number(val)
    if (isNaN(num) || num < 0) { setCapError("Enter a valid amount"); return }
    setSaving(true)
    const res = await onSetTotalCap(num)
    setSaving(false)
    if ((res as any)?.error) { setCapError((res as any).error); return }
    setEditing(false)
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n)

  // health ring color — inverse of progress (high score = good = green)
  const ringColor =
    healthScore >= 70 ? "#22c55e" :
    healthScore >= 40 ? "#f59e0b" :
    "#ef4444"

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-4">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">

        {/* Total Budget — editable */}
        <Card className="p-4 flex flex-col gap-1 relative">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Total Budget</p>

            {!editing ? (
              <button
                onClick={openEdit}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Edit total budget"
              >
                <IconPencil className="size-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={saveCap}
                  disabled={saving}
                  className="text-green-400 hover:text-green-300 disabled:opacity-50"
                  title="Save"
                >
                  <IconCheck className="size-3.5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-muted-foreground hover:text-foreground"
                  title="Cancel"
                >
                  <IconX className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-1 mt-0.5">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">₹</span>
                <Input
                  ref={inputRef}
                  type="number"
                  value={capInput}
                  onChange={(e) => { setCapInput(e.target.value); setCapError("") }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")  saveCap()
                    if (e.key === "Escape") cancelEdit()
                  }}
                  className="h-auto border-0 border-b rounded-none bg-transparent text-lg font-semibold px-0 focus-visible:ring-0 focus-visible:border-primary"
                  placeholder="e.g. 20000"
                />
              </div>
              {capError && <p className="text-[10px] text-red-400">{capError}</p>}
              <p className="text-[10px] text-muted-foreground">
                {totalCap !== null ? "Clear to auto-sum categories" : "Overrides sum of categories"}
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-1.5">
              <p className="text-lg font-semibold text-foreground">{fmt(totalBudget)}</p>
              {totalCap !== null && (
                <span
                  className="text-[10px] text-muted-foreground mb-0.5 cursor-pointer hover:text-foreground"
                  title={`Auto-sum would be ${fmt(sumBudget)}`}
                  onClick={openEdit}
                >
                  (custom)
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Total Spent */}
        <Card className="p-4 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-lg font-semibold text-red-400">{fmt(totalSpent)}</p>
        </Card>

        {/* Remaining */}
        <Card className="p-4 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={`text-lg font-semibold ${remaining >= 0 ? "text-green-400" : "text-red-400"}`}>
            {fmt(remaining)}
          </p>
        </Card>

        {/* Over Budget */}
        <Card className="p-4 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Over Budget</p>
          <div className="flex items-end gap-1.5">
            <p className={`text-lg font-semibold ${overBudget > 0 ? "text-yellow-400" : "text-green-400"}`}>
              {overBudget}
            </p>
            <Badge
              variant="outline"
              className="mb-0.5 text-[10px] px-1.5 py-0"
            >
              {overBudget === 1 ? "category" : "categories"}
            </Badge>
          </div>
        </Card>

        {/* Health Score — new from Codex, old card style */}
        <Card className="p-4 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Health Score</p>
            <p className="text-lg font-semibold">{healthScore}/100</p>
          </div>
          {/* SVG ring */}
          <div className="relative size-12 shrink-0">
            <svg className="size-12 -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle
                cx="18" cy="18" r="15.915"
                fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.915"
                fill="none"
                stroke={ringColor}
                strokeWidth="3"
                strokeDasharray={`${healthScore}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[10px] font-medium">
              {healthScore}
            </span>
          </div>
        </Card>
      </div>

      {/* ── Overall progress bar ── */}
      {totalBudget > 0 && (
        <Card className="p-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Overall spending</span>
            <span>{pct.toFixed(1)}% used</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {totalCap !== null && totalCap !== sumBudget && (
            <>
              <Separator className="my-0.5" />
              <p className="text-[11px] text-muted-foreground">
                Manual cap: {fmt(totalCap)} · Categories sum: {fmt(sumBudget)}
              </p>
            </>
          )}
        </Card>
      )}
    </div>
  )
}