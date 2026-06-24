-- Error log table for production monitoring
create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  user_id uuid references auth.users(id) on delete set null,
  endpoint text not null,
  error_message text not null,
  error_stack text,
  request_body jsonb,
  occurred_at timestamptz not null default now()
);

alter table error_logs enable row level security;

-- Admins can read all logs; regular users see nothing (logs are written via service role)
create policy "error_logs_admin_select"
  on error_logs for select
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- No user-facing insert; writes go through service role key in API routes
