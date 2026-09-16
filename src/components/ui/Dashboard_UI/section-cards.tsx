import React from "react"
import { IconTrendingDown, IconTrendingUp, IconArrowUpRight, IconArrowDownRight, IconWallet } from "@tabler/icons-react"
import { Users, PhoneCall, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/Dashboard_UI/badge"
import { useLanguage } from "@/context/LanguageContext"
import type { AppMode } from "@/context/AppModeContext"

type SectionCardsProps = {
  income:       number
  expense:      number
  balance:      number
  savingsRate:  number
  appMode?:     AppMode
  receivables?: number
  payables?:    number
}

export function SectionCards({
  income,
  expense,
  balance,
  savingsRate,
  appMode = "BUSINESS",
  receivables = 0,
  payables = 0,
}: SectionCardsProps) {
  const { t } = useLanguage()
  const isBusiness = appMode === "BUSINESS"

  return (
    <div className="px-4 lg:px-6 space-y-4">
      {/* ── TOP HERO FINANCIAL HIERARCHY: YOU WILL GET & YOU WILL GIVE ── */}
      {isBusiness ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* YOU WILL GET (Receivables / Dues from customers) */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-white dark:bg-[#0B0F15] p-5 shadow-xs hover:border-emerald-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {t("cards.receivables") || "YOU WILL GET"} • आप लेंगे
                </span>
              </div>
              <Link
                to="/dashboard/khata"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>View Khata</span>
                <IconArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                ₹{receivables.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-emerald-500" />
                <span>Pending from credit customers</span>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                1-Tap WhatsApp Reminder
              </span>
            </div>
          </div>

          {/* YOU WILL GIVE (Payables / Due to suppliers) */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-white dark:bg-[#0B0F15] p-5 shadow-xs hover:border-rose-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-rose-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  YOU WILL GIVE • आप देंगे
                </span>
              </div>
              <Link
                to="/dashboard/transactions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <span>Suppliers</span>
                <IconArrowDownRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">
                ₹{payables.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <IconWallet className="size-3.5 text-rose-500" />
                <span>Supplier / vendor dues</span>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Record Payment
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── SECONDARY METRICS: CASH FLOW, SALES & SPENDING ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Net Working Capital / Balance */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B0F15] p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBusiness ? t("cards.businessBalance") : t("cards.totalBalance")}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              balance >= 0 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}>
              {balance >= 0 ? "+ Live" : "Deficit"}
            </span>
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight mt-2">
            {balance < 0 ? `-₹${Math.abs(balance).toLocaleString("en-IN")}` : `₹${balance.toLocaleString("en-IN")}`}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBusiness ? "Net cash flow after all entries" : "Total available money across wallets"}
          </p>
        </div>

        {/* Total Inflows / Sales */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B0F15] p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBusiness ? t("cards.businessIncome") : t("home.totalIncome")}
            </span>
            <span className="size-2 rounded-full bg-[#D2F832]" />
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight mt-2">
            ₹{income.toLocaleString("en-IN")}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBusiness ? "Total business sales & collections" : "Income received from salary & transfers"}
          </p>
        </div>

        {/* Total Outflows / Operating Expenses */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B0F15] p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBusiness ? t("cards.businessExpenses") : t("home.totalExpenses")}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {isBusiness ? "Outflow" : `${savingsRate}% Saved`}
            </span>
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight mt-2">
            ₹{expense.toLocaleString("en-IN")}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBusiness ? "Stock purchases & operating costs" : "Monthly personal spend & living costs"}
          </p>
        </div>
      </div>
    </div>
  )
}