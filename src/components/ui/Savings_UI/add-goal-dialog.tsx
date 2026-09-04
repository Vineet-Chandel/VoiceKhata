// src/components/ui/Savings_UI/add-goal-dialog.tsx
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { type SavingsGoal } from "@/lib/savings";

const COLORS = [
  "#4ade80",
  "#60a5fa",
  "#f59e0b",
  "#f87171",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#e879f9",
];

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: Omit<SavingsGoal, "id" | "firebase_uid" | "created_at">
  ) => Promise<void>;
  editData?: SavingsGoal | null;
}

export function AddGoalDialog({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: AddGoalDialogProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeless, setTimeless] = useState(false);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setTargetAmount(String(editData.target_amount));
      setSavedAmount(String(editData.saved_amount));
      setDeadline(editData.deadline ? new Date(editData.deadline) : undefined);
      setColor(editData.color);
      setTimeless(!editData.deadline); // ← add this
    } else {
      setName("");
      setTargetAmount("");
      setSavedAmount("0");
      setDeadline(undefined);
      setColor(COLORS[0]);
      setTimeless(false); // ← add this
    }
    setError(null);
  }, [editData, open]);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) return setError("Goal name is required.");
    if (!targetAmount || isNaN(Number(targetAmount)))
      return setError("Enter a valid target amount.");
    if (Number(targetAmount) <= 0)
      return setError("Target amount must be greater than 0.");
    if (savedAmount && Number(savedAmount) > Number(targetAmount))
      return setError("Saved amount cannot exceed target amount.");

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        target_amount: Number(targetAmount),
        saved_amount: Number(savedAmount) || 0,
        deadline: deadline ? format(deadline, "yyyy-MM-dd") : null,
        color,
      });
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
          <DialogTitle>
            {editData ? "Edit Goal" : "Add Savings Goal"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              placeholder="e.g. Emergency Fund, New Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Target Amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="target-amount">Target Amount (₹)</Label>
            <Input
              id="target-amount"
              type="number"
              placeholder="e.g. 50000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>

          {/* Saved Amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="saved-amount">Already Saved (₹)</Label>
            <Input
              id="saved-amount"
              type="number"
              placeholder="e.g. 10000"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
            />
          </div>

          {/* Deadline — Calendar Picker */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>Deadline (optional)</Label>
              <button
                type="button"
                onClick={() => {
                  setDeadline(undefined);
                  setTimeless((v) => !v);
                }}
                className={`text-xs px-2 py-0.5 rounded-full border transition-all ${timeless
                  ? "bg-white text-black border-white"
                  : "text-text-secondary border-zinc-600 hover:border-zinc-400"
                  }`}
              >
                ∞ Timeless
              </button>
            </div>

            {!timeless && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {deadline ? format(deadline, "dd MMM yyyy") : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#18181c] border-[#2a2a2e]" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(date) => {
                      setDeadline(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  {deadline && (
                    <div className="border-t border-[#2a2a2e] p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-text-secondary hover:text-text-primary text-xs"
                        onClick={() => {
                          setDeadline(undefined);
                          setCalendarOpen(false);
                        }}
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}

            {timeless && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-text-secondary text-sm">
                <span>∞</span>
                <span>No deadline — this goal runs forever</span>
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#fff" : "transparent",
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? editData ? "Saving..." : "Adding..."
              : editData ? "Save Changes" : "Add Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}