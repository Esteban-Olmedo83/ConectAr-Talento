-- Add RLS to client_events table (previously missing)
alter table client_events enable row level security;

create policy "client_events_tenant_all"
  on client_events for all
  using (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  )
  with check (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  );
