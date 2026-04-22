/**
 * Shared dimension aggregation: collects per-question `scores` and `llm_scores`
 * from intake JSON payloads, then maps to 0–100.
 *
 * Each dimension pools many raw 1–5 values across sections. A plain mean pulls almost
 * everyone into the ~40–65 band (“no strengths”). We blend the pooled mean with the
 * strongest single signal so clear highs can surface (used by client + edge).
 *
 * Weights + calibration are tuned so random / undifferentiated profiles rarely land
 * 6–7 dimensions in the “high” band; expect ~2–3 stronger dimensions with more mixed lows.
 */

export interface DimensionScores {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit_mastery: number;
  motivational_fit_impact: number;
  motivational_fit_recognition: number;
  motivational_fit_autonomy: number;
}

export const DIMENSION_KEYS = [
  'learning_velocity',
  'ownership_follow_through',
  'resilience',
  'communication_confidence',
  'relational_intelligence',
  'motivational_fit_mastery',
  'motivational_fit_impact',
  'motivational_fit_recognition',
  'motivational_fit_autonomy',
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export const LLM_SCORE_DIMENSION_MAP: Record<string, DimensionKey> = {
  clarity_of_reasoning: 'learning_velocity',
  handling_ambiguity: 'learning_velocity',
  initiative_and_ownership: 'ownership_follow_through',
  communication_intent: 'communication_confidence',
  empathy_perspective_taking: 'relational_intelligence',
  outcome_orientation: 'ownership_follow_through',
  self_awareness: 'relational_intelligence',
  communication_approach: 'communication_confidence',
  intrinsic_vs_extrinsic_language: 'motivational_fit_mastery',
  self_awareness_quality: 'learning_velocity',
};

/** Weight on pooled mean vs strongest raw tick (both mapped to 0–100). Must sum to 1. */
const DIMENSION_SCORE_MEAN_WEIGHT = 0.78;
const DIMENSION_SCORE_PEAK_WEIGHT = 0.22;

/** Pivot calibration: compress everything above 50, expand slightly below 50 (caps at 0–100). */
const CALIBRATE_HIGH_SHRINK = 0.7;
const CALIBRATE_LOW_STRETCH = 1.08;

function raw1to5ToScale(raw: number): number {
  const c = Math.min(5, Math.max(1, raw));
  return Math.round(((c - 1) / 4) * 100 * 100) / 100;
}

function calibrateBlendedScore(blended: number): number {
  const pivot = 50;
  let out: number;
  if (blended >= pivot) {
    out = pivot + (blended - pivot) * CALIBRATE_HIGH_SHRINK;
  } else {
    out = pivot - (pivot - blended) * CALIBRATE_LOW_STRETCH;
  }
  return Math.round(Math.min(100, Math.max(0, out)) * 100) / 100;
}

/** @deprecated Use raw1to5ToScale via computeDimensionScoreFromInputs; kept for callers/tests. */
export function normaliseRawMeanToScale(mean: number): number {
  return raw1to5ToScale(mean);
}

export function computeDimensionScoreFromInputs(inputs: number[]): number | null {
  if (inputs.length === 0) return null;
  const mean = inputs.reduce((a, b) => a + b, 0) / inputs.length;
  const peak = Math.max(...inputs);
  const blended =
    DIMENSION_SCORE_MEAN_WEIGHT * raw1to5ToScale(mean) + DIMENSION_SCORE_PEAK_WEIGHT * raw1to5ToScale(peak);
  return calibrateBlendedScore(blended);
}

export function emptyDimensionInputs(): Record<DimensionKey, number[]> {
  return Object.fromEntries(DIMENSION_KEYS.map((k) => [k, [] as number[]])) as unknown as Record<DimensionKey, number[]>;
}

export function ingestPayloadIntoBuckets(
  parsed: Record<string, unknown>,
  inputs: Record<DimensionKey, number[]>,
): void {
  const scores = parsed.scores as Record<string, number> | undefined;
  if (scores) {
    for (const [dim, val] of Object.entries(scores)) {
      if (DIMENSION_KEYS.includes(dim as DimensionKey) && typeof val === 'number') {
        inputs[dim as DimensionKey].push(val);
      }
    }
  }

  const llmScores = parsed.llm_scores as Record<string, number> | undefined;
  if (llmScores) {
    for (const [rubricKey, val] of Object.entries(llmScores)) {
      const dim = LLM_SCORE_DIMENSION_MAP[rubricKey];
      if (dim && typeof val === 'number') {
        inputs[dim].push(val);
      }
    }
  }
}

/**
 * Fill missing dimensions so the UI always gets nine numbers after intake.
 * Uses the mean of computed dimensions, or 50 if none.
 */
export function finalizeDimensionScores(partial: Partial<Record<DimensionKey, number>>): DimensionScores {
  const present = DIMENSION_KEYS.map((k) => partial[k]).filter((v): v is number => typeof v === 'number');
  const fallback =
    present.length > 0 ? Math.round(present.reduce((a, b) => a + b, 0) / present.length) : 50;
  return {
    learning_velocity: partial.learning_velocity ?? fallback,
    ownership_follow_through: partial.ownership_follow_through ?? fallback,
    resilience: partial.resilience ?? fallback,
    communication_confidence: partial.communication_confidence ?? fallback,
    relational_intelligence: partial.relational_intelligence ?? fallback,
    motivational_fit_mastery: partial.motivational_fit_mastery ?? fallback,
    motivational_fit_impact: partial.motivational_fit_impact ?? fallback,
    motivational_fit_recognition: partial.motivational_fit_recognition ?? fallback,
    motivational_fit_autonomy: partial.motivational_fit_autonomy ?? fallback,
  };
}

export function computeMotivationalFitAverage(scores: DimensionScores): number {
  const subs = [
    scores.motivational_fit_mastery,
    scores.motivational_fit_impact,
    scores.motivational_fit_recognition,
    scores.motivational_fit_autonomy,
  ];
  return Math.round(subs.reduce((a, b) => a + b, 0) / subs.length);
}

export function dimensionScoresFromInputs(inputs: Record<DimensionKey, number[]>): DimensionScores {
  const partial: Partial<Record<DimensionKey, number>> = {};
  for (const dim of DIMENSION_KEYS) {
    const s = computeDimensionScoreFromInputs(inputs[dim]);
    if (s !== null) partial[dim] = s;
  }
  return finalizeDimensionScores(partial);
}
