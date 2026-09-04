console.log("[DEBUG] index.ts execution started")

import cors from "cors"
import express from "express"
import dotenv from "dotenv"
import { getAuthUrl, handleCallback } from "./gmail"
import { startCron } from "./cron"
import stockRouter from "./stock"
import merchantRouter from "./merchant"
import scanRouter from "./scan"
import transactionsRouter from "./routes/transactions"
import budgetsRouter from "./routes/budgets"
import notificationsRouter from "./routes/notifications"
import chatsRouter from "./routes/chats"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ── Allowed Origins Whitelist ────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://finease.tech",
  "https://www.finease.tech",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
]

// Add origins from environment variables if present
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(",").map((s) => s.trim().replace(/\/+$/, ""))
  ALLOWED_ORIGINS.push(...envOrigins)
}
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim().replace(/\/+$/, ""))
  ALLOWED_ORIGINS.push(...envOrigins)
}

function isOriginAllowed(origin: string): boolean {
  if (!origin) return true // Allow requests with no origin (curl, mobile apps, server-to-server)
  const normalized = origin.trim().replace(/\/+$/, "")
  if (ALLOWED_ORIGINS.includes(normalized)) return true

  // Allow any *.finease.tech subdomain
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*finease\.tech(:[0-9]+)?$/.test(normalized)) {
    return true
  }

  // Allow localhost / 127.0.0.1 on any port in development
  if (process.env.NODE_ENV !== "production" && /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(normalized)) {
    return true
  }

  return false
}

// ── CORS Configuration ───────────────────────────────────────────────────────
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`)
      callback(null, false)
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "sentry-trace",
    "baggage",
    "cache-control",
    "x-api-key",
  ],
  exposedHeaders: ["Content-Length", "Content-Range"],
  credentials: true,
  optionsSuccessStatus: 200, // Legacy browsers choke on 204
  maxAge: 86400, // 24 hours preflight cache
}

// 1. Mount standard CORS middleware first (handles OPTIONS preflight automatically)
app.use(cors(corsOptions))

// 2. Preflight fallback & explicit header middleware across all routes
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD")
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, Origin, X-Requested-With, sentry-trace, baggage, cache-control, x-api-key"
    )
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  next()
})

// ── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/stock", stockRouter)
app.use("/merchant", merchantRouter)
app.use("/scan", scanRouter)
app.use("/api/scan-receipt", (req, res, next) => {
  req.url = "/receipt"
  scanRouter(req, res, next)
})
app.use("/api/import-media", (req, res, next) => {
  req.url = "/multi"
  scanRouter(req, res, next)
})

// ── Authenticated Data API Routes (Firebase Auth Verified) ───────────────────
app.use("/api/transactions", transactionsRouter)
app.use("/api/budgets", budgetsRouter)
app.use("/api/notifications", notificationsRouter)
app.use("/api/chats", chatsRouter)

// ── Gmail OAuth routes ───────────────────────────────────────────────────────
app.get("/auth/gmail", (req, res) => {
  const firebaseUid = req.query.uid as string
  if (!firebaseUid) return res.status(400).json({ error: "uid required" })
  const url = getAuthUrl(firebaseUid)
  res.redirect(url)
})

app.get("/auth/gmail/callback", async (req, res) => {
  const code = req.query.code as string
  const state = req.query.state as string
  if (!code || !state) return res.status(400).json({ error: "Missing code or state" })

  const baseUrl = (process.env.FRONTEND_URL?.split(",")[0] || "https://finease.tech").replace(/\/+$/, "")

  try {
    await handleCallback(code, state)
    res.redirect(`${baseUrl}/dashboard/settings?gmail=connected`)
  } catch (err: any) {
    console.error("Callback error:", err.message)
    res.redirect(`${baseUrl}/dashboard/settings?gmail=error`)
  }
})

// ── Health check (No Auth, CORS enabled) ─────────────────────────────────────
app.get("/health", (req, res) => {
  const origin = req.headers.origin
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  }
  res.json({
    status: "ok",
    service: "finease-backend",
    timestamp: new Date().toISOString(),
    originDetected: origin || "none",
  })
})

// ── 404 Handler with CORS ────────────────────────────────────────────────────
app.use((req, res) => {
  const origin = req.headers.origin
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  }
  res.status(404).json({ error: "Not Found", path: req.originalUrl })
})

// ── Global Error Handler with CORS ───────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const origin = req.headers.origin
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  }
  console.error("[Backend Error]", err)
  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_ERROR",
  })
})

function checkStartupEnvironment() {
  const groqKey = process.env.GROQ_API_KEY?.trim()
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const supabaseUrl = process.env.SUPABASE_URL?.trim()

  console.log("================================================================================")
  console.log(`🚀 [FinEase Backend] Booting on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`)
  console.log(`🌐 [CORS] Allowed Origins:`, ALLOWED_ORIGINS.join(", "))
  console.log(`📧 [Service] Email Transaction Detection & Background Cron Engine`)
  
  if (!groqKey) {
    console.error("⚠️ [STARTUP WARNING] GROQ_API_KEY is NOT set in backend environment!")
    console.error("⚠️ Automated email transaction extraction will fail until configured.")
  } else if (groqKey.startsWith("eyJ")) {
    console.error("⚠️ [STARTUP WARNING] GROQ_API_KEY looks like a JWT token, not a Groq key (starts with 'gsk_')!")
  } else {
    const masked = groqKey.slice(0, 6) + "..." + groqKey.slice(-4)
    console.log(`✅ [STARTUP] GROQ_API_KEY configured for Email AI Parser: ${masked}`)
  }

  if (googleClientId) {
    console.log(`✅ [STARTUP] GOOGLE_CLIENT_ID configured for Gmail OAuth`)
  } else {
    console.warn(`⚠️ [STARTUP] GOOGLE_CLIENT_ID is missing — Gmail OAuth will not work.`)
  }

  if (supabaseUrl) {
    console.log(`✅ [STARTUP] Supabase connected: ${supabaseUrl}`)
  }
  console.log("================================================================================")
}

// Execute startup check synchronously and unconditionally BEFORE app.listen
checkStartupEnvironment()

app.listen(PORT, () => {
  console.log(`FinEase backend running on port ${PORT}`)
  startCron()
})
