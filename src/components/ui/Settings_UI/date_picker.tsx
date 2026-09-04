"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import type { DropdownProps } from "react-day-picker"

// ── Custom caption dropdown used by react-day-picker ──────────────────────────
function CalendarDropdown({ value, onChange, options = [] }: DropdownProps) {
  const selected = options.find((o) => o.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-sm font-medium
            bg-surface-secondary hover:bg-surface-secondary
            border border-border hover:border-border-secondary
            text-text-primary hover:text-text-primary
            rounded-md transition-all"
        >
          {selected?.label ?? value}
          <ChevronDownIcon className="size-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="max-h-60 overflow-y-auto
          bg-[#1a1a1a] border border-border
          text-text-primary rounded-lg shadow-xl p-1
          scrollbar-thin scrollbar-thumb-white/10"
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() =>
              onChange?.({
                target: { value: String(opt.value) },
              } as React.ChangeEvent<HTMLSelectElement>)
            }
            className="text-sm rounded-md px-3 py-1.5 cursor-pointer
              focus:bg-surface-secondary focus:text-text-primary
              data-[highlighted]:bg-surface-secondary"
            data-selected={opt.value === value}
          >
            <span
              className={
                opt.value === value ? "text-text-primary font-semibold" : "text-text-secondary"
              }
            >
              {opt.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── DatePickerDemo ─────────────────────────────────────────────────────────────
export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          {date ? format(date, "PPP") : <span>Pick a date</span>}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
          captionLayout="dropdown"
          fromYear={1940}
          toYear={new Date().getFullYear()}
          components={{
            Dropdown: CalendarDropdown,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}