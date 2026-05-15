-- Allow applicants to read businesses linked via their engagements (for applicant portal).
-- Implemented with SECURITY DEFINER helper to avoid 42P17 RLS recursion: a plain EXISTS(subquery
-- on engagements) here would recurse with "engagements: employer business rows", which reads businesses.

create or replace function public.candidate_has_engagement_with_business(p_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.engagements e
    join public.candidate_profiles cp on cp.id = e.candidate_id
    where e.business_id = p_business_id
      and cp.user_id = (select auth.uid())
  );
$$;

comment on function public.candidate_has_engagement_with_business(uuid) is
  'True if the current auth user has a candidate_profiles row tied to an engagement with this business_id; used by businesses RLS to avoid recursion with engagements policies.';

revoke all on function public.candidate_has_engagement_with_business(uuid) from public;
grant execute on function public.candidate_has_engagement_with_business(uuid) to authenticated;

drop policy if exists "businesses: candidate read via engagement" on public.businesses;
create policy "businesses: candidate read via engagement"
  on public.businesses
  for select
  using (public.candidate_has_engagement_with_business(id));
