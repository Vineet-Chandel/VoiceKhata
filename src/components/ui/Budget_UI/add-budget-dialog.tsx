// src/components/ui/Budget_UI/add-budget-dialog.tsx
"use client"

import * as React from "react"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectSeparator,
  SelectTrigger, SelectValue,
} from "@/components/ui/Dashboard_UI/select"

const BASE_CATEGORIES = [
  "Food", "Shopping", "Transport", "Utilities",
  "Health", "Entertainment", "Subscription", "Other",
]

const DURATIONS = [
  { value: "monthly",  label: "Monthly"            },
  { value: "3months",  label: "3 Months"           },
  { value: "6months",  label: "6 Months"           },
  { value: "yearly",   label: "Yearly"             },
  { value: "timeless", label: "Timeless"           },
]

interface Props {
  existingCategories?: string[]   // ← categories already in budget, passed from parent
  onAdd: (b: { category: string; amount: number; duration: string }) => Promise<{ error?: string } | undefined>
}

export function AddBudgetDialog({ onAdd, existingCategories = [] }: Props) {
  const [open,       setOpen]       = React.useState(false)
  const [category,   setCategory]   = React.useState("")
  const [customName, setCustomName] = React.useState("")
  const [amount,     setAmount]     = React.useState("")
  const [duration,   setDuration]   = React.useState("monthly")
  const [saving,     setSaving]     = React.useState(false)
  const [errors,     setErrors]     = React.useState<Record<string, string>>({})

  const isOther = category === "Other"

  // Categories not yet budgeted (pinned to top), rest below divider
  const pinnedCats  = existingCategories.filter((c) => !BASE_CATEGORIES.includes(c))
  const activeCats  = BASE_CATEGORIES.filter((c) => existingCategories.includes(c))
  const remainingCats = BASE_CATEGORIES.filter((c) => !existingCategories.includes(c) && c !== "Other")

  const reset = () => {
    setCategory(""); setCustomName(""); setAmount("")
    setDuration("monthly"); setErrors({})
  }

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!category)                                        e.category   = "Required"
    if (isOther && !customName.trim())                    e.customName = "Please enter a name"
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter a valid amount"
    if (Object.keys(e).length) { setErrors(e); return }

    const finalCategory = isOther ? customName.trim() : category
    setSaving(true)
    const result = await onAdd({ category: finalCategory, amount: Number(amount), duration })
    setSaving(false)
    if (result?.error) { setErrors({ form: result.error }) }
    else { reset(); setOpen(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button size="sm"><IconPlus className="size-4 mr-1" />Set Budget</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Set Budget</DialogTitle>
          <DialogDescription>Set a spending limit for a category.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v)
                setCustomName("")
                setErrors((p) => ({ ...p, category: "", customName: "" }))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>

                {/* Already budgeted — pinned at top */}
                {activeCats.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wide">
                      Already budgeted
                    </div>
                    {activeCats.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                    <SelectSeparator />
                  </>
                )}

                {/* Custom categories at top (e.g. "Pets") */}
                {pinnedCats.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wide">
                      Your categories
                    </div>
                    {pinnedCats.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                    <SelectSeparator />
                  </>
                )}

                {/* Remaining standard categories */}
                {remainingCats.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}

                <SelectSeparator />
                <SelectItem value="Other">Other (custom name)</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
          </div>

          {/* Custom name — only when Other */}
          {isOther && (
            <div className="flex flex-col gap-1.5">
              <Label>Category Name</Label>
              <Input
                placeholder="e.g. Gym, Pet Care, Travel…"
                value={customName}
                onChange={(e) => { setCustomName(e.target.value); setErrors((p) => ({ ...p, customName: "" })) }}
                autoFocus
              />
              {errors.customName && <p className="text-xs text-red-400">{errors.customName}</p>}
            </div>
          )}

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
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {duration === "timeless"
                ? "Budget applies until manually deleted."
                : duration === "monthly"
                  ? "Budget resets each month."
                  : `Budget spans ${duration.replace("months", "")} months from creation.`}
            </p>
          </div>

          {errors.form && <p className="text-xs text-red-400">{errors.form}</p>}
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Set Budget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}