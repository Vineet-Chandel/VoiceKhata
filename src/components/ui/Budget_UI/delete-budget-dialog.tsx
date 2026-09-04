// src/components/ui/Budget_UI/delete-budget-dialog.tsx
"use client"

import * as React from "react"
import { Trash2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogFooter,
} from "@/components/ui/dialog"
import type { Budget } from "@/components/hooks/use-budgets"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n)

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-500", Shopping: "bg-pink-500", Transport: "bg-blue-500",
  Utilities: "bg-yellow-500", Health: "bg-green-500",
  Entertainment: "bg-purple-500", Subscription: "bg-cyan-500", Other: "bg-gray-500",
}

interface Props {
  budget:       Budget
  open:         boolean
  onOpenChange: (open: boolean) => void
  onConfirm:    (id: string) => Promise<void>
}

export function DeleteBudgetDialog({ budget, open, onOpenChange, onConfirm }: Props) {
  const [deleting, setDeleting] = React.useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await onConfirm(budget.id)
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to delete budget:", err)
    } finally {
      setDeleting(false)
    }
  }

  const dotColor = CATEGORY_COLORS[budget.category] ?? "bg-gray-500"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden border-border bg-surface">

        {/* Top section */}
        <div className="p-6 pb-5">
          <div className="size-[42px] rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Trash2 size={17} className="text-red-400" />
          </div>
          <p className="text-base font-medium text-text-primary">Delete budget</p>
          <p className="text-sm text-text-muted mt-1">
            This will permanently remove the budget and cannot be undone.
          </p>
        </div>

        {/* Budget card */}
        <div className="mx-6 mb-5 bg-surface-secondary border border-border rounded-[10px] px-4 py-3.5 flex items-center gap-3">
          <span className={`size-2 rounded-full flex-shrink-0 ${dotColor}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{budget.category}</p>
            <p className="text-xs text-text-muted mt-0.5">
              {budget.month} · {fmt(budget.spent)} spent
            </p>
          </div>
          <p className="text-sm font-medium text-text-secondary flex-shrink-0">
            {fmt(budget.amount)}
          </p>
        </div>

        {/* Info note */}
        <div className="mx-6 mb-5 flex items-start gap-2">
          <Info size={14} className="text-yellow-400/70 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/35 leading-relaxed">
            Deleting this budget will not affect your transaction history. Only the spending limit will be removed.
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="flex-1 h-9 bg-surface-secondary border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-text-primary border-0 gap-1.5"
            onClick={handleConfirm}
            disabled={deleting}
          >
            <Trash2 size={14} />
            {deleting ? "Deleting..." : "Delete budget"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}