-- Server-side profile bootstrap for authenticated users missing a public.profiles row.
-- Avoids client insert FK races and reads auth.users in the same transaction.

create or replace function public.ensure_own_profile_row(p_role_hint text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_user auth.users%rowtype;
  v_role text;
  v_meta_role text;
  v_onboarding_step text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  select * into v_user from auth.users where id = v_uid;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'auth_user_missing');
  end if;

  if exists (select 1 from public.profiles where id = v_uid) then
    return jsonb_build_object('ok', true, 'reason', 'already_exists');
  end if;

  v_meta_role := coalesce(v_user.raw_user_meta_data->>'role', '');
  v_role := case
    when coalesce(p_role_hint, '') = 'employer' or v_meta_role = 'employer' then 'employer'
    else 'candidate'
  end;

  v_onboarding_step := case
    when v_role = 'employer' then 'employer_company'
    else 'welcome'
  end;

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    employer_status,
    onboarding_complete,
    onboarding_step,
    onboarding_completed_at
  )
  values (
    v_uid,
    coalesce(v_user.email, ''),
    coalesce(
      v_user.raw_user_meta_data->>'full_name',
      v_user.raw_user_meta_data->>'name',
      v_user.raw_user_meta_data->>'user_name',
      v_user.raw_user_meta_data->>'preferred_username'
    ),
    v_role,
    case when v_role = 'employer' then 'pending' else null end,
    false,
    v_onboarding_step,
    null
  );

  return jsonb_build_object('ok', true, 'reason', 'created');
exception
  when unique_violation then
    return jsonb_build_object('ok', true, 'reason', 'already_exists');
end;
$$;

revoke all on function public.ensure_own_profile_row(text) from public;
grant execute on function public.ensure_own_profile_row(text) to authenticated;
