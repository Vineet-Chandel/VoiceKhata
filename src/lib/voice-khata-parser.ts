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

  // Remove Latin diacritics (e.g. pāñc -> panc) while preserving Devanagari
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  // Replace Devanagari digits with ASCII digits
  text = text.replace(/[०-९]/g, (digit) => DEVANAGARI_DIGITS[digit] || digit)

  // Normalize currency symbols
  text = text.replace(/[₹₨]/g, " rupees ").replace(/(?<![\w\u0900-\u097F])(?:रुपये|रुपए|रु)(?![\w\u0900-\u097F])/g, " rupees ")

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
    if (/ek (sau|saur)|one hundred|एक सौ/i.test(combined)) amount = 100
    else if (/do (sau|saur)|two hundred|दो सौ/i.test(combined)) amount = 200
    else if (/teen (sau|saur)|three hundred|तीन सौ/i.test(combined)) amount = 300
    else if (/char (sau|saur)|four hundred|चार सौ/i.test(combined)) amount = 400
    else if (/(paanch|panch|panc) (sau|saur)|five hundred|पांच सौ/i.test(combined)) amount = 500
    else if (/(chhe|che) (sau|saur)|six hundred|छह सौ/i.test(combined)) amount = 600
    else if (/saat (sau|saur)|seven hundred|सात सौ/i.test(combined)) amount = 700
    else if (/aath (sau|saur)|eight hundred|आठ सौ/i.test(combined)) amount = 800
    else if (/nau (sau|saur)|nine hundred|नौ सौ/i.test(combined)) amount = 900
    else if (/(ek|one) (hazaar|hazar)|one thousand|एक हज़ार/i.test(combined)) amount = 1000
    else if (/barah (sau|saur)|twelve hundred|बारह सौ/i.test(combined)) amount = 1200
    else if (/pandra (sau|saur)|fifteen hundred|पंद्रह सौ/i.test(combined)) amount = 1500
    else if (/do (hazaar|hazar)|two thousand|दो हज़ार/i.test(combined)) amount = 2000
    else if (/(paanch|panch|panc) (hazaar|hazar)|five thousand|पांच हज़ार/i.test(combined)) amount = 5000
    else if (/das (hazaar|hazar)|ten thousand|दस हज़ार/i.test(combined)) amount = 10000
  }

  // 2. Direction & Transaction Type Extraction (Credit vs Debit)
  // CREDIT = Money Received / Inflow (Income, Salary, Customer gave payment, Refund, Cashback, Liye, Liya, Jama)
  // DEBIT  = Money Paid / Outflow (Expense, Diye, Diya, Paid, Spent, Udhaar given)
  let type: "Credit" | "Debit" = "Debit"
  let isAmbiguousDirection = false

  const combinedSearch = `${lower} ${lowerTrans}`

  // Unicode-safe word boundary helper: matches word without requiring ASCII \w
  const ub = "(?<![\\w\\u0900-\\u097F])"
  const ue = "(?![\\w\\u0900-\\u097F])"

  // 1. Explicit credit / debit command at start or end
  const isExplicitCredit = new RegExp(`^\\s*(?:credit|jama|credited)\\b`, "i").test(rawText) ||
    new RegExp(`${ub}(?:credit karo|credit kar do|credit kiya|jama karo|jama kar do)${ue}`, "i").test(combinedSearch)
  const isExplicitDebit = new RegExp(`^\\s*(?:debit|debited)\\b`, "i").test(rawText) ||
    new RegExp(`${ub}(?:debit karo|debit kar do|debit kiya)${ue}`, "i").test(combinedSearch)

  // 2. High-Priority Hindi / Hinglish Case Markers:
  // A. "ko ... diya / diye / transfer / udhar" -> Outflow -> DEBIT
  const isKoDiya = new RegExp(`${ub}(?:ko|को)${ue}.*${ub}(?:diya|diye|diyai|de diya|de diye|bheja|bhej diya|transfer|udhar|udhaar|दिए|दिया|दे दिए|दे दिया|भेजा|उधार|कर्ज)${ue}`, "i").test(combinedSearch)
  // B. "diye / diya ... ko" (e.g. "500 diye Ramesh ko", "udhar diya Suresh ko") -> Outflow -> DEBIT
  const isDiyaKo = new RegExp(`${ub}(?:diya|diye|diyai|de diya|bheja|udhar|udhaar|दिए|दिया|दे दिए|दे दिया|भेजा|उधार)${ue}.*${ub}(?:ko|को)${ue}`, "i").test(combinedSearch)
  // C. "maine / humne ... diya / kharch" -> Outflow -> DEBIT
  const isMaineDiya = new RegExp(`${ub}(?:maine|mene|humne|मैंने|हमने)${ue}.*${ub}(?:diya|diye|diyai|de diya|kharch|kharcha|bheja|दिया|दिए|खर्च|खर्चा)${ue}`, "i").test(combinedSearch)
  // D. "ne ... liya" (counterparty took loan/money) -> DEBIT
  const isNeLiya = new RegExp(`${ub}(?:ne|ने)${ue}.*${ub}(?:liye|liya|liyai|le liye|le liya|udhar liya|उधार लिया|लिया|लिए)${ue}`, "i").test(combinedSearch)

  // E. "ne ... diya" (counterparty gave payment) -> Inflow -> CREDIT
  const isNeDiya = new RegExp(`${ub}(?:ne|ने)${ue}.*${ub}(?:diya|diye|diyai|de diya|de diye|payment|jama|jma|kiye|kiya|kare|kare hain|bheja|दिए|दिया|दे दिए|दे दिया|जमा|किये|किया|किए|कराये|कराए|करवाए|भुगतान|डिपॉजिट|deposit)${ue}`, "i").test(combinedSearch)
  // F. "se ... mila / prapt / jama / aaya / liye" -> Inflow -> CREDIT
  const isSeMilaOrLiya = new RegExp(`${ub}(?:se|से)${ue}.*${ub}(?:mila|mile|mili|mil gaya|aaya|aaye|aayi|prapt|received|liye|liya|liyai|le liye|le liya|jama|jma|मिला|मिले|मिली|मिल गया|आया|आए|आई|प्राप्त|लिए|लिया|ले लिए|ले लिया|जमा)${ue}`, "i").test(combinedSearch)
  // G. "maine / humne ... liye / mila" -> Inflow -> CREDIT
  const isMaineLiye = new RegExp(`${ub}(?:maine|mene|humne|मैंने|हमने)${ue}.*${ub}(?:liye|liya|liyai|le liye|mila|mile|prapt|लिए|लिया|मिला|मिले)${ue}`, "i").test(combinedSearch)
  // H. "jama / deposit / vasool" pattern -> CREDIT
  const isDepositPattern = new RegExp(`${ub}(?:jama|jma|deposit|deposited|जमा|वसूल|वसूली)${ue}`, "i").test(combinedSearch) &&
    !new RegExp(`${ub}(?:maine|mene|humne|मैंने|हमने)${ue}.*${ub}(?:jama|jma|जमा)${ue}`, "i").test(combinedSearch)

  // 3. English Directional Patterns:
  // A. Received / Inflow:
  // - "received ... from" or "got ... from"
  const isReceivedFrom = new RegExp(`\\b(?:received|got|collected)\\b.*\\bfrom\\b`, "i").test(combinedSearch)
  // - Starts with received/got/earned/salary/cashback/refund
  const isStartReceived = /^\s*(?:received|got|earned|collected|salary|stipend|bonus|cashback|refund)/i.test(rawText)
  // - "paid me", "sent me", "gave me", "transferred me"
  const isPaidMe = /\b(?:paid me|sent me|gave me|transferred me|credited to me)\b/i.test(combinedSearch)
  // - Counterparty gave/paid/sent money to user (e.g. "Ramesh gave 500", "Ramesh paid 1200", "Suresh sent 2000")
  const isPersonGaveOrPaid = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:gave|paid|sent|transferred|deposited)\s+(?:₹|rs\.?|inr|\d)/i.test(rawText)
  // - Passive received (e.g. "₹500 received", "500 rs received")
  const isPassiveReceived = /(?:\d+|rupees?|rs\.?|₹)\s*(?:received|credited|jama|prapt)/i.test(combinedSearch)

  // B. Paid / Outflow:
  // - "paid ... for / to", "spent ... on / for", "gave ... to", "sent ... to", "transferred ... to"
  const isPaidForOrTo = /\b(?:paid|spent|gave|sent|transferred|bought)\b.*\b(?:for|to|on)\b/i.test(combinedSearch)
  // - Starts with "paid", "spent", "bought", "purchased", "ordered" (unless followed by "from")
  const isStartPaid = /^\s*(?:paid|spent|bought|purchased|ordered)\b/i.test(rawText) && !/\bfrom\b/i.test(combinedSearch)
  // - Trailing paid (e.g. "450 paid", "coffee 150 paid", "petrol paid")
  const isTrailingPaid = /(?:\d+|rupees?|rs\.?|₹|\w+)\s+paid\b/i.test(combinedSearch)
  // - Known pure expense terms
  const isPureExpenseItem = /\b(?:petrol|diesel|fuel|chai|tea|coffee|groceries|grocery|ration|dinner|lunch|breakfast|recharge|electricity|bijli|kiraya|rent|tax|fees)\b/i.test(combinedSearch)

  // Resolution Order:
  if (isExplicitCredit) {
    type = "Credit"
  } else if (isExplicitDebit) {
    type = "Debit"
  } else if (isKoDiya || isDiyaKo || isMaineDiya || isNeLiya || isPaidForOrTo) {
    type = "Debit"
  } else if (isNeDiya || isSeMilaOrLiya || isMaineLiye || isDepositPattern || isReceivedFrom || isStartReceived || isPaidMe || isPersonGaveOrPaid || isPassiveReceived) {
    type = "Credit"
  } else if (isStartPaid || isTrailingPaid) {
    type = "Debit"
  } else if (/\b(?:received|receive|got|earned|salary|cashback|refund|jama|jma|mila|mile|mili|aaya|aaye|aayi|kamai|aamdani|munafa|bikri|income|credit|credited|जमा|मिला|मिले|कमाई|बिक्री|सैलरी|रिफंड)\b/i.test(combinedSearch)) {
    type = "Credit"
  } else if (/\b(?:paid|spend|spent|bought|buy|expense|kharch|kharcha|diya|diye|bill|recharge|petrol|chai|rent|kiraya|debit|debited|खर्च|खर्चा|दिए|दिया|बिल|किराया|डेबिट)\b/i.test(combinedSearch) || isPureExpenseItem) {
    type = "Debit"
  } else {
    type = "Debit"
    isAmbiguousDirection = true
  }

  // 3. Counterparty / Person extraction
  let person = ""
  let isAmbiguousPerson = false

  // Common action verbs and keywords that CANNOT be person names:
  const actionVerbs = /^(?:received|receive|got|paid|pay|spent|spend|bought|buy|purchased|ordered|transferred|transfer|sent|send|credited|debited|add|log|give|gave|borrowed|borrow|lent|lend|today|yesterday|kal|aaj|maine|mene|humne|i|we|transaction|payment|amount|bill|invoice|fee|rent|salary|expense|income|udhar|udhaar)$/i

  const cleanName = (n: string): string => {
    if (!n) return ""
    let c = n.trim().replace(/\b(?:by|via|in|with|using|upi|cash|card|gpay|phonepe|paytm|today|yesterday|kal|aaj|ko|se|ne|को|से|ने|hai|hain|tha|the)\b/gi, "").trim()
    c = c.replace(/^[\s.-]+|[\s.-]+$/g, "")
    if (c.length >= 2 && !actionVerbs.test(c)) {
      return c.charAt(0).toUpperCase() + c.slice(1)
    }
    return ""
  }

  // A. Directional preposition matching: "from <Name>" for Credit, "to <Name>" for Debit
  const fromMatch = rawText.match(/\b(?:from|se|से)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)
  const toMatch = rawText.match(/\b(?:to|ko|को)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)

  if (type === "Credit" && fromMatch) {
    const p = cleanName(fromMatch[1])
    if (p) person = p
  } else if (type === "Debit" && toMatch) {
    const p = cleanName(toMatch[1])
    if (p) person = p
  }

  // B. Leading name match: "Ramesh ne ...", "Sharma ji ko ...", "रमेश ने ..."
  if (!person) {
    const leadingNameMatch = rawText.match(
      /^\s*([A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F .'-]{0,40}?)\s+(?:ne|ने|ko|को|se|से|borrowed|borrow|gave|paid|sent|transferred|diya|diye|लिया|लिए|दिए|दिया)/i
    )
    if (leadingNameMatch && leadingNameMatch[1]) {
      const p = cleanName(leadingNameMatch[1])
      if (p) person = p
    }
  }

  // C. Check common person names list in text
  if (!person) {
    for (const name of COMMON_PERSON_NAMES) {
      if (new RegExp(`\\b${name}\\b`, "i").test(combinedSearch)) {
        person = name
        const afterMatch = rawText.match(new RegExp(`\\b${name}\\s+(ji|bhai|uncle|kumar|singh|seth|lal|das|prasad|babu)\\b`, "i"))
        if (afterMatch && afterMatch[1]) {
          person = `${name} ${afterMatch[1].charAt(0).toUpperCase() + afterMatch[1].slice(1).toLowerCase()}`
        }
        break
      }
    }
  }

  // D. General preposition matching ("from / to / for / se / ko / ne")
  if (!person) {
    const anyPrepMatch = rawText.match(/\b(?:from|to|for|se|ko|ne|द्वारा)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)
    if (anyPrepMatch && anyPrepMatch[1]) {
      const p = cleanName(anyPrepMatch[1])
      if (p) person = p
    }
  }

  // E. Trailing name matching ("500 diye Ramesh ko", "500 credit Ramesh")
  if (!person) {
    const trailingMatch = rawText.match(/(?:(?:rs\.?|inr|₹|rupaye|rupees|\d+)\s+)?(?:debit|credit|diye|diya|liye|liya|paid|received|खर्च|दिए|लिए)\s+(?:to|from|ko|se|ne)?\s*([A-Za-z\u0900-\u097F]{2,25})(?:\s+(?:ko|se|ne))?$/i)
    if (trailingMatch && trailingMatch[1]) {
      const p = cleanName(trailingMatch[1])
      if (p) person = p
    }
  }

  // F. Match with known customers list
  if (person && knownCustomers && knownCustomers.length > 0) {
    const matched = matchCustomerWithKnownList(person, knownCustomers)
    if (matched) {
      person = matched
    }
  }

  // 4. Item Extraction (e.g. "5000 rupaye ka samaan udhar", "120 rupaye ki chai", "200 petrol", "groceries")
  let item = type === "Credit" ? "Payment" : "Goods"
  const itemMatch = rawText.match(/(?:rupees?|rupaye|रुपये|का|की|ke)\s+([a-zA-Z\u0900-\u097F\s-]{2,25}?)\s+(?:udhar|udhaar|credit|diya|paid|payment|लिया|लिए|उधार)/i)
  if (itemMatch && itemMatch[1]) {
    const extractedItem = itemMatch[1].trim()
    if (extractedItem && !/^(cash|upi|today|kal|credit|debit)$/i.test(extractedItem)) {
      item = extractedItem.charAt(0).toUpperCase() + extractedItem.slice(1)
    }
  } else {
    // Check known categories as item: petrol, chai, grocery, medicine, etc.
    const quickItemMatch = rawText.match(/\b(chai|tea|coffee|petrol|diesel|groceries|grocery|ration|dinner|lunch|breakfast|doodh|milk|vegetables|sabji|medicine|recharge|wifi|electricity|bijli|rent|kiraya)\b/i)
    if (quickItemMatch && quickItemMatch[1]) {
      item = quickItemMatch[1].charAt(0).toUpperCase() + quickItemMatch[1].slice(1).toLowerCase()
    }
  }

  // If no person explicitly named, intelligently use item or default description:
  if (!person) {
    if (item && item !== "Payment" && item !== "Goods") {
      person = item
    } else {
      person = type === "Credit" ? "Payment Received" : "General Expense"
    }
    isAmbiguousPerson = false
  }

  // 5. Payment Method Extraction
  let method = "UPI"
  if (combinedSearch.includes("cash") || combinedSearch.includes("nagad") || combinedSearch.includes("rokar") || combinedSearch.includes("नकद") || combinedSearch.includes("कैश")) {
    method = "Cash"
  } else if (combinedSearch.includes("bank") || combinedSearch.includes("transfer") || combinedSearch.includes("neft") || combinedSearch.includes("rtgs") || combinedSearch.includes("बैंक")) {
    method = "Bank Transfer"
  } else if (combinedSearch.includes("credit card") || combinedSearch.includes("creditcard")) {
    method = "Credit Card"
  } else if (combinedSearch.includes("debit card") || combinedSearch.includes("debitcard")) {
    method = "Debit Card"
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
  } else if (/\b(?:udhar|udhaar|karza|loan|emi|debt|उधार|कर्ज)\b/i.test(combinedSearch)) {
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
