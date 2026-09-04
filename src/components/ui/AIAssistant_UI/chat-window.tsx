// src/components/ui/AIAssistant_UI/chat-window.tsx
"use client"

import * as React from "react"
import { Bot } from "lucide-react"
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
        <p key={i} className="font-semibold text-text-primary mt-2 mb-0.5">
          {parseInline(line.slice(4))}
        </p>
      )
      i++
      continue
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <p key={i} className="font-semibold text-text-primary mt-3 mb-1">
          {parseInline(line.slice(3))}
        </p>
      )
      i++
      continue
    }

    if (line.startsWith("> ")) {
      nodes.push(
        <div key={i} className="border-l-2 border-border-secondary pl-3 my-1.5 text-text-muted italic text-xs">
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
          <li key={i} className="flex gap-2 items-start">
            <span className="text-text-muted mt-1 shrink-0 text-[8px]">●</span>
            <span>{parseInline(lines[i].slice(2))}</span>
          </li>
        )
        i++
      }
      nodes.push(
        <ul key={`ul-${i}`} className="flex flex-col gap-1.5 my-1.5 text-sm">{bullets}</ul>
      )
      continue
    }

    if (line.match(/^\d+\.\s/)) {
      const items: React.ReactNode[] = []
      let num = 1
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(
          <li key={i} className="flex gap-2 items-start">
            <span className="text-text-secondary font-medium shrink-0 min-w-[1rem] text-xs mt-0.5">{num}.</span>
            <span>{parseInline(lines[i].replace(/^\d+\.\s/, ""))}</span>
          </li>
        )
        i++
        num++
      }
      nodes.push(
        <ol key={`ol-${i}`} className="flex flex-col gap-1.5 my-1.5 text-sm">{items}</ol>
      )
      continue
    }

    nodes.push(
      <p key={i} className="text-sm leading-relaxed">{parseInline(line)}</p>
    )
    i++
  }

  return nodes
}

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={idx} className="font-medium text-text-primary">{part.slice(2, -2)}</strong>
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={idx} className="italic text-text-secondary">{part.slice(1, -1)}</em>
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={idx} className="bg-surface-secondary rounded px-1.5 py-0.5 text-[11px] font-mono text-text-secondary">
          {part.slice(1, -1)}
        </code>
      )
    return part
  })
}

export function ChatWindow({
  messages,
  loading,
  userAvatar,
  userInitials = "U",
  onSend,
  onConfirmAll,
  onCancel,
}: {
  messages:      Message[]
  loading:       boolean
  userAvatar?:   string | null
  userInitials?: string
  onSend?:       (msg: string) => void
  onConfirmAll?: () => void
  onCancel?:     () => void
}) {
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  return (
    <div
      className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 flex flex-col gap-5"
      style={{ scrollbarWidth: "none" }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {/* AI avatar */}
          {m.role === "assistant" && (
            <div className="size-7 rounded-full bg-surface-secondary border border-white/[0.1] flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={13} className="text-text-secondary" />
            </div>
          )}

          {/* Bubble */}
          <div
            className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
              m.role === "user"
                ? "bg-white/[0.1] border border-border-secondary text-text-primary rounded-br-sm"
                : "bg-surface-secondary border border-border text-text-secondary rounded-bl-sm"
            }`}
          >
            {m.role === "assistant"
              ? <div className="flex flex-col gap-0.5">{renderMarkdown(m.content)}</div>
              : <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
            }
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
          <div className="bg-surface-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3.5 flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-white/30 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
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