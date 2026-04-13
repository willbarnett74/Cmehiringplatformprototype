import type { SupabaseClient } from '@supabase/supabase-js';
import type { IntakeFormat } from '../types/supabase';

function inferIntakeFormat(payload: Record<string, unknown>): IntakeFormat {
  if (typeof payload.narrative === 'string' && payload.narrative.trim().length > 0) return 'free_text';
  if (Array.isArray(payload.work_preferences)) return 'multi_select';
  if (Array.isArray(payload.strengths)) return 'free_text';
  if (payload.choice != null) return 'diametric';
  if (typeof payload.option_id === 'string') return 'anchored_scale';
  return 'free_text';
}

function profileRoleFromMetadata(metaRole: string | undefined): 'candidate' | 'employer' {
  return metaRole === 'employer' ? 'employer' : 'candidate';
}

/**
 * Ensure a row exists in candidate_profiles for the current auth user.
 * Also creates the profiles row if the DB trigger hasn't been applied yet.
 */
export async function ensureApplicantProfile(
  client: SupabaseClient,
  userId: string,
): Promise<string | null> {
  // 1. Ensure profiles row exists (in case trigger migration hasn't been run)
  const { data: existingProfileRow } = await client
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfileRow) {
    const { data: { user } } = await client.auth.getUser();
    const metaRole = user?.user_metadata?.role as string | undefined;
    const { error: profileInsErr } = await client.from('profiles').insert({
      id: userId,
      email: user?.email ?? '',
      full_name: (user?.user_metadata?.full_name as string | undefined) ?? null,
      role: profileRoleFromMetadata(metaRole),
    });
    if (profileInsErr) {
      console.warn('[CMe] profiles insert failed:', profileInsErr.message);
    }
  }

  // 2. Find or create candidate_profiles row
  const { data: existing, error: selErr } = await client
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (selErr) {
    console.warn('[CMe] candidate_profiles select failed:', selErr.message);
    return null;
  }
  if (existing?.id) return existing.id;

  const { data: created, error: insErr } = await client
    .from('candidate_profiles')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (insErr) {
    console.warn('[CMe] candidate_profiles insert failed:', insErr.message);
    return null;
  }
  return created.id;
}

/**
 * Upsert intake question rows for one completed section (matches intake_responses schema).
 * Full per-question payload is stored in response_value as JSON for the compute-intake-scores edge function.
 */
export async function upsertIntakeSectionResponses(
  client: SupabaseClient,
  applicantProfileId: string,
  sectionNumber: number,
  sectionPayload: Record<string, unknown>,
): Promise<void> {
  const responses = sectionPayload.responses as Record<string, Record<string, unknown>> | undefined;
  if (!responses) return;

  const rows = Object.entries(responses).map(([fallbackId, payload]) => {
    const questionKey = (typeof payload.question_key === 'string' ? payload.question_key : null) ?? fallbackId;
    const format = inferIntakeFormat(payload);
    const scores = payload.scores;
    const workPrefs = payload.work_preferences;
    const strengths = payload.strengths;

    return {
      candidate_id: applicantProfileId,
      section: sectionNumber,
      question_key: questionKey,
      format,
      response_value: JSON.stringify(payload),
      response_array: Array.isArray(workPrefs)
        ? (workPrefs as string[])
        : Array.isArray(strengths)
          ? (strengths as string[])
          : null,
      score_data: scores && typeof scores === 'object' ? scores : null,
      llm_score: null,
      time_spent_sec: null,
    };
  });

  const { error } = await client.from('intake_responses').upsert(rows, {
    onConflict: 'candidate_id,question_key',
  });

  if (error) {
    console.warn('[CMe] intake_responses upsert failed:', error.message);
  }

  await client
    .from('candidate_profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', applicantProfileId);
}

export async function updateApplicantBasicInfo(
  client: SupabaseClient,
  applicantProfileId: string,
  fields: Partial<{
    location: string | null;
    experience_years: number | null;
    current_situation: string | null;
    education_summary: string | null;
    experience_narrative: string | null;
    work_rights: string | null;
    availability: string | null;
    notice_period: string | null;
    salary_min: number | null;
    salary_currency: string;
    preferred_work_type: string[] | null;
    preferred_role_types: string[] | null;
    org_size_preference: string | null;
    open_to_contract: string | null;
    open_to_industries: boolean;
  }>,
): Promise<void> {
  const { error } = await client
    .from('candidate_profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', applicantProfileId);

  if (error) {
    console.warn('[CMe] candidate_profiles basic info update failed:', error.message);
  }
}

export async function markApplicantIntakeComplete(
  client: SupabaseClient,
  applicantProfileId: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await client
    .from('candidate_profiles')
    .update({
      intake_status: 'complete',
      updated_at: now,
    })
    .eq('id', applicantProfileId);

  if (error) {
    console.warn('[CMe] candidate_profiles intake complete failed:', error.message);
  }
}
