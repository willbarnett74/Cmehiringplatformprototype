/**
 * Supabase Edge Function: compute-intake-scores — Spec 4
 *
 * Triggered when intake_status is set to 'complete' on candidate_profiles.
 * Reads all intake_responses for the candidate, aggregates scores per trait
 * dimension, normalises to 0–100, and writes back to candidate_profiles.
 *
 * Trigger: Database webhook on candidate_profiles UPDATE where
 *   NEW.intake_status = 'complete' AND OLD.intake_status != 'complete'
 *
 * Request body (from webhook):
 *   { type: 'UPDATE'; record: { user_id: string; ... } }
 *
 * Setup:
 *   supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
 */

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalise a raw 1–5 mean to a 0–100 score
function normalise(rawScore: number): number {
  return Math.round(((rawScore - 1) / 4) * 100 * 100) / 100;
}

function computeDimensionScore(inputs: number[]): number | null {
  if (inputs.length === 0) return null;
  const mean = inputs.reduce((a, b) => a + b, 0) / inputs.length;
  return normalise(mean);
}

// Dimension keys we write back to candidate_profiles
const DIMENSION_KEYS = [
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

type DimensionKey = typeof DIMENSION_KEYS[number];

// LLM rubric score → dimension mapping
const LLM_SCORE_DIMENSION_MAP: Record<string, DimensionKey> = {
  // S3Q3
  clarity_of_reasoning: 'learning_velocity',
  handling_ambiguity: 'learning_velocity',
  initiative_and_ownership: 'ownership_follow_through',
  communication_intent: 'communication_confidence',
  // S5Q6
  empathy_perspective_taking: 'relational_intelligence',
  outcome_orientation: 'ownership_follow_through',
  self_awareness: 'relational_intelligence',
  communication_approach: 'communication_confidence',
  // S6Q6
  intrinsic_vs_extrinsic_language: 'motivational_fit_mastery',
  self_awareness_quality: 'learning_velocity',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as { record?: { user_id?: string } };
    const userId = payload?.record?.user_id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id missing from payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Fetch candidate_id from profile
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/candidate_profiles?user_id=eq.${userId}&select=id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const profiles = await profileRes.json() as Array<{ id: string }>;
    if (!profiles.length) throw new Error(`No profile found for user_id ${userId}`);
    const candidateId = profiles[0].id;

    // Fetch all intake_responses for this candidate
    const responsesRes = await fetch(
      `${supabaseUrl}/rest/v1/intake_responses?candidate_id=eq.${candidateId}&select=question_key,response_value`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const rows = await responsesRes.json() as Array<{ question_key: string; response_value: string }>;

    // Accumulate score inputs per dimension
    const inputs: Record<DimensionKey, number[]> = Object.fromEntries(
      DIMENSION_KEYS.map((k) => [k, []])
    ) as Record<DimensionKey, number[]>;

    let optionalFieldsCompleted = false;

    for (const row of rows) {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(row.response_value);
      } catch {
        continue;
      }

      // Structured option scores
      const scores = parsed.scores as Record<string, number> | undefined;
      if (scores) {
        for (const [dim, val] of Object.entries(scores)) {
          if (DIMENSION_KEYS.includes(dim as DimensionKey) && typeof val === 'number') {
            inputs[dim as DimensionKey].push(val);
          }
        }
      }

      // LLM rubric scores (S3Q3, S5Q6, S6Q6)
      const llmScores = parsed.llm_scores as Record<string, number> | undefined;
      if (llmScores) {
        for (const [rubricKey, val] of Object.entries(llmScores)) {
          const dim = LLM_SCORE_DIMENSION_MAP[rubricKey];
          if (dim && typeof val === 'number') {
            inputs[dim].push(val);
          }
        }
      }

      // Conscientiousness signal: S8 optional fields
      if (['S8Q2', 'S8Q3', 'S8Q4'].includes(row.question_key)) {
        const narrative = parsed.narrative as string | undefined;
        const testimonial = parsed.testimonial as unknown;
        if (narrative || testimonial) optionalFieldsCompleted = true;
      }
    }

    // Compute final scores
    const computed: Partial<Record<DimensionKey, number>> = {};
    for (const dim of DIMENSION_KEYS) {
      const score = computeDimensionScore(inputs[dim]);
      if (score !== null) computed[dim] = score;
    }

    // Write scores back to candidate_profiles
    await fetch(
      `${supabaseUrl}/rest/v1/candidate_profiles?user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ ...computed, optional_fields_completed: optionalFieldsCompleted }),
      }
    );

    return new Response(JSON.stringify({ success: true, scores: computed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('compute-intake-scores error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
