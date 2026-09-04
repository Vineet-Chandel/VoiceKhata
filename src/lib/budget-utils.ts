import type { Budget, Transaction } from "@/types/finance"

export type BudgetDuration =
  | "monthly"
  | "3months"
  | "6months"
  | "12months"
  | "yearly"
  | "timeless"

type MonthParts = { year: number; month: number }

function parseMonthKey(monthKey: string): MonthParts {
  const [yearRaw, monthRaw] = monthKey.split("-")
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  return {
    year: Number.isFinite(year) ? year : 1970,
    month: Number.isFinite(month) ? month : 1,
  }
}

function toMonthIndex(monthKey: string): number {
  const { year, month } = parseMonthKey(monthKey)
  return year * 12 + (month - 1)
}

function monthFromDate(date: string): string {
  return date.slice(0, 7)
}

function addMonths(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function normalizeBudgetDuration(duration: string | null | undefined): BudgetDuration {
  const value = (duration ?? "monthly").toLowerCase().trim()
  if (value === "1" || value === "monthly") return "monthly"
  if (value === "3" || value === "3months") return "3months"
  if (value === "6" || value === "6months") return "6months"
  if (value === "12" || value === "12months") return "12months"
  if (value === "yearly") return "yearly"
  if (value === "timeless") return "timeless"
  return "monthly"
}

export function isBudgetActiveForMonth(
  budget: Pick<Budget, "month" | "duration">,
  selectedMonth: string
): boolean {
  const start = budget.month
  const duration = normalizeBudgetDuration(budget.duration)
  const startIdx = toMonthIndex(start)
  const selectedIdx = toMonthIndex(selectedMonth)

  if (duration === "monthly") {
    return selectedMonth === start
  }

  if (duration === "timeless") {
    return selectedIdx >= startIdx
  }

  if (duration === "yearly" || duration === "12months") {
    const s = parseMonthKey(start)
    const v = parseMonthKey(selectedMonth)
    if (s.year !== v.year) return false
    return selectedIdx >= startIdx
  }

  const span = duration === "6months" ? 6 : 3
  return selectedIdx >= startIdx && selectedIdx < startIdx + span
}

export function isBudgetValidForTransaction(
  budget: Pick<Budget, "month" | "duration">,
  transactionDate: string
): boolean {
  const transactionMonth = monthFromDate(transactionDate)
  return isBudgetActiveForMonth(budget, transactionMonth)
}

function matchesBudgetSpendWindow(
  budget: Pick<Budget, "month" | "duration" | "category">,
  tx: Pick<Transaction, "date" | "category" | "type">,
  selectedMonth: string
): boolean {
  if (tx.type !== "Debit") return false
  if (tx.category !== budget.category) return false

  const duration = normalizeBudgetDuration(budget.duration)
  const txMonth = monthFromDate(tx.date)
  const txIdx = toMonthIndex(txMonth)
  const startIdx = toMonthIndex(budget.month)
  const selectedIdx = toMonthIndex(selectedMonth)

  if (txIdx > selectedIdx) return false

  if (duration === "monthly") {
    return txMonth === selectedMonth
  }

  if (duration === "timeless") {
    return txIdx >= startIdx
  }

  if (duration === "yearly" || duration === "12months") {
    const s = parseMonthKey(budget.month)
    const t = parseMonthKey(txMonth)
    return s.year === t.year && txIdx >= startIdx
  }

  const span = duration === "6months" ? 6 : 3
  const endExclusive = toMonthIndex(addMonths(budget.month, span))
  return txIdx >= startIdx && txIdx < endExclusive
}

export function computeBudgetSpent(
  budgets: Budget[],
  transactions: Transaction[],
  selectedMonth: string
): Map<string, number> {
  const spentById = new Map<string, number>()

  budgets.forEach((budget) => {
    const spent = transactions
      .filter((tx) => matchesBudgetSpendWindow(budget, tx, selectedMonth))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
    spentById.set(budget.id, spent)
  })

  return spentById
}

export function getProgressColor(percentUsed: number): string {
  if (percentUsed < 70) return "bg-emerald-500"
  if (percentUsed <= 90) return "bg-amber-500"
  return "bg-red-500"
}

export function calculateBudgetHealthScore(budgets: Array<Pick<Budget, "amount" | "spent">>): number {
  const weightedDenominator = budgets.reduce(
    (sum, budget) => sum + Math.max(Number(budget.amount) || 0, 0),
    0
  )

  if (weightedDenominator <= 0) return 0

  const weightedPassScore = budgets.reduce((sum, budget) => {
    const amount = Math.max(Number(budget.amount) || 0, 0)
    if (amount <= 0) return sum
    const underBudget = Number(budget.spent) <= amount ? 1 : 0
    return sum + underBudget * amount
  }, 0)

  return Math.round((weightedPassScore / weightedDenominator) * 100)
}

export function isDurationGuardedBudget(
  budget: Pick<Budget, "month">,
  selectedMonth: string
): boolean {
  return toMonthIndex(budget.month) - toMonthIndex(selectedMonth) > 4
}
