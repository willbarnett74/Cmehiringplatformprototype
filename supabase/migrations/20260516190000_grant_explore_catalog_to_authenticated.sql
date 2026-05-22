-- Explore Industries catalog: RLS policies exist but PostgREST needs table-level GRANTs
-- for role `authenticated` (same pattern as 20260515140000_grant_engagement_api_to_authenticated.sql).
-- Without these, the client gets 42501 permission denied and the app falls back to SaaS-only demo data.

grant select on table public.explore_industries to authenticated;
grant select on table public.explore_industry_trait_highlights to authenticated;
grant select on table public.explore_industry_sample_roles to authenticated;
grant select on table public.explore_industry_learning_links to authenticated;

grant select, insert, delete on table public.candidate_saved_industries to authenticated;
