/**
 * Insight Queries — All Supabase data fetching for insights
 * 
 * Promise.all on mount, no query logic in components.
 * All queries return typed data structures ready for charts and inference engine.
 * 
 * Six-dimension trait framework (Big Five / OCEAN + SDT):
 *   learning_velocity, ownership_follow_through, resilience,
 *   communication_confidence, relational_intelligence, motivational_fit
 * 
 * Motivational Fit has four sub-dimensions (Self-Determination Theory):
 *   mastery, impact, recognition, autonomy
 */

import { CandidateProfile } from '../../components/types/employer';

// ─── Trait Dimension Keys ───

export const TRAIT_DIMENSIONS = [
  'learning_velocity',
  'ownership_follow_through',
  'resilience',
  'communication_confidence',
  'relational_intelligence',
  'motivational_fit',
] as const;

export type TraitDimension = typeof TRAIT_DIMENSIONS[number];

export const MOTIVATIONAL_SUB_DIMENSIONS = ['mastery', 'impact', 'recognition', 'autonomy'] as const;
export type MotivationalSubDimension = typeof MOTIVATIONAL_SUB_DIMENSIONS[number];

// ─── Type Definitions ───

export interface EmployerWeights {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

export interface TraitScores {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

export interface HiredCandidate {
  candidate_id: number;
  name: string;
  role: string;
  match_score: number;
  hired_date: string;
  performance_rating?: number; // 1-5 scale
  departed?: boolean;
  departed_date?: string;
  traitScores: TraitScores;
  motivationalFitSubs?: {
    mastery: number;
    impact: number;
    recognition: number;
    autonomy: number;
  };
}

export interface TimeSeriesDataPoint {
  quarter: string;
  year: number;
  q: number;
  hires: number;
  departures: number;
  avgMatchScore: number;
  overdue?: number;
}

export interface CorrelationData {
  dimension: string;
  topPerformers: number[];
  midPerformers: number[];
  lowPerformers: number[];
}

export interface InsightData {
  employerWeights: EmployerWeights;
  hiredCandidates: HiredCandidate[];
  topPerformers: HiredCandidate[];
  allCandidates: CandidateProfile[];
  timeSeriesData: TimeSeriesDataPoint[];
  correlationData: CorrelationData[];
  snapshotCount: number;
  motivationalFitData: MotivationalFitHire[];
}

// ─── Motivational Fit Data ───

export interface MotivationalFitQuarter {
  quarter: string;
  mastery: number | null;
  impact: number | null;
  recognition: number | null;
  autonomy: number | null;
}

export interface MotivationalFitHire {
  candidate_id: number;
  name: string;
  role_type: string;
  hired_quarter: string;
  status: 'active' | 'departed';
  departed_quarter?: string;
  intake_baseline: { mastery: number; impact: number; recognition: number; autonomy: number };
  quarterly_scores: MotivationalFitQuarter[];
  overdue_quarter?: string;
  alignment_status: 'aligned' | 'watch' | 'at_risk' | 'departed';
}

// ─── Scoring Functions (from spec) ───

export function normalise(rawScore: number): number {
  return ((rawScore - 1) / 4) * 100;
}

export function computeDimensionScore(inputs: number[]): number {
  const mean = inputs.reduce((a, b) => a + b, 0) / inputs.length;
  return Math.round(normalise(mean) * 100) / 100;
}

export function computeMatchScore(
  candidateScores: Record<string, number>,
  weights: Record<string, number>
): number {
  return Object.keys(weights).reduce((sum, dim) => {
    return sum + (candidateScores[dim] * (weights[dim] / 100));
  }, 0);
}

// ─── Alignment Status Calculation ───

function calculateAlignmentStatus(
  intake: { mastery: number; impact: number; recognition: number; autonomy: number },
  latestScores: { mastery: number | null; impact: number | null; recognition: number | null; autonomy: number | null },
  status: 'active' | 'departed'
): 'aligned' | 'watch' | 'at_risk' | 'departed' {
  if (status === 'departed') return 'departed';

  const subs: MotivationalSubDimension[] = ['mastery', 'impact', 'recognition', 'autonomy'];
  let maxGap = 0;

  for (const sub of subs) {
    const score = latestScores[sub];
    if (score !== null) {
      const gap = Math.abs(intake[sub] - score);
      if (gap > maxGap) maxGap = gap;
    }
  }

  if (maxGap > 30) return 'at_risk';
  if (maxGap > 15) return 'watch';
  return 'aligned';
}

// ─── Mock Data Generation ───

/**
 * MOCK: Generates employer trait weightings
 * 100-point allocation across six dimensions. 5% minimum floor per dimension.
 */
function mockEmployerWeights(): EmployerWeights {
  return {
    learning_velocity: 22,
    ownership_follow_through: 20,
    resilience: 16,
    communication_confidence: 14,
    relational_intelligence: 15,
    motivational_fit: 13,
  };
}

/**
 * MOCK: Generates hired candidates with performance data
 * All traitScores on 0-100 normalised scale using the correct 6-dimension framework.
 */
function mockHiredCandidates(): HiredCandidate[] {
  return [
    {
      candidate_id: 101,
      name: 'Jordan Chen',
      role: 'Senior Product Designer',
      match_score: 94,
      hired_date: '2025-09-15',
      performance_rating: 5,
      departed: false,
      traitScores: {
        learning_velocity: 92,
        ownership_follow_through: 94,
        resilience: 85,
        communication_confidence: 88,
        relational_intelligence: 87,
        motivational_fit: 90,
      },
      motivationalFitSubs: { mastery: 85, impact: 90, recognition: 88, autonomy: 92 },
    },
    {
      candidate_id: 102,
      name: 'Riley Martinez',
      role: 'Lead UX Designer',
      match_score: 91,
      hired_date: '2025-08-22',
      performance_rating: 5,
      departed: false,
      traitScores: {
        learning_velocity: 86,
        ownership_follow_through: 83,
        resilience: 80,
        communication_confidence: 92,
        relational_intelligence: 91,
        motivational_fit: 85,
      },
      motivationalFitSubs: { mastery: 80, impact: 85, recognition: 92, autonomy: 86 },
    },
    {
      candidate_id: 103,
      name: 'Casey Wong',
      role: 'Lead Product Designer',
      match_score: 96,
      hired_date: '2025-07-10',
      performance_rating: 5,
      departed: false,
      traitScores: {
        learning_velocity: 90,
        ownership_follow_through: 96,
        resilience: 88,
        communication_confidence: 93,
        relational_intelligence: 92,
        motivational_fit: 94,
      },
      motivationalFitSubs: { mastery: 88, impact: 94, recognition: 93, autonomy: 90 },
    },
    {
      candidate_id: 104,
      name: 'Taylor Kim',
      role: 'Product Designer',
      match_score: 88,
      hired_date: '2025-10-05',
      performance_rating: 4,
      departed: false,
      traitScores: {
        learning_velocity: 89,
        ownership_follow_through: 90,
        resilience: 82,
        communication_confidence: 80,
        relational_intelligence: 84,
        motivational_fit: 88,
      },
      motivationalFitSubs: { mastery: 82, impact: 88, recognition: 80, autonomy: 89 },
    },
    {
      candidate_id: 105,
      name: 'Morgan Lee',
      role: 'Senior Designer',
      match_score: 92,
      hired_date: '2025-06-18',
      performance_rating: 4,
      departed: false,
      traitScores: {
        learning_velocity: 91,
        ownership_follow_through: 88,
        resilience: 78,
        communication_confidence: 85,
        relational_intelligence: 80,
        motivational_fit: 92,
      },
      motivationalFitSubs: { mastery: 78, impact: 92, recognition: 85, autonomy: 91 },
    },
    {
      candidate_id: 106,
      name: 'Sam Patel',
      role: 'Product Designer',
      match_score: 85,
      hired_date: '2025-11-20',
      performance_rating: 4,
      departed: false,
      traitScores: {
        learning_velocity: 87,
        ownership_follow_through: 85,
        resilience: 79,
        communication_confidence: 81,
        relational_intelligence: 82,
        motivational_fit: 83,
      },
      motivationalFitSubs: { mastery: 79, impact: 83, recognition: 81, autonomy: 87 },
    },
    {
      candidate_id: 107,
      name: 'Jamie Foster',
      role: 'Lead Designer',
      match_score: 93,
      hired_date: '2025-05-12',
      performance_rating: 5,
      departed: false,
      traitScores: {
        learning_velocity: 88,
        ownership_follow_through: 93,
        resilience: 84,
        communication_confidence: 90,
        relational_intelligence: 86,
        motivational_fit: 91,
      },
      motivationalFitSubs: { mastery: 84, impact: 91, recognition: 90, autonomy: 88 },
    },
    {
      candidate_id: 108,
      name: 'Alex Rivera',
      role: 'Senior UX Designer',
      match_score: 89,
      hired_date: '2025-04-03',
      performance_rating: 3,
      departed: false,
      traitScores: {
        learning_velocity: 84,
        ownership_follow_through: 80,
        resilience: 91,
        communication_confidence: 86,
        relational_intelligence: 89,
        motivational_fit: 82,
      },
      motivationalFitSubs: { mastery: 91, impact: 82, recognition: 86, autonomy: 84 },
    },
    {
      candidate_id: 109,
      name: 'Chris Anderson',
      role: 'Product Designer',
      match_score: 78,
      hired_date: '2025-12-01',
      performance_rating: 3,
      departed: false,
      traitScores: {
        learning_velocity: 80,
        ownership_follow_through: 78,
        resilience: 70,
        communication_confidence: 72,
        relational_intelligence: 76,
        motivational_fit: 75,
      },
      motivationalFitSubs: { mastery: 70, impact: 75, recognition: 72, autonomy: 80 },
    },
    {
      candidate_id: 110,
      name: 'Blake Thompson',
      role: 'Junior Designer',
      match_score: 72,
      hired_date: '2026-01-15',
      performance_rating: 2,
      departed: true,
      departed_date: '2026-03-01',
      traitScores: {
        learning_velocity: 75,
        ownership_follow_through: 70,
        resilience: 65,
        communication_confidence: 70,
        relational_intelligence: 72,
        motivational_fit: 68,
      },
      motivationalFitSubs: { mastery: 65, impact: 68, recognition: 70, autonomy: 75 },
    },
    {
      candidate_id: 111,
      name: 'Dana Brooks',
      role: 'Visual Designer',
      match_score: 68,
      hired_date: '2025-09-01',
      performance_rating: 2,
      departed: true,
      departed_date: '2025-12-15',
      traitScores: {
        learning_velocity: 62,
        ownership_follow_through: 58,
        resilience: 55,
        communication_confidence: 65,
        relational_intelligence: 60,
        motivational_fit: 57,
      },
      motivationalFitSubs: { mastery: 55, impact: 57, recognition: 65, autonomy: 60 },
    },
    {
      candidate_id: 112,
      name: 'Reese Nakamura',
      role: 'Product Designer',
      match_score: 65,
      hired_date: '2025-07-20',
      performance_rating: 2,
      departed: false,
      traitScores: {
        learning_velocity: 68,
        ownership_follow_through: 60,
        resilience: 58,
        communication_confidence: 62,
        relational_intelligence: 55,
        motivational_fit: 60,
      },
      motivationalFitSubs: { mastery: 58, impact: 60, recognition: 62, autonomy: 55 },
    },
    {
      candidate_id: 113,
      name: 'Skyler Odom',
      role: 'Junior UX Designer',
      match_score: 62,
      hired_date: '2025-11-10',
      performance_rating: 1,
      departed: true,
      departed_date: '2026-02-01',
      traitScores: {
        learning_velocity: 58,
        ownership_follow_through: 52,
        resilience: 50,
        communication_confidence: 55,
        relational_intelligence: 48,
        motivational_fit: 53,
      },
      motivationalFitSubs: { mastery: 50, impact: 53, recognition: 55, autonomy: 48 },
    },
  ];
}

/**
 * MOCK: Generates quarterly time series data
 */
function mockTimeSeriesData(): TimeSeriesDataPoint[] {
  return [
    { quarter: 'Q2 2025', year: 2025, q: 2, hires: 3, departures: 0, avgMatchScore: 93.7, overdue: 0 },
    { quarter: 'Q3 2025', year: 2025, q: 3, hires: 2, departures: 0, avgMatchScore: 92.5, overdue: 1 },
    { quarter: 'Q4 2025', year: 2025, q: 4, hires: 3, departures: 0, avgMatchScore: 88.3, overdue: 0 },
    { quarter: 'Q1 2026', year: 2026, q: 1, hires: 2, departures: 1, avgMatchScore: 75.0, overdue: 2 },
  ];
}

/**
 * Filters top performers (performance_rating >= 4)
 */
function filterTopPerformers(hired: HiredCandidate[]): HiredCandidate[] {
  return hired.filter(h => (h.performance_rating || 0) >= 4 && !h.departed);
}

/**
 * Generates correlation data grouped by performance band
 * Uses the correct 6-dimension framework keys.
 */
function generateCorrelationData(hired: HiredCandidate[]): CorrelationData[] {
  const topPerformers = hired.filter(h => (h.performance_rating || 0) === 5 && !h.departed);
  const midPerformers = hired.filter(h => (h.performance_rating || 0) >= 3 && (h.performance_rating || 0) < 5 && !h.departed);
  const lowPerformers = hired.filter(h => (h.performance_rating || 0) < 3 || h.departed);

  return TRAIT_DIMENSIONS.map(dimension => ({
    dimension,
    topPerformers: topPerformers.map(h => h.traitScores[dimension]),
    midPerformers: midPerformers.map(h => h.traitScores[dimension]),
    lowPerformers: lowPerformers.map(h => h.traitScores[dimension]),
  }));
}

/**
 * MOCK: Generates motivational fit data with REAL quarterly variance
 * Includes watch and at_risk statuses triggered by meaningful gaps.
 * 
 * Alignment logic (from spec):
 *   gap = intakeScore - normalisedPulseScore
 *   gap <= 15  → aligned   (green)
 *   gap 16-30  → watch     (amber)
 *   gap > 30   → at-risk   (red)
 */
function mockMotivationalFitData(): MotivationalFitHire[] {
  const hires: Omit<MotivationalFitHire, 'alignment_status'>[] = [
    {
      candidate_id: 101,
      name: 'Jordan Chen',
      role_type: 'Senior Product Designer',
      hired_quarter: 'Q2 2025',
      status: 'active',
      intake_baseline: { mastery: 85, impact: 90, recognition: 88, autonomy: 92 },
      quarterly_scores: [
        { quarter: 'Q2 2025', mastery: 83, impact: 88, recognition: 86, autonomy: 90 },
        { quarter: 'Q3 2025', mastery: 84, impact: 87, recognition: 85, autonomy: 91 },
        { quarter: 'Q4 2025', mastery: 86, impact: 89, recognition: 84, autonomy: 93 },
        { quarter: 'Q1 2026', mastery: 87, impact: 91, recognition: 86, autonomy: 94 },
      ],
    },
    {
      candidate_id: 102,
      name: 'Riley Martinez',
      role_type: 'Lead UX Designer',
      hired_quarter: 'Q2 2025',
      status: 'active',
      intake_baseline: { mastery: 80, impact: 85, recognition: 92, autonomy: 86 },
      quarterly_scores: [
        { quarter: 'Q2 2025', mastery: 78, impact: 82, recognition: 90, autonomy: 84 },
        { quarter: 'Q3 2025', mastery: 76, impact: 79, recognition: 75, autonomy: 82 },
        { quarter: 'Q4 2025', mastery: 74, impact: 76, recognition: 70, autonomy: 80 },
        { quarter: 'Q1 2026', mastery: 72, impact: 73, recognition: 65, autonomy: 78 },
      ],
    },
    {
      candidate_id: 103,
      name: 'Casey Wong',
      role_type: 'Lead Product Designer',
      hired_quarter: 'Q2 2025',
      status: 'active',
      intake_baseline: { mastery: 88, impact: 94, recognition: 93, autonomy: 90 },
      quarterly_scores: [
        { quarter: 'Q2 2025', mastery: 86, impact: 92, recognition: 91, autonomy: 88 },
        { quarter: 'Q3 2025', mastery: 87, impact: 93, recognition: 90, autonomy: 89 },
        { quarter: 'Q4 2025', mastery: 89, impact: 95, recognition: 92, autonomy: 91 },
        { quarter: 'Q1 2026', mastery: 90, impact: 96, recognition: 93, autonomy: 92 },
      ],
    },
    {
      candidate_id: 104,
      name: 'Taylor Kim',
      role_type: 'Product Designer',
      hired_quarter: 'Q3 2025',
      status: 'active',
      intake_baseline: { mastery: 82, impact: 88, recognition: 80, autonomy: 89 },
      quarterly_scores: [
        { quarter: 'Q3 2025', mastery: 80, impact: 85, recognition: 78, autonomy: 86 },
        { quarter: 'Q4 2025', mastery: 75, impact: 70, recognition: 72, autonomy: 68 },
        { quarter: 'Q1 2026', mastery: 70, impact: 65, recognition: 68, autonomy: 60 },
      ],
      overdue_quarter: 'Q1',
    },
    {
      candidate_id: 105,
      name: 'Morgan Lee',
      role_type: 'Senior Designer',
      hired_quarter: 'Q3 2025',
      status: 'active',
      intake_baseline: { mastery: 78, impact: 92, recognition: 85, autonomy: 91 },
      quarterly_scores: [
        { quarter: 'Q3 2025', mastery: 76, impact: 89, recognition: 83, autonomy: 88 },
        { quarter: 'Q4 2025', mastery: 77, impact: 88, recognition: 81, autonomy: 87 },
        { quarter: 'Q1 2026', mastery: 79, impact: 90, recognition: 82, autonomy: 89 },
      ],
    },
    {
      candidate_id: 106,
      name: 'Sam Patel',
      role_type: 'Product Designer',
      hired_quarter: 'Q3 2025',
      status: 'active',
      intake_baseline: { mastery: 79, impact: 83, recognition: 81, autonomy: 87 },
      quarterly_scores: [
        { quarter: 'Q3 2025', mastery: 77, impact: 80, recognition: 79, autonomy: 84 },
        { quarter: 'Q4 2025', mastery: 72, impact: 68, recognition: 65, autonomy: 70 },
        { quarter: 'Q1 2026', mastery: 68, impact: 62, recognition: 58, autonomy: 63 },
      ],
    },
    {
      candidate_id: 107,
      name: 'Jamie Foster',
      role_type: 'Lead Designer',
      hired_quarter: 'Q4 2025',
      status: 'active',
      intake_baseline: { mastery: 84, impact: 91, recognition: 90, autonomy: 88 },
      quarterly_scores: [
        { quarter: 'Q4 2025', mastery: 82, impact: 89, recognition: 88, autonomy: 86 },
        { quarter: 'Q1 2026', mastery: 83, impact: 90, recognition: 87, autonomy: 87 },
      ],
    },
    {
      candidate_id: 108,
      name: 'Alex Rivera',
      role_type: 'Senior UX Designer',
      hired_quarter: 'Q4 2025',
      status: 'active',
      intake_baseline: { mastery: 91, impact: 82, recognition: 86, autonomy: 84 },
      quarterly_scores: [
        { quarter: 'Q4 2025', mastery: 88, impact: 78, recognition: 82, autonomy: 80 },
        { quarter: 'Q1 2026', mastery: 85, impact: 74, recognition: 78, autonomy: 76 },
      ],
    },
    {
      candidate_id: 109,
      name: 'Chris Anderson',
      role_type: 'Product Designer',
      hired_quarter: 'Q4 2025',
      status: 'active',
      intake_baseline: { mastery: 70, impact: 75, recognition: 72, autonomy: 80 },
      quarterly_scores: [
        { quarter: 'Q4 2025', mastery: 65, impact: 68, recognition: 66, autonomy: 72 },
        { quarter: 'Q1 2026', mastery: 60, impact: 58, recognition: 55, autonomy: 62 },
      ],
    },
    {
      candidate_id: 110,
      name: 'Blake Thompson',
      role_type: 'Junior Designer',
      hired_quarter: 'Q1 2026',
      status: 'departed',
      departed_quarter: 'Q3 2026',
      intake_baseline: { mastery: 65, impact: 68, recognition: 70, autonomy: 75 },
      quarterly_scores: [
        { quarter: 'Q1 2026', mastery: 55, impact: 50, recognition: 48, autonomy: 52 },
        { quarter: 'Q2 2026', mastery: 45, impact: 40, recognition: 38, autonomy: 42 },
        { quarter: 'Q3 2026', mastery: 38, impact: 32, recognition: 30, autonomy: 35 },
      ],
    },
  ];

  // Calculate alignment status dynamically from intake vs latest quarterly
  return hires.map(hire => {
    const latest = hire.quarterly_scores[hire.quarterly_scores.length - 1];
    const alignment = calculateAlignmentStatus(hire.intake_baseline, latest, hire.status);
    return { ...hire, alignment_status: alignment };
  });
}

// ─── Main Data Fetching Function ───

/**
 * Fetches all insight data in parallel using Promise.all
 */
export async function fetchInsightData(employerId: number): Promise<InsightData> {
  try {
    const [employerWeights, hiredCandidates, timeSeriesData] = await Promise.all([
      Promise.resolve(mockEmployerWeights()),
      Promise.resolve(mockHiredCandidates()),
      Promise.resolve(mockTimeSeriesData()),
    ]);

    const topPerformers = filterTopPerformers(hiredCandidates);
    const correlationData = generateCorrelationData(hiredCandidates);
    const allCandidates: CandidateProfile[] = [];

    return {
      employerWeights,
      hiredCandidates,
      topPerformers,
      allCandidates,
      timeSeriesData,
      correlationData,
      snapshotCount: 18, // MOCK: State 3 (15+) — change to test states: 3 for State 1, 8 for State 2
      motivationalFitData: mockMotivationalFitData(),
    };
  } catch (error) {
    console.error('[insightQueries] Error fetching insight data:', error);
    throw error;
  }
}

/**
 * Fetches data for a specific section (lazy loading)
 */
export async function fetchSectionData(
  section: 'hiring-profile' | 'correlations' | 'pipeline' | 'motivational-fit',
  employerId: number
): Promise<Partial<InsightData>> {
  const fullData = await fetchInsightData(employerId);

  switch (section) {
    case 'hiring-profile':
      return {
        employerWeights: fullData.employerWeights,
        topPerformers: fullData.topPerformers,
        hiredCandidates: fullData.hiredCandidates,
      };
    case 'correlations':
      return { correlationData: fullData.correlationData };
    case 'pipeline':
      return { allCandidates: fullData.allCandidates };
    case 'motivational-fit':
      return { motivationalFitData: fullData.motivationalFitData };
    default:
      return fullData;
  }
}

// ─── Helper Functions ───

/**
 * Calculates average trait scores for a group of candidates
 * Uses the correct 6-dimension framework keys directly.
 */
export function calculateAverageTraitScores(
  candidates: HiredCandidate[]
): Record<string, number> {
  if (candidates.length === 0) return {};

  const averages: Record<string, number> = {};

  TRAIT_DIMENSIONS.forEach(dimension => {
    const scores = candidates.map(c => c.traitScores[dimension]);
    averages[dimension] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  });

  return averages;
}

/**
 * Groups candidates by performance rating
 */
export function groupByPerformance(
  candidates: HiredCandidate[]
): {
  top: HiredCandidate[];
  mid: HiredCandidate[];
  low: HiredCandidate[];
} {
  return {
    top: candidates.filter(c => (c.performance_rating || 0) === 5 && !c.departed),
    mid: candidates.filter(c => (c.performance_rating || 0) >= 3 && (c.performance_rating || 0) < 5 && !c.departed),
    low: candidates.filter(c => (c.performance_rating || 0) < 3 || c.departed),
  };
}