-- Email logs table for tracking transactional emails sent via Resend
create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  tenant_id text,
  email_type text not null, -- welcome, interview_scheduled, stage_changed, system_update, etc
  recipient_email text not null,
  recipient_name text,
  subject text not null,
  status text not null default 'sent', -- sent, bounced, complained, failed
  resend_id text, -- ID from Resend API response
  error_message text,
  metadata jsonb, -- campaign_id, interview_id, vacancy_id, etc
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table email_logs enable row level security;

-- Admins can read all logs
create policy "email_logs_admin_select"
  on email_logs for select
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- No user-facing select/insert — emails are logged via service role only
