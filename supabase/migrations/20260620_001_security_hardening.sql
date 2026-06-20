-- Security hardening migration
-- Refs: H2 (legal_audit_log RLS), H4 (cv bucket policy), L4 (WITH CHECK on RLS policies)

-- ─── H2: Fix legal_audit_log INSERT policy ────────────────────────────────────
-- The old policy used WITH CHECK (true) allowing any authenticated user to forge records.
-- Inserts from API routes go through service-role (bypasses RLS), so no INSERT policy
-- is needed for authenticated users at all. Drop it.

DROP POLICY IF EXISTS "Service role can insert" ON public.legal_audit_log;

-- Only service-role writes are allowed (no client-side insert policy needed).
-- Admins can read all rows via service-role as well.

-- ─── L4: Add WITH CHECK clauses to key RLS policies ──────────────────────────
-- Policies that use FOR ALL without WITH CHECK allow INSERT/UPDATE with
-- a different tenant_id than the authenticated user's.

-- vacancies
DROP POLICY IF EXISTS "Tenant isolation for vacancies" ON public.vacancies;
CREATE POLICY "Tenant isolation for vacancies" ON public.vacancies
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- candidates
DROP POLICY IF EXISTS "Tenant isolation for candidates" ON public.candidates;
CREATE POLICY "Tenant isolation for candidates" ON public.candidates
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- integrations
DROP POLICY IF EXISTS "Tenant isolation for integrations" ON public.integrations;
CREATE POLICY "Tenant isolation for integrations" ON public.integrations
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- message_templates: split SELECT (allows is_default) from INSERT/UPDATE/DELETE (tenant-scoped)
DROP POLICY IF EXISTS "Tenant isolation for message_templates" ON public.message_templates;

CREATE POLICY "message_templates_select" ON public.message_templates
  FOR SELECT
  USING (
    is_default = true
    OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "message_templates_write" ON public.message_templates
  FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND is_default = false
  );

CREATE POLICY "message_templates_update" ON public.message_templates
  FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND is_default = false
  );

CREATE POLICY "message_templates_delete" ON public.message_templates
  FOR DELETE
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND is_default = false
  );

-- ─── H4: Make cvs bucket private + add tenant-scoped storage RLS ─────────────
-- Currently the bucket is public, so anyone with a URL can download any CV/photo.
-- Making it private and scoping access to the owner's tenant_id closes that gap.

UPDATE storage.buckets SET public = false WHERE id = 'cvs';

DROP POLICY IF EXISTS "Tenant can access own files in cvs" ON storage.objects;

CREATE POLICY "Tenant can access own files in cvs"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'cvs'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = (
    SELECT p.tenant_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'cvs'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = (
    SELECT p.tenant_id::text FROM public.profiles p WHERE p.id = auth.uid()
  )
);
