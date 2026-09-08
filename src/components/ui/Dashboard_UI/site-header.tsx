"use client"

import { useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/Dashboard_UI/separator"
import { SidebarTrigger } from "@/components/ui/Dashboard_UI/sidebar"
import { NotificationBell } from "@/components/ui/Notifications_UI/notification-bell"
import { useAuth } from "@/components/hooks/use-auth"
import { useChatStore } from "@/components/hooks/use-chat-store"
import { useNavigate } from "react-router-dom"
import { History } from "lucide-react"

export function SiteHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setChatHistoryOpen } = useChatStore()
  const path = location.pathname

  const routes: Record<string, string> = {
    "/dashboard/settings":     "Settings",
    "/dashboard/transactions":  "Transaction",
    "/dashboard/budget":       "Budget",
    "/dashboard/reports":      "Reports",
    "/dashboard/ai-assistant": "AI Assistant",
    "/dashboard/notifications":"Notifications",
  }

  let title = "Dashboard"
  for (const route in routes) {
    if (path.includes(route)) {
      title = routes[route]
      break
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">

        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium">{title}</h1>

        <div className="ml-auto flex items-center gap-3">
          {path === "/dashboard/ai-assistant" && (
            <>
              <button
                onClick={() => {
                  setChatHistoryOpen(true)
                }}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-bg-primary/5 dark:hover:bg-surface-secondary transition-colors border border-transparent hover:border-black/10 dark:hover:border-border"
                title="Your Chats"
              >
                <History className="size-4.5 text-black/60 dark:text-text-secondary group-hover:text-black dark:group-hover:text-text-primary transition-colors" />
                <span className="text-[13px] font-medium text-black/70 dark:text-text-secondary group-hover:text-black dark:group-hover:text-text-primary hidden sm:block">
                  Your Chats
                </span>
              </button>
              <Separator orientation="vertical" className="h-4 hidden sm:block mx-1" />
            </>
          )}
          <NotificationBell firebase_uid={user?.uid ?? ''} />
        </div>

      </div>
    </header>
  )
}