-- Dev/demo seed: dummy employers + roles + engagements + messages for the applicant "Charlie Kirk"
-- (matched by profiles.full_name / email). Safe to re-run: removes prior rows tagged __CME_SEED_*.
--
-- Owner resolution: prefers any profile with role = 'employer'; otherwise uses the candidate's own
-- profiles row so solo applicant-only projects still satisfy businesses.owner_id FK.

do $$
declare
  v_candidate     uuid;
  v_owner         uuid;
  v_b1            uuid;
  v_b2            uuid;
  v_b3            uuid;
  v_r1            uuid;
  v_r2            uuid;
  v_r3            uuid;
  v_e1            uuid;
  v_e2            uuid;
  v_e3            uuid;
begin
  if to_regclass('public.candidate_profiles') is null
     or to_regclass('public.businesses') is null
     or to_regclass('public.engagements') is null then
    raise notice 'CMe seed skipped: core tables missing.';
    return;
  end if;

  -- Match display name variants + Supabase auth email (profiles.email can differ from auth.users).
  select cp.id
    into v_candidate
    from public.candidate_profiles cp
    join public.profiles p on p.id = cp.user_id
    left join auth.users au on au.id = p.id
   where p.full_name ilike '%charlie%kirk%'
      or p.full_name ilike '%charles%kirk%'
      or p.email ilike '%charlie%kirk%'
      or (p.full_name ilike '%charlie%' and p.full_name ilike '%kirk%')
      or (p.full_name ilike '%charles%' and p.full_name ilike '%kirk%')
      or (p.full_name ilike '%kirk%' and (p.full_name ilike '%charl%' or p.email ilike '%charl%'))
      or (au.email is not null and au.email ilike '%kirk%' and au.email ilike '%charl%')
   limit 1;

  if v_candidate is null then
    raise notice 'CMe seed skipped: no candidate_profiles row matched (expected Charlie Kirk / Charles Kirk or email containing charl + kirk). Run: select cp.id, p.email, p.full_name from candidate_profiles cp join profiles p on p.id = cp.user_id;';
    return;
  end if;

  raise notice 'CMe seed: attaching demo engagements to candidate_profiles.id = %', v_candidate;

  select p.id
    into v_owner
    from public.profiles p
   where p.role = 'employer'
   limit 1;

  if v_owner is null then
    select cp.user_id
      into v_owner
      from public.candidate_profiles cp
     where cp.id = v_candidate
     limit 1;
    raise notice 'CMe seed: no employer profile; using candidate auth profile as dummy business owner_id.';
  end if;

  -- Tear down previous seed (same tags)
  delete from public.engagement_messages
   where engagement_id in (
     select id from public.engagements where employer_notes = '__CME_SEED_ENG__'
   );
  delete from public.engagement_read_state
   where engagement_id in (
     select id from public.engagements where employer_notes = '__CME_SEED_ENG__'
   );
  delete from public.employer_trait_weightings
   where business_id in (
     select id from public.businesses where description like '%__CME_SEED_BIZ__%'
   );
  delete from public.engagements where employer_notes = '__CME_SEED_ENG__';
  delete from public.roles where description like '%__CME_SEED_ROLE__%';
  delete from public.businesses where description like '%__CME_SEED_BIZ__%';

  -- Businesses
  insert into public.businesses (owner_id, name, industry, size, website, description)
  values (
    v_owner,
    '[CMe Demo] Aurora Labs',
    'SaaS & Productivity',
    '51-200',
    'https://example.com/aurora',
    'Product analytics for modern teams. __CME_SEED_BIZ__'
  )
  returning id into v_b1;

  insert into public.businesses (owner_id, name, industry, size, website, description)
  values (
    v_owner,
    '[CMe Demo] Harbor Finance Co.',
    'Fintech',
    '201-500',
    'https://example.com/harbor',
    'Digital lending and treasury tools. __CME_SEED_BIZ__'
  )
  returning id into v_b2;

  insert into public.businesses (owner_id, name, industry, size, website, description)
  values (
    v_owner,
    '[CMe Demo] Northwind Health',
    'Health Tech',
    '11-50',
    'https://example.com/northwind-health',
    'Clinical workflow software. __CME_SEED_BIZ__'
  )
  returning id into v_b3;

  -- Default employer weights (sum 100, each >= 5)
  insert into public.employer_trait_weightings (
    business_id, learning_velocity, ownership_follow_through, resilience,
    communication_confidence, relational_intelligence, motivational_fit
  )
  values
    (v_b1, 16, 17, 17, 17, 17, 16),
    (v_b2, 16, 17, 17, 17, 17, 16),
    (v_b3, 16, 17, 17, 17, 17, 16);

  -- Roles
  insert into public.roles (business_id, title, role_type, seniority, location, description, status)
  values (
    v_b1,
    'Senior Product Designer',
    'Full-time',
    'Senior',
    'Remote — NZ / AU',
    'Design systems and onboarding. __CME_SEED_ROLE__',
    'open'
  )
  returning id into v_r1;

  insert into public.roles (business_id, title, role_type, seniority, location, description, status)
  values (
    v_b2,
    'Product Designer — Payments',
    'Full-time',
    'Mid',
    'Auckland',
    'Consumer payments experience. __CME_SEED_ROLE__',
    'open'
  )
  returning id into v_r2;

  insert into public.roles (business_id, title, role_type, seniority, location, description, status)
  values (
    v_b3,
    'UX Designer — Clinical Tools',
    'Full-time',
    'Mid',
    'Hybrid — Wellington',
    'Clinician-facing tools. __CME_SEED_ROLE__',
    'open'
  )
  returning id into v_r3;

  -- Engagements (Charlie as candidate)
  insert into public.engagements (
    candidate_id, business_id, role_id, source, stage, match_score, employer_notes
  )
  values (v_candidate, v_b1, v_r1, 'employer_search', 'contacted', 88, '__CME_SEED_ENG__')
  returning id into v_e1;

  insert into public.engagements (
    candidate_id, business_id, role_id, source, stage, match_score, employer_notes
  )
  values (v_candidate, v_b2, v_r2, 'employer_search', 'interviewing', 76, '__CME_SEED_ENG__')
  returning id into v_e2;

  insert into public.engagements (
    candidate_id, business_id, role_id, source, stage, match_score, employer_notes
  )
  values (v_candidate, v_b3, v_r3, 'employer_search', 'discovered', 71, '__CME_SEED_ENG__')
  returning id into v_e3;

  -- Threads: one unread employer ping, one back-and-forth, one silent match
  insert into public.engagement_messages (engagement_id, sender, body, created_at)
  values (
    v_e1,
    'employer',
    'Hi — we are hiring a Senior Product Designer and your CMe profile looks like a strong match for our design systems work. Would you be open to a short intro call this week?',
    now() - interval '2 hours'
  );

  insert into public.engagement_messages (engagement_id, sender, body, created_at)
  values (
    v_e2,
    'employer',
    'Thanks for your interest in the payments team. Are you available Tuesday afternoon for a 30-minute screen?',
    now() - interval '1 day'
  );

  insert into public.engagement_messages (engagement_id, sender, body, created_at)
  values (
    v_e2,
    'candidate',
    'Tuesday works — I can do 2–4pm NZST. Looking forward to it.',
    now() - interval '20 hours'
  );

  insert into public.engagement_messages (engagement_id, sender, body, created_at)
  values (
    v_e2,
    'employer',
    'Great — calendar invite sent for Tuesday 2:30pm. Talk then!',
    now() - interval '18 hours'
  );

  -- Read state: user has fully read Harbor thread; Aurora still unread
  insert into public.engagement_read_state (engagement_id, candidate_id, last_read_at)
  values (v_e2, v_candidate, now() - interval '10 minutes');

  raise notice 'CMe seed complete: 3 demo engagements for candidate_id %. Aurora (unread), Harbor (read), Northwind (no messages yet).', v_candidate;
end $$;
