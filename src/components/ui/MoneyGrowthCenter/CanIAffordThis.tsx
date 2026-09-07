import { useState } from "react"
import { ShieldCheck, Target, ArrowRight } from "lucide-react"

export function CanIAffordThis() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkAffordability = () => {
    if (!query) return;
    setLoading(true)
    setTimeout(() => {
      setResult({
        status: "AFFORDABLE WITH CONDITIONS",
        reason: "You have the cash flow, but making this purchase today reduces your emergency buffer below 2 months. Waiting 45 days is recommended."
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-violet-400" />
        <h2 className="text-lg font-semibold text-text-primary">Can I Afford This?</h2>
      </div>
      <p className="text-sm text-text-muted mb-4">Ask the AI before making a major financial decision.</p>

      <div className="flex gap-3">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. New refrigerator ₹55,000" 
          className="flex-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
        <button 
          onClick={checkAffordability}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
        >
          Evaluate
        </button>
      </div>

      {loading && (
        <div className="mt-4 p-4 rounded-xl border border-border bg-surface-secondary text-sm text-text-secondary animate-pulse">
          Consulting Financial Digital Twin...
        </div>
      )}

      {result && !loading && (
        <div className="mt-4 p-5 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-2">{result.status}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{result.reason}</p>
        </div>
      )}
    </div>
  )
}
