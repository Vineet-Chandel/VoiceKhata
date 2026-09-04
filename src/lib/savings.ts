import { supabase } from "./supabase";

// ─── TYPES ───────────────────────────────────────────────

export interface SavingsGoal {
  id: string;
  firebase_uid: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  color: string;
  created_at: string;
}

export interface SIPPlan {
  id: string;
  firebase_uid: string;
  monthly_amount: number;
  duration_years: number;
  expected_return: number;
  start_date: string;
  active: boolean;
  created_at: string;
}

export interface ManualInvestment {
  id: string;
  firebase_uid: string;
  name: string;
  type: string;
  amount_invested: number;
  expected_return: number;
  added_at: string;
}

export interface RecurringSaving {
  id: string;
  firebase_uid: string;
  label: string;
  amount: number;
  frequency: string;
  active: boolean;
  created_at: string;
}

// ─── SAVINGS GOALS ───────────────────────────────────────

export async function getSavingsGoals(firebase_uid: string) {
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("firebase_uid", firebase_uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SavingsGoal[];
}

export async function addSavingsGoal(
  firebase_uid: string,
  payload: Omit<SavingsGoal, "id" | "firebase_uid" | "created_at">
) {
  const { data, error } = await supabase
    .from("savings_goals")
    .insert({ firebase_uid, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data as SavingsGoal;
}

export async function updateSavingsGoal(
  id: string,
  payload: Partial<Omit<SavingsGoal, "id" | "firebase_uid" | "created_at">>
) {
  const { data, error } = await supabase
    .from("savings_goals")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as SavingsGoal;
}

export async function deleteSavingsGoal(id: string) {
  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── SIP PLANS ───────────────────────────────────────────

export async function getSIPPlans(firebase_uid: string) {
  const { data, error } = await supabase
    .from("sip_plans")
    .select("*")
    .eq("firebase_uid", firebase_uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SIPPlan[];
}

export async function addSIPPlan(
  firebase_uid: string,
  payload: Omit<SIPPlan, "id" | "firebase_uid" | "created_at">
) {
  const { data, error } = await supabase
    .from("sip_plans")
    .insert({ firebase_uid, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data as SIPPlan;
}

export async function updateSIPPlan(
  id: string,
  payload: Partial<Omit<SIPPlan, "id" | "firebase_uid" | "created_at">>
) {
  const { data, error } = await supabase
    .from("sip_plans")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as SIPPlan;
}

export async function deleteSIPPlan(id: string) {
  const { error } = await supabase
    .from("sip_plans")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── MANUAL INVESTMENTS ──────────────────────────────────

export async function getManualInvestments(firebase_uid: string) {
  const { data, error } = await supabase
    .from("manual_investments")
    .select("*")
    .eq("firebase_uid", firebase_uid)
    .order("added_at", { ascending: false });
  if (error) throw error;
  return data as ManualInvestment[];
}

export async function addManualInvestment(
  firebase_uid: string,
  payload: Omit<ManualInvestment, "id" | "firebase_uid" | "added_at">
) {
  const { data, error } = await supabase
    .from("manual_investments")
    .insert({ firebase_uid, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data as ManualInvestment;
}

export async function updateManualInvestment(
  id: string,
  payload: Partial<Omit<ManualInvestment, "id" | "firebase_uid" | "added_at">>
) {
  const { data, error } = await supabase
    .from("manual_investments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ManualInvestment;
}

export async function deleteManualInvestment(id: string) {
  const { error } = await supabase
    .from("manual_investments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── RECURRING SAVINGS ───────────────────────────────────

export async function getRecurringSavings(firebase_uid: string) {
  const { data, error } = await supabase
    .from("recurring_savings")
    .select("*")
    .eq("firebase_uid", firebase_uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as RecurringSaving[];
}

export async function addRecurringSaving(
  firebase_uid: string,
  payload: Omit<RecurringSaving, "id" | "firebase_uid" | "created_at">
) {
  const { data, error } = await supabase
    .from("recurring_savings")
    .insert({ firebase_uid, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data as RecurringSaving;
}

export async function updateRecurringSaving(
  id: string,
  payload: Partial<Omit<RecurringSaving, "id" | "firebase_uid" | "created_at">>
) {
  const { data, error } = await supabase
    .from("recurring_savings")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as RecurringSaving;
}

export async function deleteRecurringSaving(id: string) {
  const { error } = await supabase
    .from("recurring_savings")
    .delete()
    .eq("id", id);
  if (error) throw error;
}