import { useFinancialContext } from "@/context/FinancialContext"
import type {
  Transaction,
  TransactionInput,
  TransactionUpdateInput,
} from "@/types/finance"

export type { Transaction, TransactionInput, TransactionUpdateInput }

export function useTransactions() {
  const {
    transactions,
    transactionsLoading,
    transactionsError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetchTransactions,
  } = useFinancialContext()

  return {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    addTransaction: (t: TransactionInput) => addTransaction(t),
    updateTransaction: (id: number, updates: TransactionUpdateInput) => updateTransaction(id, updates),
    deleteTransaction,
    refetch: (options?: { silent?: boolean }) => refetchTransactions(options),
  }
}
