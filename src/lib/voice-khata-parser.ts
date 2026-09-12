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

export function matchCustomerWithKnownList(spokenName: string, knownCustomers: string[]): string | null {
  if (!spokenName || !knownCustomers || knownCustomers.length === 0) return null
  const cleanSpoken = transliterateDevanagari(spokenName).toLowerCase().trim()
  if (!cleanSpoken) return null
  const spokenTokens = cleanSpoken.split(/\s+/)

  // 1. Exact match
  for (const cust of knownCustomers) {
    const custClean = transliterateDevanagari(cust).toLowerCase().trim()
    if (custClean === cleanSpoken) return cust
  }

  // 2. First name / single token match
  for (const cust of knownCustomers) {
    const custClean = transliterateDevanagari(cust).toLowerCase().trim()
    const custTokens = custClean.split(/\s+/)
    if (custTokens[0] === spokenTokens[0] && spokenTokens[0].length >= 3) {
      return cust
    }
  }

  // 3. Substring match
  for (const cust of knownCustomers) {
    const custClean = transliterateDevanagari(cust).toLowerCase().trim()
    if (cleanSpoken.length >= 3 && custClean.includes(cleanSpoken)) {
      return cust
    }
  }

  return null
}

export function parseVoiceKhataInput(transcript: string, knownCustomers?: string[]): ParsedVoiceTransaction {
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

  // 2. Direction & Transaction Type Extraction (Credit vs Debit)
  // CREDIT = Money Received / Inflow (Salary, Customer gave payment, Income, Refund, Cashback)
  // DEBIT  = Money Paid / Outflow (Expense, Paid to merchant/party, Udhaar given, Food, Groceries, Petrol, Bill)
  let type: "Credit" | "Debit" = "Debit"
  let isAmbiguousDirection = false

  const combinedSearch = `${lower} ${lowerTrans}`

  // A. High-Priority Hindi / Hinglish Case Markers:
  // 1. "ko ... diya / diye / de diya / transfer / udhar" -> Money given TO someone -> DEBIT
  const isKoDiya = /\b(?:ko|को)\b.*\b(?:diya|diye|de diya|de diye|bheja|bhej diya|transfer|udhar|udhaar|दिए|दिया|दे दिए|दे दिया|भेजा|उधार|कर्ज)\b/i.test(combinedSearch)
  // 2. "ne ... diya / diye / payment / jama" -> Person GAVE to me -> CREDIT
  const isNeDiya = /\b(?:ne|ने)\b.*\b(?:diya|diye|de diya|de diye|payment|jama|bheja|दिए|दिया|दे दिए|दे दिया|जमा|भुगतान)\b/i.test(combinedSearch)
  // 3. "se ... mila / mile / prapt / aaya" -> Received FROM someone -> CREDIT
  const isSeMila = /\b(?:se|से)\b.*\b(?:mila|mile|mili|mil gaya|aaya|aaye|aayi|prapt|received|मिला|मिले|मिली|मिल गया|आया|आए|आई|प्राप्त)\b/i.test(combinedSearch)
  // 4. "maine ... diya / kharch" -> I gave / spent -> DEBIT
  const isMaineDiya = /\b(?:maine|mene|humne|मैंने|हमने)\b.*\b(?:diya|diye|de diya|kharch|kharcha|दिया|दिए|खर्च|खर्चा)\b/i.test(combinedSearch)

  // B. Explicit English Directional Phrasings:
  const isPaidMe = /\b(?:paid me|sent me|gave me|transferred me|received from|got from|credited to|salary from)\b/i.test(combinedSearch)
  const isPaidForOrTo = /\b(?:paid for|paid to|spent on|spent for|sent to|transferred to|gave to|bought for|ordered from)\b/i.test(combinedSearch)

  // C. Inherent Credit / Inflow Indicators:
  const creditKeywords = [
    "received", "receive", "got", "earned", "salary", "stipend", "bonus", "cashback", "refund",
    "credited", "credit to", "jama", "vasool", "wasool", "mila", "mile", "mili", "aaye", "aaya", "aayi",
    "kamai", "aamdani", "munafa", "bikri", "sale", "sales", "revenue",
    "जमा", "वसूल", "वसूली", "मिला", "मिले", "मिली", "आया", "आए", "आई", "सैलरी", "वेतन", "कमाई", "आमदनी", "मुनाफा", "बिक्री", "कैशबैक", "रिफंड"
  ]

  // D. Inherent Debit / Outflow Indicators:
  const debitKeywords = [
    "spent", "spend", "bought", "buy", "purchased", "purchase", "ordered", "expense", "kharcha",
    "kharch", "bill", "recharge", "petrol", "diesel", "groceries", "grocery", "food", "dinner",
    "lunch", "breakfast", "chai", "rent", "kiraya", "fee", "fees", "fine", "tax", "shopping",
    "udhar", "udhaar", "borrow", "borrowed", "debited", "karza",
    "खर्चा", "खर्च", "उधार", "कर्ज", "खरीदा", "खरीदी", "समान", "बिल", "पेट्रोल", "किराया", "फीस"
  ]

  // Generic English "paid" (e.g. "Paid 450 for groceries", "Paid ₹1200 to Ramesh"):
  // ALWAYS Debit unless accompanied by "paid me" or "ne paid"
  const hasGenericPaid = /\bpaid\b/i.test(combinedSearch) && !isPaidMe && !/\b(?:paid by|ne paid|ने paid)\b/i.test(combinedSearch)

  if (isKoDiya) {
    type = "Debit"
  } else if (isNeDiya) {
    type = "Credit"
  } else if (isSeMila) {
    type = "Credit"
  } else if (isMaineDiya) {
    type = "Debit"
  } else if (isPaidMe) {
    type = "Credit"
  } else if (isPaidForOrTo || hasGenericPaid) {
    type = "Debit"
  } else {
    const hasCreditKw = creditKeywords.some(kw => new RegExp(`\\b${kw}\\b`, "i").test(combinedSearch))
    const hasDebitKw = debitKeywords.some(kw => new RegExp(`\\b${kw}\\b`, "i").test(combinedSearch))

    if (hasCreditKw && !hasDebitKw) {
      type = "Credit"
    } else if (hasDebitKw && !hasCreditKw) {
      type = "Debit"
    } else if (hasCreditKw && hasDebitKw) {
      // Prioritize explicit settlement / receipt words
      if (/\b(?:received|mila|mile|mili|salary|jama|wasool|vasool|मिला|जमा)\b/i.test(combinedSearch)) {
        type = "Credit"
      } else {
        type = "Debit"
      }
    } else {
      // Sentence structure clues:
      if (/^\s*(?:paid|gave|give|bought|spent|ordered|transfer)/i.test(rawText)) {
        type = "Debit"
      } else if (/^\s*(?:received|got|earned)/i.test(rawText)) {
        type = "Credit"
      } else if (/\b(?:diya|diye|दिए|दिया)\b/i.test(combinedSearch)) {
        type = "Debit"
      } else {
        // Default to Debit for general spending/transactions with low confidence
        type = "Debit"
        isAmbiguousDirection = true
      }
    }
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

  if (person && knownCustomers && knownCustomers.length > 0) {
    const matched = matchCustomerWithKnownList(person, knownCustomers)
    if (matched) {
      person = matched
      isAmbiguousPerson = false
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

  // 7. Context-Aware Category Detection
  let category = type === "Credit" ? "Income" : "Shopping"

  if (/\b(?:petrol|diesel|fuel|cab|taxi|uber|ola|metro|auto|bus|fare|flight|train|transport|rickshaw)\b/i.test(combinedSearch)) {
    category = "Transport"
  } else if (/\b(?:food|groceries|grocery|dinner|lunch|breakfast|chai|tea|coffee|samosa|snacks|milk|doodh|vegetables|sabji|fruits|ration|kirana|restaurant|hotel|swiggy|zomato)\b/i.test(combinedSearch)) {
    category = "Food"
  } else if (/\b(?:bill|electricity|bijli|water|pani|wifi|internet|broadband|recharge|mobile|cylinder|gas)\b/i.test(combinedSearch)) {
    category = "Utilities"
  } else if (/\b(?:medicine|medical|doctor|hospital|clinic|dawa|davai|health|pharma)\b/i.test(combinedSearch)) {
    category = "Health"
  } else if (/\b(?:udhar|udhaar|karza|loan|emi|debt|credit|उधार|कर्ज)\b/i.test(combinedSearch)) {
    category = "Debt"
  } else if (/\b(?:movie|cinema|netflix|party|game|entertainment|fun)\b/i.test(combinedSearch)) {
    category = "Entertainment"
  } else if (/\b(?:clothes|shopping|shoes|shirt|pant|dress|kapde|saree|mall|amazon|flipkart)\b/i.test(combinedSearch)) {
    category = "Shopping"
  } else if (type === "Credit") {
    category = "Income"
  }

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
