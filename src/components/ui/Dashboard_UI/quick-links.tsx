import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { PlusCircle, PieChart, Wallet, Mic, ArrowUpRight, Users } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useAppMode } from "@/context/AppModeContext"
import { useTransactions } from "@/components/hooks/use-transactions"

export function QuickLinks() {
  const { t } = useLanguage()
  const { appMode } = useAppMode()
  const { transactions } = useTransactions()

  const totalReceivables = useMemo(() => {
    if (appMode !== "BUSINESS") return 0
    const map = new Map<string, number>()
    transactions.forEach((t) => {
      const party = (t.transaction || "Customer").trim().toLowerCase()
      const current = map.get(party) ?? 0
      if (t.type === "Credit") map.set(party, current - Number(t.amount || 0))
      else map.set(party, current + Number(t.amount || 0))
    })
    let total = 0
    for (const bal of map.values()) {
      if (bal > 0) total += bal
    }
    return total
  }, [transactions, appMode])

  const businessLinks = [
    {
      title: t("nav.aiAssistant"),
      subtitle: t("quicklinks.aiDesc"),
      icon: Mic,
      href: "/dashboard/ai-assistant",
      color: "from-[#D2F832]/20 to-transparent",
      iconColor: "text-[#D2F832]",
      isPrimary: true,
    },
    {
      title: t("nav.transaction"),
      subtitle: t("quicklinks.txDesc"),
      icon: PlusCircle,
      href: "/dashboard/transactions",
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      title: t("quicklinks.khata"),
      subtitle: totalReceivables > 0 
        ? `₹${totalReceivables.toLocaleString("en-IN")} Total Udhaar` 
        : t("quicklinks.khataDesc"),
      icon: Users,
      href: "/dashboard/khata",
      color: "from-rose-500/20 to-rose-500/5",
      iconColor: "text-rose-400",
    },
    {
      title: t("nav.reports"),
      subtitle: t("quicklinks.reportsDesc"),
      icon: PieChart,
      href: "/dashboard/reports",
      color: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
    },
  ]

  const personalLinks = [
    {
      title: t("nav.aiAssistant"),
      subtitle: t("quicklinks.aiDesc"),
      icon: Mic,
      href: "/dashboard/ai-assistant",
      color: "from-[#D2F832]/20 to-transparent",
      iconColor: "text-[#D2F832]",
      isPrimary: true,
    },
    {
      title: t("nav.transaction"),
      subtitle: t("quicklinks.txDesc"),
      icon: PlusCircle,
      href: "/dashboard/transactions",
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      title: t("quicklinks.budgets"),
      subtitle: t("quicklinks.budgetsDesc"),
      icon: Wallet,
      href: "/dashboard/budget",
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
    },
    {
      title: t("nav.reports"),
      subtitle: t("quicklinks.reportsDesc"),
      icon: PieChart,
      href: "/dashboard/reports",
      color: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
    },
  ]

  const links = appMode === "PERSONAL" ? personalLinks : businessLinks

  return (
    <div className="px-4 lg:px-6 mb-4 md:mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        {t("quicklinks.title")}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {links.map((link) => (
          <Link
            key={link.title}
            to={link.href}
            className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B0F15] p-3 transition-all hover:border-slate-400 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs"
          >
            <div className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/80 ${link.iconColor} border border-slate-200/80 dark:border-slate-700 transition-transform duration-200 group-hover:scale-105`}>
              <link.icon className="size-4" />
            </div>
            <div className="relative z-10 flex flex-1 items-center justify-between min-w-0">
              <div className="min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {link.title}
                </h4>
                {link.subtitle && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {link.subtitle}
                  </p>
                )}
              </div>
              <ArrowUpRight className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
