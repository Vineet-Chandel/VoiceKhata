import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/ui/Dashboard_UI/app-sidebar"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">

      <AppSidebar />

      <main className="flex-1 p-6">
        {/* Dashboard Content */}
        Dashboard Home

        {/* Overlay routes render here */}
        <Outlet />
      </main>

    </div>
  )
}