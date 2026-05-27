-- Marketplace visibility: employers can read all candidate profiles except opt-outs (status = hidden).

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

drop policy if exists "candidate_profiles: employer read" on public.candidate_profiles;

-- Employer SELECT policy lives in 20260526150000_fix_candidate_profiles_employer_rls.sql

-- Existing completed profiles may still be draft; make them discoverable.
update public.candidate_profiles
set status = 'published'
where coalesce(status, 'draft') = 'draft'
  and intake_status = 'complete';

-- Pipeline/messages: employers can always read profiles they have an engagement with.
drop policy if exists "candidate_profiles: employer read engaged" on public.candidate_profiles;

create policy "candidate_profiles: employer read engaged"
  on public.candidate_profiles
  for select
  using (
    exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id
      where e.candidate_id = candidate_profiles.id
        and b.owner_id = auth.uid()
    )
  );
