-- Explore Industries: catalog + curated learning links + candidate bookmarks.
-- Metrics and sample roles are placeholders until live market data is wired.

-- ─── explore_industries ───────────────────────────────────────────────────
create table if not exists public.explore_industries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  blurb text not null,
  why_narrative text not null,
  open_roles integer not null,
  hiring_now integer not null,
  growth_label text not null,
  growth_n numeric not null,
  salary_band text not null,
  salary_band_sub text,
  team_size_typical text not null,
  employers_count integer not null,
  sparkline_values jsonb not null,
  display_rank integer not null default 0,
  base_match integer not null check (base_match between 0 and 100)
);

comment on table public.explore_industries is
  'Applicant Explore Industries verticals; metrics are seeded placeholders.';
comment on column public.explore_industries.base_match is
  'Headline fit score (0–100) for cards until computed matching ships.';
comment on column public.explore_industries.sparkline_values is
  'Array of 12 numbers for UI sparkline (monthly signal placeholder).';

-- ─── Trait highlights (DimensionScores keys only) ─────────────────────────
create table if not exists public.explore_industry_trait_highlights (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid not null references public.explore_industries (id) on delete cascade,
  dimension_key text not null check (
    dimension_key in (
      'learning_velocity',
      'ownership_follow_through',
      'resilience',
      'communication_confidence',
      'relational_intelligence',
      'motivational_fit_mastery',
      'motivational_fit_impact',
      'motivational_fit_recognition',
      'motivational_fit_autonomy'
    )
  ),
  sort_order integer not null default 0,
  unique (industry_id, dimension_key)
);

create index if not exists explore_industry_trait_highlights_industry_idx
  on public.explore_industry_trait_highlights (industry_id, sort_order);

-- ─── Sample roles (placeholder) ────────────────────────────────────────────
create table if not exists public.explore_industry_sample_roles (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid not null references public.explore_industries (id) on delete cascade,
  company_name text not null,
  role_title text not null,
  location text not null,
  display_match integer not null check (display_match between 0 and 100),
  sort_order integer not null default 0
);

create index if not exists explore_industry_sample_roles_industry_idx
  on public.explore_industry_sample_roles (industry_id, sort_order);

alter table public.explore_industry_sample_roles
  drop constraint if exists explore_industry_sample_roles_industry_company_role_key;
alter table public.explore_industry_sample_roles
  add constraint explore_industry_sample_roles_industry_company_role_key
  unique (industry_id, company_name, role_title);

-- ─── Learning links ───────────────────────────────────────────────────────
create table if not exists public.explore_industry_learning_links (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid not null references public.explore_industries (id) on delete cascade,
  resource_type text not null check (
    resource_type in ('article', 'course', 'podcast', 'video')
  ),
  title text not null,
  source_name text not null,
  meta text not null,
  url text not null,
  sort_order integer not null default 0
);

create index if not exists explore_industry_learning_links_industry_idx
  on public.explore_industry_learning_links (industry_id, sort_order);

alter table public.explore_industry_learning_links
  drop constraint if exists explore_industry_learning_links_industry_url_key;
alter table public.explore_industry_learning_links
  add constraint explore_industry_learning_links_industry_url_key
  unique (industry_id, url);

-- ─── Saved industries (per candidate) ─────────────────────────────────────
create table if not exists public.candidate_saved_industries (
  candidate_id uuid not null references public.candidate_profiles (id) on delete cascade,
  industry_id uuid not null references public.explore_industries (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (candidate_id, industry_id)
);

-- ─── RLS ───────────────────────────────────────────────────────────────────
alter table public.explore_industries enable row level security;
alter table public.explore_industry_trait_highlights enable row level security;
alter table public.explore_industry_sample_roles enable row level security;
alter table public.explore_industry_learning_links enable row level security;
alter table public.candidate_saved_industries enable row level security;

drop policy if exists "explore_industries: authenticated read" on public.explore_industries;
create policy "explore_industries: authenticated read"
  on public.explore_industries for select to authenticated using (true);

drop policy if exists "explore_industry_trait_highlights: authenticated read"
  on public.explore_industry_trait_highlights;
create policy "explore_industry_trait_highlights: authenticated read"
  on public.explore_industry_trait_highlights for select to authenticated using (true);

drop policy if exists "explore_industry_sample_roles: authenticated read"
  on public.explore_industry_sample_roles;
create policy "explore_industry_sample_roles: authenticated read"
  on public.explore_industry_sample_roles for select to authenticated using (true);

drop policy if exists "explore_industry_learning_links: authenticated read"
  on public.explore_industry_learning_links;
create policy "explore_industry_learning_links: authenticated read"
  on public.explore_industry_learning_links for select to authenticated using (true);

drop policy if exists "candidate_saved_industries: own select" on public.candidate_saved_industries;
create policy "candidate_saved_industries: own select"
  on public.candidate_saved_industries for select to authenticated
  using (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_saved_industries.candidate_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "candidate_saved_industries: own insert" on public.candidate_saved_industries;
create policy "candidate_saved_industries: own insert"
  on public.candidate_saved_industries for insert to authenticated
  with check (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_saved_industries.candidate_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "candidate_saved_industries: own delete" on public.candidate_saved_industries;
create policy "candidate_saved_industries: own delete"
  on public.candidate_saved_industries for delete to authenticated
  using (
    exists (
      select 1 from public.candidate_profiles cp
      where cp.id = candidate_saved_industries.candidate_id
        and cp.user_id = auth.uid()
    )
  );

-- ─── Seed (idempotent by slug) ─────────────────────────────────────────────
insert into public.explore_industries (
  slug, name, short_name, blurb, why_narrative,
  open_roles, hiring_now, growth_label, growth_n,
  salary_band, salary_band_sub, team_size_typical, employers_count,
  sparkline_values, display_rank, base_match
)
values
  (
    'saas',
    'SaaS & Productivity',
    'SaaS',
    'Tools that help knowledge workers ship faster — CRMs, work OS, vertical SaaS, productivity layers.',
    'SaaS product teams move on short iteration loops with high ownership. Your structured follow-through and learning velocity map to clarity from ambiguity, week-on-week shipping, and durable user empathy — how these teams operate.',
    342, 128, '+18% YoY', 18,
    '£85K–£130K', 'Senior PM band', '51–200 typical', 347,
    '[42,48,46,52,55,58,61,59,63,68,72,76]'::jsonb,
    1, 94
  ),
  (
    'devtools',
    'Developer Tools',
    'developer tools',
    'APIs, infra platforms, IDE tooling, observability and the developer experience layer underneath.',
    'Developer tools rewards mastery-driven people who can speak both engineering and product. Problem-structuring and systems thinking match how these teams scope ambiguous infra problems into shipping milestones.',
    156, 62, '+20% YoY', 20,
    '£90K–£140K', 'Platform PM band', '11–200 typical', 184,
    '[30,34,38,40,42,48,52,55,58,62,66,70]'::jsonb,
    2, 91
  ),
  (
    'fintech',
    'Fintech & Finance',
    'fintech',
    'Payments rails, lending, embedded finance, neobanks, wealth and treasury platforms.',
    'Fintech rewards analytical framing under regulatory complexity. Clear written communication and structuring tradeoffs translate to how risk, compliance and product converge in this sector.',
    287, 98, '+22% YoY', 22,
    '£95K–£145K', 'Lead PM band', '200–1000 typical', 412,
    '[38,40,42,45,48,52,54,56,58,60,62,65]'::jsonb,
    3, 88
  ),
  (
    'healthtech',
    'Health Tech & Digital Health',
    'health tech',
    'Technology improving healthcare delivery, patient outcomes, and wellness — with accessibility and regulatory awareness.',
    'Health tech values research-grounded thinking and measurable outcomes. Relational intelligence and resilience help navigate stakeholder complexity and long feedback cycles common in care settings.',
    198, 71, '+25% YoY', 25,
    '£70K–£115K', 'Product band', '51–500 typical', 263,
    '[28,32,35,40,44,48,52,55,58,62,66,70]'::jsonb,
    4, 82
  ),
  (
    'ecommerce',
    'E-Commerce & Marketplaces',
    'e-commerce',
    'Platforms connecting buyers and sellers — DTC brands to multi-sided marketplaces. Fast-paced, data-heavy, strong experimentation culture.',
    'E-commerce rewards comfort with pace and experimentation. Ownership and impact motivation map well to teams where every design and funnel change is measured against revenue and retention.',
    256, 104, '+14% YoY', 14,
    '£65K–£110K', 'Growth PM band', '51–200 typical', 301,
    '[50,52,51,53,54,55,56,57,58,59,60,61]'::jsonb,
    5, 79
  )
on conflict (slug) do nothing;

-- Trait highlights per industry
insert into public.explore_industry_trait_highlights (industry_id, dimension_key, sort_order)
select e.id, v.dimension_key, v.sort_order
from public.explore_industries e
cross join (values
  ('saas', 'ownership_follow_through', 0),
  ('saas', 'learning_velocity', 1),
  ('saas', 'relational_intelligence', 2),
  ('saas', 'communication_confidence', 3),
  ('devtools', 'learning_velocity', 0),
  ('devtools', 'relational_intelligence', 1),
  ('devtools', 'communication_confidence', 2),
  ('devtools', 'ownership_follow_through', 3),
  ('fintech', 'communication_confidence', 0),
  ('fintech', 'ownership_follow_through', 1),
  ('fintech', 'relational_intelligence', 2),
  ('fintech', 'learning_velocity', 3),
  ('healthtech', 'motivational_fit_impact', 0),
  ('healthtech', 'relational_intelligence', 1),
  ('healthtech', 'resilience', 2),
  ('healthtech', 'learning_velocity', 3),
  ('ecommerce', 'motivational_fit_impact', 0),
  ('ecommerce', 'learning_velocity', 1),
  ('ecommerce', 'ownership_follow_through', 2),
  ('ecommerce', 'resilience', 3)
) as v(slug, dimension_key, sort_order)
where e.slug = v.slug
on conflict (industry_id, dimension_key) do nothing;

-- Sample roles
insert into public.explore_industry_sample_roles (
  industry_id, company_name, role_title, location, display_match, sort_order
)
select e.id, v.company_name, v.role_title, v.location, v.display_match, v.sort_order
from public.explore_industries e
cross join (values
  ('saas', 'Linear', 'Senior PM, Platform', 'Remote · EU', 93, 0),
  ('saas', 'Notion', 'Product Manager', 'San Francisco', 91, 1),
  ('saas', 'Vercel', 'Product Lead, DX', 'Remote', 89, 2),
  ('saas', 'Airtable', 'PM, Workflow Builder', 'London', 87, 3),
  ('saas', 'Monday.com', 'Senior Product Manager', 'London · Hybrid', 86, 4),
  ('saas', 'Asana', 'PM, Goals and Reporting', 'San Francisco', 85, 5),
  ('saas', 'Slack', 'Principal PM, Platform', 'Remote · US', 84, 6),
  ('saas', 'Figma', 'Product Manager, FigJam', 'London · Hybrid', 83, 7),
  ('saas', 'HubSpot', 'PM, Smart CRM', 'Remote · EU', 82, 8),
  ('saas', 'Zendesk', 'Senior PM, Agent Workspace', 'Berlin', 81, 9),
  ('saas', 'Canva', 'Product Lead, Teams', 'Sydney · Hybrid', 80, 10),
  ('saas', 'Calendly', 'Senior PM, Scheduling', 'Remote · US', 79, 11),
  ('devtools', 'Vercel', 'PM, Platform', 'Remote', 92, 0),
  ('devtools', 'Datadog', 'PM, Observability', 'New York', 90, 1),
  ('devtools', 'GitHub', 'PM, Developer Workflows', 'Remote', 88, 2),
  ('devtools', 'HashiCorp', 'PM, Infrastructure', 'Remote · US', 85, 3),
  ('fintech', 'Stripe', 'Product Lead, Connect', 'Remote · EU', 90, 0),
  ('fintech', 'Wise', 'Senior PM, FX', 'London', 88, 1),
  ('fintech', 'Adyen', 'PM, Issuing', 'Amsterdam', 86, 2),
  ('fintech', 'Revolut', 'PM, Cards', 'London', 84, 3),
  ('healthtech', 'NHS Digital', 'Product Manager, Patient Access', 'UK', 86, 0),
  ('healthtech', 'Babylon Health', 'PM, Clinical Pathways', 'London', 84, 1),
  ('healthtech', 'Zocdoc', 'Senior PM, Scheduling', 'Remote · US', 82, 2),
  ('healthtech', 'Teladoc', 'PM, Virtual Care', 'Remote', 80, 3),
  ('ecommerce', 'Shopify', 'Senior PM, Checkout', 'Remote', 88, 0),
  ('ecommerce', 'Etsy', 'PM, Seller Experience', 'New York', 85, 1),
  ('ecommerce', 'Zalando', 'PM, Fashion Marketplace', 'Berlin', 83, 2),
  ('ecommerce', 'Deliveroo', 'PM, Consumer Growth', 'London', 81, 3)
) as v(slug, company_name, role_title, location, display_match, sort_order)
where e.slug = v.slug
on conflict on constraint explore_industry_sample_roles_industry_company_role_key do nothing;

-- Learning links (real public URLs; titles describe content)
insert into public.explore_industry_learning_links (
  industry_id, resource_type, title, source_name, meta, url, sort_order
)
select e.id, v.resource_type, v.title, v.source_name, v.meta, v.url, v.sort_order
from public.explore_industries e
cross join (values
  ('saas', 'article', 'What is SaaS?', 'Amazon AWS', 'Overview',
    'https://aws.amazon.com/what-is/saas/', 0),
  ('saas', 'article', 'Pipelines, platforms, and the new rules of strategy', 'Harvard Business Review', '15 min read',
    'https://hbr.org/2016/04/pipelines-platforms-and-the-new-rules-of-strategy', 1),
  ('saas', 'course', 'Introduction to Software Product Management', 'University of Alberta / Coursera', 'Multi-week · audit free',
    'https://www.coursera.org/learn/introduction-to-software-product-management', 2),
  ('saas', 'video', 'Inside Silicon Valley: Building a SaaS company', 'YouTube · Stanford', '52 min',
    'https://www.youtube.com/watch?v=3ShpIQ3SjEw', 3),
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
    'https://stripe.com/resources/more/saas-pricing-models-101', 11),

  ('devtools', 'article', 'Resources to grow as a software developer', 'The GitHub Blog', 'Topic hub',
    'https://github.blog/developer-skills/', 0),
  ('devtools', 'article', 'Patterns for managing source branches', 'Martin Fowler', 'Long read',
    'https://martinfowler.com/articles/branching-patterns.html', 1),
  ('devtools', 'article', 'API design and documentation best practices', 'Swagger (OpenAPI)', 'Guide',
    'https://swagger.io/resources/articles/best-practices-in-api-design/', 2),
  ('devtools', 'podcast', 'How I Built This', 'NPR', 'Podcast series',
    'https://www.npr.org/podcasts/510313/how-i-built-this', 3),

  ('fintech', 'article', 'The World Bank and fintech: enabling financial inclusion', 'World Bank', 'Brief',
    'https://www.worldbank.org/en/topic/financialsector/brief/the-world-bank-and-fintech-enabling-financial-inclusion', 0),
  ('fintech', 'article', 'Financial Stability Institute — publications', 'Bank for International Settlements', 'Index',
    'https://www.bis.org/fsi/fsipapers.htm', 1),
  ('fintech', 'course', 'FinTech Foundations and Overview', 'The Hong Kong University of Science and Technology / Coursera', 'Self-paced',
    'https://www.coursera.org/learn/fintech', 2),
  ('fintech', 'video', 'The future of finance — Panel at World Economic Forum', 'YouTube · WEF', '45 min',
    'https://www.youtube.com/watch?v=6b4ZhnM6N80', 3),

  ('healthtech', 'article', 'eHealth overview', 'World Health Organization', 'Fact sheet',
    'https://www.who.int/news-room/fact-sheets/detail/ehealth', 0),
  ('healthtech', 'article', 'About health IT basics', 'HealthIT.gov (HHS)', 'Overview',
    'https://www.healthit.gov/topic/health-it-basics', 1),
  ('healthtech', 'article', 'Digital health during COVID-19: lessons from operational adaptation', 'npj Digital Medicine (PMC)', 'Open access',
    'https://pmc.ncbi.nlm.nih.gov/articles/PMC7455750/', 2),
  ('healthtech', 'video', 'Digital health explained', 'YouTube · Healthcare Triage', '8 min',
    'https://www.youtube.com/watch?v=0cWt6U9kPfY', 3),

  ('ecommerce', 'article', 'E-commerce trends and statistics', 'Shopify Research', 'Article',
    'https://www.shopify.com/blog/ecommerce-trends', 0),
  ('ecommerce', 'article', 'E-commerce and the digital economy', 'UNCTAD', 'Topic overview',
    'https://unctad.org/topic/ecommerce-and-digital-economy', 1),
  ('ecommerce', 'article', 'What is e-commerce?', 'IBM', 'Topic primer',
    'https://www.ibm.com/think/topics/ecommerce', 2),
  ('ecommerce', 'course', 'Digital Marketing and E-commerce', 'Google / Coursera', 'Professional certificate track',
    'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce', 3)
) as v(slug, resource_type, title, source_name, meta, url, sort_order)
where e.slug = v.slug
on conflict on constraint explore_industry_learning_links_industry_url_key do nothing;
