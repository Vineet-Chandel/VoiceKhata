import { AlertCircle, TrendingUp, AlertTriangle, Info, ChevronRight } from "lucide-react"

export function MoneyMoments({ moments }: { moments: any[] }) {
  if (!moments || moments.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Money Moments</h2>
        <span className="text-xs text-text-muted bg-surface-secondary px-2 py-1 rounded-full">Continuously updated</span>
      </div>
      <div className="flex flex-col gap-3">
        {moments.map((moment, idx) => (
          <MomentCard key={idx} moment={moment} />
        ))}
      </div>
    </div>
  )
}

function MomentCard({ moment }: { moment: any }) {
  const isOpp = moment.type === 'opportunity'
  const isWarn = moment.type === 'warning'
  const isGrowth = moment.type === 'growth'

  const Icon = isOpp ? AlertCircle : (isWarn ? AlertTriangle : (isGrowth ? TrendingUp : Info))
  
  const iconColor = isOpp ? "text-blue-400" : (isWarn ? "text-rose-400" : (isGrowth ? "text-emerald-400" : "text-violet-400"))
  const bgColor = isOpp ? "bg-blue-500/10" : (isWarn ? "bg-rose-500/10" : (isGrowth ? "bg-emerald-500/10" : "bg-violet-500/10"))

  return (
    <div className="bg-surface-secondary border border-border rounded-xl p-4 flex gap-4 group cursor-pointer hover:border-border-secondary transition-colors">
      <div className={\`size-10 rounded-full \${bgColor} flex items-center justify-center shrink-0\`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-semibold text-text-primary">{moment.headline}</h4>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          {moment.whatHappened}
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-black/20 rounded-lg">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">Why It Matters</span>
            <span className="text-xs text-text-secondary">{moment.whyItMatters}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-0.5">Impact</span>
            <span className={\`text-xs font-medium \${isWarn ? 'text-rose-400' : 'text-emerald-400'}\`}>{moment.financialImpact}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
          <span>AI Action: {moment.recommendedAction}</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  )
}
