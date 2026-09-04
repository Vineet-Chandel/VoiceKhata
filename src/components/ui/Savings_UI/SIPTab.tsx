import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddSIPDialog } from "./add-sip-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { type SIPPlan } from "@/lib/savings";
import { Pencil, Trash2, Plus, TrendingUp } from "lucide-react";

interface SIPTabProps {
  sipPlans: SIPPlan[];
  loadingSIP: boolean;
  createSIP: (
    payload: Omit<SIPPlan, "id" | "firebase_uid" | "created_at">
  ) => Promise<void>;
  editSIP: (
    id: string,
    payload: Partial<Omit<SIPPlan, "id" | "firebase_uid" | "created_at">>
  ) => Promise<void>;
  removeSIP: (id: string) => Promise<void>;
}

function calculateSIP(p: number, years: number, annualReturn: number) {
  const n = years * 12;
  const r = annualReturn / 12 / 100;
  const fv = Math.round(p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const invested = p * n;
  const returns = fv - invested;
  const gainPercent = Math.round((returns / invested) * 100);
  return { fv, invested, returns, gainPercent };
}

function getMonthsElapsed(startDate: string) {
  const start = new Date(startDate);
  const now = new Date();
  return (
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  );
}

export function SIPTab({
  sipPlans,
  loadingSIP,
  createSIP,
  editSIP,
  removeSIP,
}: SIPTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editData, setEditData] = useState<SIPPlan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await removeSIP(deleteId);
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Total across all active SIPs
  const totalMonthly = sipPlans
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.monthly_amount, 0);

  const totalFV = sipPlans
    .filter((s) => s.active)
    .reduce((sum, s) => {
      const { fv } = calculateSIP(
        s.monthly_amount,
        s.duration_years,
        s.expected_return
      );
      return sum + fv;
    }, 0);

  if (loadingSIP) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Loading SIP plans...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">SIP Plans</h2>
          <p className="text-sm text-muted-foreground">
            Systematic Investment Plan tracker & calculator
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditData(null);
            setAddOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add SIP
        </Button>
      </div>

      {/* Summary Cards */}
      {sipPlans.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/40 border border-border p-3 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Total Monthly SIP
            </span>
            <span className="text-lg font-medium">
              ₹{totalMonthly.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="rounded-lg bg-muted/40 border border-border p-3 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Active Plans
            </span>
            <span className="text-lg font-medium">
              {sipPlans.filter((s) => s.active).length}
            </span>
          </div>
          <div className="rounded-lg bg-muted/40 border border-border p-3 flex flex-col gap-1 col-span-2 sm:col-span-1">
            <span className="text-xs text-muted-foreground">
              Combined Future Value
            </span>
            <span className="text-lg font-medium text-green-500">
              ₹{(totalFV / 100000).toFixed(1)}L
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sipPlans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-border rounded-lg">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            No SIP plans yet. Start investing systematically.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditData(null);
              setAddOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create your first SIP
          </Button>
        </div>
      )}

      {/* SIP Cards */}
      <div className="flex flex-col gap-3">
        {sipPlans.map((plan) => {
          const { fv, invested, returns, gainPercent } = calculateSIP(
            plan.monthly_amount,
            plan.duration_years,
            plan.expected_return
          );
          const monthsElapsed = getMonthsElapsed(plan.start_date);
          const totalMonths = plan.duration_years * 12;
          const progressPercent = Math.min(
            Math.round((monthsElapsed / totalMonths) * 100),
            100
          );

          return (
            <div
              key={plan.id}
              className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3"
            >
              {/* Top Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    ₹{plan.monthly_amount.toLocaleString("en-IN")}/mo
                  </span>
                  <Badge variant={plan.active ? "default" : "secondary"}>
                    {plan.active ? "Active" : "Paused"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {plan.duration_years} yr · {plan.expected_return}% p.a.
                </span>
              </div>

              {/* Time Progress */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Time elapsed</span>
                  <span>
                    {Math.min(monthsElapsed, totalMonths)}/{totalMonths} months
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Returns Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Invested</span>
                  <span className="font-medium">
                    ₹{(invested / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Returns</span>
                  <span className="font-medium text-green-500">
                    ₹{(returns / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Final Value</span>
                  <span className="font-medium text-green-400">
                    ₹{(fv / 1000).toFixed(0)}k
                    <span className="text-muted-foreground ml-1">
                      (+{gainPercent}%)
                    </span>
                  </span>
                </div>
              </div>

              {/* Start Date */}
              <p className="text-xs text-muted-foreground">
                Started:{" "}
                {new Date(plan.start_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => {
                    setEditData(plan);
                    setAddOpen(true);
                  }}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs text-red-500 hover:text-red-600 hover:border-red-500"
                  onClick={() => setDeleteId(plan.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      <AddSIPDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        editData={editData}
        onSubmit={async (payload) => {
          if (editData) {
            await editSIP(editData.id, payload);
          } else {
            await createSIP(payload);
          }
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete SIP Plan?"
        description="This will permanently delete this SIP plan."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}