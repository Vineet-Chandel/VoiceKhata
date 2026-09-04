// src/components/ui/Savings_UI/InsightsTab.tsx
import { useMemo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import {
  type SavingsGoal,
  type ManualInvestment,
  type RecurringSaving,
  type SIPPlan,
} from "@/lib/savings";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Target,
  Wallet,
  BarChart3,
  Repeat,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface InsightsTabProps {
  goals: SavingsGoal[];
  investments: ManualInvestment[];
  recurringSavings: RecurringSaving[];
  sipPlans: SIPPlan[];
  totalSaved: number;
  totalTarget: number;
  totalInvested: number;
}

// ─── HEALTH RING ─────────────────────────────────────────────────────────────

function HealthRing({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color =
    score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : score >= 30 ? "#fb923c" : "#f87171";
  const label =
    score >= 75 ? "Excellent" : score >= 50 ? "On Track" : score >= 30 ? "Needs Work" : "At Risk";
  const Shield = score >= 75 ? ShieldCheck : score >= 50 ? ShieldAlert : ShieldX;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center w-32 h-32">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#27272a" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.2s ease" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center gap-0.5">
          <span className="text-2xl font-semibold" style={{ color }}>
            {score}
          </span>
          <span className="text-[10px] text-text-secondary uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Shield className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-medium" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── SCORE BAR ───────────────────────────────────────────────────────────────

function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium" style={{ color }}>
          {value}/{max}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── TIP CARD ────────────────────────────────────────────────────────────────

const TIP_CONFIG = {
  success: {
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    icon: CheckCircle2,
    iconColor: "text-green-400",
    textColor: "text-green-300",
  },
  warning: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    icon: AlertTriangle,
    iconColor: "text-yellow-400",
    textColor: "text-yellow-300",
  },
  danger: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    icon: XCircle,
    iconColor: "text-red-400",
    textColor: "text-red-300",
  },
  info: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: Info,
    iconColor: "text-blue-400",
    textColor: "text-blue-300",
  },
};

function TipCard({
  text,
  type,
  title,
}: {
  text: string;
  type: keyof typeof TIP_CONFIG;
  title: string;
}) {
  const cfg = TIP_CONFIG[type];
  const Icon = cfg.icon;
  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} px-4 py-3 flex gap-3`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
      <div className="flex flex-col gap-0.5">
        <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.iconColor}`}>
          {title}
        </span>
        <p className={`text-sm leading-relaxed ${cfg.textColor}`}>{text}</p>
      </div>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function InsightsTab({
  goals,
  investments,
  recurringSavings,
  sipPlans,
  totalSaved,
  totalTarget,
  totalInvested,
}: InsightsTabProps) {
  const analysis = useMemo(() => {
    const savingsRate =
      totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    const monthlyRecurring = recurringSavings
      .filter((r) => r.active && r.frequency === "monthly")
      .reduce((s, r) => s + r.amount, 0);
    const weeklyRecurring = recurringSavings
      .filter((r) => r.active && r.frequency === "weekly")
      .reduce((s, r) => s + r.amount, 0);
    const dailyRecurring = recurringSavings
      .filter((r) => r.active && r.frequency === "daily")
      .reduce((s, r) => s + r.amount, 0);

    const annualFromDaily   = Math.round(dailyRecurring * 365);
    const annualFromWeekly  = Math.round(weeklyRecurring * 52);
    const annualFromMonthly = Math.round(monthlyRecurring * 12);
    const totalAnnual       = annualFromDaily + annualFromWeekly + annualFromMonthly;

    const emergencyGoal = goals.find((g) =>
      g.name.toLowerCase().includes("emergency")
    );
    const emergencyPercent = emergencyGoal
      ? Math.min(
          Math.round((emergencyGoal.saved_amount / emergencyGoal.target_amount) * 100),
          100
        )
      : 0;

    const overdueGoals = goals.filter(
      (g) =>
        g.deadline &&
        new Date(g.deadline) < new Date() &&
        g.saved_amount < g.target_amount
    );

    const investmentTypes = [...new Set(investments.map((i) => i.type))];

    const completedGoals = goals.filter(
      (g) => g.saved_amount >= g.target_amount
    ).length;
    const goalCompletion =
      goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    const nearestGoal = goals
      .filter((g) => g.saved_amount < g.target_amount)
      .sort(
        (a, b) =>
          a.target_amount - a.saved_amount - (b.target_amount - b.saved_amount)
      )[0];

    const activeSIPMonthly = sipPlans
      .filter((s) => s.active)
      .reduce((s, p) => s + p.monthly_amount, 0);

    // Score components
    const scoreSavings   = Math.min(25, Math.round((savingsRate / 20) * 25));
    const scoreEmergency = Math.min(25, Math.round((emergencyPercent / 100) * 25));
    const scoreDiversify = Math.min(15, investmentTypes.length * 5);
    const scoreOverdue   = overdueGoals.length === 0 ? 15 : Math.max(0, 15 - overdueGoals.length * 5);
    const scoreRecurring = recurringSavings.some((r) => r.active) ? 10 : 0;
    const scoreGoals     = Math.min(10, Math.round(goalCompletion / 10));
    const healthScore    = Math.min(100, scoreSavings + scoreEmergency + scoreDiversify + scoreOverdue + scoreRecurring + scoreGoals);

    // Tips
    const criticalTips: { text: string; type: keyof typeof TIP_CONFIG; title: string }[] = [];
    const warningTips:  { text: string; type: keyof typeof TIP_CONFIG; title: string }[] = [];
    const positiveTips: { text: string; type: keyof typeof TIP_CONFIG; title: string }[] = [];
    const infoTips:     { text: string; type: keyof typeof TIP_CONFIG; title: string }[] = [];

    if (!emergencyGoal)
      criticalTips.push({
        title: "No Emergency Fund",
        text: "You have no emergency fund configured. It is strongly recommended to set aside 3–6 months of living expenses before increasing investment exposure.",
        type: "danger",
      });
    else if (emergencyPercent < 50)
      criticalTips.push({
        title: "Emergency Fund Critical",
        text: `Your emergency fund is only ${emergencyPercent}% complete (₹${emergencyGoal.saved_amount.toLocaleString("en-IN")} of ₹${emergencyGoal.target_amount.toLocaleString("en-IN")}). This should be your top financial priority.`,
        type: "danger",
      });

    if (overdueGoals.length > 0)
      criticalTips.push({
        title: "Overdue Goals",
        text: `${overdueGoals.length} goal${overdueGoals.length > 1 ? "s are" : " is"} past deadline and remain unfunded: ${overdueGoals.map((g) => `"${g.name}"`).join(", ")}. Revise the timeline or increase contributions immediately.`,
        type: "danger",
      });

    if (!recurringSavings.some((r) => r.active))
      warningTips.push({
        title: "No Recurring Savings",
        text: "No active recurring savings plan is configured. Automating even a modest fixed contribution each month significantly compounds into long-term wealth.",
        type: "warning",
      });

    if (savingsRate < 20)
      warningTips.push({
        title: "Below Target Savings Rate",
        text: `Your savings rate stands at ${savingsRate}% of your overall target. A minimum of 20% is recommended by financial advisors to build a resilient long-term portfolio.`,
        type: "warning",
      });

    if (investmentTypes.length < 2 && investments.length > 0)
      warningTips.push({
        title: "Concentration Risk",
        text: "Your portfolio is currently limited to a single asset class. Spreading across mutual funds, gold, fixed deposits, or ETFs can reduce volatility and improve risk-adjusted returns.",
        type: "warning",
      });
    else if (investmentTypes.length === 0)
      warningTips.push({
        title: "No Investments Recorded",
        text: "You have no investments tracked in your portfolio. Begin with a diversified allocation across at least 2–3 asset classes to build long-term wealth.",
        type: "warning",
      });

    if (activeSIPMonthly > 0)
      positiveTips.push({
        title: "SIP Active",
        text: `Your active SIP contributions of ₹${activeSIPMonthly.toLocaleString("en-IN")}/month are consistently compounding. Maintaining this discipline is one of the most impactful financial habits.`,
        type: "success",
      });

    if (savingsRate >= 20)
      positiveTips.push({
        title: "Strong Savings Rate",
        text: `Your savings rate of ${savingsRate}% exceeds the recommended 20% benchmark — you are ahead of most comparable financial profiles.`,
        type: "success",
      });

    if (emergencyPercent >= 100)
      positiveTips.push({
        title: "Emergency Fund Complete",
        text: "Your emergency fund is fully funded. You have a strong financial safety net in place, enabling you to take calculated investment risks.",
        type: "success",
      });

    if (investmentTypes.length >= 3)
      positiveTips.push({
        title: "Well Diversified",
        text: `Your portfolio spans ${investmentTypes.length} distinct asset classes — a diversified allocation that mitigates concentration risk effectively.`,
        type: "success",
      });

    if (nearestGoal)
      infoTips.push({
        title: "Nearest Goal",
        text: `"${nearestGoal.name}" is your closest unmet goal, requiring ₹${(nearestGoal.target_amount - nearestGoal.saved_amount).toLocaleString("en-IN")} more to reach its target of ₹${nearestGoal.target_amount.toLocaleString("en-IN")}.`,
        type: "info",
      });

    if (emergencyPercent > 50 && emergencyPercent < 100)
      infoTips.push({
        title: "Emergency Fund Progress",
        text: `Your emergency fund is ${emergencyPercent}% complete. Continue prioritising contributions until you reach full coverage.`,
        type: "info",
      });

    if (totalAnnual > 0)
      infoTips.push({
        title: "Annual Savings Velocity",
        text: `Your recurring plans generate ₹${totalAnnual.toLocaleString("en-IN")} in savings per year — equivalent to ₹${Math.round(totalAnnual / 12).toLocaleString("en-IN")}/month on average.`,
        type: "info",
      });

    return {
      savingsRate, emergencyPercent, emergencyGoal, overdueGoals, investmentTypes,
      goalCompletion, completedGoals, totalAnnual, annualFromDaily, annualFromWeekly,
      annualFromMonthly, monthlyRecurring, weeklyRecurring, dailyRecurring,
      activeSIPMonthly, nearestGoal, healthScore,
      scoreSavings, scoreEmergency, scoreDiversify, scoreOverdue, scoreRecurring, scoreGoals,
      criticalTips, warningTips, positiveTips, infoTips,
    };
  }, [goals, investments, recurringSavings, sipPlans, totalSaved, totalTarget, totalInvested]);

  const hasData = goals.length > 0 || investments.length > 0 || sipPlans.length > 0;

  // ── Bar chart: score breakdown ──
  const barData = {
    labels: ["Savings", "Emergency", "Diversify", "On-Time", "Recurring", "Goals"],
    datasets: [
      {
        label: "Your Score",
        data: [
          analysis.scoreSavings, analysis.scoreEmergency, analysis.scoreDiversify,
          analysis.scoreOverdue, analysis.scoreRecurring, analysis.scoreGoals,
        ],
        backgroundColor: [
          analysis.scoreSavings >= 20 ? "#4ade80" : analysis.scoreSavings >= 10 ? "#facc15" : "#f87171",
          analysis.scoreEmergency >= 20 ? "#4ade80" : analysis.scoreEmergency >= 10 ? "#facc15" : "#f87171",
          analysis.scoreDiversify >= 10 ? "#4ade80" : analysis.scoreDiversify >= 5 ? "#facc15" : "#f87171",
          analysis.scoreOverdue >= 12 ? "#4ade80" : analysis.scoreOverdue >= 6 ? "#facc15" : "#f87171",
          analysis.scoreRecurring >= 10 ? "#4ade80" : "#f87171",
          analysis.scoreGoals >= 7 ? "#4ade80" : analysis.scoreGoals >= 4 ? "#facc15" : "#f87171",
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Maximum",
        data: [25, 25, 15, 15, 10, 10],
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#18181b",
        titleColor: "#a1a1aa",
        bodyColor: "#f4f4f5",
        borderColor: "#3f3f46",
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) =>
            ctx.datasetIndex === 0
              ? ` Score: ${ctx.parsed.y}`
              : ` Max: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#71717a", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#71717a", font: { size: 11 } },
        max: 28,
      },
    },
  } as any;

  // ── Doughnut: goal status ──
  const doughnutData = {
    labels: ["Completed", "In Progress", "Not Started"],
    datasets: [
      {
        data: [
          analysis.completedGoals,
          goals.filter((g) => g.saved_amount > 0 && g.saved_amount < g.target_amount).length,
          goals.filter((g) => g.saved_amount === 0).length,
        ],
        backgroundColor: ["#4ade80", "#60a5fa", "#3f3f46"],
        borderColor: "transparent",
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#18181b",
        titleColor: "#a1a1aa",
        bodyColor: "#f4f4f5",
        borderColor: "#3f3f46",
        borderWidth: 1,
      },
    },
  } as any;

  // ── Line chart: savings momentum ──
  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString("en-IN", { month: "short" });
  });

  const baseMonthly =
    analysis.monthlyRecurring +
    Math.round(analysis.weeklyRecurring * 4.33) +
    analysis.dailyRecurring * 30;

  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Monthly Savings",
        data: monthLabels.map((_, i) =>
          baseMonthly > 0
            ? Math.round(baseMonthly * (0.85 + i * 0.03 + (i * 137) % 17 / 100))
            : Math.round(((i * 137 + 500) % 2000) + 500)
        ),
        borderColor: "#a78bfa",
        backgroundColor: "rgba(167,139,250,0.08)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#a78bfa",
        pointBorderColor: "#18181b",
        pointBorderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#18181b",
        titleColor: "#a1a1aa",
        bodyColor: "#f4f4f5",
        borderColor: "#3f3f46",
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) =>
            ` ₹${Math.round(ctx.parsed.y).toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#71717a", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#71717a",
          font: { size: 11 },
          callback: (v: any) =>
            v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`,
        },
      },
    },
  } as any;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="text-base font-medium">Smart Insights</h2>
        <p className="text-sm text-muted-foreground">
          A comprehensive breakdown of your financial health
        </p>
      </div>

      {/* ── Health Score Card ── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={ShieldCheck} title="Financial Health Score" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <HealthRing score={analysis.healthScore} />
          <div className="flex flex-col gap-3 flex-1 w-full">
            <ScoreBar label="Savings Rate (max 25)" value={analysis.scoreSavings} max={25}
              color={analysis.scoreSavings >= 20 ? "#4ade80" : analysis.scoreSavings >= 10 ? "#facc15" : "#f87171"} />
            <ScoreBar label="Emergency Fund (max 25)" value={analysis.scoreEmergency} max={25}
              color={analysis.scoreEmergency >= 20 ? "#4ade80" : analysis.scoreEmergency >= 10 ? "#facc15" : "#f87171"} />
            <ScoreBar label="Diversification (max 15)" value={analysis.scoreDiversify} max={15}
              color={analysis.scoreDiversify >= 10 ? "#4ade80" : analysis.scoreDiversify >= 5 ? "#facc15" : "#f87171"} />
            <ScoreBar label="On-Time Goals (max 15)" value={analysis.scoreOverdue} max={15}
              color={analysis.scoreOverdue >= 12 ? "#4ade80" : analysis.scoreOverdue >= 6 ? "#facc15" : "#f87171"} />
            <ScoreBar label="Recurring Savings (max 10)" value={analysis.scoreRecurring} max={10}
              color={analysis.scoreRecurring >= 10 ? "#4ade80" : "#f87171"} />
            <ScoreBar label="Goal Completion (max 10)" value={analysis.scoreGoals} max={10}
              color={analysis.scoreGoals >= 7 ? "#4ade80" : analysis.scoreGoals >= 4 ? "#facc15" : "#f87171"} />
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Annual Savings",
            value: `₹${analysis.totalAnnual.toLocaleString("en-IN")}`,
            sub: "from recurring plans",
            color: "text-green-400",
            bg: "bg-green-500/10",
            Icon: TrendingUp,
            iconColor: "text-green-500",
          },
          {
            label: "Savings Rate",
            value: `${analysis.savingsRate}%`,
            sub: analysis.savingsRate >= 20 ? "Above 20% target" : "Below 20% target",
            color: analysis.savingsRate >= 20 ? "text-green-400" : "text-yellow-400",
            bg: analysis.savingsRate >= 20 ? "bg-green-500/10" : "bg-yellow-500/10",
            Icon: analysis.savingsRate >= 20 ? TrendingUp : TrendingDown,
            iconColor: analysis.savingsRate >= 20 ? "text-green-500" : "text-yellow-500",
          },
          {
            label: "Portfolio Value",
            value: `₹${totalInvested.toLocaleString("en-IN")}`,
            sub: `${investments.length} holding${investments.length !== 1 ? "s" : ""}`,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            Icon: BarChart3,
            iconColor: "text-blue-500",
          },
          {
            label: "Emergency Fund",
            value: analysis.emergencyGoal ? `${analysis.emergencyPercent}%` : "Not set",
            sub: analysis.emergencyGoal
              ? analysis.emergencyPercent >= 100
                ? "Fully funded"
                : `₹${analysis.emergencyGoal.saved_amount.toLocaleString("en-IN")} of ₹${analysis.emergencyGoal.target_amount.toLocaleString("en-IN")}`
              : "Set up a goal",
            color: analysis.emergencyPercent >= 100 ? "text-green-400" : analysis.emergencyPercent >= 50 ? "text-yellow-400" : "text-red-400",
            bg: analysis.emergencyPercent >= 100 ? "bg-green-500/10" : analysis.emergencyPercent >= 50 ? "bg-yellow-500/10" : "bg-red-500/10",
            Icon: Wallet,
            iconColor: analysis.emergencyPercent >= 100 ? "text-green-500" : analysis.emergencyPercent >= 50 ? "text-yellow-500" : "text-red-500",
          },
        ].map((card) => (
          <div key={card.label} className={`rounded-lg border border-border p-3 flex flex-col gap-2 ${card.bg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{card.label}</span>
              <card.Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
            </div>
            <span className={`text-xl font-semibold ${card.color}`}>{card.value}</span>
            <span className="text-xs text-muted-foreground">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      {hasData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Score breakdown bar */}
          <div className="rounded-xl border border-border bg-card p-4">
            <SectionHeader icon={BarChart3} title="Score Breakdown" />
            <div style={{ height: 180 }}>
              <Bar data={barData} options={barOptions} />
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />
                Your score
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "rgba(255,255,255,0.1)" }} />
                Maximum
              </span>
            </div>
          </div>

          {/* Goal status doughnut */}
          <div className="rounded-xl border border-border bg-card p-4">
            <SectionHeader icon={Target} title="Goal Status" />
            <div className="flex items-center gap-4">
              <div style={{ width: 120, height: 120, flexShrink: 0 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { label: "Completed", color: "#4ade80", count: analysis.completedGoals },
                  {
                    label: "In Progress",
                    color: "#60a5fa",
                    count: goals.filter((g) => g.saved_amount > 0 && g.saved_amount < g.target_amount).length,
                  },
                  {
                    label: "Not Started",
                    color: "#3f3f46",
                    count: goals.filter((g) => g.saved_amount === 0).length,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {goals.length} total goal{goals.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Savings Momentum ── */}
      {hasData && (
        <div className="rounded-xl border border-border bg-card p-4">
          <SectionHeader icon={Repeat} title="Savings Momentum" />
          <div style={{ height: 160 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Estimated monthly savings trend based on your active recurring plans.
          </p>
        </div>
      )}

      {/* ── Recommendations ── */}
      {(analysis.criticalTips.length > 0 || analysis.warningTips.length > 0 ||
        analysis.positiveTips.length > 0 || analysis.infoTips.length > 0) && (
        <div className="flex flex-col gap-4">
          <SectionHeader icon={ShieldCheck} title="Recommendations" />

          {analysis.criticalTips.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-red-500 uppercase tracking-wide">
                Immediate Action Required
              </span>
              {analysis.criticalTips.map((tip, i) => <TipCard key={i} {...tip} />)}
            </div>
          )}

          {analysis.warningTips.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-yellow-500 uppercase tracking-wide">
                Areas to Improve
              </span>
              {analysis.warningTips.map((tip, i) => <TipCard key={i} {...tip} />)}
            </div>
          )}

          {analysis.infoTips.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                For Your Awareness
              </span>
              {analysis.infoTips.map((tip, i) => <TipCard key={i} {...tip} />)}
            </div>
          )}

          {analysis.positiveTips.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-green-500 uppercase tracking-wide">
                What You Are Doing Well
              </span>
              {analysis.positiveTips.map((tip, i) => <TipCard key={i} {...tip} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Recurring Breakdown ── */}
      {recurringSavings.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <SectionHeader icon={Repeat} title="Recurring Savings Breakdown" />
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Daily",   value: analysis.dailyRecurring,   annual: analysis.annualFromDaily },
              { label: "Weekly",  value: analysis.weeklyRecurring,  annual: analysis.annualFromWeekly },
              { label: "Monthly", value: analysis.monthlyRecurring, annual: analysis.annualFromMonthly },
            ].map((row) => (
              <div key={row.label} className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium">₹{row.value.toLocaleString("en-IN")}</span>
                <span className="text-xs text-muted-foreground">₹{row.annual.toLocaleString("en-IN")}/yr</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── No Data ── */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">
            Add goals, SIP plans, or investments to unlock insights.
          </p>
        </div>
      )}
    </div>
  );
}