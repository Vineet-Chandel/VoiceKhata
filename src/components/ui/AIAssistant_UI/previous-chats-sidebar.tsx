// src/components/ui/AIAssistant_UI/previous-chats-sidebar.tsx
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Clock, 
  PanelLeftClose, 
  History,
  Sparkles
} from "lucide-react"
import { isToday, isYesterday, subDays, isAfter, format } from "date-fns"
import { fetchChats, renameChat, deleteChat, fetchChatMessages, type ChatSession } from "@/lib/api-chat"
import type { Message } from "@/components/hooks/use-ai-chat"
import { useLanguage } from "@/context/LanguageContext"

interface Props {
  isOpen: boolean
  onClose: () => void
  activeChatId: string | null
  onSelectChat: (chatId: string, messages: Message[]) => void
  onNewChat: () => void
  refreshTrigger?: number
}

type GroupedChats = {
  label: string
  chats: ChatSession[]
}

export function PreviousChatsSidebar({
  isOpen,
  onClose,
  activeChatId,
  onSelectChat,
  onNewChat,
  refreshTrigger,
}: Props) {
  const { t } = useLanguage()
  const [chats, setChats] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const loadAllChats = async () => {
    setLoading(true)
    try {
      const res = await fetchChats(1, 100)
      setChats(res.data)
    } catch (err) {
      console.error("Failed to load chats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllChats()
  }, [refreshTrigger, activeChatId])

  const handleSelect = async (chat: ChatSession) => {
    try {
      const res = await fetchChatMessages(chat.id)
      onSelectChat(res.chat.id, res.messages)
    } catch (err) {
      console.error("Failed to load chat messages:", err)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmMsg = t("ai.deleteChatConfirm") || "Delete this conversation? This cannot be undone."
    if (!window.confirm(confirmMsg)) return
    try {
      await deleteChat(id)
      setChats(prev => prev.filter(c => c.id !== id))
      if (activeChatId === id) {
        onNewChat()
      }
    } catch (err) {
      console.error("Failed to delete chat:", err)
    }
  }

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  const handleSaveRename = async (id: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }
    try {
      const updated = await renameChat(id, editTitle.trim())
      setChats(prev => prev.map(c => (c.id === id ? { ...c, title: updated.title } : c)))
    } catch (err) {
      console.error("Failed to rename chat:", err)
    } finally {
      setEditingId(null)
    }
  }

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    const q = searchQuery.toLowerCase()
    return chats.filter(
      c => c.title.toLowerCase().includes(q) || (c.preview && c.preview.toLowerCase().includes(q))
    )
  }, [chats, searchQuery])

  const groupedChats = useMemo(() => {
    const groups: GroupedChats[] = [
      { label: "Today", chats: [] },
      { label: "Yesterday", chats: [] },
      { label: "Previous 7 Days", chats: [] },
      { label: "Previous 30 Days", chats: [] },
      { label: "Older", chats: [] },
    ]

    const now = new Date()
    const sevenDaysAgo = subDays(now, 7)
    const thirtyDaysAgo = subDays(now, 30)

    filteredChats.forEach(chat => {
      const d = new Date(chat.updated_at || chat.created_at || now)
      if (isToday(d)) groups[0].chats.push(chat)
      else if (isYesterday(d)) groups[1].chats.push(chat)
      else if (isAfter(d, sevenDaysAgo)) groups[2].chats.push(chat)
      else if (isAfter(d, thirtyDaysAgo)) groups[3].chats.push(chat)
      else groups[4].chats.push(chat)
    })

    return groups.filter(g => g.chats.length > 0)
  }, [filteredChats])

  if (!isOpen) return null

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden" 
      />

      {/* Sidebar Panel Container */}
      <aside className="fixed inset-y-0 left-0 z-50 md:static w-72 sm:w-80 shrink-0 flex flex-col h-full bg-[#0B0F15] border-r border-slate-800 shadow-2xl md:shadow-none transition-all duration-300">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-[#D2F832]/10 border border-[#D2F832]/30 flex items-center justify-center text-[#D2F832]">
              <History size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {t("ai.previousChats")}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {chats.length} {chats.length === 1 ? "conversation" : "conversations"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Close panel"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat()
              if (window.innerWidth < 768) onClose()
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D2F832] hover:bg-[#c3ea23] active:scale-[0.98] text-black text-xs font-bold shadow-md shadow-[#D2F832]/20 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{t("ai.newChat")}</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t("ai.searchChats")}
              className="w-full h-8 pl-8 pr-7 text-xs rounded-xl bg-[#0E1320] border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#D2F832]/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Grouped Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {loading && chats.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <div className="size-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading conversations...
            </div>
          ) : groupedChats.length === 0 ? (
            <div className="py-12 text-center px-4 space-y-2">
              <MessageSquare size={26} className="mx-auto text-slate-600" />
              <p className="text-xs font-medium text-slate-400">
                {searchQuery ? "No matching chats found" : t("ai.noChats")}
              </p>
              <p className="text-[11px] text-slate-500">
                {searchQuery ? "Try searching for a different keyword" : "Start typing in the chat to begin your first conversation."}
              </p>
            </div>
          ) : (
            groupedChats.map(group => (
              <div key={group.label} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {group.label}
                </div>

                <div className="space-y-1">
                  {group.chats.map(chat => {
                    const isActive = activeChatId === chat.id
                    const isEditing = editingId === chat.id

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          if (!isEditing) {
                            handleSelect(chat)
                            if (window.innerWidth < 768) onClose()
                          }
                        }}
                        className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl text-left cursor-pointer transition-all ${
                          isActive
                            ? "bg-slate-800/80 border border-slate-700 text-white shadow-sm"
                            : "border border-transparent hover:bg-slate-800/40 hover:border-slate-700/50 text-slate-300"
                        }`}
                      >
                        <MessageSquare
                          size={15}
                          className={`shrink-0 mt-0.5 ${isActive ? "text-[#D2F832]" : "text-slate-500 group-hover:text-slate-400"}`}
                        />

                        <div className="flex-1 min-w-0 pr-12">
                          {isEditing ? (
                            <form
                              onSubmit={e => handleSaveRename(chat.id, e)}
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1"
                            >
                              <input
                                autoFocus
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="w-full text-xs bg-slate-900 border border-[#D2F832]/50 rounded px-1.5 py-0.5 text-white focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="size-5 rounded bg-[#D2F832] text-black flex items-center justify-center hover:bg-[#c3ea23]"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="size-5 rounded bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600"
                              >
                                <X size={11} />
                              </button>
                            </form>
                          ) : (
                            <>
                              <p className="text-xs font-semibold truncate leading-tight">
                                {chat.title || "Conversation"}
                              </p>
                              {chat.preview && (
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {chat.preview}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Hover Action Buttons */}
                        {!isEditing && (
                          <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#080D1A]/80 dark:bg-[#070B16]/80 rounded-md px-1">
                            <button
                              onClick={e => handleStartRename(chat, e)}
                              className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors"
                              title="Rename chat"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={e => handleDelete(chat.id, e)}
                              className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete chat"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

      </aside>
    </>
  )
}
