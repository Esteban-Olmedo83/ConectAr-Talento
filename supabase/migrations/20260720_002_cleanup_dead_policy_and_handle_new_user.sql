-- Limpieza de seguridad (Tanda 1 de items medios/bajos del informe del
-- 2026-07-19).

-- 1) error_logs_admin_select dependía de la GUC app.admin_email, que
-- ninguna migración setea — nunca se cumplía (fallaba cerrada, no era
-- explotable, pero daba falsa confianza de que había una capa de RLS para
-- admins). El acceso admin real ya pasa por requireAdmin() +
-- createAdminClient() (service_role) en src/app/api/admin/guard.ts.
DROP POLICY IF EXISTS "error_logs_admin_select" ON public.error_logs;

-- 2) handle_new_user() es una función trigger (se dispara con
-- on_auth_user_created AFTER INSERT ON auth.users) — no necesita EXECUTE
-- de anon/authenticated para funcionar como trigger (la ejecución de un
-- trigger no depende de que el rol que originó la request tenga EXECUTE
-- sobre la función). Tenía grants explícitos a PUBLIC, anon y
-- authenticated, heredados del momento en que se creó; se revocan todos
-- salvo service_role/postgres, mismo criterio ya aplicado a las funciones
-- admin. Verificado en producción: el trigger on_auth_user_created sigue
-- intacto después de este cambio.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
