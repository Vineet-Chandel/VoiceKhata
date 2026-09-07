import { Sliders, GitBranch } from "lucide-react"

export function WhatIfSimulator() {
  return (
    <div className="bg-surface-secondary/30 border border-border rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Sliders size={18} className="text-emerald-400" />
        <h2 className="text-lg font-semibold text-text-primary">What-If Simulator</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <PathCard 
          title="Current Path" 
          subtitle="Keep things as they are" 
          impact="Emergency reserve in 8 mos" 
          risk="Moderate"
          color="border-border"
        />
        <PathCard 
          title="Safe Path" 
          subtitle="Reduce discretionary by ₹3k" 
          impact="Emergency reserve in 5 mos" 
          risk="Low"
          color="border-emerald-500/50 bg-emerald-500/5"
        />
        <PathCard 
          title="Growth Path" 
          subtitle="Increase SIP by ₹5k" 
          impact="Wealth target in 4 years" 
          risk="High volatility"
          color="border-violet-500/50 bg-violet-500/5"
        />
      </div>
      <button className="w-full py-3 bg-surface-elevated hover:bg-surface-secondary border border-border rounded-xl text-sm font-medium transition-colors">
        Run New Scenario
      </button>
    </div>
  )
}

function PathCard({ title, subtitle, impact, risk, color }: any) {
  return (
    <div className={\`p-4 rounded-xl border \${color} flex flex-col h-full\`}>
      <h3 className="text-sm font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-muted mb-4">{subtitle}</p>
      
      <div className="mt-auto flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted">Impact</span>
          <span className="font-medium text-emerald-400">{impact}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted">Risk</span>
          <span className="font-medium text-text-secondary">{risk}</span>
        </div>
      </div>
    </div>
  )
}
