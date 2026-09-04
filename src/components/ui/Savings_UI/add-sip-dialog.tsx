// src/components/ui/Savings_UI/add-sip-dialog.tsx
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
import { type SIPPlan } from "@/lib/savings";

interface AddSIPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: Omit<SIPPlan, "id" | "firebase_uid" | "created_at">
  ) => Promise<void>;
  editData?: SIPPlan | null;
}

export function AddSIPDialog({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: AddSIPDialogProps) {
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [durationYears, setDurationYears] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("12");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSIP = () => {
    const p = Number(monthlyAmount);
    const n = Number(durationYears) * 12;
    const r = Number(expectedReturn) / 12 / 100;
    if (!p || !n || !r) return null;
    const fv = Math.round(p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const invested = p * n;
    const returns = fv - invested;
    return { fv, invested, returns };
  };

  const result = calculateSIP();

  useEffect(() => {
    if (editData) {
      setMonthlyAmount(String(editData.monthly_amount));
      setDurationYears(String(editData.duration_years));
      setExpectedReturn(String(editData.expected_return));
      setStartDate(new Date(editData.start_date));
      setActive(editData.active);
    } else {
      setMonthlyAmount("");
      setDurationYears("");
      setExpectedReturn("12");
      setStartDate(new Date());
      setActive(true);
    }
    setError(null);
  }, [editData, open]);

  const handleSubmit = async () => {
    setError(null);
    if (!monthlyAmount || isNaN(Number(monthlyAmount)))
      return setError("Enter a valid monthly amount.");
    if (Number(monthlyAmount) <= 0)
      return setError("Monthly amount must be greater than 0.");
    if (!durationYears || isNaN(Number(durationYears)))
      return setError("Enter a valid duration.");
    if (Number(durationYears) < 1 || Number(durationYears) > 40)
      return setError("Duration must be between 1 and 40 years.");
    if (Number(expectedReturn) < 1 || Number(expectedReturn) > 50)
      return setError("Expected return must be between 1% and 50%.");

    setLoading(true);
    try {
      await onSubmit({
        monthly_amount: Number(monthlyAmount),
        duration_years: Number(durationYears),
        expected_return: Number(expectedReturn),
        start_date: format(startDate, "yyyy-MM-dd"),
        active,
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
            {editData ? "Edit SIP Plan" : "Add SIP Plan"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Monthly Amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="monthly-amount">Monthly SIP Amount (₹)</Label>
            <Input
              id="monthly-amount"
              type="number"
              placeholder="e.g. 2000"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duration">Duration (Years)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g. 10"
              min={1}
              max={40}
              value={durationYears}
              onChange={(e) => setDurationYears(e.target.value)}
            />
          </div>

          {/* Expected Return */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expected-return">Expected Annual Return (%)</Label>
            <Input
              id="expected-return"
              type="number"
              placeholder="e.g. 12"
              min={1}
              max={50}
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
            />
          </div>

          {/* Start Date — Calendar Picker */}
          <div className="flex flex-col gap-1.5">
            <Label>Start Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {startDate ? format(startDate, "dd MMM yyyy") : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#18181c] border-[#2a2a2e]" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Live Preview */}
          {result && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-1">
              <p className="text-xs text-muted-foreground mb-1">Estimated returns</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Invested</span>
                <span>₹{result.invested.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Returns</span>
                <span className="text-green-500">₹{result.returns.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Final Value</span>
                <span className="text-green-400">₹{result.fv.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? editData ? "Saving..." : "Adding..."
              : editData ? "Save Changes" : "Add SIP Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}