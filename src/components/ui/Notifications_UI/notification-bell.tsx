// src/components/ui/Notifications_UI/notification-bell.tsx

import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Trash2, TrendingUp, Info, CreditCard, Activity, Target, Settings } from 'lucide-react';
import { useNotifications } from '@/components/hooks/use-notifications';
import type { Notification } from '@/types/notifications';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
    budget_alert: {
        icon: <Activity size={13} />,
        bg: 'bg-red-50 dark:bg-red-950/40',
        color: 'text-red-600 dark:text-red-400',
    },
    transaction: {
        icon: <CreditCard size={13} />,
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        color: 'text-amber-600 dark:text-amber-400',
    },
    ai_insight: {
        icon: <TrendingUp size={13} />,
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        color: 'text-blue-600 dark:text-blue-400',
    },
    system: {
        icon: <Settings size={13} />,
        bg: 'bg-muted',
        color: 'text-muted-foreground',
    },
    goal: {
        icon: <Target size={13} />,
        bg: 'bg-green-50 dark:bg-green-950/40',
        color: 'text-green-600 dark:text-green-400',
    },
};

const FALLBACK_CONFIG = {
    icon: <Info size={13} />,
    bg: 'bg-muted',
    color: 'text-muted-foreground',
};

interface Props {
    firebase_uid: string;
}

export function NotificationBell({ firebase_uid }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllRead, deleteNotif } =
        useNotifications(firebase_uid);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    // Show all notifications, no scroll — panel expands naturally
    const visible = notifications.slice(0, 8);

    return (
        <div ref={ref} className="relative">
            {/* Bell button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-text-primary text-[9px] font-semibold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none border-2 border-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-11 w-[340px] bg-card border border-border rounded-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold tracking-tight">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-muted"
                                >
                                    <CheckCheck size={11} />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>

                    {/* List — no scroll, expands to fit */}
                    <div className="divide-y divide-border/40">
                        {visible.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                <Bell size={24} className="mx-auto mb-3 opacity-20" />
                                <p className="text-xs">No notifications yet</p>
                            </div>
                        ) : (
                            visible.map((n) => (
                                <NotifItem
                                    key={n.id}
                                    n={n}
                                    onRead={() => markAsRead(n.id)}
                                    onDelete={() => deleteNotif(n.id)}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-border">
                            <a
                                href="/dashboard/notifications"
                                className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                                onClick={() => setOpen(false)}
                            >
                                View all notifications
                                <span className="text-[10px]">→</span>
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotifItem({
    n,
    onRead,
    onDelete,
}: {
    n: Notification;
    onRead: () => void;
    onDelete: () => void;
}) {
    const config = TYPE_CONFIG[n.type] ?? FALLBACK_CONFIG;

    return (
        <div
            className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors group ${
                !n.read ? 'bg-blue-500/[0.03]' : ''
            }`}
            onClick={onRead}
        >
            {/* Icon badge */}
            <div className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${config.bg} ${config.color}`}>
                {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className={`text-xs font-medium leading-snug truncate ${
                        !n.read ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                        {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 mt-px">
                        {timeAgo(n.created_at)}
                    </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {n.message}
                </p>
            </div>

            {/* Right: unread dot + delete */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-0.5">
                {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-red-400 transition-all"
                    aria-label="Delete notification"
                >
                    <Trash2 size={11} />
                </button>
            </div>
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}