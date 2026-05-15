-- Apply via: Supabase Dashboard > SQL Editor, or supabase db push

-- ── A. Ensure tenant_id defaults to auth.uid() in profiles ───

ALTER TABLE profiles
  ALTER COLUMN tenant_id SET DEFAULT auth.uid();

-- Add updated_at column if it doesn't exist yet
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Add unique constraint on message_templates to support ON CONFLICT DO NOTHING
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'message_templates_tenant_name_channel_key'
  ) THEN
    ALTER TABLE public.message_templates
      ADD CONSTRAINT message_templates_tenant_name_channel_key
      UNIQUE (tenant_id, name, channel);
  END IF;
END $$;

-- ── B. Create/replace the handle_new_user trigger function ───

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_plan text;
BEGIN
  v_plan := COALESCE(NEW.raw_user_meta_data->>'plan', 'free');

  -- Upsert profile (safe if trigger already fired or profile was created manually)
  INSERT INTO public.profiles (
    id,
    tenant_id,
    full_name,
    company_name,
    plan,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id,  -- tenant_id = user id (each user is their own tenant until org feature)
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    v_plan,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    tenant_id = COALESCE(profiles.tenant_id, EXCLUDED.tenant_id),
    full_name  = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    company_name = CASE WHEN profiles.company_name = '' THEN EXCLUDED.company_name ELSE profiles.company_name END,
    plan = EXCLUDED.plan,
    updated_at = NOW();

  -- Seed default message templates for the new user
  INSERT INTO public.message_templates (tenant_id, name, channel, category, body, is_default)
  VALUES
    (NEW.id, 'Confirmación de entrevista', 'email', 'interview',
     'Hola {{candidate_name}},\n\nQuería confirmar tu entrevista para el puesto de {{vacancy_title}} el {{date}} a las {{time}}.\n\nNos vemos pronto!\n\n{{company_name}}',
     true),
    (NEW.id, 'Bienvenida al proceso', 'email', 'welcome',
     'Hola {{candidate_name}},\n\nGracias por postularte a {{vacancy_title}} en {{company_name}}. Hemos recibido tu CV y lo estamos revisando.\n\nTe contactaremos pronto con novedades.\n\nSaludos,\n{{company_name}}',
     true),
    (NEW.id, 'Recordatorio entrevista WhatsApp', 'whatsapp', 'reminder',
     'Hola {{candidate_name}}! 👋 Te recuerdo que mañana tenés entrevista para {{vacancy_title}} a las {{time}}. ¿Confirmás asistencia?',
     true),
    (NEW.id, 'Oferta de trabajo', 'email', 'offer',
     'Estimado/a {{candidate_name}},\n\nEs un placer comunicarte que hemos decidido hacerte una oferta para el puesto de {{vacancy_title}}.\n\nRemuneración: {{salary}}\nFecha de inicio: {{start_date}}\n\nPor favor confirmanos tu decisión antes del {{deadline}}.\n\n{{company_name}}',
     true)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- ── C. Register the trigger (drop if exists first) ────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── D. Add RLS helper function for plan limits ────────────────

-- Function to get the integration limit for current user's plan
CREATE OR REPLACE FUNCTION public.get_plan_integration_limit()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT CASE (SELECT plan FROM public.profiles WHERE id = auth.uid())
    WHEN 'free'       THEN 1
    WHEN 'starter'    THEN 1
    WHEN 'pro'        THEN 3
    WHEN 'business'   THEN 5
    WHEN 'enterprise' THEN 999
    ELSE 1
  END;
$$;
