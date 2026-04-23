-- ============================================================
-- Fix urgente: política INSERT para profiles + security_events
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- Permite que un usuario autenticado inserte su propio perfil
-- (fallback cuando el trigger on_auth_user_created no dispara)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'Insertar propio perfil'
  ) then
    create policy "Insertar propio perfil" on profiles
      for insert with check (auth.uid() = id);
  end if;
end $$;


-- Tabla de auditoría de seguridad
create table if not exists public.security_events (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  event_type  text        not null,
  ip_address  text,
  user_agent  text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

alter table public.security_events enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'security_events' and policyname = 'Ver propios eventos'
  ) then
    create policy "Ver propios eventos" on security_events
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'security_events' and policyname = 'Registrar propios eventos'
  ) then
    create policy "Registrar propios eventos" on security_events
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

create index if not exists security_events_user_id_idx  on security_events(user_id);
create index if not exists security_events_created_idx  on security_events(created_at desc);
