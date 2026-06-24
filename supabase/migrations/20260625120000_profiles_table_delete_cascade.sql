-- Make Supabase Table Editor "Delete row" on profiles work for employer accounts.
-- BEFORE DELETE cleans public dependents (businesses, engagements, etc.).
-- AFTER DELETE removes auth.identities + auth.users.

create or replace function private.delete_user_public_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, private, pg_temp
as $$
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  delete from public.performance_snapshots
  where engagement_id in (
    select e.id
    from public.engagements e
    where e.candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
       or e.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
  )
     or hiring_decision_id in (
       select hd.id
       from public.hiring_decisions hd
       where hd.engagement_id in (
         select e.id
         from public.engagements e
         where e.candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
            or e.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
       )
     );

  delete from public.hiring_decisions
  where engagement_id in (
    select e.id
    from public.engagements e
    where e.candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
       or e.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
  );

  delete from public.engagements
  where candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
     or business_id in (select b.id from public.businesses b where b.owner_id = p_user_id);

  delete from public.employer_trait_weightings
  where business_id in (select b.id from public.businesses b where b.owner_id = p_user_id);

  delete from public.roles
  where business_id in (select b.id from public.businesses b where b.owner_id = p_user_id);

  delete from public.businesses
  where owner_id = p_user_id;

  delete from public.candidate_profiles
  where user_id = p_user_id;
end;
$$;

revoke all on function private.delete_user_public_data(uuid) from public, anon, authenticated;
grant execute on function private.delete_user_public_data(uuid) to service_role;

create or replace function private.profiles_before_delete()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private, pg_temp
as $$
begin
  perform private.delete_user_public_data(old.id);
  return old;
end;
$$;

create or replace function private.profiles_after_delete()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private, pg_temp
as $$
begin
  delete from auth.identities where user_id = old.id;
  delete from auth.users where id = old.id;
  return old;
end;
$$;

drop trigger if exists profiles_delete_cascade_before on public.profiles;
create trigger profiles_delete_cascade_before
  before delete on public.profiles
  for each row
  execute function private.profiles_before_delete();

drop trigger if exists profiles_delete_cascade_after on public.profiles;
create trigger profiles_delete_cascade_after
  after delete on public.profiles
  for each row
  execute function private.profiles_after_delete();

-- Block app/API users from hard-deleting profiles; dashboard + service_role still can.
drop policy if exists "profiles: own row" on public.profiles;

create policy "profiles: own row select"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles: own row insert"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "profiles: own row update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function private.delete_user_cascade(
  p_user_id uuid,
  p_dry_run boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private, pg_temp
as $$
declare
  v_profile_row public.profiles%rowtype;
  v_auth_email text;
  v_counts jsonb;
  v_result jsonb;
  v_has_profile boolean := false;
  v_has_auth boolean := false;
  v_has_owned_businesses boolean := false;
  v_has_candidate_profile boolean := false;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  select *
  into v_profile_row
  from public.profiles
  where id = p_user_id;

  v_has_profile := found;

  select u.email
  into v_auth_email
  from auth.users u
  where u.id = p_user_id;

  v_has_auth := found;

  select exists (
    select 1 from public.businesses b where b.owner_id = p_user_id
  )
  into v_has_owned_businesses;

  select exists (
    select 1 from public.candidate_profiles cp where cp.user_id = p_user_id
  )
  into v_has_candidate_profile;

  if not v_has_profile
     and not v_has_auth
     and not v_has_owned_businesses
     and not v_has_candidate_profile then
    v_result := jsonb_build_object(
      'user_id', p_user_id,
      'dry_run', p_dry_run,
      'already_deleted', true,
      'message', 'No profile, auth user, or dependent rows found. User appears already deleted.'
    );

    if not p_dry_run then
      insert into private.user_deletion_audit (user_id, requested_by, dry_run, result)
      values (p_user_id, auth.uid(), false, v_result);
    end if;

    return v_result;
  end if;

  v_counts := jsonb_build_object(
    'candidate_profiles',
      (select count(*) from public.candidate_profiles cp where cp.user_id = p_user_id),
    'businesses',
      (select count(*) from public.businesses b where b.owner_id = p_user_id),
    'roles',
      (
        select count(*)
        from public.roles r
        where r.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
      ),
    'employer_trait_weightings',
      (
        select count(*)
        from public.employer_trait_weightings etw
        where etw.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
      ),
    'explore_role_interest_employer_notifications',
      (
        select count(*)
        from public.explore_role_interest_employer_notifications n
        where n.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
           or n.candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
      ),
    'engagements',
      (
        select count(*)
        from public.engagements e
        where e.candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
           or e.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
      ),
    'hiring_decisions',
      (
        select count(*)
        from public.hiring_decisions hd
        where hd.engagement_id in (
          select e.id
          from public.engagements e
          where e.candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
             or e.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
        )
      ),
    'performance_snapshots',
      (
        select count(*)
        from public.performance_snapshots ps
        where ps.engagement_id in (
          select e.id
          from public.engagements e
          where e.candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
             or e.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
        )
           or ps.hiring_decision_id in (
             select hd.id
             from public.hiring_decisions hd
             where hd.engagement_id in (
               select e.id
               from public.engagements e
               where e.candidate_id in (select cp.id from public.candidate_profiles cp where cp.user_id = p_user_id)
                  or e.business_id in (select b.id from public.businesses b where b.owner_id = p_user_id)
             )
           )
      )
  );

  v_result := jsonb_build_object(
    'user_id', p_user_id,
    'email', coalesce(v_profile_row.email, v_auth_email),
    'role', v_profile_row.role,
    'dry_run', p_dry_run,
    'counts', v_counts
  );

  if p_dry_run then
    insert into private.user_deletion_audit (user_id, requested_by, dry_run, result)
    values (p_user_id, auth.uid(), true, v_result);

    return v_result;
  end if;

  if v_has_profile then
    delete from public.profiles where id = p_user_id;
  else
    perform private.delete_user_public_data(p_user_id);
    delete from auth.identities where user_id = p_user_id;
    delete from auth.users where id = p_user_id;
  end if;

  v_result := v_result || jsonb_build_object('deleted', true);

  insert into private.user_deletion_audit (user_id, requested_by, dry_run, result)
  values (p_user_id, auth.uid(), false, v_result);

  return v_result;
end;
$$;

comment on function public.admin_delete_user(uuid, boolean) is
  'Admin helper to preview or hard-delete a user. Same outcome as deleting the row in public.profiles (Table Editor).';
