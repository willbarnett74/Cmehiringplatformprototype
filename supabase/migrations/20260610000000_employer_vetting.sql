-- Employer vetting: pending/approved status, lock role columns, gate marketplace reads.

do $enum$
begin
  create type public.employer_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end
$enum$;

alter table public.profiles
  add column if not exists employer_status public.employer_status;

alter table public.profiles
  drop constraint if exists profiles_employer_status_check;

comment on column public.profiles.employer_status is
  'Null for candidates. Employers start pending until approved; approved unlocks candidate marketplace reads. Supabase Table Editor shows this as a dropdown.';

-- Grandfather existing employer accounts.
update public.profiles
set employer_status = 'approved'::public.employer_status
where role = 'employer'
  and employer_status is null;

update public.profiles
set employer_status = null
where role in ('candidate', 'applicant');

-- Block client-side role / approval tampering (SECURITY DEFINER RPCs and SQL editor bypass).
create or replace function public.profiles_protect_role_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(current_setting('cme.allow_profile_role_change', true), '') = 'on' then
    return new;
  end if;

  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'profile role cannot be changed';
  end if;

  if new.employer_status is distinct from old.employer_status then
    raise exception 'employer approval status cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_role_columns on public.profiles;
create trigger profiles_protect_role_columns
  before update on public.profiles
  for each row
  execute function public.profiles_protect_role_columns();

-- New auth users: employer signups start pending; candidates stay null.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_meta_role text;
begin
  v_meta_role := coalesce(new.raw_user_meta_data->>'role', '');

  v_role := case
    when v_meta_role = 'employer' then 'employer'
    when v_meta_role = 'applicant' then 'candidate'
    else 'candidate'
  end;

  insert into public.profiles (id, email, full_name, role, employer_status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username'
    ),
    v_role,
    case when v_role = 'employer' then 'pending'::public.employer_status else null end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- OAuth signup path: claim employer role once while profile is still default candidate.
create or replace function public.claim_initial_profile_role(p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_role <> 'employer' then
    return;
  end if;

  perform set_config('cme.allow_profile_role_change', 'on', true);

  update public.profiles
  set
    role = 'employer',
    employer_status = 'pending'::public.employer_status,
    updated_at = now()
  where id = auth.uid()
    and role = 'candidate';
end;
$$;

revoke all on function public.claim_initial_profile_role(text) from public;
grant execute on function public.claim_initial_profile_role(text) to authenticated;

create or replace function public.auth_user_is_approved_employer()
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
      and employer_status = 'approved'
  );
$$;

revoke all on function public.auth_user_is_approved_employer() from public;
grant execute on function public.auth_user_is_approved_employer() to authenticated;

create or replace function public.auth_user_is_employer()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.auth_user_is_approved_employer();
$$;

revoke all on function public.auth_user_is_employer() from public;
grant execute on function public.auth_user_is_employer() to authenticated;

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
      and ep.employer_status = 'approved'
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

revoke all on function public.employer_can_read_candidate_profile(uuid) from public;
grant execute on function public.employer_can_read_candidate_profile(uuid) to authenticated;

-- Internal trigger helpers should not be callable over PostgREST.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
