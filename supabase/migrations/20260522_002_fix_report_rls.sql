-- ConectAr Talento - Fix broken JWT-based RLS policies on report tables
-- Replaces auth.jwt() ->> 'tenant_id' with proper profile join

DROP POLICY IF EXISTS report_templates_select ON public.report_templates;
DROP POLICY IF EXISTS report_templates_all ON public.report_templates;
DROP POLICY IF EXISTS report_snapshots_select ON public.report_snapshots;
DROP POLICY IF EXISTS report_snapshots_all ON public.report_snapshots;

CREATE POLICY report_templates_select ON public.report_templates
  FOR SELECT USING (tenant_id::text = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()));

CREATE POLICY report_templates_all ON public.report_templates
  FOR ALL USING (tenant_id::text = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id::text = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()));

CREATE POLICY report_snapshots_select ON public.report_snapshots
  FOR SELECT USING (tenant_id::text = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()));

CREATE POLICY report_snapshots_all ON public.report_snapshots
  FOR ALL USING (tenant_id::text = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id::text = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid()));
