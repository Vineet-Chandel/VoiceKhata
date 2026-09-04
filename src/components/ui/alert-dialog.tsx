// src/components/ui/alert-dialog.tsx
// Built using the same Dialog primitives from your existing dialog.tsx
"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// ── Re-export as AlertDialog API ───────────────────────────────

const AlertDialog = Dialog
const AlertDialogTrigger = DialogTrigger

function AlertDialogContent({
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    // showCloseButton=false: alert dialogs use explicit Cancel/Action buttons
    <DialogContent showCloseButton={false} {...props}>
      {children}
    </DialogContent>
  )
}

const AlertDialogHeader = DialogHeader
const AlertDialogTitle  = DialogTitle
const AlertDialogDescription = DialogDescription

function AlertDialogFooter({
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter showCloseButton={false} {...props}>
      {children}
    </DialogFooter>
  )
}

/** The "confirm" button — styled destructive by default */
function AlertDialogAction({
  children,
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { onClick?: () => void }) {
  return (
    <DialogClose asChild>
      <Button
        variant="destructive"
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </Button>
    </DialogClose>
  )
}

/** The "cancel" button — closes the dialog */
function AlertDialogCancel({
  children = "Cancel",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <DialogClose asChild>
      <Button variant="outline" {...props}>
        {children}
      </Button>
    </DialogClose>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
}