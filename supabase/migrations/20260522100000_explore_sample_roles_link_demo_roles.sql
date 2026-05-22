-- Link explore sample roles to real demo businesses + roles for employer portal continuity.
-- Adds modal copy columns and lets applicants read explore demo employers.

alter table public.explore_industry_sample_roles
  add column if not exists role_id uuid references public.roles (id) on delete set null,
  add column if not exists about_role text,
  add column if not exists responsibilities jsonb not null default '[]'::jsonb,
  add column if not exists requirements jsonb not null default '[]'::jsonb;

create index if not exists explore_industry_sample_roles_role_id_idx
  on public.explore_industry_sample_roles (role_id)
  where role_id is not null;

-- Applicants browsing Explore can read demo employers backing sample roles.
drop policy if exists "businesses: read explore demo employers" on public.businesses;
create policy "businesses: read explore demo employers"
  on public.businesses
  for select
  to authenticated
  using (description like '%__CME_EXPLORE_DEMO__%');

-- Prefer linked role → business when notifying employers of explore interest.
create or replace function public.notify_business_on_explore_role_interest()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bid uuid;
begin
  if new.sample_role_id is not null then
    select r.business_id into bid
    from public.explore_industry_sample_roles sr
    join public.roles r on r.id = sr.role_id
    where sr.id = new.sample_role_id
      and r.status = 'open'
    limit 1;
  end if;

  if bid is null then
    select b.id into bid
    from public.businesses b
    where lower(trim(b.name)) = lower(trim(new.company_name))
    limit 1;
  end if;

  if bid is not null then
    insert into public.explore_role_interest_employer_notifications (
      business_id, interest_id, candidate_id, role_title, company_name
    )
    values (bid, new.id, new.candidate_id, new.role_title, new.company_name)
    on conflict (business_id, interest_id) do nothing;
  end if;

  return new;
end;
$$;

do $$
declare
  v_owner uuid;
  v_business_id uuid;
  v_role_id uuid;
  rec record;
  v_about text;
  v_role_desc text;
  v_resp jsonb;
  v_req jsonb;
  v_seniority text;
  v_role_type text;
begin
  if to_regclass('public.explore_industry_sample_roles') is null then
    raise notice 'Explore sample roles link skipped: table missing.';
    return;
  end if;

  select p.id
    into v_owner
    from public.profiles p
   where p.role = 'employer'
   limit 1;

  if v_owner is null then
    select cp.user_id
      into v_owner
      from public.candidate_profiles cp
     limit 1;
  end if;

  if v_owner is null then
    raise notice 'Explore sample roles link skipped: no owner profile for demo businesses.';
    return;
  end if;

  for rec in
    select
      sr.id as sample_id,
      sr.company_name,
      sr.role_title,
      sr.location,
      sr.display_match,
      ei.name as industry_name,
      ei.slug as industry_slug
    from public.explore_industry_sample_roles sr
    join public.explore_industries ei on ei.id = sr.industry_id
  loop
    v_seniority := case
      when rec.role_title ~* 'principal|lead|head|director' then 'Senior'
      when rec.role_title ~* 'senior|sr\.?' then 'Senior'
      when rec.role_title ~* 'junior|associate|entry' then 'Junior'
      else 'Mid'
    end;

    v_role_type := 'Full-time';

    v_about := format(
      'As %s at %s, you''ll own meaningful product outcomes in %s — partnering with engineering, design, and go-to-market to ship work that customers feel in their day-to-day workflows.',
      rec.role_title,
      rec.company_name,
      rec.industry_name
    );

    v_resp := jsonb_build_array(
      'Define and communicate a clear product vision for your area with measurable outcomes',
      'Run discovery with users and stakeholders; translate insights into prioritized roadmaps',
      'Partner with engineering and design through delivery, launch, and post-launch iteration',
      'Track success metrics, share learnings, and adjust plans based on evidence'
    );

    v_req := jsonb_build_array(
      'Experience owning product work end-to-end in a software or digital product environment',
      'Strong written and verbal communication — comfortable with execs, engineers, and customers',
      'Track record of shipping iteratively and using data or research to inform decisions'
    );

    v_role_desc := v_about || E'\n\nResponsibilities:\n- '
      || (
        select string_agg(elem, E'\n- ')
        from jsonb_array_elements_text(v_resp) as elem
      );

    select b.id
      into v_business_id
      from public.businesses b
     where b.name = rec.company_name
       and b.description like '%__CME_EXPLORE_DEMO__%'
     limit 1;

    if v_business_id is null then
      insert into public.businesses (owner_id, name, industry, size, website, description)
      values (
        v_owner,
        rec.company_name,
        rec.industry_name,
        case
          when rec.industry_slug in ('saas', 'devtools', 'fintech') then '51-200'
          when rec.industry_slug in ('healthtech', 'ecommerce') then '201-500'
          else '51-200'
        end,
        null,
        format(
          'Demo employer for CMe Explore Industries — %s sector. __CME_EXPLORE_DEMO__',
          rec.industry_name
        )
      )
      returning id into v_business_id;
    end if;

    select r.id
      into v_role_id
      from public.roles r
     where r.business_id = v_business_id
       and r.title = rec.role_title
       and r.description like '%__CME_EXPLORE_DEMO__%'
     limit 1;

    if v_role_id is null then
      insert into public.roles (
        business_id, title, role_type, seniority, location, description, status
      )
      values (
        v_business_id,
        rec.role_title,
        v_role_type,
        v_seniority,
        rec.location,
        v_role_desc || E'\n\n__CME_EXPLORE_DEMO__',
        'open'
      )
      returning id into v_role_id;
    else
      update public.roles
         set role_type = v_role_type,
             seniority = v_seniority,
             location = rec.location,
             description = v_role_desc || E'\n\n__CME_EXPLORE_DEMO__',
             status = 'open'
       where id = v_role_id;
    end if;

    update public.explore_industry_sample_roles
       set role_id = v_role_id,
           about_role = v_about,
           responsibilities = v_resp,
           requirements = v_req
     where id = rec.sample_id;
  end loop;
end;
$$;
