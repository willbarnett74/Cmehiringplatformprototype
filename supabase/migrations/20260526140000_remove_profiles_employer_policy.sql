-- The profiles-table employer SELECT policy caused 42P17 infinite recursion (even with
-- auth_user_is_employer + row_security=off). Employers read candidate contact fields from
-- candidate_profiles instead (full_name, email, avatar_url denormalized there).

drop policy if exists "profiles: employer read candidate names" on public.profiles;
drop policy if exists "profiles: employer read marketplace candidates" on public.profiles;

alter table public.candidate_profiles add column if not exists email text;
alter table public.candidate_profiles add column if not exists avatar_url text;

update public.candidate_profiles cp
set email = p.email
from public.profiles p
where p.id = cp.user_id
  and p.email is not null
  and (cp.email is null or btrim(cp.email) = '');

update public.candidate_profiles cp
set avatar_url = p.avatar_url
from public.profiles p
where p.id = cp.user_id
  and p.avatar_url is not null
  and (cp.avatar_url is null or btrim(cp.avatar_url) = '');

comment on column public.candidate_profiles.email is
  'Denormalized from profiles.email for employer marketplace reads without joining profiles.';
comment on column public.candidate_profiles.avatar_url is
  'Denormalized from profiles.avatar_url for employer marketplace reads without joining profiles.';
