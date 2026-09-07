export interface BusinessMeta {
  sourceCount: number;
  dataQuality: 'NOT_READY' | 'PARTIALLY_READY' | 'READY' | 'HIGH_CONFIDENCE';
  lastUpdated: string;
}

export interface BusinessResponse<T> {
  data: T;
  meta: BusinessMeta;
}

export interface BusinessProfile {
  id?: string;
  firebase_uid: string;
  business_name?: string;
  business_type?: string;
  business_category?: string;
  business_model?: string;
  operating_model?: string;
  start_date?: string;
  operating_days?: string[];
  operating_hours?: any;
  sales_channels?: string[];
  primary_location?: string;
  seasonality?: string[];
  employee_count?: number;
  location_count?: number;
  uses_inventory?: 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE';
  offers_customer_credit?: 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE';
  uses_supplier_credit?: 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE';
  uses_cash?: 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE';
  uses_upi?: 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE';
  uses_bank_transfers?: 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE';
  uses_pos?: 'KNOWN' | 'UNKNOWN' | 'NOT_APPLICABLE';
  readiness_state?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessTransaction {
  id?: string;
  firebase_uid: string;
  transaction_id: number;
  business_id?: string;
  classification: 'BUSINESS' | 'PERSONAL' | 'OWNER_DRAW' | 'OWNER_CONTRIBUTION' | 'TRANSFER' | 'UNKNOWN';
  confidence: number;
  reason?: string;
  business_category?: string;
  revenue_source?: string;
  customer_id?: string;
  supplier_id?: string;
  product_id?: string;
  invoice_ref?: string;
}

export interface BusinessCustomer {
  id?: string;
  firebase_uid: string;
  business_id: string;
  name: string;
  customer_type?: string;
  phone?: string;
  email?: string;
  total_purchases: number;
  outstanding_amount: number;
  last_purchase_date?: string;
}

export interface BusinessSupplier {
  id?: string;
  firebase_uid: string;
  business_id: string;
  name: string;
  categories_supplied?: string[];
  payment_terms?: string;
  outstanding_payable: number;
  last_purchase_date?: string;
}

export interface BusinessProduct {
  id?: string;
  firebase_uid: string;
  business_id: string;
  sku?: string;
  name: string;
  category?: string;
  current_quantity?: number;
  purchase_cost?: number;
  selling_price?: number;
  supplier_id?: string;
  last_purchase_date?: string;
  last_sale_date?: string;
  units_sold: number;
  stock_value: number;
}

export interface BusinessReceivable {
  id?: string;
  firebase_uid: string;
  business_id: string;
  customer_id?: string;
  invoice_ref?: string;
  amount: number;
  date: string;
  due_date?: string;
  amount_paid: number;
  amount_outstanding: number;
  status?: 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'LONG_OUTSTANDING' | 'UNKNOWN';
}

export interface BusinessPayable {
  id?: string;
  firebase_uid: string;
  business_id: string;
  supplier_id?: string;
  invoice_ref?: string;
  amount: number;
  date: string;
  due_date?: string;
  amount_paid: number;
  amount_outstanding: number;
  status?: 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'LONG_OUTSTANDING' | 'UNKNOWN';
}

export interface BusinessRecurringCommitment {
  id?: string;
  firebase_uid: string;
  business_id: string;
  merchant: string;
  category?: string;
  amount: number;
  frequency: string;
  last_occurrence?: string;
  next_expected_date?: string;
  confidence: number;
}

export interface BusinessSnapshotData {
  monthlyRevenue: number;
  monthlyRevenueConfidence: number;
  estimatedDirectCosts: number;
  estimatedDirectCostsConfidence: number;
  knownOperatingExpenses: number;
  knownOperatingExpensesConfidence: number;
  knownBusinessCash: number;
  knownBusinessCashConfidence: number;
  outstandingReceivables: number;
  outstandingReceivablesConfidence: number;
  outstandingPayables: number;
  outstandingPayablesConfidence: number;
  inventoryValue: number;
  inventoryValueConfidence: number;
  recurringCommitments: number;
  recurringCommitmentsConfidence: number;
}

export interface DataCompletenessData {
  businessIdentity: boolean;
  revenueData: boolean;
  expenseData: boolean;
  inventoryData: number; // percentage 0-100
  supplierData: number;
  customerData: number;
  receivables: number;
  payables: number;
  cashData: boolean;
  seasonality: number;
}
