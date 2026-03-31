/**
 * ReviewDueBanner.tsx
 *
 * Badge/banner shown on pipeline cards for hired candidates when a 30 or 90-day
 * review is due and has not yet been submitted.
 *
 * Spec 8 §1.1: A banner or badge appears on the candidate's card when a review
 * is due.
 */

import { ClipboardCheck } from 'lucide-react';

interface ReviewDueBannerProps {
  /** Days since hire — drives which snapshot window is due */
  daysSinceHire: number;
  /** Which snapshot days have already been submitted */
  completedSnapshotDays: number[];
  /** Called when the employer clicks to open the review form */
  onOpenReview: (snapshotDay: 30 | 90) => void;
  /** Compact mode — renders as a small badge (for card list rows) */
  compact?: boolean;
}

function getDueDay(
  daysSinceHire: number,
  completedSnapshotDays: number[],
): 30 | 90 | null {
  if (daysSinceHire >= 90 && !completedSnapshotDays.includes(90)) return 90;
  if (daysSinceHire >= 30 && !completedSnapshotDays.includes(30)) return 30;
  return null;
}

export function ReviewDueBanner({
  daysSinceHire,
  completedSnapshotDays,
  onOpenReview,
  compact = false,
}: ReviewDueBannerProps) {
  const dueDay = getDueDay(daysSinceHire, completedSnapshotDays);
  if (!dueDay) return null;

  if (compact) {
    return (
      <button
        onClick={() => onOpenReview(dueDay)}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full transition-colors"
        style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
        title={`${dueDay}-day review due — click to submit`}
      >
        <ClipboardCheck className="w-3 h-3" strokeWidth={2} />
        {dueDay}d review due
      </button>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl mb-3"
      style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#FEF3C7' }}
        >
          <ClipboardCheck className="w-4 h-4" strokeWidth={2} style={{ color: '#D97706' }} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: '#92400E' }}>
            {dueDay}-day review due
          </p>
          <p className="text-xs" style={{ color: '#B45309' }}>
            Performance snapshot, manager observation &amp; candidate pulse check
          </p>
        </div>
      </div>
      <button
        onClick={() => onOpenReview(dueDay)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: '#D97706', color: '#fff' }}
      >
        Submit review
      </button>
    </div>
  );
}

/** Helper exported for use in parent components */
export { getDueDay };
