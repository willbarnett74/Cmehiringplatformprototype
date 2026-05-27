-- employer_trait_weightings had RLS policies but no table grants for authenticated,
-- causing PostgREST 403 on employer portal load.

grant select, insert, update, delete on public.employer_trait_weightings to authenticated;

-- Seed default weights for businesses that completed onboarding without a weightings row.
insert into public.employer_trait_weightings (
  business_id,
  learning_velocity,
  ownership_follow_through,
  resilience,
  communication_confidence,
  relational_intelligence,
  motivational_fit
)
select
  b.id,
  16,
  17,
  17,
  17,
  17,
  16
from public.businesses b
where not exists (
  select 1
  from public.employer_trait_weightings etw
  where etw.business_id = b.id
    and etw.superseded_at is null
);
