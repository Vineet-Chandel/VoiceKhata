import { Router, Response } from "express"
import { AuthenticatedRequest, requireFirebaseAuth } from "../middleware/auth"
import { supabaseAdmin } from "../supabase"

const router = Router()

router.use(requireFirebaseAuth)

// GET /api/chats
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const { page = "1", limit = "30" } = req.query

  const pageNum = parseInt(page as string, 10) || 1
  const limitNum = parseInt(limit as string, 10) || 30
  const offset = (pageNum - 1) * limitNum

  try {
    const { data, error, count } = await supabaseAdmin
      .from("chat_sessions")
      .select("*", { count: "exact" })
      .eq("firebase_uid", uid)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limitNum - 1)

    if (error) {
      console.error(`[Chats GET] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    // Fetch the latest message for preview for each chat
    const chatsWithPreview = await Promise.all(
      (data || []).map(async (chat) => {
        const { data: msgData } = await supabaseAdmin
          .from("chat_messages")
          .select("content")
          .eq("chat_id", chat.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        return { ...chat, preview: msgData?.content || "" }
      })
    )

    return res.status(200).json({ data: chatsWithPreview, count })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch chats", code: "SERVER_ERROR" })
  }
})

// POST /api/chats
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const { title } = req.body

  try {
    const { data, error } = await supabaseAdmin
      .from("chat_sessions")
      .insert([{ firebase_uid: uid, title: title || "New Chat" }])
      .select()
      .single()

    if (error) {
      console.error(`[Chats POST] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(201).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create chat", code: "SERVER_ERROR" })
  }
})

// GET /api/chats/:id
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const chatId = req.params.id

  try {
    const { data: chatData, error: chatError } = await supabaseAdmin
      .from("chat_sessions")
      .select("*")
      .eq("id", chatId)
      .eq("firebase_uid", uid)
      .single()

    if (chatError || !chatData) {
      return res.status(404).json({ error: "Chat not found or unauthorized", code: "NOT_FOUND" })
    }

    const { data: msgData, error: msgError } = await supabaseAdmin
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (msgError) {
      return res.status(500).json({ error: msgError.message, code: "DB_ERROR" })
    }

    return res.status(200).json({ chat: chatData, messages: msgData || [] })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch chat", code: "SERVER_ERROR" })
  }
})

// PATCH /api/chats/:id
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const chatId = req.params.id
  const { title } = req.body

  if (!title) {
    return res.status(400).json({ error: "Title is required", code: "BAD_REQUEST" })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("chat_sessions")
      .update({ title: title.trim(), updated_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("firebase_uid", uid)
      .select()
      .single()

    if (error) {
      console.error(`[Chats PATCH] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json(data)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to rename chat", code: "SERVER_ERROR" })
  }
})

// DELETE /api/chats/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const chatId = req.params.id

  try {
    const { error } = await supabaseAdmin
      .from("chat_sessions")
      .delete()
      .eq("id", chatId)
      .eq("firebase_uid", uid)

    if (error) {
      console.error(`[Chats DELETE] Error for ${uid}:`, error.message)
      return res.status(500).json({ error: error.message, code: "DB_ERROR" })
    }

    return res.status(200).json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete chat", code: "SERVER_ERROR" })
  }
})

// POST /api/chats/:id/messages
router.post("/:id/messages", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const chatId = req.params.id
  const { messages } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array required", code: "BAD_REQUEST" })
  }

  try {
    const { data: chatData, error: chatError } = await supabaseAdmin
      .from("chat_sessions")
      .select("id, message_count")
      .eq("id", chatId)
      .eq("firebase_uid", uid)
      .single()

    if (chatError || !chatData) {
      return res.status(404).json({ error: "Chat not found", code: "NOT_FOUND" })
    }

    const payload = messages.map((m: any) => ({
      chat_id: chatId,
      role: m.role,
      content: m.content,
      created_at: m.createdAt || new Date().toISOString()
    }))

    const { data: inserted, error: msgError } = await supabaseAdmin
      .from("chat_messages")
      .insert(payload)
      .select()

    if (msgError) {
      return res.status(500).json({ error: msgError.message, code: "DB_ERROR" })
    }

    await supabaseAdmin
      .from("chat_sessions")
      .update({
        message_count: chatData.message_count + inserted.length,
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .eq("id", chatId)

    return res.status(201).json(inserted)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to add messages", code: "SERVER_ERROR" })
  }
})

// POST /api/chats/:id/title
router.post("/:id/title", async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.uid
  const chatId = req.params.id

  try {
    const { data: chatData, error: chatError } = await supabaseAdmin
      .from("chat_sessions")
      .select("id, title")
      .eq("id", chatId)
      .eq("firebase_uid", uid)
      .single()

    if (chatError || !chatData) return res.status(404).json({ error: "Not found", code: "NOT_FOUND" })
    
    const { data: msgData } = await supabaseAdmin
      .from("chat_messages")
      .select("role, content")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(4)

    if (!msgData || msgData.length === 0) {
      return res.status(200).json({ title: chatData.title })
    }

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return res.status(500).json({ error: "Groq key not configured", code: "SERVER_ERROR" })
    }

    const systemPrompt = "Generate a concise, descriptive title for this conversation in 3-7 words. Return ONLY the title string without quotes, punctuation, or any other text."
    const messagesPayload = [
      { role: "system", content: systemPrompt },
      ...msgData.map(m => ({ role: m.role, content: m.content }))
    ]

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: messagesPayload,
        temperature: 0.3,
        max_tokens: 15
      })
    })

    if (!groqRes.ok) throw new Error("Groq API failed")
    
    const groqData = await (groqRes.json() as Promise<any>)
    let newTitle = groqData?.choices?.[0]?.message?.content?.trim()
    
    newTitle = newTitle?.replace(/^["']|["']$/g, '')

    if (newTitle) {
      await supabaseAdmin
        .from("chat_sessions")
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq("id", chatId)
        
      return res.status(200).json({ title: newTitle })
    }

    return res.status(200).json({ title: chatData.title })
  } catch (err: any) {
    console.error(`[Chats POST /title] Error:`, err.message)
    return res.status(500).json({ error: err.message, code: "SERVER_ERROR" })
  }
})

export default router
