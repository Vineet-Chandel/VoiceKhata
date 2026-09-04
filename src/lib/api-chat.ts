import { apiFetch } from "@/lib/api-client"
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

export async function fetchChats(page = 1, limit = 30): Promise<{ data: ChatSession[]; count: number }> {
  return apiFetch(`/api/chats?page=${page}&limit=${limit}`, {
    cache: "no-store",
  })
}

export async function fetchChatMessages(chatId: string): Promise<{ chat: ChatSession; messages: Message[] }> {
  return apiFetch(`/api/chats/${chatId}`)
}

export async function createChat(title?: string): Promise<ChatSession> {
  return apiFetch(`/api/chats`, {
    method: "POST",
    body: { title },
  })
}

export async function renameChat(chatId: string, title: string): Promise<ChatSession> {
  return apiFetch(`/api/chats/${chatId}`, {
    method: "PATCH",
    body: { title },
  })
}

export async function deleteChat(chatId: string): Promise<void> {
  return apiFetch(`/api/chats/${chatId}`, {
    method: "DELETE",
  })
}

export async function saveMessages(chatId: string, messages: Partial<Message>[]): Promise<void> {
  return apiFetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    body: { messages },
  })
}

export async function generateChatTitle(chatId: string): Promise<{ title: string }> {
  return apiFetch(`/api/chats/${chatId}/title`, {
    method: "POST",
  })
}
