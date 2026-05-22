import type { SupabaseClient } from '@supabase/supabase-js';
import type { Candidate } from '../components/types/employer';
import { computeMatchScore, type EmployerWeights } from './matchScoring';
import { toCandidateDimensionScores } from '../utils/intakeScoreAggregate';
import { TRAIT_DIMENSION_KEYS, TRAIT_LABELS } from './traits';
import { mapDbStageToUi, mapUiStageToDb } from './applicantEngagements';
import type { EmployerLikeStage } from './applicantOpportunitiesMock';

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

type CandidateRow = {
  id: string;
  full_name: string | null;
  job_title: string | null;
  location: string | null;
  availability: string | null;
  notice_period: string | null;
  seniority: string | null;
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

  return {
    id: row.id as unknown as number,
    candidate_id: row.id as unknown as number,
    engagementId: engagement?.id,
    name: row.full_name?.trim() || 'Candidate',
    role: row.job_title?.trim() || 'Open role',
    location: row.location?.trim() || '—',
    availability: row.availability?.trim() || undefined,
    noticePeriod: row.notice_period?.trim() || undefined,
    level: row.seniority?.trim() || '—',
    traits: topTraitLabels(dimensionScores),
    score: matchScore,
    stage,
    daysInStage,
    aiMatchPercent: matchScore,
    trait_scores,
    dimensionScores,
    stageUpdatedAt: updatedAt,
    hired_date: engagement?.hired_at ?? undefined,
  } as Candidate & { engagementId?: string };
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

  if (engErr) throw engErr;
  if (!engsRaw?.length) return [];

  const candidateIds = [...new Set(engsRaw.map((e) => e.candidate_id as string))];
  const roleIds = [
    ...new Set(
      engsRaw.map((e) => e.role_id as string | null).filter((id): id is string => Boolean(id)),
    ),
  ];

  const { data: candidates, error: cErr } = await supabase
    .from('candidate_profiles')
    .select(
      'id, full_name, job_title, location, seniority, availability, notice_period, learning_velocity, ownership_follow_through, resilience, communication_confidence, relational_intelligence, motivational_fit, motivational_fit_mastery, motivational_fit_impact, motivational_fit_recognition, motivational_fit_autonomy',
    )
    .in('id', candidateIds);

  if (cErr) throw cErr;

  let roleMap = new Map<string, string>();
  if (roleIds.length) {
    const { data: roles } = await supabase.from('roles').select('id, title').in('id', roleIds);
    roleMap = new Map((roles ?? []).map((r) => [r.id as string, r.title as string]));
  }

  const candMap = new Map((candidates ?? []).map((c) => [c.id as string, c as CandidateRow]));
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
      cand ?? {
        id: eng.candidate_id as string,
        full_name: 'Candidate',
        job_title: null,
        location: null,
        availability: null,
        notice_period: null,
        seniority: null,
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
      },
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

export async function createEngagement(
  supabase: SupabaseClient,
  candidateProfileId: string,
  businessId: string,
  matchScore: number,
  source: 'employer_search' | 'direct' = 'employer_search',
): Promise<string> {
  const { data, error } = await supabase
    .from('engagements')
    .insert({
      candidate_id: candidateProfileId,
      business_id: businessId,
      stage: 'discovered',
      match_score: matchScore,
      source,
    })
    .select('id')
    .single();
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
