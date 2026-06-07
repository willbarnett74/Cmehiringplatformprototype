-- Employer portal login returned 500 (42P17 infinite recursion) on businesses reads.
-- Two mutually-recursive policy chains existed:
--   1. businesses "candidate read via engagement" -> engagements RLS -> businesses
--   2. businesses "read for assessment landing" -> roles RLS -> businesses
-- Both helper paths must run with row_security off so the inner table reads
-- do not re-trigger the outer table's policies.

-- 1. engagement helper: add row_security off (was SECURITY DEFINER only).
create or replace function public.candidate_has_engagement_with_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $function$
  select exists (
    select 1
    from public.engagements e
    join public.candidate_profiles cp on cp.id = e.candidate_id
    where e.business_id = p_business_id
      and cp.user_id = (select auth.uid())
  );
$function$;

-- 2. assessment-landing read: wrap the roles lookup in a SECURITY DEFINER function
-- so the businesses policy no longer inlines a roles subquery (which re-applied roles RLS).
create or replace function public.business_has_open_assessment_role(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $function$
  select exists (
    select 1
    from public.roles r
    where r.business_id = p_business_id
      and r.assessment_link_token is not null
      and r.status = 'open'
  );
$function$;

revoke all on function public.business_has_open_assessment_role(uuid) from public;
grant execute on function public.business_has_open_assessment_role(uuid) to anon, authenticated;

drop policy if exists "businesses: read for assessment landing" on public.businesses;
create policy "businesses: read for assessment landing"
  on public.businesses
  for select
  using (public.business_has_open_assessment_role(id));
