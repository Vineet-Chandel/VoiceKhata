import { AppSidebar } from "@/components/ui/Dashboard_UI/app-sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      
      {/* Sidebar */}
      <AppSidebar />    

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}