/**
 * Supabase Edge Function: compute-intake-scores — Spec 4
 *
 * Trigger when candidate_profiles intake is completed (Database Webhook on UPDATE).
 * Reads intake_responses for that candidate, aggregates scores (same rules as client
 * computeIntakeScores), writes dimensions + motivational_fit + optional_fields_completed.
 */

declare const Deno: {
  env: { get(key: string): string | undefined };
};

import {
  emptyDimensionInputs,
  ingestPayloadIntoBuckets,
  dimensionScoresFromInputs,
  computeMotivationalFitAverage,
} from '../_shared/intakeScoreAggregate.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as {
      record?: {
        id?: string;
        user_id?: string;
        intake_complete?: boolean;
        intake_status?: string;
      };
      old_record?: { intake_complete?: boolean; intake_status?: string };
    };

    const applicantProfileId = payload?.record?.id;
    const userId = payload?.record?.user_id;
    const nowComplete =
      payload?.record?.intake_complete === true || payload?.record?.intake_status === 'complete';
    const wasComplete =
      payload?.old_record?.intake_complete === true || payload?.old_record?.intake_status === 'complete';

    if (!applicantProfileId || !userId) {
      return new Response(JSON.stringify({ error: 'candidate profile id or user_id missing' }), {
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
      `${supabaseUrl}/rest/v1/intake_responses?candidate_id=eq.${applicantProfileId}&select=question_key,response_value`,
      { headers },
    );
    const rows = (await responsesRes.json()) as Array<{ question_key: string; response_value: string | null }>;

    const inputs = emptyDimensionInputs();
    let optionalFieldsCompleted = false;

    for (const row of rows) {
      if (!row.response_value) continue;
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(row.response_value);
      } catch {
        continue;
      }

      ingestPayloadIntoBuckets(parsed, inputs);

      if (['S8Q2', 'S8Q3', 'S8Q4'].includes(row.question_key)) {
        const narrative = parsed.narrative as string | undefined;
        const working_context = parsed.working_context as string | undefined;
        const testimonial = parsed.testimonial as unknown;
        const anything_else = parsed.anything_else as string | undefined;
        if (narrative || working_context || testimonial || anything_else) {
          optionalFieldsCompleted = true;
        }
      }
    }

    const dimensionScores = dimensionScoresFromInputs(inputs);
    const motivational_fit = computeMotivationalFitAverage(dimensionScores);

    const traitPayload: Record<string, unknown> = {
      optional_fields_completed: optionalFieldsCompleted,
      updated_at: new Date().toISOString(),
      learning_velocity: dimensionScores.learning_velocity,
      ownership_follow_through: dimensionScores.ownership_follow_through,
      resilience: dimensionScores.resilience,
      communication_confidence: dimensionScores.communication_confidence,
      relational_intelligence: dimensionScores.relational_intelligence,
      motivational_fit_mastery: dimensionScores.motivational_fit_mastery,
      motivational_fit_impact: dimensionScores.motivational_fit_impact,
      motivational_fit_recognition: dimensionScores.motivational_fit_recognition,
      motivational_fit_autonomy: dimensionScores.motivational_fit_autonomy,
      motivational_fit,
    };

    await fetch(`${supabaseUrl}/rest/v1/candidate_profiles?id=eq.${applicantProfileId}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(traitPayload),
    });

    return new Response(
      JSON.stringify({ success: true, scores: { ...dimensionScores, motivational_fit } }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('compute-intake-scores error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
