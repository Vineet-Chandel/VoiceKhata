import { Store, TrendingUp, AlertTriangle } from "lucide-react"

export function BusinessCommandCenter({ business }: { business: any }) {
  if (!business || !business.isBusinessDetected) return null;

  return (
    <div className="bg-[#111111] border border-blue-500/20 rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Store size={18} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Business Money Command</h2>
          <p className="text-sm text-text-muted">Shopkeeper Intelligence & Cash Pulse</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <BusinessMetric label="Today's Sales" value={business.todaySales} isPositive={true} />
        <BusinessMetric label="Inventory Locked" value={business.inventoryLocked} />
        <BusinessMetric label="Supplier Payments Due" value={business.supplierPaymentsDue} isWarning={true} />
        <BusinessMetric label="Est. Business Surplus" value={business.estimatedBusinessSurplus} isPositive={true} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Business Money Moments</h3>
        {business.businessMoments.map((moment: string, idx: number) => (
          <div key={idx} className="flex gap-3 bg-surface-secondary/50 p-3 rounded-xl border border-border">
            <div className="mt-0.5">
              <TrendingUp size={14} className="text-blue-400" />
            </div>
            <p className="text-sm text-text-secondary">{moment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BusinessMetric({ label, value, isPositive, isWarning }: { label: string, value: number, isPositive?: boolean, isWarning?: boolean }) {
  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-4 flex flex-col justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{label}</span>
      <span className={`text-lg font-bold \${isPositive ? 'text-emerald-400' : (isWarning ? 'text-amber-400' : 'text-text-primary')}`}>
        ₹{value.toLocaleString("en-IN")}
      </span>
    </div>
  )
}
