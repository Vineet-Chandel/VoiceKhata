// src/components/ui/Savings_UI/add-savings-dialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Briefcase,
  TrendingUp,
  HandCoins,
  ReceiptText,
  Laptop,
  Gift,
  PiggyBank,
  ChevronDownIcon,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { type SavingsGoal } from "@/lib/savings";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const SOURCES = [
  { value: "salary",            label: "Salary",            Icon: Briefcase   },
  { value: "investment_return", label: "Investment Return", Icon: TrendingUp  },
  { value: "manual",            label: "Manual Transfer",   Icon: HandCoins   },
  { value: "cashback",          label: "Cashback / Refund", Icon: ReceiptText },
  { value: "freelance",         label: "Freelance",         Icon: Laptop      },
  { value: "gift",              label: "Gift / Bonus",      Icon: Gift        },
];

interface AddSavingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: SavingsGoal[];
  onSubmit: (
    goalId: string,
    amount: number,
    source: string,
    notes: string,
    date: string
  ) => Promise<void>;
}

export function AddSavingsDialog({
  open,
  onOpenChange,
  goals,
  onSubmit,
}: AddSavingsDialogProps) {
  const [amount, setAmount]   = useState("");
  const [source, setSource]   = useState("manual");
  const [goalId, setGoalId]   = useState("general");
  const [notes, setNotes]     = useState("");
  const [date, setDate]       = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setSource("manual");
      setGoalId(goals.length > 0 ? goals[0].id : "general");
      setNotes("");
      setDate(new Date());
      setError(null);
    }
  }, [open, goals]);

  const selectedGoal   = goals.find((g) => g.id === goalId);
  const numAmount      = Number(amount);

  const currentPercent = selectedGoal
    ? ((selectedGoal.saved_amount / selectedGoal.target_amount) * 100).toFixed(1)
    : null;

  const afterPercent   = selectedGoal && numAmount > 0
    ? Math.min(
        ((selectedGoal.saved_amount + numAmount) / selectedGoal.target_amount) * 100,
        100
      ).toFixed(1)
    : null;

  const remainingAfter = selectedGoal && numAmount > 0
    ? Math.max(selectedGoal.target_amount - selectedGoal.saved_amount - numAmount, 0)
    : null;

  const suggestedGoal = goals.length
    ? [...goals]
        .filter((g) => g.saved_amount < g.target_amount)
        .sort((a, b) => a.saved_amount / a.target_amount - b.saved_amount / b.target_amount)[0]
    : null;

  const handleSubmit = async () => {
    setError(null);
    if (!amount || isNaN(numAmount) || numAmount <= 0)
      return setError("Enter a valid amount greater than 0.");
    setLoading(true);
    try {
      await onSubmit(
        goalId,
        numAmount,
        source,
        notes,
        format(date, "yyyy-MM-dd")
      );
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-muted-foreground" />
            Add Savings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">

          {/* Quick Add */}
          <div className="flex flex-col gap-1.5">
            <Label>Quick Add</Label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`py-1.5 rounded-md text-sm border transition-all ${
                    amount === String(q)
                      ? "bg-white text-black border-white font-medium"
                      : "border-border text-text-secondary hover:border-zinc-400 hover:text-text-secondary"
                  }`}
                >
                  ₹{q >= 1000 ? `${q / 1000}k` : q}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="saving-amount">Amount (₹)</Label>
            <Input
              id="saving-amount"
              type="number"
              placeholder="e.g. 3000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Source */}
          <div className="flex flex-col gap-1.5">
            <Label>Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map(({ value, label, Icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add To */}
          <div className="flex flex-col gap-1.5">
            <Label>Add To</Label>
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Savings Pool</SelectItem>
                {goals.map((g) => {
                  const pct = Math.min(
                    Math.round((g.saved_amount / g.target_amount) * 100),
                    100
                  );
                  return (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} — {pct}%
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {suggestedGoal && goalId === "general" && (
              <button
                type="button"
                onClick={() => setGoalId(suggestedGoal.id)}
                className="text-left text-xs text-amber-400 mt-1 hover:text-amber-300 transition-colors"
              >
                Suggested: allocate to <strong>{suggestedGoal.name}</strong>{" "}
                ({Math.round(
                  (suggestedGoal.saved_amount / suggestedGoal.target_amount) * 100
                )}% complete) — tap to select
              </button>
            )}
          </div>

          {/* Impact Preview */}
          {afterPercent && selectedGoal && (
            <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2.5 flex flex-col gap-1.5">
              <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                Impact Preview
              </span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-secondary">{currentPercent}%</span>
                <span className="text-zinc-600">→</span>
                <span className="text-green-400 font-semibold text-base">
                  {afterPercent}%
                </span>
                <span className="text-text-secondary">complete</span>
              </div>
              <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${afterPercent}%` }}
                />
              </div>
              {remainingAfter !== null && remainingAfter > 0 && (
                <span className="text-xs text-text-secondary">
                  ₹{remainingAfter.toLocaleString("en-IN")} still remaining
                </span>
              )}
              {remainingAfter === 0 && (
                <span className="text-xs text-green-500 font-medium">
                  This will complete your goal
                </span>
              )}
            </div>
          )}

          {/* Date (UPDATED with Calendar + Dropdown) */}
          <div className="flex flex-col gap-1.5">
            <Label>Date</Label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {format(date, "PPP")}
                  <ChevronDownIcon className="w-4 h-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(d) => d > new Date()}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="saving-notes">Notes (optional)</Label>
            <Input
              id="saving-notes"
              placeholder="e.g. April salary surplus"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Savings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}