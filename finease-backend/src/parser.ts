import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export type ParsedTransaction = {
  transaction: string
  category:    string
  amount:      number
  date:        string   // yyyy-MM-dd
  type:        "Debit" | "Credit"
  method:      string
  status:      string
}

import { cleanAndExtractJson } from "./scan"

export async function parseEmailWithAI(
  subject: string,
  body: string
): Promise<ParsedTransaction | null> {
  try {
    const prompt = `You are a transaction extractor for an Indian finance app.
Extract transaction details from this email and return ONLY a valid JSON object.

Email Subject: ${subject}
Email Body: ${body}

JSON format:
{
  "transaction": "merchant or description",
  "amount": 499,
  "date": "2026-04-26",
  "category": "Food",
  "method": "UPI",
  "type": "Debit",
  "status": "Completed"
}

Rules:
- amount is a plain number, no ₹ symbol
- date is yyyy-MM-dd format
- category: Income, Subscription, Food, Shopping, Utilities, Transport, Health, Entertainment, Other
- method: UPI, Credit Card, Debit Card, Net Banking, Cash, Bank Transfer
- type: Debit or Credit
- If this email is NOT a transaction, return: {"skip": true}
- Return raw JSON only, no markdown`

    const response = await groq.chat.completions.create({
      model:    "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    })

    const text  = response.choices[0]?.message?.content ?? ""
    const clean = cleanAndExtractJson(text)
    const parsed = JSON.parse(clean)

    if (parsed.skip) return null
    return parsed as ParsedTransaction
  } catch (err) {
    console.error("Parser error:", err)
    return null
  }
}