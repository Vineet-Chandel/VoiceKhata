import { useState, useEffect } from "react"
import { useAuth } from "@/components/hooks/use-auth"
import { useTransactionStore } from "@/components/hooks/use-transaction-store"
import { useBudgetStore } from "@/components/hooks/use-budget-store"
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

// Extracted from use-ai-chat to avoid circular dependencies
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
      Authorization: \`Bearer \${apiKey}\`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(\`Groq API error: \${res.status}\`)
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
  const { transactions } = useTransactionStore()
  const { budgets } = useBudgetStore()

  const generateIntelligence = async () => {
    if (!user) return
    const apiKey = localStorage.getItem("groq_api_key")
    if (!apiKey) {
      setError("Groq API Key is required. Please set it in Settings.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const metrics = createFinancialMetrics(transactions, budgets)
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
        .slice(0, 100)
        .map((t) => \`- \${t.date} | \${t.transaction} | \${t.type === "Credit" ? "+" : "-"}\${t.amount} | \${t.category} | \${t.method}\`)
        .join("\\n")

      const systemPrompt = \`\${MONEY_GROWTH_ENGINE_PROMPT}

IMPORTANT: You must respond in STRICT JSON format matching the schema requested by the user. Do NOT include markdown blocks. DO NOT output anything except the raw JSON.\`

      const userPrompt = \`Analyze the user's financial data and return the comprehensive Money Growth Engine state.

Monthly Totals:
\${JSON.stringify(monthlyTotals)}

Recent Transactions:
\${recentLines}

Return a JSON object exactly matching this TypeScript type:
type MoneyGrowthData = {
  financialHealth: { score: number, trend: 'Improving' | 'Stable' | 'Declining', trendValue: string, biggestWeakness: string, recommendation: string, metrics: { cashFlow: number, savings: number, debt: number, emergencyFund: number, investmentReadiness: number, goalProgress: number } },
  nextBestMove: { headline: string, subheadline: string, why: string, evidence: string, expectedImpact: string, risk: string, alternative: string, actionText: string },
  moneyMoments: Array<{ type: 'opportunity' | 'warning' | 'growth' | 'info', headline: string, whatHappened: string, whyItMatters: string, financialImpact: string, recommendedAction: string }>,
  moneyFlow: { income: number, essentials: number, fixedCommitments: number, debt: number, savings: number, investments: number, goals: number, leakage: number, untappedCapacity: number },
  rupeeRouter: { estimatedDeployableSurplus: number, allocations: Array<{ category: string, amount: number, rationale: string }> },
  businessCommandCenter: { isBusinessDetected: boolean, todaySales: number, inventoryLocked: number, supplierPaymentsDue: number, estimatedBusinessSurplus: number, businessMoments: Array<string> }
}
\`
      const result = await callGroqJSON(apiKey, systemPrompt, userPrompt)
      setData(result)
    } catch (err: any) {
      console.error("Failed to generate Money Growth intelligence:", err)
      setError(err.message || "Failed to analyze financial data.")
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate on mount if no data
  useEffect(() => {
    if (user && transactions.length > 0 && !data && !loading && !error) {
      generateIntelligence()
    }
  }, [user, transactions.length, data])

  return { data, loading, error, refresh: generateIntelligence }
}
