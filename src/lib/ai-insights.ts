// src/lib/ai-insights.ts
import { supabase } from "./supabase";
import { type SavingsGoal, type SIPPlan, type ManualInvestment, type RecurringSaving } from "./savings";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface AIInsightResult {
  health_score: number;          // 0–100
  risk_level: "Low" | "Medium" | "High";
  status_label: string;          // e.g. "Financially Stable"
  behavioral: string;
  predictive: string;
  risk_alert: string | null;
  optimization: string;
  investment_advice: string | null;
  goal_prediction: string | null;
  burn_rate_warning: string | null;
}

export interface FinancialPayload {
  monthly_income: number;
  total_saved: number;
  total_target: number;
  total_invested: number;
  savings_rate_percent: number;
  active_sip_monthly: number;
  goals: { name: string; saved: number; target: number; deadline: string | null }[];
  sip_plans: { monthly_amount: number; duration_years: number; expected_return: number; active: boolean }[];
  investments: { name: string; type: string; amount_invested: number; expected_return: number }[];
  recurring_savings: { label: string; amount: number; frequency: string; active: boolean }[];
  overdue_goals: string[];
  emergency_fund_percent: number;
  investment_types: string[];
}

// ─── FETCH USER INCOME FROM SUPABASE ────────────────────────────────────────

export async function getUserIncome(firebase_uid: string): Promise<number> {
  const { data } = await supabase
    .from("user_profiles")
    .select("monthly_income")
    .eq("firebase_uid", firebase_uid)
    .single();
  return data?.monthly_income ?? 0;
}

// ─── BUILD PAYLOAD ───────────────────────────────────────────────────────────

export function buildFinancialPayload(
  goals: SavingsGoal[],
  sipPlans: SIPPlan[],
  investments: ManualInvestment[],
  recurringSavings: RecurringSaving[],
  monthlyIncome: number
): FinancialPayload {
  const totalSaved = goals.reduce((s, g) => s + g.saved_amount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalInvested = investments.reduce((s, i) => s + i.amount_invested, 0);
  const activeSIPMonthly = sipPlans
    .filter((s) => s.active)
    .reduce((s, p) => s + p.monthly_amount, 0);
  const savingsRatePercent =
    monthlyIncome > 0
      ? Math.round(((activeSIPMonthly + totalSaved / 12) / monthlyIncome) * 100)
      : totalTarget > 0
      ? Math.round((totalSaved / totalTarget) * 100)
      : 0;

  const overdueGoals = goals
    .filter((g) => g.deadline && new Date(g.deadline) < new Date() && g.saved_amount < g.target_amount)
    .map((g) => g.name);

  const emergencyGoal = goals.find((g) => g.name.toLowerCase().includes("emergency"));
  const emergencyFundPercent = emergencyGoal
    ? Math.min(Math.round((emergencyGoal.saved_amount / emergencyGoal.target_amount) * 100), 100)
    : 0;

  const investmentTypes = [...new Set(investments.map((i) => i.type))];

  return {
    monthly_income: monthlyIncome,
    total_saved: totalSaved,
    total_target: totalTarget,
    total_invested: totalInvested,
    savings_rate_percent: savingsRatePercent,
    active_sip_monthly: activeSIPMonthly,
    goals: goals.map((g) => ({
      name: g.name,
      saved: g.saved_amount,
      target: g.target_amount,
      deadline: g.deadline,
    })),
    sip_plans: sipPlans.map((s) => ({
      monthly_amount: s.monthly_amount,
      duration_years: s.duration_years,
      expected_return: s.expected_return,
      active: s.active,
    })),
    investments: investments.map((i) => ({
      name: i.name,
      type: i.type,
      amount_invested: i.amount_invested,
      expected_return: i.expected_return,
    })),
    recurring_savings: recurringSavings.map((r) => ({
      label: r.label,
      amount: r.amount,
      frequency: r.frequency,
      active: r.active,
    })),
    overdue_goals: overdueGoals,
    emergency_fund_percent: emergencyFundPercent,
    investment_types: investmentTypes,
  };
}

// ─── CALL GROQ API ───────────────────────────────────────────────────────────

export async function getAIInsights(
  payload: FinancialPayload,
  apiKey: string
): Promise<AIInsightResult> {
  const systemPrompt = `You are an expert personal financial advisor AI for Indian users. 
Analyze the user's financial data and return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "health_score": <integer 0-100>,
  "risk_level": <"Low" | "Medium" | "High">,
  "status_label": <short status like "Financially Stable" | "At Risk" | "Building Wealth" | "Needs Attention">,
  "behavioral": <one sentence behavioral pattern insight>,
  "predictive": <one sentence prediction about their financial future>,
  "risk_alert": <one sentence risk warning or null if no major risk>,
  "optimization": <one sentence actionable optimization tip>,
  "investment_advice": <one sentence investment suggestion or null if well diversified>,
  "goal_prediction": <one sentence about when they'll reach their nearest goal or null>,
  "burn_rate_warning": <one sentence about spending pace or null if income data unavailable>
}

Rules:
- Use Indian Rupee (₹) in all values
- Be specific with numbers where possible
- health_score: 80-100 = great, 60-79 = good, 40-59 = needs work, 0-39 = at risk
- Consider Indian financial context (FDs, SIPs, mutual funds, gold)
- Keep each insight to 1-2 sentences max`;

  const userPrompt = `Analyze my financial data and return JSON insights:
${JSON.stringify(payload, null, 2)}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as AIInsightResult;
}