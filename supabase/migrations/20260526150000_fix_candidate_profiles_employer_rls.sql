-- Fix 42P17 on candidate_profiles: engaged policy joined businesses RLS which re-reads candidate_profiles.
-- Single SECURITY DEFINER gate covers marketplace + pipeline reads.

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
      and ep.role = 'employer'
  )
  and (
    exists (
      select 1
      from public.candidate_profiles cp
      where cp.id = p_candidate_id
        and coalesce(cp.status, 'draft') <> 'hidden'
    )
    or exists (
      select 1
      from public.engagements e
      join public.businesses b on b.id = e.business_id and b.owner_id = auth.uid()
      where e.candidate_id = p_candidate_id
    )
  );
$$;

comment on function public.employer_can_read_candidate_profile(uuid) is
  'Employer marketplace + engaged candidate_profiles read; SECURITY DEFINER avoids businesses/candidate_profiles RLS recursion.';

revoke all on function public.employer_can_read_candidate_profile(uuid) from public;
grant execute on function public.employer_can_read_candidate_profile(uuid) to authenticated;

drop policy if exists "candidate_profiles: employer read" on public.candidate_profiles;
drop policy if exists "candidate_profiles: employer read engaged" on public.candidate_profiles;

create policy "candidate_profiles: employer read"
  on public.candidate_profiles
  for select
  using (public.employer_can_read_candidate_profile(id));

-- Pat Gallagher employer account completed onboarding without a businesses row (insert failed silently).
insert into public.businesses (owner_id, name, industry, size, description)
select p.id, 'AJG', 'Insurance', '51-200', 'Employer portal (restored missing business row)'
from public.profiles p
where p.email = 'pat.gallagher@ajg.co.nz'
  and p.role = 'employer'
  and not exists (select 1 from public.businesses b where b.owner_id = p.id);
