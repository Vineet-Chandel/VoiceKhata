// src/components/ui/Budget_UI/edit-budget-dialog.tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectSeparator,
  SelectTrigger, SelectValue,
} from "@/components/ui/Dashboard_UI/select"
import type { Budget } from "@/components/hooks/use-budgets"

const BASE_CATEGORIES = [
  "Food", "Shopping", "Transport", "Utilities",
  "Health", "Entertainment", "Subscription", "Other",
]

const DURATIONS = [
  { value: "monthly",  label: "Monthly"            },
  { value: "3months",  label: "3 Months"           },
  { value: "6months",  label: "6 Months"           },
  { value: "12months", label: "12 Months (1 Year)" },
  { value: "timeless", label: "Timeless"           },
]

interface Props {
  budget:              Budget
  existingCategories?: string[]
  open:                boolean
  onOpenChange:        (open: boolean) => void
  onSave:              (id: string, updates: { category: string; amount: number; duration: string }) => Promise<{ error?: string } | undefined>
}

export function EditBudgetDialog({ budget, existingCategories = [], open, onOpenChange, onSave }: Props) {
  const [category, setCategory] = React.useState(budget.category)
  const [amount,   setAmount]   = React.useState(String(budget.amount))
  const [duration, setDuration] = React.useState((budget as any).duration ?? "monthly")
  const [saving,   setSaving]   = React.useState(false)
  const [errors,   setErrors]   = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    setCategory(budget.category)
    setAmount(String(budget.amount))
    setDuration((budget as any).duration ?? "monthly")
    setErrors({})
  }, [budget])

  const activeCats    = BASE_CATEGORIES.filter((c) => existingCategories.includes(c) && c !== budget.category)
  const pinnedCats    = existingCategories.filter((c) => !BASE_CATEGORIES.includes(c) && c !== budget.category)
  const remainingCats = BASE_CATEGORIES.filter((c) => !existingCategories.includes(c) && c !== "Other")

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!category) e.category = "Required"
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter a valid amount"
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    const result = await onSave(budget.id, { category, amount: Number(amount), duration })
    setSaving(false)
    if (result?.error) { setErrors({ form: result.error }) }
    else { onOpenChange(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>Update the spending limit for this category.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setErrors((p) => ({ ...p, category: "" })) }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>

                {/* Current category first */}
                <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wide">Current</div>
                <SelectItem value={budget.category}>{budget.category}</SelectItem>
                <SelectSeparator />

                {activeCats.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wide">Already budgeted</div>
                    {activeCats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    <SelectSeparator />
                  </>
                )}

                {pinnedCats.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wide">Your categories</div>
                    {pinnedCats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    <SelectSeparator />
                  </>
                )}

                {remainingCats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                <SelectSeparator />
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label>Spending Limit (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: "" })) }}
            />
            {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {DURATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {errors.form && <p className="text-xs text-red-400">{errors.form}</p>}
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}