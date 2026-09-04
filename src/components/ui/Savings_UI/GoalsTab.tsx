// src/components/ui/Savings_UI/GoalsTab.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddGoalDialog } from "./add-goal-dialog";
import { AddSavingsDialog } from "./add-savings-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { type SavingsGoal } from "@/lib/savings";
import { Pencil, Trash2, Plus, PiggyBank } from "lucide-react";

interface GoalsTabProps {
  goals: SavingsGoal[];
  loadingGoals: boolean;
  createGoal: (
    payload: Omit<SavingsGoal, "id" | "firebase_uid" | "created_at">
  ) => Promise<void>;
  editGoal: (
    id: string,
    payload: Partial<Omit<SavingsGoal, "id" | "firebase_uid" | "created_at">>
  ) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
}

export function GoalsTab({
  goals,
  loadingGoals,
  createGoal,
  editGoal,
  removeGoal,
}: GoalsTabProps) {
  const [addOpen, setAddOpen]         = useState(false);
  const [editData, setEditData]       = useState<SavingsGoal | null>(null);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add Savings dialog state
  const [savingsOpen, setSavingsOpen]         = useState(false);
  const [savingsGoalId, setSavingsGoalId]     = useState<string>("general");

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await removeGoal(deleteId);
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAddSavings = (goalId: string) => {
    setSavingsGoalId(goalId);
    setSavingsOpen(true);
  };

  // Called when AddSavingsDialog submits
  const handleAddSavings = async (
    goalId: string,
    amount: number,
    _source: string,
    _notes: string,
    _date: string
  ) => {
    if (goalId === "general") return; // no-op for general pool
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    await editGoal(goalId, {
      saved_amount: Math.min(goal.saved_amount + amount, goal.target_amount),
    });
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "#4ade80";
    if (percent >= 60)  return "#60a5fa";
    if (percent >= 30)  return "#f59e0b";
    return "#f87171";
  };

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    return Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  if (loadingGoals) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Loading goals...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Savings Goals</h2>
          <p className="text-sm text-muted-foreground">
            Track progress toward your financial targets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAddSavings("general")}
          >
            <PiggyBank className="w-4 h-4 mr-1" />
            Add Savings
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditData(null);
              setAddOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">No savings goals yet.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditData(null);
              setAddOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create your first goal
          </Button>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const percent       = Math.min(Math.round((goal.saved_amount / goal.target_amount) * 100), 100);
          const progressColor = goal.color || getProgressColor(percent);
          const daysLeft      = getDaysLeft(goal.deadline);
          const remaining     = goal.target_amount - goal.saved_amount;

          return (
            <div
              key={goal.id}
              className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{goal.name}</span>
                  {daysLeft !== null ? (
                    <span
                      className={`text-xs ${
                        daysLeft < 0
                          ? "text-red-500"
                          : daysLeft < 30
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {daysLeft < 0
                        ? `${Math.abs(daysLeft)} days overdue`
                        : daysLeft === 0
                        ? "Due today"
                        : `${daysLeft} days left`}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-600">∞ Timeless</span>
                  )}
                </div>
                <Badge
                  variant="outline"
                  style={{ borderColor: progressColor, color: progressColor }}
                >
                  {percent}%
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: progressColor }}
                />
              </div>

              {/* Amounts */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{goal.saved_amount.toLocaleString("en-IN")} saved</span>
                <span>₹{goal.target_amount.toLocaleString("en-IN")} target</span>
              </div>

              {remaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  ₹{remaining.toLocaleString("en-IN")} remaining
                </p>
              )}

              {percent >= 100 && (
                <p className="text-xs text-green-500 font-medium">
                  🎉 Goal achieved!
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-1">
                {/* Add Money — primary CTA per card */}
                {percent < 100 && (
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => openAddSavings(goal.id)}
                  >
                    <PiggyBank className="w-3 h-3 mr-1" />
                    Add Money
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setEditData(goal);
                    setAddOpen(true);
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-500"
                  onClick={() => setDeleteId(goal.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      <AddGoalDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        editData={editData}
        onSubmit={async (payload) => {
          if (editData) await editGoal(editData.id, payload);
          else await createGoal(payload);
        }}
      />

      <AddSavingsDialog
        open={savingsOpen}
        onOpenChange={setSavingsOpen}
        goals={goals}
        onSubmit={handleAddSavings}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Savings Goal?"
        description="This will permanently delete this goal and all its progress."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}