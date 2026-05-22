import type { SupabaseClient } from '@supabase/supabase-js';

import { insertCandidateActivityEvent } from './applicantPersistence';
import type { DimensionScores } from '../utils/intakeScoring';
import {
  type DimensionKey,
  DIMENSION_KEYS,
} from '../utils/intakeScoreAggregate';

// ─── Labels (align with TraitScoresDisplay / Dashboard handoff) ─────────────

export const EXPLORE_DIMENSION_LABELS: Record<DimensionKey, string> = {
  learning_velocity: 'Learning Velocity',
  ownership_follow_through: 'Ownership & Drive',
  resilience: 'Resilience',
  communication_confidence: 'Communication',
  relational_intelligence: 'Collaboration',
  motivational_fit_mastery: 'Drive for Mastery',
  motivational_fit_impact: 'Impact Drive',
  motivational_fit_recognition: 'Recognition',
  motivational_fit_autonomy: 'Autonomy',
};

export function isDimensionKey(s: string): s is DimensionKey {
  return (DIMENSION_KEYS as readonly string[]).includes(s);
}

/** Four CMe motivational sub-dimensions (shown under "Why this fits you" narrative). */
export const EXPLORE_MOTIVATIONAL_DIMENSION_KEYS = [
  'motivational_fit_mastery',
  'motivational_fit_impact',
  'motivational_fit_recognition',
  'motivational_fit_autonomy',
] as const satisfies readonly DimensionKey[];

/** Five non-motivational CMe dimensions shown in Core profile dimensions. */
export const EXPLORE_ALL_PRIMARY_DIMENSION_KEYS = [
  'learning_velocity',
  'ownership_follow_through',
  'resilience',
  'communication_confidence',
  'relational_intelligence',
] as const satisfies readonly DimensionKey[];

export const EXPLORE_CORE_PROFILE_DIMENSION_COUNT = EXPLORE_ALL_PRIMARY_DIMENSION_KEYS.length;

export function isMotivationalDimensionKey(k: DimensionKey): boolean {
  return (EXPLORE_MOTIVATIONAL_DIMENSION_KEYS as readonly string[]).includes(k);
}

/**
 * Right-column trait bars: industry highlights first (non-motivational), then fill with any
 * remaining primary dimensions until five bars (resilience + communication always appear).
 */
export function buildExplorePrimaryTraitBarKeys(
  highlights: { dimension_key: DimensionKey; sort_order: number }[],
): DimensionKey[] {
  const ordered: DimensionKey[] = [];
  const seen = new Set<DimensionKey>();
  for (const h of [...highlights].sort((a, b) => a.sort_order - b.sort_order)) {
    if (isMotivationalDimensionKey(h.dimension_key)) continue;
    if (seen.has(h.dimension_key)) continue;
    ordered.push(h.dimension_key);
    seen.add(h.dimension_key);
  }
  for (const k of EXPLORE_ALL_PRIMARY_DIMENSION_KEYS) {
    if (ordered.length >= EXPLORE_CORE_PROFILE_DIMENSION_COUNT) break;
    if (!seen.has(k)) {
      ordered.push(k);
      seen.add(k);
    }
  }
  return ordered;
}

// ─── Match display (design README) ─────────────────────────────────────────

export function matchTier(n: number): { label: string; color: string } {
  if (n >= 90) return { label: 'Excellent fit', color: '#10B981' };
  if (n >= 80) return { label: 'Strong fit', color: '#7dbbff' };
  return { label: 'Good fit', color: '#F59E0B' };
}

/** Signal pill copy in industry hero (derived from headline match). */
export function signalLabelFromMatch(n: number): string {
  if (n >= 90) return 'High alignment';
  if (n >= 80) return 'Strong alignment';
  return 'Good alignment';
}

export function roleCardMatchColor(fit: number): string {
  if (fit >= 90) return '#10B981';
  if (fit >= 80) return '#7dbbff';
  return '#F59E0B';
}

// ─── DB shape → app shape ──────────────────────────────────────────────────

export type ExploreResourceType = 'article' | 'course' | 'podcast' | 'video';

export type ExploreIndustryTraitHighlight = {
  dimension_key: DimensionKey;
  sort_order: number;
};

export type ExploreSampleRole = {
  /** Row id from `explore_industry_sample_roles` when loaded from Supabase; null in dev fallback. */
  id: string | null;
  /** Linked `roles.id` when seeded as a demo employer posting. */
  role_id: string | null;
  company_name: string;
  role_title: string;
  location: string;
  display_match: number;
  sort_order: number;
  about_role: string | null;
  responsibilities: string[];
  requirements: string[];
  linked_role: ExploreLinkedRole | null;
};

export type ExploreLinkedBusiness = {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  description: string | null;
};

export type ExploreLinkedRole = {
  id: string;
  title: string;
  role_type: string | null;
  seniority: string | null;
  location: string | null;
  description: string | null;
  business: ExploreLinkedBusiness | null;
};

export type ExploreRolePresentation = {
  title: string;
  companyName: string;
  location: string;
  roleType: string;
  seniority: string | null;
  about: string;
  responsibilities: string[];
  requirements: string[];
  companyBlurb: string | null;
  companyIndustry: string | null;
  companySize: string | null;
  isLinkedDemoRole: boolean;
  linkedRoleId: string | null;
  linkedBusinessId: string | null;
};

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

function stripDemoTag(text: string | null | undefined): string | null {
  if (!text) return null;
  const cleaned = text.replace(/\s*__CME_EXPLORE_DEMO__\s*/g, '').replace(/\s*__CME_SEED_ROLE__\s*/g, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

function parseLinkedBusiness(raw: unknown): ExploreLinkedBusiness | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.id !== 'string' || typeof b.name !== 'string') return null;
  return {
    id: b.id,
    name: b.name,
    industry: typeof b.industry === 'string' ? b.industry : null,
    size: typeof b.size === 'string' ? b.size : null,
    website: typeof b.website === 'string' ? b.website : null,
    description: stripDemoTag(typeof b.description === 'string' ? b.description : null),
  };
}

function parseLinkedRole(raw: unknown): ExploreLinkedRole | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return null;
  const businessesRaw = r.businesses;
  const business =
    businessesRaw != null && !Array.isArray(businessesRaw)
      ? parseLinkedBusiness(businessesRaw)
      : null;
  return {
    id: r.id,
    title: typeof r.title === 'string' ? r.title : '',
    role_type: typeof r.role_type === 'string' ? r.role_type : null,
    seniority: typeof r.seniority === 'string' ? r.seniority : null,
    location: typeof r.location === 'string' ? r.location : null,
    description: stripDemoTag(typeof r.description === 'string' ? r.description : null),
    business,
  };
}

/** Resolved copy for role cards + modal (linked role wins; sensible fallbacks offline). */
export function resolveExploreRolePresentation(
  role: ExploreSampleRole,
  industryName: string,
): ExploreRolePresentation {
  const linked = role.linked_role;
  const biz = linked?.business;
  const defaultAbout = `As ${role.role_title} at ${role.company_name}, you'll own meaningful product outcomes in ${industryName} — partnering with engineering, design, and stakeholders to ship work users feel in their day-to-day workflows.`;
  const defaultResponsibilities = [
    'Define and communicate a clear product vision for your area with measurable outcomes',
    'Run discovery with users and stakeholders; translate insights into prioritized roadmaps',
    'Partner with engineering and design through delivery, launch, and post-launch iteration',
    'Track success metrics, share learnings, and adjust plans based on evidence',
  ];
  const defaultRequirements = [
    'Experience owning product work end-to-end in a software or digital product environment',
    'Strong written and verbal communication — comfortable with execs, engineers, and customers',
    'Track record of shipping iteratively and using data or research to inform decisions',
  ];

  return {
    title: linked?.title || role.role_title,
    companyName: biz?.name || role.company_name,
    location: linked?.location || role.location,
    roleType: linked?.role_type || 'Full-time',
    seniority: linked?.seniority ?? null,
    about: role.about_role || linked?.description?.split('\n\nWhat you')[0]?.trim() || defaultAbout,
    responsibilities: role.responsibilities.length > 0 ? role.responsibilities : defaultResponsibilities,
    requirements: role.requirements.length > 0 ? role.requirements : defaultRequirements,
    companyBlurb: biz?.description ?? null,
    companyIndustry: biz?.industry ?? industryName,
    companySize: biz?.size ?? null,
    isLinkedDemoRole: Boolean(role.role_id && linked?.id),
    linkedRoleId: role.role_id ?? linked?.id ?? null,
    linkedBusinessId: biz?.id ?? null,
  };
}

/** Persisted explore role interest (candidate_explore_role_interests). */
export type ExploreRoleInterestRecord = {
  industry_id: string;
  company_name: string;
  role_title: string;
  location: string;
  created_at: string;
};

export type ExploreLearningLink = {
  resource_type: ExploreResourceType;
  title: string;
  source_name: string;
  meta: string;
  url: string;
  sort_order: number;
};

export type ExploreIndustry = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  blurb: string;
  why_narrative: string;
  open_roles: number;
  hiring_now: number;
  growth_label: string;
  growth_n: number;
  salary_band: string;
  salary_band_sub: string | null;
  team_size_typical: string;
  employers_count: number;
  sparkline_values: number[];
  display_rank: number;
  base_match: number;
  trait_highlights: ExploreIndustryTraitHighlight[];
  sample_roles: ExploreSampleRole[];
  learning_links: ExploreLearningLink[];
};

export type ExploreFilters = {
  minFit: number;
  growth: 'any' | '15+' | '20+';
  region: string;
  sizes: string[];
  roleTypes: string[];
};

export const DEFAULT_EXPLORE_FILTERS: ExploreFilters = {
  /** 65 keeps all seeded placeholder verticals visible (several are 68–72 headline fit). */
  minFit: 65,
  growth: 'any',
  region: 'Anywhere',
  sizes: [],
  roleTypes: [],
};

export const ALL_EXPLORE_REGIONS = ['Anywhere', 'UK', 'Europe', 'North America', 'Remote-first'] as const;

export const ALL_EXPLORE_SIZES = ['<50', '50–200', '200–1000', '1000+'] as const;

export const ALL_EXPLORE_ROLE_TYPES = ['Full-time', 'Contract', 'Fractional'] as const;

export function exploreFilterActiveCount(f: ExploreFilters): number {
  return (
    (f.minFit > 65 ? 1 : 0) +
    (f.growth !== 'any' ? 1 : 0) +
    (f.region !== 'Anywhere' ? 1 : 0) +
    f.sizes.length +
    f.roleTypes.length
  );
}

/** MVP: only minFit + growth affect the list (README). */
export function exploreIndustryPassesFilters(
  industry: Pick<ExploreIndustry, 'base_match' | 'growth_n'>,
  filters: ExploreFilters,
): boolean {
  if (industry.base_match < filters.minFit) return false;
  if (filters.growth === '15+' && industry.growth_n < 15) return false;
  if (filters.growth === '20+' && industry.growth_n < 20) return false;
  return true;
}

function parseSparkline(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => (typeof x === 'number' ? x : Number(x))).filter((n) => Number.isFinite(n));
}

function normalizeResourceType(raw: string): ExploreResourceType {
  if (raw === 'article' || raw === 'course' || raw === 'podcast' || raw === 'video') return raw;
  return 'article';
}

export async function fetchExploreIndustriesBundle(
  client: SupabaseClient,
): Promise<ExploreIndustry[]> {
  const { data: rows, error } = await client
    .from('explore_industries')
    .select(
      `
      id,
      slug,
      name,
      short_name,
      blurb,
      why_narrative,
      open_roles,
      hiring_now,
      growth_label,
      growth_n,
      salary_band,
      salary_band_sub,
      team_size_typical,
      employers_count,
      sparkline_values,
      display_rank,
      base_match,
      explore_industry_trait_highlights ( dimension_key, sort_order ),
      explore_industry_sample_roles (
        id,
        company_name,
        role_title,
        location,
        display_match,
        sort_order,
        role_id,
        about_role,
        responsibilities,
        requirements,
        roles (
          id,
          title,
          role_type,
          seniority,
          location,
          description,
          businesses ( id, name, industry, size, website, description )
        )
      ),
      explore_industry_learning_links ( resource_type, title, source_name, meta, url, sort_order )
    `,
    )
    .order('display_rank', { ascending: true });

  if (error) throw error;
  if (!rows?.length) return [];

  type Row = (typeof rows)[number];

  return (rows as Row[]).map((row) => {
    const highlightsRaw = row.explore_industry_trait_highlights;
    const traits: ExploreIndustryTraitHighlight[] = Array.isArray(highlightsRaw)
      ? highlightsRaw
          .filter(
            (h): h is { dimension_key: DimensionKey; sort_order: number } =>
              h != null &&
              typeof h.dimension_key === 'string' &&
              isDimensionKey(h.dimension_key),
          )
          .map((h) => ({
            dimension_key: h.dimension_key,
            sort_order: h.sort_order ?? 0,
          }))
          .sort((a, b) => a.sort_order - b.sort_order)
      : [];

    const rolesRaw = row.explore_industry_sample_roles;
    const sample_roles: ExploreSampleRole[] = Array.isArray(rolesRaw)
      ? rolesRaw
          .filter(
            (r) =>
              r != null &&
              typeof (r as { company_name?: unknown }).company_name === 'string' &&
              typeof (r as { role_title?: unknown }).role_title === 'string',
          )
          .map((r) => {
            const row = r as Record<string, unknown>;
            return {
              id: typeof row.id === 'string' ? row.id : null,
              role_id: typeof row.role_id === 'string' ? row.role_id : null,
              company_name: row.company_name as string,
              role_title: row.role_title as string,
              location: typeof row.location === 'string' ? row.location : '',
              display_match: typeof row.display_match === 'number' ? row.display_match : 0,
              sort_order: typeof row.sort_order === 'number' ? row.sort_order : 0,
              about_role: typeof row.about_role === 'string' ? row.about_role : null,
              responsibilities: parseStringArray(row.responsibilities),
              requirements: parseStringArray(row.requirements),
              linked_role: parseLinkedRole(row.roles),
            };
          })
          .sort((a, b) => a.sort_order - b.sort_order)
      : [];

    const learnRaw = row.explore_industry_learning_links;
    const learning_links: ExploreLearningLink[] = Array.isArray(learnRaw)
      ? learnRaw
          .filter((l) => l != null && typeof l.url === 'string' && typeof l.title === 'string')
          .map((l) => ({
            resource_type: normalizeResourceType(String(l.resource_type)),
            title: l.title,
            source_name: typeof l.source_name === 'string' ? l.source_name : '',
            meta: typeof l.meta === 'string' ? l.meta : '',
            url: l.url,
            sort_order: typeof l.sort_order === 'number' ? l.sort_order : 0,
          }))
          .sort((a, b) => a.sort_order - b.sort_order)
      : [];

    const {
      explore_industry_trait_highlights: _th,
      explore_industry_sample_roles: _sr,
      explore_industry_learning_links: _ll,
      ...rest
    } = row;

    return {
      ...(rest as Omit<
        Row,
        | 'explore_industry_trait_highlights'
        | 'explore_industry_sample_roles'
        | 'explore_industry_learning_links'
      >),
      growth_n: Number(rest.growth_n),
      sparkline_values: parseSparkline(rest.sparkline_values),
      trait_highlights: traits,
      sample_roles,
      learning_links,
    } as ExploreIndustry;
  });
}

/** Stable key for UI + dedupe: same triple as DB unique constraint. */
export function exploreRoleInterestCompoundKey(
  industryId: string,
  companyName: string,
  roleTitle: string,
): string {
  return `${industryId}|||${companyName}|||${roleTitle}`;
}

export async function fetchCandidateExploreRoleInterests(
  client: SupabaseClient,
  candidateId: string,
): Promise<ExploreRoleInterestRecord[]> {
  const { data, error } = await client
    .from('candidate_explore_role_interests')
    .select('industry_id, company_name, role_title, location, created_at')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      if (
        !row ||
        typeof row.industry_id !== 'string' ||
        typeof row.company_name !== 'string' ||
        typeof row.role_title !== 'string'
      ) {
        return null;
      }
      return {
        industry_id: row.industry_id,
        company_name: row.company_name,
        role_title: row.role_title,
        location: typeof row.location === 'string' ? row.location : '',
        created_at: typeof row.created_at === 'string' ? row.created_at : new Date(0).toISOString(),
      };
    })
    .filter((r): r is ExploreRoleInterestRecord => r != null);
}

export async function fetchExpressedExploreRoleInterestKeys(
  client: SupabaseClient,
  candidateId: string,
): Promise<Set<string>> {
  const rows = await fetchCandidateExploreRoleInterests(client, candidateId);
  const set = new Set<string>();
  for (const row of rows) {
    set.add(exploreRoleInterestCompoundKey(row.industry_id, row.company_name, row.role_title));
  }
  return set;
}

export async function expressExploreRoleInterest(
  client: SupabaseClient,
  params: {
    candidateId: string;
    userId: string;
    industryId: string;
    industryName: string;
    role: ExploreSampleRole;
  },
): Promise<'inserted' | 'already'> {
  const { candidateId, userId, industryId, industryName, role } = params;
  const { error } = await client.from('candidate_explore_role_interests').insert({
    candidate_id: candidateId,
    industry_id: industryId,
    sample_role_id: role.id,
    company_name: role.company_name,
    role_title: role.role_title,
    location: role.location ?? '',
  });

  if (error) {
    if (error.code === '23505') return 'already';
    throw error;
  }

  await insertCandidateActivityEvent(
    client,
    userId,
    'system',
    `You signalled interest in “${role.role_title}” at ${role.company_name} (${industryName} · Explore).`,
  );
  return 'inserted';
}

export async function withdrawExploreRoleInterest(
  client: SupabaseClient,
  candidateId: string,
  industryId: string,
  role: Pick<ExploreSampleRole, 'company_name' | 'role_title'>,
): Promise<void> {
  const { error } = await client
    .from('candidate_explore_role_interests')
    .delete()
    .eq('candidate_id', candidateId)
    .eq('industry_id', industryId)
    .eq('company_name', role.company_name)
    .eq('role_title', role.role_title);
  if (error) throw error;
}

export async function fetchSavedExploreIndustryIds(
  client: SupabaseClient,
  candidateId: string,
): Promise<Set<string>> {
  const { data, error } = await client
    .from('candidate_saved_industries')
    .select('industry_id')
    .eq('candidate_id', candidateId);

  if (error) throw error;
  return new Set((data ?? []).map((r) => r.industry_id as string));
}

export async function saveExploreIndustry(
  client: SupabaseClient,
  candidateId: string,
  industryId: string,
): Promise<void> {
  const { error } = await client.from('candidate_saved_industries').insert({
    candidate_id: candidateId,
    industry_id: industryId,
  });
  if (error) throw error;
}

export async function unsaveExploreIndustry(
  client: SupabaseClient,
  candidateId: string,
  industryId: string,
): Promise<void> {
  const { error } = await client
    .from('candidate_saved_industries')
    .delete()
    .eq('candidate_id', candidateId)
    .eq('industry_id', industryId);
  if (error) throw error;
}

export function scoreForDimension(
  scores: DimensionScores | null | undefined,
  key: DimensionKey,
): number {
  if (!scores) return 0;
  const v = scores[key];
  return typeof v === 'number' && Number.isFinite(v) ? Math.round(Math.min(100, Math.max(0, v))) : 0;
}

export function traitAlignmentLabel(score: number): 'aligned' | 'developing' {
  return score >= 70 ? 'aligned' : 'developing';
}

/** Offline / demo-only mirror of seed data when Supabase is not configured. */
export const EXPLORE_INDUSTRIES_DEV_FALLBACK: ExploreIndustry[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'saas',
    name: 'SaaS & Productivity',
    short_name: 'SaaS',
    blurb:
      'Tools that help knowledge workers ship faster — CRMs, work OS, vertical SaaS, productivity layers.',
    why_narrative:
      'SaaS product teams move on short iteration loops with high ownership. Your structured follow-through and learning velocity map to how these teams operate.',
    open_roles: 342,
    hiring_now: 128,
    growth_label: '+18% YoY',
    growth_n: 18,
    salary_band: '£85K–£130K',
    salary_band_sub: 'Senior PM band',
    team_size_typical: '51–200 typical',
    employers_count: 347,
    sparkline_values: [42, 48, 46, 52, 55, 58, 61, 59, 63, 68, 72, 76],
    display_rank: 1,
    base_match: 94,
    trait_highlights: [
      { dimension_key: 'ownership_follow_through', sort_order: 0 },
      { dimension_key: 'learning_velocity', sort_order: 1 },
      { dimension_key: 'relational_intelligence', sort_order: 2 },
    ],
    sample_roles: [
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Linear',
        role_title: 'Senior PM, Platform',
        location: 'Remote · EU',
        display_match: 93,
        sort_order: 0,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Notion',
        role_title: 'Product Manager',
        location: 'San Francisco',
        display_match: 91,
        sort_order: 1,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Vercel',
        role_title: 'Product Lead, DX',
        location: 'Remote',
        display_match: 89,
        sort_order: 2,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Airtable',
        role_title: 'PM, Workflow Builder',
        location: 'London',
        display_match: 87,
        sort_order: 3,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Monday.com',
        role_title: 'Senior Product Manager',
        location: 'London · Hybrid',
        display_match: 86,
        sort_order: 4,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Asana',
        role_title: 'PM, Goals and Reporting',
        location: 'San Francisco',
        display_match: 85,
        sort_order: 5,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Slack',
        role_title: 'Principal PM, Platform',
        location: 'Remote · US',
        display_match: 84,
        sort_order: 6,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Figma',
        role_title: 'Product Manager, FigJam',
        location: 'London · Hybrid',
        display_match: 83,
        sort_order: 7,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'HubSpot',
        role_title: 'PM, Smart CRM',
        location: 'Remote · EU',
        display_match: 82,
        sort_order: 8,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Zendesk',
        role_title: 'Senior PM, Agent Workspace',
        location: 'Berlin',
        display_match: 81,
        sort_order: 9,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Canva',
        role_title: 'Product Lead, Teams',
        location: 'Sydney · Hybrid',
        display_match: 80,
        sort_order: 10,
      },
      {
        id: null,
        role_id: null,
        about_role: null,
        responsibilities: [],
        requirements: [],
        linked_role: null,
        company_name: 'Calendly',
        role_title: 'Senior PM, Scheduling',
        location: 'Remote · US',
        display_match: 79,
        sort_order: 11,
      },
    ],
    learning_links: [
      {
        resource_type: 'article',
        title: 'What is SaaS?',
        source_name: 'Amazon AWS',
        meta: 'Overview',
        url: 'https://aws.amazon.com/what-is/saas/',
        sort_order: 0,
      },
      {
        resource_type: 'article',
        title: 'Pipelines, platforms, and the new rules of strategy',
        source_name: 'Harvard Business Review',
        meta: '15 min read',
        url: 'https://hbr.org/2016/04/pipelines-platforms-and-the-new-rules-of-strategy',
        sort_order: 1,
      },
      {
        resource_type: 'course',
        title: 'Introduction to Software Product Management',
        source_name: 'University of Alberta / Coursera',
        meta: 'Multi-week · audit free',
        url: 'https://www.coursera.org/learn/introduction-to-software-product-management',
        sort_order: 2,
      },
      {
        resource_type: 'video',
        title: 'Inside Silicon Valley: Building a SaaS company',
        source_name: 'YouTube · Stanford',
        meta: '52 min',
        url: 'https://www.youtube.com/watch?v=3ShpIQ3SjEw',
        sort_order: 3,
      },
      {
        resource_type: 'article',
        title: 'Agile product management',
        source_name: 'Atlassian',
        meta: 'Topic hub',
        url: 'https://www.atlassian.com/agile/product-management',
        sort_order: 4,
      },
      {
        resource_type: 'article',
        title: 'The product-led growth guide',
        source_name: 'OpenView Partners',
        meta: 'Long read',
        url: 'https://openviewpartners.com/blog/product-led-growth/',
        sort_order: 5,
      },
      {
        resource_type: 'article',
        title: 'Product management — guides and articles',
        source_name: 'Intercom',
        meta: 'Hub',
        url: 'https://www.intercom.com/blog/product-management/',
        sort_order: 6,
      },
      {
        resource_type: 'article',
        title: 'What is SaaS (software as a service)?',
        source_name: 'Google Cloud',
        meta: 'Overview',
        url: 'https://cloud.google.com/learn/what-is-saas',
        sort_order: 7,
      },
      {
        resource_type: 'article',
        title: 'Building for the long term: lessons from our hack days',
        source_name: 'Shopify Developers',
        meta: 'Blog',
        url: 'https://developer.shopify.com/blog/building-for-the-long-term',
        sort_order: 8,
      },
      {
        resource_type: 'article',
        title: 'What is a product roadmap?',
        source_name: 'Atlassian',
        meta: 'Guide',
        url: 'https://www.atlassian.com/agile/product-management/product-roadmaps',
        sort_order: 9,
      },
      {
        resource_type: 'course',
        title: 'Digital Product Management',
        source_name: 'University of Virginia / Coursera',
        meta: '4 weeks · audit free',
        url: 'https://www.coursera.org/learn/uva-darden-digital-product-management',
        sort_order: 10,
      },
      {
        resource_type: 'article',
        title: 'SaaS pricing models 101: how today\'s fastest-growing SaaS companies structure pricing',
        source_name: 'Stripe',
        meta: 'Guide',
        url: 'https://stripe.com/resources/more/saas-pricing-models-101',
        sort_order: 11,
      },
    ],
  },
];

export async function loadExploreIndustriesForApplicant(
  client: SupabaseClient | null,
): Promise<ExploreIndustry[]> {
  if (!client) return EXPLORE_INDUSTRIES_DEV_FALLBACK;
  try {
    const rows = await fetchExploreIndustriesBundle(client);
    return rows.length ? rows : EXPLORE_INDUSTRIES_DEV_FALLBACK;
  } catch (e) {
    console.error(
      '[CMe] explore industries load failed — showing SaaS-only demo fallback. If you use Supabase, apply migration grant_explore_catalog_to_authenticated (SELECT grants on explore_* tables).',
      e,
    );
    return EXPLORE_INDUSTRIES_DEV_FALLBACK;
  }
}
