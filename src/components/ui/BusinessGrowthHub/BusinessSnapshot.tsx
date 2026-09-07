import React from "react";
import type { BusinessSnapshotData } from "@/services/business/types";
import { TrendingUp, Banknote, ShoppingCart, Users, Package } from "lucide-react";

export function BusinessSnapshot({ data }: { data: BusinessSnapshotData }) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  const Card = ({ title, value, status, icon: Icon, confidence }: any) => (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between text-text-secondary">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-violet-400" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {confidence < 0.5 ? (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Estimated</span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Confirmed</span>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary mt-2">{formatter.format(value)}</div>
      {status && <div className="text-xs text-text-muted mt-1">{status}</div>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card 
        title="Monthly Revenue" 
        value={data.monthlyRevenue} 
        confidence={data.monthlyRevenueConfidence}
        icon={TrendingUp} 
      />
      <Card 
        title="Outstanding Receivables" 
        value={data.outstandingReceivables} 
        confidence={data.outstandingReceivablesConfidence}
        icon={Users} 
        status="Money owed to you"
      />
      <Card 
        title="Outstanding Payables" 
        value={data.outstandingPayables} 
        confidence={data.outstandingPayablesConfidence}
        icon={Banknote} 
        status="Money you owe suppliers"
      />
      <Card 
        title="Inventory Value" 
        value={data.inventoryValue} 
        confidence={data.inventoryValueConfidence}
        icon={Package} 
      />
      <Card 
        title="Direct Costs" 
        value={data.estimatedDirectCosts} 
        confidence={data.estimatedDirectCostsConfidence}
        icon={ShoppingCart} 
      />
      <Card 
        title="Operating Expenses" 
        value={data.knownOperatingExpenses} 
        confidence={data.knownOperatingExpensesConfidence}
        icon={TrendingUp} 
      />
    </div>
  );
}
