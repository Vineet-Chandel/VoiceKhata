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
import { Bot, History, Plus } from "lucide-react"
import { createChat, saveMessages, generateChatTitle, fetchChats, fetchChatMessages } from "@/lib/api-chat"
import { ChatHistoryModal } from "@/components/ui/AIAssistant_UI/chat-history-modal"
import { PreviousChatsSidebar } from "@/components/ui/AIAssistant_UI/previous-chats-sidebar"
import type { Message } from "@/components/hooks/use-ai-chat"
import { useLanguage } from "@/context/LanguageContext"
import { useAppMode } from "@/context/AppModeContext"

export default function AIAssistantPage() {
  const { t } = useLanguage()
  const { appMode } = useAppMode()
  const { transactions, addTransaction } = useTransactions()
  const { budgets, addBudget } = useBudgets()
  const { user } = useAuth()
  const location = useLocation()
  // Ref guard so the seed fires exactly once even in React StrictMode double-invoke
  const seedFiredRef = useRef(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
    appMode,
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
            setRefreshTrigger(p => p + 1)
          }

          // Trigger title generation if this was the first user message
          generateChatTitle(chat.id)
            .then(() => setRefreshTrigger(p => p + 1))
            .catch(console.error)
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
          setRefreshTrigger(p => p + 1)
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

  // Auto-restore latest conversation on initial mount if empty
  useEffect(() => {
    if (messages.length === 0 && !activeChatId && !(location.state as any)?.seedMessage) {
      fetchChats(1, 1).then(res => {
        if (res.data && res.data.length > 0) {
          const latest = res.data[0]
          fetchChatMessages(latest.id).then(msgRes => {
            if (msgRes.messages && msgRes.messages.length > 0) {
              setActiveChatId(latest.id)
              setMessages(msgRes.messages)
              syncedMessageCountRef.current = msgRes.messages.length
            }
          }).catch(console.error)
        }
      }).catch(console.error)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearChat = () => {
    clearChat()
    setActiveChatId(null)
    syncedMessageCountRef.current = 0
    setRefreshTrigger(p => p + 1)
  }

  const handleNewChat = () => {
    clearChat()
    setActiveChatId(null)
    syncedMessageCountRef.current = 0
  }

  const userAvatar = user?.photoURL ?? null
  const userInitials = (user?.displayName ?? user?.email ?? "U")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="@container/main flex flex-1 h-full overflow-hidden w-full min-w-0 bg-[#0B0F19] text-[#F8FAFC]">
      
      {/* 1. Left Previous Chats Sidebar */}
      <PreviousChatsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeChatId={activeChatId}
        onSelectChat={(chatId, historyMessages) => {
          setActiveChatId(chatId)
          setMessages(historyMessages)
          syncedMessageCountRef.current = historyMessages.length
        }}
        onNewChat={handleNewChat}
        refreshTrigger={refreshTrigger}
      />

      {/* 2. Main Chat Interface */}
      <div className="flex flex-col flex-1 h-full max-h-[calc(100vh-var(--header-height))] w-full min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-slate-700/40 shrink-0 bg-[#080D1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Toggle Previous Chats Button */}
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${
                sidebarOpen 
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-sm"
                  : "bg-[#0E1528] border-slate-700/60 hover:bg-[#131C31] text-slate-300 hover:text-white"
              }`}
              title={t("ai.previousChats")}
            >
              <History size={14} className="text-blue-400" />
              <span className="hidden sm:inline">{t("ai.previousChats")}</span>
            </button>

            <div className="size-8 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
              <Bot size={16} className="text-blue-400" />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-text-primary leading-tight">
                {appMode === "BUSINESS" ? t("ai.titleBusiness") : t("ai.title")}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-mono">{t("common.online")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D2F832] hover:bg-[#c3ea23] active:scale-[0.98] text-black text-xs font-bold shadow-sm transition-all cursor-pointer"
              title={t("ai.newChat")}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">{t("ai.newChat")}</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-xs text-muted-foreground hover:text-foreground border border-border hover:bg-surface-elevated px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                {t("ai.clearChat")}
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 overflow-hidden w-full min-w-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-7 px-4 py-8">
              <div className="text-center">
                <p className="text-base font-medium text-text-primary">
                  {appMode === "BUSINESS" ? t("ai.howCanIHelpBusiness") : t("ai.howCanIHelp")}
                </p>
                <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
                  {appMode === "BUSINESS" ? t("ai.askPromptBusiness") : t("ai.askPrompt")}{" "}
                  <span className="text-text-secondary bg-surface-secondary px-1.5 py-0.5 rounded text-xs font-mono">
                    {appMode === "BUSINESS" ? "Ramesh ne ₹500 jama kiye" : "I spent ₹500 on groceries"}
                  </span>
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
          <div className="px-4 lg:px-6 py-3 border-t border-border/60 shrink-0 bg-background/80 backdrop-blur-sm">
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
          handleNewChat()
          setChatHistoryOpen(false)
        }}
      />
    </div>
  )
}
