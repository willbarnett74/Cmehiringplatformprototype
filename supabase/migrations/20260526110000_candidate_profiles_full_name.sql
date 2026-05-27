-- Denormalize candidate display name for employer marketplace reads.
alter table public.candidate_profiles add column if not exists full_name text;

update public.candidate_profiles cp
set full_name = p.full_name
from public.profiles p
where p.id = cp.user_id
  and p.full_name is not null
  and (cp.full_name is null or btrim(cp.full_name) = '');

comment on column public.candidate_profiles.full_name is
  'Display name copied from profiles.full_name for employer search without joining profiles.';

-- Do NOT add profiles-table RLS policies here — they caused infinite recursion (42P17).
