// src/components/ui/Dashboard_UI/app-sidebar.tsx
import * as React from "react"
import {
  IconChartPie, IconDashboard, IconWallet,
  IconReport, IconSettings, IconRobot, IconFlame, IconMicrophone, IconBell
} from "@tabler/icons-react"
import { Link, useLocation } from "react-router-dom"
import { NavMain } from "@/components/ui/Dashboard_UI/nav-main"
import logoImg from "@/assets/logo.png"
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/Dashboard_UI/sidebar"
import { useAuth } from "@/components/hooks/use-auth"
import { useResolvedAvatar } from "@/components/hooks/use-resolved-avatar"
import { useLanguage } from "@/context/LanguageContext"
import { Users, Sparkles, Building2, UserCheck } from "lucide-react"
import { useAppMode } from "@/context/AppModeContext"
import { useTransactions } from "@/components/hooks/use-transactions"

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const avatar = useResolvedAvatar()
  const { t } = useLanguage()
  const { appMode } = useAppMode()
  const { transactions } = useTransactions()
  const location = useLocation()

  // Calculate pending debtor count in business mode for Khata badge
  const pendingDebtorCount = React.useMemo(() => {
    if (appMode === "PERSONAL") return 0
    const map = new Map<string, number>()
    transactions.forEach((t) => {
      const party = (t.transaction || "Customer").trim().toLowerCase()
      const current = map.get(party) ?? 0
      if (t.type === "Credit") map.set(party, current - Number(t.amount || 0))
      else map.set(party, current + Number(t.amount || 0))
    })
    let count = 0
    for (const bal of map.values()) {
      if (bal > 0) count++
    }
    return count
  }, [transactions, appMode])

  const businessNav = [
    { title: t("nav.dashboard"),                url: "/dashboard",               icon: IconDashboard },
    { 
      title: t("nav.udhaarBook"),                url: "/dashboard/khata",         icon: Users,
      badge: pendingDebtorCount > 0 ? pendingDebtorCount : undefined,
    },
    { title: t("nav.addTransactionBusiness"),   url: "/dashboard/voice-capture", icon: IconMicrophone, isVoice: true },
    { title: t("nav.transactionHistory"),       url: "/dashboard/transactions",  icon: IconWallet },
    { title: t("nav.reportsBusiness"),          url: "/dashboard/reports",       icon: IconReport },
    { title: t("nav.businessGrowth"),           url: "/dashboard/growth",        icon: IconFlame },
    { title: t("nav.aiAssistant"),              url: "/dashboard/ai-assistant",  icon: IconRobot },
  ]

  const personalNav = [
    { title: t("nav.dashboard"),                url: "/dashboard",               icon: IconDashboard },
    { title: t("nav.addExpensePersonal"),       url: "/dashboard/voice-capture", icon: IconMicrophone, isVoice: true },
    { title: t("nav.transaction"),              url: "/dashboard/transactions",  icon: IconWallet },
    { title: t("nav.budgetPersonal"),           url: "/dashboard/budget",        icon: IconChartPie },
    { title: t("nav.reportsPersonal"),          url: "/dashboard/reports",       icon: IconReport },
    { title: t("nav.aiAssistant"),              url: "/dashboard/ai-assistant",  icon: IconRobot },
  ]

  const comboNav = [
    { title: t("nav.dashboard"),                url: "/dashboard",               icon: IconDashboard },
    { 
      title: t("nav.khata"),                     url: "/dashboard/khata",         icon: Users,
      badge: pendingDebtorCount > 0 ? pendingDebtorCount : undefined,
    },
    { title: t("nav.voiceCapture"),             url: "/dashboard/voice-capture", icon: IconMicrophone, isVoice: true },
    { title: t("nav.transaction"),              url: "/dashboard/transactions",  icon: IconWallet },
    { title: t("nav.budget"),                   url: "/dashboard/budget",        icon: IconChartPie },
    { title: t("nav.reports"),                  url: "/dashboard/reports",       icon: IconReport },
    { title: t("nav.businessGrowth"),           url: "/dashboard/growth",        icon: IconFlame },
    { title: t("nav.aiAssistant"),              url: "/dashboard/ai-assistant",  icon: IconRobot },
  ]

  const navItems = appMode === "PERSONAL" ? personalNav : appMode === "COMBO" ? comboNav : businessNav

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B0F15] transition-colors" {...props}>
      {/* Sleek Brand Header */}
      <SidebarHeader className="border-b border-slate-100 dark:border-slate-800/80 px-4 py-3.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-0 hover:bg-transparent">
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="relative flex size-8 items-center justify-center rounded-xl bg-[#0B0F15] dark:bg-white text-white dark:text-[#0B0F15] shadow-xs p-1.5 transition-transform group-hover:scale-105">
                  <img src={logoImg} alt="VoiceKhata Logo" className="w-full h-full object-contain invert dark:invert-0 brightness-125" />
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#D2F832] border border-white dark:border-[#0B0F15]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold tracking-tight text-[#0B0F15] dark:text-white leading-none">
                      Voice<span className="text-slate-500 dark:text-[#D2F832]">Khata</span>
                    </span>
                    <span className="size-1.5 rounded-full bg-[#D2F832]" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 tracking-tight uppercase">
                    {appMode === "BUSINESS" ? "Vyapar Khata" : appMode === "PERSONAL" ? "Personal Book" : "Vyapar & Personal"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 py-3">
        <NavMain items={navItems} />
      </SidebarContent>

      {/* Sidebar Footer with Quick Actions */}
      <SidebarFooter className="border-t border-slate-100 dark:border-slate-800/80 p-2.5">
        <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60"
            title={t("nav.settings")}
          >
            <IconSettings className="size-4" />
            <span className="font-medium">{t("nav.settings")}</span>
          </Link>
          <Link
            to="/dashboard/notifications"
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60"
            title={t("nav.notifications")}
          >
            <IconBell className="size-4" />
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}