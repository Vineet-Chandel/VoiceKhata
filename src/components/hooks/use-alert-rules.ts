// src/components/hooks/use-alert-rules.ts

import { useState, useEffect, useCallback } from 'react';
import {
    getAlertRules,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
} from '@/lib/notifications';
import type { AlertRule } from '@/types/notifications';

export function useAlertRules(firebase_uid: string | null) {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!firebase_uid) return;
        const data = await getAlertRules(firebase_uid);
        setRules(data);
        setLoading(false);
    }, [firebase_uid]);

    useEffect(() => { load(); }, [load]);

    const addRule = async (rule: Omit<AlertRule, 'id' | 'created_at'>) => {
        const created = await createAlertRule(rule);
        if (created) setRules((prev) => [...prev, created]);
    };

    const toggleRule = async (id: string, enabled: boolean) => {
        setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
        await updateAlertRule(id, { enabled });
    };

    const removeRule = async (id: string) => {
        setRules((prev) => prev.filter((r) => r.id !== id));
        await deleteAlertRule(id);
    };

    return { rules, loading, addRule, toggleRule, removeRule };
}