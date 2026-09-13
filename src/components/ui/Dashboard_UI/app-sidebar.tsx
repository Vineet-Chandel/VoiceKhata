// src/components/ui/Dashboard_UI/app-sidebar.tsx
import * as React from "react"
import {
  IconChartPie, IconDashboard, IconWallet,
  IconReport, IconSettings, IconRobot, IconRepeat, IconPigMoney, IconBell, IconFlame, IconMicrophone
} from "@tabler/icons-react"
import { Link } from "react-router-dom"
import { NavMain } from "@/components/ui/Dashboard_UI/nav-main"
import { NavSecondary } from "@/components/ui/Dashboard_UI/nav-secondary"
import { NavUser } from "@/components/ui/Dashboard_UI/nav-user"
import logo from "@/assets/logo_white.png"
import bgImage from "@/assets/image.png"
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/Dashboard_UI/sidebar"
import { useAuth } from "@/components/hooks/use-auth"
import { getUserProfile } from "@/firebase/user"
import { hasCustomAvatar, getAvatarPublicUrl } from "@/lib/avatar"
import { avatarEvents } from "@/lib/avatarEvents"
import { useResolvedAvatar } from "@/components/hooks/use-resolved-avatar"
import { useLanguage } from "@/context/LanguageContext"



// ── Sidebar ───────────────────────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const avatar = useResolvedAvatar()
  const { t } = useLanguage()

  const data = {
    user: {
      name: user?.displayName || "User",
      email: user?.email || "",
      avatar,
    },
    navMain: [
      { title: t("nav.dashboard"),     url: "/dashboard",                icon: IconDashboard },
      { title: t("nav.voiceCapture"),  url: "/dashboard/voice-capture",  icon: IconMicrophone },
      { title: t("nav.transaction"),   url: "/dashboard/transactions",   icon: IconWallet },
      { title: t("nav.budget"),        url: "/dashboard/budget",         icon: IconChartPie },
      { title: t("nav.reports"),       url: "/dashboard/reports",        icon: IconReport },
      { title: t("nav.aiAssistant"),   url: "/dashboard/ai-assistant",   icon: IconRobot },
      { title: t("nav.moneyGrowth"),   url: "/dashboard/growth",         icon: IconFlame },
    ],
  }

  return (
    <Sidebar collapsible="icon" className="relative overflow-hidden" {...props}>
      {/* Premium Gradient Background Image Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.95)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.25,
        }}
      />
      <SidebarHeader className="relative z-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-1.5 cursor-pointer">
              <Link to="/dashboard" className="flex items-center gap-2">
                <img src={logo} className="w-9 h-9" alt="VoiceKhata Logo" />
                <span className="text-xl font-bold">
                  Voice<span className="font-semibold text-text-secondary">Khata</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}