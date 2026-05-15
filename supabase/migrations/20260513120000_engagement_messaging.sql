-- Applicant Opportunities: real threads + read receipts (candidate portal).
-- engagement_messages: employer/candidate chat rows tied to engagements.
-- engagement_read_state: candidate last-read timestamp per engagement (drives unread).

-- Widen lifecycle stages to match the applicant messenger UI + hiring outcomes.
alter table public.engagements drop constraint if exists engagements_stage_check;
alter table public.engagements
  add constraint engagements_stage_check
  check (
    stage is null
    or stage in (
      'discovered',
      'contacted',
      'responded',
      'interviewing',
      'decision',
      'hired',
      'rejected',
      'closed'
    )
  );

create table if not exists public.engagement_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  sender text not null check (sender in ('employer', 'candidate')),
  body text not null
);

create index if not exists engagement_messages_engagement_id_created_idx
  on public.engagement_messages (engagement_id, created_at);

create table if not exists public.engagement_read_state (
  engagement_id uuid primary key references public.engagements (id) on delete cascade,
  candidate_id uuid not null references public.candidate_profiles (id) on delete cascade,
  last_read_at timestamptz not null default now()
);

alter table public.engagement_messages enable row level security;
alter table public.engagement_read_state enable row level security;

drop policy if exists "engagement_messages: candidate select" on public.engagement_messages;
create policy "engagement_messages: candidate select"
  on public.engagement_messages
  for select
  using (
    exists (
      select 1
      from public.engagements e
      join public.candidate_profiles cp on cp.id = e.candidate_id
      where e.id = engagement_messages.engagement_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "engagement_messages: candidate insert" on public.engagement_messages;
create policy "engagement_messages: candidate insert"
  on public.engagement_messages
  for insert
  with check (
    sender = 'candidate'
    and exists (
      select 1
      from public.engagements e
      join public.candidate_profiles cp on cp.id = e.candidate_id
      where e.id = engagement_messages.engagement_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "engagement_messages: employer select" on public.engagement_messages;
create policy "engagement_messages: employer select"
  on public.engagement_messages
  for select
  using (
    exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = engagement_messages.engagement_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "engagement_messages: employer insert" on public.engagement_messages;
create policy "engagement_messages: employer insert"
  on public.engagement_messages
  for insert
  with check (
    sender = 'employer'
    and exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = engagement_messages.engagement_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "engagement_read_state: candidate all" on public.engagement_read_state;
create policy "engagement_read_state: candidate all"
  on public.engagement_read_state
  for all
  using (
    exists (
      select 1
      from public.candidate_profiles cp
      where cp.id = engagement_read_state.candidate_id
        and cp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.candidate_profiles cp
      where cp.id = engagement_read_state.candidate_id
        and cp.user_id = auth.uid()
    )
  );

-- Allow candidates to update engagement stage from the messenger (client-side picker).
drop policy if exists "engagements: candidate update own" on public.engagements;
create policy "engagements: candidate update own"
  on public.engagements
  for update
  using (
    exists (
      select 1
      from public.candidate_profiles cp
      where cp.id = engagements.candidate_id
        and cp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.candidate_profiles cp
      where cp.id = engagements.candidate_id
        and cp.user_id = auth.uid()
    )
  );
