-- CMe — Schema reconciliation: applicant_* → candidate_* (local + remote)
-- Safe to run on fresh DB (after 20260403000000 + 20260406000001) or on partially migrated projects.
-- Idempotent: skips steps when objects already match the target shape.

-- ─── 0. profiles.role: allow 'candidate' (app metadata) alongside legacy 'applicant'
do $$
declare
  cname text;
begin
  select con.conname into cname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'profiles'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%role%'
  limit 1;
  if cname is not null
     and not exists (
       select 1 from pg_constraint con2
       join pg_class rel2 on rel2.oid = con2.conrelid
       where rel2.relname = 'profiles'
         and pg_get_constraintdef(con2.oid) ilike '%candidate%'
     ) then
    execute format('alter table public.profiles drop constraint %I', cname);
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('applicant', 'employer', 'candidate'));
  end if;
end $$;


-- ─── 1. Drop RLS policies that reference old table/column names (recreated below)
do $$
begin
  if to_regclass('public.applicant_profiles') is not null then
    drop policy if exists "applicant_profiles: own row" on public.applicant_profiles;
    drop policy if exists "applicant_profiles: employer read" on public.applicant_profiles;
  end if;
  if to_regclass('public.candidate_profiles') is not null then
    drop policy if exists "candidate_profiles: own row" on public.candidate_profiles;
    drop policy if exists "candidate_profiles: employer read" on public.candidate_profiles;
  end if;
  if to_regclass('public.applicant_trait_scores') is not null then
    drop policy if exists "applicant_trait_scores: own row" on public.applicant_trait_scores;
    drop policy if exists "trait_scores: employer read" on public.applicant_trait_scores;
  end if;
  if to_regclass('public.intake_responses') is not null then
    drop policy if exists "intake_responses: own row" on public.intake_responses;
  end if;
  if to_regclass('public.engagements') is not null then
    drop policy if exists "engagements: applicant own rows" on public.engagements;
    drop policy if exists "engagements: candidate own rows" on public.engagements;
    drop policy if exists "engagements: employer business rows" on public.engagements;
  end if;
end $$;


-- ─── 2. Trait + tracking columns on profile table (both names — covers pre-renamed DBs)
do $$
begin
  if to_regclass('public.applicant_profiles') is not null then
    alter table public.applicant_profiles add column if not exists learning_velocity integer;
    alter table public.applicant_profiles add column if not exists ownership_follow_through integer;
    alter table public.applicant_profiles add column if not exists resilience integer;
    alter table public.applicant_profiles add column if not exists communication_confidence integer;
    alter table public.applicant_profiles add column if not exists relational_intelligence integer;
    alter table public.applicant_profiles add column if not exists motivational_fit_mastery integer;
    alter table public.applicant_profiles add column if not exists motivational_fit_impact integer;
    alter table public.applicant_profiles add column if not exists motivational_fit_recognition integer;
    alter table public.applicant_profiles add column if not exists motivational_fit_autonomy integer;
    alter table public.applicant_profiles add column if not exists motivational_fit integer;
    alter table public.applicant_profiles add column if not exists intake_status text;
    alter table public.applicant_profiles add column if not exists published boolean default false;
  end if;
  if to_regclass('public.candidate_profiles') is not null then
    alter table public.candidate_profiles add column if not exists learning_velocity integer;
    alter table public.candidate_profiles add column if not exists ownership_follow_through integer;
    alter table public.candidate_profiles add column if not exists resilience integer;
    alter table public.candidate_profiles add column if not exists communication_confidence integer;
    alter table public.candidate_profiles add column if not exists relational_intelligence integer;
    alter table public.candidate_profiles add column if not exists motivational_fit_mastery integer;
    alter table public.candidate_profiles add column if not exists motivational_fit_impact integer;
    alter table public.candidate_profiles add column if not exists motivational_fit_recognition integer;
    alter table public.candidate_profiles add column if not exists motivational_fit_autonomy integer;
    alter table public.candidate_profiles add column if not exists motivational_fit integer;
    alter table public.candidate_profiles add column if not exists intake_status text;
    alter table public.candidate_profiles add column if not exists published boolean default false;
  end if;
end $$;


-- ─── 3. Copy trait scores from applicant_trait_scores into profile row, then drop trait table
do $$
begin
  if to_regclass('public.applicant_trait_scores') is not null
     and to_regclass('public.applicant_profiles') is not null then
    update public.applicant_profiles ap
    set
      learning_velocity = coalesce(ap.learning_velocity, ats.learning_velocity),
      ownership_follow_through = coalesce(ap.ownership_follow_through, ats.ownership_follow_through),
      resilience = coalesce(ap.resilience, ats.resilience),
      communication_confidence = coalesce(ap.communication_confidence, ats.communication_confidence),
      relational_intelligence = coalesce(ap.relational_intelligence, ats.relational_intelligence),
      motivational_fit_mastery = coalesce(ap.motivational_fit_mastery, ats.motivational_fit_mastery),
      motivational_fit_impact = coalesce(ap.motivational_fit_impact, ats.motivational_fit_impact),
      motivational_fit_recognition = coalesce(ap.motivational_fit_recognition, ats.motivational_fit_recognition),
      motivational_fit_autonomy = coalesce(ap.motivational_fit_autonomy, ats.motivational_fit_autonomy),
      motivational_fit = coalesce(ap.motivational_fit, ats.motivational_fit),
      updated_at = greatest(ap.updated_at, ats.updated_at)
    from public.applicant_trait_scores ats
    where ats.applicant_id = ap.id;

    drop table public.applicant_trait_scores cascade;
  end if;
end $$;


-- ─── 4. Rename applicant_profiles → candidate_profiles
do $$
begin
  if to_regclass('public.applicant_profiles') is not null
     and to_regclass('public.candidate_profiles') is null then
    alter table public.applicant_profiles rename to candidate_profiles;
  end if;
end $$;


-- ─── 5. Backfill intake_status from legacy intake_complete (column may be absent on older/partial DBs)
do $$
begin
  if to_regclass('public.candidate_profiles') is null then
    return;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'candidate_profiles'
      and column_name = 'intake_complete'
  ) then
    update public.candidate_profiles
    set intake_status = case
      when coalesce(intake_status::text, '') = '' and intake_complete = true then 'complete'
      when coalesce(intake_status::text, '') = '' then 'draft'
      else intake_status
    end
    where coalesce(intake_status::text, '') = '';
  else
    -- No intake_complete column: only default empty intake_status to draft
    update public.candidate_profiles
    set intake_status = 'draft'
    where coalesce(intake_status::text, '') = '';
  end if;
end $$;


-- ─── 6. intake_responses: drop FKs → rename columns → reattach FK
do $$
declare
  r record;
begin
  if to_regclass('public.intake_responses') is null then
    return;
  end if;
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'intake_responses'
      and c.contype = 'f'
  loop
    execute format('alter table public.intake_responses drop constraint %I', r.conname);
  end loop;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'intake_responses' and column_name = 'applicant_id'
  ) then
    alter table public.intake_responses rename column applicant_id to candidate_id;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'intake_responses' and column_name = 'question_id'
  ) then
    alter table public.intake_responses rename column question_id to question_key;
  end if;

  if to_regclass('public.candidate_profiles') is not null then
    alter table public.intake_responses
      add constraint intake_responses_candidate_id_fkey
      foreign key (candidate_id) references public.candidate_profiles(id) on delete cascade;
  end if;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  if to_regclass('public.intake_responses') is null then
    return;
  end if;
  -- Unique target for PostgREST upsert on (candidate_id, question_key)
  alter table public.intake_responses drop constraint if exists intake_responses_applicant_id_question_id_key;
  alter table public.intake_responses drop constraint if exists intake_responses_candidate_id_question_key_key;
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'intake_responses' and c.conname = 'intake_responses_candidate_question_unique'
  ) then
    alter table public.intake_responses
      add constraint intake_responses_candidate_question_unique unique (candidate_id, question_key);
  end if;
end $$;


-- ─── 7. engagements: applicant_id → candidate_id
do $$
begin
  if to_regclass('public.engagements') is null then
    return;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'engagements' and column_name = 'applicant_id'
  ) then
    return;
  end if;
  alter table public.engagements drop constraint if exists engagements_applicant_id_fkey;
  alter table public.engagements rename column applicant_id to candidate_id;
  if to_regclass('public.candidate_profiles') is not null then
    alter table public.engagements
      add constraint engagements_candidate_id_fkey
      foreign key (candidate_id) references public.candidate_profiles(id) on delete cascade;
  end if;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  if to_regclass('public.engagements') is null then
    return;
  end if;
  alter table public.engagements drop constraint if exists engagements_applicant_id_business_id_key;
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'engagements' and c.conname = 'engagements_candidate_business_unique'
  ) then
    alter table public.engagements
      add constraint engagements_candidate_business_unique unique (candidate_id, business_id);
  end if;
end $$;


-- ─── 8. RLS policies (new names)
alter table public.candidate_profiles enable row level security;

drop policy if exists "candidate_profiles: own row" on public.candidate_profiles;
create policy "candidate_profiles: own row"
  on public.candidate_profiles for all
  using (auth.uid() = user_id);

drop policy if exists "candidate_profiles: employer read" on public.candidate_profiles;
create policy "candidate_profiles: employer read"
  on public.candidate_profiles for select
  using (
    status = 'published'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('employer')
    )
  );

alter table public.intake_responses enable row level security;

drop policy if exists "intake_responses: own row" on public.intake_responses;
create policy "intake_responses: own row"
  on public.intake_responses for all
  using (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_id
        and cp.user_id = auth.uid()
    )
  );

alter table public.engagements enable row level security;

drop policy if exists "engagements: candidate own rows" on public.engagements;
create policy "engagements: candidate own rows"
  on public.engagements for select
  using (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "engagements: employer business rows" on public.engagements;
create policy "engagements: employer business rows"
  on public.engagements for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and b.owner_id = auth.uid()
    )
  );
