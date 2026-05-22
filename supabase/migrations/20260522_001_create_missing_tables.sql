-- ConectAr Talento - Create missing tables: clients, job_rubros, job_profiles
-- Safe to run once on Supabase SQL Editor

-- ─── clients ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  industry text,
  contact_name text,
  contact_email text,
  recruitment_email text,
  contact_phone text,
  whatsapp_phone text,
  address text,
  interview_address text,
  interview_arrival_details text,
  website text,
  logo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clients_tenant_all ON public.clients;
CREATE POLICY clients_tenant_all ON public.clients
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON public.clients(tenant_id);

-- ─── Add client_id to vacancies and candidates ────────────────────────────────
ALTER TABLE public.vacancies ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- ─── job_rubros ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_rubros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_rubros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_rubros_tenant_all ON public.job_rubros;
CREATE POLICY job_rubros_tenant_all ON public.job_rubros
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_job_rubros_tenant_id ON public.job_rubros(tenant_id);

-- ─── job_profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  rubro text NOT NULL,
  perfil text NOT NULL,
  nivel text NOT NULL,
  skills_tecnicas text[] NOT NULL DEFAULT '{}',
  skills_blandas text[] NOT NULL DEFAULT '{}',
  skills_herramientas text[] NOT NULL DEFAULT '{}',
  skills_certificaciones text[] NOT NULL DEFAULT '{}',
  descripcion_tipica text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_profiles_tenant_all ON public.job_profiles;
CREATE POLICY job_profiles_tenant_all ON public.job_profiles
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_job_profiles_tenant_id ON public.job_profiles(tenant_id);
