-- PostgREST queries run as role `authenticated` (JWT). RLS filters rows; without table-level
-- GRANTs Postgres returns 42501 "permission denied for table …".
-- https://supabase.com/docs/guides/database/postgres/row-level-security

grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.engagements to authenticated;

grant select, insert on table public.engagement_messages to authenticated;

grant select, insert, update, delete on table public.engagement_read_state to authenticated;

grant select on table public.businesses to authenticated;

grant select on table public.roles to authenticated;
