import { Router, Response } from "express"
import { AuthenticatedRequest, requireFirebaseAuth } from "../middleware/auth"
import { supabaseAdmin } from "../supabase"

const router = Router()

// All routes in this router require a valid Firebase ID token
router.use(requireFirebaseAuth)

// ── GET /api/transactions ─────────────────────────────────────────────────────
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid

  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("firebase_uid", uid)
      .order("date", { ascending: false })

    if (error) {
      console.error(`[Transactions GET] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json(data ?? [])
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch transactions", code: "SERVER_ERROR" })
  }
})

// ── POST /api/transactions ────────────────────────────────────────────────────
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const { transaction, category, amount, date, type, method = "UPI", status = "Completed" } = req.body

  if (!transaction || amount === undefined || !date || !type || !category) {
    return res.status(400).json({
      error: "Missing required fields: transaction, category, amount, date, type",
      code: "BAD_REQUEST",
    })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .insert([
        {
          firebase_uid: uid,
          transaction: String(transaction).trim(),
          category: String(category).trim(),
          amount: Number(amount),
          date: String(date).trim(),
          type: type === "Credit" ? "Credit" : "Debit",
          method: String(method || "UPI").trim(),
          status: String(status || "Completed").trim(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error(`[Transactions POST] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(201).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create transaction", code: "SERVER_ERROR" })
  }
})

// ── PUT /api/transactions/:id ─────────────────────────────────────────────────
router.put("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const txId = req.params.id
  const updates = { ...req.body }

  // Prevent client from mutating ownership
  delete updates.firebase_uid
  delete updates.id

  if (updates.amount !== undefined) {
    updates.amount = Number(updates.amount)
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .update(updates)
      .eq("id", txId)
      .eq("firebase_uid", uid)
      .select()
      .single()

    if (error) {
      console.error(`[Transactions PUT] Error for ${uid} on id ${txId}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    if (!data) {
      return res.status(404).json({ error: "Transaction not found or unauthorized", code: "NOT_FOUND" })
    }

    return res.status(200).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update transaction", code: "SERVER_ERROR" })
  }
})

// ── DELETE /api/transactions/:id ──────────────────────────────────────────────
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const txId = req.params.id

  try {
    const { error } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("id", txId)
      .eq("firebase_uid", uid)

    if (error) {
      console.error(`[Transactions DELETE] Error for ${uid} on id ${txId}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json({ success: true, id: txId })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete transaction", code: "SERVER_ERROR" })
  }
})

export default router
