-- Enable Realtime for notifications table
alter publication supabase_realtime add table public.notifications;

-- Enable Realtime for reminders table (optional, for future use)
alter publication supabase_realtime add table public.reminders;

-- Verify Realtime is enabled
select
  schemaname,
  tablename,
  pubname
from pg_publication_tables
where tablename in ('notifications', 'reminders');
