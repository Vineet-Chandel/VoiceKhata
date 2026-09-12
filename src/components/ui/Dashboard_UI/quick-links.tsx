import { Link } from "react-router-dom"
import { PlusCircle, PieChart, Wallet, Mic, ArrowUpRight } from "lucide-react"

const links = [
  {
    title: "AI Assistant",
    description: "Ask anything about your finances",
    icon: Mic,
    href: "/dashboard/ai-assistant",
    color: "from-amber-500/30 to-orange-600/10",
    iconColor: "text-amber-500",
    isPrimary: true,
  },
  {
    title: "Transactions",
    description: "Manage your income & expenses",
    icon: PlusCircle,
    href: "/dashboard/transactions",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  {
    title: "Budgets",
    description: "Set and track your limits",
    icon: Wallet,
    href: "/dashboard/budget",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  {
    title: "Reports",
    description: "Deep dive into your analytics",
    icon: PieChart,
    href: "/dashboard/reports",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-500",
  },
]

export function QuickLinks() {
  return (
    <div className="px-4 lg:px-6 mb-4 md:mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {links.map((link) => (
          <Link
            key={link.title}
            to={link.href}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 transition-all ${
              link.isPrimary
                ? "border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "border-border/50 bg-card hover:border-border hover:shadow-sm dark:hover:shadow-none"
            }`}
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            />

            {/* Subtle pulse for primary action */}
            {link.isPrimary && (
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-amber-500/20 animate-pulse pointer-events-none" />
            )}

            <div
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ${link.iconColor} border ${link.isPrimary ? 'border-amber-500/30' : 'border-border/50'} transition-transform duration-300 group-hover:scale-110`}
            >
              <link.icon className="h-4 w-4" />
            </div>

            <div className="relative z-10 flex flex-1 items-center justify-between">
              <h4 className={`font-semibold text-sm ${link.isPrimary ? 'bg-gradient-to-br from-amber-500 to-orange-400 bg-clip-text text-transparent group-hover:from-amber-400 group-hover:to-orange-300 transition-all' : 'text-foreground'}`}>
                {link.title}
              </h4>
              <ArrowUpRight className={`h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${link.isPrimary ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
