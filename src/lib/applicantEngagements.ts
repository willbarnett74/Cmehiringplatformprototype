import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ApplicantOpportunity,
  ApplicantOpportunityEvent,
  ApplicantOpportunityMessage,
  EmployerLikeStage,
} from './applicantOpportunitiesMock';

type BusinessEmbed = {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  description: string | null;
} | null;

type RoleEmbed = {
  id: string;
  title: string;
  location: string | null;
  role_type: string | null;
} | null;

type EngagementRow = {
  id: string;
  stage: string | null;
  match_score: number | null;
  created_at: string;
  updated_at: string;
  business_id: string;
  role_id: string | null;
  businesses: BusinessEmbed;
  roles: RoleEmbed;
};

type MessageRow = {
  id: string;
  engagement_id: string;
  sender: 'employer' | 'candidate';
  body: string;
  created_at: string;
};

type ReadRow = {
  engagement_id: string;
  last_read_at: string;
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

export function mapDbStageToUi(stage: string | null): EmployerLikeStage {
  switch (stage) {
    case 'contacted':
      return 'contacted';
    case 'responded':
      return 'responded';
    case 'interviewing':
      return 'interviewing';
    case 'decision':
      return 'decision';
    case 'hired':
      return 'hired';
    case 'rejected':
      return 'rejected';
    case 'closed':
      return 'rejected';
    default:
      return 'discovered';
  }
}

export function mapUiStageToDb(stage: EmployerLikeStage): string {
  if (stage === 'rejected') return 'rejected';
  return stage;
}

function countUnreadEmployerMessages(messages: MessageRow[], lastReadAt: string | null): number {
  if (!messages.length) return 0;
  const threshold = lastReadAt ? new Date(lastReadAt).getTime() : 0;
  return messages.filter(
    (m) => m.sender === 'employer' && new Date(m.created_at).getTime() > threshold,
  ).length;
}

function buildMessages(rows: MessageRow[]): ApplicantOpportunityMessage[] {
  return rows.map((r) => ({
    id: r.id,
    sender: r.sender === 'employer' ? 'business' : 'applicant',
    body: r.body,
    sentAt: formatMessageTime(r.created_at),
    read: true,
  }));
}

function defaultNextAction(stage: EmployerLikeStage): ApplicantOpportunity['nextAction'] {
  if (stage === 'contacted') {
    return {
      label: 'Business is waiting on your reply',
      description: 'Reply to move this opportunity forward.',
      ctaLabel: 'Reply',
      state: 'reply',
    };
  }
  if (stage === 'interviewing') {
    return {
      label: 'Interview in progress',
      description: 'Keep an eye on this thread for scheduling updates.',
      ctaLabel: 'Send follow-up',
      state: 'reply',
    };
  }
  if (stage === 'decision') {
    return {
      label: 'Decision phase',
      description: 'Review any updates from the business.',
      ctaLabel: 'Review update',
      state: 'review-decision',
    };
  }
  return {
    label: 'Opportunity active',
    description: 'Use the thread to stay in touch.',
    ctaLabel: 'Reply',
    state: 'reply',
  };
}

function buildTimeline(
  engagementId: string,
  businessName: string,
  rows: MessageRow[],
): ApplicantOpportunityEvent[] {
  const events: ApplicantOpportunityEvent[] = [];
  if (rows.length > 0) {
    const first = rows[0];
    events.push({
      id: `${engagementId}-first-msg`,
      label: first.sender === 'employer' ? 'Message from business' : 'You replied',
      description:
        first.sender === 'employer' ? `${businessName} sent a message.` : 'You sent a message.',
      happenedAt: formatMessageTime(first.created_at),
      type: 'reach-out',
    });
  }
  return events;
}

export function engagementRowToOpportunity(
  row: EngagementRow,
  messages: MessageRow[],
  lastReadAt: string | null,
): ApplicantOpportunity {
  const biz = row.businesses;
  const name = biz?.name ?? 'Company';
  const industry = biz?.industry ?? '—';
  const sizeRaw = biz?.size ?? '';
  const sizeLabel =
    sizeRaw && !String(sizeRaw).includes('employee') ? `${sizeRaw} employees` : String(sizeRaw || '—');
  const intro = biz?.description ?? '';
  const role = row.roles;
  const title = role?.title ?? 'Open role';
  const location = role?.location ?? '—';
  const employmentType = role?.role_type ?? 'Full-time';
  const stage = mapDbStageToUi(row.stage);
  const msgRows = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const unreadCount = countUnreadEmployerMessages(msgRows, lastReadAt);
  const lastMsg = msgRows[msgRows.length - 1];
  const lastUpdate = lastMsg ? formatMessageTime(lastMsg.created_at) : formatMessageTime(row.updated_at);

  const employerMsgs = msgRows.filter((m) => m.sender === 'employer');
  const reachOut = employerMsgs[employerMsgs.length - 1]?.body ?? '';

  return {
    id: row.id,
    engagementId: row.id,
    business: {
      name,
      industry,
      size: sizeLabel,
      intro: intro || `${name} is interested in your profile.`,
    },
    role: {
      title,
      location,
      employmentType,
      sector: industry,
    },
    contact: {
      name: 'Hiring team',
      title: 'Recruiting',
    },
    matchScore: row.match_score ?? 0,
    status: stage,
    reachOutMessage: reachOut,
    unread: unreadCount > 0,
    lastUpdate,
    whyMatches: intro
      ? [intro.slice(0, 280) + (intro.length > 280 ? '…' : '')]
      : [`${name} matched your profile on CMe.`],
    messages: buildMessages(msgRows),
    timeline: buildTimeline(row.id, name, msgRows),
    nextAction: defaultNextAction(stage),
    applicantResponseState: msgRows.some((m) => m.sender === 'candidate') ? 'interested' : 'not-responded',
    saved: false,
    company: name,
    location,
    employmentType,
    sector: industry,
    unreadMessages: unreadCount,
  };
}

/** Load engagements for the signed-in candidate profile, with messages and read state.
 *  Uses separate table queries instead of PostgREST embeds so RLS + schema hints cannot
 *  fail the entire request when nested `businesses(...)`/`roles(...)` error (e.g. PGRST errors).
 */
export async function fetchApplicantOpportunities(
  supabase: SupabaseClient,
  candidateProfileId: string,
): Promise<ApplicantOpportunity[]> {
  const { data: engsRaw, error: engErr } = await supabase
    .from('engagements')
    .select('id, stage, match_score, created_at, updated_at, business_id, role_id')
    .eq('candidate_id', candidateProfileId)
    .order('updated_at', { ascending: false });

  if (engErr) throw engErr;
  if (!engsRaw?.length) return [];

  const engs = engsRaw as Array<{
    id: string;
    stage: string | null;
    match_score: number | null;
    created_at: string;
    updated_at: string;
    business_id: string;
    role_id: string | null;
  }>;

  const businessIds = [...new Set(engs.map((e) => e.business_id))];
  const roleIds = [...new Set(engs.map((e) => e.role_id).filter((id): id is string => id != null && id !== ''))];

  const { data: businessRows, error: bErr } = await supabase
    .from('businesses')
    .select('id, name, industry, size, description')
    .in('id', businessIds);

  if (bErr) throw bErr;

  let roleRows: Array<{
    id: string;
    title: string;
    location: string | null;
    role_type: string | null;
  }> = [];

  if (roleIds.length > 0) {
    const { data: rData, error: rErr } = await supabase
      .from('roles')
      .select('id, title, location, role_type')
      .in('id', roleIds);
    if (rErr) throw rErr;
    roleRows = (rData ?? []) as typeof roleRows;
  }

  const bizMap = new Map((businessRows ?? []).map((b) => [b.id as string, b as NonNullable<BusinessEmbed>]));
  const roleMap = new Map(roleRows.map((r) => [r.id, r as NonNullable<RoleEmbed>]));

  const ids = engs.map((e) => e.id);

  const [{ data: msgs, error: msgErr }, { data: reads, error: readErr }] = await Promise.all([
    supabase
      .from('engagement_messages')
      .select('id, engagement_id, sender, body, created_at')
      .in('engagement_id', ids)
      .order('created_at', { ascending: true }),
    supabase.from('engagement_read_state').select('engagement_id, last_read_at').in('engagement_id', ids),
  ]);

  if (msgErr) console.warn('[CMe] engagement_messages select:', msgErr.message);
  if (readErr) console.warn('[CMe] engagement_read_state select:', readErr.message);

  const byEng = new Map<string, MessageRow[]>();
  for (const m of (msgs ?? []) as MessageRow[]) {
    const list = byEng.get(m.engagement_id) ?? [];
    list.push(m);
    byEng.set(m.engagement_id, list);
  }
  const readMap = new Map<string, string>();
  for (const r of (reads ?? []) as ReadRow[]) {
    readMap.set(r.engagement_id, r.last_read_at);
  }

  return engs.map((e) => {
    const row: EngagementRow = {
      ...e,
      businesses: bizMap.get(e.business_id) ?? null,
      roles: e.role_id ? roleMap.get(e.role_id) ?? null : null,
    };
    return engagementRowToOpportunity(row, byEng.get(row.id) ?? [], readMap.get(row.id) ?? null);
  });
}

export async function insertCandidateEngagementMessage(
  supabase: SupabaseClient,
  engagementId: string,
  body: string,
): Promise<void> {
  const { error } = await supabase.from('engagement_messages').insert({
    engagement_id: engagementId,
    sender: 'candidate',
    body,
  });
  if (error) throw error;
  const { error: upErr } = await supabase
    .from('engagements')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', engagementId);
  if (upErr) throw upErr;
}

export async function upsertEngagementReadState(
  supabase: SupabaseClient,
  engagementId: string,
  candidateProfileId: string,
): Promise<void> {
  const { error } = await supabase.from('engagement_read_state').upsert(
    {
      engagement_id: engagementId,
      candidate_id: candidateProfileId,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: 'engagement_id' },
  );
  if (error) throw error;
}

export async function updateEngagementStageFromApplicant(
  supabase: SupabaseClient,
  engagementId: string,
  stage: EmployerLikeStage,
): Promise<void> {
  const { error } = await supabase
    .from('engagements')
    .update({ stage: mapUiStageToDb(stage), updated_at: new Date().toISOString() })
    .eq('id', engagementId);
  if (error) throw error;
}
