import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CorrelationData,
  EmployerWeights,
  HiredCandidate,
  InsightData,
  MotivationalFitHire,
  TimeSeriesDataPoint,
  TraitScores,
} from './insightQueries';
import {
  calculateAverageTraitScores,
  generateCorrelationData,
  TRAIT_DIMENSIONS,
} from './insightQueries';
import type { CandidateProfile } from '../components/types/employer';
import { mapDbStageToKanbanColumn, mapCandidateRowToUi } from './employerEngagements';
import { fetchCandidateProfileRows } from './candidateProfileFetch';

type HiredRow = {
  id: string;
  candidate_id: string;
  match_score: number | null;
  hired_at: string | null;
  updated_at: string;
  stage: string | null;
};

function traitScoresFromProfile(row: Record<string, unknown>): TraitScores {
  return {
    learning_velocity: (row.learning_velocity as number) ?? 0,
    ownership_follow_through: (row.ownership_follow_through as number) ?? 0,
    resilience: (row.resilience as number) ?? 0,
    communication_confidence: (row.communication_confidence as number) ?? 0,
    relational_intelligence: (row.relational_intelligence as number) ?? 0,
    motivational_fit: (row.motivational_fit as number) ?? 0,
  };
}

function performanceRatingFromBand(band: string | null, rating: number | null): number | undefined {
  if (rating != null) return rating;
  if (band === 'top') return 5;
  if (band === 'mid') return 3;
  if (band === 'low') return 2;
  return undefined;
}

function quarterLabel(iso: string): string {
  const d = new Date(iso);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}

export async function fetchEmployerInsightData(
  supabase: SupabaseClient,
  businessId: string,
  weights: EmployerWeights,
): Promise<InsightData> {
  const [{ data: hiredEngs }, { data: allEngs }, { data: snapshots }] = await Promise.all([
    supabase
      .from('engagements')
      .select('id, candidate_id, match_score, hired_at, updated_at, stage')
      .eq('business_id', businessId)
      .eq('stage', 'hired'),
    supabase
      .from('engagements')
      .select('id, candidate_id, match_score, stage, updated_at')
      .eq('business_id', businessId)
      .not('stage', 'in', '("rejected","closed")'),
    supabase
      .from('performance_snapshots')
      .select('engagement_id, performance_band, performance_rating, snapshot_day')
      .not('engagement_id', 'is', null),
  ]);

  const hiredList = (hiredEngs ?? []) as HiredRow[];
  const candidateIds = [...new Set(hiredList.map((e) => e.candidate_id))];
  const allCandidateIds = [...new Set((allEngs ?? []).map((e) => e.candidate_id as string))];
  const allIds = [...new Set([...candidateIds, ...allCandidateIds])];

  let profileMap = new Map<string, Record<string, unknown>>();
  if (allIds.length) {
    const { rows: profiles, error } = await fetchCandidateProfileRows(supabase, {
      ids: allIds,
    });
    if (error) {
      console.warn('[CMe] fetchEmployerInsightData candidate_profiles:', error);
    }
    profileMap = new Map(
      profiles.map((p) => [p.id, p as unknown as Record<string, unknown>]),
    );
  }

  const snapByEng = new Map<string, { band: string | null; rating: number | null }[]>();
  for (const s of snapshots ?? []) {
    const eid = s.engagement_id as string;
    const list = snapByEng.get(eid) ?? [];
    list.push({
      band: s.performance_band as string | null,
      rating: s.performance_rating as number | null,
    });
    snapByEng.set(eid, list);
  }

  const hiredCandidates: HiredCandidate[] = hiredList.map((eng) => {
    const prof = profileMap.get(eng.candidate_id) ?? {};
    const snaps = snapByEng.get(eng.id) ?? [];
    const topSnap = snaps.find((s) => s.band === 'top') ?? snaps[snaps.length - 1];
    const hiredDate = eng.hired_at ?? eng.updated_at;
    return {
      candidate_id: eng.candidate_id as unknown as number,
      name: (prof.full_name as string)?.trim() || 'Candidate',
      role: (prof.job_title as string)?.trim() || 'Role',
      match_score: eng.match_score ?? 0,
      hired_date: hiredDate,
      performance_rating: performanceRatingFromBand(topSnap?.band ?? null, topSnap?.rating ?? null),
      departed: false,
      traitScores: traitScoresFromProfile(prof),
      motivationalFitSubs: {
        mastery: (prof.motivational_fit_mastery as number) ?? 0,
        impact: (prof.motivational_fit_impact as number) ?? 0,
        recognition: (prof.motivational_fit_recognition as number) ?? 0,
        autonomy: (prof.motivational_fit_autonomy as number) ?? 0,
      },
    };
  });

  const topPerformers = hiredCandidates.filter((c) => (c.performance_rating ?? 0) >= 4);

  const allCandidates: CandidateProfile[] = (allEngs ?? []).map((eng) => {
    const prof = profileMap.get(eng.candidate_id as string) ?? { id: eng.candidate_id };
    const ui = mapCandidateRowToUi(
      prof as Parameters<typeof mapCandidateRowToUi>[0],
      {
        id: eng.id as string,
        stage: eng.stage as string | null,
        match_score: eng.match_score as number | null,
        updated_at: eng.updated_at as string,
      },
      weights,
    );
    return {
      ...ui,
      stage: mapDbStageToKanbanColumn(eng.stage as string | null),
    };
  });

  const snapshotCount = (snapshots ?? []).filter((s) =>
    hiredList.some((h) => h.id === s.engagement_id),
  ).length;

  const correlationData: CorrelationData[] = generateCorrelationData(hiredCandidates);

  const timeSeriesData = buildTimeSeries(hiredCandidates);

  const { data: pulseRows } = await supabase
    .from('motivational_pulse_checks')
    .select('engagement_id, quarter_label, mastery, impact, recognition, autonomy')
    .in(
      'engagement_id',
      hiredList.map((h) => h.id),
    );

  const motivationalFitData = buildMotivationalFitData(hiredList, profileMap, pulseRows ?? []);

  return {
    employerWeights: weights,
    hiredCandidates,
    topPerformers,
    allCandidates,
    timeSeriesData,
    correlationData,
    snapshotCount,
    motivationalFitData,
  };
}

function buildTimeSeries(hired: HiredCandidate[]): TimeSeriesDataPoint[] {
  const byQuarter = new Map<string, { hires: number; departures: number; scores: number[] }>();
  for (const h of hired) {
    const q = quarterLabel(h.hired_date);
    const entry = byQuarter.get(q) ?? { hires: 0, departures: 0, scores: [] };
    entry.hires += 1;
    entry.scores.push(h.match_score);
    if (h.departed) entry.departures += 1;
    byQuarter.set(q, entry);
  }
  return [...byQuarter.entries()].map(([quarter, data]) => {
    const [qLabel, yearStr] = quarter.split(' ');
    const qNum = parseInt(qLabel.replace('Q', ''), 10);
    const avgMatchScore =
      data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0;
    return {
      quarter,
      year: parseInt(yearStr, 10),
      q: qNum,
      hires: data.hires,
      departures: data.departures,
      avgMatchScore,
    };
  });
}

function buildMotivationalFitData(
  hiredEngs: HiredRow[],
  profileMap: Map<string, Record<string, unknown>>,
  pulseRows: Array<{
    engagement_id: string;
    quarter_label: string;
    mastery: number | null;
    impact: number | null;
    recognition: number | null;
    autonomy: number | null;
  }>,
): MotivationalFitHire[] {
  return hiredEngs.map((eng) => {
    const prof = profileMap.get(eng.candidate_id) ?? {};
    const intake = {
      mastery: (prof.motivational_fit_mastery as number) ?? 0,
      impact: (prof.motivational_fit_impact as number) ?? 0,
      recognition: (prof.motivational_fit_recognition as number) ?? 0,
      autonomy: (prof.motivational_fit_autonomy as number) ?? 0,
    };
    const pulses = pulseRows.filter((p) => p.engagement_id === eng.id);
    const quarterly_scores = pulses.map((p) => ({
      quarter: p.quarter_label,
      mastery: p.mastery,
      impact: p.impact,
      recognition: p.recognition,
      autonomy: p.autonomy,
    }));
    return {
      candidate_id: eng.candidate_id as unknown as number,
      name: (prof.full_name as string)?.trim() || 'Candidate',
      role_type: (prof.job_title as string)?.trim() || 'Role',
      hired_quarter: quarterLabel(eng.hired_at ?? eng.updated_at),
      status: 'active' as const,
      intake_baseline: intake,
      quarterly_scores,
      alignment_status: 'aligned' as const,
    };
  });
}

export { TRAIT_DIMENSIONS, calculateAverageTraitScores };
