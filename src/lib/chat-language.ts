export type LanguageMode = "english" | "hinglish" | "hindi"

export type AssistantMode =
  | "conversation"
  | "expense_logging"
  | "analytics"
  | "budgeting"

const DEVANAGARI_REGEX = /[\u0900-\u097F]/
const LATIN_TEXT_REGEX = /[a-z]/i
const ONLY_PUNCT_OR_EMOJI_REGEX = /^[\s\p{P}\p{S}]+$/u

const HINGLISH_HINT_WORDS = [
  "kya",
  "hai",
  "kar",
  "karna",
  "kaise",
  "kitna",
  "kitne",
  "mera",
  "meri",
  "bhai",
  "acha",
  "accha",
  "haan",
  "nahi",
  "nhi",
  "kyu",
  "kyon",
  "rhe",
  "raha",
  "rhi",
  "ho",
  "aap",
  "tum",
]

const SMALL_TALK_PATTERNS = [
  /^(hi|hello|hey|yo|sup|namaste|good\s+(morning|afternoon|evening))([!.,\s]|$)/i,
  /\b(kya\s+kar\s+rahe|kya\s+kar\s+rhe|kaise\s+ho|how\s+are\s+you|thanks|thank\s+you)\b/i,
]

const BUDGET_KEYWORDS = /\b(budget|budgets|allocation|limit|limits|overspend|under\s*budget|cap)\b/i
const ANALYTICS_KEYWORDS = /\b(spend|spent|expense|expenses|report|reports|trend|trends|compare|comparison|analytics|insight|summary|summaries|month|quarter|year|ytd|category|categories)\b/i
const TRANSACTION_ACTION_KEYWORDS = /\b(spent|paid|pay|bought|purchase|ordered|expense|received|salary|income|refund|log|add|track|record|recharge|bill|subscription|transfer|kharcha|kharch)\b/i
const MONEY_REGEX = /(?:₹|rs\.?|inr|rupees?)\s*\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\b/
const MERCHANT_PATTERN = /\b(?:on|at|for|to)\s+[a-z][a-z0-9&.\-\s]{1,40}/i

const AMBIGUOUS_REPLY_REGEX = /^(ok|okay|hmm|hmmm|huh|right|fine|cool|great|yes|no|haan|nahi|h|k|kk|done|sure)[!.,\s]*$/i

function hasHinglishHints(message: string): boolean {
  const words = message.toLowerCase()
  return HINGLISH_HINT_WORDS.some((word) => new RegExp(`\\b${word}\\b`, "i").test(words))
}

export function detectLanguageMode(message: string, previousMode: LanguageMode | null): LanguageMode {
  const input = message.trim()
  if (!input) return previousMode ?? "english"

  if (DEVANAGARI_REGEX.test(input)) return "hindi"

  const hasLatin = LATIN_TEXT_REGEX.test(input)
  if (!hasLatin && previousMode) return previousMode

  if (hasLatin && hasHinglishHints(input)) return "hinglish"

  if (AMBIGUOUS_REPLY_REGEX.test(input) || ONLY_PUNCT_OR_EMOJI_REGEX.test(input)) {
    return previousMode ?? "english"
  }

  return "english"
}

export function localizeByMode(
  mode: LanguageMode,
  templates: { english: string; hinglish: string; hindi: string }
): string {
  const candidate =
    mode === "hindi"
      ? templates.hindi
      : mode === "hinglish"
        ? templates.hinglish
        : templates.english

  const looksCorrupted = /[ÃÂ]|à¤|à¥/.test(candidate)
  if (!candidate.trim() || looksCorrupted) return templates.english
  return candidate
}

export function isSmallTalkIntent(message: string): boolean {
  const input = message.trim()
  if (!input) return true
  return SMALL_TALK_PATTERNS.some((pattern) => pattern.test(input))
}

export function hasTransactionLikeData(message: string): boolean {
  const input = message.trim()
  if (!input) return false

  const hasAmount = MONEY_REGEX.test(input)
  const hasAction = TRANSACTION_ACTION_KEYWORDS.test(input)
  const hasMerchantContext = MERCHANT_PATTERN.test(input)

  return hasAmount && (hasAction || hasMerchantContext)
}

export function isExplicitLoggingRequest(message: string): boolean {
  const input = message.trim()
  if (!input) return false
  return /\b(log\s+(transaction|expense|income)|add\s+(transaction|expense|income)|record\s+(expense|income)|start\s+logging)\b/i.test(input)
}

export function classifyAssistantMode(
  message: string,
  previousMode: AssistantMode,
  guidedFlowActive: boolean
): AssistantMode {
  if (guidedFlowActive) return "expense_logging"

  const input = message.trim()
  if (!input) return previousMode

  if (isSmallTalkIntent(input)) return "conversation"
  if (BUDGET_KEYWORDS.test(input)) return "budgeting"
  if (ANALYTICS_KEYWORDS.test(input) && !isExplicitLoggingRequest(input)) return "analytics"

  if (isExplicitLoggingRequest(input) || hasTransactionLikeData(input)) {
    return "expense_logging"
  }

  if (AMBIGUOUS_REPLY_REGEX.test(input)) return previousMode

  return "conversation"
}
