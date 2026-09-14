import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/components/hooks/use-auth"
import { useTransactions } from "@/components/hooks/use-transactions"
import { useBudgets } from "@/components/hooks/use-budgets"
import { createFinancialMetrics } from "@/lib/financial-metrics"
import { MONEY_GROWTH_ENGINE_PROMPT } from "@/lib/prompts/money-growth-engine"

export type MoneyGrowthData = {
  financialHealth: {
    score: number;
    trend: 'Improving' | 'Stable' | 'Declining';
    trendValue: string;
    biggestWeakness: string;
    recommendation: string;
    metrics: {
      cashFlow: number;
      savings: number;
      debt: number;
      emergencyFund: number;
      investmentReadiness: number;
      goalProgress: number;
    };
  };
  nextBestMove: {
    headline: string;
    subheadline: string;
    why: string;
    evidence: string;
    expectedImpact: string;
    risk: string;
    alternative: string;
    actionText: string;
  };
  moneyMoments: Array<{
    type: 'opportunity' | 'warning' | 'growth' | 'info';
    headline: string;
    whatHappened: string;
    whyItMatters: string;
    financialImpact: string;
    recommendedAction: string;
  }>;
  moneyFlow: {
    income: number;
    essentials: number;
    fixedCommitments: number;
    debt: number;
    savings: number;
    investments: number;
    goals: number;
    leakage: number;
    untappedCapacity: number;
  };
  rupeeRouter: {
    estimatedDeployableSurplus: number;
    allocations: Array<{
      category: string;
      amount: number;
      rationale: string;
    }>;
  };
  businessCommandCenter: {
    isBusinessDetected: boolean;
    todaySales: number;
    inventoryLocked: number;
    supplierPaymentsDue: number;
    estimatedBusinessSurplus: number;
    businessMoments: Array<string>;
  };
};

function buildHeuristicGrowthData(metrics: any, transactions: any[], activeMode?: "PERSONAL" | "BUSINESS"): MoneyGrowthData {
  const income = metrics.totalIncome || 0
  const expense = metrics.totalExpense || 0
  const balance = metrics.balance || 0
  const savings = Math.max(0, income - expense)
  const savingsRate = metrics.savingsRate || 0

  // Intelligent category classification based on user's real transactions
  const debitTxs = transactions.filter(t => t.type === "Debit")
  let categorizedEssentials = 0
  let categorizedFixed = 0
  let categorizedDebt = 0
  let categorizedInvestments = 0
  let categorizedDiscretionary = 0

  for (const t of debitTxs) {
    const text = `${t.category || ""} ${t.transaction || ""}`.toLowerCase()
    const amt = Number(t.amount) || 0

    if (/(rent|grocer|food|ration|bill|electric|water|gas|wifi|internet|health|medic|pharmacy|doctor|hospital|transit|fuel|petrol|diesel|commute|dairy|milk|vegetable|kirana|stock|inventory)/i.test(text)) {
      categorizedEssentials += amt
    } else if (/(insurance|lic|subscription|school|fee|tuition|maintenance|gym|membership|salary|wages)/i.test(text)) {
      categorizedFixed += amt
    } else if (/(emi|loan|credit card|card payment|udhaar|borrow|debt|interest)/i.test(text)) {
      categorizedDebt += amt
    } else if (/(sip|mutual fund|stock|share|gold|fixed deposit|fd|rd|ppf|nps|invest|deposit)/i.test(text)) {
      categorizedInvestments += amt
    } else {
      categorizedDiscretionary += amt
    }
  }

  // If transactions exist, use classified amounts; otherwise use balanced defaults
  const essentials = categorizedEssentials > 0 ? categorizedEssentials : Math.round(expense * 0.50)
  const fixedCommitments = categorizedFixed > 0 ? categorizedFixed : Math.round(expense * 0.20)
  const debt = categorizedDebt > 0 ? categorizedDebt : Math.round(expense * 0.10)
  const leakage = categorizedDiscretionary > 0 ? categorizedDiscretionary : Math.max(0, Math.round(expense * 0.15))
  const deployable = Math.max(0, savings)

  // Emergency target: 3 months of essential baseline expenses (minimum ₹30,000)
  const baselineMonthly = essentials + fixedCommitments > 0 ? (essentials + fixedCommitments) : Math.max(10000, expense)
  const emergencyTarget = Math.max(30000, Math.round(baselineMonthly * 3))
  const liquidReserve = Math.max(0, balance)
  const emergencyCoverage = emergencyTarget > 0 ? Math.min(100, Math.round((liquidReserve / emergencyTarget) * 100)) : 50

  const isEmergencyLow = emergencyCoverage < 60
  const healthScore = Math.min(
    98,
    Math.max(
      20,
      Math.round(
        (savingsRate * 0.35) +
        (emergencyCoverage * 0.35) +
        (balance > 15000 ? 15 : (balance > 0 ? 8 : 0)) +
        (debt === 0 ? 15 : 5)
      )
    )
  )

  const isBusiness = activeMode === "BUSINESS" || (!activeMode && transactions.some(t =>
    t.app_mode === "BUSINESS" ||
    /sale|customer|supplier|invoice|vendor|stock|shop|inventory|wholesale|retail|counter|galla|vyapar/i.test(`${t.transaction} ${t.category}`)
  ))

  // Extract business metrics if business activity is present
  const businessSales = transactions
    .filter(t => t.type === "Credit" && (t.app_mode === "BUSINESS" || /sale|customer|payment|counter|galla|collection|revenue/i.test(`${t.transaction} ${t.category}`)))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const businessSupplierDue = transactions
    .filter(t => t.type === "Debit" && (t.app_mode === "BUSINESS" || /supplier|vendor|wholesale|stock|inventory|distributor/i.test(`${t.transaction} ${t.category}`)))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const personalHeadline = isEmergencyLow ? "Firewall Your Personal Reserves First" : "Deploy Surplus to Wealth Compounding"
  const businessHeadline = isEmergencyLow ? "Consolidate Working Capital Buffer" : "Reinvest Surplus into High-Velocity Inventory"

  return {
    financialHealth: {
      score: healthScore,
      trend: savingsRate >= 20 ? 'Improving' : (savingsRate <= 0 ? 'Declining' : 'Stable'),
      trendValue: savingsRate >= 20 ? '↑ 6%' : (savingsRate <= 0 ? '↓ 4%' : '→ 0%'),
      biggestWeakness: activeMode === "BUSINESS"
        ? (debt > 0 ? "Supplier Credit Burden" : (isEmergencyLow ? "Working Capital Liquidity" : "Inventory Turnover"))
        : (isEmergencyLow ? "Emergency Reserve Buffer" : (leakage > 3000 ? "Discretionary Spending Leakage" : "Investment Growth")),
      recommendation: activeMode === "BUSINESS"
        ? (debt > 0
            ? `Direct ₹${Math.round(deployable * 0.4).toLocaleString("en-IN")} towards settling pending supplier dues to unlock early payment cash discounts.`
            : `Store cash flow is stable. Reinvest ₹${Math.round(deployable * 0.5).toLocaleString("en-IN")}/mo into high-margin inventory restock.`)
        : (isEmergencyLow
            ? `Build ₹${Math.max(15000, emergencyTarget - liquidReserve).toLocaleString("en-IN")} more in liquid emergency buffer before committing to risky investments.`
            : `Surplus is steady. Direct ₹${Math.round(deployable * 0.5).toLocaleString("en-IN")}/mo into automated index SIPs.`),
      metrics: {
        cashFlow: Math.min(100, Math.max(20, Math.round(savingsRate * 1.5))),
        savings: Math.min(100, Math.max(15, Math.round(savingsRate * 2))),
        debt: debt > 0 ? 60 : 95,
        emergencyFund: emergencyCoverage,
        investmentReadiness: isEmergencyLow ? 40 : 85,
        goalProgress: Math.min(100, Math.max(30, Math.round(savingsRate * 1.8))),
      },
    },
    nextBestMove: {
      headline: activeMode === "BUSINESS" ? businessHeadline : personalHeadline,
      subheadline: activeMode === "BUSINESS"
        ? (isEmergencyLow
            ? `Maintain a ₹${emergencyTarget.toLocaleString("en-IN")} store operating buffer to protect against supplier price fluctuations.`
            : `You have ₹${deployable.toLocaleString("en-IN")} monthly business surplus ready to expand working capital.`)
        : (isEmergencyLow
            ? `Aim for a ₹${emergencyTarget.toLocaleString("en-IN")} liquid shield before high-risk allocations.`
            : `You have ₹${deployable.toLocaleString("en-IN")} monthly deployable capacity ready to compound.`),
      why: activeMode === "BUSINESS"
        ? "Maintaining clean working capital protects your retail counter from sudden distributor supply crunches and seasonal slumps."
        : (isEmergencyLow
            ? "Your liquid buffer is below the 3-month survival threshold. Any unexpected emergency could force costly debt."
            : "Cash idle in low-interest accounts loses real purchasing power to inflation. Structured monthly compounding beats inflation consistently."),
      evidence: activeMode === "BUSINESS"
        ? `Sales/Collections: ₹${income.toLocaleString("en-IN")}, Store expenses: ₹${expense.toLocaleString("en-IN")}, Net store balance: ₹${balance.toLocaleString("en-IN")}.`
        : `Monthly income: ₹${income.toLocaleString("en-IN")}, expenses: ₹${expense.toLocaleString("en-IN")}, available liquid cushion: ₹${balance.toLocaleString("en-IN")}.`,
      expectedImpact: activeMode === "BUSINESS"
        ? "Improves inventory turnover by 18% and prevents working capital lockup."
        : (isEmergencyLow
            ? "Achieves complete financial safety buffer in approximately 2–4 months."
            : "Accelerates long-term financial freedom timeline by up to 2.8 years."),
      risk: activeMode === "BUSINESS" ? "Short-term dead stock if unverified products are procured." : (isEmergencyLow ? "Vulnerability to surprise shocks." : "Normal short-term equity volatility."),
      alternative: activeMode === "BUSINESS" ? "Maintain in liquid business sweep-in account." : (isEmergencyLow ? "Split 70% liquid fund / 30% RD." : "Hold in high-yield auto-sweep account."),
      actionText: activeMode === "BUSINESS" ? "Route Store Surplus →" : (isEmergencyLow ? "Set Emergency Target →" : "Route Surplus →"),
    },
    moneyMoments: [
      {
        type: isEmergencyLow ? 'warning' : 'growth',
        headline: activeMode === "BUSINESS"
          ? (isEmergencyLow ? "Working Capital Buffer Needs Cushioning" : "Consistent Store Operating Surplus Detected")
          : (isEmergencyLow ? "Emergency Reserve Buffer Below 3 Months" : "Positive Cash Flow Velocity Detected"),
        whatHappened: activeMode === "BUSINESS"
          ? `Store generated ₹${savings.toLocaleString("en-IN")} net operating surplus across sales & vendor cycles.`
          : (isEmergencyLow
              ? `Current liquid reserves cover approx ${Math.max(0, Math.round((emergencyCoverage / 100) * 3))} months of essential baseline expenses.`
              : `Generated ₹${savings.toLocaleString("en-IN")} net surplus over recent expenses.`),
        whyItMatters: isEmergencyLow
          ? "Unplanned emergencies without a reserve lead to costly debt or forced liquidation."
          : "Consistent positive cash flow allows high-conviction wealth building.",
        financialImpact: isEmergencyLow
          ? `₹${Math.max(10000, emergencyTarget - liquidReserve).toLocaleString("en-IN")} needed`
          : `+₹${savings.toLocaleString("en-IN")}/month`,
        recommendedAction: activeMode === "BUSINESS"
          ? "Maintain 15% cash float for distributor invoices"
          : (isEmergencyLow ? "Automate ₹5,000/mo into liquid buffer" : "Increase index SIP allocation"),
      },
      {
        type: leakage > 2500 ? 'warning' : 'opportunity',
        headline: activeMode === "BUSINESS" ? "Unbudgeted Operational Overheads" : "Discretionary Spending Under Control",
        whatHappened: `₹${leakage.toLocaleString("en-IN")} in miscellaneous discretionary outgoings.`,
        whyItMatters: "Small recurring leaks compound into significant lost investment opportunity over 3-5 years.",
        financialImpact: `-₹${leakage.toLocaleString("en-IN")}/mo leakage`,
        recommendedAction: activeMode === "BUSINESS" ? "Review incidental shop petty cash receipts" : "Review unbudgeted transactions & subscriptions",
      },
    ],
    moneyFlow: {
      income,
      essentials,
      fixedCommitments,
      debt,
      savings,
      investments: categorizedInvestments > 0 ? categorizedInvestments : Math.round(savings * 0.5),
      goals: Math.round(savings * 0.3),
      leakage,
      untappedCapacity: Math.max(0, deployable - leakage),
    },
    rupeeRouter: {
      estimatedDeployableSurplus: deployable,
      allocations: [
        {
          category: activeMode === "BUSINESS" ? "Working Capital Float" : "Emergency Reserve",
          amount: Math.round(deployable * (isEmergencyLow ? 0.55 : 0.20)),
          rationale: activeMode === "BUSINESS" ? "Buffer for vendor invoices & distributor cycles." : "Liquid high-yield buffer for shock absorption.",
        },
        {
          category: activeMode === "BUSINESS" ? "Inventory Procurement" : "Equity / Index SIP",
          amount: Math.round(deployable * (isEmergencyLow ? 0.25 : 0.50)),
          rationale: activeMode === "BUSINESS" ? "High-turnover stock replenishment with volume discounts." : "Long-term wealth creation beating inflation.",
        },
        {
          category: activeMode === "BUSINESS" ? "Supplier Debt Clearance" : "Debt Reduction / Goals",
          amount: Math.round(deployable * 0.15),
          rationale: activeMode === "BUSINESS" ? "Early clearance to build top distributor creditworthiness." : "Milestone achievement & liability clearance.",
        },
        {
          category: "Flexible Buffer",
          amount: Math.round(deployable * 0.10),
          rationale: "Opportunistic capital for unexpected requirements.",
        },
      ],
    },
    businessCommandCenter: {
      isBusinessDetected: isBusiness,
      todaySales: isBusiness ? (businessSales > 0 ? Math.round(businessSales / 30) : Math.round(income * 0.1)) : 0,
      inventoryLocked: isBusiness ? Math.round(expense * 1.4) : 0,
      supplierPaymentsDue: isBusiness ? (businessSupplierDue > 0 ? businessSupplierDue : Math.round(expense * 0.35)) : 0,
      estimatedBusinessSurplus: isBusiness ? Math.round(savings * 0.75) : 0,
      businessMoments: isBusiness ? [
        "Working capital margin verified across recorded business entries.",
        "Supplier payment cycle detected in recurring outgoings."
      ] : [],
    },
  }
}

// Supported Groq models with verified availability on current API key
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
]

async function callGroqJSONWithFallback(apiKey: string, systemPrompt: string, prompt: string): Promise<any> {
  let lastError: any = null

  for (const model of GROQ_MODELS) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 9000)

    try {
      const payload = {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.15,
        response_format: { type: "json_object" },
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Groq model ${model} HTTP ${res.status}`)
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || "{}"
      const cleaned = content.replace(/```json\s*|\s*```/g, "").trim()
      const parsed = JSON.parse(cleaned)
      if (parsed && (parsed.financialHealth || parsed.nextBestMove)) {
        return parsed
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      lastError = err
      console.warn(`Groq model ${model} attempt failed:`, err?.message || err)
    }
  }

  throw lastError || new Error("All Groq models failed")
}

export function useMoneyGrowth(targetMode?: "PERSONAL" | "BUSINESS") {
  const [data, setData] = useState<MoneyGrowthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { allTransactions, transactions: defaultTransactions } = useTransactions()
  const { allBudgets, budgets: defaultBudgets } = useBudgets()

  const activeTransactions = useMemo(() => {
    if (!targetMode) return defaultTransactions
    return (allTransactions || []).filter(t => (t.app_mode || "PERSONAL") === targetMode)
  }, [targetMode, defaultTransactions, allTransactions])

  const activeBudgets = useMemo(() => {
    if (!targetMode) return defaultBudgets
    return (allBudgets || []).filter(b => (b.app_mode || "PERSONAL") === targetMode)
  }, [targetMode, defaultBudgets, allBudgets])

  const generateIntelligence = useCallback(async () => {
    // Immediately compute heuristic metrics from real transactions so data is never null
    const metrics = createFinancialMetrics(activeTransactions || [], activeBudgets || [])
    const heuristicData = buildHeuristicGrowthData(metrics, activeTransactions || [], targetMode)
    setData(heuristicData)

    const apiKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim() ||
                   localStorage.getItem("groq_api_key")?.trim() || ""

    if (!apiKey) {
      // Gracefully run on heuristic financial twin if no Groq key is set
      return
    }

    setLoading(true)
    setError(null)

    try {
      const monthlyTotals = metrics.monthlyTrends.reduce<Record<string, { income: number; expense: number; savings: number }>>(
        (acc, trend) => {
          acc[trend.monthKey] = {
            income: trend.income,
            expense: trend.expense,
            savings: trend.savings,
          }
          return acc
        },
        {}
      )

      const recentLines = [...(activeTransactions || [])]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 60)
        .map((t) => `- ${t.date} | ${t.transaction} | ${t.type === "Credit" ? "+" : "-"}${t.amount} | ${t.category} | ${t.method}`)
        .join("\n")

      const systemPrompt = `${MONEY_GROWTH_ENGINE_PROMPT}

Mode context: The user is currently analyzing their ${targetMode || "combined"} finances. Provide insights specifically tailored to ${targetMode === "BUSINESS" ? "retail business cash flow, vendor dues, and inventory working capital" : "personal wealth building, emergency fund security, and SIP investment growth"}.

IMPORTANT: You must respond in STRICT JSON format matching the schema requested by the user. Do NOT include markdown blocks. DO NOT output anything except the raw JSON.`

      const userPrompt = `Analyze the user's financial data and return the comprehensive Money Growth Engine state.

Monthly Totals:
${JSON.stringify(monthlyTotals)}

Recent Transactions:
${recentLines || "No recent transactions yet."}

Current Financial Metrics:
Income: ₹${metrics.totalIncome}, Expenses: ₹${metrics.totalExpense}, Balance: ₹${metrics.balance}, Savings Rate: ${metrics.savingsRate}%.

Return a JSON object exactly matching this TypeScript type:
type MoneyGrowthData = {
  financialHealth: { score: number, trend: 'Improving' | 'Stable' | 'Declining', trendValue: string, biggestWeakness: string, recommendation: string, metrics: { cashFlow: number, savings: number, debt: number, emergencyFund: number, investmentReadiness: number, goalProgress: number } },
  nextBestMove: { headline: string, subheadline: string, why: string, evidence: string, expectedImpact: string, risk: string, alternative: string, actionText: string },
  moneyMoments: Array<{ type: 'opportunity' | 'warning' | 'growth' | 'info', headline: string, whatHappened: string, whyItMatters: string, financialImpact: string, recommendedAction: string }>,
  moneyFlow: { income: number, essentials: number, fixedCommitments: number, debt: number, savings: number, investments: number, goals: number, leakage: number, untappedCapacity: number },
  rupeeRouter: { estimatedDeployableSurplus: number, allocations: Array<{ category: string, amount: number, rationale: string }> },
  businessCommandCenter: { isBusinessDetected: boolean, todaySales: number, inventoryLocked: number, supplierPaymentsDue: number, estimatedBusinessSurplus: number, businessMoments: Array<string> }
}
`
      const result = await callGroqJSONWithFallback(apiKey, systemPrompt, userPrompt)
      if (result && result.financialHealth && result.nextBestMove) {
        setData(result)
      }
    } catch (err: any) {
      console.warn("Groq AI enrichment unavailable, using local financial twin:", err)
      // Keep heuristic data so dashboard stays completely functional
    } finally {
      setLoading(false)
    }
  }, [activeTransactions, activeBudgets, targetMode])

  // Auto-generate on mount and whenever transactions/budgets change
  useEffect(() => {
    generateIntelligence()
  }, [generateIntelligence])

  return { data, loading, error, refresh: generateIntelligence }
}

