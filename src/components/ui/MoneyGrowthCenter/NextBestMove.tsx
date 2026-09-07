import { ArrowRight, Lightbulb } from "lucide-react"

export function NextBestMove({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-emerald-500/10 border border-violet-500/20 rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Lightbulb size={120} />
      </div>
      
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-6 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Lightbulb size={12} className="text-violet-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Next Best Move</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          {data.headline}
        </h1>
        <p className="text-lg text-emerald-400 font-medium mb-6">
          {data.subheadline}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Why It Matters</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{data.why}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">The Evidence</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{data.evidence}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400/70 mb-2">Expected Impact</h4>
            <p className="text-sm text-emerald-100/90 leading-relaxed">{data.expectedImpact}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400/70 mb-2">Risk / Alternative</h4>
            <p className="text-sm text-text-secondary leading-relaxed"><span className="text-rose-200/90">{data.risk}</span> — {data.alternative}</p>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          {data.actionText || "Take Action"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
