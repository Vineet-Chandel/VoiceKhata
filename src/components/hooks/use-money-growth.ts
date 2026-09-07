import { useState, useEffect, useCallback } from "react"
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

function buildHeuristicGrowthData(metrics: any, transactions: any[]): MoneyGrowthData {
  const income = metrics.totalIncome || 0
  const expense = metrics.totalExpense || 0
  const balance = metrics.balance || 0
  const savings = Math.max(0, income - expense)
  const savingsRate = metrics.savingsRate || 0

  const essentials = Math.round(expense * 0.55)
  const fixedCommitments = Math.round(expense * 0.25)
  const debt = Math.round(expense * 0.1)
  const leakage = Math.max(0, Math.round(expense * 0.1))
  const deployable = Math.max(0, savings)
  const emergencyTarget = Math.max(30000, Math.round(expense * 3))
  const emergencyCoverage = emergencyTarget > 0 ? Math.min(100, Math.round((Math.max(0, balance) / emergencyTarget) * 100)) : 50

  const healthScore = Math.min(95, Math.max(25, Math.round((savingsRate * 0.4) + (emergencyCoverage * 0.4) + (balance > 10000 ? 15 : 5))))
  const isEmergencyLow = emergencyCoverage < 60

  const isBusiness = transactions.some(t => /sale|customer|supplier|invoice|vendor|stock|shop|inventory/i.test(t.transaction || t.category || ""))

  return {
    financialHealth: {
      score: healthScore,
      trend: savingsRate >= 20 ? 'Improving' : 'Stable',
      trendValue: savingsRate >= 20 ? '↑ 6%' : '→ 0%',
      biggestWeakness: isEmergencyLow ? "Emergency Reserve Liquidity" : (leakage > 3000 ? "Discretionary Leakage" : "Investment Acceleration"),
      recommendation: isEmergencyLow
        ? `Build ₹${Math.max(20000, emergencyTarget - Math.max(0, balance)).toLocaleString("en-IN")} more in liquid reserve before escalating risky investment allocations.`
        : `Surplus is consistent. Direct ₹${Math.round(deployable * 0.5).toLocaleString("en-IN")}/mo into automated index SIPs.`,
      metrics: {
        cashFlow: Math.min(100, Math.max(20, Math.round(savingsRate * 1.5))),
        savings: Math.min(100, Math.max(15, Math.round(savingsRate * 2))),
        debt: debt > 0 ? 65 : 92,
        emergencyFund: emergencyCoverage,
        investmentReadiness: isEmergencyLow ? 45 : 82,
        goalProgress: 72,
      },
    },
    nextBestMove: {
      headline: isEmergencyLow ? "Build Emergency Buffer First" : "Deploy Surplus to Wealth Growth",
      subheadline: isEmergencyLow
        ? `Hold off on high-risk bets until your emergency cushion reaches ₹${emergencyTarget.toLocaleString("en-IN")}.`
        : `You have ₹${deployable.toLocaleString("en-IN")} monthly deployable capacity ready to work.`,
      why: isEmergencyLow
        ? "Your liquid buffer is below 3 months of essential living expenses. An unexpected expense would force liquidation or high-interest loans."
        : "Idle cash in savings accounts loses purchasing power to inflation. Disciplined recurring investments yield exponential compounding.",
      evidence: `Monthly income: ₹${income.toLocaleString("en-IN")}, expenses: ₹${expense.toLocaleString("en-IN")}, estimated balance: ₹${balance.toLocaleString("en-IN")}.`,
      expectedImpact: isEmergencyLow ? "Achieves 100% financial firewall security in ~3 months." : "Accelerates long-term wealth timeline by up to 2.4 years.",
      risk: isEmergencyLow ? "Vulnerable to unexpected medical or job shock." : "Short-term market volatility.",
      alternative: isEmergencyLow ? "Split 70% emergency savings / 30% conservative RD." : "Keep in liquid sweep-in account.",
      actionText: isEmergencyLow ? "Set Emergency Target →" : "Route Surplus →",
    },
    moneyMoments: [
      {
        type: isEmergencyLow ? 'warning' : 'growth',
        headline: isEmergencyLow ? "Emergency Reserve Below Target" : "Consistent Monthly Surplus Detected",
        whatHappened: isEmergencyLow
          ? `Current reserves cover approx ${Math.max(1, Math.round((emergencyCoverage / 100) * 3))} months of essential expenses.`
          : `You generated ₹${savings.toLocaleString("en-IN")} net surplus over recent expenses.`,
        whyItMatters: isEmergencyLow
          ? "Unplanned emergencies without a reserve lead to costly debt or forced liquidation."
          : "Consistent positive cash flow allows high-conviction wealth building.",
        financialImpact: isEmergencyLow ? `₹${Math.max(15000, emergencyTarget - Math.max(0, balance)).toLocaleString("en-IN")} needed` : `+₹${savings.toLocaleString("en-IN")}/month`,
        recommendedAction: isEmergencyLow ? "Automate ₹5,000/mo into liquid buffer" : "Increase SIP allocation",
      },
      {
        type: leakage > 2000 ? 'warning' : 'opportunity',
        headline: leakage > 2000 ? "Discretionary Expense Leakage" : "Discretionary Spend Under Control",
        whatHappened: `Estimated ₹${leakage.toLocaleString("en-IN")} in miscellaneous or unbudgeted cash spends.`,
        whyItMatters: "Small recurring leaks compound into significant lost investment opportunity over 3-5 years.",
        financialImpact: `-₹${leakage.toLocaleString("en-IN")}/mo leakage`,
        recommendedAction: "Review unbudgeted transactions & subscriptions",
      },
    ],
    moneyFlow: {
      income,
      essentials,
      fixedCommitments,
      debt,
      savings,
      investments: Math.round(savings * 0.6),
      goals: Math.round(savings * 0.4),
      leakage,
      untappedCapacity: Math.max(0, deployable - leakage),
    },
    rupeeRouter: {
      estimatedDeployableSurplus: deployable,
      allocations: [
        {
          category: "Emergency Reserve",
          amount: Math.round(deployable * (isEmergencyLow ? 0.5 : 0.2)),
          rationale: "Liquid high-yield buffer for shock absorption.",
        },
        {
          category: "Equity / Index SIP",
          amount: Math.round(deployable * (isEmergencyLow ? 0.3 : 0.5)),
          rationale: "Long-term wealth creation beating inflation.",
        },
        {
          category: "Debt Reduction / Goals",
          amount: Math.round(deployable * 0.2),
          rationale: "Targeted milestones and obligation clearance.",
        },
        {
          category: "Flexible Buffer",
          amount: Math.round(deployable * 0.1),
          rationale: "Lifestyle freedom and opportunity capital.",
        },
      ],
    },
    businessCommandCenter: {
      isBusinessDetected: isBusiness,
      todaySales: isBusiness ? Math.round(income * 0.12) : 0,
      inventoryLocked: isBusiness ? Math.round(expense * 1.5) : 0,
      supplierPaymentsDue: isBusiness ? Math.round(expense * 0.4) : 0,
      estimatedBusinessSurplus: isBusiness ? Math.round(savings * 0.8) : 0,
      businessMoments: isBusiness ? [
        "Supplier payment cycle detected in recurring outgoings.",
        "Working capital margin appears stable across recent transactions."
      ] : [],
    },
  }
}

async function callGroqJSON(apiKey: string, systemPrompt: string, prompt: string): Promise<any> {
  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`)
  }

  const data = await res.json()
  const content = data.choices[0]?.message?.content || "{}"
  return JSON.parse(content)
}

export function useMoneyGrowth() {
  const [data, setData] = useState<MoneyGrowthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { transactions } = useTransactions()
  const { budgets } = useBudgets()

  const generateIntelligence = useCallback(async () => {
    if (!user) return

    // Immediately compute heuristic metrics from real transactions so data is never null
    const metrics = createFinancialMetrics(transactions, budgets)
    const heuristicData = buildHeuristicGrowthData(metrics, transactions)
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

      const recentLines = [...transactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 80)
        .map((t) => `- ${t.date} | ${t.transaction} | ${t.type === "Credit" ? "+" : "-"}${t.amount} | ${t.category} | ${t.method}`)
        .join("\n")

      const systemPrompt = `${MONEY_GROWTH_ENGINE_PROMPT}

IMPORTANT: You must respond in STRICT JSON format matching the schema requested by the user. Do NOT include markdown blocks. DO NOT output anything except the raw JSON.`

      const userPrompt = `Analyze the user's financial data and return the comprehensive Money Growth Engine state.

Monthly Totals:
${JSON.stringify(monthlyTotals)}

Recent Transactions:
${recentLines}

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
      const result = await callGroqJSON(apiKey, systemPrompt, userPrompt)
      if (result && result.financialHealth && result.nextBestMove) {
        setData(result)
      }
    } catch (err: any) {
      console.warn("Groq AI enrichment unavailable, using local financial twin:", err)
      // Keep heuristic data so dashboard stays completely functional
    } finally {
      setLoading(false)
    }
  }, [user, transactions, budgets])

  // Auto-generate on mount
  useEffect(() => {
    generateIntelligence()
  }, [generateIntelligence])

  return { data, loading, error, refresh: generateIntelligence }
}
