/**
 * Trigger Engine — Spec 9
 *
 * Determines which post-hire triggers are due based on hired_date.
 * In production this logic runs inside a Supabase pg_cron daily job
 * (supabase/functions/daily-trigger-check/index.ts).
 * This module is the client-side equivalent for prototype/testing use.
 */

export type TriggerType =
  | 'review_due_30'
  | 'review_due_90'
  | 'pulse_check_30'
  | 'pulse_check_90'
  | 'reminder_30'
  | 'reminder_90';

export interface Engagement {
  id: string;
  candidateName: string;
  employerName: string;
  hiredDate: Date;
  stage: string;
  // Completion flags (from performance_snapshots / pulse_checks tables in production)
  snapshot30Completed: boolean;
  snapshot90Completed: boolean;
  pulse30Completed: boolean;
  pulse90Completed: boolean;
  // When the review-due notification was last sent (to track reminder eligibility)
  reviewDueNotifiedAt30?: Date;
  reviewDueNotifiedAt90?: Date;
  reminderCount30: number;
  reminderCount90: number;
}

export interface TriggerResult {
  engagementId: string;
  candidateName: string;
  triggerType: TriggerType;
  daysPostHire: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const REMINDER_WINDOW_DAYS = 7;
const MAX_REMINDERS = 2;

function daysSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);
}

/**
 * Check all engagements and return which triggers should fire today.
 * Call this once per day (mirroring the pg_cron schedule).
 */
export function checkTriggers(engagements: Engagement[]): TriggerResult[] {
  const results: TriggerResult[] = [];

  for (const eng of engagements) {
    if (eng.stage !== 'hired') continue;

    const daysPostHire = daysSince(eng.hiredDate);

    // ── 30-day employer review ──────────────────────────────────────────────
    if (daysPostHire >= 30 && !eng.snapshot30Completed) {
      // Only emit the initial trigger once (first time we cross 30 days)
      if (!eng.reviewDueNotifiedAt30) {
        results.push({
          engagementId: eng.id,
          candidateName: eng.candidateName,
          triggerType: 'review_due_30',
          daysPostHire,
        });
      } else {
        // Reminder logic: fire after 7 days of inaction, max 2 reminders
        const daysSinceNotified = daysSince(eng.reviewDueNotifiedAt30);
        if (daysSinceNotified >= REMINDER_WINDOW_DAYS && eng.reminderCount30 < MAX_REMINDERS) {
          results.push({
            engagementId: eng.id,
            candidateName: eng.candidateName,
            triggerType: 'reminder_30',
            daysPostHire,
          });
        }
      }
    }

    // ── 30-day candidate pulse ──────────────────────────────────────────────
    if (daysPostHire >= 30 && !eng.pulse30Completed) {
      results.push({
        engagementId: eng.id,
        candidateName: eng.candidateName,
        triggerType: 'pulse_check_30',
        daysPostHire,
      });
    }

    // ── 90-day employer review (only if 30-day was completed) ───────────────
    if (daysPostHire >= 90 && !eng.snapshot90Completed && eng.snapshot30Completed) {
      if (!eng.reviewDueNotifiedAt90) {
        results.push({
          engagementId: eng.id,
          candidateName: eng.candidateName,
          triggerType: 'review_due_90',
          daysPostHire,
        });
      } else {
        const daysSinceNotified = daysSince(eng.reviewDueNotifiedAt90);
        if (daysSinceNotified >= REMINDER_WINDOW_DAYS && eng.reminderCount90 < MAX_REMINDERS) {
          results.push({
            engagementId: eng.id,
            candidateName: eng.candidateName,
            triggerType: 'reminder_90',
            daysPostHire,
          });
        }
      }
    }

    // ── 90-day candidate pulse (only if 30-day pulse was completed) ─────────
    if (daysPostHire >= 90 && !eng.pulse90Completed && eng.pulse30Completed) {
      results.push({
        engagementId: eng.id,
        candidateName: eng.candidateName,
        triggerType: 'pulse_check_90',
        daysPostHire,
      });
    }
  }

  return results;
}

/**
 * Manually fire a trigger for testing without waiting for time to elapse.
 * Used by the dev "Trigger review" button in the UI.
 */
export function manuallyFireTrigger(
  engagement: Engagement,
  triggerType: TriggerType,
): TriggerResult {
  return {
    engagementId: engagement.id,
    candidateName: engagement.candidateName,
    triggerType,
    daysPostHire: daysSince(engagement.hiredDate),
  };
}
