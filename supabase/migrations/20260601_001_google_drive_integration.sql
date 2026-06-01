-- ─── Google Drive Integration: add missing columns ────────────────────────────
-- integrations table: add OAuth token columns needed for Google (and other OAuth) integrations
alter table public.integrations
  add column if not exists access_token  text,
  add column if not exists refresh_token text,
  add column if not exists token_expires_at timestamptz;

-- profiles table: add AI provider/key columns (used in Configuración > IA)
alter table public.profiles
  add column if not exists groq_api_key text,
  add column if not exists ai_provider  text not null default 'groq';
