import type { ApplicantCTAState, ApplicantOpportunity, EmployerLikeStage } from '../../../lib/applicantOpportunitiesMock';
import type { MessengerFilterStage } from './messengerLifecycle';

export function nowThreadMessageLabel(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export const AVATAR_TONES = [
  { bg: '#fef3c7', fg: '#b45309' },
  { bg: '#e0f2fe', fg: '#0369a1' },
  { bg: '#ede9fe', fg: '#6d28d9' },
  { bg: '#dcfce7', fg: '#15803d' },
  { bg: '#fee2e2', fg: '#b91c1c' },
  { bg: '#fce7f3', fg: '#be185d' },
] as const;

export function hashCompanyTone(name: string): (typeof AVATAR_TONES)[number] {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  const n = name.trim();
  return n.length >= 2 ? n.slice(0, 2).toUpperCase() : n.toUpperCase() || '—';
}

export function isThreadUnread(o: ApplicantOpportunity): boolean {
  return Boolean(o.unread || o.unreadMessages > 0);
}

/** Split into unread vs read buckets; order within each bucket matches input order. */
export function partitionUnreadEarlier(threads: ApplicantOpportunity[]) {
  const unread: ApplicantOpportunity[] = [];
  const read: ApplicantOpportunity[] = [];
  for (const t of threads) {
    if (isThreadUnread(t)) unread.push(t);
    else read.push(t);
  }
  return { unread, read };
}

export function filterThreads(
  threads: ApplicantOpportunity[],
  opts: { query: string; stage: MessengerFilterStage },
): ApplicantOpportunity[] {
  const q = opts.query.trim().toLowerCase();
  let out = threads;
  if (opts.stage !== 'all') {
    out = out.filter((t) => t.status === opts.stage);
  }
  if (!q) return out;
  return out.filter((t) => {
    const hay = `${t.business.name} ${t.role.title} ${t.company}`.toLowerCase();
    return hay.includes(q);
  });
}

export function threadPreviewLast(o: ApplicantOpportunity): string {
  const last = o.messages[o.messages.length - 1];
  if (last) {
    const prefix = last.sender === 'applicant' ? 'You: ' : '';
    return prefix + last.body;
  }
  if (o.reachOutMessage) return o.reachOutMessage;
  return '';
}

export function compactListTimestamp(lastUpdate: string): string {
  const s = lastUpdate.trim();
  const m = /^Yesterday,\s*(.+)$/i.exec(s);
  if (m) return `y ${m[1]}`;
  return s;
}

export function matchScoreVisual(score: number): { star: string; fitLabel: string } {
  if (score >= 90) return { star: '#2563eb', fitLabel: 'Excellent fit' };
  if (score >= 80) return { star: '#5aa1f2', fitLabel: 'Strong fit' };
  return { star: '#7dbbff', fitLabel: 'Good fit' };
}

const REPLY_SETS: Partial<Record<ApplicantCTAState, string[]>> = {
  reply: ["Just checking in — any updates?", 'Happy to share more work samples.', "Thanks — I'll follow up soon."],
  'show-interest': [
    "I'm interested — tell me more",
    "What's the team like?",
    'What does success look like in 6 months?',
  ],
  schedule: ['Tuesday or Thursday afternoon works for me.', 'Could we do a 30-min intro this week?', 'What times work on your side?'],
  'review-decision': [
    "Thanks — when do you need a decision?",
    'Can we schedule a call?',
    "I'd like to think it over",
  ],
  'view-summary': ['Save for later — thanks.', 'Looks promising — keeping an eye on this.'],
  closed: ['Thanks for letting me know.', 'Appreciate the update.'],
  manual: ['Following up on our thread.', 'Let me know if you need anything else from me.'],
};

const STAGE_FALLBACK: Partial<Record<EmployerLikeStage, string[]>> = {
  contacted: ["I'm interested — tell me more", 'Could you share more about the role?', 'What are the next steps?'],
  responded: ['Any updates on timing?', 'Happy to answer more questions.', 'Still very interested.'],
  interviewing: ['Looking forward to the next conversation.', 'Thanks for coordinating.', 'See you then.'],
  decision: ['Thanks for the update.', 'Can we discuss compensation?', 'I have a quick question.'],
  discovered: ['Tell me more about this match.', "I'd like to learn more.", 'What should I know about the team?'],
  hired: ['Excited to get started.', 'Thanks again — see you soon.'],
  rejected: ['Thanks for the consideration.', 'Appreciate the transparency.'],
};

export function suggestedRepliesForOpportunity(o: ApplicantOpportunity): string[] {
  const fromState = REPLY_SETS[o.nextAction.state];
  if (fromState?.length) return fromState.slice(0, 3);
  const fromStage = STAGE_FALLBACK[o.status];
  if (fromStage?.length) return fromStage.slice(0, 3);
  return ['Thanks for reaching out.', 'Could you share more details?', "I'm interested in learning more."];
}

/** Cosmetic only: show “online” when business recently reached out and thread is unread. */
export function threadShowsOnlineIndicator(o: ApplicantOpportunity): boolean {
  return o.status === 'contacted' && isThreadUnread(o);
}
