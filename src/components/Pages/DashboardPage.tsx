"use client"

import React from "react"
import { Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/ui/Dashboard_UI/app-sidebar"
import { SiteHeader } from "@/components/ui/Dashboard_UI/site-header"
import { FloatingAssistant } from "@/components/ui/FloatingAssistant/floating-assistant"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/Dashboard_UI/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider
      className="h-screen w-full overflow-hidden pt-2 lg:pt-4"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset className="flex flex-col h-full overflow-hidden ">
        <SiteHeader />

        <div className="flex-1 overflow-y-auto relative z-10 scroll-smooth pt-4 lg:pt-6 mt-[10px]">
          <Outlet />
        </div>
      </SidebarInset>

      <FloatingAssistant />

    </SidebarProvider>
  )
}