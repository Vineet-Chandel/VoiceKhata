"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { IconSearch, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Dashboard_UI/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Dashboard_UI/select"

export interface TransactionFilters {
  search: string
  category: string
  type: string
  status: string
  method: string
  dateFrom: string
  dateTo: string
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
}

const CATEGORIES = ["Income", "Subscription", "Food", "Shopping", "Utilities", "Transport", "Health", "Entertainment", "Other"]
const METHODS = ["Bank Transfer", "Credit Card", "Debit Card", "UPI", "Cash", "Net Banking"]

function toDate(str: string): Date | undefined {
  if (!str) return undefined
  const d = new Date(str)
  return isNaN(d.getTime()) ? undefined : d
}

function toStr(date: Date | undefined): string {
  if (!date) return ""
  return format(date, "yyyy-MM-dd")
}

function activeClass(value: string) {
  return value
    ? "border-foreground/40 bg-foreground/10 text-foreground"
    : "text-muted-foreground"
}

function filterDateClass(value: string) {
  return value
    ? "w-[150px] justify-between font-normal border-foreground/40 bg-foreground/10 text-foreground"
    : "w-[150px] justify-between font-normal text-muted-foreground"
}

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersProps) {
  const update = (key: keyof TransactionFilters, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.type ||
    filters.status ||
    filters.method ||
    filters.dateFrom ||
    filters.dateTo

  const clearAll = () => {
    onChange({
      search: "",
      category: "",
      type: "",
      status: "",
      method: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  const dateFrom = toDate(filters.dateFrom)
  const dateTo = toDate(filters.dateTo)

  return (
    <div className="flex flex-col gap-3 px-4 lg:px-6">

      {/* Search bar */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Category — fixed width fits "All Categories" */}
        <Select
          value={filters.category || "all"}
          onValueChange={(v) => update("category", v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className={`w-[150px] ${activeClass(filters.category)}`}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type — fixed width fits "All Types" */}
        <Select
          value={filters.type || "all"}
          onValueChange={(v) => update("type", v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className={`w-[120px] ${activeClass(filters.type)}`}>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Credit">Credit</SelectItem>
            <SelectItem value="Debit">Debit</SelectItem>
          </SelectContent>
        </Select>

        {/* Status — fixed width fits "All Statuses" */}
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => update("status", v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className={`w-[135px] ${activeClass(filters.status)}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Method — fixed width fits "Bank Transfer" */}
        <Select
          value={filters.method || "all"}
          onValueChange={(v) => update("method", v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className={`w-[150px] ${activeClass(filters.method)}`}>
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">All Methods</SelectItem>
            {METHODS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={filterDateClass(filters.dateFrom)}
            >
              {dateFrom ? format(dateFrom, "dd MMM yyyy") : <span>From date</span>}
              <ChevronDownIcon className="size-3.5 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(d) => update("dateFrom", toStr(d))}
              defaultMonth={dateFrom}
              disabled={(date) => (dateTo ? date > dateTo : false)}
            />
            {dateFrom && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground cursor-pointer"
                  onClick={() => update("dateFrom", "")}
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={filterDateClass(filters.dateTo)}
            >
              {dateTo ? format(dateTo, "dd MMM yyyy") : <span>To date</span>}
              <ChevronDownIcon className="size-3.5 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(d) => update("dateTo", toStr(d))}
              defaultMonth={dateTo}
              disabled={(date) => (dateFrom ? date < dateFrom : false)}
            />
            {dateTo && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground cursor-pointer"
                  onClick={() => update("dateTo", "")}
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Clear all */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <IconX className="size-3.5 mr-1" />
            Clear all
          </Button>
        )}

      </div>
    </div>
  )
}