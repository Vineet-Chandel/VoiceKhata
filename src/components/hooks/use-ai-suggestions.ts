import { useEffect, useRef, useState, useCallback } from "react"
import { format } from "date-fns"
import type { Transaction } from "@/components/hooks/use-transactions"
import type { Budget } from "@/components/hooks/use-budgets"
import type { FinancialMetrics } from "@/lib/financial-metrics"
import type { AppMode } from "@/context/AppModeContext"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_FALLBACK_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
] as const
const CACHE_KEY = "voicekhata_ai_suggestions"

function buildHash(transactions: Transaction[], budgets: Budget[], metrics: FinancialMetrics, salt: number, appMode: string = "BUSINESS"): string {
  const tx = transactions.map((t) => `${t.id}-${t.amount}-${t.type}-${t.category}`).join("|")
  const bg = budgets.map((b) => `${b.category}-${b.amount}-${b.spent}-${b.month}`).join("|")
  const mx = `${metrics.totalIncome}-${metrics.totalExpense}-${metrics.savingsRate}-${metrics.currentMonth.monthKey}`
  return `${appMode}__${tx}__${bg}__${mx}__${salt}`
}

function getCache(hash: string): string[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.hash === hash ? parsed.suggestions : null
  } catch {
    return null
  }
}

function setCache(hash: string, suggestions: string[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ hash, suggestions }))
  } catch {
    // ignore cache errors
  }
}

function normalizeSuggestionText(text: string, canonicalSavingsRate: number): string {
  return text
    .replace(/^\s*[-*]\s*/g, "")
    .replace(/^\s*\d+[.)]\s*/g, "")
    .replace(/\bsavings rate of \d{1,3}%/gi, `savings rate of ${canonicalSavingsRate}%`)
    .replace(/\b\d{1,3}%\s+savings rate\b/gi, `${canonicalSavingsRate}% savings rate`)
    .replace(/\bsavings (?:are|is|at)\s+\d{1,3}%/gi, `savings are at ${canonicalSavingsRate}%`)
    .replace(/\b\d{1,3}%\s*saved\b/gi, `${canonicalSavingsRate}% saved`)
    .replace(/\b\d{1,3}%\s+savings\b/gi, `${canonicalSavingsRate}% savings`)
    .trim()
}

async function fetchFromGroq(
  transactions: Transaction[],
  budgets: Budget[],
  metrics: FinancialMetrics,
  appMode: AppMode = "BUSINESS"
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string

  // Business metrics calculation
  const todayStr = format(new Date(), "yyyy-MM-dd")
  const todaySales = transactions.filter((t) => t.date === todayStr && (t.type === "Credit" || t.category === "Sales")).reduce((s, t) => s + t.amount, 0)
  const todayCredit = transactions.filter((t) => t.date === todayStr && t.type === "Debit").reduce((s, t) => s + t.amount, 0)

  const partyMap = new Map<string, number>()
  transactions.forEach((t) => {
    const party = (t.transaction || "Customer").trim().toLowerCase()
    const bal = partyMap.get(party) ?? 0
    if (t.type === "Credit") partyMap.set(party, bal - Number(t.amount || 0))
    else partyMap.set(party, bal + Number(t.amount || 0))
  })
  const debtors = Array.from(partyMap.entries()).filter(([_, b]) => b > 0)
  const totalReceivables = debtors.reduce((sum, [_, b]) => sum + b, 0)

  const fallbackBusiness = [
    totalReceivables > 0
      ? `You have ₹${totalReceivables.toLocaleString("en-IN")} pending in customer Udhaar. Send polite payment reminders to clear dues.`
      : "All customer khata accounts are settled with zero pending dues.",
    todaySales > 0
      ? `Today's logged sales stand at ₹${todaySales.toLocaleString("en-IN")}. Log every cash and UPI sale promptly.`
      : "Start recording today's sales and customer cash/UPI payments to keep your books updated.",
    "Record every credit sale immediately in VoiceKhata to prevent forgotten dues.",
    "Review your customer ledgers in Khata book to prioritize collections this week.",
    "Maintain a healthy cash reserve before placing large supplier restock orders.",
    "Track your daily cash in drawer against recorded sales at closing time.",
  ]

  if (!apiKey) {
    return appMode === "BUSINESS" ? fallbackBusiness : []
  }

  let systemPrompt = "You are a personal finance assistant for Indian users."
  let prompt = ""

  if (appMode === "BUSINESS") {
    systemPrompt = "You are VoiceKhata AI, an intelligent Digital Munim and shopkeeper business assistant."
    prompt = `You are VoiceKhata AI, a Digital Munim and shopkeeper business assistant.

Use ONLY the numbers provided below. Do NOT give personal finance advice like mutual funds, personal salary savings rate, or grocery budget tips.

Business Metrics:
- Today's Sales: Rs.${todaySales.toLocaleString("en-IN")}
- Today's Credit Given (Udhaar): Rs.${todayCredit.toLocaleString("en-IN")}
- Total Sales & Inflow: Rs.${metrics.totalIncome.toLocaleString("en-IN")}
- Total Business Outflows & Purchases: Rs.${metrics.totalExpense.toLocaleString("en-IN")}
- Net Cash Flow: Rs.${(metrics.totalIncome - metrics.totalExpense).toLocaleString("en-IN")}
- Outstanding Customer Receivables: Rs.${totalReceivables.toLocaleString("en-IN")} across ${debtors.length} customer(s)

Task:
Generate exactly 6 short, actionable business suggestions focusing on:
- Customer Udhaar recovery and follow-ups
- Cash flow health
- Daily sales tracking and credit recording
- Inventory re-stocking readiness
- Supplier payment discipline

Output Rules:
- Return exactly 6 suggestions.
- Each suggestion max 1 sentence.
- Do not number.
- Separate each suggestion with "|" only.
- Return no extra wrapper text.`
  } else {
    const topCategories = metrics.budgetUtilization.byCategory
      .filter((row) => row.spent > 0)
      .slice(0, 5)
      .map((row) => `${row.category}: Rs.${row.spent.toLocaleString("en-IN")}`)
      .join(", ") || "No expenses this month"

    const budgetInsights = metrics.budgetUtilization.byCategory.length > 0
      ? metrics.budgetUtilization.byCategory
        .map((row) => {
          if (row.budget <= 0) {
            return `${row.category}: spent Rs.${row.spent.toLocaleString("en-IN")} (no budget set)`
          }
          return `${row.category}: Rs.${row.spent.toLocaleString("en-IN")} / Rs.${row.budget.toLocaleString("en-IN")} (${row.utilizationRate}%)`
        })
        .join("\n")
      : "No budgets set for current month"

    prompt = `You are VoiceKhata AI, a practical Indian finance companion.

Use ONLY the exact numbers provided below. Do not invent percentages or totals.
If you mention savings rate, you MUST use the canonical savings rate exactly as given.

Financial Metrics:
- Canonical Savings Rate: ${metrics.savingsRate}%
- Total Income: Rs.${metrics.totalIncome.toLocaleString("en-IN")}
- Total Expense: Rs.${metrics.totalExpense.toLocaleString("en-IN")}
- Total Savings: Rs.${metrics.savings.toLocaleString("en-IN")}
- Current Month Income (${metrics.currentMonth.monthKey}): Rs.${metrics.currentMonth.totalIncome.toLocaleString("en-IN")}
- Current Month Expense (${metrics.currentMonth.monthKey}): Rs.${metrics.currentMonth.totalExpense.toLocaleString("en-IN")}
- Current Month Savings: Rs.${metrics.currentMonth.savings.toLocaleString("en-IN")}
- Current Month Savings Rate: ${metrics.currentMonth.savingsRate}%
- Budget Utilization: ${metrics.budgetUtilization.utilizationRate}%
- Top Categories: ${topCategories}

Budgets:
${budgetInsights}

Task:
Generate exactly 6 short, personalized suggestions.

Output Rules:
- Return exactly 6 suggestions.
- Each suggestion max 1 sentence.
- Do not number.
- Separate each suggestion with "|" only.
- Return no extra wrapper text.`
  }

  let lastError: Error | null = null

  for (const model of GROQ_FALLBACK_MODELS) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
      })

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}))
        let errMsg = `Gemini API error: ${res.status}`
        if (Array.isArray(errorPayload) && errorPayload[0]?.error?.message) {
          errMsg = errorPayload[0].error.message
        } else if (errorPayload?.error?.message) {
          errMsg = errorPayload.error.message
        }
        
        if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("valid api key")) {
          throw new Error(errMsg)
        }

        if (res.status === 404 || res.status === 400 || errMsg.toLowerCase().includes("does not exist") || errMsg.toLowerCase().includes("not found")) {
          lastError = new Error(errMsg)
          continue
        }
        
        throw new Error(errMsg)
      }
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content ?? ""
      const suggestions = content
        .split("|")
        .map((line: string) => (appMode === "BUSINESS" ? line.trim() : normalizeSuggestionText(line, metrics.savingsRate)))
        .filter(Boolean)
        .slice(0, 6)

      if (suggestions.length > 0) {
        return suggestions
      }
    } catch {
      continue
    }
  }

  return appMode === "BUSINESS" ? fallbackBusiness : []
}

export function useAISuggestions(
  transactions: Transaction[],
  budgets: Budget[],
  metrics: FinancialMetrics,
  dataLoading: boolean,
  appMode: AppMode = "BUSINESS"
) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  const fetchingRef = useRef(false)
  const lastHashRef = useRef("")

  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY)
    lastHashRef.current = ""
    fetchingRef.current = false
    setRefreshCount((n) => n + 1)
  }, [])

  const txKey = JSON.stringify(transactions)
  const budgetKey = JSON.stringify(budgets)

  useEffect(() => {
    if (dataLoading) return

    const hash = buildHash(transactions, budgets, metrics, refreshCount, appMode)
    if (hash === lastHashRef.current) return
    if (fetchingRef.current) return

    const cached = refreshCount === 0 ? getCache(hash) : null
    if (cached) {
      lastHashRef.current = hash
      setSuggestions(cached)
      return
    }

    lastHashRef.current = hash
    fetchingRef.current = true
    setLoading(true)

    fetchFromGroq(transactions, budgets, metrics, appMode).then((result) => {
      if (result.length > 0) {
        setCache(hash, result)
        setSuggestions(result)
      }
      setLoading(false)
      fetchingRef.current = false
    })
  }, [dataLoading, txKey, budgetKey, metrics, refreshCount, transactions, budgets, appMode])

  return { suggestions, loading, refresh }
}
