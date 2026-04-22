/**
 * CMe Intake Scoring — aggregates per-question `scores` / `llm_scores` from Sections 2–6
 * (same rules as the compute-intake-scores edge function).
 */

export type { DimensionScores } from './intakeScoreAggregate';
export {
  DIMENSION_KEYS,
  emptyDimensionInputs,
  ingestPayloadIntoBuckets,
  dimensionScoresFromInputs,
  computeMotivationalFitAverage,
} from './intakeScoreAggregate';

import {
  emptyDimensionInputs,
  ingestPayloadIntoBuckets,
  dimensionScoresFromInputs,
  type DimensionScores,
} from './intakeScoreAggregate';

export interface IntakeResponses {
  section2?: Record<string, unknown>;
  section3?: Record<string, unknown>;
  section4?: Record<string, unknown>;
  section5?: Record<string, unknown>;
  section6?: Record<string, unknown>;
}

function collectPayloadsFromIntakeResponses(responses: IntakeResponses): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const key of ['section2', 'section3', 'section4', 'section5', 'section6'] as const) {
    const sec = responses[key];
    if (!sec || typeof sec !== 'object') continue;
    for (const val of Object.values(sec)) {
      if (val && typeof val === 'object' && val !== null && 'question_key' in val) {
        out.push(val as Record<string, unknown>);
      }
    }
  }
  return out;
}

export function computeIntakeScores(responses: IntakeResponses): DimensionScores {
  const inputs = emptyDimensionInputs();
  for (const payload of collectPayloadsFromIntakeResponses(responses)) {
    ingestPayloadIntoBuckets(payload, inputs);
  }
  return dimensionScoresFromInputs(inputs);
}

export function formatScoreForDisplay(score: number): string {
  return score.toFixed(1);
}

export function getScoreCategory(score: number): 'Low' | 'Medium' | 'High' {
  if (score < 33.3) return 'Low';
  if (score < 66.7) return 'Medium';
  return 'High';
}
