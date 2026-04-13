-- ============================================================
-- CMe Platform — Spec 1: Data Schema & Supabase Migration
-- Version: v1.0
-- ============================================================
-- Run this migration once against your Supabase project.
-- All tables use UUIDs as primary keys.
-- All timestamps are timestamptz.
-- RLS is enabled on all tables (policies defined at the bottom).
-- ============================================================


-- ============================================================
-- 3.1 profiles
-- Extends the Supabase auth.users table.
-- One row per user regardless of type.
-- ============================================================
create table if not exists profiles (
  id           uuid references auth.users(id) primary key,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  email        text not null,
  full_name    text,
  role         text check (role in ('applicant', 'employer')) not null,
  avatar_url   text,
  onboarding_complete boolean default false
);
-- role determines which onboarding flow the user sees after sign-up.
-- Set during registration, not editable after.


-- ============================================================
-- 3.2 businesses
-- One row per company. An employer user belongs to one business.
-- ============================================================
create table if not exists businesses (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  owner_id    uuid references profiles(id) not null,
  name        text not null,
  industry    text,
  size        text check (size in ('1-10', '11-50', '51-200', '201-500', '500+')),
  website     text,
  description text,
  logo_url    text
);


-- ============================================================
-- 3.3 employer_trait_weightings
-- Stores the 100-point allocation per business.
-- One active row per business at any time.
-- Previous weightings are retained with superseded_at for audit.
-- ============================================================
create table if not exists employer_trait_weightings (
  id                       uuid default gen_random_uuid() primary key,
  created_at               timestamptz default now(),
  superseded_at            timestamptz,
  business_id              uuid references businesses(id) not null,
  role_template            text,
  -- six primary dimension weightings (must sum to 100, each >= 5)
  learning_velocity        integer not null check (learning_velocity >= 5),
  ownership_follow_through integer not null check (ownership_follow_through >= 5),
  resilience               integer not null check (resilience >= 5),
  communication_confidence integer not null check (communication_confidence >= 5),
  relational_intelligence  integer not null check (relational_intelligence >= 5),
  motivational_fit         integer not null check (motivational_fit >= 5),
  -- all six dimensions must sum to exactly 100
  constraint weightings_sum_100 check (
    learning_velocity
    + ownership_follow_through
    + resilience
    + communication_confidence
    + relational_intelligence
    + motivational_fit = 100
  )
);
-- motivational_fit is stored as a single weight at the employer level.
-- The four sub-dimensions (Mastery, Impact, Recognition, Autonomy) are scored
-- at the candidate level — the employer weights the dimension as a whole.
-- role_template stores the slug used as the starting point (e.g. 'sales', 'operations').
-- Null if employer set weights manually without using a template.


-- ============================================================
-- 3.4 applicant_profiles
-- Extended profile data for applicant users.
-- Linked to profiles via user_id.
-- ============================================================
create table if not exists applicant_profiles (
  id                    uuid default gen_random_uuid() primary key,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  user_id               uuid references profiles(id) not null unique,
  -- status
  status                text check (status in ('draft', 'published', 'hidden')) default 'draft',
  intake_complete       boolean default false,
  intake_completed_at   timestamptz,
  -- account setup fields
  location              text,
  work_rights           text,
  availability          text,
  notice_period         text,
  salary_min            integer,
  salary_currency       text default 'NZD',
  experience_years      integer,
  current_situation     text,
  industry_background   text[],
  open_to_industries    boolean default true,
  preferred_work_type   text[],
  preferred_role_types  text[],
  org_size_preference   text,
  open_to_contract      text,
  -- section 1 narrative fields
  education_summary     text,
  experience_narrative  text,
  enjoyed_most          text,
  one_thing_to_know     text,
  -- section 8 profile fields
  strength_1            text,
  strength_2            text,
  strength_3            text,
  working_context       text,
  testimonial_name      text,
  testimonial_relation  text,
  testimonial_text      text,
  open_context          text
);


-- ============================================================
-- 3.5 applicant_trait_scores
-- The computed trait scores for each applicant.
-- One row per applicant, updated as intake sections are completed.
-- Scores are normalised to 1–100.
-- ============================================================
create table if not exists applicant_trait_scores (
  id                        uuid default gen_random_uuid() primary key,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now(),
  applicant_id              uuid references applicant_profiles(id) not null unique,
  -- primary dimension scores (1–100)
  learning_velocity         integer check (learning_velocity between 1 and 100),
  ownership_follow_through  integer check (ownership_follow_through between 1 and 100),
  resilience                integer check (resilience between 1 and 100),
  communication_confidence  integer check (communication_confidence between 1 and 100),
  relational_intelligence   integer check (relational_intelligence between 1 and 100),
  -- motivational fit sub-dimensions (1–100)
  motivational_fit_mastery      integer check (motivational_fit_mastery between 1 and 100),
  motivational_fit_impact       integer check (motivational_fit_impact between 1 and 100),
  motivational_fit_recognition  integer check (motivational_fit_recognition between 1 and 100),
  motivational_fit_autonomy     integer check (motivational_fit_autonomy between 1 and 100),
  -- computed motivational fit aggregate (average of four sub-dimensions)
  motivational_fit          integer check (motivational_fit between 1 and 100),
  -- scoring metadata
  sections_complete         integer default 0,
  score_version             text default 'v1',
  llm_flags                 jsonb
);
-- llm_flags stores inconsistency signals from the LLM consistency layer as a JSON
-- array of objects: { dimension, signal, severity }.
-- Used for internal review only — not surfaced to employers in v1.
-- motivational_fit (aggregate) = average of the four sub-dimension scores.
-- Recomputed on each section save.


-- ============================================================
-- 3.6 intake_responses
-- Stores raw question responses from the candidate intake flow.
-- One row per question per applicant.
-- ============================================================
create table if not exists intake_responses (
  id             uuid default gen_random_uuid() primary key,
  created_at     timestamptz default now(),
  applicant_id   uuid references applicant_profiles(id) not null,
  section        integer not null,
  question_id    text not null,
  format         text check (format in (
                   'diametric',
                   'anchored_scale',
                   'ranked',
                   'free_text',
                   'multi_select'
                 )) not null,
  response_value  text,        -- used for single-option questions
  response_array  text[],      -- used for multi-select and ranked preference questions
  score_data      jsonb,       -- dimension scores for selected option: { "learning_velocity": 4, ... }
  llm_score       jsonb,       -- rubric output for behavioural tasks: [{ "criterion": "...", "score": 4, "dimension": "..." }]
  time_spent_sec  integer,
  unique (applicant_id, question_id)
);


-- ============================================================
-- 3.7 roles
-- A hiring role or position created by an employer.
-- One business can have multiple roles.
-- ============================================================
create table if not exists roles (
  id                    uuid default gen_random_uuid() primary key,
  created_at            timestamptz default now(),
  business_id           uuid references businesses(id) not null,
  title                 text not null,
  role_type             text,
  seniority             text,
  location              text,
  description           text,
  status                text check (status in ('open', 'paused', 'closed')) default 'open',
  assessment_link_token text unique
);
-- assessment_link_token is a unique slug generated when the employer creates an
-- assessment link. Candidates who arrive via this token are linked to this role
-- automatically.


-- ============================================================
-- 3.8 engagements
-- Tracks the relationship between an applicant and a business/role.
-- One row per applicant-business pair.
-- ============================================================
create table if not exists engagements (
  id             uuid default gen_random_uuid() primary key,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  applicant_id   uuid references applicant_profiles(id) not null,
  business_id    uuid references businesses(id) not null,
  role_id        uuid references roles(id),
  source         text check (source in ('assessment_link', 'employer_search', 'direct')),
  stage          text check (stage in (
                   'discovered',
                   'contacted',
                   'interviewing',
                   'decision',
                   'closed'
                 )) default 'discovered',
  match_score    integer check (match_score between 0 and 100),
  employer_notes text,
  unique (applicant_id, business_id)
);
-- match_score is computed at engagement creation and updated if employer
-- weightings change. Formula defined in Spec 5 (Match Scoring Engine).


-- ============================================================
-- 3.9 hiring_decisions
-- Records the outcome of an engagement.
-- One row per engagement.
-- ============================================================
create table if not exists hiring_decisions (
  id             uuid default gen_random_uuid() primary key,
  created_at     timestamptz default now(),
  engagement_id  uuid references engagements(id) not null unique,
  outcome        text check (outcome in ('shortlisted', 'hired', 'rejected')) not null,
  decision_date  date,
  manager_notes  text
);


-- ============================================================
-- 3.10 performance_snapshots
-- Post-hire performance ratings. Triggered at 30 and 90 days.
-- One row per snapshot per hire.
-- ============================================================
create table if not exists performance_snapshots (
  id                    uuid default gen_random_uuid() primary key,
  created_at            timestamptz default now(),
  hiring_decision_id    uuid references hiring_decisions(id) not null,
  snapshot_type         text check (snapshot_type in ('30_day', '90_day')) not null,
  -- performance band
  performance_band      text check (performance_band in ('top', 'middle', 'low')),
  would_rehire          boolean,
  -- trait dimension ratings (1–5, manager-rated)
  learning_velocity         integer check (learning_velocity between 1 and 5),
  ownership_follow_through  integer check (ownership_follow_through between 1 and 5),
  resilience                integer check (resilience between 1 and 5),
  communication_confidence  integer check (communication_confidence between 1 and 5),
  relational_intelligence   integer check (relational_intelligence between 1 and 5),
  motivational_fit          integer check (motivational_fit between 1 and 5),
  -- free text
  notes                 text,
  unique (hiring_decision_id, snapshot_type)
);
-- NOTE: Dimension ratings here use a 1–5 scale (manager-rated).
-- This is intentionally different from the 1–100 scale in applicant_trait_scores.
-- The candidate score is a composite of many inputs; the manager rating is a
-- single direct assessment.


-- ============================================================
-- 5.x Repair partial / legacy tables (safe before RLS)
--
-- If a table already existed from an older attempt, CREATE TABLE IF NOT EXISTS
-- skips the whole statement — so columns may be missing or misnamed. Policies
-- reference: user_id, owner_id, business_id, applicant_id, engagement_id,
-- hiring_decision_id, status (applicant_profiles, roles). This block renames
-- common legacy names, adds status when absent, and raises clear errors if a
-- table still cannot satisfy RLS (42703).
-- ============================================================

do $repair$
declare
  ps_cnt bigint;
begin
  -- applicant_profiles.user_id (policies: auth.uid() = user_id; ap.status)
  if to_regclass('public.applicant_profiles') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'applicant_profiles' and column_name = 'user_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'applicant_profiles' and column_name = 'profile_id'
      ) then
        alter table public.applicant_profiles rename column profile_id to user_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'applicant_profiles' and column_name = 'candidate_user_id'
      ) then
        alter table public.applicant_profiles rename column candidate_user_id to user_id;
      end if;
    end if;
  end if;

  -- businesses.owner_id (policies: owner_id = auth.uid(); common legacy: user_id)
  if to_regclass('public.businesses') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'businesses' and column_name = 'owner_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'businesses' and column_name = 'user_id'
      ) then
        alter table public.businesses rename column user_id to owner_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'businesses' and column_name = 'owner'
      ) then
        alter table public.businesses rename column owner to owner_id;
      end if;
    end if;
  end if;

  -- roles.business_id (policies join businesses b where b.id = business_id)
  if to_regclass('public.roles') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'roles' and column_name = 'business_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'roles' and column_name = 'company_id'
      ) then
        alter table public.roles rename column company_id to business_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'roles' and column_name = 'organisation_id'
      ) then
        alter table public.roles rename column organisation_id to business_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'roles' and column_name = 'organization_id'
      ) then
        alter table public.roles rename column organization_id to business_id;
      end if;
    end if;
  end if;

  -- employer_trait_weightings.business_id
  if to_regclass('public.employer_trait_weightings') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'employer_trait_weightings' and column_name = 'business_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'employer_trait_weightings' and column_name = 'company_id'
      ) then
        alter table public.employer_trait_weightings rename column company_id to business_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'employer_trait_weightings' and column_name = 'organisation_id'
      ) then
        alter table public.employer_trait_weightings rename column organisation_id to business_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'employer_trait_weightings' and column_name = 'organization_id'
      ) then
        alter table public.employer_trait_weightings rename column organization_id to business_id;
      end if;
    end if;
  end if;

  -- engagements.business_id (policies: b.id = business_id)
  if to_regclass('public.engagements') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'engagements' and column_name = 'business_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'engagements' and column_name = 'company_id'
      ) then
        alter table public.engagements rename column company_id to business_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'engagements' and column_name = 'organisation_id'
      ) then
        alter table public.engagements rename column organisation_id to business_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'engagements' and column_name = 'organization_id'
      ) then
        alter table public.engagements rename column organization_id to business_id;
      end if;
    end if;
  end if;

  -- applicant_trait_scores.applicant_id
  if to_regclass('public.applicant_trait_scores') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'applicant_trait_scores' and column_name = 'applicant_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'applicant_trait_scores' and column_name = 'candidate_id'
      ) then
        alter table public.applicant_trait_scores rename column candidate_id to applicant_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'applicant_trait_scores' and column_name = 'profile_id'
      ) then
        alter table public.applicant_trait_scores rename column profile_id to applicant_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'applicant_trait_scores' and column_name = 'applicant_profile_id'
      ) then
        alter table public.applicant_trait_scores rename column applicant_profile_id to applicant_id;
      end if;
    end if;
  end if;

  -- intake_responses.applicant_id
  if to_regclass('public.intake_responses') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'intake_responses' and column_name = 'applicant_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'intake_responses' and column_name = 'candidate_id'
      ) then
        alter table public.intake_responses rename column candidate_id to applicant_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'intake_responses' and column_name = 'profile_id'
      ) then
        alter table public.intake_responses rename column profile_id to applicant_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'intake_responses' and column_name = 'applicant_profile_id'
      ) then
        alter table public.intake_responses rename column applicant_profile_id to applicant_id;
      end if;
    end if;
  end if;

  -- engagements.applicant_id
  if to_regclass('public.engagements') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'engagements' and column_name = 'applicant_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'engagements' and column_name = 'candidate_id'
      ) then
        alter table public.engagements rename column candidate_id to applicant_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'engagements' and column_name = 'profile_id'
      ) then
        alter table public.engagements rename column profile_id to applicant_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'engagements' and column_name = 'applicant_profile_id'
      ) then
        alter table public.engagements rename column applicant_profile_id to applicant_id;
      end if;
    end if;
  end if;

  -- hiring_decisions.engagement_id (policies join engagements e where e.id = engagement_id)
  if to_regclass('public.hiring_decisions') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'hiring_decisions' and column_name = 'engagement_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'hiring_decisions' and column_name = 'engagement'
      ) then
        alter table public.hiring_decisions rename column engagement to engagement_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'hiring_decisions' and column_name = 'engagements_id'
      ) then
        alter table public.hiring_decisions rename column engagements_id to engagement_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'hiring_decisions' and column_name = 'engagement_uuid'
      ) then
        alter table public.hiring_decisions rename column engagement_uuid to engagement_id;
      end if;
    end if;
  end if;

  -- performance_snapshots.hiring_decision_id (policies use hd.id = hiring_decision_id)
  if to_regclass('public.performance_snapshots') is not null then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hiring_decision_id'
    ) then
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'decision_id'
      ) then
        alter table public.performance_snapshots rename column decision_id to hiring_decision_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hire_decision_id'
      ) then
        alter table public.performance_snapshots rename column hire_decision_id to hiring_decision_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hiring_decision'
      ) then
        alter table public.performance_snapshots rename column hiring_decision to hiring_decision_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'decision_uuid'
      ) then
        alter table public.performance_snapshots rename column decision_uuid to hiring_decision_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hiring_decisions_id'
      ) then
        alter table public.performance_snapshots rename column hiring_decisions_id to hiring_decision_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hd_id'
      ) then
        alter table public.performance_snapshots rename column hd_id to hiring_decision_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hiring_decision_uuid'
      ) then
        alter table public.performance_snapshots rename column hiring_decision_uuid to hiring_decision_id;
      elsif exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hdecision_id'
      ) then
        alter table public.performance_snapshots rename column hdecision_id to hiring_decision_id;
      end if;
    end if;
  end if;

  -- performance_snapshots: if still unusable but table is empty, replace with canonical DDL (CREATE IF NOT EXISTS skipped it earlier)
  if to_regclass('public.performance_snapshots') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hiring_decision_id'
     ) then
    select count(*) into ps_cnt from public.performance_snapshots;
    if ps_cnt = 0 then
      drop table public.performance_snapshots cascade;
      create table public.performance_snapshots (
        id                    uuid default gen_random_uuid() primary key,
        created_at            timestamptz default now(),
        hiring_decision_id    uuid references public.hiring_decisions(id) not null,
        snapshot_type         text check (snapshot_type in ('30_day', '90_day')) not null,
        performance_band      text check (performance_band in ('top', 'middle', 'low')),
        would_rehire          boolean,
        learning_velocity         integer check (learning_velocity between 1 and 5),
        ownership_follow_through  integer check (ownership_follow_through between 1 and 5),
        resilience                integer check (resilience between 1 and 5),
        communication_confidence  integer check (communication_confidence between 1 and 5),
        relational_intelligence   integer check (relational_intelligence between 1 and 5),
        motivational_fit          integer check (motivational_fit between 1 and 5),
        notes                 text,
        unique (hiring_decision_id, snapshot_type)
      );
    end if;
  end if;

  -- applicant_profiles.status (policies: ap.status = 'published')
  if to_regclass('public.applicant_profiles') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'applicant_profiles' and column_name = 'status'
     ) then
    alter table public.applicant_profiles add column status text default 'draft';
  end if;

  -- roles.status (policy: status = 'open')
  if to_regclass('public.roles') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'roles' and column_name = 'status'
     ) then
    alter table public.roles add column status text default 'open';
  end if;

  -- Fail fast with a clear message if a legacy table still has no applicant_id
  if to_regclass('public.applicant_trait_scores') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'applicant_trait_scores' and column_name = 'applicant_id'
     ) then
    raise exception
      'public.applicant_trait_scores exists without applicant_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.applicant_trait_scores CASCADE; and re-run this migration.';
  end if;
  if to_regclass('public.intake_responses') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'intake_responses' and column_name = 'applicant_id'
     ) then
    raise exception
      'public.intake_responses exists without applicant_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.intake_responses CASCADE; and re-run this migration.';
  end if;
  if to_regclass('public.engagements') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'engagements' and column_name = 'applicant_id'
     ) then
    raise exception
      'public.engagements exists without applicant_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.engagements CASCADE; and re-run this migration.';
  end if;

  if to_regclass('public.hiring_decisions') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'hiring_decisions' and column_name = 'engagement_id'
     ) then
    raise exception
      'public.hiring_decisions exists without engagement_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.hiring_decisions CASCADE; and re-run this migration.';
  end if;
  if to_regclass('public.performance_snapshots') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'performance_snapshots' and column_name = 'hiring_decision_id'
     ) then
    raise exception
      'public.performance_snapshots has data but no hiring_decision_id column we could infer. '
      'Export data if needed, then: TRUNCATE public.performance_snapshots; or DROP TABLE public.performance_snapshots CASCADE; and re-run this migration.';
  end if;

  if to_regclass('public.applicant_profiles') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'applicant_profiles' and column_name = 'user_id'
     ) then
    raise exception
      'public.applicant_profiles exists without user_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.applicant_profiles CASCADE; and re-run this migration.';
  end if;
  if to_regclass('public.businesses') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'businesses' and column_name = 'owner_id'
     ) then
    raise exception
      'public.businesses exists without owner_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.businesses CASCADE; and re-run this migration.';
  end if;
  if to_regclass('public.roles') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'roles' and column_name = 'business_id'
     ) then
    raise exception
      'public.roles exists without business_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.roles CASCADE; and re-run this migration.';
  end if;
  if to_regclass('public.employer_trait_weightings') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'employer_trait_weightings' and column_name = 'business_id'
     ) then
    raise exception
      'public.employer_trait_weightings exists without business_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.employer_trait_weightings CASCADE; and re-run this migration.';
  end if;
  if to_regclass('public.engagements') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'engagements' and column_name = 'business_id'
     ) then
    raise exception
      'public.engagements exists without business_id (unexpected column names). '
      'Back up data if needed, then: DROP TABLE public.engagements CASCADE; and re-run this migration.';
  end if;
end
$repair$;


-- ============================================================
-- 6. Row Level Security Policies
-- Enable RLS on all tables. Minimum required policies for v1.
-- ============================================================

-- profiles
alter table profiles enable row level security;

drop policy if exists "profiles: own row" on profiles;
create policy "profiles: own row"
  on profiles for all
  using (auth.uid() = id);

-- applicant_profiles
alter table applicant_profiles enable row level security;

drop policy if exists "applicant_profiles: own row" on applicant_profiles;
create policy "applicant_profiles: own row"
  on applicant_profiles for all
  using (auth.uid() = user_id);

drop policy if exists "applicant_profiles: employer read" on applicant_profiles;
create policy "applicant_profiles: employer read"
  on applicant_profiles for select
  using (
    status = 'published'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'employer'
    )
  );

-- applicant_trait_scores
alter table applicant_trait_scores enable row level security;

drop policy if exists "applicant_trait_scores: own row" on applicant_trait_scores;
create policy "applicant_trait_scores: own row"
  on applicant_trait_scores for all
  using (
    exists (
      select 1 from applicant_profiles ap
      where ap.id = applicant_id
      and ap.user_id = auth.uid()
    )
  );

drop policy if exists "trait_scores: employer read" on applicant_trait_scores;
create policy "trait_scores: employer read"
  on applicant_trait_scores for select
  using (
    exists (
      select 1 from applicant_profiles ap
      where ap.id = applicant_id
      and ap.status = 'published'
    )
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'employer'
    )
  );

-- businesses
alter table businesses enable row level security;

drop policy if exists "businesses: owner full access" on businesses;
create policy "businesses: owner full access"
  on businesses for all
  using (owner_id = auth.uid());

drop policy if exists "businesses: employer read" on businesses;
create policy "businesses: employer read"
  on businesses for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'employer'
    )
  );

-- employer_trait_weightings
alter table employer_trait_weightings enable row level security;

drop policy if exists "employer_trait_weightings: business owner" on employer_trait_weightings;
create policy "employer_trait_weightings: business owner"
  on employer_trait_weightings for all
  using (
    exists (
      select 1 from businesses b
      where b.id = business_id
      and b.owner_id = auth.uid()
    )
  );

-- intake_responses
alter table intake_responses enable row level security;

drop policy if exists "intake_responses: own row" on intake_responses;
create policy "intake_responses: own row"
  on intake_responses for all
  using (
    exists (
      select 1 from applicant_profiles ap
      where ap.id = applicant_id
      and ap.user_id = auth.uid()
    )
  );

-- roles
alter table roles enable row level security;

drop policy if exists "roles: business owner full access" on roles;
create policy "roles: business owner full access"
  on roles for all
  using (
    exists (
      select 1 from businesses b
      where b.id = business_id
      and b.owner_id = auth.uid()
    )
  );

drop policy if exists "roles: public read open roles" on roles;
create policy "roles: public read open roles"
  on roles for select
  using (status = 'open');

-- engagements
alter table engagements enable row level security;

drop policy if exists "engagements: applicant own rows" on engagements;
create policy "engagements: applicant own rows"
  on engagements for select
  using (
    exists (
      select 1 from applicant_profiles ap
      where ap.id = applicant_id
      and ap.user_id = auth.uid()
    )
  );

drop policy if exists "engagements: employer business rows" on engagements;
create policy "engagements: employer business rows"
  on engagements for all
  using (
    exists (
      select 1 from businesses b
      where b.id = business_id
      and b.owner_id = auth.uid()
    )
  );

-- hiring_decisions
alter table hiring_decisions enable row level security;

drop policy if exists "hiring_decisions: employer access" on hiring_decisions;
create policy "hiring_decisions: employer access"
  on hiring_decisions for all
  using (
    exists (
      select 1 from engagements e
      join businesses b on b.id = e.business_id
      where e.id = engagement_id
      and b.owner_id = auth.uid()
    )
  );

-- performance_snapshots
alter table performance_snapshots enable row level security;

drop policy if exists "performance_snapshots: employer access" on performance_snapshots;
create policy "performance_snapshots: employer access"
  on performance_snapshots for all
  using (
    exists (
      select 1 from hiring_decisions hd
      join engagements e on e.id = hd.engagement_id
      join businesses b on b.id = e.business_id
      where hd.id = hiring_decision_id
      and b.owner_id = auth.uid()
    )
  );
