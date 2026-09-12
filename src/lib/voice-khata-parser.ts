// src/lib/voice-khata-parser.ts
// Adapted and trained on VoiceKhata Hindi/English khata ledger patterns

export type ParsedVoiceTransaction = {
  rawTranscript: string
  person: string
  amount: number | null
  type: "Credit" | "Debit" | null // Credit = Money Received / Inflow, Debit = Money Paid / Outflow (Udhaar)
  directionLabel: string // "Money received" or "Money paid"
  method: string // "UPI" | "Cash" | "Bank Transfer" | "Credit"
  item?: string
  date: string // yyyy-MM-dd
  displayDate: string // "Today", "Yesterday", or formatted date
  category: string
  isAmbiguousPerson: boolean
  isAmbiguousDirection: boolean
  confidence: "high" | "medium" | "low"
}

// Devanagari digit translation map
const DEVANAGARI_DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
}

// Devanagari to Latin phonetic transliteration map
const DEVANAGARI_MAP: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au",
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n", "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ं": "n", "ँ": "n", "ः": "h", "्": "", "़": "",
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

export function normalizeText(rawText: string): string {
  let text = (rawText || "").normalize("NFKC")

  // Replace Devanagari digits with ASCII digits
  text = text.replace(/[०-९]/g, (digit) => DEVANAGARI_DIGITS[digit] || digit)

  // Normalize currency symbols
  text = text.replace(/[₹₨]/g, " rupees ").replace(/\bरुपये\b|\bरुपए\b|\bरु\b/g, " rupees ")

  // Clean quotes and excessive whitespace
  text = text.replace(/["'“”]/g, "").replace(/\s+/g, " ").trim()
  return text
}

export function transliterateDevanagari(text: string): string {
  const norm = normalizeText(text)
    .replace(/क्ष/g, "ksh")
    .replace(/त्र/g, "tr")
    .replace(/ज्ञ/g, "gy")

  let out = ""
  for (const ch of norm) {
    out += DEVANAGARI_MAP[ch] || ch
  }
  return out.replace(/\s+/g, " ").trim()
}

export function parseVoiceKhataInput(transcript: string): ParsedVoiceTransaction {
  const rawText = transcript.trim()
  const normalized = normalizeText(rawText)
  const transliterated = transliterateDevanagari(normalized)
  const lower = normalized.toLowerCase()
  const lowerTrans = transliterated.toLowerCase()

  // 1. Amount Extraction
  // Match patterns like: ₹1200, rs 1200, 1200 rs, 1,200, 1.2k, 1200 rupaye, 500 rupees
  let amount: number | null = null

  const amountMatch =
    lower.match(/(?:(?:rs\.?|inr|₹|rupaye|rupees)\s*)?([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?|\b[0-9]+k\b)(?:\s*(?:rs\.?|inr|₹|rupaye|rupees))?/i) ||
    lowerTrans.match(/(?:(?:rs\.?|inr|₹|rupaye|rupees)\s*)?([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?|\b[0-9]+k\b)(?:\s*(?:rs\.?|inr|₹|rupaye|rupees))?/i)

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

  // Fallback for spoken number words in English/Hindi
  if (!amount) {
    const combined = `${lower} ${lowerTrans}`
    if (combined.includes("ek sau") || combined.includes("one hundred") || combined.includes("एक सौ")) amount = 100
    else if (combined.includes("do sau") || combined.includes("two hundred") || combined.includes("दो सौ")) amount = 200
    else if (combined.includes("teen sau") || combined.includes("three hundred") || combined.includes("तीन सौ")) amount = 300
    else if (combined.includes("char sau") || combined.includes("four hundred") || combined.includes("चार सौ")) amount = 400
    else if (combined.includes("paanch sau") || combined.includes("panch sau") || combined.includes("five hundred") || combined.includes("पांच सौ")) amount = 500
    else if (combined.includes("chhe sau") || combined.includes("six hundred") || combined.includes("छह सौ")) amount = 600
    else if (combined.includes("saat sau") || combined.includes("seven hundred") || combined.includes("सात सौ")) amount = 700
    else if (combined.includes("aath sau") || combined.includes("eight hundred") || combined.includes("आठ सौ")) amount = 800
    else if (combined.includes("nau sau") || combined.includes("nine hundred") || combined.includes("नौ सौ")) amount = 900
    else if (combined.includes("ek hazaar") || combined.includes("one thousand") || combined.includes("एक हज़ार")) amount = 1000
    else if (combined.includes("barah sau") || combined.includes("twelve hundred") || combined.includes("बारह सौ")) amount = 1200
    else if (combined.includes("pandra sau") || combined.includes("fifteen hundred") || combined.includes("पंद्रह सौ")) amount = 1500
    else if (combined.includes("do hazaar") || combined.includes("two thousand") || combined.includes("दो हज़ार")) amount = 2000
    else if (combined.includes("paanch hazaar") || combined.includes("five thousand") || combined.includes("पांच हज़ार")) amount = 5000
    else if (combined.includes("das hazaar") || combined.includes("ten thousand") || combined.includes("दस हज़ार")) amount = 10000
  }

  // 2. Direction Extraction
  // Payment / Money Received (Credit to ledger)
  const paymentKeywords = [
    "paid", "payment", "received", "jama", "vasool", "mila", "mile", "aaye", "aaya", "aayi", "got", "paid me",
    "chuka", "chuka diya", "bhugtan", "जमा", "भुगतान", "दिए", "दिया", "दे दिया", "मिला", "मिले", "आया", "आए", "चुकता", "वसूल"
  ]

  // Credit / Udhaar Given (Debit from ledger / Customer owes)
  const creditKeywords = [
    "udhar", "udhaar", "borrow", "borrowed", "credit", "owes", "due", "on credit", "samaan", "goods",
    "liye", "liya", "kharcha", "spent", "debit", "karza", "उधार", "कर्ज", "लिया", "लिए", "खर्चा", "समान"
  ]

  const combinedSearch = `${lower} ${lowerTrans}`
  let isCredit = false
  let isDebit = false

  // Special Indian grammar rule: "ne ... diye" / "ne ... payment diya" means customer gave payment
  if (/\b(?:ne|ने)\b.*\b(?:diye|diya|दिए|दिया|payment|jama|जमा)\b/i.test(combinedSearch)) {
    isCredit = true
  }
  // Special Indian grammar rule: "ko ... udhar diya" means shopkeeper gave udhaar to customer
  if (/\b(?:ko|को)\b.*\b(?:udhar|udhaar|उधार|karza|कर्ज)\b/i.test(combinedSearch)) {
    isDebit = true
  }

  if (!isCredit && !isDebit) {
    for (const kw of paymentKeywords) {
      if (new RegExp(`\\b${kw}\\b`, "i").test(combinedSearch)) {
        isCredit = true
        break
      }
    }
    for (const kw of creditKeywords) {
      if (new RegExp(`\\b${kw}\\b`, "i").test(combinedSearch)) {
        isDebit = true
        break
      }
    }
  }

  let type: "Credit" | "Debit" | null = null
  let isAmbiguousDirection = false

  if (isCredit && !isDebit) {
    type = "Credit"
  } else if (isDebit && !isCredit) {
    type = "Debit"
  } else if (isCredit && isDebit) {
    // If both keywords exist, check if "udhar" takes precedence as debit
    if (combinedSearch.includes("udhar") || combinedSearch.includes("उधार")) {
      type = "Debit"
    } else {
      type = "Credit"
      isAmbiguousDirection = true
    }
  } else {
    // Default to Credit (Payment) with ambiguous direction flag
    type = "Credit"
    isAmbiguousDirection = true
  }

  // 3. Counterparty / Person extraction
  let person = ""
  let isAmbiguousPerson = false

  // First: Pattern-based extraction from beginning of sentence:
  // "Ramesh ne...", "Suresh ko...", "रमेश ने...", "सुरेश को..."
  const leadingNameMatch = rawText.match(
    /^\s*([A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F .'-]{0,40}?)\s+(?:ne|ने|ko|को|se|से|borrowed|borrow|paid|pay|gave|took|bought|liya|liye|li|लिया|लिए|ली|rupees?|rupaye|rs\.?|\d)/i
  )
  if (leadingNameMatch && leadingNameMatch[1]) {
    const cand = leadingNameMatch[1].trim().replace(/^[\s.-]+|[\s.-]+$/g, "")
    if (cand.length >= 2 && !/^(today|yesterday|kal|aaj|maine|mene|i|we)$/i.test(cand)) {
      person = cand.charAt(0).toUpperCase() + cand.slice(1)
    }
  }

  // Second: Check known names list
  if (!person) {
    for (const name of COMMON_PERSON_NAMES) {
      if (new RegExp(`\\b${name}\\b`, "i").test(combinedSearch)) {
        person = name
        const afterMatch = rawText.match(new RegExp(`\\b${name}\\s+([A-Z][a-z]+|ji|bhai|uncle|kumar|singh|seth)\\b`, "i"))
        if (afterMatch && afterMatch[1]) {
          person = `${name} ${afterMatch[1].charAt(0).toUpperCase() + afterMatch[1].slice(1).toLowerCase()}`
        }
        break
      }
    }
  }

  // Third: Fallback preposition matching ("from Ramesh", "to Suresh")
  if (!person) {
    const fromToMatch = rawText.match(/(?:from|to|for|se|ko|ne|से|को|ने)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)
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

  // 4. Item Extraction (e.g. "5000 rupaye ka samaan udhar", "120 rupaye ki chai")
  let item = type === "Credit" ? "Payment" : "Goods"
  const itemMatch = rawText.match(/(?:rupees?|rupaye|रुपये|का|की|ke)\s+([a-zA-Z\u0900-\u097F\s-]{2,25}?)\s+(?:udhar|udhaar|credit|diya|paid|payment|लिया|लिए|उधार)/i)
  if (itemMatch && itemMatch[1]) {
    const extractedItem = itemMatch[1].trim()
    if (extractedItem && !/^(cash|upi|today|kal)$/i.test(extractedItem)) {
      item = extractedItem.charAt(0).toUpperCase() + extractedItem.slice(1)
    }
  }

  // 5. Payment Method Extraction
  let method = "UPI"
  if (combinedSearch.includes("cash") || combinedSearch.includes("nagad") || combinedSearch.includes("rokar") || combinedSearch.includes("नकद") || combinedSearch.includes("कैश")) {
    method = "Cash"
  } else if (combinedSearch.includes("bank") || combinedSearch.includes("transfer") || combinedSearch.includes("neft") || combinedSearch.includes("rtgs") || combinedSearch.includes("बैंक")) {
    method = "Bank Transfer"
  } else if (combinedSearch.includes("udhar") || combinedSearch.includes("credit") || combinedSearch.includes("khata") || combinedSearch.includes("उधार") || combinedSearch.includes("खाता")) {
    method = "Credit"
  } else if (combinedSearch.includes("gpay") || combinedSearch.includes("phonepe") || combinedSearch.includes("paytm") || combinedSearch.includes("upi") || combinedSearch.includes("online")) {
    method = "UPI"
  }

  // 6. Date Extraction
  const today = new Date()
  let dateObj = today
  let displayDate = "Today"

  if (combinedSearch.includes("kal") || combinedSearch.includes("yesterday") || combinedSearch.includes("कल")) {
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    dateObj = yesterday
    displayDate = "Yesterday"
  }

  const yyyy = dateObj.getFullYear()
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0")
  const dd = String(dateObj.getDate()).padStart(2, "0")
  const dateStr = `${yyyy}-${mm}-${dd}`

  // 7. Category
  const category = type === "Credit" ? "Income" : "Shopping"

  // 8. Overall confidence
  const confidence: "high" | "medium" | "low" = 
    amount && !isAmbiguousPerson && !isAmbiguousDirection ? "high" :
    amount ? "medium" : "low"

  return {
    rawTranscript: rawText,
    person,
    amount,
    type,
    directionLabel: type === "Credit" ? "Money received" : "Money paid",
    method,
    item,
    date: dateStr,
    displayDate,
    category,
    isAmbiguousPerson,
    isAmbiguousDirection,
    confidence,
  }
}
