"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type React from "react"

/* ============================= */
/*         MAIN CARD             */
/* ============================= */

function BudgetCard({ className, ...props }: React.ComponentProps<"div">) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState("")

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -4
    const rotateY = ((x - centerX) / centerX) * 4

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`
    )
  }

  function handleMouseLeave() {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)")
  }

  return (
    <div className="perspective-[1000px]">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform }}
        className={cn(
          "relative w-full max-w-md rounded-3xl",
          "border border-border",
          "bg-surface-secondary",
          "backdrop-blur-xl",
          "p-8",
          "shadow-[0_10px_40px_rgba(0,0,0,0.6)]",
          "transition-transform duration-300 ease-out will-change-transform",
          className
        )}
        {...props}
      />
    </div>
  )
}

/* ============================= */
/*         HEADER                */
/* ============================= */

function BudgetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-4 mb-6", className)} {...props} />
  )
}

/* ============================= */
/*         ICON BOX              */
/* ============================= */

function IconBox({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-2xl",
        "bg-surface-secondary text-text-primary",
        className
      )}
      {...props}
    />
  )
}

/* ============================= */
/*     PLACEHOLDER LINES         */
/* ============================= */

function PlaceholderLines() {
  return (
    <div className="space-y-2 w-full">
      <div className="h-3 w-32 rounded-full bg-surface-secondary" />
      <div className="h-3 w-20 rounded-full bg-surface-secondary" />
    </div>
  )
}

/* ============================= */
/*        PROGRESS + SLIDER      */
/* ============================= */

function BudgetProgress({
  limit = 99999,
}: {
  limit?: number
}) {
  const [spent, setSpent] = useState(73716)

  const percentage = (spent / limit) * 100
  const isWarning = percentage >= 80

  return (
    <div className="space-y-6 mb-8">

      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isWarning ? "bg-red-500" : "bg-white/80"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={limit}
        value={spent}
        onChange={(e) => setSpent(Number(e.target.value))}
        className="w-full cursor-pointer accent-white"
      />

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="h-20 rounded-2xl border border-border bg-surface-secondary flex flex-col justify-center px-4" >

          <span className="text-xs text-text-muted">Spent</span>
          <span className={cn(
            "text-lg font-medium",
            isWarning ? "text-red-400" : "text-text-primary"
          )}>
            ₹ {spent.toLocaleString()}
          </span>
        </div>

        <div className="h-20 rounded-2xl border border-border bg-surface-secondary flex flex-col justify-center px-4">
          <span className="text-xs text-text-muted">Budget</span>
          <span className="text-lg font-medium text-text-primary">
            ₹ {limit.toLocaleString()}
          </span>
        </div>
      </div>

    </div>
  )
}

/* ============================= */
/*          STATS GRID           */
/* ============================= */

function BudgetStats({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid grid-cols-2 gap-6", className)} {...props} />
  )
}

/* ============================= */
/*         STAT BOX              */
/* ============================= */

function StatBox({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-20 rounded-2xl border border-border bg-surface-secondary",
        className
      )}
      {...props}
    />
  )
}

export {
  BudgetCard,
  BudgetHeader,
  IconBox,
  PlaceholderLines,
  BudgetProgress,
  BudgetStats,
  StatBox,
}