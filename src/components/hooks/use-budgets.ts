import { useFinancialContext } from "@/context/FinancialContext"
import type { Budget, BudgetInput, BudgetUpdateInput } from "@/types/finance"

export type { Budget, BudgetInput, BudgetUpdateInput }

export function useBudgets() {
  const {
    budgets,
    allBudgets,
    budgetsLoading,
    budgetsError,
    addBudget,
    updateBudget,
    deleteBudget,
    refetchBudgets,
    selectedMonth,
    setSelectedMonth,
    totalCap,
    setMonthlyTotalCap,
  } = useFinancialContext()

  return {
    budgets,
    allBudgets,
    loading: budgetsLoading,
    error: budgetsError,
    addBudget: (input: BudgetInput) => addBudget(input),
    updateBudget: (id: string, updates: BudgetUpdateInput) => updateBudget(id, updates),
    deleteBudget,
    refetch: (options?: { silent?: boolean }) => refetchBudgets(options),
    selectedMonth,
    setSelectedMonth,
    totalCap,
    setMonthlyTotalCap,
  }
}
