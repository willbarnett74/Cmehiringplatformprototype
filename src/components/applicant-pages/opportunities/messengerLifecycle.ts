import type { EmployerLikeStage } from '../../../lib/applicantOpportunitiesMock';
import { applicantLifecycleConfig } from '../../../lib/applicantOpportunitiesMock';

/** Canonical stage flow for the messenger stage picker (README order). */
export const STAGE_PICKER_ORDER: EmployerLikeStage[] = [
  'discovered',
  'contacted',
  'responded',
  'interviewing',
  'decision',
  'hired',
  'rejected',
];

/** Filter chip order: All first, then stages that typically have volume in mock data. */
export const MESSENGER_FILTER_ORDER = [
  'all',
  'contacted',
  'responded',
  'interviewing',
  'decision',
  'discovered',
  'hired',
  'rejected',
] as const;

export type MessengerFilterStage = (typeof MESSENGER_FILTER_ORDER)[number];

export function messengerStageUi(stage: EmployerLikeStage) {
  return applicantLifecycleConfig[stage];
}

/** Dot color for the "All" filter chip. */
export const MESSENGER_FILTER_ALL_DOT = '#9CA3AF';
