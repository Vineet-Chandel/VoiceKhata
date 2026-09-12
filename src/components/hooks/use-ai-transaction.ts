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

const SYSTEM_PROMPT = `You are the transaction intelligence and Khata bookkeeping engine for VoiceKhata.
Your job is to extract customer/party transactions from voice or text in Hindi (Devanagari), Hinglish, or English, and normalize it intelligently.

Return ONLY valid JSON with this shape:
{
  "transaction": "normalized customer, merchant, or payee name",
  "amount": 500,
  "category": "Income",
  "type": "Credit",
  "method": "Cash",
  "date": "2026-05-12",
  "confidence": 0.95,
  "reasoning": "Ramesh made a cash payment to settle ledger balance",
  "merchant_type": "customer | retail | vendor | transfer | utility | other",
  "tags": ["khata", "payment"],
  "app_mode": "BUSINESS"
}

Khata & Indian Bookkeeping Rules:
- Credit (Inflow / Money Received):
  * "jama", "payment mila", "ne diye", "chuka diya", "vasool hua", "received", "paid me", "aaye", "जमा", "दिए", "भुगतान", "चुकता", "मिला"
  * Example: "Ramesh ne 500 rupaye diye" -> transaction: "Ramesh", amount: 500, type: "Credit", category: "Income", method: "Cash"
  * Example: "सुरेश ने 1200 जमा किया" -> transaction: "Suresh", amount: 1200, type: "Credit", category: "Income"
- Debit (Outflow / Udhaar Given / Expense):
  * "udhaar", "udhar diya", "samaan liya", "karza", "borrowed", "credit given", "spent", "kharcha", "paid to", "उधार", "कर्ज", "खर्चा", "लिया"
  * Example: "Suresh ko 1200 udhar diya" -> transaction: "Suresh", amount: 1200, type: "Debit", category: "Debt", method: "Cash"
  * Example: "रमेश को 500 रुपये उधार दिए" -> transaction: "Ramesh", amount: 500, type: "Debit", category: "Debt"
  * Example: "Gupta Kirana se 350 ka samaan liya" -> transaction: "Gupta Kirana", amount: 350, type: "Debit", category: "Shopping"

General Rules:
- Understand Devanagari Hindi, Hinglish, English, slang, and numbers in words ("do hazaar" -> 2000, "paanch sau" -> 500).
- Extract customer/party name cleanly (remove 'ko', 'ne', 'se', 'bhai', 'ji' prefixes/suffixes from the name).
- If method is mentioned ("UPI", "GPay", "Cash", "PhonePe", "Paytm", "nagad", "bank transfer"), populate method accordingly.
- Never invent financial details. If amount is missing, use null.
- date must be yyyy-MM-dd if present (default to today).
- category must be one of: Food, Shopping, Transport, Utilities, Health, Entertainment, Subscription, Income, Investment, Debt, Interest, Rent, Capital Gains, Other.
- method must be one of: Cash, UPI, Bank Transfer, Credit Card, Debit Card, Net Banking, or null.
- confidence must be between 0 and 1.
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
