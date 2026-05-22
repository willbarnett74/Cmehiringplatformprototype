-- More Explore Industries placeholders — additional sectors and a wider spread of fit scores.
-- Idempotent: ON CONFLICT BY slug / unique constraints.

insert into public.explore_industries (
  slug, name, short_name, blurb, why_narrative,
  open_roles, hiring_now, growth_label, growth_n,
  salary_band, salary_band_sub, team_size_typical, employers_count,
  sparkline_values, display_rank, base_match
)
values
  (
    'gaming-interactive',
    'Gaming & Interactive Entertainment',
    'gaming',
    'Studios, platforms, and live-service games — player engagement, economy design, UGC, and cross‑platform experiences.',
    'Game teams ship on emotion and telemetry. Learning velocity and mastery drive pair with communicating vision to artists, engineers, and community in tight loops.',
    267, 94, '+16% YoY', 16,
    '£68K–£115K', 'Product / live ops band', '51–500 typical', 312,
    '[55,56,58,60,62,64,66,67,68,70,71,72]'::jsonb,
    14, 88
  ),
  (
    'insurtech',
    'InsurTech & Risk Platforms',
    'insurtech',
    'Digital distribution, claims automation, usage-based coverage, and risk models that insurers embed in partner apps.',
    'Insurance product work blends regulation with behavioural insight. Ownership and communication help align actuaries, compliance, and partner GTM on defensible releases.',
    131, 47, '+13% YoY', 13,
    '£74K–£118K', 'Product band', '11–200 typical', 168,
    '[29,32,36,40,44,47,50,53,56,58,60,62]'::jsonb,
    15, 84
  ),
  (
    'hr-worktech',
    'HR & Work Tech',
    'work tech',
    'Payroll, benefits, talent acquisition, performance, and employee experience — systems of record plus engagement layers.',
    'HR software sits between people and policy. Relational intelligence and resilience help product leaders navigate ERGs, People teams, and global rollout complexity.',
    219, 82, '+12% YoY', 12,
    '£65K–£108K', 'B2B PM band', '51–200 typical', 251,
    '[41,42,43,44,45,46,46,47,48,49,50,51]'::jsonb,
    16, 80
  ),
  (
    'agri-food-tech',
    'Agri & Food Tech',
    'agri tech',
    'Farm software, traceability, novel ingredients, and supply visibility from field to shelf.',
    'Agri-food rewards measurable outcomes in messy physical environments. Impact motivation and structured ownership translate research and field data into products growers and buyers trust.',
    118, 43, '+10% YoY', 10,
    '£60K–£102K', 'Product band', '11–200 typical', 142,
    '[22,25,29,33,37,41,44,46,48,50,52,54]'::jsonb,
    17, 76
  ),
  (
    'industrial-iot',
    'Industrial & IoT Software',
    'industrial IoT',
    'Manufacturing analytics, predictive maintenance, digital twins, and OT/IT bridges on the plant floor.',
    'Industrial IoT calls for systems thinking under uptime pressure. Mastery orientation and communication help translate operator workflows into reliable software.',
    153, 55, '+9% YoY', 9,
    '£72K–£120K', 'Platform PM band', '200–1000 typical', 197,
    '[35,36,37,39,40,42,44,45,46,48,49,50]'::jsonb,
    18, 72
  ),
  (
    'sports-fitness-tech',
    'Sports, Fitness & Wearables',
    'fitness tech',
    'Training apps, hardware+software hybrids, leagues data, and performance tracking for enthusiasts and pros.',
    'Fitness products oscillate between habit formation and hardware constraints. Recognition drive and resilience support seasons, launches, and retention through noisy signal.',
    176, 64, '+11% YoY', 11,
    '£55K–£98K', 'Growth / PM band', '51–200 typical', 203,
    '[46,45,46,47,46,48,49,50,51,52,53,54]'::jsonb,
    19, 68
  )
on conflict (slug) do nothing;

insert into public.explore_industry_trait_highlights (industry_id, dimension_key, sort_order)
select e.id, v.dimension_key, v.sort_order
from public.explore_industries e
cross join (values
  ('gaming-interactive', 'learning_velocity', 0),
  ('gaming-interactive', 'motivational_fit_mastery', 1),
  ('gaming-interactive', 'communication_confidence', 2),
  ('gaming-interactive', 'ownership_follow_through', 3),
  ('insurtech', 'ownership_follow_through', 0),
  ('insurtech', 'communication_confidence', 1),
  ('insurtech', 'relational_intelligence', 2),
  ('insurtech', 'learning_velocity', 3),
  ('hr-worktech', 'relational_intelligence', 0),
  ('hr-worktech', 'resilience', 1),
  ('hr-worktech', 'communication_confidence', 2),
  ('hr-worktech', 'ownership_follow_through', 3),
  ('agri-food-tech', 'motivational_fit_impact', 0),
  ('agri-food-tech', 'ownership_follow_through', 1),
  ('agri-food-tech', 'learning_velocity', 2),
  ('agri-food-tech', 'relational_intelligence', 3),
  ('industrial-iot', 'motivational_fit_mastery', 0),
  ('industrial-iot', 'learning_velocity', 1),
  ('industrial-iot', 'communication_confidence', 2),
  ('industrial-iot', 'ownership_follow_through', 3),
  ('sports-fitness-tech', 'motivational_fit_recognition', 0),
  ('sports-fitness-tech', 'resilience', 1),
  ('sports-fitness-tech', 'learning_velocity', 2),
  ('sports-fitness-tech', 'relational_intelligence', 3)
) as v(slug, dimension_key, sort_order)
where e.slug = v.slug
on conflict (industry_id, dimension_key) do nothing;

insert into public.explore_industry_sample_roles (
  industry_id, company_name, role_title, location, display_match, sort_order
)
select e.id, v.company_name, v.role_title, v.location, v.display_match, v.sort_order
from public.explore_industries e
cross join (values
  ('gaming-interactive', 'Riot Games', 'Senior PM, Player Platforms', 'Dublin · Hybrid', 89, 0),
  ('gaming-interactive', 'Epic Games', 'Product Manager, Creator Economy', 'Cary · Hybrid', 87, 1),
  ('gaming-interactive', 'Unity', 'PM, Engine Workflows', 'Copenhagen · Remote', 85, 2),
  ('gaming-interactive', 'Roblox', 'Product Lead, Discovery', 'San Mateo', 83, 3),
  ('insurtech', 'Lemonade', 'Senior PM, Claims Experience', 'Tel Aviv · Remote', 86, 0),
  ('insurtech', 'Zego', 'Product Manager, Fleet Insurance', 'London', 84, 1),
  ('insurtech', 'Luko (ACE)', 'PM, Home Products', 'Paris', 82, 2),
  ('insurtech', 'Marshmallow', 'Product Lead, Pricing', 'London · Hybrid', 80, 3),
  ('hr-worktech', 'Workday', 'Senior PM, Talent Optimization', 'London · Hybrid', 84, 0),
  ('hr-worktech', 'Deel', 'Product Manager, Compliance', 'Remote · EU', 82, 1),
  ('hr-worktech', 'HiBob', 'PM, Core HR', 'Tel Aviv', 80, 2),
  ('hr-worktech', 'Personio', 'Product Lead, Time & Attendance', 'Munich', 78, 3),
  ('agri-food-tech', 'John Deere', 'Product Manager, Operations Center', 'Mannheim · Hybrid', 81, 0),
  ('agri-food-tech', 'Trimble Agriculture', 'Senior PM, Farm Software', 'Westminster', 79, 1),
  ('agri-food-tech', 'Farmers Edge', 'PM, Data Analytics', 'Canada · Remote', 77, 2),
  ('agri-food-tech', 'Yara Digital', 'Product Lead, Agronomy Tools', 'Oslo', 75, 3),
  ('industrial-iot', 'Siemens', 'PM, Industrial Edge', 'Munich · Hybrid', 79, 0),
  ('industrial-iot', 'PTC', 'Senior PM, Digital Twin', 'Boston', 77, 1),
  ('industrial-iot', 'Schneider Electric', 'Product Manager, Energy Management', 'Paris', 75, 2),
  ('industrial-iot', 'Rockwell Automation', 'PM, Plant Analytics', 'Milwaukee', 73, 3),
  ('sports-fitness-tech', 'Strava', 'Senior PM, Subscriptions', 'San Francisco · Hybrid', 76, 0),
  ('sports-fitness-tech', 'Peloton', 'Product Manager, Member Experience', 'New York', 74, 1),
  ('sports-fitness-tech', 'Whoop', 'PM, Coaching', 'Boston · Hybrid', 72, 2),
  ('sports-fitness-tech', 'Oura', 'Product Lead, Health', 'Oulu · Remote EU', 70, 3)
) as v(slug, company_name, role_title, location, display_match, sort_order)
where e.slug = v.slug
on conflict on constraint explore_industry_sample_roles_industry_company_role_key do nothing;

insert into public.explore_industry_learning_links (
  industry_id, resource_type, title, source_name, meta, url, sort_order
)
select e.id, v.resource_type, v.title, v.source_name, v.meta, v.url, v.sort_order
from public.explore_industries e
cross join (values
  ('gaming-interactive', 'article', 'Video game industry', 'Wikipedia', 'Overview',
    'https://en.wikipedia.org/wiki/Video_game_industry', 0),
  ('gaming-interactive', 'course', 'Introduction to game design', 'Michigan State / Coursera', 'Intro',
    'https://www.coursera.org/learn/gamedesign', 1),
  ('gaming-interactive', 'article', '10 usability heuristics for user interface design', 'Nielsen Norman Group', 'Article',
    'https://www.nngroup.com/articles/ten-usability-heuristics/', 2),
  ('gaming-interactive', 'video', 'How video games are designed', 'YouTube · Vox', 'Explainer',
    'https://www.youtube.com/watch?v=zOzvUd0uDnE', 3),

  ('insurtech', 'article', 'Insurtech', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Insurtech', 0),
  ('insurtech', 'article', 'What is insurance?', 'IBM', 'Topic',
    'https://www.ibm.com/topics/insurance', 1),
  ('insurtech', 'article', 'Insurance', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Insurance', 2),
  ('insurtech', 'course', 'AI For Everyone', 'DeepLearning.AI / Coursera', 'Foundations',
    'https://www.coursera.org/learn/ai-for-everyone', 3),

  ('hr-worktech', 'article', 'Human resource management', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Human_resource_management', 0),
  ('hr-worktech', 'article', 'Human resources and AI', 'IBM', 'Topic',
    'https://www.ibm.com/topics/human-resources', 1),
  ('hr-worktech', 'article', 'Agile product management', 'Atlassian', 'Guide',
    'https://www.atlassian.com/agile/product-management', 2),
  ('hr-worktech', 'course', 'Learning How to Learn', 'McMaster University / Coursera', 'Popular course',
    'https://www.coursera.org/learn/learning-how-to-learn', 3),

  ('agri-food-tech', 'article', 'Digital agriculture', 'FAO', 'Programme',
    'https://www.fao.org/digital-agriculture', 0),
  ('agri-food-tech', 'article', 'Precision agriculture', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Precision_agriculture', 1),
  ('agri-food-tech', 'article', 'Climate and agriculture', 'United Nations', 'Overview',
    'https://www.un.org/en/climatechange', 2),
  ('agri-food-tech', 'course', 'Climate Change and Health', 'Yale / Coursera', 'Intro',
    'https://www.coursera.org/learn/climate-change-health', 3),

  ('industrial-iot', 'article', 'Industrial Internet of Things', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Industrial_Internet_of_things', 0),
  ('industrial-iot', 'article', 'What is the IoT?', 'IBM', 'Topic',
    'https://www.ibm.com/topics/iot', 1),
  ('industrial-iot', 'article', 'Supply chain management', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Supply_chain_management', 2),
  ('industrial-iot', 'course', 'Supply Chain Logistics', 'Rutgers / Coursera', 'Intro',
    'https://www.coursera.org/learn/supply-chain-logistics', 3),

  ('sports-fitness-tech', 'article', 'Wearable technology', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Wearable_technology', 0),
  ('sports-fitness-tech', 'article', 'Physical activity', 'WHO', 'Facts',
    'https://www.who.int/news-room/fact-sheets/detail/physical-activity', 1),
  ('sports-fitness-tech', 'article', '10 usability heuristics for user interface design', 'Nielsen Norman Group', 'Article',
    'https://www.nngroup.com/articles/ten-usability-heuristics/', 2),
  ('sports-fitness-tech', 'course', 'Science of Exercise', 'University of Colorado / Coursera', 'Intro',
    'https://www.coursera.org/learn/science-exercise', 3)
) as v(slug, resource_type, title, source_name, meta, url, sort_order)
where e.slug = v.slug
on conflict on constraint explore_industry_learning_links_industry_url_key do nothing;
