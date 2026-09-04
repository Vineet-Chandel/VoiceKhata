// src/lib/scan-receipt.ts

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

// ── Single receipt / bill extraction prompt ─────────────────────────────────
const SINGLE_PROMPT = `You are a receipt and invoice data extractor for an Indian personal finance app.
Analyze this receipt/bill image and extract the transaction details.
Respond ONLY with a valid JSON object — no markdown formatting, no explanations, no backticks, no reasoning blocks.

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
- amount: plain positive number (e.g. 499, not ₹499); null if not found
- date: yyyy-MM-dd format or null
- category: Income | Subscription | Food | Shopping | Utilities | Transport | Health | Entertainment | Other
- method: UPI | Credit Card | Debit Card | Net Banking | Cash | Bank Transfer | null
- type: exactly "Debit" or "Credit"
- confidence: "high" | "medium" | "low"
- If the image is not a receipt or bill, return: {"transaction": "Unknown", "confidence": "low"}`

// ── Multi-transaction statement / screenshot extraction prompt ───────────────
const MULTI_PROMPT = `You are a transaction extractor for an Indian personal finance app.
This image may be a bank statement, UPI app history screenshot (GPay/PhonePe/Paytm), or bill list.
Extract ALL transactions visible in the image.
Respond ONLY with a valid JSON array — no markdown formatting, no explanations, no backticks, no reasoning blocks.

JSON format:
[
  {
    "transaction": "merchant name or payee",
    "amount": 500,
    "date": "2026-04-20",
    "category": "Food",
    "method": "UPI",
    "type": "Debit",
    "confidence": "high"
  }
]

Rules:
- amount: plain positive number (e.g. 500, not ₹500)
- date: yyyy-MM-dd format; if unclear use today's date
- category: Income | Subscription | Food | Shopping | Utilities | Transport | Health | Entertainment | Other
- method: UPI | Credit Card | Debit Card | Net Banking | Cash | Bank Transfer | null
- type: "Debit" for money spent, "Credit" for money received
- If only 1 transaction is visible, return a JSON array with 1 item
- If no transactions are detected, return an empty array: []`

// ── Client-side Image compression ───────────────────────────────────────────
function compressImage(file: File, maxPx = 1024): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height * maxPx) / width)
          width = maxPx
        } else {
          width = Math.round((width * maxPx) / height)
          height = maxPx
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("Canvas not supported"))
      ctx.drawImage(img, 0, 0, width, height)

      const mimeType = "image/jpeg"
      const dataUrl = canvas.toDataURL(mimeType, 0.82)
      const base64 = dataUrl.split(",")[1]
      console.log("[scan-receipt] Compressed image for client-side AI:", Math.round((base64.length * 0.75) / 1024), "KB")
      resolve({ base64, mimeType })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image file"))
    }
    img.src = url
  })
}

// ── JSON Cleaning and Extraction Helper ──────────────────────────────────────
export function cleanAndExtractJson(rawText: string): string {
  if (!rawText) return ""

  // 1. Strip reasoning / thinking blocks like <think>...</think>
  let text = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*/gi, "")
    .trim()

  // 2. Extract content from markdown code fences if present
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

// ── Call Vision Model directly in Frontend ──────────────────────────────────
async function callFrontendVisionAI(base64: string, prompt: string, mimeType = "image/jpeg"): Promise<string> {
  const groqApiKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim()
  const openRouterApiKey = (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined)?.trim()

  // 1. Try Groq Vision first
  if (groqApiKey && !groqApiKey.startsWith("eyJ")) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-27b",
          max_tokens: 2048,
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content: "You are a concise financial receipt extractor. Output valid raw JSON only. Do not include thinking or preamble.",
            },
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
                { type: "text", text: prompt },
              ],
            },
          ],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const content = data?.choices?.[0]?.message?.content?.trim()
        if (content) {
          console.log("[scan-receipt] Extraction succeeded via Groq client vision")
          return content
        }
      } else {
        const errData = await response.json().catch(() => ({}))
        console.warn(`[scan-receipt] Groq returned status ${response.status}:`, errData)
      }
    } catch (groqErr: any) {
      console.warn("[scan-receipt] Groq vision call failed, falling back to OpenRouter:", groqErr.message)
    }
  }

  // 2. Try OpenRouter Vision as reliable fallback
  if (openRouterApiKey) {
    try {
      console.log("[scan-receipt] Attempting OpenRouter vision extraction...")
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: 1024,
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
                { type: "text", text: prompt },
              ],
            },
          ],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const content = data?.choices?.[0]?.message?.content?.trim()
        if (content) {
          console.log("[scan-receipt] Extraction succeeded via OpenRouter vision")
          return content
        }
      }
    } catch (orErr: any) {
      console.warn("[scan-receipt] OpenRouter vision fallback failed:", orErr.message)
    }
  }

  if (!groqApiKey && !openRouterApiKey) {
    throw new Error("AI scan unavailable: VITE_GROQ_API_KEY is not configured in .env")
  }

  throw new Error("AI scan unavailable, please fill manually")
}

// ── Single Receipt Scan (Frontend Client-Side) ──────────────────────────────
export async function scanReceipt(imageFile: File): Promise<ScannedReceipt> {
  console.log("[scan-receipt] Starting client-side receipt extraction for:", imageFile.name)
  const { base64, mimeType } = await compressImage(imageFile, 1024)

  const rawText = await callFrontendVisionAI(base64, SINGLE_PROMPT, mimeType)
  const clean = cleanAndExtractJson(rawText)

  let parsed: ScannedReceipt
  try {
    const result = JSON.parse(clean)
    if (Array.isArray(result) && result.length > 0) {
      parsed = result[0] as ScannedReceipt
    } else {
      parsed = result as ScannedReceipt
    }
  } catch (parseErr: any) {
    console.warn("[scan-receipt] JSON parse failed on raw AI output:", parseErr.message)
    parsed = { confidence: "low", raw: rawText }
  }

  console.log("[scan-receipt] Extracted single receipt data:", parsed)
  return parsed
}

// ── Multi-Transaction Screenshot Scan (Frontend Client-Side) ────────────────
export async function scanReceiptMulti(imageFile: File): Promise<ScannedReceiptMulti> {
  console.log("[scan-receipt] Starting client-side multi-transaction extraction for:", imageFile.name)
  const { base64, mimeType } = await compressImage(imageFile, 1280)

  const rawText = await callFrontendVisionAI(base64, MULTI_PROMPT, mimeType)
  const clean = cleanAndExtractJson(rawText)

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
    console.warn("[scan-receipt] JSON parse failed on multi-scan AI output:", parseErr.message)
    return {
      transactions: [],
      confidence: "low",
      raw: rawText,
    }
  }

  const result: ScannedReceiptMulti = {
    transactions,
    confidence: overallConf,
  }

  console.log("[scan-receipt] Extracted multi-transaction data:", result)
  return result
}