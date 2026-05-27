-- Remove broken profiles RLS policy (caused 42P17 infinite recursion on all profile reads).
-- Employer contact fields are denormalized onto candidate_profiles instead.

drop policy if exists "profiles: employer read candidate names" on public.profiles;
drop policy if exists "profiles: employer read marketplace candidates" on public.profiles;

-- Keep auth_user_is_employer() for candidate_profiles policies (no profiles-table recursion).
create or replace function public.auth_user_is_employer()
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
      and role = 'employer'
  );
$$;

revoke all on function public.auth_user_is_employer() from public;
grant execute on function public.auth_user_is_employer() to authenticated;

-- Keep auth_user_is_employer() for legacy callers; candidate_profiles uses employer_can_read_candidate_profile (26150000).
create or replace function public.auth_user_is_employer()
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
      and role = 'employer'
  );
$$;

revoke all on function public.auth_user_is_employer() from public;
grant execute on function public.auth_user_is_employer() to authenticated;

-- candidate_profiles employer policies: see 20260526150000_fix_candidate_profiles_employer_rls.sql
