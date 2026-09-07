import React, { useEffect } from "react"
import { useMoneyGrowth } from "@/components/hooks/use-money-growth"
import { FinancialHealth } from "@/components/ui/MoneyGrowthCenter/FinancialHealth"
import { NextBestMove } from "@/components/ui/MoneyGrowthCenter/NextBestMove"
import { MoneyMoments } from "@/components/ui/MoneyGrowthCenter/MoneyMoments"
import { MoneyFlow } from "@/components/ui/MoneyGrowthCenter/MoneyFlow"
import { RupeeRouter } from "@/components/ui/MoneyGrowthCenter/RupeeRouter"
import { BusinessCommandCenter } from "@/components/ui/MoneyGrowthCenter/BusinessCommandCenter"
import { CanIAffordThis } from "@/components/ui/MoneyGrowthCenter/CanIAffordThis"
import { WhatIfSimulator } from "@/components/ui/MoneyGrowthCenter/WhatIfSimulator"
import { Loader2, Zap } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function MoneyGrowthCenterPage() {
  const { data, loading, error, refresh } = useMoneyGrowth()
  const navigate = useNavigate()

  useEffect(() => {
    // Attempt to load data if not loaded
    refresh()
  }, [])

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
          <Loader2 size={48} className="animate-spin text-violet-500 relative z-10" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mt-4">Analyzing your Financial Digital Twin...</h2>
        <p className="text-text-muted text-sm text-center max-w-sm">
          Detecting money leaks, evaluating opportunity costs, and calculating your next best move.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-rose-500 bg-rose-500/10 p-4 rounded-full">
          <Zap size={32} />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Intelligence Error</h2>
        <p className="text-text-muted text-sm text-center max-w-sm">{error}</p>
        <button onClick={refresh} className="mt-4 px-6 py-2 bg-surface-elevated border border-border hover:bg-surface-secondary rounded-xl font-medium">
          Try Again
        </button>
      </div>
    )
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Money Growth Center</h1>
          <p className="text-text-secondary text-sm max-w-lg">
            Your living financial model. We continuously figure out what is holding your money back and what you should do next.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/ai-assistant')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-violet-500/20 transition-all"
          >
            Ask AI Assistant
          </button>
        </div>
      </div>

      {/* The Hero Section */}
      <NextBestMove data={data.nextBestMove} />

      {/* The Overview */}
      <FinancialHealth health={data.financialHealth} />

      {/* Business specific logic */}
      {data.businessCommandCenter?.isBusinessDetected && (
        <BusinessCommandCenter business={data.businessCommandCenter} />
      )}

      {/* The Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <MoneyMoments moments={data.moneyMoments} />
          <CanIAffordThis />
        </div>
        <div className="flex flex-col">
          <MoneyFlow flow={data.moneyFlow} />
          <RupeeRouter router={data.rupeeRouter} />
          <WhatIfSimulator />
        </div>
      </div>

      <div className="mt-12 text-center pb-12">
        <p className="text-text-muted text-sm flex items-center justify-center gap-2">
          <Zap size={14} className="text-violet-400" />
          Intelligence powered by VoiceKhata AI
        </p>
      </div>
    </div>
  )
}
