import { ArrowUp, ArrowDown, Activity, ShieldAlert, CreditCard, TrendingUp, Target, Zap } from "lucide-react"

export function FinancialHealth({ health, mode = "PERSONAL" }: { health: any; mode?: "PERSONAL" | "BUSINESS" }) {
  if (!health) return null;
  
  const isImproving = health.trend === 'Improving';
  const TrendIcon = isImproving ? ArrowUp : (health.trend === 'Declining' ? ArrowDown : Activity);
  const isBiz = mode === "BUSINESS";

  return (
    <div className="bg-surface-secondary/30 border border-border rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-text-primary">
              {isBiz ? "Store Financial Health" : "Personal Financial Health"}
            </h2>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${isBiz ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"}`}>
              {isBiz ? "Business Mode" : "Personal Mode"}
            </span>
          </div>
          <p className="text-sm text-text-muted">
            {isBiz 
              ? "Shop solvency, supplier dues buffer, and inventory turnaround health." 
              : "Your real-time financial security based on income, debt, and emergency reserves."}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-elevated px-4 py-2.5 rounded-xl border border-border shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Health Score</span>
            <div className="text-3xl font-bold text-text-primary leading-none mt-1">{health.score}</div>
          </div>
          <div className="w-px h-10 bg-border/50"></div>
          <div className="flex flex-col">
            <div className={`flex items-center gap-1 text-sm font-medium ${isImproving ? 'text-emerald-400' : 'text-rose-400'}`}>
              <TrendIcon size={14} />
              {health.trendValue}
            </div>
            <span className="text-xs text-text-muted mt-0.5">{health.trend}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <HealthMetric label={isBiz ? "Cash Pulse" : "Cash Flow"} value={health.metrics.cashFlow} icon={Zap} />
        <HealthMetric label={isBiz ? "Working Capital" : "Emergency"} value={health.metrics.emergencyFund} icon={ShieldAlert} />
        <HealthMetric label={isBiz ? "Supplier Debt" : "Debt Load"} value={health.metrics.debt} icon={CreditCard} />
        <HealthMetric label={isBiz ? "Restock Capacity" : "Investment"} value={health.metrics.investmentReadiness} icon={TrendingUp} />
      </div>

      <div className="bg-black/20 border-l-4 border-violet-500 rounded-r-xl p-4">
        <div className="flex items-start gap-3">
          <Target className="text-violet-400 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">AI Recommendation</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              <span className="font-medium text-text-primary">Biggest Weakness: {health.biggestWeakness}</span>. {health.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthMetric({ label, value, icon: Icon }: { label: string, value: number, icon: any }) {
  const isHealthy = value > 70;
  const isWarning = value <= 70 && value > 40;
  
  return (
    <div className="bg-surface-elevated/50 border border-border rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2 text-text-muted">
        <Icon size={14} />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${isHealthy ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'}`} 
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-sm font-medium text-text-primary w-6 text-right">{value}</span>
      </div>
    </div>
  )
}
