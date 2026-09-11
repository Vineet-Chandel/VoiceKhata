"use client"

import { useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/Dashboard_UI/separator"
import { SidebarTrigger } from "@/components/ui/Dashboard_UI/sidebar"
import { NotificationBell } from "@/components/ui/Notifications_UI/notification-bell"
import { useAuth } from "@/components/hooks/use-auth"
import { useChatStore } from "@/components/hooks/use-chat-store"
import { History } from "lucide-react"

export function SiteHeader() {
  const location = useLocation()
  const { user } = useAuth()
  const { setChatHistoryOpen } = useChatStore()
  const path = location.pathname

  const routes: Record<string, string> = {
    "/dashboard/khata":         "Khata",
    "/dashboard/growth":        "Money Growth",
    "/dashboard/transactions":  "Transactions",
    "/dashboard/budget":        "Budget",
    "/dashboard/reports":       "Reports",
    "/dashboard/ai-assistant":  "AI Assistant",
    "/dashboard/settings":      "Settings",
    "/dashboard/notifications": "Notifications",
  }

  let title = "Overview"
  for (const route in routes) {
    if (path === route || path.startsWith(route + "/")) {
      title = routes[route]
      break
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#1E2638] bg-[#0C1019] text-[#F1F5F9] transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">

        <SidebarTrigger className="-ml-1 text-[#94A3B8] hover:text-[#F1F5F9]" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 bg-[#1E2638]"
        />

        <h1 className="text-sm sm:text-base font-semibold text-[#F1F5F9]">{title}</h1>

        <div className="ml-auto flex items-center gap-3">
          {path === "/dashboard/ai-assistant" && (
            <>
              <button
                onClick={() => {
                  setChatHistoryOpen(true)
                }}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#161B26] transition-colors border border-[#1E2638]"
                title="Your Chats"
              >
                <History className="size-4 text-[#94A3B8] group-hover:text-[#F1F5F9]" />
                <span className="text-xs font-medium text-[#94A3B8] group-hover:text-[#F1F5F9] hidden sm:block">
                  Your Chats
                </span>
              </button>
              <Separator orientation="vertical" className="h-4 hidden sm:block mx-1 bg-[#1E2638]" />
            </>
          )}
          <NotificationBell firebase_uid={user?.uid ?? ''} />
        </div>

      </div>
    </header>
  )
}