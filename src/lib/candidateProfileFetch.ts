import type { SupabaseClient } from '@supabase/supabase-js';

const CANDIDATE_PROFILE_COLUMNS = [
  'id',
  'user_id',
  'job_title',
  'location',
  'availability',
  'notice_period',
  'status',
  'experience_years',
  'full_name',
  'email',
  'avatar_url',
  'current_company',
  'phone',
  'linkedin_url',
  'certifications',
  'work_rights',
  'salary_min',
  'salary_currency',
  'current_situation',
  'industry_background',
  'open_to_industries',
  'preferred_work_type',
  'preferred_role_types',
  'org_size_preference',
  'open_to_contract',
  'education_summary',
  'experience_narrative',
  'enjoyed_most',
  'one_thing_to_know',
  'strength_1',
  'strength_2',
  'strength_3',
  'working_context',
  'testimonial_name',
  'testimonial_relation',
  'testimonial_text',
  'open_context',
  'intake_status',
  'intake_complete',
  'learning_velocity',
  'ownership_follow_through',
  'resilience',
  'communication_confidence',
  'relational_intelligence',
  'motivational_fit',
  'motivational_fit_mastery',
  'motivational_fit_impact',
  'motivational_fit_recognition',
  'motivational_fit_autonomy',
].join(', ');

/** Trait + marketplace + narrative columns on `candidate_profiles`. */
export const CANDIDATE_PROFILE_SELECT = CANDIDATE_PROFILE_COLUMNS;

/** Employer-readable fields live on candidate_profiles (no profiles join — avoids RLS recursion). */
export const CANDIDATE_PROFILE_SELECT_WITH_NAME = CANDIDATE_PROFILE_SELECT;

export type CandidateProfileDbRow = {
  id: string;
  user_id?: string;
  job_title?: string | null;
  location?: string | null;
  availability?: string | null;
  notice_period?: string | null;
  status?: string | null;
  experience_years?: number | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  current_company?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  certifications?: string | null;
  work_rights?: string | null;
  salary_min?: number | null;
  salary_currency?: string | null;
  current_situation?: string | null;
  industry_background?: string[] | null;
  open_to_industries?: boolean | null;
  preferred_work_type?: string[] | null;
  preferred_role_types?: string[] | null;
  org_size_preference?: string | null;
  open_to_contract?: string | null;
  education_summary?: string | null;
  experience_narrative?: string | null;
  enjoyed_most?: string | null;
  one_thing_to_know?: string | null;
  strength_1?: string | null;
  strength_2?: string | null;
  strength_3?: string | null;
  working_context?: string | null;
  testimonial_name?: string | null;
  testimonial_relation?: string | null;
  testimonial_text?: string | null;
  open_context?: string | null;
  intake_status?: string | null;
  intake_complete?: boolean | null;
  learning_velocity?: number | null;
  ownership_follow_through?: number | null;
  resilience?: number | null;
  communication_confidence?: number | null;
  relational_intelligence?: number | null;
  motivational_fit?: number | null;
  motivational_fit_mastery?: number | null;
  motivational_fit_impact?: number | null;
  motivational_fit_recognition?: number | null;
  motivational_fit_autonomy?: number | null;
};

export type NormalizedCandidateRow = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  job_title: string | null;
  current_company: string | null;
  location: string | null;
  availability: string | null;
  notice_period: string | null;
  status: string | null;
  experience_years: number | null;
  phone: string | null;
  linkedin_url: string | null;
  certifications: string | null;
  work_rights: string | null;
  salary_min: number | null;
  salary_currency: string | null;
  current_situation: string | null;
  industry_background: string[] | null;
  open_to_industries: boolean | null;
  preferred_work_type: string[] | null;
  preferred_role_types: string[] | null;
  org_size_preference: string | null;
  open_to_contract: string | null;
  education_summary: string | null;
  experience_narrative: string | null;
  enjoyed_most: string | null;
  one_thing_to_know: string | null;
  strength_1: string | null;
  strength_2: string | null;
  strength_3: string | null;
  working_context: string | null;
  testimonial_name: string | null;
  testimonial_relation: string | null;
  testimonial_text: string | null;
  open_context: string | null;
  intake_status: string | null;
  intake_complete: boolean | null;
  learning_velocity: number | null;
  ownership_follow_through: number | null;
  resilience: number | null;
  communication_confidence: number | null;
  relational_intelligence: number | null;
  motivational_fit: number | null;
  motivational_fit_mastery: number | null;
  motivational_fit_impact: number | null;
  motivational_fit_recognition: number | null;
  motivational_fit_autonomy: number | null;
};

function pickString(...values: Array<string | null | undefined>): string | null {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return null;
}

export function normalizeCandidateProfileRow(
  row: CandidateProfileDbRow,
): NormalizedCandidateRow {
  return {
    id: row.id,
    user_id: row.user_id ?? null,
    full_name: pickString(row.full_name),
    email: pickString(row.email),
    avatar_url: pickString(row.avatar_url),
    job_title: row.job_title ?? null,
    current_company: row.current_company ?? null,
    location: row.location ?? null,
    availability: row.availability ?? null,
    notice_period: row.notice_period ?? null,
    status: row.status ?? null,
    experience_years: row.experience_years ?? null,
    phone: row.phone ?? null,
    linkedin_url: row.linkedin_url ?? null,
    certifications: row.certifications ?? null,
    work_rights: row.work_rights ?? null,
    salary_min: row.salary_min ?? null,
    salary_currency: row.salary_currency ?? null,
    current_situation: row.current_situation ?? null,
    industry_background: row.industry_background ?? null,
    open_to_industries: row.open_to_industries ?? null,
    preferred_work_type: row.preferred_work_type ?? null,
    preferred_role_types: row.preferred_role_types ?? null,
    org_size_preference: row.org_size_preference ?? null,
    open_to_contract: row.open_to_contract ?? null,
    education_summary: row.education_summary ?? null,
    experience_narrative: row.experience_narrative ?? null,
    enjoyed_most: row.enjoyed_most ?? null,
    one_thing_to_know: row.one_thing_to_know ?? null,
    strength_1: row.strength_1 ?? null,
    strength_2: row.strength_2 ?? null,
    strength_3: row.strength_3 ?? null,
    working_context: row.working_context ?? null,
    testimonial_name: row.testimonial_name ?? null,
    testimonial_relation: row.testimonial_relation ?? null,
    testimonial_text: row.testimonial_text ?? null,
    open_context: row.open_context ?? null,
    intake_status: row.intake_status ?? null,
    intake_complete: row.intake_complete ?? null,
    learning_velocity: row.learning_velocity ?? null,
    ownership_follow_through: row.ownership_follow_through ?? null,
    resilience: row.resilience ?? null,
    communication_confidence: row.communication_confidence ?? null,
    relational_intelligence: row.relational_intelligence ?? null,
    motivational_fit: row.motivational_fit ?? null,
    motivational_fit_mastery: row.motivational_fit_mastery ?? null,
    motivational_fit_impact: row.motivational_fit_impact ?? null,
    motivational_fit_recognition: row.motivational_fit_recognition ?? null,
    motivational_fit_autonomy: row.motivational_fit_autonomy ?? null,
  };
}

/** Fetch candidate profile rows with resilient select (falls back if optional columns missing). */
export async function fetchCandidateProfileRows(
  supabase: SupabaseClient,
  filter?: { ids?: string[] },
): Promise<{ rows: NormalizedCandidateRow[]; error: string | null }> {
  const runSelect = (select: string) => {
    let q = supabase.from('candidate_profiles').select(select);
    if (filter?.ids?.length) q = q.in('id', filter.ids);
    return q;
  };

  let { data, error } = await runSelect(CANDIDATE_PROFILE_SELECT_WITH_NAME);

  const missingColumn =
    error &&
    (error.code === '42703' ||
      /column/i.test(error.message) ||
      /does not exist/i.test(error.message));

  if (missingColumn) {
    const fallback = await runSelect(
      CANDIDATE_PROFILE_SELECT.replace(', email', '').replace(', avatar_url', '').replace(', full_name', ''),
    );
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    return { rows: [], error: error.message };
  }

  return {
    rows: (data ?? []).map((row) =>
      normalizeCandidateProfileRow(row as unknown as CandidateProfileDbRow),
    ),
    error: null,
  };
}
