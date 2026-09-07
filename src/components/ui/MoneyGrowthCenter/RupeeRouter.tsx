import { Shuffle } from "lucide-react"

export function RupeeRouter({ router }: { router: any }) {
  if (!router) return null;

  return (
    <div className="bg-surface-secondary/50 border border-border rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Shuffle size={18} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">AI Rupee Router</h2>
          <p className="text-sm text-text-muted">Dynamic allocation of your monthly surplus.</p>
        </div>
      </div>

      <div className="mb-6 bg-surface-elevated/50 border border-border rounded-xl p-4 flex justify-between items-center">
        <span className="text-sm font-medium text-text-secondary">Deployable Surplus</span>
        <span className="text-xl font-bold text-text-primary">₹{router.estimatedDeployableSurplus.toLocaleString("en-IN")}</span>
      </div>

      <div className="flex flex-col gap-3">
        {router.allocations.map((alloc: any, idx: number) => (
          <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-3 bg-surface-elevated border border-border rounded-xl">
            <div className="flex justify-between items-center md:w-1/3 shrink-0">
              <span className="text-sm font-semibold text-text-primary">{alloc.category}</span>
              <span className="text-sm font-bold text-emerald-400">₹{alloc.amount.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-xs text-text-muted md:border-l md:border-border/50 md:pl-4">{alloc.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
