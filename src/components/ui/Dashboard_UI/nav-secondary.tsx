"use client"

import * as React from "react"
import { type Icon } from "@tabler/icons-react"
import { useLocation, Link } from "react-router-dom"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Dashboard_UI/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const location = useLocation()
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`h-9 px-3 rounded-[8px] text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1E2337] text-[#818CF8] font-semibold hover:bg-[#1E2337]/90"
                      : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#161B26]"
                  }`}
                >
                  <Link to={item.url} className="flex items-center gap-2.5">
                    <item.icon className={`size-4.5 ${isActive ? "text-[#818CF8]" : "text-[#64748B]"}`} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
