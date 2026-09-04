import {
  BudgetCard,
  BudgetHeader,
  IconBox,
  PlaceholderLines,
  BudgetProgress,
} from "@/components/ui/Feature_Section/budget-card"

import { TrendingUp } from "lucide-react"

export default function Budget() {
  return (
    <section className="relative w-full py-4">

      {/* CENTERED CONTAINER (This makes it narrow) */}
      <div className="relative mx-auto max-w-6xl rounded-3xl border border-border bg-gradient-to-br from-[#0A0A0A] to-[#151515] p-12 overflow-hidden">
        {/* Soft glow background */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-surface-secondary/20 blur-3xl" />
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">

          {/* Left Text Side */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface-secondary border border-border px-4 py-1 text-sm text-text-primary">
              🗲 Powerful Automation
            </div>

            <h2 className="text-4xl font-semibold text-text-primary leading-tight">
              Smart Budgets that adapt to you
            </h2>

            <p className="mt-6 text-text-secondary max-w-md">
              Set limits for categories like Food and Entertainment.
              Get alerts before overspending and receive personalized insights.
            </p>

            <ul className="mt-8 space-y-4 text-text-secondary">
              <li>➤ Automated monthly reports</li>
              <li>➤ Custom spending alerts</li>
              <li>➤ Goal tracking & visualization</li>
            </ul>
          </div>

          {/* Right Card */}
          <BudgetCard>
            <BudgetHeader>
              <IconBox>
                <TrendingUp className="size-5 text-text-primary" />
              </IconBox>
              <PlaceholderLines />
            </BudgetHeader>
            <BudgetProgress />
          </BudgetCard>

        </div>
      </div>
    </section>
  )
}