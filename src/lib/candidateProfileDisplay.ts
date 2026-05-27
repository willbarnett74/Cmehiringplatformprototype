import type { Candidate } from '../components/types/employer';

export function formatLinkedInHref(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes('linkedin.com')) return `https://${trimmed.replace(/^\/+/, '')}`;
  return `https://linkedin.com/in/${trimmed.replace(/^@/, '')}`;
}

export function inferReadinessFromSituation(currentSituation: string | null | undefined): {
  transitioning?: boolean;
  openToChange?: boolean;
  readyToStepUp?: boolean;
  retrained?: boolean;
} {
  const s = (currentSituation ?? '').toLowerCase();
  if (!s.trim()) return {};
  return {
    transitioning: /\btransition|\breturn|\bcareer change|\bre-enter|\bbreak from/.test(s),
    openToChange: /\bopen to|\bexplor|\bchange|\bpivot|\bnew direction/.test(s),
    readyToStepUp: /\bstep up|\blead|\bsenior|\bmanage|\bnext level/.test(s),
    retrained: /\bretrain|\breskill|\bupskill|\bbootcamp|\bcertif/.test(s),
  };
}

const COMPLETENESS_FIELDS: (keyof Candidate)[] = [
  'name',
  'role',
  'location',
  'experienceNarrative',
  'educationSummary',
  'oneThingToKnow',
  'strength1',
  'workingContext',
  'phone',
  'linkedinUrl',
  'availability',
  'totalExperience',
];

export function computeProfileCompleteness(candidate: Candidate): number {
  let filled = 0;
  for (const key of COMPLETENESS_FIELDS) {
    const v = candidate[key];
    if (v == null) continue;
    if (typeof v === 'string' && !v.trim()) continue;
    if (typeof v === 'number' && Number.isNaN(v)) continue;
    filled += 1;
  }
  if (candidate.dimensionScores || candidate.trait_scores) filled += 1;
  const total = COMPLETENESS_FIELDS.length + 1;
  return Math.min(100, Math.round((filled / total) * 100));
}

export function candidateTagline(candidate: Candidate): string | null {
  return (
    candidate.oneThingToKnow?.trim() ||
    candidate.workingContext?.trim() ||
    candidate.openContext?.trim() ||
    null
  );
}

export function candidateSummary(candidate: Candidate): string {
  const narrative = candidate.experienceNarrative?.trim();
  if (narrative) {
    return narrative.length > 320 ? `${narrative.slice(0, 317)}…` : narrative;
  }
  const parts = [
    candidate.enjoyedMost?.trim(),
    candidate.educationSummary?.trim(),
    candidate.currentSituation?.trim(),
  ].filter(Boolean);
  if (parts.length) return parts.join(' ');
  const first = candidate.name.split(' ')[0] || 'This candidate';
  return `${first} has not added a profile summary yet. Trait scores and preferences below reflect what they have shared so far.`;
}

export function formatSalary(min: number | null | undefined, currency: string | null | undefined): string | null {
  if (min == null || min <= 0) return null;
  const cur = currency?.trim() || 'NZD';
  try {
    return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(min);
  } catch {
    return `${cur} ${min.toLocaleString()}`;
  }
}

export function listOrDash(values: string[] | null | undefined): string {
  if (!values?.length) return '—';
  return values.join(', ');
}
