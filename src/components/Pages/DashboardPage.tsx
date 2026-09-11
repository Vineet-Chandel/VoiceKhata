"use client"

import React from "react"
import { Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/ui/Dashboard_UI/app-sidebar"
import { SiteHeader } from "@/components/ui/Dashboard_UI/site-header"
import { FloatingAssistant } from "@/components/ui/FloatingAssistant/floating-assistant"
import { MobileNav } from "@/components/ui/Dashboard_UI/mobile-nav"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/Dashboard_UI/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "240px",
          "--header-height": "56px",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset className="bg-[#07090E] text-[#F1F5F9] min-h-screen pb-20 md:pb-0">
        <SiteHeader />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </SidebarInset>

      <FloatingAssistant />
      <MobileNav />
    </SidebarProvider>
  )
}