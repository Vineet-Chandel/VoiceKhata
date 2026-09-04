# FinEase Supabase Migrations Guide

This folder contains the official database migrations for FinEase.

---

## Migration Files

| Migration File | Description |
| :--- | :--- |
| [`20260818000001_initial_schema.sql`](./20260818000001_initial_schema.sql) | Base database schema: creates all 14 tables, foreign keys, cascade deletes, performance indexes, RPC functions, and avatars bucket. |
| [`20260818000002_fix_rls_policies.sql`](./20260818000002_fix_rls_policies.sql) | **Fixes all RLS Row issues**: configures permissive RLS policies and table grants across all public tables and storage buckets for Firebase Auth + Supabase anon client integration. |

---

## How to Apply Migrations in Supabase

### Option 1: Supabase Web Dashboard (Easiest)
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** (left navigation bar) -> click **New Query**.
3. Copy and paste the contents of [`20260818000002_fix_rls_policies.sql`](./20260818000002_fix_rls_policies.sql) (or both migrations if setting up a fresh database).
4. Click **Run** (green button).

---

### Option 2: Supabase CLI
If using Supabase CLI:
```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-id>

# Push all migrations
npx supabase db push
```

---

## Why RLS Issues Occur and How This Fix Resolves Them
FinEase uses **Firebase Authentication** on the client side with the Supabase **Anon Key**. Because native `auth.uid()` belongs to Supabase Auth and returns `NULL` for Firebase-authenticated anon clients, default restrictive RLS policies block row inserts and reads.

[`20260818000002_fix_rls_policies.sql`](./20260818000002_fix_rls_policies.sql) establishes:
- Schema-wide usage and default table privileges for `anon`, `authenticated`, and `service_role`.
- Permissive RLS policies (`FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true)`) on all 14 tables.
- Storage bucket policies on `storage.objects` for avatar uploads, updates, and deletes.
- Dynamic safety-net PL/pgSQL block ensuring any new tables also receive matching policies.
