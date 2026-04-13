/**
 * Supabase Edge Function: compute-intake-scores — Spec 4
 *
 * Trigger when applicant_profiles.intake_complete becomes true (Database Webhook on UPDATE).
 * Reads intake_responses for that applicant, aggregates scores, writes applicant_trait_scores
 * and optional_fields_completed on applicant_profiles.
 *
 * Request body (from webhook):
 *   { type: 'UPDATE'; record: { id: string; user_id: string; intake_complete?: boolean; ... } }
 */

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function normalise(rawScore: number): number {
  return Math.round(((rawScore - 1) / 4) * 100 * 100) / 100;
}

function computeDimensionScore(inputs: number[]): number | null {
  if (inputs.length === 0) return null;
  const mean = inputs.reduce((a, b) => a + b, 0) / inputs.length;
  return normalise(mean);
}

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

type DimensionKey = (typeof DIMENSION_KEYS)[number];

const LLM_SCORE_DIMENSION_MAP: Record<string, DimensionKey> = {
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as {
      record?: { id?: string; user_id?: string; intake_complete?: boolean };
      old_record?: { intake_complete?: boolean };
    };

    const applicantProfileId = payload?.record?.id;
    const userId = payload?.record?.user_id;
    const nowComplete = payload?.record?.intake_complete === true;
    const wasComplete = payload?.old_record?.intake_complete === true;

    if (!applicantProfileId || !userId) {
      return new Response(JSON.stringify({ error: 'applicant profile id or user_id missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!nowComplete || wasComplete) {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    };

    const responsesRes = await fetch(
      `${supabaseUrl}/rest/v1/intake_responses?applicant_id=eq.${applicantProfileId}&select=question_id,response_value`,
      { headers },
    );
    const rows = (await responsesRes.json()) as Array<{ question_id: string; response_value: string | null }>;

    const inputs: Record<DimensionKey, number[]> = Object.fromEntries(
      DIMENSION_KEYS.map((k) => [k, []]),
    ) as Record<DimensionKey, number[]>;

    let optionalFieldsCompleted = false;

    for (const row of rows) {
      if (!row.response_value) continue;
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(row.response_value);
      } catch {
        continue;
      }

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

      if (['S8Q2', 'S8Q3', 'S8Q4'].includes(row.question_id)) {
        const narrative = parsed.narrative as string | undefined;
        const working_context = parsed.working_context as string | undefined;
        const testimonial = parsed.testimonial as unknown;
        const anything_else = parsed.anything_else as string | undefined;
        if (narrative || working_context || testimonial || anything_else) {
          optionalFieldsCompleted = true;
        }
      }
    }

    const computed: Partial<Record<DimensionKey, number>> = {};
    for (const dim of DIMENSION_KEYS) {
      const score = computeDimensionScore(inputs[dim]);
      if (score !== null) computed[dim] = score;
    }

    const mfSubs = [
      computed.motivational_fit_mastery,
      computed.motivational_fit_impact,
      computed.motivational_fit_recognition,
      computed.motivational_fit_autonomy,
    ].filter((v): v is number => typeof v === 'number');
    const motivational_fit =
      mfSubs.length > 0 ? Math.round(mfSubs.reduce((a, b) => a + b, 0) / mfSubs.length) : null;

    await fetch(`${supabaseUrl}/rest/v1/applicant_profiles?id=eq.${applicantProfileId}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({
        optional_fields_completed: optionalFieldsCompleted,
        updated_at: new Date().toISOString(),
      }),
    });

    const traitPayload = {
      applicant_id: applicantProfileId,
      ...computed,
      motivational_fit,
      sections_complete: 8,
      score_version: 'v1',
      updated_at: new Date().toISOString(),
    };

    await fetch(`${supabaseUrl}/rest/v1/applicant_trait_scores`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(traitPayload),
    });

    return new Response(JSON.stringify({ success: true, scores: { ...computed, motivational_fit } }), {
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
