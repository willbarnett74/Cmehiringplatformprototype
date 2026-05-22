import type { SupabaseClient } from '@supabase/supabase-js';
import type { Candidate } from '../components/types/employer';
import { computeMatchScore, type EmployerWeights } from './matchScoring';
import { mapCandidateRowToUi } from './employerEngagements';

type SearchRow = {
  id: string;
  full_name: string | null;
  job_title: string | null;
  location: string | null;
  availability: string | null;
  notice_period: string | null;
  seniority: string | null;
  learning_velocity: number | null;
  ownership_follow_through: number | null;
  resilience: number | null;
  communication_confidence: number | null;
  relational_intelligence: number | null;
  motivational_fit: number | null;
  motivational_fit_mastery: number | null;
  motivational_fit_impact: number | null;
  motivational_fit_recognition: number | null;
  motivational_fit_autonomy: number | null;
};

export type CandidateSearchFilters = {
  location?: string | null;
  level?: string | null;
  traitKeywords?: string[];
};

export async function fetchPublishedCandidates(
  supabase: SupabaseClient,
  businessId: string,
  weights: EmployerWeights | null,
): Promise<Candidate[]> {
  const [{ data: profiles, error: pErr }, { data: engaged, error: eErr }] = await Promise.all([
    supabase
      .from('candidate_profiles')
      .select(
        'id, full_name, job_title, location, seniority, availability, notice_period, learning_velocity, ownership_follow_through, resilience, communication_confidence, relational_intelligence, motivational_fit, motivational_fit_mastery, motivational_fit_impact, motivational_fit_recognition, motivational_fit_autonomy',
      )
      .eq('status', 'published'),
    supabase.from('engagements').select('candidate_id').eq('business_id', businessId),
  ]);

  if (pErr) throw pErr;
  if (eErr) throw eErr;

  const engagedIds = new Set((engaged ?? []).map((e) => e.candidate_id as string));

  return (profiles ?? [])
    .filter((p) => !engagedIds.has(p.id as string))
    .map((row) =>
      mapCandidateRowToUi(row as SearchRow, null, weights),
    );
}

export function filterCandidates(
  candidates: Candidate[],
  filters: CandidateSearchFilters,
): Candidate[] {
  let result = candidates;
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    result = result.filter((c) => c.location.toLowerCase().includes(loc));
  }
  if (filters.level) {
    const lvl = filters.level.toLowerCase();
    result = result.filter((c) => c.level.toLowerCase().includes(lvl));
  }
  if (filters.traitKeywords?.length) {
    const keys = filters.traitKeywords.map((t) => t.toLowerCase());
    result = result.filter((c) =>
      c.traits.some((t) => keys.some((k) => t.toLowerCase().includes(k))),
    );
  }
  return result.sort((a, b) => b.score - a.score);
}

export function computeCandidateMatchScore(
  candidate: Candidate,
  weights: EmployerWeights,
): number {
  if (!candidate.dimensionScores) return candidate.score;
  return Math.round(computeMatchScore(candidate.dimensionScores, weights).matchScore);
}
