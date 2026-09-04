// src/components/Pages/NotificationsPage.tsx

import { useState } from 'react'
import {
  Bell, CheckCheck, Trash2, BellOff,
  AlertTriangle, ArrowLeftRight, Sparkles, Settings, Target, X
} from 'lucide-react'
import { useNotifications } from '@/components/hooks/use-notifications'
import { useAuth } from '@/components/hooks/use-auth'
import type { Notification } from '@/types/notifications'

// ─── Type config ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
  budget_alert: {
    icon: <AlertTriangle size={14} />,
    label: 'Budget',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  transaction: {
    icon: <ArrowLeftRight size={14} />,
    label: 'Transaction',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  ai_insight: {
    icon: <Sparkles size={14} />,
    label: 'AI Insight',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  system: {
    icon: <Settings size={14} />,
    label: 'System',
    badge: 'bg-muted/60 text-muted-foreground border-border',
  },
  goal: {
    icon: <Target size={14} />,
    label: 'Goal',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
}

const FILTERS = [
  { value: 'all',          label: 'All'         },
  { value: 'unread',       label: 'Unread'      },
  { value: 'budget_alert', label: 'Budget'      },
  { value: 'transaction',  label: 'Transaction' },
  { value: 'ai_insight',   label: 'AI Insight'  },
] as const

type FilterValue = (typeof FILTERS)[number]['value']

// ─── Page ────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { user } = useAuth()
  const firebase_uid = user?.uid ?? ''

  const [filter, setFilter] = useState<FilterValue>('all')

  const {
    notifications, unreadCount, loading,
    markAsRead, markAllRead, deleteNotif, deleteAll,
  } = useNotifications(firebase_uid)

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'all')    return true
    return n.type === filter
  })

  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-4 px-4 md:py-6 lg:px-6 max-w-6xl mx-auto w-full">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading
                ? 'Loading...'
                : unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : "You're all caught up"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAll}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-400 border border-border px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="grid gap-6 grid-cols-1">

          {/* Left: list */}
          <div className="flex flex-col gap-3">

            {/* Filter tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map((f) => {
                const count =
                  f.value === 'all'    ? notifications.length
                  : f.value === 'unread' ? unreadCount
                  : notifications.filter((n) => n.type === f.value).length

                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      filter === f.value
                        ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      filter === f.value
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Notification rows */}
            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[76px] rounded-xl border border-border bg-card animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((n) => (
                  <NotifRow
                    key={n.id}
                    n={n}
                    onRead={() => markAsRead(n.id)}
                    onDelete={() => deleteNotif(n.id)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── NotifRow ────────────────────────────────────────────────────────────────

function NotifRow({
  n, onRead, onDelete,
}: {
  n: Notification
  onRead: () => void
  onDelete: () => void
}) {
  const config = TYPE_CONFIG[n.type]

  return (
    <div
      onClick={onRead}
      className={`group relative flex items-start gap-4 px-4 py-3.5 rounded-xl border cursor-pointer transition-all ${
        !n.read
          ? 'bg-card border-border border-l-2 border-l-primary hover:bg-muted/10'
          : 'bg-card border-border hover:bg-muted/20'
      }`}
    >
      {/* Type icon */}
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${
        config?.badge ?? 'bg-muted/40 text-muted-foreground border-border'
      }`}>
        {config?.icon ?? <Bell size={14} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-sm font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
            {n.title}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${
            config?.badge ?? 'bg-muted/40 text-muted-foreground border-border'
          }`}>
            {config?.label ?? n.type}
          </span>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
        <p className="text-xs text-muted-foreground/40 mt-1.5">
          {new Date(n.created_at).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterValue }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border">
      <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border flex items-center justify-center mb-4">
        <BellOff size={20} className="text-muted-foreground/30" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
      </p>
      <p className="text-xs text-muted-foreground/50 mt-1">
        {filter === 'unread'
          ? 'Switch to "All" to see past activity.'
          : "We'll notify you when something happens."}
      </p>
    </div>
  )
}
