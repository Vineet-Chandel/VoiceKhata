import type { Budget, Transaction } from "@/types/finance"

export type MetricScope = {
  monthKey: string
  totalIncome: number
  totalExpense: number
  savings: number
  savingsRate: number
  transactionCount: number
}

export type BudgetCategoryUtilization = {
  category: string
  budget: number
  spent: number
  remaining: number
  utilizationRate: number
}

export type BudgetUtilization = {
  totalBudget: number
  totalSpent: number
  remaining: number
  utilizationRate: number
  byCategory: BudgetCategoryUtilization[]
}

export type MonthlyTrend = {
  monthKey: string
  monthLabel: string
  income: number
  expense: number
  savings: number
  savingsRate: number
  transactionCount: number
}

export type RunningBalancePoint = {
  date: string
  balance: number
}

export type FinancialMetrics = {
  totalIncome: number
  totalExpense: number
  savings: number
  balance: number
  savingsRate: number
  transactionCount: number
  budgetUtilization: BudgetUtilization
  currentMonth: MetricScope
  monthlyTrends: MonthlyTrend[]
  runningBalance: RunningBalancePoint[]
}

type CreateFinancialMetricsOptions = {
  referenceDate?: Date
  scopeMonth?: string
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function toMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleString("en-IN", { month: "short", year: "2-digit" })
}

function roundPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value)
}

function calcSavingsRate(income: number, expense: number): number {
  if (income <= 0) return 0
  return roundPercent(((income - expense) / income) * 100)
}

function normalizeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map((tx) => ({
    ...tx,
    amount: Number(tx.amount) || 0,
  }))
}

function buildRunningBalance(transactions: Transaction[]): RunningBalancePoint[] {
  if (transactions.length === 0) return []

  const sorted = [...transactions].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
    if (diff !== 0) return diff
    return a.id - b.id
  })

  let balance = 0
  const byDate = new Map<string, number>()
  for (const tx of sorted) {
    if (tx.type === "Credit") balance += tx.amount
    else balance -= tx.amount
    const key = new Date(tx.date).toISOString().slice(0, 10)
    byDate.set(key, balance)
  }

  const start = new Date(sorted[0].date)
  const end = new Date(sorted[sorted.length - 1].date)
  const points: RunningBalancePoint[] = []

  let carry = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    if (byDate.has(key)) carry = byDate.get(key) ?? carry
    points.push({ date: key, balance: carry })
  }

  return points
}

function buildBudgetUtilization(
  monthTransactions: Transaction[],
  budgets: Budget[],
  scopeMonth: string
): BudgetUtilization {
  const debitTx = monthTransactions.filter((tx) => tx.type === "Debit")
  const spentByCategory = new Map<string, number>()
  for (const tx of debitTx) {
    const key = tx.category || "Other"
    spentByCategory.set(key, (spentByCategory.get(key) ?? 0) + tx.amount)
  }

  const scopeBudgets = budgets.filter((b) => !b.month || b.month === scopeMonth)
  const budgetByCategory = new Map<string, number>()
  for (const budget of scopeBudgets) {
    const key = budget.category || "Other"
    budgetByCategory.set(key, (budgetByCategory.get(key) ?? 0) + (Number(budget.amount) || 0))
  }

  const categories = new Set<string>([
    ...Array.from(spentByCategory.keys()),
    ...Array.from(budgetByCategory.keys()),
  ])

  const byCategory = Array.from(categories)
    .map((category) => {
      const spent = spentByCategory.get(category) ?? 0
      const budget = budgetByCategory.get(category) ?? 0
      const remaining = budget - spent
      const utilizationRate = budget > 0 ? roundPercent((spent / budget) * 100) : 0
      return { category, budget, spent, remaining, utilizationRate }
    })
    .sort((a, b) => b.spent - a.spent)

  const totalBudget = byCategory.reduce((sum, row) => sum + row.budget, 0)
  const totalSpent = debitTx.reduce((sum, tx) => sum + tx.amount, 0)
  const remaining = totalBudget - totalSpent
  const utilizationRate = totalBudget > 0 ? roundPercent((totalSpent / totalBudget) * 100) : 0

  return {
    totalBudget,
    totalSpent,
    remaining,
    utilizationRate,
    byCategory,
  }
}

export function createFinancialMetrics(
  transactions: Transaction[],
  budgets: Budget[] = [],
  options: CreateFinancialMetricsOptions = {}
): FinancialMetrics {
  const normalizedTransactions = normalizeTransactions(transactions)
  const refDate = options.referenceDate ?? new Date()
  const scopeMonth = options.scopeMonth ?? getMonthKey(refDate)

  const creditTx = normalizedTransactions.filter((tx) => tx.type === "Credit")
  const debitTx = normalizedTransactions.filter((tx) => tx.type === "Debit")
  const totalIncome = creditTx.reduce((sum, tx) => sum + tx.amount, 0)
  const totalExpense = debitTx.reduce((sum, tx) => sum + tx.amount, 0)
  const savings = totalIncome - totalExpense

  const currentMonthTx = normalizedTransactions.filter((tx) => tx.date.startsWith(scopeMonth))
  const currentMonthIncome = currentMonthTx
    .filter((tx) => tx.type === "Credit")
    .reduce((sum, tx) => sum + tx.amount, 0)
  const currentMonthExpense = currentMonthTx
    .filter((tx) => tx.type === "Debit")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const monthlyMap = new Map<string, { income: number; expense: number; count: number }>()
  for (const tx of normalizedTransactions) {
    const monthKey = tx.date.slice(0, 7)
    const bucket = monthlyMap.get(monthKey) ?? { income: 0, expense: 0, count: 0 }
    if (tx.type === "Credit") bucket.income += tx.amount
    else bucket.expense += tx.amount
    bucket.count += 1
    monthlyMap.set(monthKey, bucket)
  }

  const monthlyTrends = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, bucket]) => {
      const savingsValue = bucket.income - bucket.expense
      return {
        monthKey,
        monthLabel: toMonthLabel(monthKey),
        income: bucket.income,
        expense: bucket.expense,
        savings: savingsValue,
        savingsRate: calcSavingsRate(bucket.income, bucket.expense),
        transactionCount: bucket.count,
      }
    })

  const budgetUtilization = buildBudgetUtilization(currentMonthTx, budgets, scopeMonth)

  return {
    totalIncome,
    totalExpense,
    savings,
    balance: savings,
    savingsRate: calcSavingsRate(totalIncome, totalExpense),
    transactionCount: normalizedTransactions.length,
    budgetUtilization,
    currentMonth: {
      monthKey: scopeMonth,
      totalIncome: currentMonthIncome,
      totalExpense: currentMonthExpense,
      savings: currentMonthIncome - currentMonthExpense,
      savingsRate: calcSavingsRate(currentMonthIncome, currentMonthExpense),
      transactionCount: currentMonthTx.length,
    },
    monthlyTrends,
    runningBalance: buildRunningBalance(normalizedTransactions),
  }
}
