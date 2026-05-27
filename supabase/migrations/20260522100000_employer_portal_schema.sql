-- Employer portal: onboarding steps, read tracking, post-hire tables

alter table public.profiles drop constraint if exists profiles_onboarding_step_check;
alter table public.profiles
  add constraint profiles_onboarding_step_check
  check (
    onboarding_step in (
      'welcome',
      'details',
      'how_it_works',
      'completed',
      'employer_company',
      'employer_template',
      'employer_weights',
      'employer_calibration'
    )
  );

comment on column public.profiles.onboarding_step is
  'Onboarding wizard progress: applicant (welcome/details/how_it_works/completed) or employer (employer_* steps).';

-- Employer unread tracking on engagements
alter table public.engagements
  add column if not exists employer_last_read_at timestamptz;

-- Performance snapshots: engagement-centric (frontend expects engagement_id + snapshot_day)
alter table public.performance_snapshots
  add column if not exists engagement_id uuid references public.engagements (id) on delete cascade;

alter table public.performance_snapshots
  add column if not exists snapshot_day smallint check (snapshot_day in (30, 90));

alter table public.performance_snapshots
  add column if not exists performance_band text check (performance_band in ('top', 'mid', 'low'));

alter table public.performance_snapshots
  add column if not exists performance_rating smallint check (performance_rating between 1 and 5);

create index if not exists performance_snapshots_engagement_id_idx
  on public.performance_snapshots (engagement_id);

-- Motivational pulse checks for post-hire insights
create table if not exists public.motivational_pulse_checks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  quarter_label text not null,
  mastery smallint,
  impact smallint,
  recognition smallint,
  autonomy smallint,
  unique (engagement_id, quarter_label)
);

alter table public.motivational_pulse_checks enable row level security;

drop policy if exists "motivational_pulse_checks: employer select" on public.motivational_pulse_checks;
create policy "motivational_pulse_checks: employer select"
  on public.motivational_pulse_checks
  for select
  using (
    exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = motivational_pulse_checks.engagement_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "motivational_pulse_checks: employer insert" on public.motivational_pulse_checks;
create policy "motivational_pulse_checks: employer insert"
  on public.motivational_pulse_checks
  for insert
  with check (
    exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = motivational_pulse_checks.engagement_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "motivational_pulse_checks: employer update" on public.motivational_pulse_checks;
create policy "motivational_pulse_checks: employer update"
  on public.motivational_pulse_checks
  for update
  using (
    exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = motivational_pulse_checks.engagement_id
        and b.owner_id = auth.uid()
    )
  );

-- Employer can insert/update performance snapshots for their engagements
drop policy if exists "performance_snapshots: employer insert" on public.performance_snapshots;
create policy "performance_snapshots: employer insert"
  on public.performance_snapshots
  for insert
  with check (
    engagement_id is not null
    and exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = performance_snapshots.engagement_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "performance_snapshots: employer select" on public.performance_snapshots;
create policy "performance_snapshots: employer select"
  on public.performance_snapshots
  for select
  using (
    engagement_id is not null
    and exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = performance_snapshots.engagement_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "performance_snapshots: employer update" on public.performance_snapshots;
create policy "performance_snapshots: employer update"
  on public.performance_snapshots
  for update
  using (
    engagement_id is not null
    and exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = performance_snapshots.engagement_id
        and b.owner_id = auth.uid()
    )
  );

-- Engagements: hired_at for review triggers
alter table public.engagements
  add column if not exists hired_at timestamptz;
