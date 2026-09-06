import { useEffect, useRef, useState, useCallback } from "react"
import type { Transaction } from "@/components/hooks/use-transactions"
import type { Budget } from "@/components/hooks/use-budgets"
import type { FinancialMetrics } from "@/lib/financial-metrics"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "groq/compound",
  "llama-3.3-70b-versatile",
] as const
const CACHE_KEY = "voicekhata_ai_suggestions"

function buildHash(transactions: Transaction[], budgets: Budget[], metrics: FinancialMetrics, salt: number): string {
  const tx = transactions.map((t) => `${t.id}-${t.amount}-${t.type}-${t.category}`).join("|")
  const bg = budgets.map((b) => `${b.category}-${b.amount}-${b.spent}-${b.month}`).join("|")
  const mx = `${metrics.totalIncome}-${metrics.totalExpense}-${metrics.savingsRate}-${metrics.currentMonth.monthKey}`
  return `${tx}__${bg}__${mx}__${salt}`
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
  metrics: FinancialMetrics
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string
  if (!apiKey) return []

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

  const prompt = `You are VoiceKhata AI, a practical Indian finance companion.

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
            { role: "system", content: "You are a personal finance assistant for Indian users." },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
      })

      if (!res.ok) {
        continue
      }
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content ?? ""
      const suggestions = content
        .split("|")
        .map((line: string) => normalizeSuggestionText(line, metrics.savingsRate))
        .filter(Boolean)
        .slice(0, 6)

      if (suggestions.length > 0) {
        return suggestions
      }
    } catch {
      continue
    }
  }

  return []
}

export function useAISuggestions(
  transactions: Transaction[],
  budgets: Budget[],
  metrics: FinancialMetrics,
  dataLoading: boolean
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

    const hash = buildHash(transactions, budgets, metrics, refreshCount)
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

    fetchFromGroq(transactions, budgets, metrics).then((result) => {
      if (result.length > 0) {
        setCache(hash, result)
        setSuggestions(result)
      }
      setLoading(false)
      fetchingRef.current = false
    })
  }, [dataLoading, txKey, budgetKey, metrics, refreshCount, transactions, budgets])

  return { suggestions, loading, refresh }
}
