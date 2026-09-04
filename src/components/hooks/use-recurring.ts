// src/components/hooks/use-recurring.ts
import { useEffect, useState } from "react"
import { supabase }            from "@/lib/supabase"
import { useAuth }             from "@/components/hooks/use-auth"
import { format, addDays, addWeeks, addMonths, addYears, parseISO } from "date-fns"

export type RecurringTransaction = {
  id:           string
  firebase_uid: string
  transaction:  string
  category:     string
  amount:       number
  type:         string
  method:       string
  frequency:    "daily" | "weekly" | "monthly" | "yearly"
  start_date:   string
  next_run:     string
  end_date:     string | null
  active:       boolean
  created_at?:  string
}

export type RecurringInput = Omit<RecurringTransaction, "id" | "firebase_uid" | "created_at">

function calcNextRun(from: string, frequency: RecurringTransaction["frequency"]): string {
  const date = parseISO(from)
  switch (frequency) {
    case "daily":   return format(addDays(date, 1),   "yyyy-MM-dd")
    case "weekly":  return format(addWeeks(date, 1),  "yyyy-MM-dd")
    case "monthly": return format(addMonths(date, 1), "yyyy-MM-dd")
    case "yearly":  return format(addYears(date, 1),  "yyyy-MM-dd")
  }
}

export function useRecurring(
  addTransaction: (t: {
    transaction: string
    category:    string
    amount:      number
    date:        string
    type:        string
    method:      string
    status:      string
  }) => Promise<{ error?: string; data?: unknown } | undefined>
) {
  const { user } = useAuth()
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const fetchRecurring = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("firebase_uid", user.uid)
      .order("created_at", { ascending: false })
    if (error) setError(error.message)
    else       setRecurring(data || [])
    setLoading(false)
  }

  const addRecurring = async (input: RecurringInput) => {
    if (!user) return { error: "Not logged in" }

    console.log("Adding recurring:", input)  // ← add this

    const { data, error } = await supabase
        .from("recurring_transactions")
        .insert([{ ...input, firebase_uid: user.uid }])
        .select()
        .single()

    console.log("Result:", { data, error })  // ← and this

    if (error) { setError(error.message); return { error: error.message } }
    setRecurring((prev) => [data, ...prev])
    return { data }
    }

  const updateRecurring = async (id: string, updates: Partial<RecurringInput>) => {
    if (!user) return { error: "Not logged in" }
    const { data, error } = await supabase
      .from("recurring_transactions")
      .update(updates)
      .eq("id", id)
      .eq("firebase_uid", user.uid)
      .select()
      .single()
    if (error) { setError(error.message); return { error: error.message } }
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
    return { data }
  }

  const toggleRecurring = async (id: string, active: boolean) =>
    updateRecurring(id, { active })

  const deleteRecurring = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from("recurring_transactions")
      .delete()
      .eq("id", id)
      .eq("firebase_uid", user.uid)
    if (error) setError(error.message)
    else       setRecurring((prev) => prev.filter((r) => r.id !== id))
  }

  const processDueRecurring = async () => {
    if (!user) return
    const today = format(new Date(), "yyyy-MM-dd")

    const { data: due, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("firebase_uid", user.uid)
      .eq("active", true)
      .lte("next_run", today)

    if (error || !due?.length) return

    for (const r of due as RecurringTransaction[]) {
      // ── Auto-deactivate if past end_date ───────────────────────────────
      if (r.end_date && r.next_run > r.end_date) {
        await supabase
          .from("recurring_transactions")
          .update({ active: false })
          .eq("id", r.id)
        setRecurring((prev) =>
          prev.map((rec) => (rec.id === r.id ? { ...rec, active: false } : rec))
        )
        continue
      }

      // ── Add the transaction ────────────────────────────────────────────
      await addTransaction({
        transaction: r.transaction,
        category:    r.category,
        amount:      r.amount,
        date:        r.next_run,
        type:        r.type,
        method:      r.method,
        status:      "Completed",
      })

      // ── Advance next_run ───────────────────────────────────────────────
      const newNextRun = calcNextRun(r.next_run, r.frequency)
      await supabase
        .from("recurring_transactions")
        .update({ next_run: newNextRun })
        .eq("id", r.id)
      setRecurring((prev) =>
        prev.map((rec) => (rec.id === r.id ? { ...rec, next_run: newNextRun } : rec))
      )
    }
  }

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`recurring-${user.uid}`)
      .on("postgres_changes", {
        event: "*", schema: "public",
        table: "recurring_transactions",
        filter: `firebase_uid=eq.${user.uid}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setRecurring((prev) => {
            const exists = prev.some((r) => r.id === (payload.new as RecurringTransaction).id)
            return exists ? prev : [payload.new as RecurringTransaction, ...prev]
          })
        }
        if (payload.eventType === "DELETE") {
          setRecurring((prev) =>
            prev.filter((r) => r.id !== (payload.old as RecurringTransaction).id)
          )
        }
        if (payload.eventType === "UPDATE") {
          setRecurring((prev) =>
            prev.map((r) =>
              r.id === (payload.new as RecurringTransaction).id
                ? (payload.new as RecurringTransaction) : r
            )
          )
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  useEffect(() => {
    if (user) { fetchRecurring(); processDueRecurring() }
    else      { setRecurring([]); setLoading(false) }
  }, [user])

  return {
    recurring, loading, error,
    addRecurring, updateRecurring, toggleRecurring,
    deleteRecurring, refetch: fetchRecurring,
  }
}