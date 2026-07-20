-- Security fix (CRITICAL): tres fugas de datos activas encontradas en la
-- auditoría de seguridad completa del 2026-07-19, confirmadas explotables
-- sin necesidad de autenticarse en dos de los tres casos.

-- ─────────────────────────────────────────────────────────────────────
-- A) Bucket "cvs" de Storage: cualquiera (sin login) podía descargar el
-- CV de cualquier candidato de cualquier tenant, usando solo la API key
-- pública del sitio, gracias a una policy que otorgaba SELECT al rol
-- "public" sin ningún filtro de tenant. La policy correcta que sí
-- respeta el tenant ("Tenant can access own files in cvs") ya existe y
-- queda intacta.
-- ─────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "CV public read" ON storage.objects;

-- ─────────────────────────────────────────────────────────────────────
-- B) Tabla profiles.integrations: dos policies de SELECT sin ningún
-- filtro de tenant exponían account_email/account_name/platform (y
-- tokens cifrados) de TODOS los tenants — una a cualquiera sin login
-- (USING true) y otra a cualquier usuario autenticado de cualquier
-- empresa (auth.uid() IS NOT NULL). El acceso correcto ya existe vía
-- "Acceso a integraciones del tenant" / "Tenant isolation for
-- integrations" (ambas ALL, scoped por profiles.tenant_id) y queda
-- intacto, igual que el acceso de service_role.
-- ─────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "integrations_select_all" ON public.integrations;
DROP POLICY IF EXISTS "integrations_user_select" ON public.integrations;

-- ─────────────────────────────────────────────────────────────────────
-- C) applications / interviews: cada tabla tiene dos claves foráneas
-- que deben pertenecer al mismo tenant (vacancy_id + candidate_id), pero
-- las policies existentes (acumuladas de distintas migraciones, nunca
-- consolidadas) solo validaban UNA de las dos en insert/update. Un
-- usuario que conociera el UUID de un candidato o vacante de otro
-- tenant podía forzar un vínculo cruzado entre tenants. Se reemplazan
-- todas las policies dispersas de cada tabla por una única policy que
-- valida ambas claves foráneas en USING y WITH CHECK.
-- ─────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view applications for their vacancies" ON public.applications;
DROP POLICY IF EXISTS "Users can insert applications for their vacancies" ON public.applications;
DROP POLICY IF EXISTS "Users can update applications for their vacancies" ON public.applications;
DROP POLICY IF EXISTS "Acceso a applications del tenant" ON public.applications;

CREATE POLICY "Tenant isolation for applications" ON public.applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vacancies v
      WHERE v.id = applications.vacancy_id
        AND v.tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = applications.candidate_id
        AND c.tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vacancies v
      WHERE v.id = applications.vacancy_id
        AND v.tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = applications.candidate_id
        AND c.tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert interviews for their vacancies" ON public.interviews;
DROP POLICY IF EXISTS "Users can update interviews for their vacancies" ON public.interviews;
DROP POLICY IF EXISTS "Acceso a entrevistas del tenant" ON public.interviews;
DROP POLICY IF EXISTS "Users can view interviews for their vacancies" ON public.interviews;

CREATE POLICY "Tenant isolation for interviews" ON public.interviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = interviews.candidate_id
        AND c.tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.vacancies v
      WHERE v.id = interviews.vacancy_id
        AND v.tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = interviews.candidate_id
        AND c.tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.vacancies v
      WHERE v.id = interviews.vacancy_id
        AND v.tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
    )
  );
