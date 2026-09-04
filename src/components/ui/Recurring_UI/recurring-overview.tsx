import { IconCalendarRepeat, IconTrendingUp, IconTrendingDown, IconClock } from "@tabler/icons-react"
import type { RecurringTransaction } from "@/components/hooks/use-recurring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Dashboard_UI/card"


interface Props { recurring: RecurringTransaction[] }

export function RecurringOverview({ recurring }: Props) {
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
        { title: "Active Rules", value: `${active.length}`, icon: IconCalendarRepeat, sub: `${recurring.length} total` },
        { title: "Monthly Outflow", value: `₹${Math.round(monthly).toLocaleString("en-IN")}`, icon: IconTrendingDown, sub: "Estimated debit / month" },
        { title: "Monthly Inflow", value: `₹${Math.round(income).toLocaleString("en-IN")}`, icon: IconTrendingUp, sub: "Estimated credit / month" },
        { title: "Due This Week", value: `${upcoming}`, icon: IconClock, sub: "Transactions running in 7 days" },
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