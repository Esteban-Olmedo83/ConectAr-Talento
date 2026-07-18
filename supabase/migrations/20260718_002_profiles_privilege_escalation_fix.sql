-- Security fix: la política "Editar propio perfil" (schema.sql) permite a
-- cualquier usuario autenticado hacer UPDATE sobre su propia fila de
-- profiles vía la API REST de Supabase, pero no restringe QUÉ columnas
-- puede cambiar. Como profiles.tenant_id determina a qué organización
-- pertenece (aislamiento multi-tenant) y profiles.plan determina el nivel
-- de acceso pagado, un usuario podía escalar privilegios haciendo PATCH
-- directo a esos dos campos, sin pasar por el frontend.
--
-- Fix: trigger BEFORE UPDATE que bloquea cambios a tenant_id/plan salvo
-- que la operación se ejecute con el rol service_role (backend admin,
-- webhook de Stripe, onboarding). Se usa un trigger en vez de RLS
-- WITH CHECK porque RLS no puede restringir columnas específicas dentro
-- de una misma fila.

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.tenant_id is distinct from old.tenant_id
      or new.plan is distinct from old.plan)
     and auth.role() is distinct from 'service_role' then
    raise exception 'No autorizado: tenant_id y plan solo pueden modificarse desde el servidor';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_profile_privilege_escalation on public.profiles;

create trigger trg_prevent_profile_privilege_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_privilege_escalation();
