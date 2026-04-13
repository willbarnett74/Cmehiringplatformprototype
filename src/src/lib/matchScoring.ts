/**
 * Match Scoring Library
 * 
 * Computes match scores between candidates and employers based on dimensional alignment.
 * This module provides the core algorithm for CMe's trait-based matching.
 * 
 * Uses the correct 6-dimension trait framework:
 *   learning_velocity, ownership_follow_through, resilience,
 *   communication_confidence, relational_intelligence, motivational_fit
 * 
 * Score computation (from spec):
 *   function computeMatchScore(candidateScores, weights) {
 *     return Object.keys(weights).reduce((sum, dim) => {
 *       return sum + (candidateScores[dim] * (weights[dim] / 100));
 *     }, 0);
 *   }
 * 
 * Scoring triggered as Supabase Edge Function when intake_status = 'complete'.
 */

// ─── Type Definitions ───

export interface CandidateDimensionScores {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

export interface EmployerWeights {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

export interface MatchScoreResult {
  matchScore: number;           // 0-100
  dimensionScores: {
    dimension: string;
    candidateScore: number;
    weight: number;
    weighted: number;
  }[];
  traitHealthIndicators: {
    dimension: string;
    score: number;
    health: 'high' | 'medium' | 'low';
  }[];
}

// ─── Normalization Helpers ───

/**
 * Normalizes a raw score from 1-5 scale to 0-100 (from spec)
 */
export function normaliseRaw(rawScore: number): number {
  return ((rawScore - 1) / 4) * 100;
}

/**
 * Normalizes a value from input range to 0-100
 */
export function normalize(value: number, min: number = 0, max: number = 100): number {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Ensures all weights sum to 100 (or normalizes if they don't).
 * Spec: 5% minimum floor per dimension, total must = 100.
 */
export function normalizeWeights(weights: EmployerWeights): EmployerWeights {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  if (total === 0) {
    return {
      learning_velocity: 17,
      ownership_follow_through: 17,
      resilience: 17,
      communication_confidence: 17,
      relational_intelligence: 16,
      motivational_fit: 16,
    };
  }

  if (Math.abs(total - 100) < 0.01) {
    return weights;
  }

  const scale = 100 / total;
  return {
    learning_velocity: weights.learning_velocity * scale,
    ownership_follow_through: weights.ownership_follow_through * scale,
    resilience: weights.resilience * scale,
    communication_confidence: weights.communication_confidence * scale,
    relational_intelligence: weights.relational_intelligence * scale,
    motivational_fit: weights.motivational_fit * scale,
  };
}

// ─── Dimension Score Computation ───

const DIMENSION_KEYS: (keyof CandidateDimensionScores)[] = [
  'learning_velocity',
  'ownership_follow_through',
  'resilience',
  'communication_confidence',
  'relational_intelligence',
  'motivational_fit',
];

/**
 * Computes weighted match score between candidate and employer.
 * Direct alignment — no mapping needed, same 6-dimension keys on both sides.
 */
export function computeMatchScore(
  candidateScores: CandidateDimensionScores,
  employerWeights: EmployerWeights
): MatchScoreResult {
  const normalizedWeights = normalizeWeights(employerWeights);

  let weightedSum = 0;
  const dimensionScores: MatchScoreResult['dimensionScores'] = [];
  const traitHealthIndicators: MatchScoreResult['traitHealthIndicators'] = [];

  for (const dim of DIMENSION_KEYS) {
    const weight = normalizedWeights[dim];
    const candidateScore = candidateScores[dim] || 0;
    const normalizedCandidateScore = normalize(candidateScore, 0, 100);

    const weighted = (normalizedCandidateScore * weight) / 100;
    weightedSum += weighted;

    dimensionScores.push({
      dimension: dim,
      candidateScore: normalizedCandidateScore,
      weight,
      weighted,
    });

    const health = getTraitHealth(normalizedCandidateScore);
    traitHealthIndicators.push({
      dimension: dim,
      score: normalizedCandidateScore,
      health,
    });
  }

  const matchScore = Math.round(weightedSum * 10) / 10;

  return {
    matchScore,
    dimensionScores,
    traitHealthIndicators,
  };
}

/**
 * Determines trait health category based on score thresholds
 */
export function getTraitHealth(score: number): 'high' | 'medium' | 'low' {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/**
 * Returns color class for trait health indicator dot
 */
export function getTraitHealthColor(health: 'high' | 'medium' | 'low'): string {
  switch (health) {
    case 'high':
      return 'bg-[#10B981]'; // Green
    case 'medium':
      return 'bg-[#F59E0B]'; // Amber
    case 'low':
      return 'bg-[#EF4444]'; // Red
  }
}

// ─── Mock Supabase Edge Function Trigger ───

/**
 * MOCK: Simulates the Supabase Edge Function that triggers when intake_status = 'complete'
 */
export async function mockEdgeFunctionTrigger(
  candidateId: number,
  employerId: number
): Promise<{ success: boolean; matchScore: number; message: string }> {
  try {
    const mockCandidateScores: CandidateDimensionScores = {
      learning_velocity: 91,
      ownership_follow_through: 85,
      resilience: 82,
      communication_confidence: 88,
      relational_intelligence: 79,
      motivational_fit: 75,
    };

    const mockEmployerWeights: EmployerWeights = {
      learning_velocity: 20,
      ownership_follow_through: 18,
      resilience: 15,
      communication_confidence: 17,
      relational_intelligence: 15,
      motivational_fit: 15,
    };

    const result = computeMatchScore(mockCandidateScores, mockEmployerWeights);

    console.log(`[Edge Function Mock] Computed match score for candidate ${candidateId}:`, result.matchScore);

    return {
      success: true,
      matchScore: result.matchScore,
      message: `Match score computed: ${result.matchScore}%`,
    };
  } catch (error) {
    console.error('[Edge Function Mock] Error:', error);
    return {
      success: false,
      matchScore: 0,
      message: 'Failed to compute match score',
    };
  }
}

// ─── Utility Functions ───

/**
 * Generates mock candidate dimension scores for testing
 */
export function generateMockCandidateScores(): CandidateDimensionScores {
  return {
    learning_velocity: Math.floor(Math.random() * 40) + 60,
    ownership_follow_through: Math.floor(Math.random() * 40) + 60,
    resilience: Math.floor(Math.random() * 40) + 60,
    communication_confidence: Math.floor(Math.random() * 40) + 60,
    relational_intelligence: Math.floor(Math.random() * 40) + 60,
    motivational_fit: Math.floor(Math.random() * 40) + 60,
  };
}

/**
 * Generates mock employer weights for testing
 */
export function generateMockEmployerWeights(): EmployerWeights {
  const weights = [15, 15, 15, 20, 20, 15]; // Sum to 100
  const shuffled = weights.sort(() => Math.random() - 0.5);

  return {
    learning_velocity: shuffled[0],
    ownership_follow_through: shuffled[1],
    resilience: shuffled[2],
    communication_confidence: shuffled[3],
    relational_intelligence: shuffled[4],
    motivational_fit: shuffled[5],
  };
}

// ─── Spec 5: Exported scoring functions ─────────────────────

export type DimensionFlag = {
  key: keyof CandidateDimensionScores;
  label: string;
  value: number;
};

/** Averages the four motivational fit sub-dimensions into a single composite score. */
export function computeMotivationalFit(scores: {
  motivational_fit_mastery: number;
  motivational_fit_impact: number;
  motivational_fit_recognition: number;
  motivational_fit_autonomy: number;
}): number {
  return (
    scores.motivational_fit_mastery +
    scores.motivational_fit_impact +
    scores.motivational_fit_recognition +
    scores.motivational_fit_autonomy
  ) / 4;
}

/** Computes weighted match score as a single 0–100 number. */
export function computeMatchScoreSimple(
  candidate: CandidateDimensionScores,
  weights: EmployerWeights
): number {
  const weighted =
    (candidate.learning_velocity * weights.learning_velocity / 100) +
    (candidate.ownership_follow_through * weights.ownership_follow_through / 100) +
    (candidate.resilience * weights.resilience / 100) +
    (candidate.communication_confidence * weights.communication_confidence / 100) +
    (candidate.relational_intelligence * weights.relational_intelligence / 100) +
    (candidate.motivational_fit * weights.motivational_fit / 100);
  return Math.round(weighted * 100) / 100;
}

/**
 * Returns the top 2 strongest and 1 weakest dimensions for a candidate-employer pair.
 * Ranking is by weighted contribution (score × weight / 100), not raw score.
 */
export function getDimensionFlags(
  candidate: CandidateDimensionScores,
  weights: EmployerWeights
): { strongest: DimensionFlag[]; weakest: DimensionFlag } {
  const contributions: DimensionFlag[] = [
    { key: 'learning_velocity',        label: 'Learning Velocity',       value: candidate.learning_velocity * weights.learning_velocity / 100 },
    { key: 'ownership_follow_through', label: 'Ownership',               value: candidate.ownership_follow_through * weights.ownership_follow_through / 100 },
    { key: 'resilience',               label: 'Resilience',              value: candidate.resilience * weights.resilience / 100 },
    { key: 'communication_confidence', label: 'Communication',           value: candidate.communication_confidence * weights.communication_confidence / 100 },
    { key: 'relational_intelligence',  label: 'Relational Intelligence', value: candidate.relational_intelligence * weights.relational_intelligence / 100 },
    { key: 'motivational_fit',         label: 'Motivational Fit',        value: candidate.motivational_fit * weights.motivational_fit / 100 },
  ].sort((a, b) => b.value - a.value);

  return {
    strongest: contributions.slice(0, 2),
    weakest: contributions[contributions.length - 1],
  };
}
