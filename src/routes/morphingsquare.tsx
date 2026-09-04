"use client"

import { cva } from "class-variance-authority"
import { type HTMLMotionProps, motion } from "framer-motion"
import { cn } from "@/lib/utils"

const morphingSquareVariants = cva(
  "flex items-center justify-center gap-2",
  {
    variants: {
      messagePlacement: {
        bottom: "flex-col",
        top: "flex-col-reverse",
        right: "flex-row",
        left: "flex-row-reverse",
      },
    },
    defaultVariants: {
      messagePlacement: "bottom",
    },
  }
)

export interface MorphingSquareProps {
  message?: string
  messagePlacement?: "top" | "bottom" | "left" | "right"
}

export function MorphingSquare({
  className,
  message,
  messagePlacement = "bottom",
  ...props
}: HTMLMotionProps<"div"> & MorphingSquareProps) {
  return (
    <div className={cn(morphingSquareVariants({ messagePlacement }))}>
      <motion.div
        className={cn("h-10 w-10 bg-foreground", className)}
        animate={{
          borderRadius: ["6%", "50%", "6%"],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        {...props}
      />

      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}