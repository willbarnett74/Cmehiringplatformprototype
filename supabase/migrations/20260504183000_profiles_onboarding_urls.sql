-- URL-backed applicant onboarding: step cursor + completion timestamp on profiles

alter table public.profiles
  add column if not exists onboarding_step text,
  add column if not exists onboarding_completed_at timestamptz;

-- Users who already finished legacy onboarding_complete
update public.profiles
set
  onboarding_completed_at = coalesce(onboarding_completed_at, updated_at, now()),
  onboarding_step = 'completed'
where coalesce(onboarding_complete, false) = true
  and (onboarding_completed_at is null or onboarding_step is distinct from 'completed');

-- Everyone else starts at welcome until they progress through the flow
update public.profiles
set onboarding_step = 'welcome'
where onboarding_step is null;

alter table public.profiles
  alter column onboarding_step set default 'welcome';

alter table public.profiles
  alter column onboarding_step set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_onboarding_step_check'
  ) then
    alter table public.profiles
      add constraint profiles_onboarding_step_check
      check (
        onboarding_step in ('welcome', 'details', 'how_it_works', 'completed')
      );
  end if;
end $$;

comment on column public.profiles.onboarding_step is 'Applicant onboarding wizard progress for URL routing (welcome → basics → how-it-works → completed).';
comment on column public.profiles.onboarding_completed_at is 'Set when applicant finishes onboarding; guards profile builder and replaces ad-hoc localStorage.';
