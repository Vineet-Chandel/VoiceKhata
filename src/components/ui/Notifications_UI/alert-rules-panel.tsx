// src/components/ui/Notifications_UI/alert-rules-panel.tsx

import { useState, useEffect } from 'react'
import {
    Plus, Trash2, ToggleLeft, ToggleRight,
    AlertTriangle, ArrowLeftRight, TrendingDown,
    Wallet, Target, ChevronDown, Check,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { AlertRule, AlertCondition } from '@/types/notifications'

interface Props {
    firebase_uid: string
}

const CONDITION_CONFIG: Record<
    AlertCondition,
    {
        label: string
        icon: React.ReactNode
        description: string
        hasThreshold: boolean
        hasCategory: boolean
        iconBg: string
        iconColor: string
    }
> = {
    budget_exceed: {
        label: 'Budget exceeded',
        icon: <AlertTriangle size={13} />,
        description: 'Alert when spending exceeds budget %',
        hasThreshold: true,
        hasCategory: true,
        iconBg: 'bg-red-50 dark:bg-red-950/40',
        iconColor: 'text-red-500 dark:text-red-400',
    },
    large_transaction: {
        label: 'Large transaction',
        icon: <ArrowLeftRight size={13} />,
        description: 'Alert on a single expense above an amount',
        hasThreshold: true,
        hasCategory: false,
        iconBg: 'bg-amber-50 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
    low_balance: {
        label: 'Low balance',
        icon: <TrendingDown size={13} />,
        description: 'Alert when balance drops below an amount',
        hasThreshold: true,
        hasCategory: false,
        iconBg: 'bg-orange-50 dark:bg-orange-950/40',
        iconColor: 'text-orange-500 dark:text-orange-400',
    },
    monthly_summary: {
        label: 'Monthly summary',
        icon: <Wallet size={13} />,
        description: 'Monthly spending digest on the 1st',
        hasThreshold: false,
        hasCategory: false,
        iconBg: 'bg-blue-50 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    goal_progress: {
        label: 'Goal progress',
        icon: <Target size={13} />,
        description: 'Alert on savings goal milestones',
        hasThreshold: false,
        hasCategory: false,
        iconBg: 'bg-green-50 dark:bg-green-950/40',
        iconColor: 'text-green-600 dark:text-green-400',
    },
}

const CONDITIONS = Object.keys(CONDITION_CONFIG) as AlertCondition[]

const BUDGET_CATEGORIES = [
    'All categories',
    'Food', 'Transport', 'Shopping', 'Entertainment',
    'Utilities', 'Health', 'Education', 'Other',
]

// ── Shared trigger button ─────────────────────────────────────────────────
function SelectTrigger({ children }: { children: React.ReactNode }) {
    return (
        <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-muted/30 focus:outline-none focus:border-primary/50 transition-colors">
                {children}
                <ChevronDown size={12} className="ml-auto text-muted-foreground flex-shrink-0" />
            </button>
        </DropdownMenuTrigger>
    )
}

export function AlertRulesPanel({ firebase_uid }: Props) {
    const [rules, setRules]     = useState<AlertRule[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding]   = useState(false)
    const [saving, setSaving]   = useState(false)

    // form
    const [condition, setCondition] = useState<AlertCondition>('budget_exceed')
    const [threshold, setThreshold] = useState('')
    const [category, setCategory]   = useState('')
    const [name, setName]           = useState('')

    // ── Fetch ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!firebase_uid) return
        supabase
            .from('alert_rules')
            .select('*')
            .eq('firebase_uid', firebase_uid)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setRules((data as AlertRule[]) ?? [])
                setLoading(false)
            })
    }, [firebase_uid])

    // ── Add ─────────────────────────────────────────────────────────────────
    async function handleAdd() {
        if (!name.trim()) return
        setSaving(true)
        const cfg = CONDITION_CONFIG[condition]
        const payload = {
            firebase_uid,
            name:       name.trim(),
            condition,
            threshold:  cfg.hasThreshold && threshold ? parseFloat(threshold) : null,
            category:   cfg.hasCategory && category && category !== 'All categories' ? category : null,
            channel:    ['in_app'],
            enabled:    true,
            created_at: new Date().toISOString(),
        }
        const { data, error } = await supabase
            .from('alert_rules')
            .insert(payload)
            .select()
            .single()

        if (!error && data) {
            setRules((prev) => [data as AlertRule, ...prev])
            resetForm()
        }
        setSaving(false)
    }

    // ── Toggle ──────────────────────────────────────────────────────────────
    async function handleToggle(rule: AlertRule) {
        const enabled = !rule.enabled
        setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, enabled } : r))
        await supabase.from('alert_rules').update({ enabled }).eq('id', rule.id)
    }

    // ── Delete ──────────────────────────────────────────────────────────────
    async function handleDelete(id: string) {
        setRules((prev) => prev.filter((r) => r.id !== id))
        await supabase.from('alert_rules').delete().eq('id', id)
    }

    function resetForm() {
        setAdding(false); setName(''); setThreshold(''); setCategory(''); setCondition('budget_exceed')
    }

    const activeCfg = CONDITION_CONFIG[condition]

    return (
        <div className="flex flex-col gap-4">

            {/* ── Rules list ─────────────────────────────────────────────── */}
            {loading ? (
                <div className="flex flex-col gap-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-14 rounded-lg bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : rules.length === 0 && !adding ? (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                    No alert rules yet
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {rules.map((rule) => {
                        const rc = CONDITION_CONFIG[rule.condition]
                        return (
                            <div
                                key={rule.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background"
                            >
                                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', rc?.iconBg, rc?.iconColor)}>
                                    {rc?.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn('text-xs font-medium truncate', rule.enabled ? 'text-foreground' : 'text-muted-foreground')}>
                                        {rule.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {rc?.label}
                                        {rule.threshold != null && ` · ${rule.threshold}`}
                                        {rule.category && ` · ${rule.category}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggle(rule)}
                                        className={cn('transition-colors', rule.enabled ? 'text-primary' : 'text-muted-foreground/40')}
                                        aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
                                    >
                                        {rule.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rule.id)}
                                        className="text-muted-foreground/30 hover:text-red-400 transition-colors p-0.5"
                                        aria-label="Delete rule"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Add rule form ───────────────────────────────────────────── */}
            {adding ? (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/10">
                    <p className="text-xs font-medium text-foreground">New alert rule</p>

                    {/* Name */}
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rule name (e.g. Food budget 90%)"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                    />

                    {/* Condition — Radix DropdownMenu */}
                    <div className="flex flex-col gap-1">
                        <DropdownMenu>
                            <SelectTrigger>
                                <div className={cn('w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0', activeCfg.iconBg, activeCfg.iconColor)}>
                                    {activeCfg.icon}
                                </div>
                                <span className="flex-1 text-left">{activeCfg.label}</span>
                            </SelectTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width]"
                                align="start"
                                sideOffset={4}
                            >
                                {CONDITIONS.map((c) => {
                                    const opt = CONDITION_CONFIG[c]
                                    return (
                                        <DropdownMenuItem
                                            key={c}
                                            onSelect={() => { setCondition(c); setThreshold(''); setCategory('') }}
                                            className="flex items-center gap-2 text-xs cursor-pointer"
                                        >
                                            <div className={cn('w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0', opt.iconBg, opt.iconColor)}>
                                                {opt.icon}
                                            </div>
                                            <span className="flex-1">{opt.label}</span>
                                            {condition === c && <Check size={11} className="text-muted-foreground ml-auto" />}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-[10px] text-muted-foreground px-1">{activeCfg.description}</p>
                    </div>

                    {/* Threshold */}
                    {activeCfg.hasThreshold && (
                        <input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                            placeholder={condition === 'budget_exceed' ? 'Threshold % (e.g. 90)' : 'Amount in ₹'}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                        />
                    )}

                    {/* Category — Radix DropdownMenu */}
                    {activeCfg.hasCategory && (
                        <DropdownMenu>
                            <SelectTrigger>
                                <span className="flex-1 text-left text-foreground">
                                    {category || 'All categories'}
                                </span>
                            </SelectTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width]"
                                align="start"
                                sideOffset={4}
                            >
                                {BUDGET_CATEGORIES.map((cat) => {
                                    const isSelected = cat === 'All categories' ? !category : category === cat
                                    return (
                                        <DropdownMenuItem
                                            key={cat}
                                            onSelect={() => setCategory(cat === 'All categories' ? '' : cat)}
                                            className="flex items-center justify-between text-xs cursor-pointer"
                                        >
                                            {cat}
                                            {isSelected && <Check size={11} className="text-muted-foreground" />}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={handleAdd}
                            disabled={saving || !name.trim()}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 transition-opacity"
                        >
                            <Plus size={12} />
                            {saving ? 'Saving…' : 'Add rule'}
                        </button>
                        <button
                            onClick={resetForm}
                            className="text-xs px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    className="flex items-center justify-center gap-1.5 w-full text-xs py-2.5 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
                >
                    <Plus size={13} />
                    Add alert rule
                </button>
            )}
        </div>
    )
}