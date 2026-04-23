-- ============================================================
-- CMe — Intake canonical state
-- Ensures candidate_profiles + intake_responses are fully
-- consistent with what the frontend and edge functions expect.
-- Safe to run on any DB state (fresh or partially migrated).
-- All steps are idempotent.
-- ============================================================


-- ─── 1. profiles.role: ensure 'candidate' is a valid value ───
do $$
declare cname text;
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
       select 1 from pg_constraint c2
       join pg_class r2 on r2.oid = c2.conrelid
       where r2.relname = 'profiles'
         and pg_get_constraintdef(c2.oid) ilike '%candidate%'
     ) then
    execute format('alter table public.profiles drop constraint %I', cname);
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('applicant', 'employer', 'candidate'));
  end if;
end $$;


-- ─── 2. handle_new_user trigger: use 'candidate' as default role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username'
    ),
    case
      when coalesce(new.raw_user_meta_data->>'role', '') = 'employer' then 'employer'
      when coalesce(new.raw_user_meta_data->>'role', '') = 'applicant' then 'candidate'
      else 'candidate'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── 3. candidate_profiles: all columns the app reads/writes ─
-- (Safe whether this is a renamed applicant_profiles or brand new)
do $$
begin
  if to_regclass('public.candidate_profiles') is null then
    return; -- created by earlier migrations; nothing to do on fresh DB
  end if;

  alter table public.candidate_profiles add column if not exists age                       integer;
  alter table public.candidate_profiles add column if not exists optional_fields_completed boolean default false;
  alter table public.candidate_profiles add column if not exists learning_velocity         integer;
  alter table public.candidate_profiles add column if not exists ownership_follow_through  integer;
  alter table public.candidate_profiles add column if not exists resilience                integer;
  alter table public.candidate_profiles add column if not exists communication_confidence  integer;
  alter table public.candidate_profiles add column if not exists relational_intelligence   integer;
  alter table public.candidate_profiles add column if not exists motivational_fit_mastery  integer;
  alter table public.candidate_profiles add column if not exists motivational_fit_impact   integer;
  alter table public.candidate_profiles add column if not exists motivational_fit_recognition integer;
  alter table public.candidate_profiles add column if not exists motivational_fit_autonomy integer;
  alter table public.candidate_profiles add column if not exists motivational_fit          integer;
  alter table public.candidate_profiles add column if not exists intake_status             text;
  alter table public.candidate_profiles add column if not exists published                 boolean default false;
end $$;


-- ─── 4. intake_responses: drop FKs, rename columns, reattach ─
-- Renames applicant_id → candidate_id and question_id → question_key
-- if they haven't already been renamed by migration 20260413.
do $$
declare
  r record;
begin
  if to_regclass('public.intake_responses') is null then
    return;
  end if;

  -- Drop all existing FKs so we can rename columns freely
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public' and t.relname = 'intake_responses' and c.contype = 'f'
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

  -- Re-attach FK to candidate_profiles
  if to_regclass('public.candidate_profiles') is not null then
    if not exists (
      select 1 from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      where t.relname = 'intake_responses' and c.conname = 'intake_responses_candidate_id_fkey'
    ) then
      alter table public.intake_responses
        add constraint intake_responses_candidate_id_fkey
        foreign key (candidate_id) references public.candidate_profiles(id) on delete cascade;
    end if;
  end if;
end $$;


-- ─── 5. intake_responses: unique constraint for upsert ───────
do $$
begin
  if to_regclass('public.intake_responses') is null then return; end if;

  alter table public.intake_responses drop constraint if exists intake_responses_applicant_id_question_id_key;
  alter table public.intake_responses drop constraint if exists intake_responses_candidate_id_question_key_key;

  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'intake_responses' and c.conname = 'intake_responses_candidate_question_unique'
  ) then
    alter table public.intake_responses
      add constraint intake_responses_candidate_question_unique
      unique (candidate_id, question_key);
  end if;
end $$;


-- ─── 6. RLS: ensure both tables have correct policies ────────
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
      where id = auth.uid() and role = 'employer'
    )
  );

alter table public.intake_responses enable row level security;

drop policy if exists "intake_responses: own row" on public.intake_responses;
create policy "intake_responses: own row"
  on public.intake_responses for all
  using (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_id and cp.user_id = auth.uid()
    )
  );
