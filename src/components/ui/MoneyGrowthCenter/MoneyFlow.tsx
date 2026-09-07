export function MoneyFlow({ flow }: { flow: any }) {
  if (!flow) return null;

  const total = flow.income || 1; // avoid div by 0
  
  const widthPct = (val: number) => Math.max(2, Math.min(100, (val / total) * 100));

  return (
    <div className="bg-surface-secondary/50 border border-border rounded-2xl p-5 md:p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-1">Money Flow Map</h2>
        <p className="text-sm text-text-muted">Understand where your money is being absorbed this month.</p>
      </div>

      <div className="flex flex-col gap-4">
        <FlowBar label="Income" amount={flow.income} color="bg-emerald-500" width="100%" />
        
        <div className="pl-6 border-l-2 border-border ml-3 flex flex-col gap-4">
          <FlowBar label="Essentials" amount={flow.essentials} color="bg-blue-500" width={`\${widthPct(flow.essentials)}%`} />
          <FlowBar label="Fixed Commitments" amount={flow.fixedCommitments} color="bg-indigo-500" width={`\${widthPct(flow.fixedCommitments)}%`} />
          <FlowBar label="Debt" amount={flow.debt} color="bg-amber-500" width={`\${widthPct(flow.debt)}%`} />
          <FlowBar label="Savings & Investments" amount={flow.savings + flow.investments} color="bg-violet-500" width={`\${widthPct(flow.savings + flow.investments)}%`} />
          
          <div className="mt-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Leakage Detected</span>
              <p className="text-sm text-rose-200/80">Uncategorized discretionary spending</p>
            </div>
            <span className="font-medium text-rose-400">₹{flow.leakage.toLocaleString("en-IN")}</span>
          </div>

          <div className="mt-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Untapped Capacity</span>
              <p className="text-sm text-emerald-200/80">Available for future allocation</p>
            </div>
            <span className="font-medium text-emerald-400">₹{flow.untappedCapacity.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowBar({ label, amount, color, width }: { label: string, amount: number, color: string, width: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <span className="text-sm font-semibold text-text-primary">₹{amount.toLocaleString("en-IN")}</span>
      </div>
      <div className="h-2.5 bg-surface-elevated rounded-full overflow-hidden">
        <div className={`h-full rounded-full \${color}`} style={{ width }} />
      </div>
    </div>
  )
}
