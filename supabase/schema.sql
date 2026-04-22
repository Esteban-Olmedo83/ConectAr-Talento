-- ============================================================
-- ConectAr Talento — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── PROFILES (extiende auth.users) ─────────────────────────

create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  full_name       text        not null,
  company_name    text        not null,
  plan            text        not null default 'free'
                              check (plan in ('free','starter','pro','business','enterprise')),
  tenant_id       uuid        not null default gen_random_uuid(),
  avatar_url      text,
  google_drive_folder_id text,
  google_sheets_db_id    text,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Ver propio perfil"     on profiles for select using (auth.uid() = id);
create policy "Editar propio perfil"  on profiles for update using (auth.uid() = id);

-- Trigger: crea perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, company_name, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(new.raw_user_meta_data->>'plan', 'free')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── VACANCIES ───────────────────────────────────────────────

create table public.vacancies (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null,
  title        text        not null,
  department   text        not null,
  status       text        not null default 'Nuevas Vacantes',
  description  text,
  requirements text[]      not null default '{}',
  salary_min   numeric,
  salary_max   numeric,
  currency     text                 default 'USD',
  location     text,
  modality     text        not null default 'Presencial',
  priority     text        not null default 'Media',
  published_at timestamptz,
  closing_date timestamptz,
  created_by   uuid        references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.vacancies enable row level security;

create policy "Acceso a vacantes del tenant" on vacancies
  for all using (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  );


-- ── CANDIDATES ──────────────────────────────────────────────

create table public.candidates (
  id               uuid        primary key default gen_random_uuid(),
  tenant_id        uuid        not null,
  full_name        text        not null,
  email            text        not null,
  phone            text,
  avatar_url       text,
  cv_url           text,
  cv_file_name     text,
  ats_score        integer     check (ats_score between 0 and 100),
  skills           text[]      not null default '{}',
  experience_years integer,
  education        text,
  source           text        not null default 'Manual',
  notes            text,
  applied_at       timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

alter table public.candidates enable row level security;

create policy "Acceso a candidatos del tenant" on candidates
  for all using (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  );


-- ── APPLICATIONS ────────────────────────────────────────────

create table public.applications (
  id               uuid        primary key default gen_random_uuid(),
  vacancy_id       uuid        not null references vacancies(id)  on delete cascade,
  candidate_id     uuid        not null references candidates(id) on delete cascade,
  status           text        not null default 'Nuevas Vacantes',
  position_in_stage integer   not null default 0,
  applied_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(vacancy_id, candidate_id)
);

alter table public.applications enable row level security;

create policy "Acceso a applications del tenant" on applications
  for all using (
    exists (
      select 1 from vacancies v
      join profiles p on p.tenant_id = v.tenant_id
      where v.id = applications.vacancy_id and p.id = auth.uid()
    )
  );


-- ── INTERVIEWS ──────────────────────────────────────────────

create table public.interviews (
  id               uuid        primary key default gen_random_uuid(),
  candidate_id     uuid        not null references candidates(id) on delete cascade,
  vacancy_id       uuid        not null references vacancies(id)  on delete cascade,
  scheduled_at     timestamptz not null,
  type             text        not null,
  interviewer_name text        not null,
  interviewer_email text,
  status           text        not null default 'Programada',
  meeting_platform text        not null default 'presencial',
  meeting_link     text,
  notes            text
);

alter table public.interviews enable row level security;

create policy "Acceso a entrevistas del tenant" on interviews
  for all using (
    exists (
      select 1 from candidates c
      join profiles p on p.tenant_id = c.tenant_id
      where c.id = interviews.candidate_id and p.id = auth.uid()
    )
  );


-- ── SCORECARDS ──────────────────────────────────────────────

create table public.scorecards (
  id               uuid    primary key default gen_random_uuid(),
  interview_id     uuid    not null unique references interviews(id) on delete cascade,
  overall_rating   integer not null check (overall_rating between 1 and 5),
  technical_skills numeric not null,
  communication    numeric not null,
  cultural_fit     numeric not null,
  strengths        text    not null,
  weaknesses       text    not null,
  recommendation   text    not null,
  ai_summary       text,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.scorecards enable row level security;

create policy "Acceso a scorecards del tenant" on scorecards
  for all using (
    exists (
      select 1 from interviews i
      join candidates c on c.id = i.candidate_id
      join profiles p on p.tenant_id = c.tenant_id
      where i.id = scorecards.interview_id and p.id = auth.uid()
    )
  );


-- ── MESSAGE TEMPLATES ───────────────────────────────────────

create table public.message_templates (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   uuid        not null,
  name        text        not null,
  channel     text        not null,
  category    text        not null,
  subject     text,
  body        text        not null,
  variables   text[]      not null default '{}',
  is_default  boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table public.message_templates enable row level security;

create policy "Acceso a templates del tenant o globales" on message_templates
  for all using (
    is_default = true
    or tenant_id = (select tenant_id from profiles where id = auth.uid())
  );


-- ── INTEGRATIONS ────────────────────────────────────────────

create table public.integrations (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null,
  platform     text        not null,
  account_name text        not null,
  account_email text,
  status       text        not null default 'pending',
  expires_at   timestamptz,
  metadata     jsonb,
  created_at   timestamptz not null default now(),
  unique(tenant_id, platform)
);

alter table public.integrations enable row level security;

create policy "Acceso a integraciones del tenant" on integrations
  for all using (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  );
