import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import {
  computeBudgetSpent,
  isBudgetActiveForMonth,
  normalizeBudgetDuration,
} from "@/lib/budget-utils"
import type {
  Budget,
  BudgetInput,
  BudgetUpdateInput,
  Transaction,
  TransactionInput,
  TransactionUpdateInput,
} from "@/types/finance"

type FinancialContextValue = {
  transactions: Transaction[]
  transactionsLoading: boolean
  transactionsError: string | null
  addTransaction: (t: TransactionInput) => Promise<{ error?: string; data?: Transaction } | undefined>
  updateTransaction: (id: number, updates: TransactionUpdateInput) => Promise<{ error?: string; data?: Transaction } | undefined>
  deleteTransaction: (id: number) => Promise<void>
  refetchTransactions: (options?: { silent?: boolean }) => Promise<void>

  budgets: Budget[]
  budgetsLoading: boolean
  budgetsError: string | null
  addBudget: (input: BudgetInput) => Promise<{ error?: string; data?: Budget } | undefined>
  updateBudget: (id: string, updates: BudgetUpdateInput) => Promise<{ error?: string; data?: Budget } | undefined>
  deleteBudget: (id: string) => Promise<void>
  refetchBudgets: (options?: { silent?: boolean }) => Promise<void>

  selectedMonth: string
  setSelectedMonth: (month: string) => void
  totalCap: number | null
  setMonthlyTotalCap: (cap: number | null) => Promise<{ error?: string }>
}

const FinancialContext = createContext<FinancialContextValue | null>(null)

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 101,
    transaction: "Ramesh Kumar - Groceries Udhar",
    amount: 1200,
    date: new Date().toISOString().split("T")[0],
    category: "Groceries",
    type: "Credit",
    payment_method: "UPI",
    notes: "Monthly ration credit",
    tags: ["Ramesh Kumar", "Udhar", "Customer"],
    user_id: 1,
    firebase_uid: "demo-shopkeeper-uid",
    created_at: new Date().toISOString(),
  },
  {
    id: 102,
    transaction: "Daily Kirana Cash Sales",
    amount: 4850,
    date: new Date().toISOString().split("T")[0],
    category: "Sales",
    type: "Credit",
    payment_method: "Cash",
    notes: "Counter counter cash",
    tags: ["Daily Sales", "Counter Cash"],
    user_id: 1,
    firebase_uid: "demo-shopkeeper-uid",
    created_at: new Date().toISOString(),
  },
  {
    id: 103,
    transaction: "Gupta Traders - Mustard Oil Stock",
    amount: 500,
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    category: "Inventory",
    type: "Debit",
    payment_method: "Cash",
    notes: "Oil carton deposit",
    tags: ["Gupta Traders", "Supplier"],
    user_id: 1,
    firebase_uid: "demo-shopkeeper-uid",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 104,
    transaction: "Sunil Verma - Cement & Hardware",
    amount: 1500,
    date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    category: "Hardware",
    type: "Credit",
    payment_method: "Credit",
    notes: "2 bags cement udhar",
    tags: ["Sunil Verma", "Customer", "Udhar"],
    user_id: 1,
    firebase_uid: "demo-shopkeeper-uid",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 105,
    transaction: "Sharma Ji Wholesale - Atta & Dal Stock",
    amount: 4200,
    date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    category: "Wholesale",
    type: "Debit",
    payment_method: "UPI",
    notes: "Weekly wholesale re-stock",
    tags: ["Sharma Ji Wholesale", "Supplier"],
    user_id: 1,
    firebase_uid: "demo-shopkeeper-uid",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 106,
    transaction: "Anita Dairy - Milk Token Advance",
    amount: 650,
    date: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0],
    category: "Dairy",
    type: "Credit",
    payment_method: "UPI",
    notes: "Pending settlement",
    tags: ["Anita Dairy", "Customer", "Overdue"],
    user_id: 1,
    firebase_uid: "demo-shopkeeper-uid",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 107,
    transaction: "Priya General Store - Cold Drinks",
    amount: 850,
    date: new Date(Date.now() - 86400000 * 6).toISOString().split("T")[0],
    category: "Beverages",
    type: "Credit",
    payment_method: "UPI",
    notes: "Full payment via PhonePe",
    tags: ["Priya General Store", "Settled"],
    user_id: 1,
    firebase_uid: "demo-shopkeeper-uid",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
]

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function getMonthStorageKey(uid: string): string {
  return `voicekhata:selectedMonth:${uid}`
}

function readPersistedSelectedMonth(uid: string): string {
  if (typeof window === "undefined") return getCurrentMonth()
  const value = window.localStorage.getItem(getMonthStorageKey(uid))
  return /^\d{4}-\d{2}$/.test(value ?? "") ? (value as string) : getCurrentMonth()
}

function writePersistedSelectedMonth(uid: string, month: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(getMonthStorageKey(uid), month)
}

async function syncBudgetThresholdAlerts(
  uid: string,
  month: string,
  budgets: Budget[]
): Promise<void> {
  const threshold = 80
  const monthStart = `${month}-01T00:00:00.000Z`

  try {
    const { data: existingRows } = await supabase
      .from("notifications")
      .select("metadata, created_at")
      .eq("firebase_uid", uid)
      .gte("created_at", monthStart)

    const existingKeys = new Set<string>()
    for (const row of existingRows ?? []) {
      const meta = row.metadata as Record<string, unknown> | null
      const maybeKey = meta?.alert_key
      if (typeof maybeKey === "string") existingKeys.add(maybeKey)
    }

    for (const budget of budgets) {
      if (budget.amount <= 0) continue

      const percentUsed = (budget.spent / budget.amount) * 100
      if (percentUsed < threshold) continue

      const alertKey = `budget-threshold:${month}:${budget.category}:${Math.round(threshold)}`
      if (existingKeys.has(alertKey)) continue

      const title =
        percentUsed >= 100
          ? `Budget exceeded: ${budget.category}`
          : `Budget threshold reached: ${budget.category}`

      const message = `You've used ${percentUsed.toFixed(0)}% of ${budget.category} budget (Rs.${budget.spent.toLocaleString(
        "en-IN"
      )} of Rs.${budget.amount.toLocaleString("en-IN")}).`

      await supabase.from("notifications").insert({
        firebase_uid: uid,
        type: "budget_alert",
        title,
        message,
        metadata: {
          alert_key: alertKey,
          threshold,
          category: budget.category,
          spent: budget.spent,
          budget: budget.amount,
        },
        read: false,
      })

      existingKeys.add(alertKey)
    }
  } catch (err) {
    console.warn("[syncBudgetThresholdAlerts] Notice:", err)
  }
}

async function upsertYearlySummaryIfNeeded(
  uid: string,
  month: string,
  allBudgets: Budget[],
  allTransactions: Transaction[]
): Promise<void> {
  if (!month.endsWith("-01")) return

  const year = Number(month.slice(0, 4)) - 1
  const yearPrefix = `${year}-`

  const budgetByCategory = new Map<string, number>()
  allBudgets.forEach((budget) => {
    if (!budget.month.startsWith(yearPrefix)) return
    budgetByCategory.set(
      budget.category,
      (budgetByCategory.get(budget.category) ?? 0) + Number(budget.amount || 0)
    )
  })

  const spentByCategory = new Map<string, number>()
  allTransactions
    .filter((tx) => tx.type === "Debit" && tx.date.startsWith(yearPrefix))
    .forEach((tx) => {
      spentByCategory.set(
        tx.category,
        (spentByCategory.get(tx.category) ?? 0) + Number(tx.amount || 0)
      )
    })

  const categories = new Set([
    ...Array.from(budgetByCategory.keys()),
    ...Array.from(spentByCategory.keys()),
  ])

  if (categories.size === 0) return

  for (const category of categories) {
    const total_budget = budgetByCategory.get(category) ?? 0
    const total_spent = spentByCategory.get(category) ?? 0
    try {
      await supabase.from("yearly_budget_summary").upsert(
        {
          firebase_uid: uid,
          year,
          category,
          total_budget,
          total_spent,
          total_saved: Math.max(total_budget - total_spent, 0),
        },
        { onConflict: "firebase_uid,year,category" }
      )
    } catch (err) {
      console.warn("[upsertYearlySummaryIfNeeded] Notice:", err)
    }
  }
}

async function createTransactionNotification(
  uid: string,
  tx: Pick<Transaction, "transaction" | "amount" | "type" | "category">
): Promise<void> {
  const action = tx.type === "Credit" ? "received" : "spent"
  const title = tx.type === "Credit" ? "Income logged" : "Expense logged"
  const message = `You ${action} Rs.${Number(tx.amount || 0).toLocaleString("en-IN")} for ${tx.transaction} (${tx.category}).`

  try {
    await supabase.from("notifications").insert({
      firebase_uid: uid,
      type: "transaction",
      title,
      message,
      metadata: {
        transaction: tx.transaction,
        amount: tx.amount,
        category: tx.category,
        entry_type: tx.type,
      },
      read: false,
    })
  } catch (err) {
    console.warn("[createTransactionNotification] Notice:", err)
  }
}

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)

  const [allBudgetRows, setAllBudgetRows] = useState<Budget[]>([])
  const [budgetsLoading, setBudgetsLoading] = useState(true)
  const [budgetsError, setBudgetsError] = useState<string | null>(null)

  const [selectedMonth, setSelectedMonthState] = useState<string>(getCurrentMonth)
  const [totalCapByMonth, setTotalCapByMonth] = useState<Record<string, number | null>>({})

  useEffect(() => {
    if (!user?.uid) {
      setSelectedMonthState(getCurrentMonth())
      return
    }
    setSelectedMonthState(readPersistedSelectedMonth(user.uid))
  }, [user?.uid])

  const setSelectedMonth = useCallback(
    (month: string) => {
      setSelectedMonthState(month)
      if (user?.uid) writePersistedSelectedMonth(user.uid, month)
    },
    [user?.uid]
  )

  const refetchTransactions = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user?.uid) return

      if (user.uid === "demo-shopkeeper-uid") {
        try {
          const stored = localStorage.getItem("voicekhata_demo_txs")
          if (stored) {
            setTransactions(JSON.parse(stored))
          } else {
            localStorage.setItem("voicekhata_demo_txs", JSON.stringify(DEMO_TRANSACTIONS))
            setTransactions(DEMO_TRANSACTIONS)
          }
        } catch {
          setTransactions(DEMO_TRANSACTIONS)
        }
        setTransactionsLoading(false)
        return
      }

      if (!options?.silent) {
        setTransactionsLoading(true)
        setTransactionsError(null)
      }

      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("firebase_uid", user.uid)
          .order("date", { ascending: false })

        if (error) throw error
        setTransactions((data as Transaction[]) ?? [])
      } catch (err: any) {
        if (!options?.silent) {
          setTransactionsError(err.message || "Failed to load transactions")
        } else {
          console.warn("[refetchTransactions silent error]:", err)
        }
      } finally {
        if (!options?.silent) {
          setTransactionsLoading(false)
        }
      }
    },
    [user?.uid]
  )

  const refetchBudgets = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user?.uid) return

      if (user.uid === "demo-shopkeeper-uid") {
        setAllBudgetRows([
          { id: "b1", category: "Groceries", amount: 15000, spent: 4500, duration: "monthly", month: selectedMonth, firebase_uid: "demo-shopkeeper-uid" },
          { id: "b2", category: "Inventory", amount: 35000, spent: 18200, duration: "monthly", month: selectedMonth, firebase_uid: "demo-shopkeeper-uid" },
          { id: "b3", category: "Utilities", amount: 5000, spent: 2100, duration: "monthly", month: selectedMonth, firebase_uid: "demo-shopkeeper-uid" },
        ])
        setBudgetsLoading(false)
        return
      }

      if (!options?.silent) {
        setBudgetsLoading(true)
        setBudgetsError(null)
      }

      try {
        const { data, error } = await supabase
          .from("budgets")
          .select("*")
          .eq("firebase_uid", user.uid)
          .order("month", { ascending: false })

        if (error) throw error

        const normalized = ((data as any[]) ?? []).map((row) => ({
          ...row,
          amount: Number(row.amount) || 0,
          spent: 0,
          duration: normalizeBudgetDuration(row.duration),
        })) as Budget[]

        setAllBudgetRows(normalized)
      } catch (err: any) {
        if (!options?.silent) {
          setBudgetsError(err.message || "Failed to load budgets")
        } else {
          console.warn("[refetchBudgets silent error]:", err)
        }
      } finally {
        if (!options?.silent) {
          setBudgetsLoading(false)
        }
      }
    },
    [user?.uid]
  )

  const refetchMonthCap = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user?.uid) return
      const month = selectedMonth

      try {
        const { data, error } = await supabase
          .from("user_budget_caps")
          .select("total_cap")
          .eq("firebase_uid", user.uid)
          .eq("month", month)
          .maybeSingle()

        if (error) throw error
        setTotalCapByMonth((prev) => ({
          ...prev,
          [month]: data?.total_cap ?? null,
        }))
      } catch (err: any) {
        if (!options?.silent) {
          setBudgetsError(err.message || "Failed to load monthly cap")
        } else {
          console.warn("[refetchMonthCap silent error]:", err)
        }
      }
    },
    [user?.uid, selectedMonth]
  )

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setAllBudgetRows([])
      setTotalCapByMonth({})
      setTransactionsLoading(false)
      setBudgetsLoading(false)
      return
    }

    void Promise.all([refetchTransactions(), refetchBudgets(), refetchMonthCap()])
  }, [user, refetchTransactions, refetchBudgets, refetchMonthCap])

  const budgets = useMemo(() => {
    const activeRows = allBudgetRows.filter((budget) =>
      isBudgetActiveForMonth(budget, selectedMonth)
    )

    const dedupedByCategory = new Map<string, Budget>()
    for (const row of activeRows) {
      const existing = dedupedByCategory.get(row.category)
      if (!existing || row.month >= existing.month) {
        dedupedByCategory.set(row.category, row)
      }
    }

    const visibleBudgets = Array.from(dedupedByCategory.values())
    const spentByBudgetId = computeBudgetSpent(visibleBudgets, transactions, selectedMonth)

    return visibleBudgets.map((budget) => ({
      ...budget,
      spent: spentByBudgetId.get(budget.id) ?? 0,
    }))
  }, [allBudgetRows, transactions, selectedMonth])

  const totalCap = totalCapByMonth[selectedMonth] ?? null

  useEffect(() => {
    if (!user?.uid || budgetsLoading) return
    void syncBudgetThresholdAlerts(user.uid, selectedMonth, budgets)
    void upsertYearlySummaryIfNeeded(user.uid, selectedMonth, allBudgetRows, transactions)
  }, [
    user?.uid,
    selectedMonth,
    budgets,
    budgetsLoading,
    allBudgetRows,
    transactions,
  ])

  // Periodic passive sync and window focus sync
  useEffect(() => {
    if (!user?.uid) return

    let lastSyncTime = Date.now()

    const handleFocus = () => {
      const now = Date.now()
      // Throttle: skip if last sync was under 10 seconds ago
      if (now - lastSyncTime < 10000) return
      lastSyncTime = now

      void refetchTransactions({ silent: true })
      void refetchBudgets({ silent: true })
      void refetchMonthCap({ silent: true })
    }

    window.addEventListener("focus", handleFocus)
    const interval = setInterval(() => {
      lastSyncTime = Date.now()
      void refetchTransactions({ silent: true })
      void refetchBudgets({ silent: true })
      void refetchMonthCap({ silent: true })
    }, 45000)

    return () => {
      window.removeEventListener("focus", handleFocus)
      clearInterval(interval)
    }
  }, [user?.uid, refetchTransactions, refetchBudgets, refetchMonthCap])

  const addTransaction = useCallback(
    async (t: TransactionInput) => {
      if (!user?.uid) return { error: "Please log in to add transactions." }

      if (user.uid === "demo-shopkeeper-uid") {
        const newTx: Transaction = {
          id: Date.now(),
          transaction: t.transaction.trim(),
          category: t.category.trim(),
          amount: Number(t.amount),
          date: t.date.trim(),
          type: t.type === "Credit" ? "Credit" : "Debit",
          payment_method: (t.method || "UPI").trim() as any,
          notes: t.notes || "",
          tags: t.tags || [t.category.trim()],
          user_id: 1,
          firebase_uid: "demo-shopkeeper-uid",
          created_at: new Date().toISOString(),
        }
        setTransactions((prev) => {
          const updated = [newTx, ...prev]
          try {
            localStorage.setItem("voicekhata_demo_txs", JSON.stringify(updated))
          } catch {}
          return updated
        })
        return { data: newTx }
      }

      try {
        const { data, error } = await supabase
          .from("transactions")
          .insert([
            {
              firebase_uid: user.uid,
              transaction: t.transaction.trim(),
              category: t.category.trim(),
              amount: Number(t.amount),
              date: t.date.trim(),
              type: t.type === "Credit" ? "Credit" : "Debit",
              method: (t.method || "UPI").trim(),
              status: (t.status || "Completed").trim(),
            },
          ])
          .select()
          .single()

        if (error) throw error

        const created = data as Transaction
        setTransactions((prev) => {
          const exists = prev.some((row) => row.id === created.id)
          return exists ? prev : [created, ...prev]
        })

        void createTransactionNotification(user.uid, created).catch(() => undefined)
        return { data: created }
      } catch (err: any) {
        const message = err.message || "Failed to add transaction"
        setTransactionsError(message)
        return { error: message }
      }
    },
    [user?.uid]
  )

  const updateTransaction = useCallback(
    async (id: number, updates: TransactionUpdateInput) => {
      if (!user?.uid) return { error: "Please log in to update transactions." }

      if (user.uid === "demo-shopkeeper-uid") {
        let updatedTx: Transaction | undefined
        setTransactions((prev) => {
          const updated = prev.map((row) => {
            if (row.id === id) {
              updatedTx = { ...row, ...updates } as Transaction
              return updatedTx
            }
            return row
          })
          try {
            localStorage.setItem("voicekhata_demo_txs", JSON.stringify(updated))
          } catch {}
          return updated
        })
        return { data: updatedTx }
      }

      try {
        const { data, error } = await supabase
          .from("transactions")
          .update(updates)
          .eq("id", id)
          .eq("firebase_uid", user.uid)
          .select()
          .single()

        if (error) throw error

        const updated = data as Transaction
        setTransactions((prev) =>
          prev.map((row) => (row.id === id ? { ...row, ...updated } : row))
        )

        return { data: updated }
      } catch (err: any) {
        const message = err.message || "Failed to update transaction"
        setTransactionsError(message)
        return { error: message }
      }
    },
    [user?.uid]
  )

  const deleteTransaction = useCallback(
    async (id: number) => {
      if (!user?.uid) return

      if (user.uid === "demo-shopkeeper-uid") {
        setTransactions((prev) => {
          const updated = prev.filter((row) => row.id !== id)
          try {
            localStorage.setItem("voicekhata_demo_txs", JSON.stringify(updated))
          } catch {}
          return updated
        })
        return
      }

      try {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("firebase_uid", user.uid)

        if (error) throw error

        setTransactions((prev) => prev.filter((row) => row.id !== id))
      } catch (err: any) {
        setTransactionsError(err.message || "Failed to delete transaction")
      }
    },
    [user?.uid]
  )

  const addBudget = useCallback(
    async (input: BudgetInput) => {
      if (!user?.uid) return { error: "Please log in to add budgets." }

      const normalizedDuration = normalizeBudgetDuration(input.duration)

      try {
        const { data, error } = await supabase
          .from("budgets")
          .upsert(
            [
              {
                firebase_uid: user.uid,
                category: input.category.trim(),
                amount: Number(input.amount),
                month: selectedMonth,
                duration: normalizedDuration,
              },
            ],
            { onConflict: "firebase_uid,category,month" }
          )
          .select()
          .single()

        if (error) throw error

        const normalized: Budget = {
          ...(data as any),
          amount: Number(data.amount) || 0,
          spent: 0,
          duration: normalizeBudgetDuration(data.duration),
        }

        setAllBudgetRows((prev) => {
          const index = prev.findIndex((row) => row.id === normalized.id)
          if (index === -1) return [...prev, normalized]
          const next = [...prev]
          next[index] = normalized
          return next
        })

        return { data: normalized }
      } catch (err: any) {
        const message = err.message || "Failed to create budget"
        setBudgetsError(message)
        return { error: message }
      }
    },
    [user?.uid, selectedMonth]
  )

  const updateBudget = useCallback(
    async (id: string, updates: BudgetUpdateInput) => {
      if (!user?.uid) return { error: "Please log in to update budgets." }

      try {
        const { data, error } = await supabase
          .from("budgets")
          .update({
            category: updates.category.trim(),
            amount: Number(updates.amount),
            duration: normalizeBudgetDuration(updates.duration),
          })
          .eq("id", id)
          .eq("firebase_uid", user.uid)
          .select()
          .single()

        if (error) throw error

        const normalized: Budget = {
          ...(data as any),
          amount: Number(data.amount) || 0,
          spent: 0,
          duration: normalizeBudgetDuration(data.duration),
        }

        setAllBudgetRows((prev) => prev.map((row) => (row.id === id ? normalized : row)))
        return { data: normalized }
      } catch (err: any) {
        const message = err.message || "Failed to update budget"
        setBudgetsError(message)
        return { error: message }
      }
    },
    [user?.uid]
  )

  const deleteBudget = useCallback(
    async (id: string) => {
      if (!user?.uid) return

      try {
        const { error } = await supabase
          .from("budgets")
          .delete()
          .eq("id", id)
          .eq("firebase_uid", user.uid)

        if (error) throw error

        setAllBudgetRows((prev) => prev.filter((row) => row.id !== id))
      } catch (err: any) {
        setBudgetsError(err.message || "Failed to delete budget")
      }
    },
    [user?.uid]
  )

  const setMonthlyTotalCap = useCallback(
    async (cap: number | null) => {
      if (!user?.uid) return { error: "Please log in to configure budget cap." }

      try {
        if (cap === null) {
          const { error } = await supabase
            .from("user_budget_caps")
            .delete()
            .eq("firebase_uid", user.uid)
            .eq("month", selectedMonth)

          if (error) throw error
          setTotalCapByMonth((prev) => ({ ...prev, [selectedMonth]: null }))
          return {}
        }

        const { error } = await supabase
          .from("user_budget_caps")
          .upsert(
            { firebase_uid: user.uid, month: selectedMonth, total_cap: cap },
            { onConflict: "firebase_uid,month" }
          )

        if (error) throw error
        setTotalCapByMonth((prev) => ({ ...prev, [selectedMonth]: cap }))
        return {}
      } catch (err: any) {
        return { error: err.message || "Failed to set budget cap" }
      }
    },
    [user?.uid, selectedMonth]
  )

  const value = useMemo<FinancialContextValue>(
    () => ({
      transactions,
      transactionsLoading,
      transactionsError,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refetchTransactions,

      budgets,
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
    }),
    [
      transactions,
      transactionsLoading,
      transactionsError,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refetchTransactions,
      budgets,
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
    ]
  )

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>
}

export function useFinancialContext(): FinancialContextValue {
  const ctx = useContext(FinancialContext)
  if (!ctx) throw new Error("useFinancialContext must be used inside FinancialProvider")
  return ctx
}