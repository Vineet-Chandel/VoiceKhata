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
                <SidebarMenuButton asChild isActive={isActive} className={`px-3 py-5 text-base transition-all ${isActive ? "bg-sidebar-active/30 backdrop-blur-md border border-sidebar-border/50 text-sidebar-active-foreground hover:bg-sidebar-active/40 shadow-sm" : "hover:bg-sidebar-accent/50"}`}>
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="size-5" />
                    <span className="font-medium">{item.title}</span>
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
