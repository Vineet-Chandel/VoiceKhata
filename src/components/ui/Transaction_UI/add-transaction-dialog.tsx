// src/components/ui/Transaction_UI/add-transaction-dialog.tsx
"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import {
  ChevronDownIcon, ScanIcon, Loader2Icon, ImageIcon,
  AlertTriangleIcon, InfinityIcon, PlusIcon,
} from "lucide-react"
import { IconPlus } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/Dashboard_UI/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
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
import { scanReceipt, scanReceiptMulti } from "@/lib/scan-receipt"
import { isBudgetValidForTransaction } from "@/lib/budget-utils"

type TransactionInput = Omit<Transaction, "id" | "firebase_uid" | "created_at">

const BASE_CATEGORIES = [
  "Income", "Subscription", "Food", "Shopping",
  "Utilities", "Transport", "Health", "Entertainment", "Other",
]
const METHODS = [
  "Bank Transfer", "Credit Card", "Debit Card", "UPI", "Cash", "Net Banking",
]

const emptyForm = {
  transaction: "",
  category: "",
  amount: "",
  date: undefined as Date | undefined,
  type: "",
  method: "",
  status: "Completed",
}

interface Props {
  onAdd: (t: TransactionInput) => Promise<{ error?: string } | undefined>
  budgetCategories?: string[]
  budgetRows?: Budget[]
  onAddBudget?: (b: { category: string; amount: number; duration: string }) => Promise<{ error?: string } | undefined>
  onNavigateToAI?: (seedMessage: string) => void
}

export function AddTransactionDialog({
  onAdd,
  budgetCategories = [],
  budgetRows = [],
  onAddBudget,
  onNavigateToAI,
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [saving, setSaving] = React.useState(false)
  const [scanning, setScanning] = React.useState(false)
  const [scanStatus, setScanStatus] = React.useState<"idle" | "success" | "error" | "low-confidence">("idle")
  const [scanErrorMsg, setScanErrorMsg] = React.useState<string>("")
  const [createBudget, setCreateBudget] = React.useState(false)
  const [createTimelessBudget, setCreateTimelessBudget] = React.useState(true)

  const cameraInputRef = React.useRef<HTMLInputElement>(null)
  const mediaInputRef = React.useRef<HTMLInputElement>(null)

  const budgetedInList = BASE_CATEGORIES.filter((c) => budgetCategories.includes(c))
  const unbudgetedInList = BASE_CATEGORIES.filter((c) => !budgetCategories.includes(c))
  const customBudgeted = budgetCategories.filter((c) => !BASE_CATEGORIES.includes(c))

  const categoryBudgets = React.useMemo(
    () => budgetRows.filter((b) => b.category === form.category),
    [budgetRows, form.category]
  )
  const hasAnyBudgetForCategory = categoryBudgets.length > 0
  const isUnlistedCategory = Boolean(form.category) && !hasAnyBudgetForCategory
  const txDateForValidation = form.date ? format(form.date, "yyyy-MM-dd") : ""
  const hasValidBudgetForDate =
    !!txDateForValidation &&
    categoryBudgets.some((budget) =>
      isBudgetValidForTransaction(budget, txDateForValidation)
    )

  const update = (key: keyof typeof emptyForm, value: string | Date | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "", form: "" }))
    if (key === "category") {
      setCreateBudget(false)
      setCreateTimelessBudget(true)
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.transaction.trim()) e.transaction = "Required"
    if (!form.category) e.category = "Required"
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount"
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
      const result = await onAdd({
        transaction: form.transaction.trim(),
        category: form.category,
        amount: Number(form.amount),
        date: format(form.date!, "yyyy-MM-dd"),
        type: form.type,
        method: form.method,
        status: form.status,
      })

      if (result?.error) {
        setErrors((prev) => ({ ...prev, form: result.error as string }))
        return
      }

      if (isUnlistedCategory && createBudget && onAddBudget) {
        const budgetResult = await onAddBudget({
          category: form.category,
          amount: Number(form.amount),
          duration: createTimelessBudget ? "timeless" : "monthly",
        })
        if (budgetResult?.error) {
          setErrors((prev) => ({ ...prev, form: budgetResult.error as string }))
          return
        }
      }

      setForm(emptyForm)
      setErrors({})
      setScanStatus("idle")
      setScanErrorMsg("")
      setCreateBudget(false)
      setCreateTimelessBudget(true)
      setOpen(false)
    } catch (err) {
      console.error("Failed to add transaction:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setForm(emptyForm)
      setErrors({})
      setScanStatus("idle")
      setScanErrorMsg("")
      setCreateBudget(false)
      setCreateTimelessBudget(true)
    }
  }

  const handleCameraScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    setScanning(true)
    setScanStatus("idle")
    setScanErrorMsg("")
    try {
      const result = await scanReceipt(file)
      let parsedDate: Date | undefined
      if (result.date) {
        try {
          parsedDate = parse(result.date, "yyyy-MM-dd", new Date())
          if (isNaN(parsedDate.getTime())) parsedDate = undefined
        } catch { parsedDate = undefined }
      }
      setForm((prev) => ({
        transaction: result.transaction || prev.transaction,
        category: result.category || prev.category,
        amount: result.amount ? String(result.amount) : prev.amount,
        date: parsedDate ?? prev.date,
        type: result.type || prev.type,
        method: result.method || prev.method,
        status: prev.status,
      }))
      setScanStatus(result.confidence === "low" ? "low-confidence" : "success")
    } catch (err: any) {
      console.error("Camera scan failed:", err)
      setScanErrorMsg(err?.message || "AI scan unavailable, please fill manually")
      setScanStatus("error")
    } finally {
      setScanning(false)
    }
  }

  const handleMediaImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ""
    setScanning(true)
    setScanStatus("idle")
    setScanErrorMsg("")
    try {
      if (files.length > 1) {
        const allResults: Array<{ file: string; transactions: any[] }> = []
        for (let i = 0; i < files.length; i++) {
          try {
            const result = await scanReceiptMulti(files[i])
            if (result.transactions.length) {
              allResults.push({ file: files[i].name, transactions: result.transactions })
            }
          } catch (err) {
            console.error(`[import-media] Scan failed for ${files[i].name}:`, err)
          }
        }
        setScanning(false)
        if (!allResults.length) {
          setScanErrorMsg("AI scan unavailable, please fill manually")
          setScanStatus("error")
          return
        }
        const seedMessage = buildBulkMessage(allResults)
        setOpen(false)
        onNavigateToAI?.(seedMessage)
        return
      }

      const result = await scanReceiptMulti(files[0])
      setScanning(false)
      if (!result.transactions.length) {
        setScanErrorMsg("AI scan unavailable, please fill manually")
        setScanStatus("error")
        return
      }

      if (result.transactions.length > 1) {
        const seedMessage = buildBulkMessage([{ file: files[0].name, transactions: result.transactions }])
        setOpen(false)
        onNavigateToAI?.(seedMessage)
        return
      }

      const t = result.transactions[0]
      let parsedDate: Date | undefined
      if (t.date) {
        try {
          parsedDate = parse(t.date, "yyyy-MM-dd", new Date())
          if (isNaN(parsedDate.getTime())) parsedDate = undefined
        } catch { parsedDate = undefined }
      }
      setForm((prev) => ({
        transaction: t.transaction || prev.transaction,
        category: t.category || prev.category,
        amount: t.amount ? String(t.amount) : prev.amount,
        date: parsedDate ?? prev.date,
        type: t.type || prev.type,
        method: t.method || prev.method,
        status: prev.status,
      }))
      setScanStatus(result.confidence === "low" ? "low-confidence" : "success")
    } catch (err: any) {
      console.error("Media import scan failed:", err)
      setScanErrorMsg(err?.message || "AI scan unavailable, please fill manually")
      setScanStatus("error")
    } finally {
      setScanning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="size-4 mr-1" />Add Transaction
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Fill in the details or scan a receipt to auto-fill.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">

          {/* ── Scan status banners ── */}
          {scanStatus === "success" && (
            <div className="flex items-center gap-2.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3.5 py-2.5 text-xs text-green-400">
              <div className="size-5 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 12 12" className="size-3 fill-green-400"><path d="M10 3L5 8.5 2 5.5" /><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </div>
              Receipt scanned successfully — please review all fields.
            </div>
          )}
          {scanStatus === "low-confidence" && (
            <div className="flex items-center gap-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 text-xs text-amber-400">
              <AlertTriangleIcon className="size-3.5 shrink-0" />
              Receipt scanned but some fields may be incorrect — please review carefully.
            </div>
          )}
          {scanStatus === "error" && (
            <div className="flex items-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-400">
              <div className="size-5 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 text-red-400 font-bold text-[10px]">✕</div>
              {scanErrorMsg || "AI scan unavailable, please fill manually."}
            </div>
          )}

          {/* ── Transaction Name ── */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transaction">Transaction Name</Label>
            <Input
              id="transaction"
              placeholder="e.g. Salary Credit"
              value={form.transaction}
              onChange={(e) => update("transaction", e.target.value)}
            />
            {errors.transaction && <p className="text-xs text-red-400">{errors.transaction}</p>}
          </div>

          {/* ── Category + Type ── */}
          <div className="grid grid-cols-2 gap-3">

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>

              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent position="popper" sideOffset={4}>
                  {(budgetedInList.length > 0 || customBudgeted.length > 0) && (
                    <>
                      <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wide">
                        Budgeted
                      </div>

                      {customBudgeted.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}

                      {budgetedInList.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}

                      <SelectSeparator />
                    </>
                  )}

                  {unbudgetedInList.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.category && (
                <p className="text-xs text-red-400">{errors.category}</p>
              )}
            </div>

            {/* Type */}
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

              {errors.type && (
                <p className="text-xs text-red-400">{errors.type}</p>
              )}
            </div>

            {/* Full Width Budget Card */}
            {isUnlistedCategory && onAddBudget && (
              <div className="col-span-2">
                <div className="mt-1 rounded-xl border border-amber-500/25 bg-amber-500/[0.04] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">

                  {/* Header */}
                  <div className="flex items-start gap-3 p-3">
                    <div className="size-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangleIcon className="size-4 text-amber-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-amber-400/90 leading-tight">
                        No budget for "{form.category}"
                      </p>

                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        Track spending on{" "}
                        <span className="text-amber-400/70 font-medium">
                          "{form.category}"
                        </span>{" "}
                        by creating a budget below.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-amber-500/20 mx-3" />

                  {/* Content */}
                  <div className="p-3 flex flex-col gap-2">

                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => setCreateBudget(!createBudget)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-lg border transition-all duration-150 text-left",
                        createBudget
                          ? "border-amber-500/30 bg-amber-500/[0.06]"
                          : "border-border bg-muted/40 hover:bg-muted/60"
                      )}
                    >
                      <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <PlusIcon className="size-3.5 shrink-0" />

                        <span>
                          Also create a budget for{" "}
                          <span className="text-amber-400 font-medium">
                            "{form.category}"
                          </span>
                        </span>
                      </span>

                      {/* Switch */}
                      <div
                        className={cn(
                          "relative shrink-0 w-8 h-[18px] rounded-full border transition-all duration-200 ml-2",
                          createBudget
                            ? "bg-amber-400/20 border-amber-400/40"
                            : "bg-muted border-border"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-[2px] size-3 rounded-full transition-all duration-200",
                            createBudget
                              ? "bg-amber-400 left-[16px]"
                              : "bg-muted-foreground/50 left-[2px]"
                          )}
                        />
                      </div>
                    </button>

                    {/* Budget Type */}
                    {createBudget && (
                      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.03]">

                        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <InfinityIcon className="size-3.5 shrink-0" />
                          Budget type
                        </span>

                        <div className="flex gap-1.5 shrink-0">
                          {(["Timeless", "Monthly"] as const).map((type) => {
                            const isActive =
                              (type === "Timeless") === createTimelessBudget

                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() =>
                                  setCreateTimelessBudget(type === "Timeless")
                                }
                                className={cn(
                                  "px-2.5 py-[3px] rounded-full border text-[11px] font-medium transition-all duration-150",
                                  isActive
                                    ? "bg-amber-400/15 text-amber-400 border-amber-400/30"
                                    : "bg-transparent text-muted-foreground border-border hover:border-border/80"
                                )}
                              >
                                {type}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>


        {/* ── Amount + Date ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
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
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {form.date
                    ? format(form.date, "dd MMM yyyy")
                    : <span className="text-muted-foreground">Pick a date</span>}
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

        {/* ── Method + Status ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Payment Method</Label>
            <Select value={form.method} onValueChange={(v) => update("method", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
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

        {errors.form && (
          <p className="text-xs text-red-400 -mt-1">{errors.form}</p>
        )}
      </div>

      <DialogFooter>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraScan} className="hidden" />
        <input ref={mediaInputRef} type="file" accept="image/*" multiple onChange={handleMediaImport} className="hidden" />

        {/* Scan Receipt — mobile only */}
        <Button
          type="button"
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          disabled={scanning || saving}
          className="md:hidden"
        >
          {scanning
            ? <><Loader2Icon className="size-4 mr-1.5 animate-spin" />Scanning...</>
            : <><ScanIcon className="size-4 mr-1.5" />Scan Receipt</>
          }
        </Button>

        {/* Import Media */}
        <Button
          type="button"
          variant="outline"
          onClick={() => mediaInputRef.current?.click()}
          disabled={scanning || saving}
        >
          <ImageIcon className="size-4 mr-1.5" />Import Media
        </Button>

        <Button onClick={handleSubmit} disabled={saving || scanning}>
          {saving ? "Saving..." : "Add Transaction"}
        </Button>
      </DialogFooter>
    </DialogContent>
    </Dialog >
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────
function buildBulkMessage(
  results: Array<{ file: string; transactions: any[] }>
): string {
  const allTx = results.flatMap((r) => r.transactions as any[])
  if (!allTx.length) return ""
  const lines = allTx.map((t: any) => {
    const name = t.transaction ?? "Unknown"
    const amount = t.amount ? `₹${t.amount}` : "unknown amount"
    const date = t.date ?? "today"
    const cat = t.category ?? "Other"
    const method = t.method ?? "Cash"
    const type = t.type ?? "Debit"
    return `name "${name}", amount ${amount}, date ${date}, category ${cat}, method ${method}, type ${type}`
  })
  return (
    `Bulk import ${allTx.length} transaction${allTx.length > 1 ? "s" : ""}:\n` +
    lines.map((l, i) => `${i + 1}. ${l}`).join("\n")
  )
}
