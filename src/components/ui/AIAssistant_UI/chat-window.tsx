// src/components/ui/AIAssistant_UI/chat-window.tsx
"use client"

import * as React from "react"
import { Bot, CheckCircle2, ChevronRight, AlertTriangle, ListChecks, Reply } from "lucide-react"
import type { Message } from "@/components/hooks/use-ai-chat"
import { BulkTransactionCard } from "./bulk-transaction-card"

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n")
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === "") {
      nodes.push(<div key={i} className="h-1" />)
      i++
      continue
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <p key={i} className="font-semibold text-text-primary mt-2 mb-0.5 break-words">
          {parseInline(line.slice(4))}
        </p>
      )
      i++
      continue
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <p key={i} className="font-semibold text-text-primary mt-3 mb-1 break-words">
          {parseInline(line.slice(3))}
        </p>
      )
      i++
      continue
    }

    if (line.startsWith("> ")) {
      nodes.push(
        <div key={i} className="border-l-2 border-border-secondary pl-3 my-1.5 text-text-muted italic text-xs break-words">
          {parseInline(line.slice(2))}
        </div>
      )
      i++
      continue
    }

    if (line.match(/^[-•]\s/)) {
      const bullets: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^[-•]\s/)) {
        bullets.push(
          <li key={i} className="flex gap-2 items-start min-w-0">
            <span className="text-text-muted mt-1 shrink-0 text-[8px]">●</span>
            <span className="break-words min-w-0 flex-1">{parseInline(lines[i].slice(2))}</span>
          </li>
        )
        i++
      }
      nodes.push(
        <ul key={`ul-${i}`} className="flex flex-col gap-1.5 my-1.5 text-sm min-w-0 w-full">{bullets}</ul>
      )
      continue
    }

    if (line.match(/^\d+\.\s/)) {
      const items: React.ReactNode[] = []
      let num = 1
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(
          <li key={i} className="flex gap-2 items-start min-w-0">
            <span className="text-text-secondary font-medium shrink-0 min-w-[1rem] text-xs mt-0.5">{num}.</span>
            <span className="break-words min-w-0 flex-1">{parseInline(lines[i].replace(/^\d+\.\s/, ""))}</span>
          </li>
        )
        i++
        num++
      }
      nodes.push(
        <ol key={`ol-${i}`} className="flex flex-col gap-1.5 my-1.5 text-sm min-w-0 w-full">{items}</ol>
      )
      continue
    }

    if (line.trim().startsWith("|")) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim())
        i++
      }

      if (tableLines.length > 0) {
        // Parse table
        const rows = tableLines.map(l => {
          // Remove leading and trailing pipe
          const content = l.replace(/^\|/, "").replace(/\|$/, "")
          return content.split("|").map(cell => cell.trim())
        })

        // Filter out the separator row (e.g., |---|---|)
        const isSeparator = (row: string[]) => row.every(cell => cell.match(/^[-:]+$/))
        
        let headerRow = rows[0]
        let dataRows = rows.slice(1)
        
        if (dataRows.length > 0 && isSeparator(dataRows[0])) {
          dataRows = dataRows.slice(1)
        }

        nodes.push(
          <div key={`table-${i}`} className="my-3 w-full max-w-full overflow-x-auto rounded-xl border border-border bg-surface-secondary/50">
            <table className="w-full min-w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-surface-elevated text-text-secondary border-b border-border">
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="px-3.5 py-2.5 font-medium whitespace-nowrap">
                      {parseInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2.5 text-text-primary break-words max-w-[260px] min-w-[110px]">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    nodes.push(
      <p key={i} className="text-sm leading-relaxed break-words">{parseInline(line)}</p>
    )
    i++
  }

  return nodes
}

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(<br\s*\/?>|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/gi)
  return parts.map((part, idx) => {
    if (!part) return null
    if (part.match(/^<br\s*\/?>$/i)) {
      return <br key={idx} />
    }
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={idx} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={idx} className="italic text-text-secondary">{part.slice(1, -1)}</em>
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={idx} className="bg-surface-secondary border border-border/40 rounded px-1.5 py-0.5 text-[11px] font-mono text-text-secondary break-all">
          {part.slice(1, -1)}
        </code>
      )
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:underline break-all"
        >
          {linkMatch[1]}
        </a>
      )
    }
    return part
  })
}

export function ChatWindow({
  messages,
  loading,
  userAvatar,
  userInitials = "U",
  onSend,
  onReply,
  onConfirmAll,
  onCancel,
  variant = "dark",
}: {
  messages:      Message[]
  loading:       boolean
  userAvatar?:   string | null
  userInitials?: string
  onSend?:       (msg: string) => void
  onReply?:      (msg: Message) => void
  onConfirmAll?: () => void
  onCancel?:     () => void
  variant?:      "light" | "dark"
}) {
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  return (
    <div
      className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 flex flex-col gap-5 w-full min-w-0"
      style={{ scrollbarWidth: "none" }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"} w-full min-w-0`}
        >
          {/* AI avatar */}
          {m.role === "assistant" && (
            <div className="size-7 rounded-full bg-surface-secondary border border-white/[0.1] flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={13} className="text-text-secondary" />
            </div>
          )}

          <div className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"} max-w-[88%] sm:max-w-[80%] min-w-0 group`}>
            {/* Reply Button (visible on hover) */}
            <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {onReply && (
                <button
                  onClick={() => onReply(m)}
                  className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                  title="Reply to message"
                >
                  <Reply size={14} className={m.role === "user" ? "" : "-scale-x-100"} />
                </button>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl px-4 py-3 text-sm flex flex-col gap-2 min-w-0 max-w-full overflow-hidden break-words ${
                m.role === "user"
                  ? (variant === "light" ? "bg-black/[0.04] border border-black/10 text-black/90 rounded-br-sm" : "bg-white/[0.1] border border-border-secondary text-text-primary rounded-br-sm")
                  : (variant === "light" ? "bg-white border border-black/10 text-black/80 rounded-bl-sm shadow-sm" : "bg-surface-secondary border border-border text-text-secondary rounded-bl-sm")
              }`}
            >
              {/* Quoted Reply */}
              {m.replyTo && (
                <div className={`flex flex-col gap-1 pl-3 pr-4 py-2 border-l-4 rounded-r-md text-xs bg-black/20 ${m.replyTo.role === "user" ? "border-violet-500" : "border-emerald-500"}`}>
                  <span className={`font-semibold ${m.replyTo.role === "user" ? "text-violet-400" : "text-emerald-400"}`}>
                    {m.replyTo.role === "user" ? "You" : "VoiceKhata AI"}
                  </span>
                  <p className="line-clamp-2 text-text-muted break-words">
                    {m.replyTo.content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')} {/* Strip raw markdown links for preview */}
                  </p>
                </div>
              )}

              {m.role === "assistant"
                ? <div className="flex flex-col gap-0.5 w-full min-w-0 overflow-hidden break-words">{renderMarkdown(m.content)}</div>
                : <p className="leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
              }
            </div>
          </div>

          {/* User avatar */}
          {m.role === "user" && (
            <div className="size-7 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-[11px] font-medium text-text-secondary shrink-0 mt-0.5 overflow-hidden">
              {userAvatar
                ? <img src={userAvatar} alt="avatar" className="size-full object-cover" />
                : userInitials
              }
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {loading && (
        <div className="flex gap-2.5 justify-start">
          <div className="size-7 rounded-full bg-surface-secondary border border-white/[0.1] flex items-center justify-center shrink-0">
            <Bot size={13} className="text-text-secondary" />
          </div>
          <div className={`rounded-2xl px-5 py-3.5 text-sm w-fit ${variant === "light" ? "bg-white border border-black/10 shadow-sm rounded-bl-sm" : "bg-surface-secondary border border-border text-text-secondary rounded-bl-sm"}`}>
            <div className="flex gap-1.5 items-center h-5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`size-1.5 rounded-full animate-bounce ${variant === "light" ? "bg-black/30" : "bg-white/30"}`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {onSend && onConfirmAll && onCancel && (
        <BulkTransactionCard 
          onSend={onSend} 
          onConfirmAll={onConfirmAll} 
          onCancel={onCancel} 
        />
      )}

      <div ref={bottomRef} />
    </div>
  )
}