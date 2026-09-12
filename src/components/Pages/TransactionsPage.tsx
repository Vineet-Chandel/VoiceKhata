// src/components/Pages/TransactionsPage.tsx
"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { DataTable } from "@/components/ui/Transaction_UI/data-table"
import { TransactionFiltersBar, type TransactionFilters } from "@/components/ui/Transaction_UI/transaction-filters"
import { AddTransactionDialog } from "@/components/ui/Transaction_UI/add-transaction-dialog"
import { useTransactions, type Transaction } from "@/components/hooks/use-transactions"
import { useBudgets } from "@/components/hooks/use-budgets"
import { useRecurring } from "@/components/hooks/use-recurring"
import { RecurringOverview } from "@/components/ui/Recurring_UI/recurring-overview"
import { RecurringTable } from "@/components/ui/Recurring_UI/recurring-table"
import { AddRecurringDialog } from "@/components/ui/Recurring_UI/add-recurring-dialog"

type TransactionInput = Omit<Transaction, "id" | "firebase_uid" | "created_at">
type TransactionUpdate = Omit<Transaction, "id" | "firebase_uid" | "created_at">

export default function TransactionsPage() {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions()

  const { budgets, addBudget } = useBudgets()
  const budgetCategories = budgets.map((b) => b.category)

  const {
    recurring, loading: recurringLoading,
    addRecurring, updateRecurring, toggleRecurring, deleteRecurring,
  } = useRecurring(addTransaction)

  const navigate = useNavigate()

  const [filters, setFilters] = React.useState<TransactionFilters>({
    search: "", category: "", type: "", status: "", method: "", dateFrom: "", dateTo: "",
  })

  const filtered = React.useMemo(() => {
    const passesFilters = (t: Transaction) => {
      if (filters.category && t.category !== filters.category) return false
      if (filters.type && t.type !== filters.type) return false
      if (filters.status && t.status !== filters.status) return false
      if (filters.method && t.method !== filters.method) return false
      if (filters.dateFrom && t.date < filters.dateFrom) return false
      if (filters.dateTo && t.date > filters.dateTo) return false
      return true
    }

    if (!filters.search.trim()) return transactions.filter(passesFilters)

    const query = filters.search.toLowerCase().trim()
    return transactions
      .map((t) => {
        const name = t.transaction.toLowerCase()
        let score = 0
        if (name === query) score = 100
        else if (name.startsWith(query)) score = 80
        else if (name.split(" ").some((w) => w.startsWith(query))) score = 60
        else if (name.includes(query)) score = 40
        return { t, score }
      })
      .filter(({ score, t }) => score > 0 && passesFilters(t))
      .sort((a, b) => b.score - a.score)
      .map(({ t }) => t)
  }, [transactions, filters])

  const handleAddTransaction = async (input: TransactionInput) => {
    const result = await addTransaction(input)
    if (result?.error) console.error("Failed to add transaction:", result.error)
    return result
  }

  const handleEditTransaction = async (id: number, updated: TransactionUpdate) => {
    const result = await updateTransaction(id, updated)
    if (result?.error) console.error("Failed to update transaction:", result.error)
  }

  const handleDeleteTransaction = async (id: number) => {
    await deleteTransaction(id)
  }

  const handleNavigateToAI = (seedMessage: string) => {
    navigate("/dashboard/ai-assistant", { state: { seedMessage } })
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

        <div className="flex items-center justify-between px-4 lg:px-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {loading
                ? "Loading..."
                : `${filtered.length} transaction${filtered.length !== 1 ? "s" : ""} found | Mode: ${window.localStorage.getItem("voicekhata:appMode") || "PERSONAL"}`}
            </p>
          </div>
          <AddTransactionDialog
            onAdd={handleAddTransaction}
            budgetCategories={budgetCategories}
            budgetRows={budgets}
            onAddBudget={addBudget}
            onNavigateToAI={handleNavigateToAI}
          />
        </div>

        <TransactionFiltersBar filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Loading transactions...
          </div>
        ) : (
          <DataTable
            data={filtered}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            budgetCategories={budgetCategories}
            budgetRows={budgets}
          />
        )}

        {/* AutoFlow Section */}
        <div className="flex flex-col gap-4 pt-6 md:gap-6 md:pt-8 border-t border-border mt-4">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">AutoFlow</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {recurringLoading
                  ? "Loading..."
                  : `${recurring.length} recurring rule${recurring.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <AddRecurringDialog onAdd={addRecurring} />
          </div>

          {recurringLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Loading autopay rules…
            </div>
          ) : (
            <>
              <RecurringOverview recurring={recurring} />
              <RecurringTable
                data={recurring}
                onToggle={toggleRecurring}
                onEdit={updateRecurring}
                onDelete={deleteRecurring}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
