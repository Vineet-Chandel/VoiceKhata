// src/components/ui/Dashboard_UI/app-sidebar.tsx
import * as React from "react"
import {
  IconDashboard, IconUsers, IconArrowsExchange,
  IconReport, IconSettings, IconRobot, IconFlame, IconBell, IconHelpCircle
} from "@tabler/icons-react"
import { Link } from "react-router-dom"
import { NavMain } from "@/components/ui/Dashboard_UI/nav-main"
import { NavSecondary } from "@/components/ui/Dashboard_UI/nav-secondary"
import { NavUser } from "@/components/ui/Dashboard_UI/nav-user"
import logo from "@/assets/logo_white.png"
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/Dashboard_UI/sidebar"
import { useAuth } from "@/components/hooks/use-auth"
import { getUserProfile } from "@/firebase/user"
import { hasCustomAvatar, getAvatarPublicUrl } from "@/lib/avatar"
import { avatarEvents } from "@/lib/avatarEvents"
import logoImg from "@/assets/logo.png"

// ── Hook: resolves avatar with priority + listens for live updates ─────────────
function useResolvedAvatar() {
  const { user } = useAuth()

  const fallback = user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.displayName || user?.email || "U"
    )}&background=3949AB&color=fff`

  const [avatar, setAvatar] = React.useState<string>(fallback)

  const fetchAvatar = React.useCallback(async () => {
    if (!user) return
    try {
      const profile = await getUserProfile()
      if (profile?.profile_pic) {
        setAvatar(`${profile.profile_pic}?t=${Date.now()}`)
        return
      }

      const hasOwn = await hasCustomAvatar(user.uid)
      if (hasOwn) {
        setAvatar(getAvatarPublicUrl(user.uid))
        return
      }

      if (user.photoURL) {
        setAvatar(user.photoURL)
        return
      }

      setAvatar(
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.displayName || user.email || "U"
        )}&background=3949AB&color=fff`
      )
    } catch {
      // Keep whatever is currently shown on failure
    }
  }, [user?.uid, user?.photoURL])

  React.useEffect(() => {
    fetchAvatar()
  }, [fetchAvatar])

  React.useEffect(() => {
    return avatarEvents.on(fetchAvatar)
  }, [fetchAvatar])

  return avatar
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const avatar = useResolvedAvatar()

  const data = {
    user: {
      name: user?.displayName || "Shop Owner",
      email: user?.email || "",
      avatar,
    },
    // Primary Navigation per Section 9
    navMain: [
      { title: "Overview", url: "/dashboard", icon: IconDashboard },
      { title: "Khata", url: "/dashboard/khata", icon: IconUsers },
      { title: "Transactions", url: "/dashboard/transactions", icon: IconArrowsExchange },
      { title: "Reports", url: "/dashboard/reports", icon: IconReport },
      { title: "Growth", url: "/dashboard/growth", icon: IconFlame },
    ],
    // Secondary Navigation per Section 9
    navSecondary: [
      { title: "AI Assistant", url: "/dashboard/ai-assistant", icon: IconRobot },
      { title: "Notifications", url: "/dashboard/notifications", icon: IconBell },
      { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
      { title: "Help", url: "/help", icon: IconHelpCircle },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-[#1E2638] bg-[#0C1019] text-[#F1F5F9]" {...props}>
      <SidebarHeader className="border-b border-[#1E2638] px-4 py-3 bg-[#0C1019]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-0 hover:bg-transparent cursor-pointer">
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <div className="flex items-center justify-center size-8 rounded-[8px] bg-[#1E2337] border border-[#5C6BC0]/30 p-1.5 shadow-sm">
                  <img src={logoImg} alt="VoiceKhata" className="w-full h-full object-contain invert brightness-125" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-[#F1F5F9] tracking-tight leading-tight">
                    Voice<span className="text-[#818CF8]">Khata</span>
                  </span>
                  <span className="text-[10px] font-medium text-[#94A3B8] leading-tight">
                    Zero-Typing Ledger
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 bg-[#0C1019]">
        <NavMain items={data.navMain} />
        <div className="my-2 border-t border-[#1E2638]" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter className="border-t border-[#1E2638] px-3 py-2.5 bg-[#0C1019]">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}