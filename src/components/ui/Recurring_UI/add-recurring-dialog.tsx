"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { IconPlus } from "@tabler/icons-react"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/Dashboard_UI/label"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/Dashboard_UI/select"
import type { RecurringInput } from "@/components/hooks/use-recurring"

const CATEGORIES = ["Food", "Shopping", "Transport", "Utilities", "Health", "Entertainment", "Subscription", "Income", "Other"]
const METHODS = ["Cash", "UPI", "Bank Transfer", "Credit Card", "Debit Card", "Net Banking"]
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const

interface Props {
    onAdd: (input: RecurringInput) => Promise<{ error?: string; data?: unknown } | undefined>
}

export function AddRecurringDialog({ onAdd }: Props) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const today = format(new Date(), "yyyy-MM-dd")

    const empty: RecurringInput = {
        transaction: "", category: "Other", amount: 0,
        type: "Debit", method: "UPI", frequency: "monthly",
        start_date: today, next_run: today,
        end_date: null, active: true,
    }

    const [form, setForm] = React.useState<RecurringInput>(empty)
    const [startDate, setStartDate] = React.useState<Date | undefined>(new Date())
    const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)

    const set = <K extends keyof RecurringInput>(field: K, value: RecurringInput[K]) =>
        setForm((prev) => ({ ...prev, [field]: value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.transaction.trim() || form.amount <= 0) return
        setLoading(true)
        const result = await onAdd({
            ...form,
            start_date: startDate ? format(startDate, "yyyy-MM-dd") : today,
            next_run: startDate ? format(startDate, "yyyy-MM-dd") : today,
            end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
        })
        setLoading(false)
        if (!result?.error) {
            setOpen(false)
            setForm(empty)
            setStartDate(new Date())
            setEndDate(undefined)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                    <IconPlus className="h-4 w-4" /> Add Autopay
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New Autopay / Recurring</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            placeholder="e.g. Netflix, Salary, Loan EMI"
                            value={form.transaction}
                            onChange={(e) => set("transaction", e.target.value)}
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Amount (₹)</Label>
                        <Input
                            type="number" min={1} placeholder="e.g. 499"
                            value={form.amount || ""}
                            onChange={(e) => set("amount", parseFloat(e.target.value))}
                            required
                        />
                    </div>

                    {/* Category + Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label>Category</Label>
                            <Select value={form.category} onValueChange={(v) => set("category", v)}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent position="popper" sideOffset={4}>
                                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Type</Label>
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
                            <Label>Method</Label>
                            <Select value={form.method} onValueChange={(v) => set("method", v)}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent position="popper" sideOffset={4}>
                                    {METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Frequency</Label>
                            <Select
                                value={form.frequency}
                                onValueChange={(v) => set("frequency", v as RecurringInput["frequency"])}
                            >
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

                    {/* Start Date + End Date — Popover + Calendar like add-transaction-dialog */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        {startDate
                                            ? format(startDate, "dd MMM yyyy")
                                            : <span className="text-muted-foreground">Pick a date</span>}
                                        <ChevronDownIcon className="size-4 opacity-60" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent side="top" align="start" avoidCollisions={false} className="w-auto p-0 z-50">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(d) => setStartDate(d)}
                                        defaultMonth={startDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>
                                End Date{" "}
                                <span className="text-muted-foreground text-xs">(optional)</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        {endDate
                                            ? format(endDate, "dd MMM yyyy")
                                            : <span className="text-muted-foreground">No end date</span>}
                                        <ChevronDownIcon className="size-4 opacity-60" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent side="top" align="start" avoidCollisions={false} className="w-auto p-0 z-50">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(d) => setEndDate(d)}
                                        defaultMonth={endDate ?? startDate}
                                        disabled={(date) => (startDate ? date < startDate : false)}
                                    />
                                    {endDate && (
                                        <div className="border-t p-2">
                                            <Button
                                                type="button"
                                                variant="ghost" size="sm"
                                                className="w-full text-muted-foreground cursor-pointer"
                                                onClick={() => setEndDate(undefined)}
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="mt-1">
                        {loading ? "Adding…" : "Add Autopay"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}