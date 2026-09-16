"use client"

import React from "react"
import { Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/ui/Dashboard_UI/app-sidebar"
import { SiteHeader } from "@/components/ui/Dashboard_UI/site-header"
import { FloatingAssistant } from "@/components/ui/FloatingAssistant/floating-assistant"
import { MobileBottomNav } from "@/components/ui/Dashboard_UI/mobile-bottom-nav"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/Dashboard_UI/sidebar"

export default function DashboardPage() {
  const location = useLocation()
  const isAIPage = location.pathname.includes("/ai-assistant")

  return (
    <SidebarProvider
      className="h-screen w-full overflow-hidden bg-background text-foreground"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset className="flex flex-col h-full overflow-hidden bg-background">
        <SiteHeader />

        <div className={`flex-1 overflow-y-auto relative z-10 scroll-smooth ${isAIPage ? "" : "pt-2 lg:pt-4 pb-24 md:pb-28 lg:pb-32"}`}>
          <Outlet />
        </div>
      </SidebarInset>

      <FloatingAssistant />
      <MobileBottomNav />

    </SidebarProvider>
  )
}