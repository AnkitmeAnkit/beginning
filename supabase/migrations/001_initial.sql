create extension if not exists pgcrypto with schema extensions;

create table if not exists public.playbooks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  price integer not null default 0 check (price >= 0),
  status text not null default 'draft' check (status in ('draft','available','preorder','waitlist')),
  release_at timestamptz,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(), email text not null, name text not null,
  goal text not null default '', source text not null default 'website', consented_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists leads_email_idx on public.leads (lower(email));

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(), email text not null, name text not null,
  playbook_slug text not null, consented_at timestamptz not null, created_at timestamptz not null default now(),
  unique (email, playbook_slug)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), razorpay_order_id text not null unique,
  razorpay_payment_id text unique, receipt text not null unique, buyer_name text not null, buyer_email text not null,
  product_slug text not null, product_title text not null, amount integer not null check (amount >= 0),
  currency text not null default 'INR', status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  fulfilment_status text not null default 'pending' check (fulfilment_status in ('pending','pending_release','awaiting_asset','processing','sent','failed')),
  fulfilment_email_id text, consented_at timestamptz not null, paid_at timestamptz, fulfilled_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists orders_buyer_email_idx on public.orders (lower(buyer_email));
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.webhook_events (
  external_event_id text primary key, provider text not null, event_type text not null,
  received_at timestamptz not null, processed_at timestamptz not null default now()
);

create table if not exists public.form_rate_limits (
  kind text not null, email text not null, ip_hash text not null, window_start timestamptz not null,
  request_count integer not null default 1, primary key (kind, email, ip_hash, window_start)
);

create or replace function public.claim_submission_slot(p_kind text, p_email text, p_ip text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_count integer; hourly_limit integer;
begin
  hourly_limit := case when p_kind = 'payment-order' then 10 else 5 end;
  insert into public.form_rate_limits(kind, email, ip_hash, window_start, request_count)
  values (left(p_kind, 120), lower(left(p_email, 254)), encode(extensions.digest(coalesce(p_ip,'unknown'), 'sha256'), 'hex'), date_trunc('hour', now()), 1)
  on conflict (kind, email, ip_hash, window_start) do update set request_count = public.form_rate_limits.request_count + 1
  returning request_count into current_count;
  return current_count <= hourly_limit;
end; $$;

alter table public.playbooks enable row level security;
alter table public.leads enable row level security;
alter table public.waitlist enable row level security;
alter table public.orders enable row level security;
alter table public.webhook_events enable row level security;
alter table public.form_rate_limits enable row level security;

revoke all on public.playbooks, public.leads, public.waitlist, public.orders, public.webhook_events, public.form_rate_limits from anon, authenticated;
grant all on public.playbooks, public.leads, public.waitlist, public.orders, public.webhook_events, public.form_rate_limits to service_role;
revoke all on function public.claim_submission_slot(text,text,text) from public, anon, authenticated;
grant execute on function public.claim_submission_slot(text,text,text) to service_role;

insert into public.playbooks (slug, title, description, price, status, release_at)
values
  ('day-one-execution-system','Day One Execution System','Turn a vague goal into visible proof before the day ends.',49900,'available',null),
  ('founder-focus-sprint','Founder Focus Sprint','Protect one meaningful outcome across five noisy working days.',29900,'preorder','2026-10-15 09:00:00+05:30'),
  ('ai-workday-os','AI Workday OS','Give AI the repeatable work. Keep judgment with the human.',0,'waitlist',null)
on conflict (slug) do update set title = excluded.title, description = excluded.description, price = excluded.price, status = excluded.status, release_at = excluded.release_at, updated_at = now();
