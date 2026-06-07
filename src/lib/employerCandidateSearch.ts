import type { SupabaseClient } from '@supabase/supabase-js';
import type { Candidate } from '../components/types/employer';
import { computeMatchScore, type EmployerWeights } from './matchScoring';
import { mapCandidateRowToUi } from './employerEngagements';
import { fetchCandidateProfileRows } from './candidateProfileFetch';

export type CandidateSearchFilters = {
  location?: string | null;
  level?: string | null;
  traitKeywords?: string[];
};

/** Marketplace pool: candidate profiles visible to employers (RLS + exclude hidden). */
export async function fetchPublishedCandidates(
  supabase: SupabaseClient,
  businessId: string | null,
  weights: EmployerWeights | null,
): Promise<Candidate[]> {
  const engagedPromise = businessId
    ? supabase.from('engagements').select('candidate_id').eq('business_id', businessId)
    : Promise.resolve({ data: [] as { candidate_id: string }[], error: null });

  const [{ rows: profiles, error: pErr }, { data: engaged, error: eErr }] = await Promise.all([
    fetchCandidateProfileRows(supabase),
    engagedPromise,
  ]);

  if (pErr) {
    console.warn('[CMe] fetchPublishedCandidates:', pErr);
    return [];
  }
  if (eErr) {
    console.warn('[CMe] fetchPublishedCandidates engagements:', eErr.message);
    return [];
  }

  const engagedIds = new Set((engaged ?? []).map((e) => e.candidate_id as string));

  return profiles
    .filter((p) => p.status !== 'hidden')
    .filter((p) => !engagedIds.has(p.id))
    .map((row) => mapCandidateRowToUi(row, null, weights));
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
