-- Fix broken or moved explore_industry_learning_links URLs (404 / redirects).
-- Current base seed (16120000) already uses many of the replacement URLs. Rows that still
-- carry legacy URLs must be updated, but a plain UPDATE can violate
-- explore_industry_learning_links_industry_url_key if the new URL already exists for the
-- same industry. For each legacy → replacement pair: delete the legacy row when the
-- replacement already exists; then UPDATE any remaining legacy row.

-- SaaS — McKinsey / Coursera / Intercom / Shopify / For Entrepreneurs
delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/growth-in-the-cloud-how-software-as-a-service-is-changing-the-industry'
  and keeper.url = 'https://aws.amazon.com/what-is/saas/';
update public.explore_industry_learning_links
set
  resource_type = 'article',
  title = 'What is SaaS?',
  source_name = 'Amazon AWS',
  meta = 'Overview',
  url = 'https://aws.amazon.com/what-is/saas/'
where url = 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/growth-in-the-cloud-how-software-as-a-service-is-changing-the-industry';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-dos-and-donts-of-successful-platform-business-models'
  and keeper.url = 'https://hbr.org/2016/04/pipelines-platforms-and-the-new-rules-of-strategy';
update public.explore_industry_learning_links
set
  resource_type = 'article',
  title = 'Pipelines, platforms, and the new rules of strategy',
  source_name = 'Harvard Business Review',
  meta = '15 min read',
  url = 'https://hbr.org/2016/04/pipelines-platforms-and-the-new-rules-of-strategy'
where url = 'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-dos-and-donts-of-successful-platform-business-models';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.coursera.org/learn/software-product-management'
  and keeper.url = 'https://www.coursera.org/learn/introduction-to-software-product-management';
update public.explore_industry_learning_links
set
  resource_type = 'course',
  title = 'Introduction to Software Product Management',
  source_name = 'University of Alberta / Coursera',
  meta = 'Multi-week · audit free',
  url = 'https://www.coursera.org/learn/introduction-to-software-product-management'
where url = 'https://www.coursera.org/learn/software-product-management';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.intercom.com/blog/what-is-product-management/'
  and keeper.url = 'https://www.intercom.com/blog/product-management/';
update public.explore_industry_learning_links
set
  title = 'Product management — guides and articles',
  meta = 'Hub',
  url = 'https://www.intercom.com/blog/product-management/'
where url = 'https://www.intercom.com/blog/what-is-product-management/';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.shopify.com/blog/product-management'
  and keeper.url = 'https://developer.shopify.com/blog/building-for-the-long-term';
update public.explore_industry_learning_links
set
  resource_type = 'article',
  title = 'Building for the long term: lessons from our hack days',
  source_name = 'Shopify Developers',
  meta = 'Blog',
  url = 'https://developer.shopify.com/blog/building-for-the-long-term'
where url = 'https://www.shopify.com/blog/product-management';

-- DevTools
delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://increment.com/documentation/incomplete-list-skills-senior-engineers/'
  and keeper.url = 'https://github.blog/developer-skills/';
update public.explore_industry_learning_links
set
  resource_type = 'article',
  title = 'Resources to grow as a software developer',
  source_name = 'The GitHub Blog',
  meta = 'Topic hub',
  url = 'https://github.blog/developer-skills/'
where url = 'https://increment.com/documentation/incomplete-list-skills-senior-engineers/';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://martinfowler.com/articles/versionFlowPatterns.html'
  and keeper.url = 'https://martinfowler.com/articles/branching-patterns.html';
update public.explore_industry_learning_links
set
  title = 'Patterns for managing source branches',
  meta = 'Long read',
  url = 'https://martinfowler.com/articles/branching-patterns.html'
where url = 'https://martinfowler.com/articles/versionFlowPatterns.html';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://readme.com/resources/designing-for-developers'
  and keeper.url = 'https://swagger.io/resources/articles/best-practices-in-api-design/';
update public.explore_industry_learning_links
set
  title = 'API design and documentation best practices',
  source_name = 'Swagger (OpenAPI)',
  meta = 'Guide',
  url = 'https://swagger.io/resources/articles/best-practices-in-api-design/'
where url = 'https://readme.com/resources/designing-for-developers';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.npr.org/2022/12/23/1145304684/jason-warner-github'
  and keeper.url = 'https://www.npr.org/podcasts/510313/how-i-built-this';
update public.explore_industry_learning_links
set
  title = 'How I Built This',
  meta = 'Podcast series',
  url = 'https://www.npr.org/podcasts/510313/how-i-built-this'
where url = 'https://www.npr.org/2022/12/23/1145304684/jason-warner-github';

-- Fintech
delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.federalreserve.gov/econres/notes/feds-notes/the-disruption-of-financial-intermediation-by-digital-fintech-players-20200605.htm'
  and keeper.url = 'https://www.worldbank.org/en/topic/financialsector/brief/the-world-bank-and-fintech-enabling-financial-inclusion';
update public.explore_industry_learning_links
set
  resource_type = 'article',
  title = 'The World Bank and fintech: enabling financial inclusion',
  source_name = 'World Bank',
  meta = 'Brief',
  url = 'https://www.worldbank.org/en/topic/financialsector/brief/the-world-bank-and-fintech-enabling-financial-inclusion'
where url = 'https://www.federalreserve.gov/econres/notes/feds-notes/the-disruption-of-financial-intermediation-by-digital-fintech-players-20200605.htm';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.imf.org/en/Publications/fandd/issues/2022/12/Fintech-changes-how-we-bank-Aidan-Andrews'
  and keeper.url = 'https://www.bis.org/fsi/fsipapers.htm';
update public.explore_industry_learning_links
set
  title = 'Financial Stability Institute — publications',
  source_name = 'Bank for International Settlements',
  meta = 'Index',
  url = 'https://www.bis.org/fsi/fsipapers.htm'
where url = 'https://www.imf.org/en/Publications/fandd/issues/2022/12/Fintech-changes-how-we-bank-Aidan-Andrews';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.coursera.org/learn/fintech-law-policy'
  and keeper.url = 'https://www.coursera.org/learn/fintech';
update public.explore_industry_learning_links
set
  resource_type = 'course',
  title = 'FinTech Foundations and Overview',
  source_name = 'The Hong Kong University of Science and Technology / Coursera',
  meta = 'Self-paced',
  url = 'https://www.coursera.org/learn/fintech'
where url = 'https://www.coursera.org/learn/fintech-law-policy';

-- Healthtech
delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.nature.com/articles/s41746-020-00360-2'
  and keeper.url = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7455750/';
update public.explore_industry_learning_links
set
  title = 'Digital health during COVID-19: lessons from operational adaptation',
  source_name = 'npj Digital Medicine (PMC)',
  meta = 'Open access',
  url = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7455750/'
where url = 'https://www.nature.com/articles/s41746-020-00360-2';

-- E-commerce
delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.digitalcommerce360.com/article/e-commerce-sales-top-1-trillion-2022/'
  and keeper.url = 'https://unctad.org/topic/ecommerce-and-digital-economy';
update public.explore_industry_learning_links
set
  title = 'E-commerce and the digital economy',
  source_name = 'UNCTAD',
  meta = 'Topic overview',
  url = 'https://unctad.org/topic/ecommerce-and-digital-economy'
where url = 'https://www.digitalcommerce360.com/article/e-commerce-sales-top-1-trillion-2022/';

-- SaaS — Stripe pricing (replaces For Entrepreneurs)
delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.forentrepreneurs.com/saas-metrics-2/'
  and keeper.url = 'https://stripe.com/resources/more/saas-pricing-models-101';
update public.explore_industry_learning_links
set
  resource_type = 'article',
  title = 'SaaS pricing models 101: how today''s fastest-growing SaaS companies structure pricing',
  source_name = 'Stripe',
  meta = 'Guide',
  url = 'https://stripe.com/resources/more/saas-pricing-models-101'
where url = 'https://www.forentrepreneurs.com/saas-metrics-2/';
