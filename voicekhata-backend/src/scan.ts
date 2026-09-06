import { Router, Request, Response } from "express"
import axios from "axios"

const router = Router()

export type ScannedReceipt = {
  transaction?: string
  amount?: number
  date?: string
  category?: string
  method?: string
  type?: "Debit" | "Credit"
  confidence: "high" | "medium" | "low"
  raw?: string
}

export type ScannedReceiptMulti = {
  transactions: ScannedReceipt[]
  confidence: "high" | "medium" | "low"
  raw?: string
}

const SINGLE_PROMPT = `You are a receipt data extractor for an Indian finance app.
Analyze this receipt/bill image and extract transaction details.
Respond ONLY with a valid JSON object — no markdown, no explanation, no backticks.

JSON format:
{
  "transaction": "merchant name or transaction description",
  "amount": 5000,
  "date": "2026-04-20",
  "category": "Food",
  "method": "UPI",
  "type": "Debit",
  "confidence": "high"
}

Rules:
- amount must be a plain number like 499 — no ₹ symbol
- date must be yyyy-MM-dd format or null
- category must be one of: Income, Subscription, Food, Shopping, Utilities, Transport, Health, Entertainment, Other
- method must be one of: UPI, Credit Card, Debit Card, Net Banking, Cash, Bank Transfer, or null
- type must be exactly "Debit" or "Credit"
- NEVER return markdown or backticks — raw JSON only`

const MULTI_PROMPT = `You are a transaction extractor for an Indian finance app.
This image may be a bank statement, UPI app screenshot, or list of transactions.
Extract ALL transactions visible in the image.
Respond ONLY with a valid JSON array — no markdown, no explanation, no backticks.

JSON format:
[
  {
    "transaction": "merchant or description",
    "amount": 500,
    "date": "2026-04-20",
    "category": "Food",
    "method": "UPI",
    "type": "Debit",
    "confidence": "high"
  }
]

Rules:
- amount is always a plain positive number — no ₹ symbol
- date must be yyyy-MM-dd; if unclear use today's date
- category: Income | Subscription | Food | Shopping | Utilities | Transport | Health | Entertainment | Other
- method: UPI | Credit Card | Debit Card | Net Banking | Cash | Bank Transfer — or null if unclear
- type: "Debit" for money going out, "Credit" for money coming in
- If only 1 transaction visible, still return a JSON array with 1 item
- NEVER return markdown or backticks — raw JSON array only`

async function callGroqVision(base64: string, prompt: string, mimeType = "image/jpeg"): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  console.log(
    "[DEBUG scan.ts] GROQ_API_KEY check -> present:",
    !!apiKey,
    "length:",
    apiKey ? apiKey.length : 0,
    "preview:",
    apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "none"
  )

  if (!apiKey || apiKey.startsWith("eyJ")) {
    throw {
      status: 401,
      code: "AUTH_ERROR",
      message: "Server GROQ_API_KEY is not configured or invalid in backend .env",
    }
  }

  const model = process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b"

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: model,
        max_tokens: 1024,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 30000,
      }
    )

    return response.data?.choices?.[0]?.message?.content?.trim() ?? ""
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const errData = err?.response?.data?.error

    console.error(`[Scan Backend] Groq vision (${model}) call failed (${status}):`, errData?.message || err.message)

    // Check if OpenRouter fallback is configured
    const openRouterKey = process.env.OPENROUTER_API_KEY
    if (openRouterKey && (status === 401 || status === 403 || status === 404 || status === 429)) {
      console.log("[Scan Backend] Attempting OpenRouter vision fallback...")
      try {
        const fallbackRes = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "google/gemini-2.5-flash",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: `data:${mimeType};base64,${base64}` },
                  },
                  { type: "text", text: prompt },
                ],
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
            },
            timeout: 30000,
          }
        )
        return fallbackRes.data?.choices?.[0]?.message?.content?.trim() ?? ""
      } catch (fallbackErr: any) {
        console.error("[Scan Backend] OpenRouter fallback also failed:", fallbackErr.message)
      }
    }

    if (status === 429) {
      throw {
        status: 429,
        code: "RATE_LIMIT",
        message: "AI rate limit reached. Please try again in a moment or fill transaction details manually.",
      }
    }

    if (status === 401) {
      throw {
        status: 401,
        code: "AUTH_ERROR",
        message: "Invalid or revoked GROQ_API_KEY on server. Please update GROQ_API_KEY in server environment.",
      }
    }

    throw {
      status,
      code: "AI_ERROR",
      message: errData?.message || "AI vision service unavailable. Please fill manually.",
    }
  }
}

// ── JSON Cleaning and Extraction Helper ──────────────────────────────────────
export function cleanAndExtractJson(rawText: string): string {
  if (!rawText) return ""

  // 1. Strip reasoning blocks like <think>...</think> (and unclosed <think> if truncated)
  let text = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*/gi, "")
    .trim()

  // 2. Extract content from markdown code fences if present (```json ... ``` or ``` ... ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim()
  } else {
    text = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim()
  }

  // 3. Fallback: locate outermost JSON array [ ... ] or object { ... }
  const firstBracket = text.indexOf("[")
  const lastBracket = text.lastIndexOf("]")
  const firstBrace = text.indexOf("{")
  const lastBrace = text.lastIndexOf("}")

  if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    text = text.substring(firstBracket, lastBracket + 1).trim()
  } else if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1).trim()
  }

  return text
}

// ── POST /scan/receipt (or /api/scan-receipt) ──────────────────────────────────
router.post("/receipt", async (req: Request, res: Response) => {
  const { imageBase64, mimeType = "image/jpeg" } = req.body

  if (!imageBase64) {
    return res.status(400).json({ error: "imageBase64 is required", code: "BAD_REQUEST" })
  }

  try {
    const rawText = await callGroqVision(imageBase64, SINGLE_PROMPT, mimeType)
    const clean = cleanAndExtractJson(rawText)
    console.log("[scan.ts /receipt] Cleaned text for parsing:", clean.slice(0, 300))

    let parsed: ScannedReceipt
    try {
      const result = JSON.parse(clean)
      if (Array.isArray(result) && result.length > 0) {
        parsed = result[0] as ScannedReceipt
      } else {
        parsed = result as ScannedReceipt
      }
    } catch (parseErr: any) {
      console.warn("[scan.ts /receipt] JSON.parse failed:", parseErr.message)
      parsed = { confidence: "low", raw: rawText }
    }

    return res.status(200).json(parsed)
  } catch (err: any) {
    const status = err.status || 500
    return res.status(status).json({
      error: err.message || "Failed to scan receipt",
      code: err.code || "SCAN_FAILED",
    })
  }
})

// ── POST /scan/multi (or /api/import-media) ───────────────────────────────────
router.post("/multi", async (req: Request, res: Response) => {
  const { imageBase64, mimeType = "image/jpeg" } = req.body

  if (!imageBase64) {
    return res.status(400).json({ error: "imageBase64 is required", code: "BAD_REQUEST" })
  }

  try {
    const rawText = await callGroqVision(imageBase64, MULTI_PROMPT, mimeType)
    const clean = cleanAndExtractJson(rawText)
    console.log("[scan.ts /multi] Cleaned text for parsing:", clean.slice(0, 300))

    let transactions: ScannedReceipt[] = []
    let overallConf: "high" | "medium" | "low" = "medium"

    try {
      const parsed = JSON.parse(clean)
      transactions = Array.isArray(parsed) ? parsed : [parsed]
      overallConf = transactions.every((t) => t.confidence === "high")
        ? "high"
        : transactions.some((t) => t.confidence === "low")
        ? "low"
        : "medium"
    } catch (parseErr: any) {
      console.warn("[scan.ts /multi] JSON.parse failed on cleaned text:", parseErr.message)
      return res.status(200).json({
        transactions: [],
        confidence: "low",
        raw: rawText,
      })
    }

    return res.status(200).json({
      transactions,
      confidence: overallConf,
    })
  } catch (err: any) {
    const status = err.status || 500
    return res.status(status).json({
      error: err.message || "Failed to parse transactions",
      code: err.code || "SCAN_FAILED",
      transactions: [],
      confidence: "low",
    })
  }
})

export default router
