"use client"

import { useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/Dashboard_UI/separator"
import { SidebarTrigger } from "@/components/ui/Dashboard_UI/sidebar"
import { HeaderUserNav } from "@/components/ui/Dashboard_UI/header-user-nav"
import { useAuth } from "@/components/hooks/use-auth"
import { useChatStore } from "@/components/hooks/use-chat-store"
import { useNavigate } from "react-router-dom"
import { History } from "lucide-react"
import { AppModeToggle } from "@/components/ui/AppModeToggle"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { LanguageToggle } from "@/components/ui/LanguageToggle"
import { useLanguage } from "@/context/LanguageContext"

import { useAppMode } from "@/context/AppModeContext"

export function SiteHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setChatHistoryOpen } = useChatStore()
  const { t } = useLanguage()
  const { appMode } = useAppMode()
  const path = location.pathname

  const isBusiness = appMode === "BUSINESS"

  const routes: Record<string, string> = {
    "/dashboard/settings":      t("nav.settings"),
    "/dashboard/khata":         isBusiness ? t("nav.udhaarBook") : t("nav.khata"),
    "/dashboard/transactions":  isBusiness ? t("nav.transactionHistory") : t("nav.transaction"),
    "/dashboard/budget":        isBusiness ? t("nav.budget") : t("nav.budgetPersonal"),
    "/dashboard/reports":       isBusiness ? t("nav.reportsBusiness") : t("nav.reportsPersonal"),
    "/dashboard/growth":        isBusiness ? t("nav.businessGrowth") : t("nav.moneyGrowth"),
    "/dashboard/ai-assistant":  t("nav.aiAssistant"),
    "/dashboard/voice-capture": isBusiness ? t("nav.addTransactionBusiness") : t("nav.addExpensePersonal"),
    "/dashboard/notifications": t("nav.notifications"),
  }

  let title = t("nav.dashboard")
  for (const route in routes) {
    if (path.includes(route)) {
      title = routes[route]
      break
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#0B0F15]/90 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-30">
      <div className="flex w-full items-center gap-1.5 px-4 lg:gap-2.5 lg:px-6">

        <SidebarTrigger className="-ml-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 transition-colors" />

        <Separator
          orientation="vertical"
          className="mx-1.5 data-[orientation=vertical]:h-4 bg-slate-200 dark:bg-slate-800"
        />

        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#0B0F15] dark:text-white">{title}</h1>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className={`size-1.5 rounded-full ${isBusiness ? "bg-[#D2F832]" : "bg-emerald-400"}`} />
            {isBusiness ? "Vyapar" : "Personal"}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <AppModeToggle />

          {path === "/dashboard/ai-assistant" && (
            <>
              <button
                onClick={() => {
                  setChatHistoryOpen(true)
                }}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
                title={t("header.yourChats")}
              >
                <History className="size-4 text-slate-600 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white hidden sm:block">
                  {t("header.yourChats")}
                </span>
              </button>
              <Separator orientation="vertical" className="h-4 hidden sm:block mx-0.5 bg-slate-200 dark:bg-slate-800" />
            </>
          )}

          <HeaderUserNav />
        </div>

      </div>
    </header>
  )
}