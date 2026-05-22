-- Extra SaaS sample roles + learning links (same rows as merged into 20260516120000 for fresh installs).
-- Run ONLY after 20260516120000_explore_industries.sql — that migration creates these tables.
-- Idempotent: ON CONFLICT DO NOTHING. Skip this file if you applied an up-to-date 16120000 that already includes these rows.

do $$
begin
  if to_regclass('public.explore_industry_sample_roles') is null then
    raise exception
      'Table public.explore_industry_sample_roles does not exist. Apply migration 20260516120000_explore_industries.sql first (creates explore_* tables), then re-run this migration.';
  end if;
end $$;

insert into public.explore_industry_sample_roles (
  industry_id, company_name, role_title, location, display_match, sort_order
)
select e.id, v.company_name, v.role_title, v.location, v.display_match, v.sort_order
from public.explore_industries e
cross join (values
  ('saas', 'Monday.com', 'Senior Product Manager', 'London · Hybrid', 86, 4),
  ('saas', 'Asana', 'PM, Goals and Reporting', 'San Francisco', 85, 5),
  ('saas', 'Slack', 'Principal PM, Platform', 'Remote · US', 84, 6),
  ('saas', 'Figma', 'Product Manager, FigJam', 'London · Hybrid', 83, 7),
  ('saas', 'HubSpot', 'PM, Smart CRM', 'Remote · EU', 82, 8),
  ('saas', 'Zendesk', 'Senior PM, Agent Workspace', 'Berlin', 81, 9),
  ('saas', 'Canva', 'Product Lead, Teams', 'Sydney · Hybrid', 80, 10),
  ('saas', 'Calendly', 'Senior PM, Scheduling', 'Remote · US', 79, 11)
) as v(slug, company_name, role_title, location, display_match, sort_order)
where e.slug = v.slug
on conflict on constraint explore_industry_sample_roles_industry_company_role_key do nothing;

insert into public.explore_industry_learning_links (
  industry_id, resource_type, title, source_name, meta, url, sort_order
)
select e.id, v.resource_type, v.title, v.source_name, v.meta, v.url, v.sort_order
from public.explore_industries e
cross join (values
  ('saas', 'article', 'Agile product management', 'Atlassian', 'Topic hub',
    'https://www.atlassian.com/agile/product-management', 4),
  ('saas', 'article', 'The product-led growth guide', 'OpenView Partners', 'Long read',
    'https://openviewpartners.com/blog/product-led-growth/', 5),
  ('saas', 'article', 'Product management — guides and articles', 'Intercom', 'Hub',
    'https://www.intercom.com/blog/product-management/', 6),
  ('saas', 'article', 'What is SaaS (software as a service)?', 'Google Cloud', 'Overview',
    'https://cloud.google.com/learn/what-is-saas', 7),
  ('saas', 'article', 'Building for the long term: lessons from our hack days', 'Shopify Developers', 'Blog',
    'https://developer.shopify.com/blog/building-for-the-long-term', 8),
  ('saas', 'article', 'What is a product roadmap?', 'Atlassian', 'Guide',
    'https://www.atlassian.com/agile/product-management/product-roadmaps', 9),
  ('saas', 'course', 'Digital Product Management', 'University of Virginia / Coursera', '4 weeks · audit free',
    'https://www.coursera.org/learn/uva-darden-digital-product-management', 10),
  ('saas', 'article', 'SaaS pricing models 101: how today''s fastest-growing SaaS companies structure pricing', 'Stripe', 'Guide',
    'https://stripe.com/resources/more/saas-pricing-models-101', 11)
) as v(slug, resource_type, title, source_name, meta, url, sort_order)
where e.slug = v.slug
on conflict on constraint explore_industry_learning_links_industry_url_key do nothing;
