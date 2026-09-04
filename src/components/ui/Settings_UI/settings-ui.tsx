// src/components/ui/Settings_UI/settings-ui.tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
  Check, AlertTriangle, Eye, EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

// ── Toast ─────────────────────────────────────────────────────────────────────
export type StatusMsg = { type: "success" | "error"; text: string } | null

export function Toast({ msg }: { msg: StatusMsg }) {
  if (!msg) return null
  return (
    <div className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium border
      ${msg.type === "success"
        ? "bg-surface-secondary text-text-primary border-border-secondary"
        : "bg-surface-secondary text-text-secondary border-border"}`}>
      {msg.type === "success"
        ? <Check className="size-3 text-text-primary" />
        : <AlertTriangle className="size-3 text-text-secondary" />}
      {msg.text}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", danger = false }: {
  children: React.ReactNode; className?: string; danger?: boolean
}) {
  return (
    <div className={`relative rounded-2xl border overflow-hidden
      ${danger ? "border-border bg-surface-secondary" : "border-border bg-surface-secondary"}
      ${className}`}>
      {children}
    </div>
  )
}

// ── FieldRow ──────────────────────────────────────────────────────────────────
export function FieldRow({ icon: Icon, label, description, children }: {
  icon: React.ElementType; label: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 px-5
      border-b border-border last:border-0 hover:bg-surface-secondary transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-lg bg-surface-secondary text-text-muted">
          <Icon className="size-3.5" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary leading-tight">{label}</p>
          {description && <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  )
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pt-4 pb-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">{children}</p>
    </div>
  )
}

// ── SelectDropdown ────────────────────────────────────────────────────────────
export function SelectDropdown({ value, options, onChange, placeholder }: {
  value: string; options: string[]; onChange: (val: string) => void; placeholder?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal cursor-pointer h-10
          bg-surface-secondary border-border hover:bg-surface-secondary hover:border-border-secondary
          text-text-secondary transition-all">
          {value || placeholder || "Select..."}
          <ChevronDownIcon className="size-4 opacity-30" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[340px] bg-surface border-border">
        {options.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => onChange(opt)}
            className={`cursor-pointer text-text-secondary hover:text-text-primary focus:text-text-primary
              ${value === opt ? "font-semibold text-text-primary" : ""}`}>
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── CaptionSelect ─────────────────────────────────────────────────────────────
function CaptionSelect({ value, options, onChange }: {
  value: number
  options: { label: string; value: number }[]
  onChange: (val: number) => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  React.useEffect(() => {
    if (!open || !ref.current) return
    const el = ref.current.querySelector("[data-active='true']") as HTMLElement | null
    el?.scrollIntoView({ block: "center" })
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md cursor-pointer
          bg-surface-secondary hover:bg-surface-elevated border border-border-secondary hover:border-border-secondary
          text-sm font-semibold text-text-primary transition-all outline-none select-none"
      >
        {selected?.label ?? value}
        <ChevronDownIcon className={`size-3 opacity-40 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-[9999]
          min-w-[7rem] max-h-52 overflow-y-auto
          rounded-xl border border-border bg-[#161616] shadow-2xl py-1
          [&::-webkit-scrollbar]:w-[3px]
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-surface-elevated">
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                data-active={active}
                onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false) }}
                className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors
                  ${active ? "text-text-primary font-semibold bg-surface-secondary" : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"}`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── MiniCalendar — fully hand-rolled, zero DayPicker ─────────────────────────
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function MiniCalendar({ selected, maxDate, onSelect }: {
  selected: Date | undefined
  maxDate: Date
  onSelect: (d: Date) => void
}) {
  const today = new Date()
  const [viewYear,  setViewYear]  = React.useState(selected?.getFullYear()  ?? today.getFullYear())
  const [viewMonth, setViewMonth] = React.useState(selected?.getMonth()     ?? today.getMonth())

  const currentYear = today.getFullYear()
  const fromYear    = currentYear - 100
  const yearOptions  = Array.from({ length: 101 }, (_, i) => ({ label: String(fromYear + i), value: fromYear + i }))
  const monthOptions = MONTHS.map((label, i) => ({ label, value: i }))

  const daysInMonth  = getDaysInMonth(viewYear, viewMonth)
  const firstWeekDay = getFirstDayOfWeek(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="p-3 w-[240px]">
      {/* Caption */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-surface-secondary text-text-muted hover:text-text-primary transition-colors">
          <ChevronLeftIcon className="size-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <CaptionSelect
            value={viewMonth}
            options={monthOptions}
            onChange={(m) => setViewMonth(m)}
          />
          <CaptionSelect
            value={viewYear}
            options={yearOptions}
            onChange={(y) => setViewYear(y)}
          />
        </div>

        <button type="button" onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-surface-secondary text-text-muted hover:text-text-primary transition-colors">
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="h-8 flex items-center justify-center text-[11px] font-medium text-text-muted">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="h-8" />
          const thisDate   = new Date(viewYear, viewMonth, day)
          const isSelected = selected && isSameDay(thisDate, selected)
          const isToday    = isSameDay(thisDate, today)
          const isDisabled = thisDate > maxDate

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelect(thisDate)}
              className={`h-8 w-full rounded-md text-sm transition-colors
                flex items-center justify-center
                ${isDisabled
                  ? "text-text-muted cursor-not-allowed"
                  : isSelected
                    ? "bg-text-primary text-bg-primary font-semibold"
                    : isToday
                      ? "text-text-primary font-semibold hover:bg-surface-secondary"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary cursor-pointer"
                }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── DateField ─────────────────────────────────────────────────────────────────
export function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parseLocalDate = (str: string): Date | undefined => {
    if (!str) return undefined
    const [y, m, d] = str.split("-").map(Number)
    if (!y || !m || !d) return undefined
    return new Date(y, m - 1, d)
  }

  const [open, setOpen] = React.useState(false)
  const date = parseLocalDate(value)

  const handleSelect = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm   = String(d.getMonth() + 1).padStart(2, "0")
    const dd   = String(d.getDate()).padStart(2, "0")
    onChange(`${yyyy}-${mm}-${dd}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="w-full justify-between font-normal cursor-pointer h-10
            bg-surface-secondary border-border hover:bg-surface-secondary hover:border-border-secondary
            text-text-secondary data-[empty=true]:text-text-muted transition-all"
        >
          {date ? format(date, "PPP") : "Pick a date"}
          <ChevronDownIcon className="size-4 opacity-30" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 overflow-visible bg-surface border-border"
        align="start"
        side="top"
        sideOffset={8}
      >
        <MiniCalendar
          selected={date}
          maxDate={new Date()}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}

// ── PasswordInput ─────────────────────────────────────────────────────────────
export function PasswordInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 bg-surface-secondary border-border hover:border-border-secondary
          focus:border-border-secondary text-text-primary placeholder:text-text-muted pr-10 transition-all"
      />
      <button type="button" onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted
          hover:text-text-secondary transition-colors cursor-pointer">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

// ── PasswordStrength ──────────────────────────────────────────────────────────
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score  = checks.filter(Boolean).length
  const fill   = ["bg-surface-elevated", "bg-text-primary/40", "bg-text-primary/65", "bg-text-primary/90"]
  const labels = ["Weak", "Fair", "Good", "Strong"]
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
            ${i <= score ? fill[score - 1] : "bg-surface-secondary"}`} />
        ))}
      </div>
      <p className="text-[11px] text-text-muted">
        Strength: <span className="text-text-secondary font-medium">{labels[score - 1] ?? "Weak"}</span>
      </p>
    </div>
  )
}