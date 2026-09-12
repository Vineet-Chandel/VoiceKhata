import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/Dashboard_UI/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Dashboard_UI/card"

type SectionCardsProps = {
  income:      number
  expense:     number
  balance:     number
  savingsRate: number   // ← now passed in from metrics engine, no longer computed here
}

export function SectionCards({ income, expense, balance, savingsRate }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">

      {/* BALANCE */}
      <Card className={`@container/card transition-all ${balance < 0 ? "!border-rose-500/30 !bg-gradient-to-t !from-rose-500/10 !to-card shadow-rose-500/5" : ""}`}>
        <CardHeader>
          <CardDescription className={balance < 0 ? "text-rose-400 font-medium" : ""}>
            {balance < 0 ? "Net Deficit" : "Total Balance"}
          </CardDescription>
          <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${balance < 0 ? "text-rose-400" : ""}`}>
            {balance < 0 ? `-₹${Math.abs(balance).toLocaleString("en-IN")}` : `₹${balance.toLocaleString("en-IN")}`}
          </CardTitle>
          <CardAction>
            {balance < 0 ? (
              <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-400 flex items-center gap-1">
                <IconTrendingDown className="size-3.5" />
                Deficit
              </Badge>
            ) : (
              <Badge variant="outline">
                <IconTrendingUp />
                Live
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {balance < 0 ? (
              <span className="text-rose-400">Expenses exceed income</span>
            ) : (
              "Current available balance"
            )}
          </div>
          <div className="text-muted-foreground">
            {balance < 0 ? `Deficit of ₹${Math.abs(balance).toLocaleString("en-IN")}` : "Across all linked accounts"}
          </div>
        </CardFooter>
      </Card>

      {/* EXPENSE */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₹{expense.toLocaleString("en-IN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              Debit
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Spending across transactions
          </div>
          <div className="text-muted-foreground">
            Calculated from debit payments
          </div>
        </CardFooter>
      </Card>

      {/* INCOME */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₹{income.toLocaleString("en-IN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Credit
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Money received
          </div>
          <div className="text-muted-foreground">
            From salary, transfers and income
          </div>
        </CardFooter>
      </Card>

      {/* SAVINGS RATE */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Savings Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {savingsRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Saving
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Percentage of income saved
          </div>
          <div className="text-muted-foreground">
            Calculated from centralized metrics engine
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}