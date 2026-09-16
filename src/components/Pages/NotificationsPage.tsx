// src/components/Pages/NotificationsPage.tsx

import { useState } from 'react'
import {
  Bell, CheckCheck, Trash2, BellOff,
  AlertTriangle, ArrowLeftRight, Sparkles, Settings, Target, X
} from 'lucide-react'
import { useNotifications } from '@/components/hooks/use-notifications'
import { useAuth } from '@/components/hooks/use-auth'
import type { Notification } from '@/types/notifications'
import { useLanguage } from '@/context/LanguageContext'

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
  const { t, language } = useLanguage()
  const [filter, setFilter] = useState<FilterValue>('all')

  const {
    notifications, unreadCount, loading,
    markAsRead, markAllRead, deleteNotif, deleteAll,
  } = useNotifications(firebase_uid)

  const FILTERS_TRANSLATED = [
    { value: 'all',          label: t('notif.all')         },
    { value: 'unread',       label: t('notif.unread')      },
    { value: 'budget_alert', label: t('notif.budget')      },
    { value: 'transaction',  label: t('notif.transaction') },
    { value: 'ai_insight',   label: t('notif.aiInsight')   },
  ] as const

  const TYPE_CONFIG_T: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
    budget_alert: { icon: <AlertTriangle size={14} />, label: t('notif.budget'), badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
    transaction:  { icon: <ArrowLeftRight size={14} />, label: t('notif.transaction'), badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    ai_insight:   { icon: <Sparkles size={14} />, label: t('notif.aiInsight'), badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    system:       { icon: <Settings size={14} />, label: t('notif.system'), badge: 'bg-muted/60 text-muted-foreground border-border' },
    goal:         { icon: <Target size={14} />, label: t('notif.goal'), badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  }

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
            <h1 className="text-2xl font-semibold tracking-tight">{t('notif.title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading
                ? t('common.loading')
                : unreadCount > 0
                ? `${unreadCount} ${t('notif.unread')}`
                : (language === 'hi' ? 'सब कुछ पढ़ लिया गया है' : "You're all caught up")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCheck size={14} />
                {t('notif.markAllRead')}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAll}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-400 border border-border px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                {t('notif.clearAll')}
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
              {FILTERS_TRANSLATED.map((f) => {
                const count =
                  f.value === 'all'    ? notifications.length
                  : f.value === 'unread' ? unreadCount
                  : notifications.filter((n) => n.type === f.value).length

                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as FilterValue)}
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
                    typeConfig={TYPE_CONFIG_T}
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
  n, onRead, onDelete, typeConfig,
}: {
  n: Notification
  onRead: () => void
  onDelete: () => void
  typeConfig: Record<string, { icon: React.ReactNode; label: string; badge: string }>
}) {
  const config = typeConfig[n.type]

  return (
    <div
      onClick={onRead}
      className={`group relative flex items-start gap-4 px-4 py-3.5 rounded-2xl border cursor-pointer transition-all ${
        !n.read
          ? 'bg-card border-border border-l-2 border-l-[#D2F832] shadow-sm hover:bg-surface-elevated'
          : 'bg-card/70 border-border/70 hover:bg-surface-elevated'
      }`}
    >
      {/* Type icon */}
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center ${
        config?.badge ?? 'bg-muted/40 text-muted-foreground border-border'
      }`}>
        {config?.icon ?? <Bell size={14} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-sm font-semibold ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
            {n.title}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
            config?.badge ?? 'bg-muted/40 text-muted-foreground border-border'
          }`}>
            {config?.label ?? n.type}
          </span>
          {!n.read && <span className="size-1.5 rounded-full bg-[#D2F832] shadow-[0_0_6px_#D2F832] flex-shrink-0" />}
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
  const { t, language } = useLanguage()
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border">
      <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border flex items-center justify-center mb-4">
        <BellOff size={20} className="text-muted-foreground/30" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {filter === 'unread'
          ? (language === 'hi' ? 'कोई अपठित सूचना नहीं' : 'No unread notifications')
          : t('notif.noNotifications')}
      </p>
      <p className="text-xs text-muted-foreground/50 mt-1">
        {filter === 'unread'
          ? (language === 'hi' ? '"सभी" में जाकर पुरानी गतिविधि देखें।' : 'Switch to "All" to see past activity.')
          : (language === 'hi' ? 'जब कुछ होगा तो हम आपको सूचित करेंगे।' : "We'll notify you when something happens.")}
      </p>
    </div>
  )
}
