// src/components/ui/Settings_UI/danger-panel.tsx
"use client"

import { AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, FieldRow } from "./settings-ui"

interface DangerPanelProps {
  onDeleteAccount: () => void
}

export function DangerPanel({ onDeleteAccount }: DangerPanelProps) {
  return (
    <div className="space-y-4">

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.03]">
        <AlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-300">Irreversible Actions</p>
          <p className="text-xs text-red-400/70 mt-0.5 leading-relaxed">
            Actions on this page cannot be undone. Your data will be permanently lost.
          </p>
        </div>
      </div>

      {/* Delete card */}
      <Card className="border-red-500/20 bg-red-500/[0.02]">
        <FieldRow
          icon={Trash2}
          label="Delete Account"
          description="Permanently removes your account, transactions, budgets, and all data. No recovery possible."
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="cursor-pointer gap-2 h-10 w-full sm:w-auto
                  bg-red-500/10 border border-red-500/30
                  hover:bg-red-500/20 hover:border-red-500/50
                  text-red-400 font-semibold">
                <Trash2 className="size-4" /> Delete Account
              </Button>
            </AlertDialogTrigger>

            {/* 🔥 IMPROVED MODAL */}
            <AlertDialogContent className="border-border bg-[#0b0b0b] shadow-xl shadow-red-500/5">
              <AlertDialogHeader>

                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/25">
                    <Trash2 className="size-5 text-red-400" />
                  </div>

                  <AlertDialogTitle className="text-xl font-semibold text-text-primary">
                    Delete your account?
                  </AlertDialogTitle>
                </div>

                {/* Description */}
                <AlertDialogDescription className="leading-relaxed text-text-secondary">
                  This permanently removes your account and{" "}
                  <span className="text-text-primary font-medium">all data</span> — transactions,
                  budgets, goals, everything.
                  <br />
                  <span className="text-red-400 font-medium">
                    This action cannot be undone.
                  </span>
                </AlertDialogDescription>

              </AlertDialogHeader>

              {/* Buttons */}
              <AlertDialogFooter className="mt-4 flex justify-end gap-3">

                <AlertDialogCancel
                  className="cursor-pointer h-10 px-4
                    bg-surface-secondary border border-border
                    text-text-secondary hover:bg-surface-secondary">
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={onDeleteAccount}
                  className="cursor-pointer h-10 px-5
                    bg-red-500 hover:bg-red-600
                    text-text-primary font-semibold shadow-lg shadow-red-500/20">
                  Delete Account
                </AlertDialogAction>

              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </FieldRow>
      </Card>

    </div>
  )
}