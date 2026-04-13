-- ============================================================
-- Delete one Supabase Auth user and all public.cme rows for them
-- Run in: Supabase Dashboard → SQL Editor
--
-- 1. Authentication → Users → copy the user's UUID (id).
-- 2. Replace the uuid below (two places: uid variable + final safety check).
-- 3. Run the whole script once.
--
-- If DELETE FROM auth.users fails, delete identities first (included below).
-- ============================================================

do $body$
declare
  uid uuid := '00000000-0000-0000-0000-000000000000';  -- <-- paste your user id here
begin
  if uid = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Set uid to your user UUID from Authentication → Users.';
  end if;

  -- 1. Leaf: performance_snapshots → hiring_decisions → engagements
  delete from public.performance_snapshots
  where hiring_decision_id in (
    select hd.id
    from public.hiring_decisions hd
    where hd.engagement_id in (
      select e.id
      from public.engagements e
      where e.applicant_id in (select ap.id from public.applicant_profiles ap where ap.user_id = uid)
         or e.business_id in (select b.id from public.businesses b where b.owner_id = uid)
    )
  );

  delete from public.hiring_decisions
  where engagement_id in (
    select e.id
    from public.engagements e
    where e.applicant_id in (select ap.id from public.applicant_profiles ap where ap.user_id = uid)
       or e.business_id in (select b.id from public.businesses b where b.owner_id = uid)
  );

  delete from public.engagements
  where applicant_id in (select ap.id from public.applicant_profiles ap where ap.user_id = uid)
     or business_id in (select b.id from public.businesses b where b.owner_id = uid);

  -- 2. Applicant profile children
  delete from public.applicant_trait_scores
  where applicant_id in (select ap.id from public.applicant_profiles ap where ap.user_id = uid);

  delete from public.intake_responses
  where applicant_id in (select ap.id from public.applicant_profiles ap where ap.user_id = uid);

  -- 3. Employer-side children (depend on businesses)
  delete from public.employer_trait_weightings
  where business_id in (select b.id from public.businesses b where b.owner_id = uid);

  delete from public.roles
  where business_id in (select b.id from public.businesses b where b.owner_id = uid);

  -- 4. Profile-level rows
  delete from public.applicant_profiles where user_id = uid;

  delete from public.businesses where owner_id = uid;

  delete from public.profiles where id = uid;

  -- 5. Auth (identities first — required on many Supabase versions)
  delete from auth.identities where user_id = uid;
  delete from auth.users where id = uid;
end
$body$;
