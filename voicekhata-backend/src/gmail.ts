import { google } from "googleapis"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

type GmailTokenRow = {
  firebase_uid: string
  access_token: string | null
  refresh_token: string | null
  expiry_date: number | null
}

// ── OAuth2 client ─────────────────────────────────────────────
export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || process.env.GMAIL_REDIRECT_URI || "https://api.voicekhata.tech/auth/gmail/callback"
  )
}

// ── Generate auth URL ─────────────────────────────────────────
export function getAuthUrl(firebaseUid: string): string {
  const oauth2Client = getOAuthClient()
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    // Always force consent so Google always returns refresh_token
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    state: firebaseUid,
  })
}

// ── Handle callback — save tokens to Supabase ─────────────────
export async function handleCallback(code: string, firebaseUid: string) {
  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)

  let refreshToken = tokens.refresh_token

  if (!refreshToken) {
    // Check direct table first
    const { data: existing, error: existingErr } = await supabase
      .from("gmail_tokens")
      .select("refresh_token")
      .eq("firebase_uid", firebaseUid)
      .maybeSingle()

    if (existing?.refresh_token) {
      refreshToken = existing.refresh_token
      console.log(`[gmail] Reusing existing refresh_token for user ${firebaseUid}`)
    } else {
      throw new Error("No refresh token received and none stored. User must re-authorize.")
    }
  }

  // Direct table upsert
  const { error: upsertErr } = await supabase
    .from("gmail_tokens")
    .upsert(
      {
        firebase_uid: firebaseUid,
        access_token: tokens.access_token ?? null,
        refresh_token: refreshToken ?? null,
        expiry_date: tokens.expiry_date ?? null,
      },
      { onConflict: "firebase_uid" }
    )

  if (upsertErr) {
    console.error("[gmail] Direct token upsert failed:", upsertErr.message)
    throw new Error(upsertErr.message)
  }

  // Also update user_profiles.gmail_connected = true
  await supabase
    .from("user_profiles")
    .update({ gmail_connected: true })
    .eq("firebase_uid", firebaseUid)

  console.log(`[gmail] Gmail connected successfully for user ${firebaseUid} ✅`)
}

// ── Get OAuth client with fresh access token ──────────────────
export async function getClientForUser(firebaseUid: string) {
  const { data: row, error } = await supabase
    .from("gmail_tokens")
    .select("access_token, refresh_token, expiry_date")
    .eq("firebase_uid", firebaseUid)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!row) throw new Error("No Gmail token found for user")

  if (!row.refresh_token && !row.access_token) {
    throw new Error("GMAIL_TOKEN_REVOKED: No access or refresh token found for user")
  }

  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials({
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    expiry_date: row.expiry_date,
  })

  // Listener for token refresh events
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      try {
        await supabase
          .from("gmail_tokens")
          .upsert(
            {
              firebase_uid: firebaseUid,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || row.refresh_token,
              expiry_date: tokens.expiry_date ?? null,
            },
            { onConflict: "firebase_uid" }
          )
      } catch (err: any) {
        console.error(`[gmail] Failed to save updated tokens for ${firebaseUid}:`, err.message)
      }
    }
  })

  // Proactively ensure valid access token using refresh_token
  if (row.refresh_token) {
    try {
      const refreshResult = await oauth2Client.refreshAccessToken()
      const newCredentials = refreshResult.credentials
      if (newCredentials.access_token) {
        oauth2Client.setCredentials(newCredentials)
        await supabase
          .from("gmail_tokens")
          .upsert(
            {
              firebase_uid: firebaseUid,
              access_token: newCredentials.access_token,
              refresh_token: newCredentials.refresh_token || row.refresh_token,
              expiry_date: newCredentials.expiry_date ?? null,
            },
            { onConflict: "firebase_uid" }
          )
      }
    } catch (refreshErr: any) {
      const errMsg = refreshErr?.message || ""
      const errCode = refreshErr?.response?.data?.error
      if (errMsg.includes("invalid_grant") || errCode === "invalid_grant") {
        throw new Error("GMAIL_TOKEN_REVOKED: Google revoked the refresh token. User must reconnect Gmail.")
      }
      console.warn(`[gmail] Proactive token refresh warning for ${firebaseUid}:`, errMsg)
    }
  }

  return oauth2Client
}

// ── Fetch new UPI/bank emails ─────────────────────────────────
export async function fetchUPIEmails(firebaseUid: string) {
  const auth = await getClientForUser(firebaseUid)
  const gmail = google.gmail({ version: "v1", auth })

  let res
  try {
    res = await gmail.users.messages.list({
      userId: "me",
      q: "subject:(UPI OR transaction OR debited OR credited OR payment) newer_than:2d",
      maxResults: 20,
    })
  } catch (err: any) {
    // If 401 unauthenticated, force one more token refresh and retry
    if (err?.code === 401 || err?.status === 401 || err?.message?.includes("invalid authentication credentials")) {
      console.log(`[gmail] 401 received for ${firebaseUid}, forcing fresh token and retrying...`)
      try {
        const refreshResult = await auth.refreshAccessToken()
        if (refreshResult.credentials.access_token) {
          auth.setCredentials(refreshResult.credentials)
          const gmailRetry = google.gmail({ version: "v1", auth })
          res = await gmailRetry.users.messages.list({
            userId: "me",
            q: "subject:(UPI OR transaction OR debited OR credited OR payment) newer_than:2d",
            maxResults: 20,
          })
        } else {
          throw err
        }
      } catch (retryErr: any) {
        throw retryErr
      }
    } else {
      throw err
    }
  }

  const messages = res.data.messages || []
  const results: Array<{ id: string; body: string; subject: string }> = []

  for (const msg of messages) {
    // Skip already processed emails
    const { data: existing } = await supabase
      .from("processed_emails")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .eq("gmail_id", msg.id!)
      .maybeSingle()

    if (existing) continue

    // Fetch full email
    const full = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full",
    })

    const headers = full.data.payload?.headers || []
    const subject = headers.find((h) => h.name === "Subject")?.value || ""

    // Extract email body
    let body = ""
    const parts = full.data.payload?.parts || []
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8")
        break
      }
    }
    if (!body && full.data.payload?.body?.data) {
      body = Buffer.from(full.data.payload.body.data, "base64").toString("utf-8")
    }

    if (body) results.push({ id: msg.id!, body, subject })
  }

  return results
}
