import { apiFetch } from "@/lib/api-client"
import { auth } from "@/firebase/firebase"
import type { Message } from "@/components/hooks/use-ai-chat"

export type ChatSession = {
  id: string
  firebase_uid: string
  title: string
  message_count: number
  created_at: string
  updated_at: string
  last_message_at: string
  preview?: string
}

// ── Local Storage Helpers ────────────────────────────────────────────────────

function getUid(): string {
  return auth.currentUser?.uid || "guest"
}

function getChatsStorageKey(uid: string): string {
  return `voicekhata_chats_${uid}`
}

function getMsgsStorageKey(chatId: string): string {
  return `voicekhata_chat_msgs_${chatId}`
}

export function getLocalChats(): ChatSession[] {
  try {
    const key = getChatsStorageKey(getUid())
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.warn("[api-chat] Failed to read local chats:", err)
    return []
  }
}

export function setLocalChats(chats: ChatSession[]): void {
  try {
    const key = getChatsStorageKey(getUid())
    localStorage.setItem(key, JSON.stringify(chats))
  } catch (err) {
    console.warn("[api-chat] Failed to save local chats:", err)
  }
}

export function getLocalMessages(chatId: string): Message[] {
  try {
    const raw = localStorage.getItem(getMsgsStorageKey(chatId))
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.warn("[api-chat] Failed to read local messages:", err)
    return []
  }
}

export function setLocalMessages(chatId: string, messages: Message[]): void {
  try {
    localStorage.setItem(getMsgsStorageKey(chatId), JSON.stringify(messages))
  } catch (err) {
    console.warn("[api-chat] Failed to save local messages:", err)
  }
}

// ── Public API Methods with Resilient Local-First Fallback ───────────────────

export async function fetchChats(page = 1, limit = 50): Promise<{ data: ChatSession[]; count: number }> {
  const local = getLocalChats()

  try {
    // Attempt backend with rapid response; fall back to local if server is offline or slow
    const res = await Promise.race([
      apiFetch<{ data: ChatSession[]; count: number }>(`/api/chats?page=${page}&limit=${limit}`, { cache: "no-store" }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000)),
    ])

    if (res && Array.isArray(res.data)) {
      // Merge remote and local (prefer fresher updated_at)
      const mergedMap = new Map<string, ChatSession>()
      local.forEach(c => mergedMap.set(c.id, c))
      res.data.forEach(c => mergedMap.set(c.id, c))
      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      setLocalChats(merged)
      return { data: merged, count: merged.length }
    }
  } catch (err) {
    // Backend asleep or unreachable - perfectly fine, return local
    console.info("[api-chat] Using local chat history cache.")
  }

  return { data: local, count: local.length }
}

export async function fetchChatMessages(chatId: string): Promise<{ chat: ChatSession; messages: Message[] }> {
  const localChats = getLocalChats()
  const localChat = localChats.find(c => c.id === chatId) || {
    id: chatId,
    firebase_uid: getUid(),
    title: "Chat Session",
    message_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  }
  const localMsgs = getLocalMessages(chatId)

  try {
    const res = await Promise.race([
      apiFetch<{ chat: ChatSession; messages: Message[] }>(`/api/chats/${chatId}`),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000)),
    ])
    if (res && res.messages) {
      setLocalMessages(chatId, res.messages)
      return res
    }
  } catch (err) {
    console.info("[api-chat] Using local chat messages.")
  }

  return { chat: localChat, messages: localMsgs }
}

export async function createChat(title?: string): Promise<ChatSession> {
  const now = new Date().toISOString()
  const tempId = "chat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)
  const newChat: ChatSession = {
    id: tempId,
    firebase_uid: getUid(),
    title: title || "New Conversation",
    message_count: 0,
    created_at: now,
    updated_at: now,
    last_message_at: now,
  }

  // Save locally first
  const existing = getLocalChats()
  setLocalChats([newChat, ...existing])

  // Try backend
  try {
    const remote = await apiFetch<ChatSession>(`/api/chats`, {
      method: "POST",
      body: { title: title || "New Conversation" },
    })
    if (remote && remote.id) {
      // replace temp with remote
      const updated = getLocalChats().map(c => c.id === tempId ? remote : c)
      setLocalChats(updated)
      // Move any temporary messages to remote id if already stored
      const msgs = getLocalMessages(tempId)
      if (msgs.length > 0) {
        setLocalMessages(remote.id, msgs)
        try { localStorage.removeItem(getMsgsStorageKey(tempId)) } catch {}
      }
      return remote
    }
  } catch (err) {
    console.info("[api-chat] Backend sync postponed, using local session.")
  }

  return newChat
}

export async function renameChat(chatId: string, title: string): Promise<ChatSession> {
  const chats = getLocalChats()
  let updatedChat: ChatSession | null = null
  const updatedList = chats.map(c => {
    if (c.id === chatId) {
      updatedChat = { ...c, title, updated_at: new Date().toISOString() }
      return updatedChat
    }
    return c
  })
  setLocalChats(updatedList)

  try {
    const remote = await apiFetch<ChatSession>(`/api/chats/${chatId}`, {
      method: "PATCH",
      body: { title },
    })
    if (remote) return remote
  } catch (err) {
    console.info("[api-chat] Backend rename postponed.")
  }

  return updatedChat || {
    id: chatId,
    firebase_uid: getUid(),
    title,
    message_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  // Delete locally
  const chats = getLocalChats().filter(c => c.id !== chatId)
  setLocalChats(chats)
  try {
    localStorage.removeItem(getMsgsStorageKey(chatId))
  } catch {}

  // Delete remotely
  try {
    await apiFetch(`/api/chats/${chatId}`, { method: "DELETE" })
  } catch (err) {
    console.info("[api-chat] Backend deletion postponed.")
  }
}

export async function saveMessages(chatId: string, messages: Partial<Message>[]): Promise<void> {
  if (!messages || messages.length === 0) return

  // Merge into local messages
  const existing = getLocalMessages(chatId)
  const existingIds = new Set(existing.map(m => m.id))
  const toAppend: Message[] = []

  messages.forEach(m => {
    if (m.id && !existingIds.has(m.id)) {
      toAppend.push(m as Message)
    } else if (!m.id) {
      toAppend.push({
        ...m,
        id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      } as Message)
    }
  })

  const updatedMsgs = [...existing, ...toAppend]
  setLocalMessages(chatId, updatedMsgs)

  // Update chat metadata locally
  const chats = getLocalChats()
  const lastMsg = updatedMsgs[updatedMsgs.length - 1]
  const updatedChats = chats.map(c => {
    if (c.id === chatId) {
      let preview = lastMsg?.content || c.preview || ""
      if (preview.length > 80) preview = preview.substring(0, 77) + "..."
      return {
        ...c,
        message_count: updatedMsgs.length,
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        preview,
      }
    }
    return c
  })
  setLocalChats(updatedChats)

  // Send to backend
  try {
    await apiFetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      body: { messages },
    })
  } catch (err) {
    console.info("[api-chat] Backend message sync postponed.")
  }
}

export async function generateChatTitle(chatId: string): Promise<{ title: string }> {
  try {
    const res = await apiFetch<{ title: string }>(`/api/chats/${chatId}/title`, {
      method: "POST",
    })
    if (res?.title) {
      await renameChat(chatId, res.title)
      return res
    }
  } catch {
    // Fallback: generate local title from first user message
    const msgs = getLocalMessages(chatId)
    const firstUserMsg = msgs.find(m => m.role === "user")?.content || ""
    let generated = "Conversation"
    if (firstUserMsg) {
      const clean = firstUserMsg.replace(/[^\w\s\u0900-\u097F₹]/g, "").trim()
      generated = clean.length > 32 ? clean.substring(0, 30) + "..." : clean
    }
    if (generated) {
      await renameChat(chatId, generated)
      return { title: generated }
    }
  }

  return { title: "Conversation" }
}
