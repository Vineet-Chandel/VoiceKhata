// src/components/ui/Dashboard_UI/nav-main.tsx
"use client"

import * as React from "react"
import { useLocation, Link } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Dashboard_UI/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ComponentType<{ className?: string }>
    badge?: string | number
    isVoice?: boolean
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1.5">
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive = location.pathname === item.url
            const isVoice = !!item.isVoice

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`relative flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-100 dark:bg-[#141B2D] text-slate-900 dark:text-white font-semibold shadow-2xs border-l-2 border-[#D2F832]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Link to={item.url} className="flex items-center gap-3 w-full">
                    {item.icon && (
                      <item.icon
                        className={`size-4.5 shrink-0 ${
                          isActive
                            ? "text-slate-900 dark:text-[#D2F832]"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                    )}
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>

                {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                  <SidebarMenuBadge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}