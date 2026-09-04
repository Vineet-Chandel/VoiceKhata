import { Router, Request, Response } from "express"
import axios from "axios"
import Groq from "groq-sdk"

const router = Router()

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

type SearchSnippet = {
  title: string
  url: string
  content: string
}

type MerchantSummary = {
  clean_name: string
  probable_category: "Food" | "Shopping" | "Transport" | "Utilities" | "Health" | "Entertainment" | "Subscription" | "Income" | "Other"
  merchant_type: string
  confidence: number
  tags: string[]
}

function clipText(value: string, maxLen = 240): string {
  const text = value.replace(/\s+/g, " ").trim()
  return text.length <= maxLen ? text : `${text.slice(0, maxLen)}...`
}

async function searchWithTavily(query: string): Promise<SearchSnippet[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) return []

  try {
    const { data } = await axios.post("https://api.tavily.com/search", {
      api_key: apiKey,
      query,
      max_results: 5,
      search_depth: "basic",
      include_raw_content: false,
    })

    const rows = Array.isArray(data?.results) ? data.results : []
    return rows.map((row: any) => ({
      title: String(row?.title ?? "Untitled"),
      url: String(row?.url ?? ""),
      content: clipText(String(row?.content ?? "")),
    }))
  } catch {
    return []
  }
}

async function searchWithBrave(query: string): Promise<SearchSnippet[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!apiKey) return []

  try {
    const { data } = await axios.get("https://api.search.brave.com/res/v1/web/search", {
      headers: { "X-Subscription-Token": apiKey },
      params: {
        q: query,
        count: 5,
      },
    })

    const rows = Array.isArray(data?.web?.results) ? data.web.results : []
    return rows.map((row: any) => ({
      title: String(row?.title ?? "Untitled"),
      url: String(row?.url ?? ""),
      content: clipText(String(row?.description ?? row?.extra_snippets?.join(" ") ?? "")),
    }))
  } catch {
    return []
  }
}

async function searchWithPerplexity(query: string): Promise<SearchSnippet[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) return []

  try {
    const { data } = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [
          { role: "system", content: "Summarize what this merchant/company/service is in under 120 words." },
          { role: "user", content: query },
        ],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    )

    const content = String(data?.choices?.[0]?.message?.content ?? "").trim()
    if (!content) return []
    return [{ title: "Perplexity summary", url: "https://www.perplexity.ai", content: clipText(content, 500) }]
  } catch {
    return []
  }
}

function heuristicSummary(rawQuery: string, snippets: SearchSnippet[]): MerchantSummary {
  const joined = `${rawQuery} ${snippets.map((s) => `${s.title} ${s.content}`).join(" ")}`.toLowerCase()

  let category: MerchantSummary["probable_category"] = "Other"
  let merchantType = "other"
  const tags: string[] = []

  if (/\b(subscribe|subscription|plan|saas|software|platform|ai tool|premium)\b/.test(joined)) {
    category = "Subscription"
    merchantType = "saas"
    tags.push("subscription")
  } else if (/\b(food|restaurant|delivery|cafe|swiggy|zomato)\b/.test(joined)) {
    category = "Food"
    merchantType = "food"
  } else if (/\b(uber|ola|transport|cab|ride)\b/.test(joined)) {
    category = "Transport"
    merchantType = "transport"
  } else if (/\b(electricity|internet|broadband|telecom|utility)\b/.test(joined)) {
    category = "Utilities"
    merchantType = "utility"
  } else if (/\b(salary|payroll|income|refund|payout)\b/.test(joined)) {
    category = "Income"
    merchantType = "income"
  } else if (/\b(ecommerce|shopping|store|marketplace|amazon|flipkart)\b/.test(joined)) {
    category = "Shopping"
    merchantType = "ecommerce"
  }

  const cleanName = rawQuery
    .replace(/^what\s+is\s+/i, "")
    .replace(/\b(company|app|service)\b/gi, "")
    .replace(/\?/g, "")
    .trim()

  return {
    clean_name: cleanName || rawQuery,
    probable_category: category,
    merchant_type: merchantType,
    confidence: snippets.length > 0 ? 0.62 : 0.42,
    tags,
  }
}

async function summarizeWithGroq(rawQuery: string, snippets: SearchSnippet[]): Promise<MerchantSummary | null> {
  if (!groq) return null

  const sourceBlock = snippets
    .map((s, index) => `Source ${index + 1}\nTitle: ${s.title}\nURL: ${s.url}\nSnippet: ${s.content}`)
    .join("\n\n")

  const prompt = `You are merchant intelligence for transaction categorization.
Understand this merchant/company/service and return only JSON.

Merchant query: ${rawQuery}

Evidence:
${sourceBlock}

JSON format:
{
  "clean_name": "normalized name",
  "probable_category": "Food|Shopping|Transport|Utilities|Health|Entertainment|Subscription|Income|Other",
  "merchant_type": "saas|streaming|utility|food|transport|ecommerce|income|other",
  "confidence": 0.0,
  "tags": ["tag1", "tag2"]
}

If uncertain, lower confidence and set category to Other.`

  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    })

    const raw = response.choices[0]?.message?.content ?? "{}"
    const parsed = JSON.parse(raw)
    return {
      clean_name: String(parsed?.clean_name ?? rawQuery),
      probable_category: String(parsed?.probable_category ?? "Other") as MerchantSummary["probable_category"],
      merchant_type: String(parsed?.merchant_type ?? "other"),
      confidence: Math.max(0, Math.min(1, Number(parsed?.confidence ?? 0.5))),
      tags: Array.isArray(parsed?.tags) ? parsed.tags.map((t: unknown) => String(t)) : [],
    }
  } catch {
    return null
  }
}

router.post("/search", async (req: Request, res: Response) => {
  const rawQuery = String(req.body?.query ?? "").trim()
  if (!rawQuery) {
    return res.status(400).json({ error: "query is required" })
  }

  const tavily = await searchWithTavily(rawQuery)
  const brave = tavily.length === 0 ? await searchWithBrave(rawQuery) : []
  const perplexity = tavily.length === 0 && brave.length === 0 ? await searchWithPerplexity(rawQuery) : []
  const snippets = [...tavily, ...brave, ...perplexity].slice(0, 6)

  if (snippets.length === 0) {
    const fallback = heuristicSummary(rawQuery, [])
    return res.status(200).json({ ...fallback, source: "heuristic" })
  }

  const llmSummary = await summarizeWithGroq(rawQuery, snippets)
  const summary = llmSummary ?? heuristicSummary(rawQuery, snippets)

  return res.status(200).json({
    ...summary,
    source: llmSummary ? "llm" : "heuristic",
    evidence: snippets.map((s) => ({ title: s.title, url: s.url })),
  })
})

export default router
