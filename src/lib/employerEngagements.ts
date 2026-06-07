import type { SupabaseClient } from '@supabase/supabase-js';
import type { Candidate } from '../components/types/employer';
import { computeMatchScore, type EmployerWeights } from './matchScoring';
import { toCandidateDimensionScores } from '../utils/intakeScoreAggregate';
import { TRAIT_DIMENSION_KEYS, TRAIT_LABELS } from './traits';
import { mapDbStageToUi, mapUiStageToDb } from './applicantEngagements';
import type { EmployerLikeStage } from './applicantOpportunitiesMock';
import {
  fetchCandidateProfileRows,
  type NormalizedCandidateRow,
} from './candidateProfileFetch';
import {
  computeProfileCompleteness,
  inferReadinessFromSituation,
} from './candidateProfileDisplay';

function placeholderCandidateRow(id: string): NormalizedCandidateRow {
  return {
    id,
    user_id: null,
    full_name: 'Candidate',
    email: null,
    avatar_url: null,
    job_title: null,
    current_company: null,
    location: null,
    availability: null,
    notice_period: null,
    status: null,
    experience_years: null,
    phone: null,
    linkedin_url: null,
    certifications: null,
    work_rights: null,
    salary_min: null,
    salary_currency: null,
    current_situation: null,
    industry_background: null,
    open_to_industries: null,
    preferred_work_type: null,
    preferred_role_types: null,
    org_size_preference: null,
    open_to_contract: null,
    education_summary: null,
    experience_narrative: null,
    enjoyed_most: null,
    one_thing_to_know: null,
    strength_1: null,
    strength_2: null,
    strength_3: null,
    working_context: null,
    testimonial_name: null,
    testimonial_relation: null,
    testimonial_text: null,
    open_context: null,
    intake_status: null,
    intake_complete: null,
    learning_velocity: null,
    ownership_follow_through: null,
    resilience: null,
    communication_confidence: null,
    relational_intelligence: null,
    motivational_fit: null,
    motivational_fit_mastery: null,
    motivational_fit_impact: null,
    motivational_fit_recognition: null,
    motivational_fit_autonomy: null,
  };
}

export type EmployerMessage = {
  id: string;
  sender: 'employer' | 'candidate';
  body: string;
  sentAt: string;
  createdAt: string;
};

export type EmployerEngagementThread = {
  engagementId: string;
  candidateProfileId: string;
  candidate: Candidate;
  stage: EmployerLikeStage;
  matchScore: number;
  messages: EmployerMessage[];
  unreadCount: number;
  lastUpdate: string;
  updatedAt: string;
  roleTitle: string | null;
};

type CandidateRow = NormalizedCandidateRow;

type MessageRow = {
  id: string;
  engagement_id: string;
  sender: 'employer' | 'candidate';
  body: string;
  created_at: string;
};

function formatMessageTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function topTraitLabels(scores: ReturnType<typeof toCandidateDimensionScores>): string[] {
  const pairs = TRAIT_DIMENSION_KEYS.map((k) => [k, scores[k]] as const).filter(
    ([, v]) => typeof v === 'number' && !Number.isNaN(v),
  );
  pairs.sort((a, b) => b[1] - a[1]);
  return pairs.slice(0, 3).map(([k]) => TRAIT_LABELS[k]);
}

export function mapKanbanColumnToDbStage(columnId: string): string {
  switch (columnId) {
    case 'newSignals':
      return 'discovered';
    case 'assessmentSent':
      return 'contacted';
    case 'inProgress':
      return 'interviewing';
    case 'finalRound':
      return 'decision';
    case 'hired':
      return 'hired';
    case 'rejected':
      return 'rejected';
    default:
      return columnId;
  }
}

export function mapDbStageToKanbanColumn(stage: string | null): Candidate['stage'] {
  switch (stage) {
    case 'discovered':
      return 'discovered';
    case 'contacted':
    case 'responded':
      return 'contacted';
    case 'interviewing':
      return 'interviewing';
    case 'decision':
      return 'decision';
    case 'hired':
      return 'hired';
    case 'rejected':
    case 'closed':
      return 'rejected';
    default:
      return 'discovered';
  }
}

export function mapCandidateRowToUi(
  row: CandidateRow,
  engagement: {
    id: string;
    stage: string | null;
    match_score: number | null;
    updated_at: string;
    hired_at?: string | null;
  } | null,
  weights: EmployerWeights | null,
): Candidate {
  const trait_scores = {
    learning_velocity: row.learning_velocity ?? 0,
    ownership_follow_through: row.ownership_follow_through ?? 0,
    resilience: row.resilience ?? 0,
    communication_confidence: row.communication_confidence ?? 0,
    relational_intelligence: row.relational_intelligence ?? 0,
    motivational_fit_mastery: row.motivational_fit_mastery ?? 0,
    motivational_fit_impact: row.motivational_fit_impact ?? 0,
    motivational_fit_recognition: row.motivational_fit_recognition ?? 0,
    motivational_fit_autonomy: row.motivational_fit_autonomy ?? 0,
  };
  const dimensionScores = toCandidateDimensionScores(trait_scores);
  const matchScore =
    engagement?.match_score ??
    (weights ? Math.round(computeMatchScore(dimensionScores, weights).matchScore) : 0);

  const stage = mapDbStageToKanbanColumn(engagement?.stage ?? 'discovered');
  const updatedAt = engagement?.updated_at ?? new Date().toISOString();
  const daysInStage = Math.max(
    0,
    Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
  );

  const readiness = inferReadinessFromSituation(row.current_situation);

  const mapped: Candidate & { engagementId?: string } = {
    id: row.id as unknown as number,
    candidate_id: row.id as unknown as number,
    profileId: row.id,
    engagementId: engagement?.id,
    name: row.full_name?.trim() || 'Candidate',
    role: row.job_title?.trim() || 'Open role',
    location: row.location?.trim() || '—',
    availability: row.availability?.trim() || undefined,
    noticePeriod: row.notice_period?.trim() || undefined,
    level:
      row.experience_years != null ? `${row.experience_years} yrs` : '—',
    totalExperience: row.experience_years ?? undefined,
    transitioning: readiness.transitioning,
    openToChange: readiness.openToChange,
    readyToStepUp: readiness.readyToStepUp,
    retrained: readiness.retrained,
    email: row.email,
    avatarUrl: row.avatar_url,
    currentCompany: row.current_company,
    phone: row.phone,
    linkedinUrl: row.linkedin_url,
    certifications: row.certifications,
    workRights: row.work_rights,
    salaryMin: row.salary_min,
    salaryCurrency: row.salary_currency,
    currentSituation: row.current_situation,
    educationSummary: row.education_summary,
    experienceNarrative: row.experience_narrative,
    enjoyedMost: row.enjoyed_most,
    oneThingToKnow: row.one_thing_to_know,
    strength1: row.strength_1,
    strength2: row.strength_2,
    strength3: row.strength_3,
    workingContext: row.working_context,
    testimonialName: row.testimonial_name,
    testimonialRelation: row.testimonial_relation,
    testimonialText: row.testimonial_text,
    openContext: row.open_context,
    preferredRoleTypes: row.preferred_role_types,
    preferredWorkType: row.preferred_work_type,
    orgSizePreference: row.org_size_preference,
    industryBackground: row.industry_background,
    openToIndustries: row.open_to_industries,
    openToContract: row.open_to_contract,
    intakeComplete: row.intake_complete,
    traits: topTraitLabels(dimensionScores),
    score: matchScore,
    stage,
    daysInStage,
    aiMatchPercent: matchScore,
    trait_scores,
    dimensionScores,
    stageUpdatedAt: updatedAt,
    hired_date: engagement?.hired_at ?? undefined,
  };
  mapped.profileCompleteness = computeProfileCompleteness(mapped);
  return mapped;
}

function buildMessages(rows: MessageRow[]): EmployerMessage[] {
  return rows.map((r) => ({
    id: r.id,
    sender: r.sender,
    body: r.body,
    sentAt: formatMessageTime(r.created_at),
    createdAt: r.created_at,
  }));
}

function countUnreadCandidateMessages(
  messages: MessageRow[],
  employerLastReadAt: string | null,
): number {
  const threshold = employerLastReadAt ? new Date(employerLastReadAt).getTime() : 0;
  return messages.filter(
    (m) => m.sender === 'candidate' && new Date(m.created_at).getTime() > threshold,
  ).length;
}

export async function fetchEmployerEngagements(
  supabase: SupabaseClient,
  businessId: string,
  weights: EmployerWeights | null,
): Promise<EmployerEngagementThread[]> {
  const { data: engsRaw, error: engErr } = await supabase
    .from('engagements')
    .select(
      'id, stage, match_score, created_at, updated_at, candidate_id, employer_last_read_at, hired_at, role_id',
    )
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false });

  if (engErr) {
    const missingColumn =
      engErr.code === '42703' ||
      /column/i.test(engErr.message) ||
      /does not exist/i.test(engErr.message);
    if (missingColumn) {
      const fallback = await supabase
        .from('engagements')
        .select('id, stage, match_score, created_at, updated_at, candidate_id, role_id')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });
      if (fallback.error) throw fallback.error;
      return mapEngagementRows(supabase, fallback.data ?? [], weights, businessId);
    }
    throw engErr;
  }
  if (!engsRaw?.length) return [];

  return mapEngagementRows(supabase, engsRaw, weights, businessId);
}

async function mapEngagementRows(
  supabase: SupabaseClient,
  engsRaw: Array<Record<string, unknown>>,
  weights: EmployerWeights | null,
  _businessId: string,
): Promise<EmployerEngagementThread[]> {

  const candidateIds = [...new Set(engsRaw.map((e) => e.candidate_id as string))];
  const roleIds = [
    ...new Set(
      engsRaw.map((e) => e.role_id as string | null).filter((id): id is string => Boolean(id)),
    ),
  ];

  const { rows: candidates, error: cErr } = await fetchCandidateProfileRows(supabase, {
    ids: candidateIds,
  });

  if (cErr) {
    console.warn('[CMe] employer candidate_profiles for engagements:', cErr);
  }

  let roleMap = new Map<string, string>();
  if (roleIds.length) {
    const { data: roles } = await supabase.from('roles').select('id, title').in('id', roleIds);
    roleMap = new Map((roles ?? []).map((r) => [r.id as string, r.title as string]));
  }

  const candMap = new Map(candidates.map((c) => [c.id, c]));
  const engIds = engsRaw.map((e) => e.id as string);

  const { data: msgs, error: msgErr } = await supabase
    .from('engagement_messages')
    .select('id, engagement_id, sender, body, created_at')
    .in('engagement_id', engIds)
    .order('created_at', { ascending: true });

  if (msgErr) console.warn('[CMe] employer engagement_messages:', msgErr.message);

  const byEng = new Map<string, MessageRow[]>();
  for (const m of (msgs ?? []) as MessageRow[]) {
    const list = byEng.get(m.engagement_id) ?? [];
    list.push(m);
    byEng.set(m.engagement_id, list);
  }

  return engsRaw.map((eng) => {
    const cand = candMap.get(eng.candidate_id as string);
    const msgRows = byEng.get(eng.id as string) ?? [];
    const unread = countUnreadCandidateMessages(
      msgRows,
      (eng.employer_last_read_at as string | null) ?? null,
    );
    const lastMsg = msgRows[msgRows.length - 1];
    const candidate = mapCandidateRowToUi(
      cand ?? placeholderCandidateRow(eng.candidate_id as string),
      {
        id: eng.id as string,
        stage: eng.stage as string | null,
        match_score: eng.match_score as number | null,
        updated_at: eng.updated_at as string,
        hired_at: eng.hired_at as string | null,
      },
      weights,
    );

    return {
      engagementId: eng.id as string,
      candidateProfileId: eng.candidate_id as string,
      candidate,
      stage: mapDbStageToUi(eng.stage as string | null),
      matchScore: (eng.match_score as number | null) ?? candidate.score,
      messages: buildMessages(msgRows),
      unreadCount: unread,
      lastUpdate: lastMsg
        ? formatMessageTime(lastMsg.created_at)
        : formatMessageTime(eng.updated_at as string),
      updatedAt: eng.updated_at as string,
      roleTitle: eng.role_id ? roleMap.get(eng.role_id as string) ?? null : null,
    };
  });
}

export type EngagementSource = 'employer_search' | 'direct' | 'assessment_link';

export async function createEngagement(
  supabase: SupabaseClient,
  candidateProfileId: string,
  businessId: string,
  matchScore: number | null,
  source: EngagementSource = 'employer_search',
  roleId?: string | null,
): Promise<string> {
  const row: {
    candidate_id: string;
    business_id: string;
    stage: string;
    match_score: number | null;
    source: EngagementSource;
    role_id?: string;
  } = {
    candidate_id: candidateProfileId,
    business_id: businessId,
    stage: 'discovered',
    match_score: matchScore,
    source,
  };
  if (roleId) {
    row.role_id = roleId;
  }

  const { data, error } = await supabase.from('engagements').insert(row).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function insertEmployerEngagementMessage(
  supabase: SupabaseClient,
  engagementId: string,
  body: string,
  options?: { advanceToContacted?: boolean },
): Promise<void> {
  const { error } = await supabase.from('engagement_messages').insert({
    engagement_id: engagementId,
    sender: 'employer',
    body,
  });
  if (error) throw error;

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (options?.advanceToContacted) {
    updates.stage = 'contacted';
  }

  const { error: upErr } = await supabase.from('engagements').update(updates).eq('id', engagementId);
  if (upErr) throw upErr;
}

export async function markEmployerThreadRead(
  supabase: SupabaseClient,
  engagementId: string,
): Promise<void> {
  const { error } = await supabase
    .from('engagements')
    .update({ employer_last_read_at: new Date().toISOString() })
    .eq('id', engagementId);
  if (error) throw error;
}

export async function updateEngagementStageFromEmployer(
  supabase: SupabaseClient,
  engagementId: string,
  stage: EmployerLikeStage | Candidate['stage'],
): Promise<void> {
  const dbStage = mapUiStageToDb(stage as EmployerLikeStage);
  const updates: Record<string, string> = {
    stage: dbStage,
    updated_at: new Date().toISOString(),
  };
  if (dbStage === 'hired') {
    updates.hired_at = new Date().toISOString();
  }
  const { error } = await supabase.from('engagements').update(updates).eq('id', engagementId);
  if (error) throw error;
}

export async function updateEmployerNotes(
  supabase: SupabaseClient,
  engagementId: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase
    .from('engagements')
    .update({ employer_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', engagementId);
  if (error) throw error;
}
