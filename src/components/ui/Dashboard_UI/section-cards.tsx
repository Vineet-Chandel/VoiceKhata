import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/Dashboard_UI/badge"
import {
  Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/Dashboard_UI/card"
import { useLanguage } from "@/context/LanguageContext"
import type { AppMode } from "@/context/AppModeContext"

type SectionCardsProps = {
  income:       number
  expense:      number
  balance:      number
  savingsRate:  number
  appMode?:     AppMode
  receivables?: number
}

export function SectionCards({ income, expense, balance, savingsRate, appMode = "BUSINESS", receivables = 0 }: SectionCardsProps) {
  const { t } = useLanguage()
  const isBusiness = appMode === "BUSINESS"

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">

      {/* BALANCE / NET CASH FLOW */}
      <Card className={`@container/card transition-all ${balance < 0 ? "!border-rose-500/30 !bg-gradient-to-t !from-rose-500/10 !to-card shadow-rose-500/5" : ""}`}>
        <CardHeader>
          <CardDescription className={balance < 0 ? "text-rose-400 font-medium" : ""}>
            {balance < 0 ? t("home.netDeficit") : isBusiness ? t("cards.businessBalance") : t("cards.totalBalance")}
          </CardDescription>
          <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${balance < 0 ? "text-rose-400" : ""}`}>
            {balance < 0 ? `-₹${Math.abs(balance).toLocaleString("en-IN")}` : `₹${balance.toLocaleString("en-IN")}`}
          </CardTitle>
          <CardAction>
            {balance < 0 ? (
              <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-400 flex items-center gap-1">
                <IconTrendingDown className="size-3.5" />
                {t("cards.deficit")}
              </Badge>
            ) : (
              <Badge variant="outline">
                <IconTrendingUp />
                {t("cards.live")}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {balance < 0 ? (
              <span className="text-rose-400">{t("cards.expensesExceedIncome")}</span>
            ) : isBusiness ? (
              t("cards.cashFlowDesc")
            ) : (
              t("cards.currentBalance")
            )}
          </div>
          <div className="text-muted-foreground">
            {balance < 0
              ? `${t("cards.deficitOf")} ₹${Math.abs(balance).toLocaleString("en-IN")}`
              : isBusiness
              ? t("cards.acrossAccounts")
              : t("cards.acrossAccounts")}
          </div>
        </CardFooter>
      </Card>

      {/* EXPENSE / BUSINESS OUTFLOWS */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{isBusiness ? t("cards.businessExpenses") : t("home.totalExpenses")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₹{expense.toLocaleString("en-IN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              {t("tx.debit")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isBusiness ? t("cards.businessDebitDesc") : t("cards.spendingAcross")}
          </div>
          <div className="text-muted-foreground">
            {t("cards.calculatedFromDebit")}
          </div>
        </CardFooter>
      </Card>

      {/* INCOME / SALES & COLLECTIONS */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{isBusiness ? t("cards.businessIncome") : t("home.totalIncome")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₹{income.toLocaleString("en-IN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {t("tx.credit")}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isBusiness ? t("cards.businessCreditDesc") : t("cards.moneyReceived")}
          </div>
          <div className="text-muted-foreground">
            {isBusiness ? t("cards.businessCreditDesc") : t("cards.fromSalary")}
          </div>
        </CardFooter>
      </Card>

      {/* RECEIVABLES (Business) / SAVINGS RATE (Personal) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            {isBusiness ? t("cards.receivables") : t("home.savingsRate")}
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isBusiness ? `₹${receivables.toLocaleString("en-IN")}` : `${savingsRate}%`}
          </CardTitle>
          <CardAction>
            {isBusiness ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="size-3.5 text-rose-400" />
                Khata
              </Badge>
            ) : (
              <Badge variant="outline">
                <IconTrendingUp />
                {t("cards.saving")}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isBusiness ? t("cards.receivablesDesc") : t("cards.percentageSaved")}
          </div>
          <div className="text-muted-foreground">
            {isBusiness ? t("cards.pendingFromCustomers") : t("cards.calculatedFromMetrics")}
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}