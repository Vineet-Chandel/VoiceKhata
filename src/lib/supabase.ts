// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ FinEase: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables.")
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-anon-key"
)

let scopedUid: string | null = null
let scopeInFlight: Promise<void> | null = null
let scopeInFlightUid: string | null = null
let lastScopedAt = 0
let keepAliveStarted = false

type ScopeOptions = {
  force?: boolean
  refreshMs?: number
}

const DEFAULT_SCOPE_REFRESH_MS = 20_000

export async function getScopedSupabase(
  firebaseUid: string | null | undefined,
  options: ScopeOptions = {}
) {
  if (!firebaseUid) return supabase
  const force = options.force ?? false
  const refreshMs = options.refreshMs ?? DEFAULT_SCOPE_REFRESH_MS
  const scopeFresh = scopedUid === firebaseUid && Date.now() - lastScopedAt < refreshMs
  if (!force && scopeFresh) return supabase

  if (scopeInFlight) {
    if (!force && scopeInFlightUid === firebaseUid) {
      await scopeInFlight
      const refreshed = scopedUid === firebaseUid && Date.now() - lastScopedAt < refreshMs
      if (refreshed) return supabase
    }
  }

  const nextScope = (async () => {
    try {
      const { error } = await supabase.rpc("set_uid", { uid: firebaseUid })
      if (error) {
        // If set_uid function is not defined in Postgres, log info instead of breaking app
        console.warn("Notice: set_uid RPC error (run supabase_schema.sql if using RLS):", error.message)
      }
    } catch (rpcErr) {
      console.warn("Notice: set_uid RPC failed:", rpcErr)
    }
    scopedUid = firebaseUid
    lastScopedAt = Date.now()
  })()

  scopeInFlight = nextScope
  scopeInFlightUid = firebaseUid

  try {
    await nextScope
  } finally {
    if (scopeInFlight === nextScope) {
      scopeInFlight = null
      scopeInFlightUid = null
    }
  }

  return supabase
}

export function clearScopedSupabase() {
  scopedUid = null
  scopeInFlightUid = null
  lastScopedAt = 0
}

export function startSupabaseKeepAlive() {
  if (keepAliveStarted) return
  keepAliveStarted = true

  const threeDaysMs = 3 * 24 * 60 * 60 * 1000
  setInterval(() => {
    void supabase.from("user_profiles").select("firebase_uid").limit(1)
  }, threeDaysMs)
}
