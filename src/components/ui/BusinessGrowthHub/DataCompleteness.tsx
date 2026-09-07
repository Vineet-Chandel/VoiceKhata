import React from "react";
import type { DataCompletenessData } from "@/services/business/types";
import { CheckCircle2, CircleDashed } from "lucide-react";

export function DataCompleteness({ data }: { data: DataCompletenessData }) {
  const Item = ({ label, isComplete, percentage }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        {percentage !== undefined ? (
          <span className="text-xs font-medium text-violet-400">{percentage}%</span>
        ) : (
          isComplete ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <CircleDashed size={16} className="text-text-muted" />
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col h-full animate-in fade-in duration-500">
      <h3 className="text-lg font-semibold text-text-primary mb-1">Business Data Completeness</h3>
      <p className="text-xs text-text-muted mb-4">
        Your business profile is usable, but customer and supplier data is incomplete. Sync more data to improve growth recommendations.
      </p>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <Item label="Business Identity" isComplete={data.businessIdentity} />
        <Item label="Revenue Data" isComplete={data.revenueData} />
        <Item label="Expense Data" isComplete={data.expenseData} />
        <Item label="Cash Data" isComplete={data.cashData} />
        <Item label="Inventory Data" percentage={data.inventoryData} />
        <Item label="Supplier Data" percentage={data.supplierData} />
        <Item label="Customer Data" percentage={data.customerData} />
        <Item label="Receivables" percentage={data.receivables} />
        <Item label="Payables" percentage={data.payables} />
        <Item label="Seasonality" percentage={data.seasonality} />
      </div>
    </div>
  );
}
