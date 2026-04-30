-- Applicant dashboard: persisted recent activity timeline (self-originated events v1)

create table if not exists public.candidate_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null check (event_type in ('match', 'view', 'profile', 'system')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists candidate_activity_events_user_created_idx
  on public.candidate_activity_events (user_id, created_at desc);

alter table public.candidate_activity_events enable row level security;

drop policy if exists "candidate_activity_events: own read" on public.candidate_activity_events;
create policy "candidate_activity_events: own read"
  on public.candidate_activity_events for select
  using (auth.uid() = user_id);

drop policy if exists "candidate_activity_events: own insert" on public.candidate_activity_events;
create policy "candidate_activity_events: own insert"
  on public.candidate_activity_events for insert
  with check (auth.uid() = user_id);
