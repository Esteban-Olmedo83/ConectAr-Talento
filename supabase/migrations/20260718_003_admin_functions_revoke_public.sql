-- Security fix: la migración 20260718_001_security_performance_v2.sql
-- (PR #152) intentó bloquear el acceso público a las funciones
-- administrativas SECURITY DEFINER haciendo:
--   REVOKE EXECUTE ON FUNCTION ... FROM anon, authenticated;
--
-- Esto no fue suficiente. En Postgres, toda función creada con CREATE
-- FUNCTION recibe automáticamente permiso de ejecución para el
-- pseudo-rol PUBLIC (o sea, todos los roles, sin excepción). Revocar el
-- permiso explícito a anon/authenticated no quita el permiso heredado
-- vía PUBLIC — y como PUBLIC nunca fue revocado, cualquier usuario
-- (incluso sin autenticarse) podía seguir llamando estas funciones vía
-- /rest/v1/rpc/<nombre_funcion>. Verificado en producción con
-- has_function_privilege('anon', ..., 'EXECUTE') = true antes de este
-- fix.
--
-- Impacto real: admin_get_tenants()/admin_get_tenant_detail() exponen
-- datos de TODOS los tenants; admin_update_plan() permite cambiar el
-- plan de cualquier tenant; admin_delete_changelog()/
-- admin_upsert_changelog() permiten modificar contenido administrativo
-- — todo esto público y sin autenticación.
--
-- Fix: revocar el permiso heredado de PUBLIC y dejar el acceso
-- explícito solo para service_role (que ya lo tenía y es el único que
-- debe usar estas funciones, vía requireAdmin() + createAdminClient()
-- en src/app/api/admin/guard.ts).

REVOKE EXECUTE ON FUNCTION public.admin_delete_changelog(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_changelog() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_tenant_detail(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_tenants() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_plan(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_upsert_changelog(uuid, text, text, text, uuid, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_ai_rate_limits() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_ai_rate_limit(uuid, timestamp with time zone) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(uuid, timestamp with time zone) FROM PUBLIC;

-- Defensa en profundidad: dejar explícito que service_role puede
-- ejecutarlas, para que el intent quede documentado en el propio schema
-- y no dependa únicamente de privilegios implícitos del rol.
GRANT EXECUTE ON FUNCTION public.admin_delete_changelog(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_changelog() TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_tenant_detail(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_tenants() TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_plan(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_changelog(uuid, text, text, text, uuid, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_ai_rate_limits() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_ai_rate_limit(uuid, timestamp with time zone) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(uuid, timestamp with time zone) TO service_role;
