import { supabase } from "@/lib/supabase"

export type MerchantCategory =
  | "Food"
  | "Shopping"
  | "Transport"
  | "Utilities"
  | "Health"
  | "Entertainment"
  | "Subscription"
  | "Income"
  | "Other"

export type MerchantResolution = {
  rawInput: string
  normalizedName: string
  merchantType: string
  category: MerchantCategory
  tags: string[]
  confidence: number
  source: "memory" | "ai" | "web" | "fallback"
}

type MerchantMemoryRow = {
  id: string
  firebase_uid?: string | null
  raw_input: string
  normalized_name: string
  merchant_type: string | null
  category: MerchantCategory | null
  tags: string[] | null
  confidence: number | null
  hit_count?: number | null
  created_at?: string
  updated_at?: string
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const DEFAULT_MERCHANT_TYPE = "other"

function clampConfidence(value: unknown, fallback = 0.5): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function toCategory(value: unknown): MerchantCategory {
  const allowed = new Set<MerchantCategory>([
    "Food",
    "Shopping",
    "Transport",
    "Utilities",
    "Health",
    "Entertainment",
    "Subscription",
    "Income",
    "Other",
  ])
  return typeof value === "string" && allowed.has(value as MerchantCategory)
    ? (value as MerchantCategory)
    : "Other"
}

function normalizeMerchantKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ")
}

function diceCoefficient(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const aBigrams = new Map<string, number>()
  for (let i = 0; i < a.length - 1; i += 1) {
    const pair = a.slice(i, i + 2)
    aBigrams.set(pair, (aBigrams.get(pair) ?? 0) + 1)
  }

  let overlap = 0
  for (let i = 0; i < b.length - 1; i += 1) {
    const pair = b.slice(i, i + 2)
    const count = aBigrams.get(pair) ?? 0
    if (count > 0) {
      overlap += 1
      aBigrams.set(pair, count - 1)
    }
  }

  return (2 * overlap) / ((a.length - 1) + (b.length - 1))
}

function scoreCandidate(input: string, row: MerchantMemoryRow): number {
  const inputKey = normalizeMerchantKey(input)
  const rawKey = normalizeMerchantKey(row.raw_input)
  const normalizedKey = normalizeMerchantKey(row.normalized_name)

  const exact = inputKey === rawKey || inputKey === normalizedKey
  if (exact) return 1

  const directContain =
    rawKey.includes(inputKey) ||
    normalizedKey.includes(inputKey) ||
    inputKey.includes(rawKey) ||
    inputKey.includes(normalizedKey)

  if (directContain) return 0.92

  const diceRaw = diceCoefficient(inputKey, rawKey)
  const diceNormalized = diceCoefficient(inputKey, normalizedKey)
  return Math.max(diceRaw, diceNormalized)
}

async function loadMerchantMemory(userId: string | undefined): Promise<MerchantMemoryRow[]> {
  const rows: MerchantMemoryRow[] = []

  if (userId) {
    const { data, error } = await supabase
      .from("merchant_memory")
      .select("*")
      .eq("firebase_uid", userId)
      .order("updated_at", { ascending: false })
      .limit(200)

    if (!error && Array.isArray(data)) {
      rows.push(...(data as MerchantMemoryRow[]))
    }
  }

  const { data: globalData, error: globalError } = await supabase
    .from("merchant_memory")
    .select("*")
    .is("firebase_uid", null)
    .order("updated_at", { ascending: false })
    .limit(200)

  if (!globalError && Array.isArray(globalData)) {
    rows.push(...(globalData as MerchantMemoryRow[]))
  }

  return rows
}

function fromMemoryRow(rawInput: string, row: MerchantMemoryRow): MerchantResolution {
  return {
    rawInput,
    normalizedName: row.normalized_name,
    merchantType: row.merchant_type ?? DEFAULT_MERCHANT_TYPE,
    category: row.category ?? "Other",
    tags: Array.isArray(row.tags) ? row.tags : [],
    confidence: clampConfidence(row.confidence, 0.8),
    source: "memory",
  }
}

export async function lookupMerchantMemory(
  userId: string | undefined,
  rawInput: string
): Promise<MerchantResolution | null> {
  if (!rawInput.trim()) return null

  const memoryRows = await loadMerchantMemory(userId)
  if (memoryRows.length === 0) return null

  let best: { row: MerchantMemoryRow; score: number } | null = null
  for (const row of memoryRows) {
    const score = scoreCandidate(rawInput, row)
    if (!best || score > best.score) {
      best = { row, score }
    }
  }

  if (!best || best.score < 0.78) return null
  return fromMemoryRow(rawInput, best.row)
}

type AIEnhanceResult = {
  clean_name: string
  probable_category: MerchantCategory
  merchant_type: string
  confidence: number
  tags?: string[]
}

export async function enhanceMerchant(
  apiKey: string,
  rawInput: string,
  transactionContext?: string
): Promise<MerchantResolution | null> {
  if (!apiKey || !rawInput.trim()) return null

  const prompt = `Understand this merchant/service/app/company from user transaction text.
Return only JSON.

Input merchant text: "${rawInput}"
Transaction context: "${transactionContext ?? rawInput}"

JSON shape:
{
  "clean_name": "normalized merchant name",
  "probable_category": "Food|Shopping|Transport|Utilities|Health|Entertainment|Subscription|Income|Other",
  "merchant_type": "saas|streaming|ecommerce|utility|food|transport|salary|transfer|other",
  "confidence": 0.0,
  "tags": ["optional", "labels"]
}

Rules:
- Normalize misspellings and noisy phrasing.
- Understand local stores and neighborhood businesses in India.
- Understand apps, SaaS, subscriptions, and service platforms globally.
- If uncertain, keep confidence low and category as Other.
- Output only JSON.`

  const models = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "groq/compound",
  ]

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
            { role: "system", content: "You are a merchant intelligence engine for financial transactions." },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 220,
          response_format: { type: "json_object" },
        }),
      })

      if (!res.ok) continue
      const data = await res.json()
      const payload = JSON.parse(data?.choices?.[0]?.message?.content ?? "{}") as Partial<AIEnhanceResult>

      const cleanNameRaw = typeof payload.clean_name === "string" ? payload.clean_name.trim() : ""
      const cleanName = cleanNameRaw || toTitleCase(normalizeMerchantKey(rawInput))

      return {
        rawInput,
        normalizedName: cleanName,
        merchantType: typeof payload.merchant_type === "string" && payload.merchant_type.trim()
          ? payload.merchant_type.trim()
          : DEFAULT_MERCHANT_TYPE,
        category: toCategory(payload.probable_category),
        tags: Array.isArray(payload.tags) ? payload.tags.filter((tag) => typeof tag === "string") : [],
        confidence: clampConfidence(payload.confidence, 0.45),
        source: "ai",
      }
    } catch {
      continue
    }
  }

  return null
}

type WebSearchResult = {
  clean_name?: string
  probable_category?: MerchantCategory
  merchant_type?: string
  confidence?: number
  tags?: string[]
}

export async function merchantWebFallback(rawInput: string): Promise<MerchantResolution | null> {
  const endpoint = import.meta.env.VITE_MERCHANT_SEARCH_ENDPOINT as string | undefined
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined
  const resolvedEndpoint = endpoint || (backendUrl ? `${backendUrl.replace(/\/$/, "")}/merchant/search` : "")

  if (!resolvedEndpoint || !rawInput.trim()) return null

  try {
    const res = await fetch(resolvedEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `What is ${rawInput} company/app/service/store?`,
      }),
    })

    if (!res.ok) return null
    const data = (await res.json()) as WebSearchResult
    const cleanName = typeof data.clean_name === "string" && data.clean_name.trim()
      ? data.clean_name.trim()
      : toTitleCase(normalizeMerchantKey(rawInput))

    return {
      rawInput,
      normalizedName: cleanName,
      merchantType: typeof data.merchant_type === "string" && data.merchant_type.trim()
        ? data.merchant_type.trim()
        : DEFAULT_MERCHANT_TYPE,
      category: toCategory(data.probable_category),
      tags: Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === "string") : [],
      confidence: clampConfidence(data.confidence, 0.5),
      source: "web",
    }
  } catch {
    return null
  }
}

export async function rememberMerchant(
  userId: string | undefined,
  payload: MerchantResolution
): Promise<void> {
  if (!userId) return

  const row = {
    firebase_uid: userId,
    raw_input: payload.rawInput,
    normalized_name: payload.normalizedName,
    merchant_type: payload.merchantType,
    category: payload.category,
    tags: payload.tags,
    confidence: payload.confidence,
    hit_count: 1,
    updated_at: new Date().toISOString(),
  }

  const existing = await supabase
    .from("merchant_memory")
    .select("id, hit_count")
    .eq("firebase_uid", userId)
    .eq("raw_input", payload.rawInput)
    .maybeSingle()

  if (!existing.error && existing.data?.id) {
    await supabase
      .from("merchant_memory")
      .update({ ...row, hit_count: (existing.data.hit_count ?? 0) + 1 })
      .eq("id", existing.data.id)
    return
  }

  await supabase.from("merchant_memory").insert([row])
}

export function fallbackMerchantResolution(rawInput: string): MerchantResolution {
  const cleaned = toTitleCase(normalizeMerchantKey(rawInput))
  return {
    rawInput,
    normalizedName: cleaned || rawInput.trim(),
    merchantType: DEFAULT_MERCHANT_TYPE,
    category: "Other",
    tags: [],
    confidence: 0.3,
    source: "fallback",
  }
}
