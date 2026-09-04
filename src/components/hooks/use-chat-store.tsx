// src/components/hooks/use-chat-store.tsx
// Persists AI chat state across dashboard navigation
"use client"

import * as React from "react"
import type { Message, GuidedStep } from "@/components/hooks/use-ai-chat"
import type { AssistantMode, LanguageMode } from "@/lib/chat-language"

export type MultiGuidedStep = "setup" | "queue" | "paused" | "review" | "done"

export type DraftItem = {
  id: string
  amount: number
  transaction?: string
  type?: "Debit" | "Credit"
  category?: string
  status: "pending" | "completed" | "skipped" | "needs-attention" | "error" | "duplicate"
}

export type MultiGuidedState = {
  step: MultiGuidedStep
  drafts: DraftItem[]
  needsNameCount: number
  needsTypeCount: number
  skipNames: boolean
}

interface ChatStore {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  pendingDraft: Record<string, unknown> | null
  setPendingDraft: React.Dispatch<React.SetStateAction<Record<string, unknown> | null>>
  guidedStep: GuidedStep
  setGuidedStep: React.Dispatch<React.SetStateAction<GuidedStep>>
  languageMode: LanguageMode | null
  setLanguageMode: React.Dispatch<React.SetStateAction<LanguageMode | null>>
  assistantMode: AssistantMode
  setAssistantMode: React.Dispatch<React.SetStateAction<AssistantMode>>
  activeChatId: string | null
  setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>
  chatHistoryOpen: boolean
  setChatHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>
  multiState: MultiGuidedState | null
  setMultiState: React.Dispatch<React.SetStateAction<MultiGuidedState | null>>
}

const ChatStoreContext = React.createContext<ChatStore | null>(null)

export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [pendingDraft, setPendingDraft] = React.useState<Record<string, unknown> | null>(null)
  const [guidedStep, setGuidedStep] = React.useState<GuidedStep>("idle")
  const [languageMode, setLanguageMode] = React.useState<LanguageMode | null>(null)
  const [assistantMode, setAssistantMode] = React.useState<AssistantMode>("conversation")
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null)
  const [chatHistoryOpen, setChatHistoryOpen] = React.useState<boolean>(false)
  const [multiState, setMultiState] = React.useState<MultiGuidedState | null>(null)

  return (
    <ChatStoreContext.Provider
      value={{
        messages,
        setMessages,
        pendingDraft,
        setPendingDraft,
        guidedStep,
        setGuidedStep,
        languageMode,
        setLanguageMode,
        assistantMode,
        setAssistantMode,
        activeChatId,
        setActiveChatId,
        chatHistoryOpen,
        setChatHistoryOpen,
        multiState,
        setMultiState,
      }}
    >
      {children}
    </ChatStoreContext.Provider>
  )
}

export function useChatStore() {
  const ctx = React.useContext(ChatStoreContext)
  if (!ctx) throw new Error("useChatStore must be used inside ChatStoreProvider")
  return ctx
}
