// src/lib/voice-khata-parser.ts

export type ParsedVoiceTransaction = {
  rawTranscript: string
  person: string
  amount: number | null
  type: "Credit" | "Debit" | null // Credit = Money Received / Inflow, Debit = Money Paid / Outflow
  directionLabel: string // "Money received" or "Money paid"
  method: string // "UPI" | "Cash" | "Bank Transfer" | "Credit"
  date: string // yyyy-MM-dd
  displayDate: string // "Today", "Yesterday", or formatted date
  category: string
  isAmbiguousPerson: boolean
  isAmbiguousDirection: boolean
  confidence: "high" | "medium" | "low"
}

// Common Indian names to recognize in Hindi/English voice input
const COMMON_PERSON_NAMES = [
  "Ramesh", "Suresh", "Mahesh", "Rajesh", "Mukesh", "Dinesh",
  "Gupta", "Sharma", "Verma", "Singh", "Yadav", "Patel", "Shah",
  "Chopra", "Mehta", "Joshi", "Bansal", "Agarwal", "Mishra",
  "Pooja", "Priya", "Rahul", "Amit", "Rohit", "Vikas", "Sunil", "Anil",
  "Vikram", "Deepak", "Manoj", "Ajay", "Vijay", "Sanjay", "Karan", "Arjun",
  "Kirana", "Doodh", "Dairy", "Bakery", "Wholesale", "Vendor", "Supplier"
]

export function parseVoiceKhataInput(transcript: string): ParsedVoiceTransaction {
  const text = transcript.trim()
  const lower = text.toLowerCase()

  // 1. Amount Extraction
  // Match patterns like: ₹1200, rs 1200, 1200 rs, 1,200, 1.2k, 1200 rupaye, barah sau
  let amount: number | null = null

  // Number with optional commas and currency symbols
  const amountMatch = lower.match(/(?:(?:rs\.?|inr|₹|rupaye|rupees)\s*)?([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?|\b[0-9]+k\b)(?:\s*(?:rs\.?|inr|₹|rupaye|rupees))?/i)
  
  if (amountMatch && amountMatch[1]) {
    let rawNum = amountMatch[1].replace(/,/g, "")
    if (rawNum.endsWith("k")) {
      amount = parseFloat(rawNum.replace("k", "")) * 1000
    } else {
      const parsed = parseFloat(rawNum)
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed
      }
    }
  }

  // Fallback for spoken number words
  if (!amount) {
    if (lower.includes("ek sau") || lower.includes("one hundred")) amount = 100
    else if (lower.includes("do sau") || lower.includes("two hundred")) amount = 200
    else if (lower.includes("paanch sau") || lower.includes("five hundred")) amount = 500
    else if (lower.includes("hazaar") || lower.includes("one thousand") || lower.includes("ek hazaar")) amount = 1000
    else if (lower.includes("barah sau") || lower.includes("twelve hundred")) amount = 1200
    else if (lower.includes("pandra sau") || lower.includes("fifteen hundred")) amount = 1500
    else if (lower.includes("do hazaar") || lower.includes("two thousand")) amount = 2000
  }

  // 2. Direction Extraction (Credit = Inflow / Received, Debit = Outflow / Paid)
  const creditKeywords = [
    "diye", "mila", "mile", "aaye", "received", "got", "paid me", "credit",
    "jama", "jama kiya", "payment aaya", "aaya", "aayi"
  ]
  const debitKeywords = [
    "diya", "diye hain", "paid", "gave", "udhar", "udhari", "liye", "kharcha",
    "spent", "debit", "bhugtan kiya", "send", "bheja", "bheje"
  ]

  let isCredit = false
  let isDebit = false

  for (const kw of creditKeywords) {
    if (new RegExp(`\\b${kw}\\b`, "i").test(lower)) {
      isCredit = true
      break
    }
  }

  for (const kw of debitKeywords) {
    if (new RegExp(`\\b${kw}\\b`, "i").test(lower)) {
      isDebit = true
      break
    }
  }

  let type: "Credit" | "Debit" | null = null
  let isAmbiguousDirection = false

  if (isCredit && !isDebit) {
    type = "Credit"
  } else if (isDebit && !isCredit) {
    type = "Debit"
  } else if (isCredit && isDebit) {
    type = "Credit"
    isAmbiguousDirection = true
  } else {
    isAmbiguousDirection = true
    type = "Credit"
  }

  // 3. Counterparty / Person extraction
  let person = ""
  let isAmbiguousPerson = false

  // Check known names list first
  for (const name of COMMON_PERSON_NAMES) {
    if (new RegExp(`\\b${name}\\b`, "i").test(text)) {
      person = name
      const afterMatch = text.match(new RegExp(`\\b${name}\\s+([A-Z][a-z]+|ji|bhai|uncle|kumar|singh|seth)\\b`, "i"))
      if (afterMatch && afterMatch[1]) {
        person = `${name} ${afterMatch[1].charAt(0).toUpperCase() + afterMatch[1].slice(1).toLowerCase()}`
      }
      break
    }
  }

  // If no known name, try heuristic
  if (!person) {
    const fromToMatch = text.match(/(?:from|to|for|se|ko|ne)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i)
    if (fromToMatch && fromToMatch[1]) {
      const candidate = fromToMatch[1].trim()
      const lowerCandidate = candidate.toLowerCase()
      if (!lowerCandidate.includes("upi") && !lowerCandidate.includes("cash") && isNaN(Number(candidate))) {
        person = candidate.charAt(0).toUpperCase() + candidate.slice(1)
      }
    }
  }

  if (!person) {
    isAmbiguousPerson = true
    person = "Customer / Party"
  }

  // 4. Payment Method Extraction
  let method = "UPI"
  if (lower.includes("cash") || lower.includes("nagad") || lower.includes("rokar")) {
    method = "Cash"
  } else if (lower.includes("bank") || lower.includes("transfer") || lower.includes("neft") || lower.includes("rtgs")) {
    method = "Bank Transfer"
  } else if (lower.includes("udhar") || lower.includes("credit") || lower.includes("khata")) {
    method = "Credit"
  } else if (lower.includes("gpay") || lower.includes("phonepe") || lower.includes("paytm") || lower.includes("upi") || lower.includes("online")) {
    method = "UPI"
  }

  // 5. Date Extraction
  const today = new Date()
  let dateObj = today
  let displayDate = "Today"

  if (lower.includes("kal") || lower.includes("yesterday")) {
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    dateObj = yesterday
    displayDate = "Yesterday"
  }

  const yyyy = dateObj.getFullYear()
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0")
  const dd = String(dateObj.getDate()).padStart(2, "0")
  const dateStr = `${yyyy}-${mm}-${dd}`

  // 6. Category
  const category = type === "Credit" ? "Income" : "Shopping"

  // 7. Overall confidence
  const confidence: "high" | "medium" | "low" = 
    amount && !isAmbiguousPerson && !isAmbiguousDirection ? "high" :
    amount ? "medium" : "low"

  return {
    rawTranscript: text,
    person,
    amount,
    type,
    directionLabel: type === "Credit" ? "Money received" : "Money paid",
    method,
    date: dateStr,
    displayDate,
    category,
    isAmbiguousPerson,
    isAmbiguousDirection,
    confidence,
  }
}
