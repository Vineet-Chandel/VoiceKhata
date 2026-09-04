"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { fetchChats, renameChat, deleteChat, fetchChatMessages, type ChatSession } from "@/lib/api-chat"
import type { Message } from "@/components/hooks/use-ai-chat"
import { Search, MoreHorizontal, MessageSquare, Trash2, Edit2, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { isToday, isYesterday, subDays, isAfter } from "date-fns"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelectChat: (chatId: string, messages: Message[]) => void
  onNewChat: () => void
}

type GroupedChats = {
  label: string
  chats: ChatSession[]
}

export function ChatHistoryModal({ isOpen, onClose, onSelectChat, onNewChat }: Props) {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadChats()
    } else {
      setSearchQuery("")
    }
  }, [isOpen])

  const loadChats = async () => {
    setLoading(true)
    try {
      const res = await fetchChats(1, 100) // load up to 100 recent
      setChats(res.data)
    } catch (err) {
      console.error("Failed to load chats:", err)
    } finally {
      setLoading(false)
    }
  }

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
    if (!confirm("Delete this conversation? This cannot be undone.")) return
    try {
      await deleteChat(id)
      setChats(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error("Failed to delete chat:", err)
    }
  }

  const handleRename = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      setEditingId(null)
      return
    }
    try {
      const updated = await renameChat(id, newTitle)
      setChats(prev => prev.map(c => c.id === id ? { ...c, title: updated.title } : c))
    } catch (err) {
      console.error("Failed to rename chat:", err)
    } finally {
      setEditingId(null)
    }
  }

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    const q = searchQuery.toLowerCase()
    return chats.filter(c => 
      c.title.toLowerCase().includes(q) || 
      (c.preview && c.preview.toLowerCase().includes(q))
    )
  }, [chats, searchQuery])

  const groupedChats = useMemo(() => {
    const groups: GroupedChats[] = [
      { label: "Today", chats: [] },
      { label: "Yesterday", chats: [] },
      { label: "Previous 7 Days", chats: [] },
      { label: "Previous 30 Days", chats: [] },
      { label: "Older", chats: [] }
    ]

    const now = new Date()
    const sevenDaysAgo = subDays(now, 7)
    const thirtyDaysAgo = subDays(now, 30)

    filteredChats.forEach(chat => {
      const d = new Date(chat.updated_at)
      if (isToday(d)) groups[0].chats.push(chat)
      else if (isYesterday(d)) groups[1].chats.push(chat)
      else if (isAfter(d, sevenDaysAgo)) groups[2].chats.push(chat)
      else if (isAfter(d, thirtyDaysAgo)) groups[3].chats.push(chat)
      else groups[4].chats.push(chat)
    })

    return groups.filter(g => g.chats.length > 0)
  }, [filteredChats])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] md:max-w-4xl h-[90vh] p-0 bg-bg-primary border border-border text-text-primary rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-border bg-bg-primary z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <DialogTitle className="text-xl font-medium">Your Chats</DialogTitle>
              <p className="text-sm text-text-secondary mt-1">Access and manage your previous conversations</p>
            </div>
            {/* Native Dialog close handles X button usually, but we keep it clean */}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted size-4" />
            <input 
              type="text" 
              placeholder="Search your chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/[0.1] rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-secondary transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-2 pb-8">
          {loading ? (
            <div className="space-y-6 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="px-2">
                  <div className="w-16 h-3 bg-surface-secondary rounded mb-3 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-20 bg-surface border border-border rounded-xl animate-pulse" />
                    <div className="h-20 bg-surface border border-border rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center mt-12 mb-12">
              <MessageSquare className="size-10 text-text-muted mb-4" />
              <h3 className="text-base font-medium text-text-primary mb-1">No conversations yet</h3>
              <p className="text-sm text-text-secondary max-w-sm">
                Your conversations will appear here once you start chatting.
              </p>
              <button 
                onClick={onNewChat}
                className="mt-6 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            <div className="space-y-8 mt-4">
              {groupedChats.map(group => (
                <div key={group.label}>
                  <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">
                    {group.label}
                  </h3>
                  <div className="space-y-2">
                    {group.chats.map(chat => (
                      <div 
                        key={chat.id}
                        onClick={() => handleSelect(chat)}
                        className="group relative bg-surface border border-transparent hover:border-border hover:bg-surface-secondary p-4 rounded-xl cursor-pointer transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-4">
                            {editingId === chat.id ? (
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <input
                                  autoFocus
                                  value={editTitle}
                                  onChange={e => setEditTitle(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") handleRename(chat.id, editTitle)
                                    if (e.key === "Escape") setEditingId(null)
                                  }}
                                  className="bg-bg-primary border border-border-secondary rounded px-2 py-1 text-sm text-text-primary w-full max-w-[200px]"
                                />
                                <button 
                                  onClick={() => handleRename(chat.id, editTitle)}
                                  className="text-xs bg-white text-black px-2 py-1 rounded"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingId(null)}
                                  className="text-xs text-text-secondary hover:text-text-primary"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <h4 className="text-[15px] font-medium text-text-primary truncate mb-1">
                                {chat.title}
                              </h4>
                            )}
                            <p className="text-sm text-text-muted truncate">
                              {chat.preview || "Empty conversation"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-text-muted whitespace-nowrap hidden sm:inline-block">
                              {chat.message_count} messages
                            </span>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100">
                                  <MoreHorizontal className="size-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36 bg-surface border-white/[0.1] text-text-primary">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditTitle(chat.title)
                                    setEditingId(chat.id)
                                  }}
                                  className="hover:bg-surface-secondary cursor-pointer focus:bg-surface-secondary"
                                >
                                  <Edit2 className="size-3.5 mr-2" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => handleDelete(chat.id, e)}
                                  className="text-red-400 hover:bg-red-400/10 hover:text-red-300 cursor-pointer focus:bg-red-400/10 focus:text-red-300"
                                >
                                  <Trash2 className="size-3.5 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
