-- Additional Explore Industries placeholders — wider sectors, fit scores, and growth signals.
-- Idempotent: ON CONFLICT BY slug / unique constraints.

insert into public.explore_industries (
  slug, name, short_name, blurb, why_narrative,
  open_roles, hiring_now, growth_label, growth_n,
  salary_band, salary_band_sub, team_size_typical, employers_count,
  sparkline_values, display_rank, base_match
)
values
  (
    'cybersecurity',
    'Cybersecurity & Trust',
    'cybersecurity',
    'Identity, zero-trust, threat detection, and security platforms — protecting data, apps, and infrastructure at scale.',
    'Security product culture rewards clarity under pressure and crisp stakeholder communication. Ownership and resilience map well to incident-driven prioritization and long compliance cycles.',
    412, 156, '+21% YoY', 21,
    '£88K–£135K', 'Security PM band', '51–500 typical', 489,
    '[44,46,48,51,53,56,59,61,64,66,69,71]'::jsonb,
    6, 91
  ),
  (
    'media-streaming',
    'Media & Streaming',
    'streaming',
    'Subscriptions, ad-supported video, podcasts, and creator platforms — engagement, retention, and content discovery.',
    'Streaming teams optimize for audience insight and rapid experimentation. Learning velocity and relational intelligence pair with cross-functional storytelling and metrics-led iteration.',
    228, 81, '+17% YoY', 17,
    '£72K–£118K', 'Product / growth band', '51–200 typical', 267,
    '[52,53,52,54,56,55,57,58,59,60,61,62]'::jsonb,
    7, 87
  ),
  (
    'legaltech',
    'LegalTech & GRC',
    'legal tech',
    'Contract automation, e-discovery, compliance workflows, and tools that help legal teams scale with less friction.',
    'LegalTech sits at the intersection of precision and product judgment. Communication confidence and structured ownership help translate regulation into shippable software.',
    164, 58, '+15% YoY', 15,
    '£80K–£125K', 'PM / GRC band', '11–200 typical', 198,
    '[36,38,41,43,46,49,52,54,56,58,60,62]'::jsonb,
    8, 85
  ),
  (
    'edtech',
    'EdTech & Learning',
    'EdTech',
    'Learning platforms, assessment tools, and workforce upskilling — improving outcomes for students and professionals.',
    'Education products demand empathy for diverse learners and measurable impact. Impact motivation and collaboration traits align with curriculum partners, institutions, and learner success teams.',
    301, 112, '+18% YoY', 18,
    '£62K–£105K', 'Product band', '51–500 typical', 355,
    '[40,42,44,47,50,52,54,56,58,60,62,64]'::jsonb,
    9, 81
  ),
  (
    'logistics-tech',
    'Logistics & Supply Chain Tech',
    'logistics tech',
    'Visibility, routing, warehouse automation, and freight orchestration — moving goods with data and APIs.',
    'Supply-chain software rewards systems thinking and follow-through on operational detail. Resilience helps when integrations, carriers, and exceptions collide in production.',
    189, 67, '+11% YoY', 11,
    '£68K–£112K', 'Operations product band', '51–200 typical', 241,
    '[33,35,37,40,42,45,48,50,52,54,56,58]'::jsonb,
    10, 77
  ),
  (
    'climate-tech',
    'Climate & Clean Tech',
    'climate tech',
    'Carbon accounting, grid flexibility, circularity, and hardware–software hybrids accelerating the transition.',
    'Climate ventures pair mission intensity with long R&D horizons. Impact drive and learning velocity help bridge science, policy, and commercial milestones.',
    142, 51, '+14% YoY', 14,
    '£75K–£120K', 'Climate PM band', '11–200 typical', 176,
    '[26,30,34,38,42,45,48,51,54,57,60,63]'::jsonb,
    11, 74
  ),
  (
    'proptech',
    'PropTech & Built World',
    'PropTech',
    'Residential and commercial real estate software — valuations, transactions, smart buildings, and asset operations.',
    'PropTech blends offline complexity with digital UX. Ownership and communication skills help align brokers, owners, and engineering on phased rollouts.',
    175, 63, '+10% YoY', 10,
    '£70K–£108K', 'Product band', '51–200 typical', 214,
    '[31,33,35,37,39,41,43,45,47,49,51,53]'::jsonb,
    12, 72
  ),
  (
    'hospitality-travel',
    'Hospitality & Travel Tech',
    'travel tech',
    'Booking, property management, loyalty, and guest experience platforms for hotels, short-term rentals, and mobility.',
    'Travel and hospitality products swing with seasonality and partnerships. Resilience and relational intelligence support revenue teams, ops, and travelers through disruption.',
    203, 76, '+9% YoY', 9,
    '£58K–£98K', 'Growth / PM band', '51–500 typical', 288,
    '[48,47,46,47,48,49,50,51,52,53,54,55]'::jsonb,
    13, 69
  )
on conflict (slug) do nothing;

insert into public.explore_industry_trait_highlights (industry_id, dimension_key, sort_order)
select e.id, v.dimension_key, v.sort_order
from public.explore_industries e
cross join (values
  ('cybersecurity', 'communication_confidence', 0),
  ('cybersecurity', 'ownership_follow_through', 1),
  ('cybersecurity', 'resilience', 2),
  ('cybersecurity', 'learning_velocity', 3),
  ('media-streaming', 'learning_velocity', 0),
  ('media-streaming', 'relational_intelligence', 1),
  ('media-streaming', 'motivational_fit_recognition', 2),
  ('media-streaming', 'ownership_follow_through', 3),
  ('legaltech', 'ownership_follow_through', 0),
  ('legaltech', 'communication_confidence', 1),
  ('legaltech', 'learning_velocity', 2),
  ('legaltech', 'relational_intelligence', 3),
  ('edtech', 'motivational_fit_impact', 0),
  ('edtech', 'relational_intelligence', 1),
  ('edtech', 'learning_velocity', 2),
  ('edtech', 'ownership_follow_through', 3),
  ('logistics-tech', 'ownership_follow_through', 0),
  ('logistics-tech', 'resilience', 1),
  ('logistics-tech', 'learning_velocity', 2),
  ('logistics-tech', 'relational_intelligence', 3),
  ('climate-tech', 'motivational_fit_impact', 0),
  ('climate-tech', 'learning_velocity', 1),
  ('climate-tech', 'resilience', 2),
  ('climate-tech', 'ownership_follow_through', 3),
  ('proptech', 'communication_confidence', 0),
  ('proptech', 'ownership_follow_through', 1),
  ('proptech', 'relational_intelligence', 2),
  ('proptech', 'learning_velocity', 3),
  ('hospitality-travel', 'relational_intelligence', 0),
  ('hospitality-travel', 'resilience', 1),
  ('hospitality-travel', 'learning_velocity', 2),
  ('hospitality-travel', 'motivational_fit_autonomy', 3)
) as v(slug, dimension_key, sort_order)
where e.slug = v.slug
on conflict (industry_id, dimension_key) do nothing;

insert into public.explore_industry_sample_roles (
  industry_id, company_name, role_title, location, display_match, sort_order
)
select e.id, v.company_name, v.role_title, v.location, v.display_match, v.sort_order
from public.explore_industries e
cross join (values
  ('cybersecurity', 'CrowdStrike', 'Principal PM, Falcon Platform', 'Remote · US', 92, 0),
  ('cybersecurity', 'Palo Alto Networks', 'Senior PM, Cloud Security', 'London', 89, 1),
  ('cybersecurity', 'Okta', 'Product Lead, Identity Protection', 'Paris · Hybrid', 87, 2),
  ('cybersecurity', 'Cloudflare', 'PM, Zero Trust', 'Remote · EU', 85, 3),
  ('media-streaming', 'Spotify', 'Senior PM, Personalization', 'Stockholm', 90, 0),
  ('media-streaming', 'Netflix', 'PM, Playback Experience', 'Los Gatos', 87, 1),
  ('media-streaming', 'Disney Streaming', 'PM, International Growth', 'London', 85, 2),
  ('media-streaming', 'Twitch', 'Product Lead, Creator Tools', 'Remote', 83, 3),
  ('legaltech', 'Clio', 'Senior PM, Practice Management', 'Remote · NA', 88, 0),
  ('legaltech', 'Ironclad', 'PM, Contract Intelligence', 'San Francisco', 86, 1),
  ('legaltech', 'DocuSign', 'Product Manager, Agreement Cloud', 'London', 84, 2),
  ('legaltech', 'Relativity', 'PM, Legal Discovery', 'Chicago', 82, 3),
  ('edtech', 'Duolingo', 'PM, Learning Pathways', 'Remote', 85, 0),
  ('edtech', 'Coursera', 'Senior PM, Degrees', 'Mountain View', 83, 1),
  ('edtech', 'Khan Academy', 'Product Lead, Schools', 'Remote', 81, 2),
  ('edtech', 'Udemy', 'PM, Enterprise Learning', 'Istanbul · Hybrid', 79, 3),
  ('logistics-tech', 'Flexport', 'PM, Ocean Freight Visibility', 'Amsterdam', 82, 0),
  ('logistics-tech', 'project44', 'Senior PM, Visibility API', 'Chicago', 80, 1),
  ('logistics-tech', 'Shippo', 'Product Manager, Shipping API', 'Remote', 78, 2),
  ('logistics-tech', 'Rivian', 'PM, Fleet Software Ops', 'Remote · US', 76, 3),
  ('climate-tech', 'Octopus Energy', 'PM, Smart Grid Products', 'London', 79, 0),
  ('climate-tech', 'Watershed', 'Senior PM, Carbon Data', 'Remote · EU', 77, 1),
  ('climate-tech', 'Archaea Energy', 'Product Lead, Operations', 'Houston', 75, 2),
  ('climate-tech', 'BloombergNEF', 'PM, Energy Transition Tools', 'New York', 73, 3),
  ('proptech', 'Zillow', 'Senior PM, Leads & CRM', 'Remote · US', 76, 0),
  ('proptech', 'Compass', 'PM, Agent Platform', 'New York', 74, 1),
  ('proptech', 'Habito', 'Product Lead, Mortgages', 'London', 72, 2),
  ('proptech', 'Rightmove', 'PM, Landlord Tools', 'London', 70, 3),
  ('hospitality-travel', 'Airbnb', 'PM, Guest Experience', 'Remote', 74, 0),
  ('hospitality-travel', 'Booking.com', 'Senior PM, Search', 'Amsterdam', 72, 1),
  ('hospitality-travel', 'Skyscanner', 'Product Manager, Flights', 'Edinburgh · Hybrid', 70, 2),
  ('hospitality-travel', 'GetYourGuide', 'PM, Supply Partners', 'Berlin', 68, 3)
) as v(slug, company_name, role_title, location, display_match, sort_order)
where e.slug = v.slug
on conflict on constraint explore_industry_sample_roles_industry_company_role_key do nothing;

insert into public.explore_industry_learning_links (
  industry_id, resource_type, title, source_name, meta, url, sort_order
)
select e.id, v.resource_type, v.title, v.source_name, v.meta, v.url, v.sort_order
from public.explore_industries e
cross join (values
  ('cybersecurity', 'article', 'Cybersecurity best practices', 'CISA', 'Guidance',
    'https://www.cisa.gov/topics/cybersecurity-best-practices', 0),
  ('cybersecurity', 'article', 'What is cybersecurity?', 'IBM', 'Topic',
    'https://www.ibm.com/topics/cybersecurity', 1),
  ('cybersecurity', 'course', 'IBM Cybersecurity Analyst', 'IBM / Coursera', 'Professional certificate',
    'https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst', 2),
  ('cybersecurity', 'video', 'UK National Cyber Security Centre — small business guidance', 'YouTube · NCSC', 'Overview',
    'https://www.youtube.com/watch?v=1C_B6-1-om4', 3),

  ('media-streaming', 'article', 'Technology news', 'TechCrunch', 'News desk',
    'https://techcrunch.com/', 0),
  ('media-streaming', 'article', 'Video game industry', 'Wikipedia', 'Overview',
    'https://en.wikipedia.org/wiki/Video_game_industry', 1),
  ('media-streaming', 'video', 'How the economics of streaming work', 'YouTube · WSJ', 'Panel',
    'https://www.youtube.com/watch?v=AuYNIgCUhTE', 2),
  ('media-streaming', 'article', '10 usability heuristics for user interface design', 'Nielsen Norman Group', 'Article',
    'https://www.nngroup.com/articles/ten-usability-heuristics/', 3),

  ('legaltech', 'article', 'Legal informatics overview', 'Legal Information Institute (Cornell)', 'Wex entry',
    'https://www.law.cornell.edu/wex/legal_informatics', 0),
  ('legaltech', 'course', 'Introduction to US Law', 'University of Pennsylvania / Coursera', 'Self-paced',
    'https://www.coursera.org/learn/american-law', 1),
  ('legaltech', 'article', 'Legal services', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Legal_services', 2),
  ('legaltech', 'article', 'What is GRC?', 'IBM', 'Overview',
    'https://www.ibm.com/topics/grc', 3),

  ('edtech', 'article', 'Education and technology', 'UNESCO', 'Theme page',
    'https://www.unesco.org/en/digital-education', 0),
  ('edtech', 'article', 'Education technology overview', 'U.S. Department of Education', 'EdTech',
    'https://tech.ed.gov/', 1),
  ('edtech', 'course', 'Learning How to Learn', 'McMaster University / Coursera', 'Popular course',
    'https://www.coursera.org/learn/learning-how-to-learn', 2),
  ('edtech', 'article', 'Agile product management', 'Atlassian', 'Guide',
    'https://www.atlassian.com/agile/product-management', 3),

  ('logistics-tech', 'article', 'What is supply chain management?', 'IBM', 'Topic',
    'https://www.ibm.com/topics/supply-chain-management', 0),
  ('logistics-tech', 'article', 'Supply chain management', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Supply_chain_management', 1),
  ('logistics-tech', 'course', 'Supply Chain Logistics', 'Rutgers / Coursera', 'Specialization intro',
    'https://www.coursera.org/learn/supply-chain-logistics', 2),
  ('logistics-tech', 'video', 'Supply chain disruptions explained', 'YouTube · Bloomberg', 'Explainer',
    'https://www.youtube.com/watch?v=I0bJ5TJ45iA', 3),

  ('climate-tech', 'article', 'Climate change — UN', 'United Nations', 'Overview',
    'https://www.un.org/en/climatechange', 0),
  ('climate-tech', 'article', 'Climate change', 'International Energy Agency', 'Topic',
    'https://www.iea.org/topics/climate-change', 1),
  ('climate-tech', 'course', 'Climate Change and Health', 'Yale / Coursera', 'Short course',
    'https://www.coursera.org/learn/climate-change-health', 2),
  ('climate-tech', 'article', 'Corporate climate commitments', 'Science Based Targets', 'Initiative',
    'https://sciencebasedtargets.org/', 3),

  ('proptech', 'article', 'Building technologies (U.S.)', 'U.S. Dept. of Energy', 'Program office',
    'https://www.energy.gov/eere/buildings/building-technologies-office', 0),
  ('proptech', 'article', 'PropTech', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/PropTech', 1),
  ('proptech', 'video', 'How technology is changing real estate', 'YouTube · CNBC', 'Segment',
    'https://www.youtube.com/watch?v=G7C8Ysq6u4Q', 2),
  ('proptech', 'course', 'Business and Financial Modeling', 'Wharton / Coursera', 'Specialization',
    'https://www.coursera.org/specializations/wharton-business-financial-modeling', 3),

  ('hospitality-travel', 'article', 'Tourism and sustainable development', 'UNWTO', 'Themes',
    'https://www.unwto.org/sustainable-development', 0),
  ('hospitality-travel', 'article', 'Hospitality industry', 'Wikipedia', 'Reference',
    'https://en.wikipedia.org/wiki/Hospitality_industry', 1),
  ('hospitality-travel', 'article', 'Travel trends', 'Skift', 'Publication',
    'https://skift.com/', 2),
  ('hospitality-travel', 'video', 'The future of travel after COVID-19', 'YouTube · McKinsey', 'Talk',
    'https://www.youtube.com/watch?v=9v_wc9AakJ4', 3)
) as v(slug, resource_type, title, source_name, meta, url, sort_order)
where e.slug = v.slug
on conflict on constraint explore_industry_learning_links_industry_url_key do nothing;
