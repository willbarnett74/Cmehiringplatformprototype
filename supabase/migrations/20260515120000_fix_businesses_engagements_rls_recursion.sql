-- Repair for databases already migrated with the pre-fix 20260515100000 (EXISTS on engagements
-- inside businesses policy). Safe no-op if 20260515100000 was already the function-based version.

drop policy if exists "businesses: candidate read via engagement" on public.businesses;

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

revoke all on function public.candidate_has_engagement_with_business(uuid) from public;
grant execute on function public.candidate_has_engagement_with_business(uuid) to authenticated;

create policy "businesses: candidate read via engagement"
  on public.businesses
  for select
  using (public.candidate_has_engagement_with_business(id));
