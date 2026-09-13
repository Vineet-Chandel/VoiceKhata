import { IconCalendarRepeat, IconTrendingUp, IconTrendingDown, IconClock } from "@tabler/icons-react"
import type { RecurringTransaction } from "@/components/hooks/use-recurring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Dashboard_UI/card"
import { useLanguage } from "@/context/LanguageContext"


interface Props { recurring: RecurringTransaction[] }

export function RecurringOverview({ recurring }: Props) {
    const { t } = useLanguage()
    const active = recurring.filter((r) => r.active)
    const monthly = active.reduce((sum, r) => {
        if (r.type !== "Debit") return sum
        if (r.frequency === "daily") return sum + r.amount * 30
        if (r.frequency === "weekly") return sum + r.amount * 4
        if (r.frequency === "monthly") return sum + r.amount
        if (r.frequency === "yearly") return sum + r.amount / 12
        return sum
    }, 0)
    const income = active.reduce((sum, r) => {
        if (r.type !== "Credit") return sum
        if (r.frequency === "monthly") return sum + r.amount
        if (r.frequency === "yearly") return sum + r.amount / 12
        return sum
    }, 0)
    const upcoming = active.filter((r) => {
        const days = Math.ceil((new Date(r.next_run).getTime() - Date.now()) / 86400000)
        return days <= 7 && days >= 0
    }).length

    const cards = [
        { title: t("tx.activeRules"), value: `${active.length}`, icon: IconCalendarRepeat, sub: `${recurring.length} ${t("tx.total")}` },
        { title: t("tx.monthlyOutflow"), value: `₹${Math.round(monthly).toLocaleString("en-IN")}`, icon: IconTrendingDown, sub: t("tx.estimatedDebitMonth") },
        { title: t("tx.monthlyInflow"), value: `₹${Math.round(income).toLocaleString("en-IN")}`, icon: IconTrendingUp, sub: t("tx.estimatedCreditMonth") },
        { title: t("tx.dueThisWeek"), value: `${upcoming}`, icon: IconClock, sub: t("tx.runningIn7Days") },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 px-4 lg:px-6">
            {cards.map(({ title, value, icon: Icon, sub }) => (
                <Card key={title} className="cursor-pointer hover:bg-muted">
                    <CardHeader className="flex flex-row items-center justify-between pb-0 px-5">
                        <CardTitle className="text-sm font-medium text-muted-foreground dark:text-text-primary">{title}</CardTitle>
                        <Icon className="h-5 w-5 text-muted-foreground dark:text-text-primary" />
                    </CardHeader>
                    <CardContent className="px-5 pb-3">
                        <p className="text-3xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}