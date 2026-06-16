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

-- Friendly labels for Supabase Table Editor (optional documentation).
comment on type public.employer_status is 'Employer vetting: pending → approved unlocks marketplace.';
comment on type public.profile_role is 'Account type: candidate (job seeker) or employer (hiring team).';
comment on type public.onboarding_step is 'Applicant or employer onboarding wizard step.';
comment on type public.business_size is 'Company headcount band.';
comment on type public.candidate_profile_status is 'Marketplace visibility: draft, published, or hidden.';
comment on type public.intake_status is 'Assessment intake progress: draft or complete.';
comment on type public.engagement_stage is 'Hiring pipeline stage for an employer–candidate engagement.';
comment on type public.performance_band is 'Post-hire performance band: top, mid, or low.';
