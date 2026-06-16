-- Convert fixed-choice text columns to PostgreSQL enums so Supabase Table Editor
-- shows dropdown pickers instead of free-text fields.

-- ─── Enum types ─────────────────────────────────────────────────────────────

do $types$
begin
  create type public.profile_role as enum ('applicant', 'employer', 'candidate');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.onboarding_step as enum (
    'welcome',
    'details',
    'how_it_works',
    'completed',
    'employer_company',
    'employer_template',
    'employer_weights',
    'employer_calibration'
  );
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.business_size as enum ('1-10', '11-50', '51-200', '201-500', '500+');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.candidate_profile_status as enum ('draft', 'published', 'hidden');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.intake_status as enum ('draft', 'complete');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.intake_response_format as enum (
    'diametric',
    'anchored_scale',
    'ranked',
    'free_text',
    'multi_select'
  );
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.role_status as enum ('open', 'paused', 'closed');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.engagement_source as enum ('assessment_link', 'employer_search', 'direct');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.engagement_stage as enum (
    'discovered',
    'contacted',
    'responded',
    'interviewing',
    'decision',
    'hired',
    'rejected',
    'closed'
  );
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.hiring_outcome as enum ('shortlisted', 'hired', 'rejected');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.snapshot_type as enum ('30_day', '90_day');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.performance_band as enum ('top', 'mid', 'low');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.message_sender as enum ('employer', 'candidate');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.activity_event_type as enum ('match', 'view', 'profile', 'system');
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.trait_dimension_key as enum (
    'learning_velocity',
    'ownership_follow_through',
    'resilience',
    'communication_confidence',
    'relational_intelligence',
    'motivational_fit_mastery',
    'motivational_fit_impact',
    'motivational_fit_recognition',
    'motivational_fit_autonomy'
  );
exception when duplicate_object then null;
end
$types$;

do $types$
begin
  create type public.learning_resource_type as enum ('article', 'course', 'podcast', 'video');
exception when duplicate_object then null;
end
$types$;

-- Bridge: employer_status may still be text if an older copy of 20260610000000 ran first.
do $bridge$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'employer_status'
  ) then
    create type public.employer_status as enum ('pending', 'approved', 'rejected');
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'employer_status'
      and udt_name = 'text'
  ) then
    alter table public.profiles drop constraint if exists profiles_employer_status_check;
    alter table public.profiles
      alter column employer_status type public.employer_status
      using employer_status::text::public.employer_status;
  end if;
end
$bridge$;

-- Normalize legacy performance band label before enum conversion.
update public.performance_snapshots
set performance_band = 'mid'
where performance_band = 'middle';

-- ─── Drop policies / triggers / functions that block column type changes ────
-- Postgres refuses ALTER COLUMN TYPE when RLS policies or functions reference the column.

drop trigger if exists profiles_protect_role_columns on public.profiles;
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists trg_explore_role_interest_notify on public.candidate_explore_role_interests;

drop policy if exists "businesses: employer read" on public.businesses;
drop policy if exists "roles: public read open roles" on public.roles;
drop policy if exists "candidate_profiles: employer read" on public.candidate_profiles;
drop policy if exists "engagement_messages: candidate insert" on public.engagement_messages;
drop policy if exists "engagement_messages: employer insert" on public.engagement_messages;

do $drop_extra$
begin
  if to_regclass('public.applicant_trait_scores') is not null then
    execute 'drop policy if exists "trait_scores: employer read" on public.applicant_trait_scores';
  end if;
  if to_regclass('public.applicant_profiles') is not null then
    execute 'drop policy if exists "applicant_profiles: employer read" on public.applicant_profiles';
  end if;
end
$drop_extra$;

drop function if exists public.employer_can_read_candidate_profile(uuid);
drop function if exists public.auth_user_is_approved_employer();
drop function if exists public.auth_user_is_employer();
drop function if exists public.business_has_open_assessment_role(uuid);
drop function if exists public.claim_initial_profile_role(text);
drop function if exists public.handle_new_user() cascade;
drop function if exists public.notify_business_on_explore_role_interest() cascade;
drop function if exists public.profiles_protect_role_columns() cascade;

-- ─── profiles ───────────────────────────────────────────────────────────────

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  alter column role type public.profile_role
  using role::text::public.profile_role;

alter table public.profiles drop constraint if exists profiles_onboarding_step_check;
alter table public.profiles
  alter column onboarding_step type public.onboarding_step
  using onboarding_step::text::public.onboarding_step;

-- ─── businesses ─────────────────────────────────────────────────────────────

alter table public.businesses drop constraint if exists businesses_size_check;
alter table public.businesses
  alter column size type public.business_size
  using size::text::public.business_size;

-- ─── candidate_profiles ─────────────────────────────────────────────────────

do $candidate$
begin
  if to_regclass('public.candidate_profiles') is null then
    return;
  end if;

  execute 'alter table public.candidate_profiles drop constraint if exists applicant_profiles_status_check';
  execute 'alter table public.candidate_profiles drop constraint if exists candidate_profiles_status_check';

  execute $sql$
    alter table public.candidate_profiles
      alter column status type public.candidate_profile_status
      using coalesce(status, 'draft')::text::public.candidate_profile_status
  $sql$;

  execute $sql$
    alter table public.candidate_profiles
      alter column status set default 'draft'::public.candidate_profile_status
  $sql$;

  execute $sql$
    update public.candidate_profiles
    set intake_status = 'draft'
    where intake_status is not null
      and trim(intake_status) = ''
  $sql$;

  execute $sql$
    update public.candidate_profiles
    set intake_status = 'draft'
    where intake_status is not null
      and intake_status not in ('draft', 'complete')
  $sql$;

  execute $sql$
    alter table public.candidate_profiles
      alter column intake_status type public.intake_status
      using intake_status::text::public.intake_status
  $sql$;
end
$candidate$;

-- ─── intake_responses ───────────────────────────────────────────────────────

do $intake$
begin
  if to_regclass('public.intake_responses') is null then
    return;
  end if;

  execute 'alter table public.intake_responses drop constraint if exists intake_responses_format_check';

  execute $sql$
    alter table public.intake_responses
      alter column format type public.intake_response_format
      using format::text::public.intake_response_format
  $sql$;
end
$intake$;

-- ─── roles ──────────────────────────────────────────────────────────────────

do $roles$
begin
  if to_regclass('public.roles') is null then
    return;
  end if;

  execute 'alter table public.roles drop constraint if exists roles_status_check';

  execute $sql$
    alter table public.roles
      alter column status type public.role_status
      using coalesce(status, 'open')::text::public.role_status
  $sql$;

  execute $sql$
    alter table public.roles
      alter column status set default 'open'::public.role_status
  $sql$;
end
$roles$;

-- ─── engagements ────────────────────────────────────────────────────────────

do $engagements$
begin
  if to_regclass('public.engagements') is null then
    return;
  end if;

  execute 'alter table public.engagements drop constraint if exists engagements_source_check';
  execute 'alter table public.engagements drop constraint if exists engagements_stage_check';

  execute $sql$
    alter table public.engagements
      alter column source type public.engagement_source
      using source::text::public.engagement_source
  $sql$;

  execute $sql$
    alter table public.engagements
      alter column stage type public.engagement_stage
      using stage::text::public.engagement_stage
  $sql$;

  execute $sql$
    alter table public.engagements
      alter column stage set default 'discovered'::public.engagement_stage
  $sql$;
end
$engagements$;

-- ─── hiring_decisions ───────────────────────────────────────────────────────

do $decisions$
begin
  if to_regclass('public.hiring_decisions') is null then
    return;
  end if;

  execute 'alter table public.hiring_decisions drop constraint if exists hiring_decisions_outcome_check';

  execute $sql$
    alter table public.hiring_decisions
      alter column outcome type public.hiring_outcome
      using outcome::text::public.hiring_outcome
  $sql$;
end
$decisions$;

-- ─── performance_snapshots ──────────────────────────────────────────────────

do $snapshots$
begin
  if to_regclass('public.performance_snapshots') is null then
    return;
  end if;

  execute 'alter table public.performance_snapshots drop constraint if exists performance_snapshots_snapshot_type_check';
  execute 'alter table public.performance_snapshots drop constraint if exists performance_snapshots_performance_band_check';

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'performance_snapshots'
      and column_name = 'snapshot_type'
  ) then
    execute $sql$
      alter table public.performance_snapshots
        alter column snapshot_type type public.snapshot_type
        using snapshot_type::text::public.snapshot_type
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'performance_snapshots'
      and column_name = 'performance_band'
  ) then
    execute $sql$
      alter table public.performance_snapshots
        alter column performance_band type public.performance_band
        using performance_band::text::public.performance_band
    $sql$;
  end if;
end
$snapshots$;

-- ─── engagement_messages ────────────────────────────────────────────────────

do $messages$
begin
  if to_regclass('public.engagement_messages') is null then
    return;
  end if;

  execute 'alter table public.engagement_messages drop constraint if exists engagement_messages_sender_check';

  execute $sql$
    alter table public.engagement_messages
      alter column sender type public.message_sender
      using sender::text::public.message_sender
  $sql$;
end
$messages$;

-- ─── candidate_activity_events ──────────────────────────────────────────────

do $events$
begin
  if to_regclass('public.candidate_activity_events') is null then
    return;
  end if;

  execute 'alter table public.candidate_activity_events drop constraint if exists candidate_activity_events_event_type_check';

  execute $sql$
    alter table public.candidate_activity_events
      alter column event_type type public.activity_event_type
      using event_type::text::public.activity_event_type
  $sql$;
end
$events$;

-- ─── explore catalog ────────────────────────────────────────────────────────

do $explore$
begin
  if to_regclass('public.explore_industry_trait_highlights') is not null then
    execute 'alter table public.explore_industry_trait_highlights drop constraint if exists explore_industry_trait_highlights_dimension_key_check';
    execute $sql$
      alter table public.explore_industry_trait_highlights
        alter column dimension_key type public.trait_dimension_key
        using dimension_key::text::public.trait_dimension_key
    $sql$;
  end if;

  if to_regclass('public.explore_industry_learning_links') is not null then
    execute 'alter table public.explore_industry_learning_links drop constraint if exists explore_industry_learning_links_resource_type_check';
    execute $sql$
      alter table public.explore_industry_learning_links
        alter column resource_type type public.learning_resource_type
        using resource_type::text::public.learning_resource_type
    $sql$;
  end if;
end
$explore$;

-- ─── Restore triggers, functions, and RLS policies ──────────────────────────

create or replace function public.profiles_protect_role_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(current_setting('cme.allow_profile_role_change', true), '') = 'on' then
    return new;
  end if;

  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'profile role cannot be changed';
  end if;

  if new.employer_status is distinct from old.employer_status then
    raise exception 'employer approval status cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_role_columns on public.profiles;
create trigger profiles_protect_role_columns
  before update on public.profiles
  for each row
  execute function public.profiles_protect_role_columns();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_meta_role text;
begin
  v_meta_role := coalesce(new.raw_user_meta_data->>'role', '');

  v_role := case
    when v_meta_role = 'employer' then 'employer'
    when v_meta_role = 'applicant' then 'candidate'
    else 'candidate'
  end;

  insert into public.profiles (id, email, full_name, role, employer_status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username'
    ),
    v_role::public.profile_role,
    case when v_role = 'employer' then 'pending'::public.employer_status else null end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

revoke execute on function public.handle_new_user() from anon, authenticated, public;

create or replace function public.claim_initial_profile_role(p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_role <> 'employer' then
    return;
  end if;

  perform set_config('cme.allow_profile_role_change', 'on', true);

  update public.profiles
  set
    role = 'employer'::public.profile_role,
    employer_status = 'pending'::public.employer_status,
    updated_at = now()
  where id = auth.uid()
    and role = 'candidate'::public.profile_role;
end;
$$;

revoke all on function public.claim_initial_profile_role(text) from public;
grant execute on function public.claim_initial_profile_role(text) to authenticated;

create or replace function public.auth_user_is_approved_employer()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'employer'::public.profile_role
      and employer_status = 'approved'::public.employer_status
  );
$$;

revoke all on function public.auth_user_is_approved_employer() from public;
grant execute on function public.auth_user_is_approved_employer() to authenticated;

create or replace function public.auth_user_is_employer()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.auth_user_is_approved_employer();
$$;

revoke all on function public.auth_user_is_employer() from public;
grant execute on function public.auth_user_is_employer() to authenticated;

create or replace function public.employer_can_read_candidate_profile(p_candidate_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.profiles ep
    where ep.id = auth.uid()
      and ep.role = 'employer'::public.profile_role
      and ep.employer_status = 'approved'::public.employer_status
  )
  and (
    exists (
      select 1
      from public.candidate_profiles cp
      where cp.id = p_candidate_id
        and coalesce(cp.status, 'draft'::public.candidate_profile_status) <> 'hidden'::public.candidate_profile_status
    )
    or exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id and b.owner_id = auth.uid()
      where e.candidate_id = p_candidate_id
    )
  );
$$;

revoke all on function public.employer_can_read_candidate_profile(uuid) from public;
grant execute on function public.employer_can_read_candidate_profile(uuid) to authenticated;

create or replace function public.business_has_open_assessment_role(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.roles r
    where r.business_id = p_business_id
      and r.assessment_link_token is not null
      and r.status = 'open'::public.role_status
  );
$$;

revoke all on function public.business_has_open_assessment_role(uuid) from public;
grant execute on function public.business_has_open_assessment_role(uuid) to anon, authenticated;

create or replace function public.notify_business_on_explore_role_interest()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bid uuid;
begin
  if new.sample_role_id is not null then
    select r.business_id into bid
    from public.explore_industry_sample_roles sr
    join public.roles r on r.id = sr.role_id
    where sr.id = new.sample_role_id
      and r.status = 'open'::public.role_status
    limit 1;
  end if;

  if bid is null then
    select b.id into bid
    from public.businesses b
    where lower(trim(b.name)) = lower(trim(new.company_name))
    limit 1;
  end if;

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

drop policy if exists "businesses: employer read" on public.businesses;
create policy "businesses: employer read"
  on public.businesses
  for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'employer'::public.profile_role
    )
  );

drop policy if exists "roles: public read open roles" on public.roles;
create policy "roles: public read open roles"
  on public.roles
  for select
  using (status = 'open'::public.role_status);

drop policy if exists "candidate_profiles: employer read" on public.candidate_profiles;
create policy "candidate_profiles: employer read"
  on public.candidate_profiles
  for select
  using (public.employer_can_read_candidate_profile(id));

drop policy if exists "engagement_messages: candidate insert" on public.engagement_messages;
create policy "engagement_messages: candidate insert"
  on public.engagement_messages
  for insert
  with check (
    sender = 'candidate'::public.message_sender
    and exists (
      select 1
      from public.engagements e
      join public.candidate_profiles cp on cp.id = e.candidate_id
      where e.id = engagement_messages.engagement_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "engagement_messages: employer insert" on public.engagement_messages;
create policy "engagement_messages: employer insert"
  on public.engagement_messages
  for insert
  with check (
    sender = 'employer'::public.message_sender
    and exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.id = engagement_messages.engagement_id
        and b.owner_id = auth.uid()
    )
  );

-- Friendly labels for Supabase Table Editor (optional documentation).
comment on type public.employer_status is 'Employer vetting: pending → approved unlocks marketplace.';
comment on type public.profile_role is 'Account type: candidate (job seeker) or employer (hiring team).';
comment on type public.onboarding_step is 'Applicant or employer onboarding wizard step.';
comment on type public.business_size is 'Company headcount band.';
comment on type public.candidate_profile_status is 'Marketplace visibility: draft, published, or hidden.';
comment on type public.intake_status is 'Assessment intake progress: draft or complete.';
comment on type public.engagement_stage is 'Hiring pipeline stage for an employer–candidate engagement.';
comment on type public.performance_band is 'Post-hire performance band: top, mid, or low.';
