-- Superseded by 20260526140000 (email/avatar on candidate_profiles).
-- Intentionally empty: do not recreate profiles-table employer SELECT policies.

drop policy if exists "profiles: employer read candidate names" on public.profiles;
drop policy if exists "profiles: employer read marketplace candidates" on public.profiles;
