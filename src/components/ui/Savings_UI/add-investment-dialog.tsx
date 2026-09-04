// src/components/ui/Savings_UI/add-investment-dialog.tsx
import { useState, useEffect, useMemo } from "react";
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
import { type ManualInvestment } from "@/lib/savings";

const INVESTMENT_TYPES = [
  { value: "stocks",      label: "📈 Stocks" },
  { value: "mutual_fund", label: "🏦 Mutual Fund" },
  { value: "crypto",      label: "₿ Crypto" },
  { value: "gold",        label: "🥇 Gold" },
  { value: "fd",          label: "🔒 Fixed Deposit" },
  { value: "ppf",         label: "🏛️ PPF" },
  { value: "nps",         label: "🧾 NPS" },
  { value: "etf",         label: "📊 ETF" },
  { value: "other",       label: "📦 Other" },
];

// Types where price-based entry makes sense
const PRICE_BASED_TYPES = ["stocks", "crypto", "etf", "gold", "mutual_fund"];

// ── CAGR helper ────────────────────────────────────────────────────────────
function calcCAGR(vi: number, vf: number, years: number): number | null {
  if (vi <= 0 || vf <= 0 || years <= 0) return null;
  return ((Math.pow(vf / vi, 1 / years) - 1) * 100);
}

interface AddInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: Omit<ManualInvestment, "id" | "firebase_uid" | "added_at">
  ) => Promise<void>;
  editData?: ManualInvestment | null;
}

export function AddInvestmentDialog({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: AddInvestmentDialogProps) {
  // ── Core fields ──────────────────────────────────────
  const [name, setName]           = useState("");
  const [type, setType]           = useState("stocks");

  // Mode: "price" = qty + buy price + current price | "amount" = lump sum + expected return
  const [mode, setMode]           = useState<"price" | "amount">("price");

  // Price mode fields
  const [quantity, setQuantity]   = useState("");
  const [buyPrice, setBuyPrice]   = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [buyDate, setBuyDate]     = useState(format(new Date(), "yyyy-MM-dd"));

  // Amount mode fields
  const [amountInvested, setAmountInvested] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("10");

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Auto-switch mode based on type
  useEffect(() => {
    if (PRICE_BASED_TYPES.includes(type)) setMode("price");
    else setMode("amount");
  }, [type]);

  // Populate on edit
  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setType(editData.type);
      setAmountInvested(String(editData.amount_invested));
      setExpectedReturn(String(editData.expected_return));
      // price-mode fields not stored — leave blank for edit
      setQuantity("");
      setBuyPrice("");
      setCurrentPrice("");
      setBuyDate(format(new Date(), "yyyy-MM-dd"));
      setMode("amount"); // edit always uses amount mode
    } else {
      setName("");
      setType("stocks");
      setMode("price");
      setQuantity("");
      setBuyPrice("");
      setCurrentPrice("");
      setBuyDate(format(new Date(), "yyyy-MM-dd"));
      setAmountInvested("");
      setExpectedReturn("10");
    }
    setError(null);
  }, [editData, open]);

  // ── Computed preview (price mode) ────────────────────
  const preview = useMemo(() => {
    const qty = Number(quantity);
    const bp  = Number(buyPrice);
    const cp  = Number(currentPrice);

    if (!qty || !bp || qty <= 0 || bp <= 0) return null;

    const totalInvested   = qty * bp;
    const currentValue    = cp > 0 ? qty * cp : null;
    const profitLoss      = currentValue !== null ? currentValue - totalInvested : null;
    const profitLossPct   = profitLoss !== null ? (profitLoss / totalInvested) * 100 : null;

    // Years held for CAGR
    const msHeld  = Date.now() - new Date(buyDate).getTime();
    const yrsHeld = msHeld / (1000 * 60 * 60 * 24 * 365);
    const cagr    = currentValue !== null ? calcCAGR(totalInvested, currentValue, yrsHeld) : null;

    // Implied annual return for storage
    const impliedReturn = cagr !== null ? Math.max(0, Math.round(cagr * 10) / 10) : 10;

    return {
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPct,
      cagr,
      impliedReturn,
      yrsHeld,
    };
  }, [quantity, buyPrice, currentPrice, buyDate]);

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) return setError("Investment name is required.");

    let finalAmount  = 0;
    let finalReturn  = 10;

    if (mode === "price") {
      if (!quantity || Number(quantity) <= 0) return setError("Enter a valid quantity.");
      if (!buyPrice || Number(buyPrice) <= 0)  return setError("Enter a valid buy price.");
      finalAmount  = Number(quantity) * Number(buyPrice);
      finalReturn  = preview?.impliedReturn ?? 10;
    } else {
      if (!amountInvested || Number(amountInvested) <= 0)
        return setError("Enter a valid invested amount.");
      if (Number(expectedReturn) < 0 || Number(expectedReturn) > 200)
        return setError("Expected return must be between 0% and 200%.");
      finalAmount  = Number(amountInvested);
      finalReturn  = Number(expectedReturn);
    }

    setLoading(true);
    try {
      await onSubmit({
        name:            name.trim(),
        type,
        amount_invested: finalAmount,
        expected_return: finalReturn,
      });
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isPriceBased = PRICE_BASED_TYPES.includes(type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Investment" : "Add Investment"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-name">Investment Name</Label>
            <Input
              id="inv-name"
              placeholder="e.g. Reliance Industries, Bitcoin, Mirae Asset"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <Label>Investment Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode toggle — only for price-based types when not editing */}
          {isPriceBased && !editData && (
            <div className="flex rounded-lg border border-border overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setMode("price")}
                className={`flex-1 py-1.5 text-center transition-colors ${
                  mode === "price"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Price Based
              </button>
              <button
                type="button"
                onClick={() => setMode("amount")}
                className={`flex-1 py-1.5 text-center transition-colors ${
                  mode === "amount"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Amount Based
              </button>
            </div>
          )}

          {/* ── PRICE MODE ── */}
          {mode === "price" && !editData && (
            <>
              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="qty">Quantity / Units</Label>
                <Input
                  id="qty"
                  type="number"
                  placeholder="e.g. 10 shares, 0.5 BTC"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              {/* Buy Price */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="buy-price">Buy Price per Unit (₹)</Label>
                <Input
                  id="buy-price"
                  type="number"
                  placeholder="e.g. 2450"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                />
              </div>

              {/* Buy Date */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="buy-date">Date of Purchase</Label>
                <Input
                  id="buy-date"
                  type="date"
                  value={buyDate}
                  max={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setBuyDate(e.target.value)}
                />
              </div>

              {/* Current Price */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cur-price">
                  Current Price per Unit (₹)
                  <span className="text-text-secondary text-xs ml-1.5">optional</span>
                </Label>
                <Input
                  id="cur-price"
                  type="number"
                  placeholder="Leave blank if unknown"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                />
              </div>
            </>
          )}

          {/* ── AMOUNT MODE ── */}
          {(mode === "amount" || editData) && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount-inv">Amount Invested (₹)</Label>
                <Input
                  id="amount-inv"
                  type="number"
                  placeholder="e.g. 25000"
                  value={amountInvested}
                  onChange={(e) => setAmountInvested(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exp-return">Expected Annual Return (%)</Label>
                <Input
                  id="exp-return"
                  type="number"
                  placeholder="e.g. 12"
                  min={0}
                  max={200}
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                />
              </div>
            </>
          )}

          {/* ── LIVE PREVIEW (price mode) ── */}
          {preview && mode === "price" && (
            <div className="rounded-lg border border-border bg-surface-elevated p-3 flex flex-col gap-2">
              <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                Live Preview
              </span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-secondary text-xs">Total Invested</span>
                  <span className="font-medium">
                    ₹{preview.totalInvested.toLocaleString("en-IN")}
                  </span>
                </div>
                {preview.currentValue !== null && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-secondary text-xs">Current Value</span>
                    <span className="font-medium text-blue-400">
                      ₹{Math.round(preview.currentValue).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {preview.profitLoss !== null && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-secondary text-xs">P & L</span>
                    <span
                      className={`font-medium ${
                        preview.profitLoss >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {preview.profitLoss >= 0 ? "+" : ""}₹
                      {Math.round(Math.abs(preview.profitLoss)).toLocaleString("en-IN")}
                      <span className="text-xs ml-1">
                        ({preview.profitLossPct !== null
                          ? (preview.profitLossPct >= 0 ? "+" : "") +
                            preview.profitLossPct.toFixed(1) + "%"
                          : ""})
                      </span>
                    </span>
                  </div>
                )}
                {preview.cagr !== null && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-secondary text-xs">CAGR</span>
                    <span
                      className={`font-medium ${
                        preview.cagr >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {preview.cagr >= 0 ? "+" : ""}
                      {preview.cagr.toFixed(2)}% p.a.
                    </span>
                  </div>
                )}
              </div>
              {preview.yrsHeld > 0 && (
                <p className="text-xs text-zinc-600">
                  Held for {preview.yrsHeld < 1
                    ? `${Math.round(preview.yrsHeld * 12)} months`
                    : `${preview.yrsHeld.toFixed(1)} years`}
                </p>
              )}
            </div>
          )}

          {/* Amount mode 1yr preview */}
          {mode === "amount" && amountInvested && expectedReturn && !editData && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated value after 1 year</span>
              <span className="text-green-400 font-medium">
                ₹{Math.round(
                  Number(amountInvested) * (1 + Number(expectedReturn) / 100)
                ).toLocaleString("en-IN")}
              </span>
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
              : editData ? "Save Changes" : "Add Investment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}