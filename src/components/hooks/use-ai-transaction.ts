import { useState } from "react"
import { format } from "date-fns"

export type AITransactionResult = {
  transaction: string
  amount: number | null
  category: string
  type: "Debit" | "Credit"
  method: string | null
  date: string | null
  confidence: number
  reasoning: string
  merchant_type?: string
  tags?: string[]
  app_mode?: "BUSINESS" | "PERSONAL"
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const SYSTEM_PROMPT = `You are the transaction intelligence engine for VoiceKhata.
Your job is to understand what the user likely spent money on (or received money from), then normalize it intelligently.

Return ONLY valid JSON with this shape:
{
  "transaction": "normalized merchant/payee name",
  "amount": 500,
  "category": "Subscription",
  "type": "Debit",
  "method": "UPI",
  "date": "2026-05-12",
  "confidence": 0.92,
  "reasoning": "short reason",
  "merchant_type": "saas | streaming | ecommerce | utility | food | transfer | salary | other",
  "tags": ["subscription", "ai-tool"],
  "app_mode": "BUSINESS"
}

Rules:
- Understand Hinglish, slang, and misspellings.
- Recognize technical finance terms in English and Hindi (e.g., "mutual fund", "SIP", "FD", "Fixed Deposit", "RD" -> Investment; "EMI", "loan", "udhaar", "karza" -> Debt; "byaaj", "vyaaj" -> Interest; "poonjigat labh" -> Capital Gains; "kiraya" -> Rent).
- Normalize merchant names globally (not India-only).
- Keep transaction as a clean proper name: e.g. "mxplayer pe kiye the" -> "MX Player".
- Infer category and debit/credit from intent.
- Do not reject unknown merchants. Make the best probable interpretation.
- If amount/method/date are missing, use null.
- date must be yyyy-MM-dd if present.
- category must be one of: Food, Shopping, Transport, Utilities, Health, Entertainment, Subscription, Income, Investment, Debt, Interest, Rent, Capital Gains, Other.
- method must be one of: Cash, UPI, Bank Transfer, Credit Card, Debit Card, Net Banking, or null.
- app_mode must be "BUSINESS" or "PERSONAL". If the user mentions "personal" or the context is clearly personal, use "PERSONAL". Otherwise default to "BUSINESS".
- confidence must be between 0 and 1.
- reasoning must be short and factual.
- Never output markdown.`

function sanitizeCategory(input: unknown): string {
  if (typeof input !== "string") return "Other"
  const value = input.trim()
  const allowed = new Set([
    "Food",
    "Shopping",
    "Transport",
    "Utilities",
    "Health",
    "Entertainment",
    "Subscription",
    "Income",
    "Investment",
    "Debt",
    "Interest",
    "Rent",
    "Capital Gains",
    "Other",
  ])
  return allowed.has(value) ? value : "Other"
}

function sanitizeMethod(input: unknown): string | null {
  if (typeof input !== "string") return null
  const value = input.trim()
  const allowed = new Set([
    "Cash",
    "UPI",
    "Bank Transfer",
    "Credit Card",
    "Debit Card",
    "Net Banking",
  ])
  return allowed.has(value) ? value : null
}

function sanitizeType(input: unknown): "Debit" | "Credit" {
  return input === "Credit" ? "Credit" : "Debit"
}

function sanitizeConfidence(input: unknown): number {
  if (typeof input !== "number" || Number.isNaN(input)) return 0.5
  if (input < 0) return 0
  if (input > 1) return 1
  return input
}

export function useAITransaction() {
  const [loading, setLoading] = useState(false)

  const parseTransaction = async (message: string): Promise<AITransactionResult | null> => {
    if (!message.trim()) return null
    setLoading(true)

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY as string
      if (!apiKey) {
        console.error("[useAITransaction] VITE_GROQ_API_KEY not set")
        return null
      }

      const today = format(new Date(), "yyyy-MM-dd")

      const models = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.6-27b",
        "groq/compound",
      ]

      let data: any = null

      for (const model of models) {
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
                { role: "system", content: `${SYSTEM_PROMPT}\nToday's date is ${today}.` },
                { role: "user", content: message },
              ],
              temperature: 0.1,
              max_tokens: 350,
              response_format: { type: "json_object" },
            }),
          })

          if (res.ok) {
            data = await res.json()
            break
          }
        } catch {
          continue
        }
      }

      if (!data) {
        console.error("[useAITransaction] All Groq models failed")
        return null
      }
      const content = data?.choices?.[0]?.message?.content ?? "{}"
      const parsed = JSON.parse(content)

      return {
        transaction: typeof parsed.transaction === "string" && parsed.transaction.trim()
          ? parsed.transaction.trim()
          : message.trim(),
        amount: typeof parsed.amount === "number" ? parsed.amount : null,
        category: sanitizeCategory(parsed.category),
        type: sanitizeType(parsed.type),
        method: sanitizeMethod(parsed.method),
        date: typeof parsed.date === "string" && parsed.date.trim() ? parsed.date.trim() : today,
        confidence: sanitizeConfidence(parsed.confidence),
        reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
        merchant_type: typeof parsed.merchant_type === "string" ? parsed.merchant_type.trim() : undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags.filter((tag: unknown) => typeof tag === "string") : undefined,
        app_mode: parsed.app_mode === "PERSONAL" ? "PERSONAL" : "BUSINESS",
      }
    } catch (err) {
      console.error("[useAITransaction] Fetch error:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { parseTransaction, loading }
}
