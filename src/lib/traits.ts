// ============================================================
// CMe Platform — Spec 1: Trait Helper Functions
// Version: v1.0
// Used across intake scoring, match scoring, and insight display.
// ============================================================
//
// NOTE: getActiveWeighting() uses the same direct-fetch pattern
// as the rest of this codebase (no @supabase/supabase-js client).
// When a real Supabase project is wired up, set VITE_SUPABASE_URL
// and VITE_SUPABASE_ANON_KEY in your .env file.
// ============================================================

import type {
  EmployerWeightings,
  EmployerTraitWeighting,
  MotivationalFitSubDimensions,
  TraitDimensions,
} from '../types/supabase';

// ─── Supabase REST helpers ───────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function supabaseGet<T>(
  table: string,
  query: string,
  authToken?: string
): Promise<T | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${query}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${authToken ?? SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) ? data[0] ?? null : data;
}

// ─── getActiveWeighting ──────────────────────────────────────
// Fetches the current active weighting for a business.
// A row is "active" when superseded_at IS NULL.

export async function getActiveWeighting(
  businessId: string,
  authToken?: string
): Promise<EmployerTraitWeighting | null> {
  return supabaseGet<EmployerTraitWeighting>(
    'employer_trait_weightings',
    `business_id=eq.${businessId}&superseded_at=is.null&limit=1`,
    authToken
  );
}

// ─── computeMotivationalFitAggregate ────────────────────────
// Computes the motivational_fit aggregate score from the four
// sub-dimensions. Result is rounded to the nearest integer.

export function computeMotivationalFitAggregate(
  scores: MotivationalFitSubDimensions
): number {
  const {
    motivational_fit_mastery,
    motivational_fit_impact,
    motivational_fit_recognition,
    motivational_fit_autonomy,
  } = scores;
  return Math.round(
    (motivational_fit_mastery +
      motivational_fit_impact +
      motivational_fit_recognition +
      motivational_fit_autonomy) /
      4
  );
}

// ─── validateWeightings ─────────────────────────────────────
// Returns true only if all six employer weightings sum to exactly 100.
// Each dimension must be >= 5 (enforced by DB constraint, checked here
// for client-side validation before saving).

export function validateWeightings(w: EmployerWeightings): boolean {
  const values = Object.values(w) as number[];
  if (values.some((v) => v < 5)) return false;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum === 100;
}

// ─── getDimensionHighlights ──────────────────────────────────
// Returns the top 2 and lowest dimension keys for a candidate.
// Used for summary display on profile cards and insight views.

export function getDimensionHighlights(scores: TraitDimensions): {
  top: (keyof TraitDimensions)[];
  lowest: keyof TraitDimensions;
} {
  const entries = Object.entries(scores) as [keyof TraitDimensions, number][];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  return {
    top: sorted.slice(0, 2).map(([k]) => k),
    lowest: sorted[sorted.length - 1][0],
  };
}

// ─── TRAIT DIMENSION LABELS ──────────────────────────────────
// Canonical plain-English labels for each trait key.
// Use these for display — never hard-code label strings elsewhere.

export const TRAIT_LABELS: Record<keyof TraitDimensions, string> = {
  learning_velocity:        'Learning Velocity',
  ownership_follow_through: 'Ownership & Follow-Through',
  resilience:               'Resilience',
  communication_confidence: 'Communication Confidence',
  relational_intelligence:  'Relational Intelligence',
  motivational_fit:         'Motivational Fit',
};

export const MOTIVATIONAL_FIT_SUB_LABELS: Record<
  keyof MotivationalFitSubDimensions,
  string
> = {
  motivational_fit_mastery:     'Motivational Fit — Mastery',
  motivational_fit_impact:      'Motivational Fit — Impact',
  motivational_fit_recognition: 'Motivational Fit — Recognition',
  motivational_fit_autonomy:    'Motivational Fit — Autonomy',
};

// ─── ORDERED DIMENSION KEYS ──────────────────────────────────
// Canonical order for rendering trait bars, tables, and charts.

export const TRAIT_DIMENSION_KEYS: (keyof TraitDimensions)[] = [
  'learning_velocity',
  'ownership_follow_through',
  'resilience',
  'communication_confidence',
  'relational_intelligence',
  'motivational_fit',
];

export const MOTIVATIONAL_FIT_SUB_KEYS: (keyof MotivationalFitSubDimensions)[] = [
  'motivational_fit_mastery',
  'motivational_fit_impact',
  'motivational_fit_recognition',
  'motivational_fit_autonomy',
];
