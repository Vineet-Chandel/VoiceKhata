-- ==============================================================================
-- VoiceKhata Business Growth Hub - Phase 1 Schema
-- ==============================================================================

-- 1. Business Profiles
create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null references public.user_profiles(firebase_uid) on delete cascade,
  business_name text,
  business_type text,
  business_category text,
  business_model text,
  operating_model text, -- Retail, Wholesale, Service, Mixed
  start_date text,
  operating_days text[],
  operating_hours jsonb,
  sales_channels text[],
  primary_location text,
  seasonality text[],
  employee_count integer,
  location_count integer,
  uses_inventory text, -- 'KNOWN', 'UNKNOWN', 'NOT_APPLICABLE'
  offers_customer_credit text,
  uses_supplier_credit text,
  uses_cash text,
  uses_upi text,
  uses_bank_transfers text,
  uses_pos text,
  readiness_state text default 'NOT_READY',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Business Transactions
create table if not exists public.business_transactions (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null references public.user_profiles(firebase_uid) on delete cascade,
  transaction_id bigint not null references public.transactions(id) on delete cascade,
  business_id uuid references public.business_profiles(id) on delete cascade,
  classification text not null, -- 'BUSINESS', 'PERSONAL', 'OWNER_DRAW', 'OWNER_CONTRIBUTION', 'TRANSFER', 'UNKNOWN'
  confidence numeric default 1.0,
  reason text,
  business_category text, -- 'Revenue', 'Cost of Goods', 'Operating Expenses', etc.
  revenue_source text,
  customer_id uuid,
  supplier_id uuid,
  product_id uuid,
  invoice_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(transaction_id)
);

-- 3. Business Customers
create table if not exists public.business_customers (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null references public.user_profiles(firebase_uid) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  name text not null,
  customer_type text,
  phone text,
  email text,
  total_purchases numeric default 0,
  outstanding_amount numeric default 0,
  last_purchase_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Business Suppliers
create table if not exists public.business_suppliers (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null references public.user_profiles(firebase_uid) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  name text not null,
  categories_supplied text[],
  payment_terms text,
  outstanding_payable numeric default 0,
  last_purchase_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Business Products (Inventory)
create table if not exists public.business_products (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null references public.user_profiles(firebase_uid) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  sku text,
  name text not null,
  category text,
  current_quantity integer,
  purchase_cost numeric,
  selling_price numeric,
  supplier_id uuid references public.business_suppliers(id) on delete set null,
  last_purchase_date text,
  last_sale_date text,
  units_sold integer default 0,
  stock_value numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Business Receivables
create table if not exists public.business_receivables (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null references public.user_profiles(firebase_uid) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  customer_id uuid references public.business_customers(id) on delete cascade,
  invoice_ref text,
  amount numeric not null,
  date text not null,
  due_date text,
  amount_paid numeric default 0,
  amount_outstanding numeric not null,
  status text, -- 'CURRENT', 'DUE_SOON', 'OVERDUE', 'LONG_OUTSTANDING', 'UNKNOWN'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Business Payables
create table if not exists public.business_payables (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null references public.user_profiles(firebase_uid) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  supplier_id uuid references public.business_suppliers(id) on delete cascade,
  invoice_ref text,
  amount numeric not null,
  date text not null,
  due_date text,
  amount_paid numeric default 0,
  amount_outstanding numeric not null,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Business Recurring Commitments
create table if not exists public.business_recurring_commitments (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null references public.user_profiles(firebase_uid) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  merchant text not null,
  category text,
  amount numeric not null,
  frequency text not null,
  last_occurrence text,
  next_expected_date text,
  confidence numeric default 1.0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.business_transactions add constraint fk_bt_customer foreign key (customer_id) references public.business_customers(id) on delete set null;
alter table public.business_transactions add constraint fk_bt_supplier foreign key (supplier_id) references public.business_suppliers(id) on delete set null;
alter table public.business_transactions add constraint fk_bt_product foreign key (product_id) references public.business_products(id) on delete set null;

alter table public.business_profiles enable row level security;
alter table public.business_transactions enable row level security;
alter table public.business_customers enable row level security;
alter table public.business_suppliers enable row level security;
alter table public.business_products enable row level security;
alter table public.business_receivables enable row level security;
alter table public.business_payables enable row level security;
alter table public.business_recurring_commitments enable row level security;

create policy "Allow all access to business_profiles" on public.business_profiles for all to anon, authenticated, service_role using (true) with check (true);
create policy "Allow all access to business_transactions" on public.business_transactions for all to anon, authenticated, service_role using (true) with check (true);
create policy "Allow all access to business_customers" on public.business_customers for all to anon, authenticated, service_role using (true) with check (true);
create policy "Allow all access to business_suppliers" on public.business_suppliers for all to anon, authenticated, service_role using (true) with check (true);
create policy "Allow all access to business_products" on public.business_products for all to anon, authenticated, service_role using (true) with check (true);
create policy "Allow all access to business_receivables" on public.business_receivables for all to anon, authenticated, service_role using (true) with check (true);
create policy "Allow all access to business_payables" on public.business_payables for all to anon, authenticated, service_role using (true) with check (true);
create policy "Allow all access to business_recurring_commitments" on public.business_recurring_commitments for all to anon, authenticated, service_role using (true) with check (true);
