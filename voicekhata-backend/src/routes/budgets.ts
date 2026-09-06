import { Router, Response } from "express"
import { AuthenticatedRequest, requireFirebaseAuth } from "../middleware/auth"
import { supabaseAdmin } from "../supabase"

const router = Router()

// All routes in this router require a valid Firebase ID token
router.use(requireFirebaseAuth)

// ── GET /api/budgets ──────────────────────────────────────────────────────────
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid

  try {
    const { data, error } = await supabaseAdmin
      .from("budgets")
      .select("*")
      .eq("firebase_uid", uid)
      .order("month", { ascending: false })

    if (error) {
      console.error(`[Budgets GET] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json(data ?? [])
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch budgets", code: "SERVER_ERROR" })
  }
})

// ── POST /api/budgets ─────────────────────────────────────────────────────────
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const { category, amount, month, duration = "monthly" } = req.body

  if (!category || amount === undefined || !month) {
    return res.status(400).json({
      error: "Missing required fields: category, amount, month",
      code: "BAD_REQUEST",
    })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("budgets")
      .upsert(
        [
          {
            firebase_uid: uid,
            category: String(category).trim(),
            amount: Number(amount),
            month: String(month).trim(),
            duration: String(duration || "monthly").trim().toLowerCase(),
          },
        ],
        { onConflict: "firebase_uid,category,month" }
      )
      .select()
      .single()

    if (error) {
      console.error(`[Budgets POST] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(201).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create budget", code: "SERVER_ERROR" })
  }
})

// ── PUT /api/budgets/:id ──────────────────────────────────────────────────────
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const budgetId = req.params.id
  const updates: Record<string, any> = {}

  if (req.body.category !== undefined) updates.category = String(req.body.category).trim()
  if (req.body.amount !== undefined) updates.amount = Number(req.body.amount)
  if (req.body.duration !== undefined) updates.duration = String(req.body.duration).trim().toLowerCase()
  if (req.body.month !== undefined) updates.month = String(req.body.month).trim()

  try {
    const { data, error } = await supabaseAdmin
      .from("budgets")
      .update(updates)
      .eq("id", budgetId)
      .eq("firebase_uid", uid)
      .select()
      .single()

    if (error) {
      console.error(`[Budgets PUT] Error for ${uid} on id ${budgetId}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    if (!data) {
      return res.status(404).json({ error: "Budget not found or unauthorized", code: "NOT_FOUND" })
    }

    return res.status(200).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update budget", code: "SERVER_ERROR" })
  }
})

// ── DELETE /api/budgets/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const budgetId = req.params.id

  try {
    const { error } = await supabaseAdmin
      .from("budgets")
      .delete()
      .eq("id", budgetId)
      .eq("firebase_uid", uid)

    if (error) {
      console.error(`[Budgets DELETE] Error for ${uid} on id ${budgetId}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json({ success: true, id: budgetId })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete budget", code: "SERVER_ERROR" })
  }
})

// ── GET /api/budgets/caps/:month ──────────────────────────────────────────────
router.get("/caps/:month", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const month = req.params.month

  try {
    const { data, error } = await supabaseAdmin
      .from("user_budget_caps")
      .select("total_cap")
      .eq("firebase_uid", uid)
      .eq("month", month)
      .maybeSingle()

    if (error) {
      console.error(`[Budget Caps GET] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json({ total_cap: data?.total_cap ?? null })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch budget cap", code: "SERVER_ERROR" })
  }
})

// ── POST /api/budgets/caps ────────────────────────────────────────────────────
router.post("/caps", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const { month, total_cap } = req.body

  if (!month) {
    return res.status(400).json({ error: "Month is required", code: "BAD_REQUEST" })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("user_budget_caps")
      .upsert(
        {
          firebase_uid: uid,
          month: String(month).trim(),
          total_cap: total_cap === null ? null : Number(total_cap),
        },
        { onConflict: "firebase_uid,month" }
      )
      .select()
      .maybeSingle()

    if (error) {
      console.error(`[Budget Caps POST] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json({ success: true, data })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to save budget cap", code: "SERVER_ERROR" })
  }
})

export default router
