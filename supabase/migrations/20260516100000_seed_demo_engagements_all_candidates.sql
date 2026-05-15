-- Extend CMe demo engagements to every candidate profile (not only Charlie Kirk).
-- Reuses businesses/roles from 20260514140000_seed_demo_businesses_engagements.sql (__CME_SEED_* tags).
-- Idempotent: skips candidates who already have seed engagements for each demo business.

do $$
declare
  v_b1       uuid;
  v_b2       uuid;
  v_b3       uuid;
  v_r1       uuid;
  v_r2       uuid;
  v_r3       uuid;
  cand       record;
  v_e        uuid;
begin
  if to_regclass('public.candidate_profiles') is null
     or to_regclass('public.engagements') is null then
    raise notice 'CMe seed-all skipped: candidate_profiles or engagements missing.';
    return;
  end if;

  select id into v_b1 from public.businesses
   where name = '[CMe Demo] Aurora Labs'
     and description like '%__CME_SEED_BIZ__%'
   limit 1;
  select id into v_b2 from public.businesses
   where name = '[CMe Demo] Harbor Finance Co.'
     and description like '%__CME_SEED_BIZ__%'
   limit 1;
  select id into v_b3 from public.businesses
   where name = '[CMe Demo] Northwind Health'
     and description like '%__CME_SEED_BIZ__%'
   limit 1;

  if v_b1 is null or v_b2 is null or v_b3 is null then
    raise notice 'CMe seed-all skipped: demo businesses not found. Apply migration 20260514140000_seed_demo_businesses_engagements.sql first (or ensure seed businesses exist).';
    return;
  end if;

  select id into v_r1 from public.roles
   where business_id = v_b1 and description like '%__CME_SEED_ROLE__%'
   limit 1;
  select id into v_r2 from public.roles
   where business_id = v_b2 and description like '%__CME_SEED_ROLE__%'
   limit 1;
  select id into v_r3 from public.roles
   where business_id = v_b3 and description like '%__CME_SEED_ROLE__%'
   limit 1;

  if v_r1 is null or v_r2 is null or v_r3 is null then
    raise notice 'CMe seed-all skipped: demo roles not found.';
    return;
  end if;

  for cand in select id as candidate_id from public.candidate_profiles
  loop
    -- 1) Aurora — contacted, unread employer message
    if not exists (
      select 1 from public.engagements e
       where e.candidate_id = cand.candidate_id
         and e.business_id = v_b1
    ) then
      insert into public.engagements (
        candidate_id, business_id, role_id, source, stage, match_score, employer_notes
      )
      values (cand.candidate_id, v_b1, v_r1, 'employer_search', 'contacted', 88, '__CME_SEED_ENG__')
      returning id into v_e;

      insert into public.engagement_messages (engagement_id, sender, body, created_at)
      values (
        v_e,
        'employer',
        'Hi — we are hiring a Senior Product Designer and your CMe profile looks like a strong match for our design systems work. Would you be open to a short intro call this week?',
        now() - interval '2 hours'
      );
    end if;

    -- 2) Harbor — interviewing, short thread + read state (same story as original seed)
    if not exists (
      select 1 from public.engagements e
       where e.candidate_id = cand.candidate_id
         and e.business_id = v_b2
    ) then
      insert into public.engagements (
        candidate_id, business_id, role_id, source, stage, match_score, employer_notes
      )
      values (cand.candidate_id, v_b2, v_r2, 'employer_search', 'interviewing', 76, '__CME_SEED_ENG__')
      returning id into v_e;

      insert into public.engagement_messages (engagement_id, sender, body, created_at) values
        (v_e, 'employer', 'Thanks for your interest in the payments team. Are you available Tuesday afternoon for a 30-minute screen?', now() - interval '1 day'),
        (v_e, 'candidate', 'Tuesday works — I can do 2–4pm NZST. Looking forward to it.', now() - interval '20 hours'),
        (v_e, 'employer', 'Great — calendar invite sent for Tuesday 2:30pm. Talk then!', now() - interval '18 hours');

      insert into public.engagement_read_state (engagement_id, candidate_id, last_read_at)
      values (v_e, cand.candidate_id, now() - interval '10 minutes');
    end if;

    -- 3) Northwind — discovered, no messages yet
    if not exists (
      select 1 from public.engagements e
       where e.candidate_id = cand.candidate_id
         and e.business_id = v_b3
    ) then
      insert into public.engagements (
        candidate_id, business_id, role_id, source, stage, match_score, employer_notes
      )
      values (cand.candidate_id, v_b3, v_r3, 'employer_search', 'discovered', 71, '__CME_SEED_ENG__');
    end if;
  end loop;

  raise notice 'CMe seed-all complete: ensured demo engagements for all candidate_profiles rows.';
end $$;
