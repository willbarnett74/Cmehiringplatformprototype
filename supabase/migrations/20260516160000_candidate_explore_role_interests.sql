-- Explore "Top roles": candidates can signal interest; matching employers (by business name) get a notification row.

create table if not exists public.candidate_explore_role_interests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  candidate_id uuid not null references public.candidate_profiles (id) on delete cascade,
  industry_id uuid not null references public.explore_industries (id) on delete cascade,
  sample_role_id uuid references public.explore_industry_sample_roles (id) on delete set null,
  company_name text not null,
  role_title text not null,
  location text not null default '',
  unique (candidate_id, industry_id, company_name, role_title)
);

create index if not exists candidate_explore_role_interests_candidate_idx
  on public.candidate_explore_role_interests (candidate_id, created_at desc);

alter table public.candidate_explore_role_interests enable row level security;

drop policy if exists "candidate_explore_role_interests: own select"
  on public.candidate_explore_role_interests;
create policy "candidate_explore_role_interests: own select"
  on public.candidate_explore_role_interests for select to authenticated
  using (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_explore_role_interests.candidate_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "candidate_explore_role_interests: own insert"
  on public.candidate_explore_role_interests;
create policy "candidate_explore_role_interests: own insert"
  on public.candidate_explore_role_interests for insert to authenticated
  with check (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_explore_role_interests.candidate_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "candidate_explore_role_interests: own delete"
  on public.candidate_explore_role_interests;
create policy "candidate_explore_role_interests: own delete"
  on public.candidate_explore_role_interests for delete to authenticated
  using (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_explore_role_interests.candidate_id
        and cp.user_id = auth.uid()
    )
  );

-- One row per employer when businesses.name matches the explore card company (case-insensitive, trimmed).
create table if not exists public.explore_role_interest_employer_notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  interest_id uuid not null references public.candidate_explore_role_interests (id) on delete cascade,
  candidate_id uuid not null references public.candidate_profiles (id) on delete cascade,
  role_title text not null,
  company_name text not null,
  unique (business_id, interest_id)
);

create index if not exists explore_role_interest_employer_notifications_business_idx
  on public.explore_role_interest_employer_notifications (business_id, created_at desc);

alter table public.explore_role_interest_employer_notifications enable row level security;

drop policy if exists "explore_role_interest_employer_notifications: employer select"
  on public.explore_role_interest_employer_notifications;
create policy "explore_role_interest_employer_notifications: employer select"
  on public.explore_role_interest_employer_notifications for select to authenticated
  using (
    exists (
      select 1 from public.businesses b
      where b.id = explore_role_interest_employer_notifications.business_id
        and b.owner_id = auth.uid()
    )
  );

create or replace function public.notify_business_on_explore_role_interest()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bid uuid;
begin
  select b.id into bid
  from public.businesses b
  where lower(trim(b.name)) = lower(trim(new.company_name))
  limit 1;

  if bid is not null then
    insert into public.explore_role_interest_employer_notifications (
      business_id, interest_id, candidate_id, role_title, company_name
    )
    values (bid, new.id, new.candidate_id, new.role_title, new.company_name)
    on conflict (business_id, interest_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_explore_role_interest_notify on public.candidate_explore_role_interests;

create trigger trg_explore_role_interest_notify
  after insert on public.candidate_explore_role_interests
  for each row execute procedure public.notify_business_on_explore_role_interest();

grant select, insert, delete on table public.candidate_explore_role_interests to authenticated;
grant select on table public.explore_role_interest_employer_notifications to authenticated;
