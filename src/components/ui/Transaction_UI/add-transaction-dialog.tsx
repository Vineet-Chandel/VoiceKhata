// src/components/ui/Transaction_UI/add-transaction-dialog.tsx
"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import {
  ChevronDownIcon, ScanIcon, Loader2Icon, ImageIcon,
  AlertTriangleIcon, PlusIcon, Mic, Edit3, Camera, Check, ArrowDownRight, ArrowUpRight
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
import { VoiceActionBanner } from "@/components/ui/Dashboard_UI/voice-action-banner"

type TransactionInput = Omit<Transaction, "id" | "firebase_uid" | "created_at">

const BASE_CATEGORIES = [
  "Income", "Subscription", "Food", "Shopping",
  "Utilities", "Transport", "Health", "Entertainment", "Other",
]
const METHODS = [
  "UPI", "Cash", "Bank Transfer", "Credit Card", "Debit Card", "Net Banking",
]

const emptyForm = {
  transaction: "",
  category: "Shopping",
  amount: "",
  date: new Date() as Date | undefined,
  type: "Credit",
  method: "UPI",
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
  const [mode, setMode] = React.useState<"voice" | "manual" | "scan">("voice")
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const [form, setForm] = React.useState(emptyForm)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [saving, setSaving] = React.useState(false)
  const [scanning, setScanning] = React.useState(false)
  const [scanStatus, setScanStatus] = React.useState<"idle" | "success" | "error" | "low-confidence">("idle")
  const [scanErrorMsg, setScanErrorMsg] = React.useState<string>("")
  const [ocrFoundData, setOcrFoundData] = React.useState<any>(null)

  const cameraInputRef = React.useRef<HTMLInputElement>(null)
  const mediaInputRef = React.useRef<HTMLInputElement>(null)

  const update = (key: keyof typeof emptyForm, value: string | Date | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "", form: "" }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.transaction.trim()) e.transaction = "Person / Description is required"
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount"
    if (!form.date) e.date = "Date is required"
    if (!form.type) e.type = "Type is required"
    return e
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      const result = await onAdd({
        transaction: form.transaction.trim(),
        category: form.category || (form.type === "Credit" ? "Income" : "Shopping"),
        amount: Number(form.amount),
        date: format(form.date!, "yyyy-MM-dd"),
        type: form.type,
        method: form.method || "UPI",
        status: form.status || "Completed",
      })

      if (result?.error) {
        setErrors((prev) => ({ ...prev, form: result.error as string }))
        return
      }

      setForm(emptyForm)
      setErrors({})
      setScanStatus("idle")
      setScanErrorMsg("")
      setOcrFoundData(null)
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
      setOcrFoundData(null)
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
      setOcrFoundData({
        vendor: result.transaction || "Merchant",
        amount: result.amount || 0,
        date: result.date || "Today",
        type: result.type || "Debit",
        confidence: result.confidence
      })
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
      const result = await scanReceiptMulti(files[0])
      setScanning(false)
      if (!result.transactions.length) {
        setScanErrorMsg("No transaction detected, please fill manually")
        setScanStatus("error")
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
      setOcrFoundData({
        vendor: t.transaction || "Merchant",
        amount: t.amount || 0,
        date: t.date || "Today",
        type: t.type || "Debit",
        confidence: result.confidence
      })
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
        <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] bg-[#3949AB] hover:bg-[#29347F] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer">
          <PlusIcon className="size-4" />
          <span>Record Entry</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px] bg-[#0F131C] border border-[#1E2638] rounded-[14px] p-6 shadow-2xl text-[#F1F5F9]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold text-[#F1F5F9]">
            Record Transaction
          </DialogTitle>
          <DialogDescription className="text-xs text-[#94A3B8]">
            Choose your preferred entry method: Voice, Manual, or Receipt OCR.
          </DialogDescription>
        </DialogHeader>

        {/* ── 3-Mode Segmented Control per Section 20 ── */}
        <div className="flex items-center bg-[#07090E] p-1 rounded-[10px] border border-[#1E2638] my-2">
          <button
            type="button"
            onClick={() => setMode("voice")}
            className={cn(
              "flex-1 py-1.5 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
              mode === "voice"
                ? "bg-[#1E2337] text-[#818CF8] shadow-xs"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            )}
          >
            <Mic size={14} />
            <span>Voice (Default)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={cn(
              "flex-1 py-1.5 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
              mode === "manual"
                ? "bg-[#1E2337] text-[#818CF8] shadow-xs"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            )}
          >
            <Edit3 size={14} />
            <span>Manual Entry</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("scan")}
            className={cn(
              "flex-1 py-1.5 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
              mode === "scan"
                ? "bg-[#1E2337] text-[#818CF8] shadow-xs"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            )}
          >
            <Camera size={14} />
            <span>Scan Receipt</span>
          </button>
        </div>

        {/* ── MODE 1: VOICE ──────────────────────────────────────────────────────── */}
        {mode === "voice" && (
          <div className="py-2">
            <VoiceActionBanner
              onAddTransaction={async (t) => {
                const res = await onAdd(t)
                setTimeout(() => setOpen(false), 2000)
                return res
              }}
            />
          </div>
        )}

        {/* ── MODE 2: MANUAL (MINIMUM FIELDS FIRST) ─────────────────────────────── */}
        {mode === "manual" && (
          <div className="space-y-4 py-1">
            {/* Amount */}
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-[#94A3B8]">Amount (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 1200"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                className="h-10 text-base font-bold text-[#F1F5F9] bg-[#07090E] rounded-[8px] border-[#1E2638] focus:border-[#5C6BC0]"
              />
              {errors.amount && <p className="text-xs text-[#F87171]">{errors.amount}</p>}
            </div>

            {/* Direction (Money In / Money Out) */}
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-[#94A3B8]">Money Direction</Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => update("type", "Credit")}
                  className={cn(
                    "flex items-center justify-center gap-2 h-10 rounded-[8px] border text-xs font-semibold transition-all cursor-pointer",
                    form.type === "Credit"
                      ? "bg-[#064E3B]/40 border-[#10B981] text-[#34D399]"
                      : "border-[#1E2638] bg-[#07090E] text-[#94A3B8] hover:bg-[#161B26]"
                  )}
                >
                  <ArrowDownRight size={16} />
                  <span>Money In (Received)</span>
                </button>
                <button
                  type="button"
                  onClick={() => update("type", "Debit")}
                  className={cn(
                    "flex items-center justify-center gap-2 h-10 rounded-[8px] border text-xs font-semibold transition-all cursor-pointer",
                    form.type === "Debit"
                      ? "bg-[#7F1D1D]/40 border-[#EF4444] text-[#F87171]"
                      : "border-[#1E2638] bg-[#07090E] text-[#94A3B8] hover:bg-[#161B26]"
                  )}
                >
                  <ArrowUpRight size={16} />
                  <span>Money Out (Paid)</span>
                </button>
              </div>
            </div>

            {/* Person / Description */}
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-[#94A3B8]">Person / Description</Label>
              <Input
                placeholder="e.g. Ramesh Kumar or Grocery Wholesale"
                value={form.transaction}
                onChange={(e) => update("transaction", e.target.value)}
                className="h-9 text-xs rounded-[8px] bg-[#07090E] border-[#1E2638] text-[#F1F5F9] focus:border-[#5C6BC0]"
              />
              {errors.transaction && <p className="text-xs text-[#F87171]">{errors.transaction}</p>}
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-[#94A3B8]">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-full items-center justify-between rounded-[8px] border border-[#1E2638] bg-[#07090E] px-3 text-xs text-[#F1F5F9]"
                  >
                    {form.date ? format(form.date, "dd MMM yyyy") : "Today"}
                    <ChevronDownIcon className="size-3.5 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-0 z-50 bg-[#0F131C] border border-[#1E2638] text-[#F1F5F9]">
                  <Calendar mode="single" selected={form.date} onSelect={(d) => update("date", d)} defaultMonth={form.date} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Collapsible Advanced Options Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-[#818CF8] hover:underline cursor-pointer"
              >
                {showAdvanced ? "— Hide additional options" : "+ Show additional options (Method, Category)"}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 pt-3 mt-2 border-t border-[#1E2638]">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-[#94A3B8]">Payment Method</Label>
                    <Select value={form.method} onValueChange={(v) => update("method", v)}>
                      <SelectTrigger className="h-9 text-xs bg-[#07090E] border-[#1E2638] text-[#F1F5F9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F131C] border-[#1E2638] text-[#F1F5F9]">
                        {METHODS.map((m) => <SelectItem key={m} value={m} className="text-[#F1F5F9] focus:bg-[#1E2337]">{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-[#94A3B8]">Category</Label>
                    <Select value={form.category} onValueChange={(v) => update("category", v)}>
                      <SelectTrigger className="h-9 text-xs bg-[#07090E] border-[#1E2638] text-[#F1F5F9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F131C] border-[#1E2638] text-[#F1F5F9]">
                        {BASE_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-[#F1F5F9] focus:bg-[#1E2337]">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-3 border-t border-[#1E2638]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 rounded-[8px] border border-[#1E2638] text-xs font-medium text-[#94A3B8] hover:bg-[#161B26] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="h-9 px-5 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                {saving ? "Saving..." : "Save Transaction"}
              </button>
            </DialogFooter>
          </div>
        )}

        {/* ── MODE 3: SCAN RECEIPT (OCR REVIEW-BEFORE-SAVE) ────────────────────── */}
        {mode === "scan" && (
          <div className="space-y-4 py-2">
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraScan} className="hidden" />
            <input ref={mediaInputRef} type="file" accept="image/*" onChange={handleMediaImport} className="hidden" />

            {!ocrFoundData && !scanning && (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#1E2638] rounded-[10px] text-center space-y-3 bg-[#07090E]">
                <Camera size={32} className="text-[#818CF8]" />
                <div>
                  <p className="text-xs font-bold text-[#F1F5F9]">Upload or Snap a Receipt</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Works on counter slips, thermal bills, and wholesale invoices</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="h-8 px-3.5 rounded-[8px] bg-[#5C6BC0] hover:bg-[#4F5B93] text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => mediaInputRef.current?.click()}
                    className="h-8 px-3.5 rounded-[8px] border border-[#1E2638] bg-[#0F131C] text-xs font-medium text-[#F1F5F9] hover:bg-[#161B26] cursor-pointer"
                  >
                    Upload Image
                  </button>
                </div>
              </div>
            )}

            {scanning && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-[#94A3B8]">
                <Loader2Icon size={24} className="text-[#818CF8] animate-spin" />
                <p>Analyzing receipt with Vision OCR...</p>
              </div>
            )}

            {/* OCR Extracted Review Card per Section 21 */}
            {ocrFoundData && !scanning && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-[10px] bg-[#07090E] border border-[#1E2638] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
                    <span className="text-xs font-bold text-[#F1F5F9]">I found from receipt:</span>
                    <span className="text-[10px] font-semibold text-[#34D399] bg-[#064E3B]/30 border border-[#10B981]/30 px-2 py-0.5 rounded-full">
                      Ready to review
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Vendor / Person</span>
                      <span className="font-semibold text-[#F1F5F9]">{form.transaction || "Merchant"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Total Amount</span>
                      <span className="font-bold text-[#34D399] text-sm">₹{Number(form.amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Date</span>
                      <span className="text-[#F1F5F9]">{form.date ? format(form.date, "yyyy-MM-dd") : "Today"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">Type</span>
                      <span className="text-[#F1F5F9] font-medium">{form.type === "Debit" ? "Money Out (Paid)" : "Money In"}</span>
                    </div>
                  </div>
                </div>

                {/* Low Confidence Warning per Section 21 */}
                {scanStatus === "low-confidence" && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#78350F]/30 border border-[#F59E0B]/30 text-xs text-[#FBBF24]">
                    <AlertTriangleIcon size={14} className="shrink-0" />
                    <span>Please check the total. The receipt image was slightly unclear.</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E2638]">
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className="h-8 px-3 rounded-[6px] border border-[#1E2638] text-xs font-medium text-[#94A3B8] hover:bg-[#161B26] cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-1.5 h-8 px-4 rounded-[6px] bg-[#5C6BC0] hover:bg-[#4F5B93] text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    <Check size={14} />
                    <span>Save to Ledger</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}
