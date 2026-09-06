import cron from "node-cron"
import { createClient } from "@supabase/supabase-js"
import { fetchUPIEmails } from "./gmail"
import { parseEmailWithAI } from "./parser"
import dotenv from "dotenv"

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Cooldown map to avoid spamming the log if a user's Google token is revoked (6 hour cooldown)
const authCooldownMap = new Map<string, { lastFailed: number; error: string }>()
const AUTH_COOLDOWN_MS = 6 * 60 * 60 * 1000

async function processAllUsers() {
  console.log(`[cron] Running at ${new Date().toISOString()}`)

  // Get all users who have connected Gmail
  const { data: tokens, error } = await supabase
    .from("gmail_tokens")
    .select("firebase_uid")

  if (error) {
    console.error("[cron] Failed to fetch users from gmail_tokens:", error.message)
    return
  }
  if (!tokens?.length) {
    console.log("[cron] No users with Gmail connected")
    return
  }

  console.log(`[cron] Processing ${tokens.length} user(s) with Gmail connections`)

  for (const { firebase_uid } of tokens) {
    // Check if user is in auth cooldown
    const cooldown = authCooldownMap.get(firebase_uid)
    if (cooldown && Date.now() - cooldown.lastFailed < AUTH_COOLDOWN_MS) {
      console.log(`[cron] Skipping ${firebase_uid} (auth cooldown active after previous failure)`)
      continue
    }

    try {
      console.log(`[cron] Fetching emails for ${firebase_uid}`)
      const emails = await fetchUPIEmails(firebase_uid)
      console.log(`[cron] Found ${emails.length} new transaction email(s) for ${firebase_uid}`)

      // Successful run — clear cooldown
      authCooldownMap.delete(firebase_uid)

      for (const email of emails) {
        const parsed = await parseEmailWithAI(email.subject, email.body)

        if (!parsed) {
          // Mark as processed even if skipped so we don't re-check it
          await supabase.from("processed_emails").insert({
            firebase_uid,
            gmail_id: email.id,
          })
          continue
        }

        // Insert transaction into Supabase
        const { error: txError } = await supabase
          .from("transactions")
          .insert({
            firebase_uid,
            transaction: parsed.transaction,
            category: parsed.category,
            amount: parsed.amount,
            date: parsed.date,
            type: parsed.type,
            method: parsed.method,
            status: parsed.status,
          })

        if (txError) {
          console.error(`[cron] Failed to insert transaction:`, txError.message)
        } else {
          console.log(`[cron] ✅ Auto-logged transaction: "${parsed.transaction}" ₹${parsed.amount} for ${firebase_uid}`)
        }

        // Mark email as processed
        await supabase.from("processed_emails").insert({
          firebase_uid,
          gmail_id: email.id,
        })
      }
    } catch (err: any) {
      const errMsg = err?.message || "Unknown error"
      console.error(`[cron] Error for user ${firebase_uid}:`, errMsg)

      if (
        errMsg.includes("GMAIL_TOKEN_REVOKED") ||
        errMsg.includes("invalid_grant") ||
        errMsg.includes("invalid authentication credentials") ||
        err?.code === 401 ||
        err?.status === 401
      ) {
        authCooldownMap.set(firebase_uid, { lastFailed: Date.now(), error: errMsg })
        console.warn(`[cron] Auth failure for ${firebase_uid}. Placed in 6-hour cooldown until user reconnects.`)
      }
    }
  }
}

export function startCron() {
  // Run every 15 minutes
  cron.schedule("*/15 * * * *", processAllUsers)
  console.log("[cron] Scheduler started — runs every 15 minutes")

  // Also run immediately on startup
  processAllUsers()
}