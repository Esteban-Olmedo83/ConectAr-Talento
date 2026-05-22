-- ConectAr Talento - Admin system tables: system_updates, update_reads, tenant_billing

-- ─── system_updates ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.system_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('fix', 'feature', 'improvement', 'security')),
  target_tenant_id uuid, -- NULL = all tenants, specific uuid = just that tenant
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- Users can read published updates for their tenant or all-tenant updates
CREATE POLICY system_updates_user_select ON public.system_updates
  FOR SELECT USING (
    is_published = true AND (
      target_tenant_id IS NULL OR
      target_tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  );

-- ─── update_reads ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.update_reads (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  update_id uuid NOT NULL REFERENCES public.system_updates(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, update_id)
);

ALTER TABLE public.update_reads ENABLE ROW LEVEL SECURITY;

-- Users can insert their own read records
CREATE POLICY update_reads_insert ON public.update_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY update_reads_select ON public.update_reads
  FOR SELECT USING (user_id = auth.uid());

-- ─── tenant_billing ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'suspended', 'cancelled')),
  billing_email text,
  billing_name text,
  notes text,
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_billing ENABLE ROW LEVEL SECURITY;
-- No user-facing policies on tenant_billing — admin only via service_role

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_system_updates_published ON public.system_updates(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_updates_target ON public.system_updates(target_tenant_id);
CREATE INDEX IF NOT EXISTS idx_update_reads_user ON public.update_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_billing_tenant ON public.tenant_billing(tenant_id);

-- ─── Updated_at trigger for system_updates ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_system_updates_updated_at ON public.system_updates;
CREATE TRIGGER trg_system_updates_updated_at
  BEFORE UPDATE ON public.system_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_tenant_billing_updated_at ON public.tenant_billing;
CREATE TRIGGER trg_tenant_billing_updated_at
  BEFORE UPDATE ON public.tenant_billing
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();
