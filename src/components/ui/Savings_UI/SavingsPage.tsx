import { useState } from "react";
import { type SavingsGoal, type SIPPlan, type ManualInvestment } from "@/lib/savings";

interface ProjectionTabProps {
  goals: SavingsGoal[];
  sipPlans: SIPPlan[];
  investments: ManualInvestment[];
}

function calculateSIPFV(monthly: number, years: number, annualReturn: number) {
  const n = years * 12;
  const r = annualReturn / 12 / 100;
  if (r === 0) return monthly * n;
  return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

function calculatePortfolioFV(amount: number, annualReturn: number, years: number) {
  return Math.round(amount * Math.pow(1 + annualReturn / 100, years));
}

const PROJECTION_YEARS = [1, 2, 3, 5, 7, 10, 15, 20];

export function ProjectionTab({
  goals,
  sipPlans,
  investments,
}: ProjectionTabProps) {
  const [selectedYear, setSelectedYear] = useState(10);

  // Active SIP monthly total
  const totalMonthly = sipPlans
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.monthly_amount, 0);

  // Weighted avg SIP return
  const avgSIPReturn =
    sipPlans.filter((s) => s.active).length > 0
      ? sipPlans
          .filter((s) => s.active)
          .reduce((sum, s) => sum + s.expected_return, 0) /
        sipPlans.filter((s) => s.active).length
      : 12;

  // Total portfolio invested
  const totalPortfolio = investments.reduce(
    (sum, i) => sum + i.amount_invested,
    0
  );

  // Weighted avg portfolio return
  const avgPortfolioReturn =
    investments.length > 0
      ? investments.reduce((sum, i) => sum + i.expected_return, 0) /
        investments.length
      : 10;

  // Total already saved from goals
  const totalSaved = goals.reduce((sum, g) => sum + g.saved_amount, 0);

  // Build projection rows
  const rows = PROJECTION_YEARS.map((year) => {
    const sipFV =
      totalMonthly > 0
        ? calculateSIPFV(totalMonthly, year, avgSIPReturn)
        : 0;
    const portfolioFV =
      totalPortfolio > 0
        ? calculatePortfolioFV(totalPortfolio, avgPortfolioReturn, year)
        : 0;
    const savingsFV = calculatePortfolioFV(totalSaved, 6, year); // conservative 6% on savings
    const totalFV = sipFV + portfolioFV + savingsFV;
    const totalInvested =
      totalMonthly * year * 12 + totalPortfolio + totalSaved;
    const gain = totalFV - totalInvested;
    const gainPercent =
      totalInvested > 0 ? Math.round((gain / totalInvested) * 100) : 0;

    return {
      year,
      sipFV,
      portfolioFV,
      savingsFV,
      totalFV,
      totalInvested,
      gain,
      gainPercent,
    };
  });

  const selected = rows.find((r) => r.year === selectedYear) ?? rows[4];

  // Goal completion projections
  const goalProjections = goals
    .filter((g) => g.saved_amount < g.target_amount)
    .map((g) => {
      const remaining = g.target_amount - g.saved_amount;
      const monthsNeeded =
        totalMonthly > 0 ? Math.ceil(remaining / totalMonthly) : null;
      const yearsNeeded = monthsNeeded ? monthsNeeded / 12 : null;
      return { ...g, remaining, monthsNeeded, yearsNeeded };
    });

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const hasData = totalMonthly > 0 || totalPortfolio > 0 || totalSaved > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-medium">Future Projection</h2>
        <p className="text-sm text-muted-foreground">
          See where your money will be based on current plans
        </p>
      </div>

      {/* No Data State */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">
            Add SIP plans, investments or savings goals to see projections.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* Year Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Select projection year
            </span>
            <div className="flex flex-wrap gap-2">
              {PROJECTION_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    selectedYear === y
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          {/* Selected Year Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted/40 border border-border p-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Total Invested
              </span>
              <span className="text-lg font-medium">
                {formatAmount(selected.totalInvested)}
              </span>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border p-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                SIP Value
              </span>
              <span className="text-lg font-medium text-blue-400">
                {formatAmount(selected.sipFV)}
              </span>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border p-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Portfolio Value
              </span>
              <span className="text-lg font-medium text-purple-400">
                {formatAmount(selected.portfolioFV)}
              </span>
            </div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Total Value in {selectedYear}yr
              </span>
              <span className="text-lg font-medium text-green-400">
                {formatAmount(selected.totalFV)}
              </span>
              <span className="text-xs text-green-500">
                +{selected.gainPercent}% gain
              </span>
            </div>
          </div>

          {/* Full Projection Table */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Year by year breakdown
            </h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">
                      Year
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">
                      Invested
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">
                      Total Value
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">
                      Gain
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.year}
                      onClick={() => setSelectedYear(row.year)}
                      className={`border-b border-border/50 cursor-pointer transition-colors last:border-0 ${
                        selectedYear === row.year
                          ? "bg-green-500/5"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {row.year} yr
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {formatAmount(row.totalInvested)}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-medium ${
                          selectedYear === row.year
                            ? "text-green-400"
                            : ""
                        }`}
                      >
                        {formatAmount(row.totalFV)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                          +{row.gainPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Goal Completion Projections */}
          {goalProjections.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Goal completion timeline
              </h3>
              <div className="flex flex-col gap-2">
                {goalProjections.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-lg border border-border bg-card p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{g.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ₹{g.remaining.toLocaleString("en-IN")} remaining
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {g.monthsNeeded ? (
                        <>
                          <span className="text-sm font-medium text-blue-400">
                            ~{g.monthsNeeded < 12
                              ? `${g.monthsNeeded} months`
                              : `${(g.monthsNeeded / 12).toFixed(1)} years`}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            at current SIP rate
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Add a SIP to calculate
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions Note */}
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Projections assume consistent contributions and average annual
            returns. Actual returns may vary. Savings growth calculated at a
            conservative 6% p.a.
          </p>
        </>
      )}
    </div>
  );
}