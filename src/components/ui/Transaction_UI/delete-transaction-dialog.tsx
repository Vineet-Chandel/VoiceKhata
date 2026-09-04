// src/components/ui/Transaction_UI/delete-transaction-dialog.tsx
"use client"

import * as React from "react"
import { IconAlertTriangle } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import type { Transaction } from "@/components/hooks/use-transactions"

interface DeleteTransactionDialogProps {
    transaction: Transaction
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (id: number) => Promise<void>
}

export function DeleteTransactionDialog({
    transaction,
    open,
    onOpenChange,
    onConfirm,
}: DeleteTransactionDialogProps) {
    const [deleting, setDeleting] = React.useState(false)

    const handleConfirm = async () => {
        setDeleting(true)
        try {
            await onConfirm(transaction.id)
            onOpenChange(false)
        } catch (err) {
            console.error("Failed to delete transaction:", err)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-red-500/40">
                            <IconAlertTriangle className="size-5 text-red-100" />
                        </div>
                        <div>
                            <DialogTitle>Delete Transaction</DialogTitle>
                            <DialogDescription className="mt-0.5">
                                This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                    <p className="text-muted-foreground">
                        You are about to permanently delete:
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                        {transaction.transaction}
                    </p>
                    <p className="text-muted-foreground">
                        ₹{transaction.amount.toLocaleString()} &middot; {transaction.date} &middot; {transaction.category}
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-2 ">
                    <Button className="cursor-pointer"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    <Button className="cursor-pointer bg-red-500/40 hover:bg-red-500/20 hover:text-text-primary"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete Transaction"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}