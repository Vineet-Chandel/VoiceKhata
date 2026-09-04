"use client"

import * as React from "react"
import { IconTrash, IconPencil } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import type { Budget } from "@/components/hooks/use-budgets"
import { EditBudgetDialog }   from "@/components/ui/Budget_UI/edit-budget-dialog"
import { DeleteBudgetDialog } from "@/components/ui/Budget_UI/delete-budget-dialog"
import { getProgressColor, isDurationGuardedBudget } from "@/lib/budget-utils"

const CATEGORY_COLORS: Record<string, string> = {
  Food:          "bg-orange-500",
  Shopping:      "bg-pink-500",
  Transport:     "bg-blue-500",
  Utilities:     "bg-yellow-500",
  Health:        "bg-green-500",
  Entertainment: "bg-purple-500",
  Subscription:  "bg-cyan-500",
  Other:         "bg-gray-500",
}

const DURATION_LABELS: Record<string, string> = {
  monthly:   "Monthly",
  "3months":  "3 Months",
  "6months":  "6 Months",
  "12months": "12 Months",
  yearly:    "Yearly",        // ← new from Codex
  timeless:  "Timeless",
}

const BUDGET_TEMPLATES = {
  "Indian Household": [
    { category: "Food",          amount: 12000, duration: "monthly" },
    { category: "Utilities",     amount:  5000, duration: "monthly" },
    { category: "Transport",     amount:  4000, duration: "monthly" },
    { category: "Health",        amount:  3000, duration: "monthly" },
    { category: "Entertainment", amount:  3000, duration: "monthly" },
  ],
  Student: [
    { category: "Food",          amount:  5000, duration: "monthly" },
    { category: "Transport",     amount:  1500, duration: "monthly" },
    { category: "Subscription",  amount:   800, duration: "monthly" },
    { category: "Entertainment", amount:  1200, duration: "monthly" },
  ],
  Freelancer: [
    { category: "Utilities",    amount: 4000, duration: "monthly" },
    { category: "Subscription", amount: 3000, duration: "monthly" },
    { category: "Transport",    amount: 2500, duration: "monthly" },
    { category: "Health",       amount: 2500, duration: "monthly" },
    { category: "Other",        amount: 3000, duration: "monthly" },
  ],
} as const

interface Props {
  budgets:             Budget[]
  selectedMonth:       string
  onAddTemplateBudget?: (b: { category: string; amount: number; duration: string }) => Promise<{ error?: string } | undefined>
  onDelete:            (id: string) => Promise<void>
  onEdit:              (id: string, updates: { category: string; amount: number; duration: string }) => Promise<{ error?: string } | undefined>
  existingCategories?: string[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n)

function BudgetRow({
  b, selectedMonth, onEdit, onDelete, existingCategories = [],
}: {
  b:                   Budget
  selectedMonth:       string
  onEdit:              Props["onEdit"]
  onDelete:            Props["onDelete"]
  existingCategories?: string[]
}) {
  const [editOpen,   setEditOpen]   = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const pct       = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0
  const isOver    = b.spent > b.amount
  const remaining = b.amount - b.spent
  const barColor  = isOver ? "bg-red-500" : getProgressColor(pct)  // ← new helper
  const dotColor  = CATEGORY_COLORS[b.category] ?? "bg-gray-500"
  const duration  = b.duration ?? "monthly"
  const guarded   = isDurationGuardedBudget(b, selectedMonth)       // ← new

  return (
    <>
      {/* Old card style, new guarded opacity */}
      <div className={`rounded-lg border bg-card p-4 flex flex-col gap-3 ${guarded ? "opacity-45 saturate-0" : ""}`}>
        <div className="flex items-center justify-between">

          {/* Left: dot + name + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`size-2.5 rounded-full ${dotColor}`} />
            <span className="text-sm font-medium">{b.category}</span>

            {/* Duration badge */}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
              {DURATION_LABELS[duration] ?? duration}
            </span>

            {isOver && (
              <span className="text-xs bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full">
                Over budget
              </span>
            )}

            {/* New: duration guard badge */}
            {guarded && (
              <span className="text-xs bg-white/8 text-muted-foreground px-1.5 py-0.5 rounded-full">
                Duration guard
              </span>
            )}
          </div>

          {/* Right: amounts + actions */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">
                {fmt(b.spent)} <span className="text-muted-foreground/50">of</span> {fmt(b.amount)}
              </p>
              <p className={`text-xs font-medium ${isOver ? "text-red-400" : "text-green-400"}`}>
                {isOver ? `${fmt(Math.abs(remaining))} over` : `${fmt(remaining)} left`}
              </p>
            </div>

            <Button
              variant="ghost" size="sm"
              className="size-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setEditOpen(true)}
            >
              <IconPencil className="size-3.5" />
            </Button>

            <Button
              variant="ghost" size="sm"
              className="size-7 p-0 text-muted-foreground hover:text-red-400"
              onClick={() => setDeleteOpen(true)}
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1">
          <div className="relative group/bar h-1.5 w-full rounded-full bg-muted overflow-visible cursor-default">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />

            {/* Tooltip: shown when no spending recorded yet */}
            {b.spent === 0 && (
              <div className="absolute left-0 -top-9 hidden group-hover/bar:flex items-center gap-1.5 bg-popover border border-border rounded-md px-2.5 py-1.5 text-xs text-muted-foreground whitespace-nowrap shadow-md z-10 pointer-events-none">
                <span className="size-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                Budget defined at {fmt(b.amount)} — no spending recorded yet
              </div>
            )}
          </div>

          {/* Mobile: show spent + pct below bar */}
          <div className="flex justify-between text-xs text-muted-foreground sm:hidden">
            <span>{fmt(b.spent)} spent</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <EditBudgetDialog
        budget={b}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onEdit}
        existingCategories={existingCategories}
      />
      <DeleteBudgetDialog
        budget={b}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDelete}
      />
    </>
  )
}

export function BudgetList({
  budgets, selectedMonth, onAddTemplateBudget, onDelete, onEdit, existingCategories = [],
}: Props) {
  const [templateLoading, setTemplateLoading] = React.useState<string | null>(null)
  const [templateFeedback, setTemplateFeedback] = React.useState<string | null>(null)

  const applyTemplate = async (templateName: keyof typeof BUDGET_TEMPLATES) => {
    if (!onAddTemplateBudget) return
    setTemplateLoading(templateName)
    setTemplateFeedback(null)
    const failed: string[] = []
    try {
      for (const row of BUDGET_TEMPLATES[templateName]) {
        const result = await onAddTemplateBudget(row)
        if (result?.error) failed.push(`${row.category}: ${result.error}`)
      }
      if (failed.length > 0) {
        setTemplateFeedback(`Template failed for ${failed.length} item(s). ${failed[0]}`)
      } else {
        setTemplateFeedback(`Template "${templateName}" applied.`)
      }
    } finally {
      setTemplateLoading(null)
    }
  }

  if (budgets.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        {/* Old dashed border style + new template buttons */}
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground text-sm">
          <p className="mb-4">No budgets set for this month. Start from a template.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(Object.keys(BUDGET_TEMPLATES) as Array<keyof typeof BUDGET_TEMPLATES>).map((template) => (
              <Button
                key={template}
                variant="outline"
                disabled={!onAddTemplateBudget || templateLoading !== null}
                onClick={() => applyTemplate(template)}
                className="justify-between"
              >
                <span>{template}</span>
                {templateLoading === template ? "..." : "Use"}
              </Button>
            ))}
          </div>
          {templateFeedback && (
            <p className="mt-3 text-xs text-muted-foreground">{templateFeedback}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 flex flex-col gap-3">
      {budgets.map((b) => (
        <BudgetRow
          key={b.id}
          b={b}
          selectedMonth={selectedMonth}
          onEdit={onEdit}
          onDelete={onDelete}
          existingCategories={existingCategories}
        />
      ))}
    </div>
  )
}
