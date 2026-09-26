-- Safe, read-only checks to run after 001_initial.sql.
select slug, title, price, status, release_at, file_path
from public.playbooks
order by created_at;

select
  c.relname as table_name,
  c.relrowsecurity as row_level_security_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'playbooks',
    'leads',
    'waitlist',
    'orders',
    'webhook_events',
    'form_rate_limits'
  )
order by c.relname;

select routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'claim_submission_slot';
