"use client"

import React from "react"
import { Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/ui/Dashboard_UI/app-sidebar"
import { SiteHeader } from "@/components/ui/Dashboard_UI/site-header"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/Dashboard_UI/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>

        <SiteHeader />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>

      </SidebarInset>

    </SidebarProvider>
  )
}