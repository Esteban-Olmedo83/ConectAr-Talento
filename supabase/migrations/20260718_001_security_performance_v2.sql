-- Security: Revoke admin function access from anon/authenticated
-- These functions run as SECURITY DEFINER; only service_role should call them.
REVOKE EXECUTE ON FUNCTION public.admin_delete_changelog(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_get_changelog() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_get_stats() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_get_tenant_detail(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_get_tenants() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_plan(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_upsert_changelog(uuid, text, text, text, uuid, boolean) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_ai_rate_limits() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_ai_rate_limit(uuid, timestamp with time zone) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(uuid, timestamp with time zone) FROM anon, authenticated;

-- Security: Fix mutable search_path on SECURITY DEFINER functions
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
ALTER FUNCTION public.increment_ai_usage(uuid, timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.increment_ai_rate_limit(uuid, timestamp with time zone) SET search_path = public;

-- Security: RLS policy for ai_usage_logs (users can read their own usage)
CREATE POLICY "ai_usage_logs_select_own" ON public.ai_usage_logs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Security: Fix integrations_admin_update — scope USING to service_role only
DROP POLICY IF EXISTS "integrations_admin_update" ON public.integrations;
CREATE POLICY "integrations_admin_update" ON public.integrations
  FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

-- Performance: Drop duplicate index on integrations
DROP INDEX IF EXISTS public.idx_integrations_tenant;

-- Performance: Add missing indexes for unindexed foreign keys
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_tag_links_tag_id ON public.candidate_tag_links (tag_id);
CREATE INDEX IF NOT EXISTS idx_client_events_client_id ON public.client_events (client_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_invited_by ON public.team_members (invited_by);
CREATE INDEX IF NOT EXISTS idx_update_reads_update_id ON public.update_reads (update_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_client_id ON public.vacancies (client_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_created_by ON public.vacancies (created_by);
