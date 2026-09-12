// src/components/ui/Transaction_UI/edit-transaction-dialog.tsx
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { AlertTriangleIcon, ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/Dashboard_UI/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select, SelectContent, SelectItem, SelectSeparator,
  SelectTrigger, SelectValue,
} from "@/components/ui/Dashboard_UI/select"
import type { Transaction } from "@/components/hooks/use-transactions"
import type { Budget } from "@/components/hooks/use-budgets"
import { isBudgetValidForTransaction } from "@/lib/budget-utils"
import { useAppMode } from "@/context/AppModeContext"
import { getCategories } from "@/lib/categories"

type TransactionUpdate = Omit<Transaction, "id" | "firebase_uid" | "created_at">

const METHODS = [
  "Bank Transfer", "Credit Card", "Debit Card", "UPI", "Cash", "Net Banking",
]

interface Props {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: number, updated: TransactionUpdate) => Promise<void>
  budgetCategories?: string[]
  budgetRows?: Budget[]
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSave,
  budgetCategories = [],
  budgetRows = [],
}: Props) {
  const { appMode } = useAppMode()
  const BASE_CATEGORIES = getCategories(appMode)
  const [form, setForm] = React.useState({
    transaction: transaction.transaction,
    category: transaction.category,
    amount: String(transaction.amount),
    date: parseISO(transaction.date) as Date | undefined,
    type: transaction.type,
    method: transaction.method,
    status: transaction.status,
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    setForm({
      transaction: transaction.transaction,
      category: transaction.category,
      amount: String(transaction.amount),
      date: parseISO(transaction.date),
      type: transaction.type,
      method: transaction.method,
      status: transaction.status,
    })
    setErrors({})
  }, [transaction])

  const update = (key: keyof typeof form, value: string | Date | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.transaction.trim()) e.transaction = "Required"
    if (!form.category) e.category = "Required"
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = "Enter a valid amount"
    if (!form.date) e.date = "Required"
    if (!form.type) e.type = "Required"
    if (!form.method) e.method = "Required"
    if (hasAnyBudgetForCategory && form.date && !hasValidBudgetForDate) {
      e.category = `No active ${form.category} budget for ${format(form.date, "MMM yyyy")}`
    }
    return e
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setSaving(true)
    try {
      await onSave(transaction.id, {
        transaction: form.transaction.trim(),
        category: form.category,
        amount: Number(form.amount),
        date: format(form.date!, "yyyy-MM-dd"),
        type: form.type,
        method: form.method,
        status: form.status,
      })
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to update transaction:", err)
    } finally {
      setSaving(false)
    }
  }

  // Category split: budgeted on top, rest below
  const budgetedInList = BASE_CATEGORIES.filter((c) => budgetCategories.includes(c))
  const unbudgetedInList = BASE_CATEGORIES.filter((c) => !budgetCategories.includes(c))
  const customBudgeted = budgetCategories.filter((c) => !BASE_CATEGORIES.includes(c))
  const categoryBudgets = React.useMemo(
    () => budgetRows.filter((budget) => budget.category === form.category),
    [budgetRows, form.category]
  )
  const hasAnyBudgetForCategory = categoryBudgets.length > 0
  const hasValidBudgetForDate =
    !!form.date &&
    categoryBudgets.some((budget) =>
      isBudgetValidForTransaction(budget, format(form.date as Date, "yyyy-MM-dd"))
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Update the details below to modify this transaction.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">

          {/* Transaction Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-transaction">Transaction Name</Label>
            <Input
              id="edit-transaction"
              placeholder="e.g. Salary Credit"
              value={form.transaction}
              onChange={(e) => update("transaction", e.target.value)}
            />
            {errors.transaction && <p className="text-xs text-red-400">{errors.transaction}</p>}
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {/* Budgeted first */}
                  {(budgetedInList.length > 0 || customBudgeted.length > 0) && (
                    <>
                      <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wide">
                        Budgeted
                      </div>
                      {customBudgeted.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                      {budgetedInList.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                      <SelectSeparator />
                    </>
                  )}

                  {unbudgetedInList.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Debit / Credit" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="Credit">Credit</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-400">{errors.type}</p>}
            </div>
          </div>
          {/* Budget warning */}
          {hasAnyBudgetForCategory && form.date && !hasValidBudgetForDate && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2.5 text-xs text-amber-300 animate-in fade-in slide-in-from-top-1 duration-200">  
              <AlertTriangleIcon className="h-4 w-4 shrink-0" />
              No active budget found for{" "}
              <span className="font-medium">
                {form.category}
              </span>{" "}
              in {format(form.date, "MMM yyyy")}
            </div>
          )}
          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-amount">Amount (₹)</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="e.g. 5000"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
              />
              {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {form.date ? format(form.date, "dd MMM yyyy") : <span className="text-muted-foreground">Pick a date</span>}
                    <ChevronDownIcon className="size-4 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" avoidCollisions={false} className="w-auto p-0 z-50">
                  <Calendar mode="single" selected={form.date} onSelect={(d) => update("date", d)} defaultMonth={form.date} />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
            </div>
          </div>

          {/* Method + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Payment Method</Label>
              <Select value={form.method} onValueChange={(v) => update("method", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.method && <p className="text-xs text-red-400">{errors.method}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        <DialogFooter showCloseButton className="pt-2">
          <Button onClick={handleSubmit} disabled={saving} className="cursor-pointer">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
