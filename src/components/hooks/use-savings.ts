// src/components/hooks/use-savings.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import {
  getSavingsGoals,
  addSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getSIPPlans,
  addSIPPlan,
  updateSIPPlan,
  deleteSIPPlan,
  getManualInvestments,
  addManualInvestment,
  updateManualInvestment,
  deleteManualInvestment,
  getRecurringSavings,
  addRecurringSaving,
  updateRecurringSaving,
  deleteRecurringSaving,
  type SavingsGoal,
  type SIPPlan,
  type ManualInvestment,
  type RecurringSaving,
} from "@/lib/savings";

export function useSavings() {
  const { user } = useAuth();
  const firebase_uid = user?.uid ?? "";

  // ─── STATE ───────────────────────────────────────────────
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [sipPlans, setSipPlans] = useState<SIPPlan[]>([]);
  const [investments, setInvestments] = useState<ManualInvestment[]>([]);
  const [recurringSavings, setRecurringSavings] = useState<RecurringSaving[]>([]);

  const [loadingGoals, setLoadingGoals] = useState(false);
  const [loadingSIP, setLoadingSIP] = useState(false);
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const [loadingRecurring, setLoadingRecurring] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ─── FETCH ALL ───────────────────────────────────────────
  const fetchGoals = useCallback(async () => {
    if (!firebase_uid) return;
    setLoadingGoals(true);
    try {
      const data = await getSavingsGoals(firebase_uid);
      setGoals(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingGoals(false);
    }
  }, [firebase_uid]);

  const fetchSIPPlans = useCallback(async () => {
    if (!firebase_uid) return;
    setLoadingSIP(true);
    try {
      const data = await getSIPPlans(firebase_uid);
      setSipPlans(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingSIP(false);
    }
  }, [firebase_uid]);

  const fetchInvestments = useCallback(async () => {
    if (!firebase_uid) return;
    setLoadingInvestments(true);
    try {
      const data = await getManualInvestments(firebase_uid);
      setInvestments(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingInvestments(false);
    }
  }, [firebase_uid]);

  const fetchRecurringSavings = useCallback(async () => {
    if (!firebase_uid) return;
    setLoadingRecurring(true);
    try {
      const data = await getRecurringSavings(firebase_uid);
      setRecurringSavings(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingRecurring(false);
    }
  }, [firebase_uid]);

  useEffect(() => {
    if (!firebase_uid) return;
    fetchGoals();
    fetchSIPPlans();
    fetchInvestments();
    fetchRecurringSavings();
  }, [firebase_uid]);

  // ─── GOALS CRUD ──────────────────────────────────────────
  const createGoal = async (
    payload: Omit<SavingsGoal, "id" | "firebase_uid" | "created_at">
  ) => {
    const newGoal = await addSavingsGoal(firebase_uid, payload);
    setGoals((prev) => [newGoal, ...prev]);
  };

  const editGoal = async (
    id: string,
    payload: Partial<Omit<SavingsGoal, "id" | "firebase_uid" | "created_at">>
  ) => {
    const updated = await updateSavingsGoal(id, payload);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
  };

  const removeGoal = async (id: string) => {
    await deleteSavingsGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // ─── SIP CRUD ────────────────────────────────────────────
  const createSIP = async (
    payload: Omit<SIPPlan, "id" | "firebase_uid" | "created_at">
  ) => {
    const newSIP = await addSIPPlan(firebase_uid, payload);
    setSipPlans((prev) => [newSIP, ...prev]);
  };

  const editSIP = async (
    id: string,
    payload: Partial<Omit<SIPPlan, "id" | "firebase_uid" | "created_at">>
  ) => {
    const updated = await updateSIPPlan(id, payload);
    setSipPlans((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const removeSIP = async (id: string) => {
    await deleteSIPPlan(id);
    setSipPlans((prev) => prev.filter((s) => s.id !== id));
  };

  // ─── INVESTMENTS CRUD ────────────────────────────────────
  const createInvestment = async (
    payload: Omit<ManualInvestment, "id" | "firebase_uid" | "added_at">
  ) => {
    const newInv = await addManualInvestment(firebase_uid, payload);
    setInvestments((prev) => [newInv, ...prev]);
  };

  const editInvestment = async (
    id: string,
    payload: Partial<Omit<ManualInvestment, "id" | "firebase_uid" | "added_at">>
  ) => {
    const updated = await updateManualInvestment(id, payload);
    setInvestments((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const removeInvestment = async (id: string) => {
    await deleteManualInvestment(id);
    setInvestments((prev) => prev.filter((i) => i.id !== id));
  };

  // ─── RECURRING SAVINGS CRUD ──────────────────────────────
  const createRecurringSaving = async (
    payload: Omit<RecurringSaving, "id" | "firebase_uid" | "created_at">
  ) => {
    const newRec = await addRecurringSaving(firebase_uid, payload);
    setRecurringSavings((prev) => [newRec, ...prev]);
  };

  const editRecurringSaving = async (
    id: string,
    payload: Partial<Omit<RecurringSaving, "id" | "firebase_uid" | "created_at">>
  ) => {
    const updated = await updateRecurringSaving(id, payload);
    setRecurringSavings((prev) =>
      prev.map((r) => (r.id === id ? updated : r))
    );
  };

  const removeRecurringSaving = async (id: string) => {
    await deleteRecurringSaving(id);
    setRecurringSavings((prev) => prev.filter((r) => r.id !== id));
  };

  // ─── COMPUTED ────────────────────────────────────────────
  const totalInvested = investments.reduce(
    (sum, i) => sum + i.amount_invested, 0
  );

  const totalSaved = goals.reduce(
    (sum, g) => sum + g.saved_amount, 0
  );

  const totalTarget = goals.reduce(
    (sum, g) => sum + g.target_amount, 0
  );

  return {
    // data
    goals,
    sipPlans,
    investments,
    recurringSavings,

    // loading
    loadingGoals,
    loadingSIP,
    loadingInvestments,
    loadingRecurring,

    // error
    error,

    // goals
    createGoal,
    editGoal,
    removeGoal,

    // sip
    createSIP,
    editSIP,
    removeSIP,

    // investments
    createInvestment,
    editInvestment,
    removeInvestment,

    // recurring
    createRecurringSaving,
    editRecurringSaving,
    removeRecurringSaving,

    // computed
    totalInvested,
    totalSaved,
    totalTarget,

    // refetch
    fetchGoals,
    fetchSIPPlans,
    fetchInvestments,
    fetchRecurringSavings,
  };
}