// src/components/hooks/use-notifications.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getNotifications,
    markAsRead as _markAsRead,
    markAllRead as _markAllRead,
    deleteNotification as _delete,
    subscribeToNotifications,
} from '@/lib/notifications';
import type { Notification } from '@/types/notifications';
import { getScopedSupabase, supabase } from '@/lib/supabase';

export function useNotifications(firebase_uid: string | null) {
    const deleteAll = useCallback(async () => {
        if (!firebase_uid) return;
        setNotifications([]);
        await getScopedSupabase(firebase_uid, { force: true });
        await supabase
            .from('notifications')
            .delete()
            .eq('firebase_uid', firebase_uid);
    }, [firebase_uid]);
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<ReturnType<typeof subscribeToNotifications> | null>(null);

    const load = useCallback(async () => {
        if (!firebase_uid) {
            setNotifications([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await getNotifications(firebase_uid);
            setNotifications(data);
        } finally {
            setLoading(false);
        }
    }, [firebase_uid]);

    useEffect(() => {
        if (!firebase_uid) return;
        load();

        // Realtime: new notifications appear instantly in the bell
        channelRef.current = subscribeToNotifications(firebase_uid, (n) => {
            setNotifications((prev) => [n, ...prev]);
        });

        return () => {
            channelRef.current?.unsubscribe();
        };
    }, [firebase_uid, load]);

    const markAsRead = async (id: string) => {
        if (!firebase_uid) return;
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        await _markAsRead(id, firebase_uid);
    };

    const markAllRead = async () => {
        if (!firebase_uid) return;
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        await _markAllRead(firebase_uid);
    };

    const deleteNotif = async (id: string) => {
        if (!firebase_uid) return;
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        await _delete(id, firebase_uid);
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return { notifications, unreadCount, loading, markAsRead, markAllRead, deleteNotif, deleteAll, reload: load };
}
