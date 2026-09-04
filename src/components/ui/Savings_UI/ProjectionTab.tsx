// src/components/ui/Savings_UI/ProjectionTab.tsx
import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { type SavingsGoal, type SIPPlan, type ManualInvestment } from "@/lib/savings";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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

function formatAmount(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

const PROJECTION_YEARS = [1, 2, 3, 5, 7, 10, 15, 20];

// ── Sub-components ────────────────────────────────────────────────────────────

function YearButton({
  year,
  selected,
  onClick,
}: {
  year: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {year}yr
    </button>
  );
}

function SummaryCard({
  label,
  value,
  valueClass = "",
  footer,
  highlight = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  footer?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 flex flex-col gap-1 min-h-[80px] justify-between ${
        highlight
          ? "bg-green-500/10 border-green-500/20"
          : "bg-muted/40 border-border"
      }`}
    >
      <span className="text-[11px] text-muted-foreground leading-tight">{label}</span>
      <div>
        <span className={`text-xl font-semibold leading-none ${valueClass}`}>{value}</span>
        {footer && <p className="text-[11px] mt-1">{footer}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectionTab({ goals, sipPlans, investments }: ProjectionTabProps) {
  const [selectedYear, setSelectedYear] = useState(10);

  const totalMonthly = sipPlans
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.monthly_amount, 0);

  const avgSIPReturn =
    sipPlans.filter((s) => s.active).length > 0
      ? sipPlans.filter((s) => s.active).reduce((sum, s) => sum + s.expected_return, 0) /
        sipPlans.filter((s) => s.active).length
      : 12;

  const totalPortfolio = investments.reduce((sum, i) => sum + i.amount_invested, 0);

  const avgPortfolioReturn =
    investments.length > 0
      ? investments.reduce((sum, i) => sum + i.expected_return, 0) / investments.length
      : 10;

  const totalSaved = goals.reduce((sum, g) => sum + g.saved_amount, 0);

  const rows = useMemo(
    () =>
      PROJECTION_YEARS.map((year) => {
        const sipFV = totalMonthly > 0 ? calculateSIPFV(totalMonthly, year, avgSIPReturn) : 0;
        const portfolioFV =
          totalPortfolio > 0
            ? calculatePortfolioFV(totalPortfolio, avgPortfolioReturn, year)
            : 0;
        const savingsFV = calculatePortfolioFV(totalSaved, 6, year);
        const totalFV = sipFV + portfolioFV + savingsFV;
        const totalInvested = totalMonthly * year * 12 + totalPortfolio + totalSaved;
        const gain = totalFV - totalInvested;
        const gainPercent = totalInvested > 0 ? Math.round((gain / totalInvested) * 100) : 0;
        return { year, sipFV, portfolioFV, savingsFV, totalFV, totalInvested, gain, gainPercent };
      }),
    [totalMonthly, avgSIPReturn, totalPortfolio, avgPortfolioReturn, totalSaved]
  );

  const selected = rows.find((r) => r.year === selectedYear) ?? rows[4];

  const goalProjections = goals
    .filter((g) => g.saved_amount < g.target_amount)
    .map((g) => {
      const remaining = g.target_amount - g.saved_amount;
      const monthsNeeded = totalMonthly > 0 ? Math.ceil(remaining / totalMonthly) : null;
      return { ...g, remaining, monthsNeeded };
    });

  const hasData = totalMonthly > 0 || totalPortfolio > 0 || totalSaved > 0;

  const chartData = {
    labels: rows.map((r) => `${r.year}yr`),
    datasets: [
      {
        label: "Total Value",
        data: rows.map((r) => r.totalFV),
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.08)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: rows.map((r) => (r.year === selectedYear ? 6 : 3)),
        pointBackgroundColor: "#4ade80",
        pointBorderColor: rows.map((r) =>
          r.year === selectedYear ? "#fff" : "transparent"
        ),
        pointBorderWidth: 2,
      },
      {
        label: "Amount Invested",
        data: rows.map((r) => r.totalInvested),
        borderColor: "#52525b",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderDash: [5, 4],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#18181b",
        titleColor: "#a1a1aa",
        bodyColor: "#f4f4f5",
        borderColor: "#3f3f46",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#71717a", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#71717a",
          font: { size: 10 },
          callback: (v: any) => formatAmount(v),
          maxTicksLimit: 5,
        },
      },
    },
    onClick: (_: any, elements: any[]) => {
      if (elements.length > 0) {
        setSelectedYear(PROJECTION_YEARS[elements[0].index]);
      }
    },
  } as any;

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Future Projection</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          See where your money will be based on current plans
        </p>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-sm">
            Add SIP plans, investments, or savings goals to see projections.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* Year selector — two even rows (5 + 3) to prevent overflow */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              Select projection year
            </span>
            <div className="flex gap-2">
              {PROJECTION_YEARS.slice(0, 5).map((y) => (
                <YearButton
                  key={y}
                  year={y}
                  selected={selectedYear === y}
                  onClick={() => setSelectedYear(y)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {PROJECTION_YEARS.slice(5).map((y) => (
                <YearButton
                  key={y}
                  year={y}
                  selected={selectedYear === y}
                  onClick={() => setSelectedYear(y)}
                />
              ))}
            </div>
          </div>

          {/* 2×2 summary cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <SummaryCard
              label="Total Invested"
              value={formatAmount(selected.totalInvested)}
              valueClass="text-foreground"
            />
            <SummaryCard
              label="SIP Value"
              value={formatAmount(selected.sipFV)}
              valueClass="text-blue-400"
            />
            <SummaryCard
              label="Portfolio Value"
              value={formatAmount(selected.portfolioFV)}
              valueClass="text-purple-400"
            />
            <SummaryCard
              label={`Total in ${selectedYear}yr`}
              value={formatAmount(selected.totalFV)}
              valueClass="text-green-400"
              footer={<span className="text-green-500">+{selected.gainPercent}% gain</span>}
              highlight
            />
          </div>

          {/* Growth chart */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Growth curve
              </h3>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-0.5 bg-green-400 rounded" />
                  Value
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 border-t border-dashed border-zinc-500" />
                  Invested
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div style={{ height: 200 }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Tap a point to select that year
              </p>
            </div>
          </div>

          {/* Year-by-year table */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              Year by year breakdown
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-3 py-2.5 text-[11px] text-muted-foreground font-medium">
                      Year
                    </th>
                    <th className="text-right px-3 py-2.5 text-[11px] text-muted-foreground font-medium">
                      Invested
                    </th>
                    <th className="text-right px-3 py-2.5 text-[11px] text-muted-foreground font-medium">
                      Value
                    </th>
                    <th className="text-right px-3 py-2.5 text-[11px] text-muted-foreground font-medium">
                      Gain
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.year}
                      onClick={() => setSelectedYear(row.year)}
                      className={`border-b border-border/40 cursor-pointer transition-colors last:border-0 ${
                        selectedYear === row.year ? "bg-green-500/5" : "hover:bg-muted/20"
                      }`}
                    >
                      <td className="px-3 py-2.5 font-medium text-xs">{row.year} yr</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
                        {formatAmount(row.totalInvested)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-medium text-xs ${
                          selectedYear === row.year ? "text-green-400" : ""
                        }`}
                      >
                        {formatAmount(row.totalFV)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 whitespace-nowrap">
                          +{row.gainPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Goal timeline */}
          {goalProjections.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Goal completion timeline
              </h3>
              <div className="flex flex-col gap-2">
                {goalProjections.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium truncate">{g.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ₹{g.remaining.toLocaleString("en-IN")} remaining
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {g.monthsNeeded ? (
                        <>
                          <span className="text-sm font-medium text-blue-400">
                            ~{g.monthsNeeded < 12
                              ? `${g.monthsNeeded}mo`
                              : `${(g.monthsNeeded / 12).toFixed(1)}yr`}
                          </span>
                          <p className="text-[10px] text-muted-foreground">at current SIP</p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Add a SIP</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-muted-foreground border-t border-border pt-3 leading-relaxed">
            Projections assume consistent contributions and average annual returns. Actual returns
            may vary. Savings growth at a conservative 6% p.a.
          </p>
        </>
      )}
    </div>
  );
}

export default ProjectionTab;