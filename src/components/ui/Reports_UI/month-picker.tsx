// src/components/ui/Reports_UI/month-picker.tsx
"use client"
import { Calendar, ChevronDown } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { useLanguage } from "@/context/LanguageContext"

const MONTH_KEYS = [
  "month.january", "month.february", "month.march", "month.april", "month.may", "month.june",
  "month.july", "month.august", "month.september", "month.october", "month.november", "month.december"
]

const MONTHS_FALLBACK = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

interface Props {
  value: string
  onChange: (m: string) => void
}

export function MonthPicker({ value, onChange }: Props) {
  const { t } = useLanguage()
  const [year, month] = value.split("-").map(Number)

  const currentYear = new Date().getFullYear()

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  const monthName = t(MONTH_KEYS[month - 1]) || MONTHS_FALLBACK[month - 1]
  const label = `${monthName} ${year}`

  const selectMonth = (m: number) => {
    const formatted = `${year}-${String(m + 1).padStart(2, "0")}`
    onChange(formatted)
  }

  const selectYear = (y: number) => {
    const formatted = `${y}-${String(month).padStart(2, "0")}`
    onChange(formatted)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 px-4 rounded-full border-[rgba(255,255,255,0.06)] bg-[var(--surface-card)] hover:bg-surface-secondary flex items-center gap-2 text-sm"
        >
          <Calendar size={16} className="text-muted-foreground" />
          {label}
          <ChevronDown size={14} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-3 space-y-3">

        {/* Year Selector */}
        <div className="grid grid-cols-3 gap-1">
          {years.map((y) => (
            <Button
              key={y}
              variant={y === year ? "default" : "ghost"}
              size="sm"
              onClick={() => selectYear(y)}
            >
              {y}
            </Button>
          ))}
        </div>

        {/* Month Selector */}
        <div className="grid grid-cols-3 gap-1">
          {MONTH_KEYS.map((k, i) => {
            const name = t(k) || MONTHS_FALLBACK[i]
            return (
              <Button
                key={k}
                variant={i + 1 === month ? "default" : "ghost"}
                size="sm"
                onClick={() => selectMonth(i)}
              >
                {name.slice(0, 3)}
              </Button>
            )
          })}
        </div>

      </PopoverContent>
    </Popover>
  )
}
