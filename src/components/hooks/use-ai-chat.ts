import { useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { format } from "date-fns"
import type { Transaction } from "@/components/hooks/use-transactions"
import type { Budget } from "@/components/hooks/use-budgets"
import type { MultiGuidedState, DraftItem, MultiGuidedStep } from "@/components/hooks/use-chat-store"
import { useAITransaction } from "@/components/hooks/use-ai-transaction"
import { useAuth } from "@/components/hooks/use-auth"
import {
  enhanceMerchant,
  fallbackMerchantResolution,
  lookupMerchantMemory,
  merchantWebFallback,
  rememberMerchant,
  type MerchantResolution,
} from "@/lib/merchant-intelligence"
import { createFinancialMetrics } from "@/lib/financial-metrics"
import {
  classifyAssistantMode,
  detectLanguageMode,
  hasTransactionLikeData,
  isExplicitLoggingRequest,
  isSmallTalkIntent,
  localizeByMode,
  type AssistantMode,
  type LanguageMode,
} from "@/lib/chat-language"
import { MONEY_GROWTH_ENGINE_PROMPT } from "@/lib/prompts/money-growth-engine"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  replyTo?: { id: string; role: "user" | "assistant"; content: string }
}

type TransactionDraft = {
  transaction: string
  category: string
  amount: number
  date: string
  type: string
  method: string
  status: string
  merchantRawInput?: string
  merchantTags?: string[]
  merchantConfidence?: number
  merchantType?: string
  app_mode?: "BUSINESS" | "PERSONAL"
}

export type GuidedStep = "idle" | "name" | "amount" | "category" | "type" | "method" | "confirm" | "done"

type BulkStep = "preview" | "dup-ask"

type BulkState = {
  step: BulkStep
  unique: Partial<TransactionDraft>[]
  duplicates: Partial<TransactionDraft>[]
}

type LookupResolveState = {
  query: string
  candidateNames: string[]
  isNotFoundAddPrompt?: boolean
}

type LookupResolution =
  | { kind: "none"; query: string; suggestions: string[] }
  | { kind: "disambiguate"; query: string; candidateNames: string[] }
  | { kind: "resolved"; query: string; candidateNames: string[]; rows: Transaction[] }

type TransactionInput = Omit<Transaction, "id" | "firebase_uid" | "created_at">
type BudgetInput = {
  category: string
  amount: number
  duration: string
}
type BudgetDraft = BudgetInput
type BudgetGuidedStep = "idle" | "category" | "amount" | "duration" | "confirm"

interface Props {
  transactions: Transaction[]
  budgets: Budget[]
  onAddTransaction: (t: TransactionInput) => Promise<{ error?: string; data?: Transaction } | undefined>
  onAddBudget: (b: BudgetInput) => Promise<{ error?: string; data?: Budget } | undefined>
  messages: Message[]
  setMessages: Dispatch<SetStateAction<Message[]>>
  pendingDraft: Partial<TransactionDraft> | null
  setPendingDraft: Dispatch<SetStateAction<Partial<TransactionDraft> | null>>
  guidedStep: GuidedStep
  setGuidedStep: Dispatch<SetStateAction<GuidedStep>>
  languageMode: LanguageMode | null
  setLanguageMode: Dispatch<SetStateAction<LanguageMode | null>>
  assistantMode: AssistantMode
  setAssistantMode: Dispatch<SetStateAction<AssistantMode>>
  multiState: MultiGuidedState | null
  setMultiState: Dispatch<SetStateAction<MultiGuidedState | null>>
}

const VALID_CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Subscription",
  "Income",
  "Other",
] as const

const VALID_METHODS = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "Net Banking",
] as const

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "groq/compound",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
] as const
const GROQ_MODEL = GROQ_FALLBACK_MODELS[0]

function formatAmount(amount: number): string {
  return `Rs.${amount.toLocaleString("en-IN")}`
}

function isValidCategory(value: unknown): value is (typeof VALID_CATEGORIES)[number] {
  return typeof value === "string" && VALID_CATEGORIES.includes(value as (typeof VALID_CATEGORIES)[number])
}

function isValidMethod(value: unknown): value is (typeof VALID_METHODS)[number] {
  return typeof value === "string" && VALID_METHODS.includes(value as (typeof VALID_METHODS)[number])
}

function safeCategory(value: unknown): string {
  return isValidCategory(value) ? value : "Other"
}

function safeMethod(value: unknown): string {
  return isValidMethod(value) ? value : "Cash"
}

const BUDGET_INTENT_REGEX =
  /\b(set|create|add|make|update|adjust|plan|define)\b.*\bbudget\b|\bbudget\b.*\b(set|create|add|make|update|adjust|plan|define)\b/i

const BUDGET_DURATION_OPTIONS = [
  "monthly",
  "3months",
  "6months",
  "yearly",
  "timeless",
] as const

const BUDGET_DURATION_LABELS: Record<(typeof BUDGET_DURATION_OPTIONS)[number], string> = {
  monthly: "Monthly",
  "3months": "3 Months",
  "6months": "6 Months",
  yearly: "Yearly",
  timeless: "Timeless",
}

function parseBudgetAmount(input: string): number | undefined {
  const explicit = input.match(/(?:amount|limit|budget|cap)\s*(?:of|is|=|to)?\s*(?:₹|rs\.?|inr|rupees?)?\s*(\d[\d,]*(?:\.\d+)?)/i)?.[1]
  const currency = input.match(/(?:₹|rs\.?|inr|rupees?)\s*(\d[\d,]*(?:\.\d+)?)/i)?.[1]
  const candidate = explicit ?? currency
  if (candidate) {
    const parsed = Number(candidate.replace(/,/g, ""))
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  const matches = [...input.matchAll(/\b(\d[\d,]*(?:\.\d+)?)\b/g)]
  for (const match of matches) {
    const raw = match[1]
    const amount = Number(raw.replace(/,/g, ""))
    if (!Number.isFinite(amount) || amount <= 0) continue

    const idx = match.index ?? 0
    const tail = input.slice(idx, idx + 18).toLowerCase()
    if (/\b(month|months|year|years|m)\b/.test(tail) && amount <= 24) continue
    if (amount < 100) continue
    return amount
  }

  return undefined
}

function parseBudgetDuration(input: string): (typeof BUDGET_DURATION_OPTIONS)[number] | undefined {
  const l = input.toLowerCase()
  if (/\b(timeless|forever|ongoing|until i remove|no end)\b/.test(l)) return "timeless"
  if (/\b(yearly|annual|12\s*months?|12m|1\s*year)\b/.test(l)) return "yearly"
  if (/\b(6\s*months?|6m|half\s*year)\b/.test(l)) return "6months"
  if (/\b(3\s*months?|3m|quarterly)\b/.test(l)) return "3months"
  if (/\b(monthly|month|every month)\b/.test(l)) return "monthly"
  return undefined
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

function extractBudgetCategory(input: string): string | undefined {
  const known = VALID_CATEGORIES.find((c) =>
    new RegExp(`\\b${c.toLowerCase()}\\b`, "i").test(input)
  )
  if (known) return known

  const fromFor = input.match(/\bfor\s+([a-z][a-z\s&-]{1,32})/i)?.[1]
  const fromCategory = input.match(/\bcategory\s+([a-z][a-z\s&-]{1,32})/i)?.[1]
  const candidate = fromCategory ?? fromFor
  if (!candidate) return undefined

  const cleaned = candidate
    .replace(/\b(monthly|yearly|timeless|budget|amount|limit|cap|for|in|this|next)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!cleaned || cleaned.toLowerCase() === "a category") return undefined
  return toTitleCase(cleaned)
}

function parseBudgetDraftFromMessage(input: string): Partial<BudgetDraft> {
  const category = extractBudgetCategory(input)
  const amount = parseBudgetAmount(input)
  const duration = parseBudgetDuration(input)
  return {
    ...(category ? { category } : {}),
    ...(typeof amount === "number" ? { amount } : {}),
    ...(duration ? { duration } : {}),
  }
}

function budgetMissingFields(draft: Partial<BudgetDraft>): Array<"category" | "amount" | "duration"> {
  const missing: Array<"category" | "amount" | "duration"> = []
  if (!draft.category) missing.push("category")
  if (typeof draft.amount !== "number") missing.push("amount")
  if (!draft.duration) missing.push("duration")
  return missing
}

function buildBudgetMissingQuestion(
  missing: Array<"category" | "amount" | "duration">,
  draft: Partial<BudgetDraft>
): string {
  if (missing[0] === "category") {
    return "Which category should this budget apply to? (e.g. Food, Transport, Utilities)"
  }
  if (missing[0] === "amount") {
    return `What should be the limit for ${draft.category ?? "this category"}? (e.g. 5000)`
  }
  return "Choose duration: monthly, 3 months, 6 months, yearly, or timeless."
}

function buildBudgetConfirmCard(draft: BudgetDraft, languageMode: LanguageMode): string {
  const header = localizeByMode(languageMode, {
    english: "Here is the budget I will create:",
    hinglish: "Yeh budget create hoga:",
    hindi: "",
  })
  const confirmLine = localizeByMode(languageMode, {
    english: 'Reply "yes" to confirm or "no" to cancel.',
    hinglish: 'Confirm karne ke liye "yes" bolo, cancel ke liye "no".',
    hindi: "",
  })

  return (
    `${header}\n\n` +
    `- Category: ${draft.category}\n` +
    `- Limit: Rs.${draft.amount.toLocaleString("en-IN")}\n` +
    `- Duration: ${BUDGET_DURATION_LABELS[draft.duration as keyof typeof BUDGET_DURATION_LABELS] ?? draft.duration}\n\n` +
    `${confirmLine}`
  )
}

type BudgetCorrectionField = "category" | "amount" | "duration"
type BudgetCorrection = { field: BudgetCorrectionField; value: string | number }

function detectBudgetCorrection(input: string): BudgetCorrection | null {
  const s = input.trim()
  const amountMatch = s.match(/(?:amount|limit)\s+(?:is|=|to)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)/i)
  if (amountMatch) {
    const value = Number(amountMatch[1].replace(/,/g, ""))
    if (Number.isFinite(value) && value > 0) return { field: "amount", value }
  }

  const duration = parseBudgetDuration(s)
  if (duration) return { field: "duration", value: duration }

  const category = extractBudgetCategory(s)
  if (category) return { field: "category", value: category }

  return null
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function diceCoefficient(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const aBigrams = new Map<string, number>()
  for (let i = 0; i < a.length - 1; i += 1) {
    const bg = a.slice(i, i + 2)
    aBigrams.set(bg, (aBigrams.get(bg) ?? 0) + 1)
  }

  let overlap = 0
  for (let i = 0; i < b.length - 1; i += 1) {
    const bg = b.slice(i, i + 2)
    const count = aBigrams.get(bg) ?? 0
    if (count > 0) {
      overlap += 1
      aBigrams.set(bg, count - 1)
    }
  }

  return (2 * overlap) / ((a.length - 1) + (b.length - 1))
}

function scoreTransactionNameMatch(queryNorm: string, nameNorm: string): number {
  if (!queryNorm || !nameNorm) return 0
  if (queryNorm === nameNorm) return 1
  if (nameNorm.includes(queryNorm)) return 0.98

  const queryTokens = queryNorm.split(" ").filter((t) => t.length >= 2)
  const nameTokens = nameNorm.split(" ").filter((t) => t.length >= 2)

  let tokenHits = 0
  let bestTokenDice = 0
  for (const q of queryTokens) {
    let matched = false
    for (const n of nameTokens) {
      if (n === q || n.startsWith(q) || q.startsWith(n) || n.includes(q)) {
        matched = true
        bestTokenDice = Math.max(bestTokenDice, 1)
        break
      }
      const dice = diceCoefficient(q, n)
      bestTokenDice = Math.max(bestTokenDice, dice)
      if (dice >= 0.72) matched = true
    }
    if (matched) tokenHits += 1
  }

  const tokenCoverage = queryTokens.length > 0 ? tokenHits / queryTokens.length : 0
  const fullDice = diceCoefficient(queryNorm, nameNorm)
  return Math.max(fullDice, tokenCoverage * 0.92, bestTokenDice * 0.88)
}

function cleanLookupQuery(raw: string): string {
  let query = raw.replace(/[?.!,]+$/g, "").trim()

  query = query
    .replace(/^(?:between|btw)\s+me\s+and\s+/i, "")
    .replace(/^me\s+and\s+/i, "")
    .replace(/^(?:with|for|of|about|on)\s+/i, "")
    .replace(/^(?:name\s+)?(?:similar\s+to|same\s+as|like)\s+/i, "")
    .replace(/^name(?:d)?\s+/i, "")
    .replace(/\b(?:transactions?|txns?)\s+(?:of|for|with|about)\b/gi, "")
    .replace(/\b(?:transaction|transactions|txn|txns)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

  return query
}

function extractLookupQuery(input: string): string | null {
  const text = input.trim().replace(/\s+/g, " ")
  if (!text) return null

  const patterns = [
    /(?:tell|show|list|give|find|get|search)(?:\s+me)?(?:\s+all)?(?:\s+my)?\s+(?:transactions?|txns?)\s+(?:with|for|of|named|name|about|on)\s+(.+)$/i,
    /(?:tell|show|give)\s+me\s+(?:what\s+)?(?:the\s+)?transactions?\s+(?:btw|between)\s+me\s+and\s+(.+)$/i,
    /(?:did|do|have)\s+i\s+(?:do|did|make|made|have|done)?\s*(?:any\s*)?(?:transactions?|txns?)\s+(?:with|for|of|named|name|about|on)\s+(.+)$/i,
    /(?:anyone|any\s+one|any\s+person|whom).*(?:any\s*)?(?:transactions?|txns?).*(?:with|for|named|name)\s+(.+)$/i,
    /(?:transactions?|txns?)\s+(?:with|for|of|named|name|about|on)\s+(.+)$/i,
    /(?:transactions?|txns?)\s+(?:of|for|with|about)\s+(?:rs\.?|inr|₹|rupees?)?\s*(\d[\d,.]*)/i,
    /(?:show|list|give|find|get|search)(?:\s+me)?\s+(.+?)\s+(?:transactions?|txns?)$/i,
    /(?:expense|payment|bill)\s+(?:with|for|of|named|name|about|on)\s+(.+)$/i,
    /(?:transactions?|txns?).*?(?:similar\s+to|like)\s+(.+)$/i,
    /^(?:with|for|about|on)\s+(.+)$/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (!match) continue

    const query = cleanLookupQuery(match[1])
    if (query.length < 2) continue
    if (/^(budget|budgets|income|expense|expenses|saving|savings|balance|report|reports|category|categories|month)$/i.test(query)) continue
    return query
  }

  return null
}

function uniqueNamesFromRows(rows: Transaction[]): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const row of rows) {
    const key = normalizeForMatch(row.transaction)
    if (!key || seen.has(key)) continue
    seen.add(key)
    names.push(row.transaction)
  }
  return names
}

function resolveTransactionLookup(query: string, transactions: Transaction[]): LookupResolution {
  const queryNorm = normalizeForMatch(query)
  if (!queryNorm) return { kind: "none", query, suggestions: [] }

  const scored = transactions
    .map((tx) => {
      const nameNorm = normalizeForMatch(tx.transaction)
      return { tx, score: scoreTransactionNameMatch(queryNorm, nameNorm) }
    })
    .sort((a, b) => b.score - a.score)

  const highThreshold = queryNorm.length <= 4 ? 0.44 : queryNorm.split(" ").length === 1 ? 0.52 : 0.6
  const mediumThreshold = highThreshold - 0.12

  const highRows = scored.filter((s) => s.score >= highThreshold).map((s) => s.tx)
  const mediumRows = scored.filter((s) => s.score >= mediumThreshold).map((s) => s.tx)
  const highNames = uniqueNamesFromRows(highRows)

  const isPotentiallyAmbiguous = queryNorm.split(" ").length === 1 && queryNorm.length <= 8
  if (highNames.length > 1 && isPotentiallyAmbiguous) {
    return { kind: "disambiguate", query, candidateNames: highNames.slice(0, 8) }
  }

  if (highRows.length > 0) {
    return { kind: "resolved", query, candidateNames: highNames, rows: highRows }
  }

  const suggestions = uniqueNamesFromRows(mediumRows).slice(0, 8)
  if (suggestions.length > 0) {
    return { kind: "none", query, suggestions }
  }

  return { kind: "none", query, suggestions: [] }
}

function buildLookupDisambiguationMessage(query: string, candidateNames: string[], transactions: Transaction[]): string {
  const counts = candidateNames.map((name) => ({
    name,
    count: transactions.filter((t) => normalizeForMatch(t.transaction) === normalizeForMatch(name)).length,
  }))

  const lines = [`I found similar transaction names for "${query}" in your database:`]
  counts.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} (${item.count} transaction${item.count === 1 ? "" : "s"})`)
  })
  lines.push("")
  lines.push('Reply with number(s) like "1 3" or say "all these".')
  return lines.join("\n")
}

function buildLookupNotFoundMessage(query: string, suggestions: string[]): string {
  if (suggestions.length === 0) return `No matching transactions found for "${query}".`

  const lines = [`No exact match found for "${query}". Closest names in your database:`]
  suggestions.forEach((name, index) => lines.push(`${index + 1}. ${name}`))
  lines.push("")
  lines.push('Reply with number(s) like "1 2" or say "all these".')
  return lines.join("\n")
}

function filterTransactionsByNames(transactions: Transaction[], names: string[]): Transaction[] {
  const keys = new Set(names.map((name) => normalizeForMatch(name)))
  return transactions.filter((tx) => keys.has(normalizeForMatch(tx.transaction)))
}

function resolveLookupSelection(reply: string, lookupState: LookupResolveState): string[] {
  const text = reply.trim().toLowerCase()
  if (!text) return []

  if (/(^|\b)(all|all these|all those|all of them|everything)(\b|$)/i.test(text)) {
    return lookupState.candidateNames
  }

  const picksByNumber = [...text.matchAll(/\b(\d+)\b/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= lookupState.candidateNames.length)
    .map((n) => lookupState.candidateNames[n - 1])

  if (picksByNumber.length > 0) {
    return [...new Set(picksByNumber)]
  }

  const normalizedReply = normalizeForMatch(reply)
  const picksByName = lookupState.candidateNames.filter((name) =>
    normalizedReply.includes(normalizeForMatch(name))
  )

  return [...new Set(picksByName)]
}

function buildTransactionRowsMessage(rows: Transaction[], title: string): string {
  if (rows.length === 0) return `${title}\nNo transactions found.`

  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date))
  const total = sorted.reduce((sum, t) => sum + t.amount, 0)

  const lines = [
    title,
    `Count: ${sorted.length}`,
    `Total Amount: ${formatAmount(total)}`,
    "",
  ]

  const limited = sorted.slice(0, 50)
  limited.forEach((t, index) => {
    lines.push(`${index + 1}. ${t.date} | ${t.transaction} | ${t.type} | ${t.category} | ${t.method} | ${formatAmount(t.amount)}`)
  })

  if (sorted.length > limited.length) {
    lines.push("")
    lines.push(`Showing first ${limited.length} of ${sorted.length} transactions.`)
  }

  return lines.join("\n")
}

type DateScope = {
  label: string
  start?: string
  end?: string
}

const MONTH_INDEX_BY_NAME: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function quarterFromDate(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

function monthStart(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex, 1)
}

function monthEnd(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0)
}

function extractDateScope(input: string): DateScope {
  const text = input.toLowerCase()
  const now = new Date()
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthDate = addMonths(currentMonthDate, -1)

  if (/\bthis quarter\b/.test(text)) {
    const q = quarterFromDate(now)
    const startMonth = (q - 1) * 3
    const start = monthStart(now.getFullYear(), startMonth)
    const end = monthEnd(now.getFullYear(), startMonth + 2)
    return {
      label: `This Quarter (Q${q} ${now.getFullYear()})`,
      start: toDateKey(start),
      end: toDateKey(end),
    }
  }

  if (/\blast quarter\b/.test(text)) {
    const thisQuarterStartMonth = (quarterFromDate(now) - 1) * 3
    const thisQuarterStart = monthStart(now.getFullYear(), thisQuarterStartMonth)
    const lastQuarterEnd = new Date(thisQuarterStart.getFullYear(), thisQuarterStart.getMonth(), 0)
    const start = monthStart(lastQuarterEnd.getFullYear(), lastQuarterEnd.getMonth() - 2)
    return {
      label: `Last Quarter (Q${quarterFromDate(lastQuarterEnd)} ${lastQuarterEnd.getFullYear()})`,
      start: toDateKey(start),
      end: toDateKey(lastQuarterEnd),
    }
  }

  if (/\blast year\b/.test(text)) {
    const year = now.getFullYear() - 1
    return {
      label: `Last Year (${year})`,
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    }
  }

  if (/\bthis year\b/.test(text)) {
    const year = now.getFullYear()
    return {
      label: `This Year (${year})`,
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    }
  }

  if (/\blast month\b/.test(text)) {
    return {
      label: `Last Month (${toMonthKey(previousMonthDate)})`,
      start: `${toMonthKey(previousMonthDate)}-01`,
      end: toDateKey(monthEnd(previousMonthDate.getFullYear(), previousMonthDate.getMonth())),
    }
  }

  if (/\bthis month\b/.test(text)) {
    return {
      label: `This Month (${toMonthKey(currentMonthDate)})`,
      start: `${toMonthKey(currentMonthDate)}-01`,
      end: toDateKey(monthEnd(currentMonthDate.getFullYear(), currentMonthDate.getMonth())),
    }
  }

  const monthNamePattern = /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\b(?:\s+(\d{4}))?/i
  const monthMatch = text.match(monthNamePattern)
  if (monthMatch) {
    const monthIndex = MONTH_INDEX_BY_NAME[monthMatch[1].toLowerCase()]
    const year = monthMatch[2] ? Number(monthMatch[2]) : now.getFullYear()
    const start = monthStart(year, monthIndex)
    const end = monthEnd(year, monthIndex)
    return {
      label: `${start.toLocaleString("en-IN", { month: "long" })} ${year}`,
      start: toDateKey(start),
      end: toDateKey(end),
    }
  }

  return { label: "Overall" }
}

function applyDateScope(transactions: Transaction[], scope: DateScope): Transaction[] {
  if (!scope.start && !scope.end) return transactions
  return transactions.filter((tx) => {
    if (scope.start && tx.date < scope.start) return false
    if (scope.end && tx.date > scope.end) return false
    return true
  })
}

function buildDatabaseAnswer(input: string, transactions: Transaction[], budgets: Budget[]): string | null {
  const text = normalizeForMatch(input)
  if (!text) return null

  const scope = extractDateScope(input)
  const scopeLabel = scope.label
  const scopedTransactions = applyDateScope(transactions, scope)
  const scopedMetrics = createFinancialMetrics(scopedTransactions)

  const asksAllTransactions =
    /\b(all|list|show|give|get)\b/.test(text) &&
    /\btransactions?\b/.test(text) &&
    !/\b(with|for|of|named|name|about|on)\b/.test(text)

  if (asksAllTransactions) {
    return buildTransactionRowsMessage(scopedTransactions, `${scopeLabel} Transactions`)
  }

  const asksRecent = /\brecent\b.*\btransactions?\b|\btransactions?\b.*\brecent\b/.test(text)
  if (asksRecent) {
    const rows = [...scopedTransactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
    return buildTransactionRowsMessage(rows, `${scopeLabel} Recent Transactions`)
  }

  const asksMonthlySummary =
    /\b(monthly|monthwise|month wise|by month|per month)\b/.test(text) &&
    /\b(spend|spent|expense|expenses|income|summary|totals?|analytics|report)\b/.test(text)

  if (asksMonthlySummary) {
    const monthMap = new Map<string, { income: number; expense: number }>()
    scopedTransactions.forEach((tx) => {
      const month = tx.date.slice(0, 7)
      const bucket = monthMap.get(month) ?? { income: 0, expense: 0 }
      if (tx.type === "Credit") bucket.income += tx.amount
      else bucket.expense += tx.amount
      monthMap.set(month, bucket)
    })

    if (monthMap.size === 0) return `${scopeLabel} Monthly Summary\nNo transactions found.`

    const lines = [`${scopeLabel} Monthly Summary`]
    Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([month, totals], index) => {
        lines.push(
          `${index + 1}. ${month} | Income ${formatAmount(totals.income)} | Expense ${formatAmount(totals.expense)} | Balance ${formatAmount(totals.income - totals.expense)}`
        )
      })
    return lines.join("\n")
  }

  const asksCategoryBreakdown =
    /\b(category|categories|breakdown)\b/.test(text) &&
    /\b(spend|spent|expense|expenses|debit|transaction|transactions)\b/.test(text)

  if (asksCategoryBreakdown) {
    const debitRows = scopedTransactions.filter((t) => t.type === "Debit")
    const totals = new Map<string, number>()
    debitRows.forEach((t) => totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount))
    const lines = [`${scopeLabel} Category Breakdown (Debit)`]
    if (totals.size === 0) {
      lines.push("No debit transactions found.")
      return lines.join("\n")
    }
    const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1])
    sorted.forEach(([category, amount], index) => {
      lines.push(`${index + 1}. ${category}: ${formatAmount(amount)}`)
    })
    return lines.join("\n")
  }

  const matchedCategory = VALID_CATEGORIES.find((category) =>
    text.includes(category.toLowerCase()) ||
    (category === "Utilities" && /utility|utilities/.test(text))
  )
  const asksCategorySpecificData =
    !!matchedCategory &&
    /\b(spend|spent|expense|expenses|debit|income|credit|transaction|transactions|total)\b/.test(text)

  if (asksCategorySpecificData) {
    const wantsIncome = /\bincome|credit\b/.test(text)
    const wantsExpense = /\bspend|spent|expense|expenses|debit\b/.test(text)
    const rows = scopedTransactions.filter((t) => {
      if (t.category !== matchedCategory) return false
      if (wantsIncome && !wantsExpense) return t.type === "Credit"
      if (wantsExpense && !wantsIncome) return t.type === "Debit"
      return true
    })

    const total = rows.reduce((sum, t) => sum + t.amount, 0)
    const titleType = wantsIncome && !wantsExpense ? "Credit" : wantsExpense && !wantsIncome ? "Debit" : "All"
    const lines = [
      `${scopeLabel} ${matchedCategory} (${titleType})`,
      `Count: ${rows.length}`,
      `Total Amount: ${formatAmount(total)}`,
    ]
    return lines.join("\n")
  }

  const asksBudgetStatus = /\bbudget|budgets\b/.test(text)
  if (asksBudgetStatus) {
    const lines = ["Budget Status"]
    if (budgets.length === 0) {
      lines.push("No budgets set.")
      return lines.join("\n")
    }
    budgets.forEach((b, index) => {
      const remaining = b.amount - b.spent
      const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0
      lines.push(
        `${index + 1}. ${b.category} | Spent ${formatAmount(b.spent)} | Limit ${formatAmount(b.amount)} | Remaining ${formatAmount(remaining)} | ${pct}%`
      )
    })
    return lines.join("\n")
  }

  const asksTotals =
    /\b(total|balance|income|expense|expenses|spent|saving|savings|credit|debit|cashflow|cash flow)\b/.test(text)

  if (asksTotals) {
    const income = scopedMetrics.totalIncome
    const expense = scopedMetrics.totalExpense
    const balance = scopedMetrics.balance

    const wantsIncome = /\bincome|credit\b/.test(text)
    const wantsExpense = /\bexpense|expenses|spent|debit\b/.test(text)
    const wantsBalance = /\bbalance|saving|savings|left|cashflow|cash flow\b/.test(text)
    const wantsAll = !wantsIncome && !wantsExpense && !wantsBalance

    const lines = [`${scopeLabel} Totals`]
    if (wantsAll || wantsIncome) lines.push(`Income: ${formatAmount(income)}`)
    if (wantsAll || wantsExpense) lines.push(`Expense: ${formatAmount(expense)}`)
    if (wantsAll || wantsBalance) lines.push(`Balance: ${formatAmount(balance)}`)
    if (wantsAll || wantsBalance) lines.push(`Savings Rate: ${scopedMetrics.savingsRate}%`)
    return lines.join("\n")
  }

  return null
}

function detectReceiptTransaction(msg: string): Partial<TransactionDraft> | null {
  const nameMatch = msg.match(/name\s+"([^"]+)"/i)
  const amountMatch = msg.match(/amount\s+(?:rs\.?|inr|rupees?)?\s*([\d,]+)/i)
  const dateMatch = msg.match(/date\s+(\d{4}-\d{2}-\d{2})/i)
  const categoryMatch = msg.match(/category\s+([A-Za-z\s]+?)(?:,|\.)/i)
  const methodMatch = msg.match(/method\s+([A-Za-z\s]+?)(?:,|\.)/i)
  const typeMatch = msg.match(/type\s+(Debit|Credit)/i)

  if (!nameMatch || !amountMatch) return null
  const amount = parseFloat(amountMatch[1].replace(/,/g, ""))
  if (Number.isNaN(amount) || amount <= 0) return null

  const category = safeCategory(categoryMatch?.[1].trim())
  const method = safeMethod(methodMatch?.[1].trim())

  return {
    transaction: nameMatch[1].trim(),
    amount,
    date: dateMatch?.[1] ?? format(new Date(), "yyyy-MM-dd"),
    category,
    method,
    type: (typeMatch?.[1] ?? "Debit") as "Debit" | "Credit",
    status: "Completed",
  }
}

function detectBulkImport(msg: string): Partial<TransactionDraft>[] | null {
  if (!/^bulk import \d+ transaction/i.test(msg.trim())) return null

  const lines = msg.split("\n").filter((line) => /^\d+\.\s/.test(line.trim()))
  if (!lines.length) return null

  const results: Partial<TransactionDraft>[] = []
  for (const line of lines) {
    const nameMatch = line.match(/name\s+"([^"]+)"/i)
    const amountMatch = line.match(/amount\s+(?:rs\.?|inr|rupees?)?\s*([\d,]+)/i)
    const dateMatch = line.match(/date\s+(\d{4}-\d{2}-\d{2})/i)
    const categoryMatch = line.match(/category\s+([A-Za-z\s]+?)(?:,|$)/i)
    const methodMatch = line.match(/method\s+([A-Za-z\s]+?)(?:,|$)/i)
    const typeMatch = line.match(/type\s+(Debit|Credit)/i)

    if (!nameMatch || !amountMatch) continue
    const amount = parseFloat(amountMatch[1].replace(/,/g, ""))
    if (Number.isNaN(amount) || amount <= 0) continue

    results.push({
      transaction: nameMatch[1].trim(),
      amount,
      date: dateMatch?.[1] ?? format(new Date(), "yyyy-MM-dd"),
      category: safeCategory(categoryMatch?.[1].trim()),
      method: safeMethod(methodMatch?.[1].trim()),
      type: (typeMatch?.[1] ?? "Debit") as "Debit" | "Credit",
      status: "Completed",
    })
  }

  return results.length ? results : null
}

function isDuplicate(draft: Partial<TransactionDraft>, existing: Transaction[]): boolean {
  return existing.some(
    (t) =>
      t.transaction.toLowerCase() === (draft.transaction ?? "").toLowerCase() &&
      t.amount === draft.amount &&
      t.date === draft.date
  )
}

function buildBulkPreviewCard(unique: Partial<TransactionDraft>[], duplicates: Partial<TransactionDraft>[]): string {
  const total = unique.length + duplicates.length
  const lines: string[] = []

  lines.push(`Found ${total} transaction${total > 1 ? "s" : ""} in this image:`)
  lines.push("")

  if (unique.length > 0) {
    const label = duplicates.length > 0 ? `New (${unique.length}):` : `Transactions (${unique.length}):`
    lines.push(label)
    unique.forEach((d) => {
      lines.push(`- ${d.transaction} - Rs.${(d.amount as number).toLocaleString("en-IN")} - ${d.date} - ${d.category} - ${d.type}`)
    })
  }

  if (duplicates.length > 0) {
    if (unique.length > 0) lines.push("")
    lines.push(`Already exist (${duplicates.length}) - same name, amount, and date:`)
    duplicates.forEach((d) => {
      lines.push(`- ${d.transaction} - Rs.${(d.amount as number).toLocaleString("en-IN")} - ${d.date}`)
    })
  }

  lines.push("")

  if (unique.length > 0 && duplicates.length > 0) {
    lines.push(`Reply "yes" to add the ${unique.length} new transaction(s), or "no" to cancel.`)
  } else if (unique.length > 0) {
    lines.push(`Reply "yes" to add all ${unique.length} transaction(s), or "no" to cancel.`)
  } else {
    lines.push(`All are duplicates. Reply "yes" to add anyway, or "no" to skip.`)
  }

  return lines.join("\n")
}

function buildDupAskCard(duplicates: Partial<TransactionDraft>[]): string {
  const lines: string[] = [
    `Now about the ${duplicates.length} duplicate transaction${duplicates.length > 1 ? "s" : ""}:`,
    "",
  ]
  duplicates.forEach((d) => {
    lines.push(`- ${d.transaction} - Rs.${(d.amount as number).toLocaleString("en-IN")} - ${d.date}`)
  })
  lines.push("")
  lines.push('These already exist. Add anyway? Reply "yes" or "no".')
  return lines.join("\n")
}

function getMissingFields(draft: Partial<TransactionDraft>): string[] {
  const missing: string[] = []
  if (typeof draft.amount !== "number") missing.push("amount")
  if (!draft.method) missing.push("method")
  if (!draft.category) missing.push("category")
  if (!draft.type) missing.push("type")
  return missing
}

function buildMissingFieldQuestion(missing: string[], draft: Partial<TransactionDraft>): string {
  if (missing.includes("amount")) {
    return `How much was it for ${draft.transaction ?? "this transaction"}? (just the number, e.g. 500)`
  }
  if (missing.includes("method")) {
    return `How did you pay or receive?\n- Cash\n- UPI\n- Credit Card\n- Debit Card\n- Bank Transfer\n- Net Banking`
  }
  if (missing.includes("category")) {
    return `Which category fits best?\n- Food\n- Shopping\n- Transport\n- Utilities\n- Health\n- Entertainment\n- Subscription\n- Income\n- Other`
  }
  return `Should I add this as Debit (expense) or Credit (income)?`
}

function fillDraftFromReply(reply: string, draft: Partial<TransactionDraft>): Partial<TransactionDraft> {
  const r = reply.toLowerCase().trim()
  const updated = { ...draft }

  if (typeof updated.amount !== "number") {
    const amountMatch = reply.match(/(?:rs\.?|inr|rupees?)?\s*(\d[\d,]*(?:\.\d+)?)/i)
    if (amountMatch) {
      const parsed = parseFloat(amountMatch[1].replace(/,/g, ""))
      if (!Number.isNaN(parsed) && parsed > 0) updated.amount = parsed
    }
  }

  if (!updated.method) {
    if (r.includes("cash") || r === "1") updated.method = "Cash"
    else if (r.includes("upi") || r.includes("gpay") || r.includes("phonepe") || r.includes("paytm") || r === "2") updated.method = "UPI"
    else if (r.includes("credit") || r === "3") updated.method = "Credit Card"
    else if (r.includes("debit") || r === "4") updated.method = "Debit Card"
    else if (r.includes("bank") || r.includes("transfer") || r.includes("neft") || r.includes("imps") || r === "5") updated.method = "Bank Transfer"
    else if (r.includes("net") || r.includes("netbanking") || r === "6") updated.method = "Net Banking"
  }

  if (!updated.category) {
    const found = VALID_CATEGORIES.find((c) => r.includes(c.toLowerCase()))
    if (found) updated.category = found
  }

  if (!updated.type) {
    if (r.includes("debit") || r.includes("expense")) updated.type = "Debit"
    if (r.includes("credit") || r.includes("income")) updated.type = "Credit"
  }

  return updated
}

function guidedCategoryFromReply(reply: string): string {
  return VALID_CATEGORIES.find((c) => reply.toLowerCase().includes(c.toLowerCase())) ?? "Other"
}

function guidedMethodFromReply(reply: string): string {
  const l = reply.toLowerCase()
  if (l.includes("cash") || l === "1") return "Cash"
  if (l.includes("upi") || l.includes("gpay") || l.includes("phonepe") || l.includes("paytm") || l === "2") return "UPI"
  if (l.includes("credit") || l === "3") return "Credit Card"
  if (l.includes("debit") || l === "4") return "Debit Card"
  if (l.includes("bank") || l.includes("transfer") || l === "5") return "Bank Transfer"
  if (l.includes("net") || l === "6") return "Net Banking"
  return "Cash"
}

type CorrectableField = "transaction" | "category" | "amount" | "type" | "method"
type FieldCorrection = { field: CorrectableField; value: string }

function detectCorrection(input: string): FieldCorrection | null {
  const s = input.trim()
  const l = s.toLowerCase()

  const namePatterns: [RegExp, number][] = [
    [/^no[,.]?\s+(?:the\s+)?name\s+(?:is|should be|=)\s+(.+)$/i, 1],
    [/^change\s+(?:the\s+)?name\s+to\s+(.+)$/i, 1],
    [/^(?:the\s+)?name\s+(?:is|should be)\s+(.+)$/i, 1],
    [/^(?:it'?s?|its)\s+(.+)$/i, 1],
    [/^wrong(?:\s+name)?,?\s+(?:it'?s?|its|the name is)\s+(.+)$/i, 1],
    [/^no[,.]?\s+(?:it'?s?|its)\s+(.+)$/i, 1],
  ]

  for (const [pattern, group] of namePatterns) {
    const match = s.match(pattern)
    if (match) return { field: "transaction", value: match[group].trim() }
  }

  const catMatch = s.match(/(?:category\s+(?:is|should be|=)|change\s+category\s+to)\s+(.+)/i)
  if (catMatch) {
    const category = guidedCategoryFromReply(catMatch[1])
    return { field: "category", value: category }
  }

  if (/(?:type\s+(?:is|should be)|make\s+it)\s+credit/i.test(l)) return { field: "type", value: "Credit" }
  if (/(?:type\s+(?:is|should be)|make\s+it)\s+debit/i.test(l)) return { field: "type", value: "Debit" }

  const methodMatch = s.match(/(?:method\s+(?:is|should be|=)|(?:paid|pay)\s+(?:via|with|by)|change\s+method\s+to)\s+(.+)/i)
  if (methodMatch) return { field: "method", value: guidedMethodFromReply(methodMatch[1]) }

  const amountMatch = s.match(/(?:amount\s+(?:is|should be|=)|change\s+amount\s+to)\s+(?:rs\.?|inr|rupees?)?\s*(\d[\d,]*(?:\.\d+)?)/i)
  if (amountMatch) return { field: "amount", value: amountMatch[1].replace(/,/g, "") }

  return null
}

function buildConfirmCard(draft: Partial<TransactionDraft>, languageMode: LanguageMode): string {
  const header = localizeByMode(languageMode, {
    english: "Here is what I will add:",
    hinglish: "Yeh details add hongi:",
    hindi: "",
  })
  const confirmLine = localizeByMode(languageMode, {
    english: 'Reply "yes" to confirm or "no" to cancel.',
    hinglish: 'Confirm karne ke liye "yes" bolo ya cancel ke liye "no".',
    hindi: "",
  })

  return (
    `${header}\n\n` +
    `- Name: ${draft.transaction}\n` +
    `- Amount: Rs.${(draft.amount as number).toLocaleString("en-IN")}\n` +
    `- Category: ${draft.category}\n` +
    `- Type: ${draft.type}\n` +
    `- Method: ${draft.method}\n` +
    `- Date: ${draft.date}\n\n` +
    `${confirmLine}`
  )
}

function buildSystemPrompt(
  
  transactions: Transaction[],
  budgets: Budget[],
  languageMode: LanguageMode
): string {
  const metrics = createFinancialMetrics(transactions, budgets)
  const currentMonth = metrics.currentMonth.monthKey
  const lastMonthTrend = metrics.monthlyTrends.length >= 2
    ? metrics.monthlyTrends[metrics.monthlyTrends.length - 2]
    : null
  const totalIncome = metrics.totalIncome
  const totalExpense = metrics.totalExpense
  const monthIncome = metrics.currentMonth.totalIncome
  const monthExpense = metrics.currentMonth.totalExpense
  const lastMonthExp = lastMonthTrend?.expense ?? 0
  const lastMonthLabel = lastMonthTrend?.monthKey ?? "N/A"

  const budgetLines = budgets.length
    ? budgets
      .map((b) => {
        const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0
        return `- ${b.category}: Rs.${b.spent.toLocaleString("en-IN")} / Rs.${b.amount.toLocaleString("en-IN")} (${pct}%)`
      })
      .join("\n")
    : "- No budgets set"

  const recentLines = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 25)
    .map((t) => `- ${t.date} | ${t.transaction} | ${t.type === "Credit" ? "+" : "-"}Rs.${t.amount.toLocaleString("en-IN")} | ${t.category} | ${t.method}`)
    .join("\n") || "- No transactions yet"

  const monthlyTotals = metrics.monthlyTrends.reduce<Record<string, { income: number; expense: number; savings: number }>>(
    (acc, trend) => {
      acc[trend.monthKey] = {
        income: trend.income,
        expense: trend.expense,
        savings: trend.savings,
      }
      return acc
    },
    {}
  )

  const languageInstruction =
    languageMode === "hindi"
      ? "Reply fully in Hindi script (Devanagari)."
      : languageMode === "hinglish"
        ? "Reply in Hinglish using English letters only (Roman script). Do not use Devanagari."
        : "Reply fully in English. Do not include Hindi words."

  const todayFormatted = format(new Date(), "EEEE, MMMM d, yyyy")

return `You are VoiceKhata AI, a smart finance companion.

Today's date: ${todayFormatted}

Financial snapshot:
- Overall Income: Rs.${totalIncome.toLocaleString("en-IN")}
- Overall Expenses: Rs.${totalExpense.toLocaleString("en-IN")}
- Overall Balance: Rs.${(totalIncome - totalExpense).toLocaleString("en-IN")}
- Overall Savings Rate: ${metrics.savingsRate}%
- This month (${currentMonth}) Income: Rs.${monthIncome.toLocaleString("en-IN")}
- This month (${currentMonth}) Expenses: Rs.${monthExpense.toLocaleString("en-IN")}
- This month (${currentMonth}) Savings Rate: ${metrics.currentMonth.savingsRate}%
- Last month (${lastMonthLabel}) Expenses: Rs.${lastMonthExp.toLocaleString("en-IN")}

Budgets:
${budgetLines}

Transactions:
${recentLines}

Monthly Totals (full history, JSON):
${JSON.stringify(monthlyTotals)}

${MONEY_GROWTH_ENGINE_PROMPT}

Rules:
1. Use only provided data for numbers.
2. Keep replies concise and practical.
3. ${languageInstruction}
4. Never mix scripts unless user explicitly asks for translation.
5. For date questions (month/year/quarter), use full transaction history and monthly totals JSON.
6. If a time range has no data, say that clearly with the exact month/year asked.
7. You are a finance companion but you can answer general questions like current date, greetings, and small talk naturally and briefly. After answering, always gently steer back to finances. You must REFUSE only explicit requests like writing code, recipes, poems, or entertainment content unrelated to finance.
8. Never claim you wrote to database yourself.
9. Understand and correctly interpret technical finance terms in English, Hindi, and Hinglish (e.g., SIP, Mutual Funds, FD, RD, EMI, Loan, udhaar, byaaj, poonjigat labh, karza) and provide appropriate financial advice based on them.`
}

function isLikelyUnrelated(input: string): boolean {
  const text = input.toLowerCase().trim()
  if (!text) return false

  // Always allow through — greetings, casual, general questions
  const alwaysAllow = /^(hi+|hey|hello|hii|sup|yo|good\s+(morning|night|evening)|how are you|whats up|what's up)/i
  if (alwaysAllow.test(text)) return false

  // Block only explicit off-topic requests
  const hardBlock = /\b(write\s+(a\s+)?(code|program|script|function|class)|generate\s+(code|a\s+program)|recipe\s+for|how\s+to\s+cook|cricket\s+score|football\s+score|ipl\s+score|weather\s+forecast|write\s+a\s+poem|tell\s+me\s+a\s+joke|draw\s+(a|me)|create\s+(a\s+)?(song|poem|story)|c\+\+\s+code|python\s+code|javascript\s+code|#include|def\s+\w+\s*\(|function\s+\w+\s*\()\b/i
  return hardBlock.test(text)
}

function getSoftRedirectMessage(input: string, languageMode: LanguageMode): string | null {
  const text = input.toLowerCase().trim()
  if (!text) return null

  // Only redirect for small talk (greetings with no finance context)
  if (isSmallTalkIntent(text) && !isLikelyUnrelated(text)) {
    return localizeByMode(languageMode, {
      english: "Hey! I'm VoiceKhata AI. Ask me anything about your finances, or log a transaction!",
      hinglish: "Hey! Main VoiceKhata AI hoon. Finances ke baare mein kuch bhi pucho, ya transaction log karo!",
      hindi: "",
    })
  }

  // Only redirect for hard-blocked content
  if (isLikelyUnrelated(text)) {
    return localizeByMode(languageMode, {
      english: "I'm VoiceKhata AI — I can only help with your finances. Want to log a transaction or check your spending?",
      hinglish: "Main VoiceKhata AI hoon — sirf finance ke liye hoon. Transaction log karein ya spending check karein?",
      hindi: "",
    })
  }

  return null
}

async function callGroq(apiKey: string, systemPrompt: string, history: Message[]): Promise<string> {
  let lastError: Error | null = null

  for (const model of GROQ_FALLBACK_MODELS) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...history.map((m) => ({ role: m.role, content: m.content }))],
          temperature: 0.5,
          max_tokens: 900,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        const errMsg = errorPayload?.error?.message ?? `Groq error (${response.status})`
        if (response.status === 404 || errMsg.toLowerCase().includes("does not exist") || errMsg.toLowerCase().includes("access")) {
          lastError = new Error(errMsg)
          continue
        }
        throw new Error(errMsg)
      }

      const data = await response.json()
      return data?.choices?.[0]?.message?.content?.trim() ?? "I could not generate a response."
    } catch (err: any) {
      lastError = err
      if (err.message && (err.message.toLowerCase().includes("does not exist") || err.message.toLowerCase().includes("access"))) {
        continue
      }
      throw err
    }
  }

  throw lastError ?? new Error("Groq request failed with all available models.")
}

async function addDrafts(
  drafts: Partial<TransactionDraft>[],
  onAddTransaction: Props["onAddTransaction"]
): Promise<{ added: Partial<TransactionDraft>[]; failed: string[] }> {
  const added: Partial<TransactionDraft>[] = []
  const failed: string[] = []

  for (const draftPartial of drafts) {
    const draft = draftPartial as TransactionDraft
    try {
      const result = await onAddTransaction({
        transaction: draft.transaction,
        category: safeCategory(draft.category),
        amount: draft.amount,
        date: draft.date || format(new Date(), "yyyy-MM-dd"),
        type: draft.type || "Debit",
        method: safeMethod(draft.method),
        status: "Completed",
      })
      if (result?.error) failed.push(draft.transaction)
      else added.push(draftPartial)
    } catch {
      failed.push(draft.transaction)
    }
  }

  return { added, failed }
}

function shouldTreatAsTransactionInput(content: string, confidence: number, amount: number | null): boolean {
  const explicitLogging = isExplicitLoggingRequest(content)
  const hasStructuredData = hasTransactionLikeData(content)
  const hasSafeAIConfidence = confidence >= 0.85 && amount !== null
  return explicitLogging || hasStructuredData || hasSafeAIConfidence
}

export function useAIChat({
  transactions,
  budgets,
  onAddTransaction,
  onAddBudget,
  messages,
  setMessages,
  pendingDraft,
  setPendingDraft,
  guidedStep,
  setGuidedStep,
  languageMode,
  setLanguageMode,
  assistantMode,
  setAssistantMode,
  multiState,
  setMultiState,
}: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [bulkState, setBulkState] = useState<BulkState | null>(null)
  const [lookupState, setLookupState] = useState<LookupResolveState | null>(null)
  const [budgetDraft, setBudgetDraft] = useState<Partial<BudgetDraft> | null>(null)
  const [budgetStep, setBudgetStep] = useState<BudgetGuidedStep>("idle")

  const { parseTransaction } = useAITransaction()

  const addMessage = (message: Omit<Message, "id">) => {
    const id = `${message.role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setMessages((prev) => [...prev, { ...message, id }])
  }

  const resolveMerchantPipeline = async (
    apiKey: string,
    rawInput: string,
    context: string,
    mode: "auto" | "force-web" = "auto"
  ): Promise<MerchantResolution> => {
    const memoryHit = await lookupMerchantMemory(user?.uid, rawInput)
    if (memoryHit) return memoryHit

    const aiEnhanced = await enhanceMerchant(apiKey, rawInput, context)
    if (mode !== "force-web" && aiEnhanced && aiEnhanced.confidence >= 0.7) {
      await rememberMerchant(user?.uid, aiEnhanced).catch(() => undefined)
      return aiEnhanced
    }

    const shouldTryWeb =
      mode === "force-web" ||
      !aiEnhanced ||
      aiEnhanced.confidence < 0.4

    if (shouldTryWeb) {
      const webResult = await merchantWebFallback(rawInput)
      if (webResult && webResult.confidence >= 0.4) {
        await rememberMerchant(user?.uid, webResult).catch(() => undefined)
        return webResult
      }
    }

    if (aiEnhanced) return aiEnhanced
    return fallbackMerchantResolution(rawInput)
  }

  const saveMerchantLearningFromDraft = async (draft: TransactionDraft) => {
    const payload: MerchantResolution = {
      rawInput: draft.merchantRawInput ?? draft.transaction,
      normalizedName: draft.transaction,
      merchantType: draft.merchantType ?? "other",
      category: safeCategory(draft.category) as MerchantResolution["category"],
      tags: Array.isArray(draft.merchantTags) ? draft.merchantTags : [],
      confidence: typeof draft.merchantConfidence === "number" ? draft.merchantConfidence : 0.7,
      source: "ai",
    }
    await rememberMerchant(user?.uid, payload).catch(() => undefined)
  }

  const startGuidedFlow = (seedAmount?: number, seedName?: string) => {
    if (loading) return
    const activeLanguage = languageMode ?? "english"
    setBudgetDraft(null)
    setBudgetStep("idle")
    
    const initialDraft: Partial<TransactionDraft> = {}
    if (seedAmount) initialDraft.amount = seedAmount
    if (seedName) initialDraft.transaction = seedName
    setPendingDraft(initialDraft)
    
    setGuidedStep("name")
    setAssistantMode("expense_logging")
    
    const englishMsg = seedAmount 
      ? `Sure. Let's log a transaction of Rs.${seedAmount.toLocaleString("en-IN")}.\n\nWhat did you spend on, or what did you receive?`
      : seedName
        ? `Sure. Let's log a transaction for "${seedName}".\n\nHow much was it?`
        : "Sure. Let's log a transaction.\n\nWhat did you spend on, or what did you receive?"
      
    const hinglishMsg = seedAmount
      ? `Sure. Rs.${seedAmount.toLocaleString("en-IN")} ka transaction log karte hain.\n\nKis cheez par spend kiya tha, ya kya receive hua?`
      : seedName
        ? `Sure. "${seedName}" ke liye transaction log karte hain.\n\nKitne ka tha?`
        : "Sure. Chalo transaction log karte hain.\n\nKis cheez par spend kiya tha, ya kya receive hua?"

    // If we seeded the name, we skip the name question and go to amount.
    if (seedName) {
      setGuidedStep("amount")
    }

    addMessage({
      role: "assistant",
      content: localizeByMode(activeLanguage, {
        english: englishMsg,
        hinglish: hinglishMsg,
        hindi: "",
      }),
    })
  }

  const startBudgetFlow = (seed?: Partial<BudgetDraft>) => {
    if (loading) return
    const activeLanguage = languageMode ?? "english"
    const nextDraft = seed ?? {}
    const missing = budgetMissingFields(nextDraft)

    setPendingDraft(null)
    setGuidedStep("idle")
    setBudgetDraft(nextDraft)
    setAssistantMode("budgeting")

    if (missing.length === 0) {
      setBudgetStep("confirm")
      addMessage({
        role: "assistant",
        content: buildBudgetConfirmCard(nextDraft as BudgetDraft, activeLanguage),
      })
      return
    }

    setBudgetStep(missing[0])
    addMessage({
      role: "assistant",
      content: localizeByMode(activeLanguage, {
        english: `Sure. Let's set a budget.\n\n${buildBudgetMissingQuestion(missing, nextDraft)}`,
        hinglish: `Theek hai. Budget set karte hain.\n\n${buildBudgetMissingQuestion(missing, nextDraft)}`,
        hindi: "",
      }),
    })
  }

  const cancelGuidedFlow = () => {
    const activeLanguage = languageMode ?? "english"
    setPendingDraft(null)
    setGuidedStep("idle")
    setAssistantMode("conversation")
    addMessage({
      role: "assistant",
      content: localizeByMode(activeLanguage, {
        english: "Transaction entry cancelled. Anything else?",
        hinglish: "Transaction entry cancel kar diya. Aur kuch?",
        hindi: "",
      }),
    })
  }

  const cancelBudgetFlow = () => {
    const activeLanguage = languageMode ?? "english"
    setBudgetDraft(null)
    setBudgetStep("idle")
    setAssistantMode("conversation")
    addMessage({
      role: "assistant",
      content: localizeByMode(activeLanguage, {
        english: "Budget setup cancelled. Anything else?",
        hinglish: "Budget setup cancel kar diya. Aur kuch?",
        hindi: "",
      }),
    })
  }

  const cancelMultiTransactions = () => {
    setMultiState(null)
    setAssistantMode("conversation")
    addMessage({
      role: "assistant",
      content: "Bulk transaction entry cancelled. Let me know if you need anything else.",
    })
  }

  const confirmMultiTransactions = async () => {
    if (!multiState || multiState.step !== "review") return
    
    setLoading(true)
    const { added, failed } = await addDrafts(multiState.drafts, onAddTransaction)
    
    setMultiState(null)
    setAssistantMode("conversation")
    
    const parts: string[] = []
    if (added.length > 0) {
      parts.push(`Added ${added.length} transaction(s).`)
    }
    if (failed.length > 0) {
      parts.push(`Failed to add ${failed.length} transaction(s).`)
    }
    
    addMessage({
      role: "assistant",
      content: parts.join("\n") + "\n\nAll done! You can see them in your dashboard.",
    })
    setLoading(false)
  }

  const sendMessage = async (content: string, replyTo?: Message["replyTo"]) => {
    if (!content.trim() || loading) return

    const trimmedContent = content.trim()
    const nextLanguageMode = detectLanguageMode(trimmedContent, languageMode)
    if (nextLanguageMode !== languageMode) {
      setLanguageMode(nextLanguageMode)
    }

    const flowActive = guidedStep !== "idle" || !!pendingDraft || budgetStep !== "idle"
    const nextAssistantMode =
      budgetStep !== "idle"
        ? "budgeting"
        : classifyAssistantMode(trimmedContent, assistantMode, flowActive)
    if (nextAssistantMode !== assistantMode) {
      setAssistantMode(nextAssistantMode)
    }

    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string

    // --- Bulk Transaction Processing (Interceptor) ---
    if (multiState) {
      const reply = content.toLowerCase().trim()
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: trimmedContent, replyTo }])
      
      // NLP Overrides
      const changeAmountMatch = reply.match(/change(?: the)?(?: rs\.?| inr| rupees?| ₹)?\s*(\d+).* to(?: rs\.?| inr| rupees?| ₹)?\s*(\d+)/)
      if (changeAmountMatch) {
         const fromAmt = parseInt(changeAmountMatch[1])
         const toAmt = parseInt(changeAmountMatch[2])
         setMultiState({
            ...multiState,
            drafts: multiState.drafts.map(d => d.amount === fromAmt ? { ...d, amount: toAmt } : d)
         })
         addMessage({ role: "assistant", content: `Changed transaction amount from ₹${fromAmt} to ₹${toAmt}.` })
         return
      }

      const makeNameMatch = reply.match(/make (.+?)(?:'s)? transaction (credit|debit)/)
      if (makeNameMatch) {
         const name = makeNameMatch[1].trim()
         const type = (makeNameMatch[2].charAt(0).toUpperCase() + makeNameMatch[2].slice(1)) as "Credit" | "Debit"
         setMultiState({
            ...multiState,
            drafts: multiState.drafts.map(d => {
               if (d.transaction?.toLowerCase().includes(name)) {
                  const newType = type
                  const isDone = d.transaction && newType
                  return { ...d, type: newType, status: isDone ? "completed" : d.status }
               }
               return d
            })
         })
         addMessage({ role: "assistant", content: `Updated ${name}'s transaction to ${type}.` })
         return
      }

      if (reply.includes("make all") && reply.includes("debit")) {
         setMultiState({
            ...multiState,
            drafts: multiState.drafts.map(d => (!d.type ? { ...d, type: "Debit", status: (d.transaction || multiState.skipNames) ? "completed" : d.status } : d))
         })
         addMessage({ role: "assistant", content: "Marked remaining transactions as Debit." })
         return
      }
      
      if (reply.includes("make all") && reply.includes("credit")) {
         setMultiState({
            ...multiState,
            drafts: multiState.drafts.map(d => (!d.type ? { ...d, type: "Credit", status: (d.transaction || multiState.skipNames) ? "completed" : d.status } : d))
         })
         addMessage({ role: "assistant", content: "Marked remaining transactions as Credit." })
         return
      }

      if (reply.includes("skip the names") || reply.includes("skip names") || reply === "skip names for remaining") {
         setMultiState({ ...multiState, skipNames: true })
         addMessage({ role: "assistant", content: "I'll skip the names for the rest of the transactions." })
         // Note: the queue logic will automatically mark them completed next render
         return
      }

      
      // Pause / Resume
      if (reply === "pause" || reply === "pause processing") {
        setMultiState({ ...multiState, step: "paused" })
        addMessage({ role: "assistant", content: `Processing paused. ${multiState.drafts.filter(d => d.status === 'completed').length} of ${multiState.drafts.length} transactions completed.\n\nYou can say "resume" to continue or "cancel bulk" to abort.` })
        return
      }
      if (multiState.step === "paused") {
        if (reply === "resume") {
          setMultiState({ ...multiState, step: "queue" })
        } else if (reply === "cancel bulk") {
          cancelMultiTransactions()
        } else {
          // Allow normal chat while paused
          return
        }
        return
      }

      if (multiState.step === "setup") {
        let nextState = { ...multiState }
        if (reply === "credit all") {
          nextState = { ...nextState, step: "queue" }
          nextState.drafts = nextState.drafts.map(d => {
             const newD = !d.type ? { ...d, type: "Credit" } : { ...d }
             if ((newD.transaction || nextState.skipNames) && newD.type) newD.status = "completed"
             return newD as typeof d
          })
        } else if (reply === "debit all") {
          nextState = { ...nextState, step: "queue" }
          nextState.drafts = nextState.drafts.map(d => {
             const newD = !d.type ? { ...d, type: "Debit" } : { ...d }
             if ((newD.transaction || nextState.skipNames) && newD.type) newD.status = "completed"
             return newD as typeof d
          })
        } else if (reply === "set individually") {
          nextState = { ...nextState, step: "queue" }
        } else {
          addMessage({ role: "assistant", content: "Please select an option: Credit All, Debit All, or Set Individually." })
          return
        }
        setMultiState(nextState)
        return
      }

      if (multiState.step === "queue") {
        let nextState = { ...multiState, drafts: [...multiState.drafts] }
        
        // Find next pending draft
        const nextPendingIndex = nextState.drafts.findIndex(d => d.status === "pending" || d.status === "needs-attention")
        
        if (nextPendingIndex !== -1) {
          const d = nextState.drafts[nextPendingIndex]

          if (!d.transaction && !nextState.skipNames) {
            if (reply === "skip name" || reply === "skip") {
              d.transaction = `₹${d.amount} transaction`
              d.category = "Other"
            } else {
              setLoading(true)
              const aiResult = await parseTransaction(content.trim())
              setLoading(false)
              d.transaction = aiResult?.transaction || content.trim()
              d.category = safeCategory(aiResult?.category)
            }
          } else if (!d.type) {
            if (reply.includes("debit")) {
              d.type = "Debit"
            } else if (reply.includes("credit")) {
              d.type = "Credit"
            } else {
              d.type = "Debit"
            }
          }

          // Evaluate if completed
          if (nextState.skipNames && !d.transaction) { d.transaction = `₹${d.amount} transaction`; d.category = "Other"; }
          if (d.transaction && d.type) {
            d.status = "completed"
          }
        }
        
        // Auto-complete any that are fully populated but still marked pending
        nextState.drafts.forEach(d => {
          if (d.status === "pending" && nextState.skipNames && !d.transaction) {
            d.transaction = `₹${d.amount} transaction`
            d.category = "Other"
          }
          if (d.status === "pending" && d.transaction && d.type) {
            d.status = "completed"
          }
        })

        // Check if all are done
        const allDone = nextState.drafts.every(d => d.status === "completed" || d.status === "skipped" || d.status === "duplicate" || d.status === "error")
        if (allDone) {
          nextState.step = "review"
        }

        setMultiState(nextState)
        return
      }
      
      return
    }

    // --- Detect Multi-Amount Setup ---
    const parseMultiTransactions = (text: string): DraftItem[] => {
      // Split on newlines, or on a comma that is followed by a space
      const parts = text.split(/[\n]+|,\s+/).map(p => p?.trim()).filter(Boolean) as string[]
      const drafts: DraftItem[] = []
      const amountRegex = /\b(?:rs\.?|inr|rupees?|₹)?\s*(\d[\d,]*(\.\d+)?)\s*(?:rs\.?|inr|rupees?|₹)?\b/i
      
      const seen = new Set<string>()
      
      for (const part of parts) {
        const match = part.match(amountRegex)
        if (match) {
          const amountStr = match[1]
          const amount = parseFloat(amountStr.replace(/,/g, ""))
          if (!Number.isNaN(amount) && amount > 0) {
            let rest = part.replace(match[0], "").trim()
            let type: "Debit" | "Credit" | undefined
            
            if (/\bdebit\b/i.test(rest)) {
              type = "Debit"
              rest = rest.replace(/\bdebit\b/i, "").trim()
            } else if (/\bcredit\b/i.test(rest)) {
              type = "Credit"
              rest = rest.replace(/\bcredit\b/i, "").trim()
            }
            
            let transaction = rest.replace(/^[-\s]+|[-\s]+$/g, "").trim()
            
            let status: DraftItem["status"] = "pending"
            const dedupKey = `${amount}-${transaction.toLowerCase()}`
            if (transaction && seen.has(dedupKey)) {
              status = "duplicate"
            }
            if (transaction) seen.add(dedupKey)
            
            if (transaction && type && status !== "duplicate") {
               status = "completed"
            }

            drafts.push({
              id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              amount,
              transaction: transaction || undefined,
              type,
              status,
            })
          }
        }
      }
      return drafts
    }

    const newDrafts = parseMultiTransactions(trimmedContent)
    if (newDrafts.length > 1 && guidedStep === "idle" && budgetStep === "idle") {
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: trimmedContent }])
      
      const needsNameCount = newDrafts.filter(d => !d.transaction).length
      const needsTypeCount = newDrafts.filter(d => !d.type).length
      
      let initialStep: MultiGuidedStep = "setup"
      if (needsTypeCount === 0) {
         initialStep = "queue" // Auto-skip setup if no type needed
      }

      setMultiState({
        step: initialStep,
        drafts: newDrafts,
        needsNameCount,
        needsTypeCount,
        skipNames: false,
      })
      setAssistantMode("expense_logging")
      return
    }

    const logTxRegex = /^(?:add|log|create)\s+(?:a\s+|the\s+)?transaction(?:\s+(?:of|for)\s+(?:(?:rs\.?|inr|rupees?|₹)\s*)?([\d,]+(?:\.\d+)?)(?:\s*(?:rs\.?|inr|rupees?))?)?$/i
    const logTxMatch = trimmedContent.match(logTxRegex)
    if (logTxMatch && guidedStep === "idle" && budgetStep === "idle") {
      const amountStr = logTxMatch[1]
      const amount = amountStr ? parseFloat(amountStr.replace(/,/g, "")) : undefined
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: trimmedContent }])
      startGuidedFlow(amount && !Number.isNaN(amount) ? amount : undefined)
      setLoading(false)
      return
    }

    if (/^(cancel|stop|quit|exit|abort|nahi|nope)$/i.test(trimmedContent) && (guidedStep !== "idle" || pendingDraft || bulkState || lookupState || budgetStep !== "idle" || budgetDraft)) {
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: trimmedContent }])
      setBulkState(null)
      setLookupState(null)
      if (budgetStep !== "idle" || budgetDraft) cancelBudgetFlow()
      else cancelGuidedFlow()
      return
    }

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: trimmedContent, replyTo }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const reply = content.toLowerCase().trim()
      const isYes = /^(yes|y|confirm|ok|haan|ha|sure|add|add it|yep|yeah)$/i.test(reply)
      const isNo = /^(no|n|nahi|nope|don'?t|dont|skip|cancel)$/i.test(reply)

      if (bulkState) {
        if (bulkState.step === "preview") {
          if (isYes) {
            if (bulkState.unique.length > 0) {
              const { added, failed } = await addDrafts(bulkState.unique, onAddTransaction)
              const parts: string[] = []
              if (added.length > 0) {
                parts.push(
                  `Added ${added.length} transaction(s):\n` +
                  added.map((d) => `- ${d.transaction} - Rs.${(d.amount as number).toLocaleString("en-IN")} (${d.date})`).join("\n")
                )
              }
              if (failed.length > 0) parts.push(`Failed to add: ${failed.join(", ")}`)
              if (bulkState.duplicates.length > 0) {
                setBulkState({ ...bulkState, step: "dup-ask" })
                parts.push(buildDupAskCard(bulkState.duplicates))
              } else {
                setBulkState(null)
                parts.push("All done.")
              }
              addMessage({ role: "assistant", content: parts.join("\n\n") })
            } else {
              setBulkState({ ...bulkState, step: "dup-ask" })
              addMessage({ role: "assistant", content: buildDupAskCard(bulkState.duplicates) })
            }
          } else if (isNo) {
            setBulkState(null)
            addMessage({ role: "assistant", content: "Import cancelled." })
          } else {
            addMessage({ role: "assistant", content: `Please reply yes or no.\n\n${buildBulkPreviewCard(bulkState.unique, bulkState.duplicates)}` })
          }
          setLoading(false)
          return
        }

        if (bulkState.step === "dup-ask") {
          if (isYes) {
            const { added, failed } = await addDrafts(bulkState.duplicates, onAddTransaction)
            setBulkState(null)
            const parts: string[] = []
            if (added.length > 0) {
              parts.push(
                `Added ${added.length} duplicate transaction(s):\n` +
                added.map((d) => `- ${d.transaction} - Rs.${(d.amount as number).toLocaleString("en-IN")} (${d.date})`).join("\n")
              )
            }
            if (failed.length > 0) parts.push(`Failed: ${failed.join(", ")}`)
            addMessage({ role: "assistant", content: `${parts.join("\n\n")}\n\nAll done.` })
          } else if (isNo) {
            setBulkState(null)
            addMessage({ role: "assistant", content: "Duplicates skipped. All done." })
          } else {
            addMessage({ role: "assistant", content: 'Please reply "yes" to add duplicates or "no" to skip.' })
          }
          setLoading(false)
          return
        }
      }

      if (budgetStep !== "idle") {
        switch (budgetStep) {
          case "category": {
            if (parseBudgetDuration(content)) {
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: "I need a budget category first (for example Food or Utilities).",
                  hinglish: "Pehle budget category chahiye (jaise Food ya Utilities).",
                  hindi: "",
                }),
              })
              setLoading(false)
              return
            }

            const category =
              extractBudgetCategory(content) ??
              (content.trim().length >= 2 ? toTitleCase(content.replace(/\bbudget\b/gi, "").trim()) : undefined)
            if (!category) {
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: "Please share a category name, for example Food, Utilities, or Transport.",
                  hinglish: "Category ka naam bhejo, jaise Food, Utilities, ya Transport.",
                  hindi: "",
                }),
              })
              setLoading(false)
              return
            }

            const nextDraft = { ...(budgetDraft ?? {}), category }
            setBudgetDraft(nextDraft)
            const missing = budgetMissingFields(nextDraft)
            if (missing.length === 0) {
              setBudgetStep("confirm")
              addMessage({ role: "assistant", content: buildBudgetConfirmCard(nextDraft as BudgetDraft, nextLanguageMode) })
            } else {
              setBudgetStep(missing[0])
              addMessage({ role: "assistant", content: buildBudgetMissingQuestion(missing, nextDraft) })
            }
            setLoading(false)
            return
          }

          case "amount": {
            const amount = parseBudgetAmount(content)
            if (!amount) {
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: "That amount looks invalid. Try a number like 5000.",
                  hinglish: "Amount valid nahi lag raha. 5000 jaisa number bhejo.",
                  hindi: "",
                }),
              })
              setLoading(false)
              return
            }

            const nextDraft = { ...(budgetDraft ?? {}), amount }
            setBudgetDraft(nextDraft)
            const missing = budgetMissingFields(nextDraft)
            if (missing.length === 0) {
              setBudgetStep("confirm")
              addMessage({ role: "assistant", content: buildBudgetConfirmCard(nextDraft as BudgetDraft, nextLanguageMode) })
            } else {
              setBudgetStep(missing[0])
              addMessage({ role: "assistant", content: buildBudgetMissingQuestion(missing, nextDraft) })
            }
            setLoading(false)
            return
          }

          case "duration": {
            const duration = parseBudgetDuration(content)
            if (!duration) {
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: "Choose one: monthly, 3 months, 6 months, yearly, or timeless.",
                  hinglish: "Inme se choose karo: monthly, 3 months, 6 months, yearly, ya timeless.",
                  hindi: "",
                }),
              })
              setLoading(false)
              return
            }

            const nextDraft = { ...(budgetDraft ?? {}), duration }
            setBudgetDraft(nextDraft)
            const missing = budgetMissingFields(nextDraft)
            if (missing.length === 0) {
              setBudgetStep("confirm")
              addMessage({ role: "assistant", content: buildBudgetConfirmCard(nextDraft as BudgetDraft, nextLanguageMode) })
            } else {
              setBudgetStep(missing[0])
              addMessage({ role: "assistant", content: buildBudgetMissingQuestion(missing, nextDraft) })
            }
            setLoading(false)
            return
          }

          case "confirm": {
            if (!budgetDraft) {
              setBudgetStep("idle")
              setLoading(false)
              return
            }

            const correction = !isYes && !isNo ? detectBudgetCorrection(content) : null
            if (correction) {
              const corrected: Partial<BudgetDraft> = { ...budgetDraft }
              if (correction.field === "amount") corrected.amount = correction.value as number
              if (correction.field === "duration") corrected.duration = correction.value as BudgetDraft["duration"]
              if (correction.field === "category") corrected.category = correction.value as string

              setBudgetDraft(corrected)
              const missing = budgetMissingFields(corrected)
              if (missing.length > 0) {
                setBudgetStep(missing[0])
                addMessage({ role: "assistant", content: buildBudgetMissingQuestion(missing, corrected) })
              } else {
                setBudgetStep("confirm")
                addMessage({ role: "assistant", content: buildBudgetConfirmCard(corrected as BudgetDraft, nextLanguageMode) })
              }
              setLoading(false)
              return
            }

            if (isNo) {
              cancelBudgetFlow()
              setLoading(false)
              return
            }

            if (!isYes) {
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: 'Reply "yes" to confirm, "no" to cancel, or tell me what to change.',
                  hinglish: '"yes" se confirm karo, "no" se cancel karo, ya kya change karna hai bolo.',
                  hindi: "",
                }),
              })
              setLoading(false)
              return
            }

            const missing = budgetMissingFields(budgetDraft)
            if (missing.length > 0) {
              setBudgetStep(missing[0])
              addMessage({ role: "assistant", content: buildBudgetMissingQuestion(missing, budgetDraft) })
              setLoading(false)
              return
            }

            const finalDraft = budgetDraft as BudgetDraft
            const result = await onAddBudget({
              category: finalDraft.category,
              amount: finalDraft.amount,
              duration: finalDraft.duration,
            })

            if (result?.error) {
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `Could not create budget: ${result.error}`,
                  hinglish: `Budget create nahi hua: ${result.error}`,
                  hindi: "",
                }),
              })
              setLoading(false)
              return
            }

            setBudgetDraft(null)
            setBudgetStep("idle")
            setAssistantMode("conversation")
            addMessage({
              role: "assistant",
              content: localizeByMode(nextLanguageMode, {
                english: `Done. ${finalDraft.category} budget of Rs.${finalDraft.amount.toLocaleString("en-IN")} (${BUDGET_DURATION_LABELS[finalDraft.duration as keyof typeof BUDGET_DURATION_LABELS]}) is now active and synced to your Budget page.`,
                hinglish: `Done. ${finalDraft.category} ka Rs.${finalDraft.amount.toLocaleString("en-IN")} budget (${BUDGET_DURATION_LABELS[finalDraft.duration as keyof typeof BUDGET_DURATION_LABELS]}) set ho gaya, Budget page par sync ho chuka hai.`,
                hindi: "",
              }),
            })
            setLoading(false)
            return
          }

        }
      }

      if (guidedStep !== "idle" && guidedStep !== "done") {
        switch (guidedStep) {
          case "name": {
            if (!apiKey) {
              addMessage({ role: "assistant", content: "AI is not configured yet. Please add VITE_GROQ_API_KEY in .env." })
              break
            }

            const aiResult = (await parseTransaction(content.trim())) ?? {
              transaction: content.trim(),
              amount: null,
              category: "Other",
              type: "Debit" as const,
              method: null,
              date: format(new Date(), "yyyy-MM-dd"),
              confidence: 0.35,
              reasoning: "Used best-effort fallback from raw text.",
            }
            const parseConfidence = aiResult.confidence

            const merchantInput = aiResult.transaction || content.trim()
            const merchant = await resolveMerchantPipeline(
              apiKey,
              merchantInput,
              content.trim(),
              parseConfidence < 0.4 ? "force-web" : "auto"
            )

            const category = aiResult.category !== "Other" ? safeCategory(aiResult.category) : safeCategory(merchant.category)
            const inferredType =
              aiResult.type ?? (category === "Income" ? "Credit" : "Debit")
            const type =
              category === "Income"
                ? "Credit"
                : inferredType === "Credit" && !/\b(salary|income|refund|cashback|bonus|interest|received)\b/i.test(content)
                  ? "Debit"
                  : inferredType

            const previousAmount = pendingDraft && typeof (pendingDraft as any).amount === "number" ? (pendingDraft as any).amount : undefined
            const amount = typeof aiResult.amount === "number" ? aiResult.amount : previousAmount
            const method = isValidMethod(aiResult.method) ? aiResult.method : undefined
            const date = aiResult.date ?? format(new Date(), "yyyy-MM-dd")

            const draft: Partial<TransactionDraft> = {
              transaction: merchant.normalizedName,
              category,
              type,
              date,
              status: "Completed",
              merchantType: merchant.merchantType,
              merchantTags: merchant.tags,
              merchantConfidence: merchant.confidence,
              app_mode: aiResult.app_mode,
              ...(amount !== undefined ? { amount } : {}),
              ...(method ? { method } : {}),
            }
            setPendingDraft(draft)

            const mergedConfidence = Math.max(parseConfidence, merchant.confidence)
            if (mergedConfidence >= 0.4 && mergedConfidence < 0.7) {
              setGuidedStep("amount")
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `I understood this as "${merchant.normalizedName}". If that looks right, share the amount.`,
                  hinglish: `Lag raha hai ye "${merchant.normalizedName}" hai. Sahi hai toh amount bata do.`,
                  hindi: "",
                }),
              })
              break
            }
            if (mergedConfidence < 0.4) {
              setGuidedStep("amount")
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `I made a best guess: "${merchant.normalizedName}". If the name is different, correct it now. Otherwise, share the amount.`,
                  hinglish: `Best guess "${merchant.normalizedName}" liya hai. Merchant name alag ho toh sahi naam likh do, warna amount bata do.`,
                  hindi: "",
                }),
              })
              break
            }

            const autoTag = category !== "Other" ? `\n\nAuto-detected: ${category} / ${type}.` : ""
            if (amount !== undefined && method) {
              setGuidedStep("confirm")
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `Got it - ${merchant.normalizedName} for Rs.${amount.toLocaleString("en-IN")} via ${method}.${autoTag}\n\n${buildConfirmCard(draft, nextLanguageMode)}`,
                  hinglish: `Done - ${merchant.normalizedName} ka Rs.${amount.toLocaleString("en-IN")} ${method} se.${autoTag}\n\n${buildConfirmCard(draft, nextLanguageMode)}`,
                  hindi: "",
                }),
              })
            } else if (amount !== undefined) {
              setGuidedStep("method")
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `Got it - ${merchant.normalizedName} for Rs.${amount.toLocaleString("en-IN")}.${autoTag}\n\nHow did you pay or receive?\n- Cash\n- UPI\n- Credit Card\n- Debit Card\n- Bank Transfer\n- Net Banking`,
                  hinglish: `Theek hai - ${merchant.normalizedName} ka Rs.${amount.toLocaleString("en-IN")} note kar liya.${autoTag}\n\nPayment kaise hua?\n- Cash\n- UPI\n- Credit Card\n- Debit Card\n- Bank Transfer\n- Net Banking`,
                  hindi: "",
                }),
              })
            } else {
              setGuidedStep("amount")
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `Got it - ${merchant.normalizedName}.${autoTag}\n\nHow much?`,
                  hinglish: `Theek hai - ${merchant.normalizedName}.${autoTag}\n\nKitne ka tha?`,
                  hindi: "",
                }),
              })
            }
            break
          }

          case "amount": {
            const amount = parseFloat(content.replace(/[^0-9.]/g, ""))
            if (Number.isNaN(amount) || amount <= 0) {
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: "That does not look like a valid amount. Try a number like 500 or 1200.",
                  hinglish: "Ye valid amount nahi lag raha. 500 ya 1200 jaisa number try karo.",
                  hindi: "",
                }),
              })
              break
            }
            const updatedDraft = { ...pendingDraft, amount }
            setPendingDraft(updatedDraft)
            if (updatedDraft.category && updatedDraft.type) {
              setGuidedStep("method")
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `Noted Rs.${amount.toLocaleString("en-IN")}.\n\nHow did you pay or receive?\n- Cash\n- UPI\n- Credit Card\n- Debit Card\n- Bank Transfer\n- Net Banking`,
                  hinglish: `Rs.${amount.toLocaleString("en-IN")} note kar liya.\n\nPayment kaise hua?\n- Cash\n- UPI\n- Credit Card\n- Debit Card\n- Bank Transfer\n- Net Banking`,
                  hindi: "",
                }),
              })
            } else {
              setGuidedStep("category")
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `Noted Rs.${amount.toLocaleString("en-IN")}.\n\nWhich category fits?\n- Food\n- Shopping\n- Transport\n- Utilities\n- Health\n- Entertainment\n- Subscription\n- Income\n- Other`,
                  hinglish: `Rs.${amount.toLocaleString("en-IN")} note kar liya.\n\nKaunsi category fit hoti hai?\n- Food\n- Shopping\n- Transport\n- Utilities\n- Health\n- Entertainment\n- Subscription\n- Income\n- Other`,
                  hindi: "",
                }),
              })
            }
            break
          }

          case "category": {
            const category = guidedCategoryFromReply(content)
            const type = category === "Income" ? "Credit" : "Debit"
            const updatedDraft = { ...pendingDraft, category, type }
            setPendingDraft(updatedDraft)
            setGuidedStep("method")
            addMessage({
              role: "assistant",
              content: localizeByMode(nextLanguageMode, {
                english: `Category: ${category}. Type: ${type}.\n\nHow did you pay or receive?\n- Cash\n- UPI\n- Credit Card\n- Debit Card\n- Bank Transfer\n- Net Banking`,
                hinglish: `Category: ${category}. Type: ${type}.\n\nPayment kaise hua?\n- Cash\n- UPI\n- Credit Card\n- Debit Card\n- Bank Transfer\n- Net Banking`,
                hindi: "",
              }),
            })
            break
          }

          case "method": {
            const method = guidedMethodFromReply(content)
            const finalDraft = { ...pendingDraft, method } as TransactionDraft
            setPendingDraft(finalDraft)
            setGuidedStep("confirm")
            addMessage({ role: "assistant", content: buildConfirmCard(finalDraft, nextLanguageMode) })
            break
          }

          case "confirm": {
            const correction = !isYes && !isNo ? detectCorrection(content) : null
            if (correction) {
              const corrected = { ...pendingDraft } as Partial<TransactionDraft>
              if (correction.field === "transaction") {
                if (apiKey) {
                  const merchant = await resolveMerchantPipeline(apiKey, correction.value, correction.value)
                  corrected.transaction = merchant.normalizedName
                  corrected.merchantRawInput = correction.value
                  corrected.merchantType = merchant.merchantType
                  corrected.merchantTags = merchant.tags
                  corrected.merchantConfidence = merchant.confidence
                  if (!corrected.category || corrected.category === "Other") {
                    corrected.category = merchant.category
                  }
                  corrected.type = corrected.category === "Income" ? "Credit" : "Debit"
                } else {
                  corrected.transaction = correction.value
                }
              } else if (correction.field === "amount") {
                corrected.amount = parseFloat(correction.value)
              } else {
                if (correction.field === "category") corrected.category = correction.value
                if (correction.field === "type") corrected.type = correction.value
                if (correction.field === "method") corrected.method = correction.value
              }
              setPendingDraft(corrected)
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: `Updated.\n\n${buildConfirmCard(corrected, nextLanguageMode)}`,
                  hinglish: `Update kar diya.\n\n${buildConfirmCard(corrected, nextLanguageMode)}`,
                  hindi: "",
                }),
              })
              break
            }

            if (isYes && pendingDraft) {
              const draft = pendingDraft as TransactionDraft
              const result = await onAddTransaction({
                transaction: draft.transaction,
                category: safeCategory(draft.category),
                amount: draft.amount,
                date: draft.date,
                type: draft.type,
                method: safeMethod(draft.method),
                status: "Completed",
                app_mode: draft.app_mode as any,
              })

              if (!result?.error) {
                await saveMerchantLearningFromDraft(draft)
              }

              setPendingDraft(null)
              setGuidedStep("idle")
              setAssistantMode("conversation")
              addMessage({
                role: "assistant",
                content: result?.error
                  ? localizeByMode(nextLanguageMode, {
                    english: `Failed to add: ${result.error}`,
                    hinglish: `Add nahi ho paya: ${result.error}`,
                    hindi: "",
                  })
                  : localizeByMode(nextLanguageMode, {
                    english: `Done. ${draft.transaction} of Rs.${draft.amount.toLocaleString("en-IN")} has been added.`,
                    hinglish: `Done. ${draft.transaction} ka Rs.${draft.amount.toLocaleString("en-IN")} add ho gaya.`,
                    hindi: "",
                  }),
              })
            } else if (isNo) {
              cancelGuidedFlow()
            } else {
              addMessage({
                role: "assistant",
                content: localizeByMode(nextLanguageMode, {
                  english: 'Reply "yes" to confirm, "no" to cancel, or tell me what to fix.',
                  hinglish: '"yes" se confirm karo, "no" se cancel karo, ya jo fix karna hai wo batao.',
                  hindi: "",
                }),
              })
            }
            break
          }
        }

        setLoading(false)
        return
      }

      const bulkDrafts = detectBulkImport(content)
      if (bulkDrafts) {
        const unique: Partial<TransactionDraft>[] = []
        const duplicates: Partial<TransactionDraft>[] = []
        for (const draft of bulkDrafts) {
          if (isDuplicate(draft, transactions)) duplicates.push(draft)
          else unique.push(draft)
        }
        setBulkState({ step: "preview", unique, duplicates })
        addMessage({ role: "assistant", content: buildBulkPreviewCard(unique, duplicates) })
        setLoading(false)
        return
      }

      if (pendingDraft && (pendingDraft as TransactionDraft).method) {
        const correction = !isYes && !isNo ? detectCorrection(content) : null
        if (correction) {
          const corrected = { ...pendingDraft } as Partial<TransactionDraft>
          if (correction.field === "amount") {
            corrected.amount = parseFloat(correction.value)
          } else if (correction.field === "transaction") {
            corrected.transaction = correction.value
          } else if (correction.field === "category") {
            corrected.category = correction.value
          } else if (correction.field === "type") {
            corrected.type = correction.value
          } else if (correction.field === "method") {
            corrected.method = correction.value
          }
          setPendingDraft(corrected)
          addMessage({
            role: "assistant",
            content: localizeByMode(nextLanguageMode, {
              english: `Updated.\n\n${buildConfirmCard(corrected, nextLanguageMode)}`,
              hinglish: `Update kar diya.\n\n${buildConfirmCard(corrected, nextLanguageMode)}`,
              hindi: "",
            }),
          })
          setLoading(false)
          return
        }

        if (isYes) {
          const draft = pendingDraft as TransactionDraft
          const result = await onAddTransaction({
            transaction: draft.transaction,
            category: safeCategory(draft.category),
            amount: draft.amount,
            date: draft.date,
            type: draft.type,
            method: safeMethod(draft.method),
            status: "Completed",
          })

          if (!result?.error) {
            await saveMerchantLearningFromDraft(draft)
          }

          setPendingDraft(null)
          setGuidedStep("idle")
          setAssistantMode("conversation")
          addMessage({
            role: "assistant",
            content: result?.error
              ? localizeByMode(nextLanguageMode, {
                english: `Failed: ${result.error}`,
                hinglish: `Failed: ${result.error}`,
                hindi: "",
              })
              : localizeByMode(nextLanguageMode, {
                english: `Done. ${draft.transaction} of Rs.${draft.amount.toLocaleString("en-IN")} has been added.`,
                hinglish: `Done. ${draft.transaction} ka Rs.${draft.amount.toLocaleString("en-IN")} add ho gaya.`,
                hindi: "",
              }),
          })
          setLoading(false)
          return
        }

        if (isNo) {
          setPendingDraft(null)
          setGuidedStep("idle")
          setAssistantMode("conversation")
          addMessage({
            role: "assistant",
            content: localizeByMode(nextLanguageMode, {
              english: "Cancelled.",
              hinglish: "Cancel kar diya.",
              hindi: "",
            }),
          })
          setLoading(false)
          return
        }
      }

      if (pendingDraft && !(pendingDraft as TransactionDraft).method) {
        const updatedDraft = fillDraftFromReply(content, pendingDraft)
        const missing = getMissingFields(updatedDraft)
        setPendingDraft(updatedDraft)

        if (missing.length > 0) {
          const nextStep = missing[0]
          if (nextStep === "amount") setGuidedStep("amount")
          else if (nextStep === "method") setGuidedStep("method")
          else if (nextStep === "category") setGuidedStep("category")
          else setGuidedStep("confirm")
          addMessage({ role: "assistant", content: buildMissingFieldQuestion(missing, updatedDraft) })
        } else {
          setGuidedStep("confirm")
          addMessage({ role: "assistant", content: buildConfirmCard(updatedDraft, nextLanguageMode) })
        }
        setLoading(false)
        return
      }

      if (lookupState) {
        if (lookupState.isNotFoundAddPrompt && /\b(add|yes|yeah|yep|sure|ok)\b/i.test(content)) {
          setLookupState(null)
          const seedAmount = Number(lookupState.query.replace(/,/g, ""))
          if (!Number.isNaN(seedAmount) && seedAmount > 0) {
             startGuidedFlow(seedAmount)
          } else {
             startGuidedFlow(undefined, lookupState.query)
          }
          setLoading(false)
          return
        }

        const selectedNames = resolveLookupSelection(content, lookupState)
        if (selectedNames.length === 0) {
          if (lookupState.isNotFoundAddPrompt && /\b(no|nope|cancel)\b/i.test(content)) {
             setLookupState(null)
             addMessage({ role: "assistant", content: "Okay. Anything else I can help with?" })
             setLoading(false)
             return
          }

          addMessage({ role: "assistant", content: lookupState.isNotFoundAddPrompt ? 'Please reply with "add" to log it, or say "no" to cancel.' : 'Please reply with number(s) or say "all these".' })
          setLoading(false)
          return
        }

        const rows = filterTransactionsByNames(transactions, selectedNames)
        addMessage({
          role: "assistant",
          content: buildTransactionRowsMessage(rows, `Transactions matching: ${selectedNames.join(", ")}`),
        })
        setLookupState(null)
        setLoading(false)
        return
      }

      const receiptDraft = detectReceiptTransaction(content)
      if (receiptDraft) {
        setPendingDraft(receiptDraft)
        setGuidedStep("confirm")
        addMessage({ role: "assistant", content: buildConfirmCard(receiptDraft, nextLanguageMode) })
        setLoading(false)
        return
      }

      const lookupQuery = extractLookupQuery(content)
      if (lookupQuery) {
        const lookup = resolveTransactionLookup(lookupQuery, transactions)
        if (lookup.kind === "resolved") {
          addMessage({
            role: "assistant",
            content: buildTransactionRowsMessage(lookup.rows, `Transactions matching "${lookupQuery}"`),
          })
        } else if (lookup.kind === "disambiguate") {
          setLookupState({ query: lookup.query, candidateNames: lookup.candidateNames })
          addMessage({
            role: "assistant",
            content: buildLookupDisambiguationMessage(lookup.query, lookup.candidateNames, transactions),
          })
        } else {
          setLookupState({ query: lookup.query, candidateNames: lookup.suggestions, isNotFoundAddPrompt: true })
          const notFoundMsg = buildLookupNotFoundMessage(lookup.query, lookup.suggestions)
          addMessage({
            role: "assistant",
            content: `${notFoundMsg}\n\nDo you want to add this transaction, or do you want anything else? (Reply "add" or "no")`,
          })
        }
        setLoading(false)
        return
      }

      if (BUDGET_INTENT_REGEX.test(trimmedContent)) {
        const seedDraft = parseBudgetDraftFromMessage(trimmedContent)
        startBudgetFlow(seedDraft)
        setLoading(false)
        return
      }

      const databaseAnswer = buildDatabaseAnswer(content, transactions, budgets)
      if (databaseAnswer) {
        addMessage({ role: "assistant", content: databaseAnswer })
        setLoading(false)
        return
      }

      if (isLikelyUnrelated(trimmedContent)) {
  const redirect = getSoftRedirectMessage(trimmedContent, nextLanguageMode)
  if (redirect) {
    addMessage({ role: "assistant", content: redirect })
    setLoading(false)
    return
  }
}

// Only redirect explicitly off-topic things — let Groq handle everything else
if (isLikelyUnrelated(trimmedContent)) {
  addMessage({
    role: "assistant",
    content: localizeByMode(nextLanguageMode, {
      english: "I'm VoiceKhata AI — I can only help with your finances. Want to log a transaction or check your spending?",
      hinglish: "Main VoiceKhata AI hoon — sirf finance ke liye hoon. Transaction log karein ya spending check karein?",
      hindi: "",
    }),
  })
  setLoading(false)
  return
}

      if (apiKey && nextAssistantMode === "expense_logging") {
        const aiTx = (await parseTransaction(trimmedContent)) ?? {
          transaction: trimmedContent,
          amount: null,
          category: "Other",
          type: "Debit" as const,
          method: null,
          date: format(new Date(), "yyyy-MM-dd"),
          confidence: 0.35,
          reasoning: "Used best-effort fallback from raw text.",
        }

        if (shouldTreatAsTransactionInput(trimmedContent, aiTx.confidence, aiTx.amount)) {
          const merchantInput = aiTx.transaction || trimmedContent
          const merchant = await resolveMerchantPipeline(
            apiKey,
            merchantInput,
            trimmedContent,
            aiTx.confidence < 0.4 ? "force-web" : "auto"
          )

          const category = aiTx.category !== "Other" ? safeCategory(aiTx.category) : safeCategory(merchant.category)
          const type = category === "Income" ? "Credit" : (aiTx.type ?? "Debit")
          const draft: Partial<TransactionDraft> = {
            transaction: merchant.normalizedName,
            category,
            type,
            date: aiTx.date ?? format(new Date(), "yyyy-MM-dd"),
            status: "Completed",
            merchantRawInput: merchantInput,
            merchantType: merchant.merchantType,
            merchantTags: merchant.tags,
            merchantConfidence: merchant.confidence,
            ...(typeof aiTx.amount === "number" ? { amount: aiTx.amount } : {}),
            ...(isValidMethod(aiTx.method) ? { method: aiTx.method } : {}),
          }

          setPendingDraft(draft)
          setAssistantMode("expense_logging")
          const missing = getMissingFields(draft)
          const mergedConfidence = Math.max(aiTx.confidence, merchant.confidence)

          if (mergedConfidence >= 0.4 && mergedConfidence < 0.7) {
            setGuidedStep("amount")
            addMessage({
              role: "assistant",
              content: localizeByMode(nextLanguageMode, {
                english: `I parsed this as "${merchant.normalizedName}". If correct, tell me the amount.`,
                hinglish: `Mujhe ye "${merchant.normalizedName}" lag raha hai. Sahi hai toh amount bata do.`,
                hindi: "",
              }),
            })
            setLoading(false)
            return
          }

          if (mergedConfidence < 0.4) {
            setGuidedStep("amount")
            addMessage({
              role: "assistant",
              content: localizeByMode(nextLanguageMode, {
                english: `Best guess is "${merchant.normalizedName}". Correct the merchant name if needed, or share the amount.`,
                hinglish: `Best guess "${merchant.normalizedName}" hai. Name galat ho toh sahi naam likho, warna amount bata do.`,
                hindi: "",
              }),
            })
            setLoading(false)
            return
          }

          if (missing.length > 0) {
            const first = missing[0]
            if (first === "amount") setGuidedStep("amount")
            else if (first === "method") setGuidedStep("method")
            else if (first === "category") setGuidedStep("category")
            else setGuidedStep("confirm")
            addMessage({ role: "assistant", content: buildMissingFieldQuestion(missing, draft) })
          } else {
            setGuidedStep("confirm")
            addMessage({ role: "assistant", content: buildConfirmCard(draft, nextLanguageMode) })
          }

          setLoading(false)
          return
        }
      }

      if (!apiKey) {
        addMessage({
          role: "assistant",
          content: localizeByMode(nextLanguageMode, {
            english: "AI is not configured yet. Add VITE_GROQ_API_KEY in .env.",
            hinglish: "AI abhi configured nahi hai. .env me VITE_GROQ_API_KEY add karo.",
            hindi: "",
          }),
        })
        setLoading(false)
        return
      }

      const text = await callGroq(
  apiKey,
  buildSystemPrompt(transactions, budgets, nextLanguageMode),
  [...messages, userMsg]
)

// Safety net: if Groq answered with code or off-topic content anyway, intercept it
const looksOffTopic = /```[\s\S]{40,}```|#include\s|def \w+\(|function \w+\(|import [a-z]|\bclass \w+/.test(text)
const safeText = looksOffTopic
  ? localizeByMode(nextLanguageMode, {
      english: "I'm VoiceKhata AI — I'm here to help with your finances only. Want to log a transaction, check your budget, or review your spending?",
      hinglish: "Main VoiceKhata AI hoon — sirf finance ke liye hoon. Transaction log karein, budget check karein, ya spending review karein?",
      hindi: "",
    })
  : text

addMessage({ role: "assistant", content: safeText })
    } catch (err) {
      addMessage({ role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Something went wrong."}` })
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setPendingDraft(null)
    setGuidedStep("idle")
    setBulkState(null)
    setLookupState(null)
    setBudgetDraft(null)
    setBudgetStep("idle")
    setLanguageMode(null)
    setAssistantMode("conversation")
  }

  return { 
    loading, 
    sendMessage, 
    clearChat, 
    startGuidedFlow, 
    startBudgetFlow, 
    cancelGuidedFlow,
    confirmMultiTransactions,
    cancelMultiTransactions
  }
}