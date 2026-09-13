"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Label }  from "@/components/ui/Dashboard_UI/label"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/Dashboard_UI/select"
import type { RecurringTransaction, RecurringInput } from "@/components/hooks/use-recurring"
import { useLanguage } from "@/context/LanguageContext"

const CATEGORIES  = ["Food","Shopping","Transport","Utilities","Health","Entertainment","Subscription","Income","Other"]
const METHODS     = ["Cash","UPI","Bank Transfer","Credit Card","Debit Card","Net Banking"]
const FREQUENCIES = ["daily","weekly","monthly","yearly"] as const

interface Props {
  recurring:    RecurringTransaction
  open:         boolean
  onOpenChange: (open: boolean) => void
  onSave:       (id: string, updates: Partial<RecurringInput>) => Promise<unknown>
}

export function EditRecurringDialog({ recurring, open, onOpenChange, onSave }: Props) {
  const { t, language } = useLanguage()
  const [form, setForm] = React.useState({
    transaction: recurring.transaction,
    category:    recurring.category,
    amount:      String(recurring.amount),
    type:        recurring.type,
    method:      recurring.method,
    frequency:   recurring.frequency,
    start_date:  recurring.start_date,
    end_date:    recurring.end_date ?? "",
  })
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    setForm({
      transaction: recurring.transaction,
      category:    recurring.category,
      amount:      String(recurring.amount),
      type:        recurring.type,
      method:      recurring.method,
      frequency:   recurring.frequency,
      start_date:  recurring.start_date,
      end_date:    recurring.end_date ?? "",
    })
    setErrors({})
  }, [recurring])

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!form.transaction.trim())           e.transaction = "Required"
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Enter a valid amount"
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      await onSave(recurring.id, {
        transaction: form.transaction.trim(),
        category:    form.category,
        amount:      Number(form.amount),
        type:        form.type,
        method:      form.method,
        frequency:   form.frequency as RecurringInput["frequency"],
        start_date:  form.start_date,
        end_date:    form.end_date || null,
      })
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to update recurring:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("form.editAutopayRule")}</DialogTitle>
          <DialogDescription>{t("form.editDetails")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input
              value={form.transaction}
              onChange={(e) => set("transaction", e.target.value)}
              placeholder="e.g. Netflix, Salary"
            />
            {errors.transaction && <p className="text-xs text-red-400">{errors.transaction}</p>}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label>{t("form.amountLabel")}</Label>
            <Input
              type="number" min={1}
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
            {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("tx.category")}</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("tx.type")}</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="Debit">Debit</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Method + Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("tx.method")}</Label>
              <Select value={form.method} onValueChange={(v) => set("method", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("tx.frequency")}</Label>
              <Select value={form.frequency} onValueChange={(v) => set("frequency", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date + End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("tx.startDate")}</Label>
              <Input
                type="text" placeholder="YYYY-MM-DD"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("tx.endDate")} <span className="text-muted-foreground text-xs">({t("tx.optional")})</span></Label>
              <Input
                type="text" placeholder="YYYY-MM-DD"
                value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={saving} className="cursor-pointer">
            {saving ? t("form.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}