import { Router, Response } from "express"
import { AuthenticatedRequest, requireFirebaseAuth } from "../middleware/auth"
import { supabaseAdmin } from "../supabase"

const router = Router()

// All routes in this router require a valid Firebase ID token
router.use(requireFirebaseAuth)

// ── GET /api/notifications ───────────────────────────────────────────────────
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid

  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("firebase_uid", uid)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(`[Notifications GET] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json(data ?? [])
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch notifications", code: "SERVER_ERROR" })
  }
})

// ── POST /api/notifications ──────────────────────────────────────────────────
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const { type, title, message, metadata, read = false } = req.body

  if (!title || !message) {
    return res.status(400).json({ error: "Missing required fields: title, message", code: "BAD_REQUEST" })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert([
        {
          firebase_uid: uid,
          type: String(type || "info").trim(),
          title: String(title).trim(),
          message: String(message).trim(),
          metadata: metadata || {},
          read: Boolean(read),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error(`[Notifications POST] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(201).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create notification", code: "SERVER_ERROR" })
  }
})

// ── PATCH /api/notifications/:id/read ─────────────────────────────────────────
router.patch("/:id/read", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const notifId = req.params.id

  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ read: true })
      .eq("id", notifId)
      .eq("firebase_uid", uid)
      .select()
      .single()

    if (error) {
      console.error(`[Notifications PATCH read] Error for ${uid} on id ${notifId}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update notification", code: "SERVER_ERROR" })
  }
})

// ── POST /api/notifications/yearly-summary ───────────────────────────────────
router.post("/yearly-summary", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const { payload } = req.body

  if (!Array.isArray(payload)) {
    return res.status(400).json({ error: "Payload must be an array", code: "BAD_REQUEST" })
  }

  const rows = payload.map((row) => ({
    ...row,
    firebase_uid: uid,
  }))

  try {
    const { data, error } = await supabaseAdmin
      .from("yearly_budget_summary")
      .upsert(rows, { onConflict: "firebase_uid,year,category" })

    if (error) {
      console.error(`[Yearly Summary POST] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json({ success: true, data })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to upsert yearly summary", code: "SERVER_ERROR" })
  }
})

export default router
