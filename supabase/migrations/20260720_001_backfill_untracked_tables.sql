-- Backfill de esquema: estas 11 tablas ya existen en producción pero nunca
-- quedaron versionadas en supabase/ (se crearon directamente contra la base
-- en algún momento fuera del flujo normal de migraciones). Esto fue un
-- hallazgo de la auditoría de seguridad del 2026-07-19: sin esto, no se
-- puede reconstruir el esquema real desde el repo ni auditar su RLS con
-- confianza.
--
-- Este archivo documenta el estado real relevado directamente de la base de
-- producción (columnas, constraints, índices y policies de RLS). Usa
-- IF NOT EXISTS / bloques condicionales en todo para ser un no-op seguro
-- contra una base que ya tiene estas tablas — no cambia ningún
-- comportamiento existente.

-- ── ACTIVITY_LOGS ──────────────────────────────────────────────

create table if not exists public.activity_logs (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null,
  user_id      uuid        references auth.users(id) on delete set null,
  action       text        not null,
  entity_type  text        not null,
  entity_id    uuid,
  entity_label text,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);
create index if not exists activity_logs_tenant_id_idx on public.activity_logs (tenant_id);
create index if not exists idx_activity_logs_user_id on public.activity_logs (user_id);

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'activity_logs' and policyname = 'Ver actividad del tenant') then
    create policy "Ver actividad del tenant" on public.activity_logs for select
      using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'activity_logs' and policyname = 'Registrar actividad del tenant') then
    create policy "Registrar actividad del tenant" on public.activity_logs for insert
      with check (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
  end if;
end $$;

-- ── AI_RATE_LIMITS ─────────────────────────────────────────────

create table if not exists public.ai_rate_limits (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  hour_bucket timestamptz not null,
  call_count  integer     not null default 1,
  primary key (user_id, hour_bucket)
);

alter table public.ai_rate_limits enable row level security;

create index if not exists ai_rate_limits_hour_bucket_idx on public.ai_rate_limits (hour_bucket);

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'ai_rate_limits' and policyname = 'users_own_rate_limits') then
    create policy "users_own_rate_limits" on public.ai_rate_limits for all
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'ai_rate_limits' and policyname = 'Users can read own rate limits') then
    create policy "Users can read own rate limits" on public.ai_rate_limits for select
      using (auth.uid() = user_id);
  end if;
end $$;

-- ── AI_USAGE_LOGS ──────────────────────────────────────────────

create table if not exists public.ai_usage_logs (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references auth.users(id) on delete cascade,
  tenant_id          uuid,
  route              text        not null,
  model              text        not null default 'llama-3.3-70b-versatile',
  prompt_tokens      integer,
  completion_tokens  integer,
  latency_ms         integer,
  success            boolean     not null default true,
  error_code         text,
  plan               text        not null default 'free',
  created_at         timestamptz not null default now()
);

alter table public.ai_usage_logs enable row level security;

create index if not exists ai_usage_logs_created_at_idx on public.ai_usage_logs (created_at desc);
create index if not exists ai_usage_logs_route_idx on public.ai_usage_logs (route);
create index if not exists ai_usage_logs_tenant_id_idx on public.ai_usage_logs (tenant_id);
create index if not exists ai_usage_logs_user_id_idx on public.ai_usage_logs (user_id);

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'ai_usage_logs' and policyname = 'ai_usage_logs_select_own') then
    create policy "ai_usage_logs_select_own" on public.ai_usage_logs for select to authenticated
      using (user_id = (select auth.uid()));
  end if;
end $$;

-- ── CANDIDATE_TAGS ─────────────────────────────────────────────

create table if not exists public.candidate_tags (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name      text not null,
  color     text not null default '#6366f1',
  unique (tenant_id, name)
);

alter table public.candidate_tags enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'candidate_tags' and policyname = 'Acceso a tags del tenant') then
    create policy "Acceso a tags del tenant" on public.candidate_tags for all
      using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
  end if;
end $$;

-- ── CANDIDATE_TAG_LINKS ────────────────────────────────────────

create table if not exists public.candidate_tag_links (
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  tag_id       uuid not null references public.candidate_tags(id) on delete cascade,
  primary key (candidate_id, tag_id)
);

alter table public.candidate_tag_links enable row level security;

create index if not exists idx_candidate_tag_links_tag_id on public.candidate_tag_links (tag_id);

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'candidate_tag_links' and policyname = 'Acceso a tag-links del tenant') then
    create policy "Acceso a tag-links del tenant" on public.candidate_tag_links for all
      using (exists (
        select 1 from public.candidates c
        join public.profiles p on p.tenant_id = c.tenant_id
        where c.id = candidate_tag_links.candidate_id and p.id = auth.uid()
      ));
  end if;
end $$;

-- ── CLIENT_EVENTS ──────────────────────────────────────────────
-- Nota: tenant_id es text acá (no uuid como en el resto de las tablas) —
-- así está en producción, se documenta tal cual sin "corregirlo".

create table if not exists public.client_events (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   text        not null,
  client_id   uuid        not null references public.clients(id) on delete cascade,
  client_name text        not null,
  event_type  text        not null check (event_type in ('created','deactivated','reactivated','modified')),
  occurred_at timestamptz not null default now(),
  notes       text
);

alter table public.client_events enable row level security;

create index if not exists idx_client_events_client_id on public.client_events (client_id);

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'client_events' and policyname = 'client_events_tenant_all') then
    create policy "client_events_tenant_all" on public.client_events for all
      using (tenant_id = (select tenant_id::text from public.profiles where id = auth.uid()))
      with check (tenant_id = (select tenant_id::text from public.profiles where id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'client_events' and policyname = 'Tenant can manage own client events') then
    create policy "Tenant can manage own client events" on public.client_events for all
      using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.tenant_id::text = client_events.tenant_id));
  end if;
end $$;

-- ── ERROR_LOGS ─────────────────────────────────────────────────

create table if not exists public.error_logs (
  id            uuid        primary key default gen_random_uuid(),
  tenant_id     text,
  user_id       uuid        references auth.users(id) on delete set null,
  endpoint      text        not null,
  error_message text        not null,
  error_stack   text,
  request_body  jsonb,
  occurred_at   timestamptz not null default now()
);

alter table public.error_logs enable row level security;

create index if not exists idx_error_logs_user_id on public.error_logs (user_id);

-- Nota: esta policy depende de la GUC app.admin_email, que ninguna
-- migración setea — hoy es efectivamente inalcanzable (falla cerrada, no es
-- explotable). El acceso admin real pasa por requireAdmin() +
-- createAdminClient() (service_role) en src/app/api/admin/guard.ts. Se
-- documenta tal cual está en producción; limpiarla queda para otra tarea.
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'error_logs' and policyname = 'error_logs_admin_select') then
    create policy "error_logs_admin_select" on public.error_logs for select
      using ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true));
  end if;
end $$;

-- ── JOB_POSTINGS ───────────────────────────────────────────────

create table if not exists public.job_postings (
  id                  uuid        primary key default gen_random_uuid(),
  vacancy_id          uuid        not null references public.vacancies(id) on delete cascade,
  tenant_id           uuid        not null,
  platform            text        not null,
  external_id         text,
  external_url        text,
  status              text        not null default 'draft' check (status in ('draft','published','paused','expired','rejected')),
  published_at        timestamptz,
  expires_at          timestamptz,
  views_count         integer     not null default 0,
  applications_count  integer     not null default 0,
  error_message       text,
  metadata            jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (vacancy_id, platform)
);

alter table public.job_postings enable row level security;

create index if not exists job_postings_platform_idx on public.job_postings (platform);
create index if not exists job_postings_tenant_id_idx on public.job_postings (tenant_id);
create index if not exists job_postings_vacancy_id_idx on public.job_postings (vacancy_id);

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'job_postings' and policyname = 'Acceso a postings del tenant') then
    create policy "Acceso a postings del tenant" on public.job_postings for all
      using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
  end if;
end $$;

-- ── STRIPE_EVENTS ──────────────────────────────────────────────
-- Tabla de idempotencia para el webhook de Stripe (src/app/api/stripe/webhook).
-- Sin policies: solo service_role escribe/lee acá (RLS enabled sin
-- policies = deny-all para anon/authenticated, que es lo correcto).

create table if not exists public.stripe_events (
  id           text        primary key,
  type         text        not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;

-- ── SUBSCRIPTIONS ──────────────────────────────────────────────

create table if not exists public.subscriptions (
  id                            uuid        primary key default gen_random_uuid(),
  tenant_id                     uuid        not null,
  plan                          text        not null default 'free'
                                             check (plan in ('free','starter','pro','business','enterprise')),
  status                        text        not null default 'trialing'
                                             check (status in ('trialing','active','past_due','canceled','paused')),
  trial_ends_at                 timestamptz,
  current_period_start          timestamptz,
  current_period_end            timestamptz,
  cancel_at                     timestamptz,
  canceled_at                   timestamptz,
  payment_provider              text        check (payment_provider in ('stripe','mercadopago','manual','none')),
  external_id                   text,
  discount_pct                  integer     not null default 0 check (discount_pct >= 0 and discount_pct <= 100),
  metadata                      jsonb,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  stripe_customer_id            text unique,
  stripe_subscription_id        text unique,
  stripe_price_id               text,
  stripe_status                 text,
  cancel_at_period_end          boolean     not null default false,
  stripe_current_period_start   timestamptz,
  stripe_current_period_end     timestamptz
);

alter table public.subscriptions enable row level security;

create index if not exists subscriptions_stripe_customer_id_idx on public.subscriptions (stripe_customer_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions (stripe_subscription_id);
create index if not exists subscriptions_tenant_id_idx on public.subscriptions (tenant_id);

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'subscriptions' and policyname = 'Ver suscripción del tenant') then
    create policy "Ver suscripción del tenant" on public.subscriptions for select
      using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
  end if;
end $$;

-- ── TEAM_MEMBERS ───────────────────────────────────────────────

create table if not exists public.team_members (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   uuid        not null,
  user_id     uuid        references auth.users(id) on delete cascade,
  email       text        not null,
  role        text        not null default 'recruiter' check (role in ('owner','admin','recruiter','viewer')),
  status      text        not null default 'invited' check (status in ('invited','active','suspended')),
  invited_by  uuid        references auth.users(id) on delete set null,
  invited_at  timestamptz not null default now(),
  accepted_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (tenant_id, email)
);

alter table public.team_members enable row level security;

create index if not exists idx_team_members_invited_by on public.team_members (invited_by);
create index if not exists team_members_tenant_id_idx on public.team_members (tenant_id);
create index if not exists team_members_user_id_idx on public.team_members (user_id);

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'team_members' and policyname = 'Ver miembros del tenant') then
    create policy "Ver miembros del tenant" on public.team_members for select
      using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'team_members' and policyname = 'Gestionar miembros (admin+owner)') then
    create policy "Gestionar miembros (admin+owner)" on public.team_members for all
      using (
        tenant_id = (select tenant_id from public.profiles where id = auth.uid())
        and exists (
          select 1 from public.team_members tm
          where tm.tenant_id = team_members.tenant_id
            and tm.user_id = auth.uid()
            and tm.role in ('owner','admin')
        )
      );
  end if;
end $$;
