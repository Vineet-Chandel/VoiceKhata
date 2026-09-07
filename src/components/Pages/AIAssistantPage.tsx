// src/components/Pages/AIAssistantPage.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { ChatWindow } from "@/components/ui/AIAssistant_UI/chat-window"
import { ChatInput } from "@/components/ui/AIAssistant_UI/chat-input"
import { SuggestedPrompts } from "@/components/ui/AIAssistant_UI/suggested-prompts"
import { useAIChat } from "@/components/hooks/use-ai-chat"
import { useChatStore } from "@/components/hooks/use-chat-store"
import { useTransactions } from "@/components/hooks/use-transactions"
import { useBudgets } from "@/components/hooks/use-budgets"
import { useAuth } from "@/components/hooks/use-auth"
import { Bot } from "lucide-react"
import { createChat, saveMessages, generateChatTitle } from "@/lib/api-chat"
import { ChatHistoryModal } from "@/components/ui/AIAssistant_UI/chat-history-modal"
import type { Message } from "@/components/hooks/use-ai-chat"

export default function AIAssistantPage() {
  const { transactions, addTransaction } = useTransactions()
  const { budgets, addBudget } = useBudgets()
  const { user } = useAuth()
  const location = useLocation()
  // Ref guard so the seed fires exactly once even in React StrictMode double-invoke
  const seedFiredRef = useRef(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const {
    messages, setMessages,
    pendingDraft, setPendingDraft,
    guidedStep, setGuidedStep,
    languageMode, setLanguageMode,
    assistantMode, setAssistantMode,
    activeChatId, setActiveChatId,
    chatHistoryOpen, setChatHistoryOpen,
    multiState, setMultiState,
  } = useChatStore()

  const syncedMessageCountRef = useRef(messages.length)
  const isCreatingChatRef = useRef(false)

  const { loading, sendMessage, clearChat, startGuidedFlow, startBudgetFlow, cancelGuidedFlow, confirmMultiTransactions, cancelMultiTransactions } = useAIChat({
    transactions,
    budgets,
    onAddTransaction: addTransaction,
    onAddBudget: addBudget,
    messages,
    setMessages,
    pendingDraft: pendingDraft as never,
    setPendingDraft: setPendingDraft as never,
    guidedStep,
    setGuidedStep,
    languageMode,
    setLanguageMode,
    assistantMode,
    setAssistantMode,
    multiState,
    setMultiState,
  })

  // Send bulk-import seed message exactly once when navigated here from the dialog.
  // The ref guard prevents StrictMode's double-invoke and any re-mount from firing twice.
  useEffect(() => {
    const seed = (location.state as { seedMessage?: string } | null)?.seedMessage
    if (!seed || seedFiredRef.current) return
    seedFiredRef.current = true
    // Wipe state from history immediately so back/forward nav never re-triggers this
    window.history.replaceState({}, "")
    sendMessage(seed)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset sync count when chat is cleared
  useEffect(() => {
    if (messages.length === 0) {
      syncedMessageCountRef.current = 0
      if (activeChatId) setActiveChatId(null)
    }
  }, [messages.length, activeChatId, setActiveChatId])

  // Sync messages to backend
  useEffect(() => {
    let isMounted = true

    const syncToBackend = async () => {
      // 1. New Chat Creation
      if (messages.length > 0 && !activeChatId && !isCreatingChatRef.current) {
        isCreatingChatRef.current = true
        try {
          const chat = await createChat("New Chat")
          if (!isMounted) return
          setActiveChatId(chat.id)
          
          const newMessages = messages.slice(syncedMessageCountRef.current)
          if (newMessages.length > 0) {
            await saveMessages(chat.id, newMessages)
            syncedMessageCountRef.current += newMessages.length
          }

          // Trigger title generation if this was the first user message
          generateChatTitle(chat.id).catch(console.error)
        } catch (err) {
          console.error("Failed to create chat:", err)
        } finally {
          isCreatingChatRef.current = false
        }
        return
      }

      // 2. Append to Existing Chat
      if (activeChatId && messages.length > syncedMessageCountRef.current) {
        const currentCount = syncedMessageCountRef.current
        const newMessages = messages.slice(currentCount)
        
        // Prevent concurrent saves of the same messages
        syncedMessageCountRef.current = messages.length 

        try {
          await saveMessages(activeChatId, newMessages)
        } catch (err) {
          console.error("Failed to save messages:", err)
          // Revert count if failed so it can retry next render
          if (isMounted) syncedMessageCountRef.current = currentCount
        }
      }
    }

    syncToBackend()
    
    return () => {
      isMounted = false
    }
  }, [messages, activeChatId, setActiveChatId])

  const handleClearChat = () => {
    clearChat()
    setActiveChatId(null)
    syncedMessageCountRef.current = 0
  }

  const userAvatar = user?.photoURL ?? null
  const userInitials = (user?.displayName ?? user?.email ?? "U")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="@container/main flex flex-1 flex-col h-full overflow-hidden w-full min-w-0">
      <div className="flex flex-col h-full max-h-[calc(100vh-var(--header-height))] w-full min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Bot size={15} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-text-primary leading-tight">VoiceKhata AI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-white/35">Online</span>
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 overflow-hidden w-full min-w-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-7 px-4 py-8">
              <div className="text-center">
                <p className="text-base font-medium text-text-primary">How can I help you today?</p>
                <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
                  Ask about your finances or say{" "}
                  <span className="text-text-secondary bg-surface-secondary px-1.5 py-0.5 rounded text-xs font-mono">
                    I spent ₹500 on groceries
                  </span>{" "}
                  to log it instantly.
                </p>
              </div>
              <SuggestedPrompts onSelect={(msg) => sendMessage(msg, replyingTo ? { id: replyingTo.id, role: replyingTo.role, content: replyingTo.content } : undefined)} />
            </div>
          ) : (
            <ChatWindow
              messages={messages}
              loading={loading}
              userAvatar={userAvatar}
              userInitials={userInitials}
              onSend={(msg) => {
                sendMessage(msg, replyingTo ? { id: replyingTo.id, role: replyingTo.role, content: replyingTo.content } : undefined)
                setReplyingTo(null)
              }}
              onReply={(msg) => setReplyingTo(msg)}
              onConfirmAll={confirmMultiTransactions}
              onCancel={cancelMultiTransactions}
            />
          )}

          {/* Input */}
          <div className="px-4 lg:px-6 py-3 border-t border-border shrink-0">
            <ChatInput
              onSend={(msg) => {
                sendMessage(msg, replyingTo ? { id: replyingTo.id, role: replyingTo.role, content: replyingTo.content } : undefined)
                setReplyingTo(null)
              }}
              loading={loading}
              guidedStep={guidedStep}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onStartGuided={startGuidedFlow}
              onStartBudgetGuided={() => startBudgetFlow()}
              onCancelGuided={cancelGuidedFlow}
            />
          </div>
        </div>

      </div>

      <ChatHistoryModal 
        isOpen={chatHistoryOpen} 
        onClose={() => setChatHistoryOpen(false)} 
        onSelectChat={(chatId, historyMessages) => {
          setActiveChatId(chatId)
          setMessages(historyMessages)
          syncedMessageCountRef.current = historyMessages.length
          setChatHistoryOpen(false)
        }}
        onNewChat={() => {
          handleClearChat()
          setChatHistoryOpen(false)
        }}
      />
    </div>
  )
}
