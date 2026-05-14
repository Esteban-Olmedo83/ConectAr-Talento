-- ConectAr Talento - Executive Clean reports storage
-- Safe to run once on Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.report_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  code text not null,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists public.report_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  template_id uuid references public.report_templates(id) on delete set null,
  period_key text not null,
  period_from date not null,
  period_to date not null,
  kpis jsonb not null default '{}'::jsonb,
  summary text not null default '',
  recommendations jsonb not null default '[]'::jsonb,
  generated_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_report_templates_tenant on public.report_templates(tenant_id);
create index if not exists idx_report_snapshots_tenant on public.report_snapshots(tenant_id);
create index if not exists idx_report_snapshots_period on public.report_snapshots(tenant_id, period_from, period_to);

alter table public.report_templates enable row level security;
alter table public.report_snapshots enable row level security;

drop policy if exists report_templates_select on public.report_templates;
drop policy if exists report_templates_all on public.report_templates;
drop policy if exists report_snapshots_select on public.report_snapshots;
drop policy if exists report_snapshots_all on public.report_snapshots;

create policy report_templates_select
on public.report_templates
for select
using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', ''));

create policy report_templates_all
on public.report_templates
for all
using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', ''))
with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', ''));

create policy report_snapshots_select
on public.report_snapshots
for select
using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', ''));

create policy report_snapshots_all
on public.report_snapshots
for all
using (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', ''))
with check (tenant_id = coalesce(auth.jwt() ->> 'tenant_id', ''));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_report_templates_updated_at on public.report_templates;
create trigger trg_report_templates_updated_at
before update on public.report_templates
for each row
execute function public.touch_updated_at();
