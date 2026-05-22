-- Repair explore_industry_learning_links: replace 404s and unreliable URLs (HTTP-verified May 2026).
-- Uses delete-then-update when the target URL already exists for the same industry (unique on industry_id, url).

-- ─── Helper pattern: drop legacy row when canonical URL already present ───

-- SaaS / DevTools / Fintech / E-commerce (from original fix migration; still needed on some DBs)
delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/growth-in-the-cloud-how-software-as-a-service-is-changing-the-industry'
  and keeper.url = 'https://aws.amazon.com/what-is/saas/';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-dos-and-donts-of-successful-platform-business-models'
  and keeper.url = 'https://hbr.org/2016/04/pipelines-platforms-and-the-new-rules-of-strategy';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.coursera.org/learn/software-product-management'
  and keeper.url = 'https://www.coursera.org/learn/introduction-to-software-product-management';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.intercom.com/blog/what-is-product-management/'
  and keeper.url = 'https://www.intercom.com/blog/product-management/';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.shopify.com/blog/product-management'
  and keeper.url = 'https://developer.shopify.com/blog/building-for-the-long-term';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://increment.com/documentation/incomplete-list-skills-senior-engineers/'
  and keeper.url = 'https://github.blog/developer-skills/';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://martinfowler.com/articles/versionFlowPatterns.html'
  and keeper.url = 'https://martinfowler.com/articles/branching-patterns.html';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://readme.com/resources/designing-for-developers'
  and keeper.url = 'https://swagger.io/resources/articles/best-practices-in-api-design/';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.npr.org/2022/12/23/1145304684/jason-warner-github'
  and keeper.url = 'https://www.npr.org/podcasts/510313/how-i-built-this';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.federalreserve.gov/econres/notes/feds-notes/the-disruption-of-financial-intermediation-by-digital-fintech-players-20200605.htm'
  and keeper.url = 'https://www.worldbank.org/en/topic/financialsector/brief/the-world-bank-and-fintech-enabling-financial-inclusion';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.imf.org/en/Publications/fandd/issues/2022/12/Fintech-changes-how-we-bank-Aidan-Andrews'
  and keeper.url = 'https://www.bis.org/fsi/fsipapers.htm';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.coursera.org/learn/fintech-law-policy'
  and keeper.url = 'https://www.coursera.org/learn/fintech';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.nature.com/articles/s41746-020-00360-2'
  and keeper.url = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7455750/';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.digitalcommerce360.com/article/e-commerce-sales-top-1-trillion-2022/'
  and keeper.url = 'https://unctad.org/topic/ecommerce-and-digital-economy';

delete from public.explore_industry_learning_links as victim
using public.explore_industry_learning_links as keeper
where victim.industry_id = keeper.industry_id
  and victim.url = 'https://www.forentrepreneurs.com/saas-metrics-2/'
  and keeper.url = 'https://stripe.com/resources/more/saas-pricing-models-101';

-- ─── Updates (legacy → working URL) ───

update public.explore_industry_learning_links
set resource_type = 'article', title = 'What is SaaS?', source_name = 'Amazon AWS', meta = 'Overview',
  url = 'https://aws.amazon.com/what-is/saas/'
where url = 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/growth-in-the-cloud-how-software-as-a-service-is-changing-the-industry';

update public.explore_industry_learning_links
set resource_type = 'article', title = 'Pipelines, platforms, and the new rules of strategy',
  source_name = 'Harvard Business Review', meta = '15 min read',
  url = 'https://hbr.org/2016/04/pipelines-platforms-and-the-new-rules-of-strategy'
where url = 'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-dos-and-donts-of-successful-platform-business-models';

update public.explore_industry_learning_links
set resource_type = 'course', title = 'Introduction to Software Product Management',
  source_name = 'University of Alberta / Coursera', meta = 'Multi-week · audit free',
  url = 'https://www.coursera.org/learn/introduction-to-software-product-management'
where url = 'https://www.coursera.org/learn/software-product-management';

update public.explore_industry_learning_links
set title = 'Product management — guides and articles', meta = 'Hub',
  url = 'https://www.intercom.com/blog/product-management/'
where url = 'https://www.intercom.com/blog/what-is-product-management/';

update public.explore_industry_learning_links
set resource_type = 'article', title = 'Building for the long term: lessons from our hack days',
  source_name = 'Shopify Developers', meta = 'Blog',
  url = 'https://developer.shopify.com/blog/building-for-the-long-term'
where url = 'https://www.shopify.com/blog/product-management';

update public.explore_industry_learning_links
set resource_type = 'article', title = 'Resources to grow as a software developer',
  source_name = 'The GitHub Blog', meta = 'Topic hub',
  url = 'https://github.blog/developer-skills/'
where url = 'https://increment.com/documentation/incomplete-list-skills-senior-engineers/';

update public.explore_industry_learning_links
set title = 'Patterns for managing source branches', meta = 'Long read',
  url = 'https://martinfowler.com/articles/branching-patterns.html'
where url = 'https://martinfowler.com/articles/versionFlowPatterns.html';

update public.explore_industry_learning_links
set title = 'API design and documentation best practices', source_name = 'Swagger (OpenAPI)', meta = 'Guide',
  url = 'https://swagger.io/resources/articles/best-practices-in-api-design/'
where url = 'https://readme.com/resources/designing-for-developers';

update public.explore_industry_learning_links
set title = 'How I Built This', meta = 'Podcast series',
  url = 'https://www.npr.org/podcasts/510313/how-i-built-this'
where url = 'https://www.npr.org/2022/12/23/1145304684/jason-warner-github';

update public.explore_industry_learning_links
set resource_type = 'article', title = 'The World Bank and fintech: enabling financial inclusion',
  source_name = 'World Bank', meta = 'Brief',
  url = 'https://www.worldbank.org/en/topic/financialsector/brief/the-world-bank-and-fintech-enabling-financial-inclusion'
where url = 'https://www.federalreserve.gov/econres/notes/feds-notes/the-disruption-of-financial-intermediation-by-digital-fintech-players-20200605.htm';

update public.explore_industry_learning_links
set title = 'Financial Stability Institute — publications', source_name = 'Bank for International Settlements', meta = 'Index',
  url = 'https://www.bis.org/fsi/fsipapers.htm'
where url = 'https://www.imf.org/en/Publications/fandd/issues/2022/12/Fintech-changes-how-we-bank-Aidan-Andrews';

update public.explore_industry_learning_links
set resource_type = 'course', title = 'FinTech Foundations and Overview',
  source_name = 'The Hong Kong University of Science and Technology / Coursera', meta = 'Self-paced',
  url = 'https://www.coursera.org/learn/fintech'
where url = 'https://www.coursera.org/learn/fintech-law-policy';

update public.explore_industry_learning_links
set title = 'Digital health during COVID-19: lessons from operational adaptation',
  source_name = 'npj Digital Medicine (PMC)', meta = 'Open access',
  url = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7455750/'
where url = 'https://www.nature.com/articles/s41746-020-00360-2';

update public.explore_industry_learning_links
set title = 'E-commerce and the digital economy', source_name = 'UNCTAD', meta = 'Topic overview',
  url = 'https://unctad.org/topic/ecommerce-and-digital-economy'
where url = 'https://www.digitalcommerce360.com/article/e-commerce-sales-top-1-trillion-2022/';

update public.explore_industry_learning_links
set resource_type = 'article',
  title = 'SaaS pricing models 101: how today''s fastest-growing SaaS companies structure pricing',
  source_name = 'Stripe', meta = 'Guide',
  url = 'https://stripe.com/resources/more/saas-pricing-models-101'
where url = 'https://www.forentrepreneurs.com/saas-metrics-2/';

-- New fixes (404 / moved pages)
update public.explore_industry_learning_links
set resource_type = 'article', title = 'Legal services', source_name = 'Wikipedia', meta = 'Reference',
  url = 'https://en.wikipedia.org/wiki/Legal_services'
where url = 'https://www.gov.uk/government/collections/legal-services-regulation';

update public.explore_industry_learning_links
set resource_type = 'article', title = 'Climate change', source_name = 'International Energy Agency', meta = 'Topic',
  url = 'https://www.iea.org/topics/climate-change'
where url = 'https://www.iea.org/topics/energy-and-climate';

update public.explore_industry_learning_links
set resource_type = 'article', title = '10 usability heuristics for user interface design',
  source_name = 'Nielsen Norman Group', meta = 'Article',
  url = 'https://www.nngroup.com/articles/ten-usability-heuristics/'
where url = 'https://www.nngroup.com/articles/user-centered-design/';

update public.explore_industry_learning_links
set resource_type = 'article', title = 'What is cybersecurity?', source_name = 'IBM', meta = 'Topic',
  url = 'https://www.ibm.com/topics/cybersecurity'
where url = 'https://www.cloudflare.com/learning/security/what-is-cybersecurity/';

update public.explore_industry_learning_links
set resource_type = 'article', title = 'Technology news', source_name = 'TechCrunch', meta = 'News desk',
  url = 'https://techcrunch.com/'
where url = 'https://www.ofcom.org.uk/research-and-data/multi-sector-research/internet-research';

update public.explore_industry_learning_links
set resource_type = 'article', title = 'Technology news', source_name = 'BBC News', meta = 'News desk',
  url = 'https://www.bbc.co.uk/news/technology'
where url = 'https://www.reuters.com/technology/';
