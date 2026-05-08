import type { SupabaseClient } from '@supabase/supabase-js';
import { computeIntakeScores, type DimensionScores } from '../utils/intakeScoring';
import type { IntakeData, UserProfileData } from '../contexts/UserProfileContext';
import type { CandidateActivityEventType, IntakeFormat } from '../types/supabase';

function inferIntakeFormat(payload: Record<string, unknown>): IntakeFormat {
  if (typeof payload.narrative === 'string' && payload.narrative.trim().length > 0) return 'free_text';
  if (Array.isArray(payload.work_preferences)) return 'multi_select';
  if (Array.isArray(payload.strengths)) return 'free_text';
  if (payload.choice != null) return 'diametric';
  if (typeof payload.option_id === 'string') return 'anchored_scale';
  return 'free_text';
}

/** Matches profiles.role after migration (applicant | employer | candidate). Prefer candidate for new applicants. */
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
  options: { throwOnError?: boolean } = {},
): Promise<string | null> {
  const fail = (message: string): null => {
    console.warn(message);
    if (options.throwOnError) throw new Error(message.replace(/^\[CMe\]\s*/, ''));
    return null;
  };

  // 1. Ensure profiles row exists (in case trigger migration hasn't been run)
  const { data: existingProfileRow, error: profileSelErr } = await client
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (profileSelErr) {
    return fail(`[CMe] profiles select failed: ${profileSelErr.message}`);
  }

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
      return fail(`[CMe] profiles insert failed: ${profileInsErr.message}`);
    }
  }

  // 2. Find or create candidate_profiles row
  const { data: existing, error: selErr } = await client
    .from('candidate_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (selErr) {
    return fail(`[CMe] candidate_profiles select failed: ${selErr.message}`);
  }
  if (existing?.id) return existing.id;

  const { data: created, error: insErr } = await client
    .from('candidate_profiles')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (insErr) {
    const msg = insErr.message ?? '';
    const isDuplicate =
      insErr.code === '23505' || msg.toLowerCase().includes('duplicate') || msg.includes('unique');
    if (isDuplicate) {
      const { data: row, error: reselErr } = await client
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (!reselErr && row?.id) return row.id as string;
    }
    return fail(`[CMe] candidate_profiles insert failed: ${insErr.message}`);
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

type IntakeRow = {
  section: number;
  question_key: string;
  response_value: string | null;
};

/**
 * Load saved intake rows + profile fields from Supabase for Profile Builder hydration after refresh.
 */
export async function loadApplicantProfileFromSupabase(
  client: SupabaseClient,
  candidateProfileId: string,
): Promise<{ profile: UserProfileData; traitScores: DimensionScores | null } | null> {
  const { data: rawRow, error: rowErr } = await client
    .from('candidate_profiles')
    .select(
      'learning_velocity,ownership_follow_through,resilience,communication_confidence,relational_intelligence,motivational_fit_mastery,motivational_fit_impact,motivational_fit_recognition,motivational_fit_autonomy,intake_status',
    )
    .eq('id', candidateProfileId)
    .maybeSingle();

  if (rowErr) {
    console.warn('[CMe] candidate_profiles load failed:', rowErr.message);
    return null;
  }

  // Postgres `numeric` columns arrive as strings (e.g. "30.00") — coerce to numbers.
  const row = rawRow as {
    learning_velocity: string | number | null;
    ownership_follow_through: string | number | null;
    resilience: string | number | null;
    communication_confidence: string | number | null;
    relational_intelligence: string | number | null;
    motivational_fit_mastery: string | number | null;
    motivational_fit_impact: string | number | null;
    motivational_fit_recognition: string | number | null;
    motivational_fit_autonomy: string | number | null;
    intake_status: string | null;
  } | null;
  const toNum = (v: string | number | null | undefined): number | null => {
    if (v == null) return null;
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) ? n : null;
  };

  const { data: intakeRows, error: intakeErr } = await client
    .from('intake_responses')
    .select('section,question_key,response_value')
    .eq('candidate_id', candidateProfileId);

  if (intakeErr) {
    console.warn('[CMe] intake_responses load failed:', intakeErr.message);
    return null;
  }

  const intakeData = buildIntakeDataFromRows((intakeRows ?? []) as IntakeRow[]);
  const intakeComplete = row?.intake_status === 'complete';
  intakeData.isComplete = intakeComplete;

  let traitScores: DimensionScores | null = null;

  const hasScoringSections =
    !!intakeData.section2 ||
    !!intakeData.section3 ||
    !!intakeData.section4 ||
    !!intakeData.section5 ||
    !!intakeData.section6;

  if (intakeComplete && hasScoringSections) {
    traitScores = computeIntakeScores({
      section2: intakeData.section2 as Record<string, unknown> | undefined,
      section3: intakeData.section3 as Record<string, unknown> | undefined,
      section4: intakeData.section4 as Record<string, unknown> | undefined,
      section5: intakeData.section5 as Record<string, unknown> | undefined,
      section6: intakeData.section6 as Record<string, unknown> | undefined,
    });
  }

  if (traitScores == null && row) {
    const lv = toNum(row.learning_velocity);
    const oft = toNum(row.ownership_follow_through);
    const res = toNum(row.resilience);
    const cc = toNum(row.communication_confidence);
    const ri = toNum(row.relational_intelligence);
    const mfm = toNum(row.motivational_fit_mastery);
    const mfi = toNum(row.motivational_fit_impact);
    const mfr = toNum(row.motivational_fit_recognition);
    const mfa = toNum(row.motivational_fit_autonomy);
    const cells = [lv, oft, res, cc, ri, mfm, mfi, mfr, mfa];
    const present = cells.filter((n): n is number => n != null);
    if (present.length > 0) {
      const fillForGaps =
        present.length === 9 ? undefined : Math.round(present.reduce((a, b) => a + b, 0) / present.length);
      traitScores = {
        learning_velocity: lv ?? fillForGaps!,
        ownership_follow_through: oft ?? fillForGaps!,
        resilience: res ?? fillForGaps!,
        communication_confidence: cc ?? fillForGaps!,
        relational_intelligence: ri ?? fillForGaps!,
        motivational_fit_mastery: mfm ?? fillForGaps!,
        motivational_fit_impact: mfi ?? fillForGaps!,
        motivational_fit_recognition: mfr ?? fillForGaps!,
        motivational_fit_autonomy: mfa ?? fillForGaps!,
      };
    }
  }

  const profile: UserProfileData = {
    intakeData,
    trait_scores: traitScores,
    career_preferences: {},
    profile_info: {},
    profile_complete: intakeComplete,
    last_updated: new Date(),
  };

  return { profile, traitScores };
}

function buildIntakeDataFromRows(rows: IntakeRow[]): IntakeData {
  const completedSections = [...new Set(rows.map((r) => r.section))].sort((a, b) => a - b);
  const intakeData: IntakeData = {
    completedSections,
    isComplete: false,
  };

  const bag = intakeData as unknown as Record<string, Record<string, unknown> | undefined>;

  for (const r of rows) {
    if (r.section === 0) continue;
    const key = `section${r.section}`;
    const sectionObj = bag[key] ?? {};
    if (r.response_value) {
      try {
        sectionObj[r.question_key] = JSON.parse(r.response_value) as unknown;
      } catch {
        sectionObj[r.question_key] = r.response_value;
      }
    }
    bag[key] = sectionObj;
  }

  return intakeData;
}

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Upload a profile photo to the public `avatars` bucket; path is avatars/{userId}/profile.{ext}.
 * Requires matching Storage RLS (see migration avatars_storage).
 */
export async function uploadApplicantAvatar(
  client: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ publicUrl: string | null; error: Error | null }> {
  if (file.size > AVATAR_MAX_BYTES) {
    return { publicUrl: null, error: new Error('Image must be 5MB or smaller.') };
  }
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return { publicUrl: null, error: new Error('Use a JPG or PNG image.') };
  }
  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const path = `${userId}/profile.${ext}`;

  const { error: upErr } = await client.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (upErr) {
    console.warn('[CMe] avatar upload failed:', upErr.message);
    return { publicUrl: null, error: new Error(upErr.message) };
  }

  const { data } = client.storage.from('avatars').getPublicUrl(path);
  return { publicUrl: data.publicUrl, error: null };
}

export async function updateApplicantBasicInfo(
  client: SupabaseClient,
  applicantProfileId: string,
  fields: Partial<{
    age: number | null;
    job_title: string | null;
    current_company: string | null;
    phone: string | null;
    linkedin_url: string | null;
    gender: string | null;
    certifications: string | null;
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
    published: boolean;
  }>,
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('candidate_profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', applicantProfileId);

  if (error) {
    console.warn('[CMe] candidate_profiles basic info update failed:', error.message);
    return { error: new Error(error.message) };
  }
  return { error: null };
}

/** User-facing hint when profiles.onboarding_step write fails (RLS, missing migration, etc.). */
export function explainProfileOnboardingWriteFailure(raw: string): string {
  const m = raw.toLowerCase();
  if (
    m.includes('onboarding_step') ||
    m.includes('onboarding_completed_at') ||
    m.includes('pgrst204') ||
    (m.includes('column') && m.includes('does not exist')) ||
    m.includes('schema cache')
  ) {
    return 'Your Supabase project is missing the onboarding fields the app needs to save this step. Ask whoever manages the database to open the Supabase SQL Editor, paste in the contents of supabase/migrations/20260504183000_profiles_onboarding_urls.sql from this repo, and run it.';
  }
  if (
    m.includes('row-level security') ||
    m.includes('violates policy') ||
    m.includes('permission denied') ||
    m.includes('42501')
  ) {
    return 'Saving was blocked for your account. Try signing out and signing back in.';
  }
  if (m.includes('profile update affected no rows') || m.includes('no matching rows')) {
    return 'We could not update your profile. Try signing out and signing back in.';
  }
  console.warn('[CMe] profile onboarding write (unmapped):', raw);
  return "We couldn't save your progress. Check your connection and try again.";
}

/** Persists profiles.onboarding_step for URL-backed onboarding (RLS: own row). */
export async function setProfileOnboardingStep(
  client: SupabaseClient,
  userId: string,
  step: 'welcome' | 'details' | 'how_it_works' | 'completed',
): Promise<{ error: Error | null }> {
  const { data, error } = await client
    .from('profiles')
    .update({ onboarding_step: step })
    .eq('id', userId)
    .select('id')
    .maybeSingle();
  if (error) {
    return { error: new Error(error.message) };
  }
  if (!data) {
    return { error: new Error('profile update affected no rows') };
  }
  return { error: null };
}

/** Marks applicant onboarding finished (server source of truth for route guards). */
export async function completeApplicantOnboardingWizard(
  client: SupabaseClient,
  userId: string,
): Promise<{ error: Error | null }> {
  const now = new Date().toISOString();
  const { data, error } = await client
    .from('profiles')
    .update({
      onboarding_step: 'completed',
      onboarding_completed_at: now,
      onboarding_complete: true,
    })
    .eq('id', userId)
    .select('id')
    .maybeSingle();
  if (error) {
    return { error: new Error(error.message) };
  }
  if (!data) {
    return { error: new Error('profile update affected no rows') };
  }
  return { error: null };
}

/**
 * Save base details collected during the welcome onboarding flow.
 * Updates both the profiles row (full_name) and candidate_profiles row.
 */
export async function saveBaseDetails(
  client: SupabaseClient,
  userId: string,
  profileId: string,
  fields: {
    full_name: string | null;
    location: string | null;
    current_situation: string | null;
    job_title?: string | null;
    /** Omit to leave `candidate_profiles.age` unchanged. */
    age?: number | null;
    availability: string | null;
  },
): Promise<void> {
  if (fields.full_name) {
    await client.from('profiles').update({ full_name: fields.full_name }).eq('id', userId);
  }

  const candidateUpdate: Record<string, unknown> = {
    location: fields.location,
    current_situation: fields.current_situation,
    job_title: fields.job_title ?? fields.current_situation,
    availability: fields.availability,
    updated_at: new Date().toISOString(),
  };
  if ('age' in fields) {
    candidateUpdate.age = fields.age;
  }

  const { error } = await client.from('candidate_profiles').update(candidateUpdate).eq('id', profileId);

  if (error) {
    console.warn('[CMe] saveBaseDetails failed:', error.message);
  }
}

/**
 * Maps Profile Builder Section 7 (Career Direction) into candidate_profiles columns
 * so the dashboard and employers can filter without re-parsing intake JSON.
 */
export async function syncSection7ToCandidateProfile(
  client: SupabaseClient,
  candidateProfileId: string,
  responses: Record<string, unknown>,
): Promise<void> {
  const S7Q4 = responses.S7Q4 as { role_type_preferences?: string[] } | undefined;
  const S7Q5 = responses.S7Q5 as {
    work_location?: string;
    org_size?: string;
    part_time_openness?: string;
    minimum_salary?: string;
  } | undefined;

  const roleTypes = Array.isArray(S7Q4?.role_type_preferences) ? S7Q4.role_type_preferences : null;
  const workParts: string[] = [];
  if (S7Q5?.work_location) workParts.push(S7Q5.work_location);
  if (S7Q5?.part_time_openness) workParts.push(S7Q5.part_time_openness);

  const { error } = await client
    .from('candidate_profiles')
    .update({
      preferred_role_types: roleTypes,
      preferred_work_type: workParts.length > 0 ? workParts : null,
      org_size_preference: S7Q5?.org_size ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidateProfileId);

  if (error) {
    console.warn('[CMe] syncSection7ToCandidateProfile failed:', error.message);
  }
}

export async function insertCandidateActivityEvent(
  client: SupabaseClient,
  userId: string,
  eventType: CandidateActivityEventType,
  body: string,
): Promise<void> {
  const { error } = await client.from('candidate_activity_events').insert({
    user_id: userId,
    event_type: eventType,
    body,
  });
  if (error) {
    console.warn('[CMe] candidate_activity_events insert failed:', error.message);
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
    return;
  }

  const { data: row } = await client
    .from('candidate_profiles')
    .select('user_id')
    .eq('id', applicantProfileId)
    .maybeSingle();
  const uid = row?.user_id as string | undefined;
  if (uid) {
    await insertCandidateActivityEvent(client, uid, 'profile', 'Trait profile marked complete');
  }
}
