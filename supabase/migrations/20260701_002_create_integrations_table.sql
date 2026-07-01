-- Create integrations table for OAuth and manual integrations
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  platform text not null, -- linkedin, gmail, outlook, zoom, whatsapp, computrabajo, zonajobs, etc.
  account_name text not null,
  account_email text,
  status text not null default 'connected', -- connected, expired, error, pending
  access_token text, -- OAuth access token
  refresh_token text, -- OAuth refresh token (if supported)
  token_expires_at timestamptz, -- When access token expires
  expires_at timestamptz, -- For manual credential expiry
  metadata jsonb, -- Any additional data (e.g., folder IDs, sheet IDs, campaign IDs)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, platform) -- One account per platform per tenant
);

-- Enable RLS
alter table public.integrations enable row level security;

-- Policy: Users can read their own integrations (via tenant_id match in profiles)
create policy "integrations_user_select"
  on public.integrations for select
  using (
    tenant_id = (
      select tenant_id from public.profiles where id = auth.uid()
    )
  );

-- Policy: Service role (admin) can insert/update/delete
create policy "integrations_service_role"
  on public.integrations
  using (auth.role() = 'service_role');

-- Index for fast lookups
create index if not exists idx_integrations_tenant_platform
  on public.integrations(tenant_id, platform);

create index if not exists idx_integrations_tenant
  on public.integrations(tenant_id);
