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
    }[]
}) {

    const location = useLocation()

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">

                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = location.pathname === item.url

                        return (
                            <SidebarMenuItem key={item.url}>
                                <SidebarMenuButton asChild isActive={isActive} className={`px-3 py-5 text-base transition-all ${isActive ? "bg-sidebar-active/30 backdrop-blur-md border border-sidebar-border/50 text-sidebar-active-foreground hover:bg-sidebar-active/40 shadow-sm" : "hover:bg-sidebar-accent/50"}`}>
                                    <Link to={item.url} className="flex items-center gap-3">
                                        {item.icon && <item.icon className="size-5 shrink-0" />}
                                        <span className="font-medium truncate">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                                    <SidebarMenuBadge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[11px] px-2 py-0.5 rounded-full">
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