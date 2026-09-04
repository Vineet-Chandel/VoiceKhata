import type { Transaction } from "@/components/hooks/use-transactions"
import { createFinancialMetrics, type RunningBalancePoint } from "@/lib/financial-metrics"

export type ChartData = {
  month: string
  income: number
  expense: number
}

// Backward-compatible wrappers that now delegate to centralized metrics.
export function calculateBalance(data: Transaction[]) {
  const metrics = createFinancialMetrics(data)
  return {
    income: metrics.totalIncome,
    expense: metrics.totalExpense,
    balance: metrics.balance,
  }
}

export function getMonthlyAnalytics(data: Transaction[]): ChartData[] {
  const metrics = createFinancialMetrics(data)
  return metrics.monthlyTrends.map((trend) => ({
    month: trend.monthLabel,
    income: trend.income,
    expense: trend.expense,
  }))
}

export type BalancePoint = RunningBalancePoint

export function getRunningBalance(data: Transaction[]): BalancePoint[] {
  return createFinancialMetrics(data).runningBalance
}
