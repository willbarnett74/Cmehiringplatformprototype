-- Add age field to candidate_profiles for welcome onboarding flow
alter table public.candidate_profiles
  add column if not exists age integer;
