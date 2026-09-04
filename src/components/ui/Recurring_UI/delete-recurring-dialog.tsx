"use client"

import * as React from "react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import type { RecurringTransaction } from "@/components/hooks/use-recurring"

interface Props {
    recurring: RecurringTransaction
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (id: string) => Promise<void>
}

export function DeleteRecurringDialog({ recurring, open, onOpenChange, onConfirm }: Props) {
    const [deleting, setDeleting] = React.useState(false)

    const handleConfirm = async () => {
        setDeleting(true)
        try {
            await onConfirm(recurring.id)
            onOpenChange(false)
        } catch (err) {
            console.error("Failed to delete recurring:", err)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-red-500/40">
                            <IconAlertTriangle className="size-5 text-red-100" />
                        </div>
                        <div>
                            <DialogTitle>Delete Autopay Rule</DialogTitle>
                            <DialogDescription className="mt-0.5">This action cannot be undone.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                    <p className="text-muted-foreground">You are about to permanently delete:</p>
                    <p className="mt-1 font-semibold text-foreground">{recurring.transaction}</p>
                    <p className="text-muted-foreground">
                        ₹{recurring.amount.toLocaleString("en-IN")} · {recurring.frequency} · {recurring.category}
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting} className="cursor-pointer">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={deleting}
                        className="cursor-pointer bg-red-500/40 hover:bg-red-500/20 hover:text-text-primary"
                    >
                        {deleting ? "Deleting..." : "Delete Autopay"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}