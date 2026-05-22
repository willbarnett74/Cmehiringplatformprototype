-- DevTools: use a primary (non-motivational) highlight so industry cards align with core profile bars.
update public.explore_industry_trait_highlights h
set dimension_key = 'learning_velocity'
from public.explore_industries e
where h.industry_id = e.id
  and e.slug = 'devtools'
  and h.dimension_key = 'motivational_fit_mastery';
