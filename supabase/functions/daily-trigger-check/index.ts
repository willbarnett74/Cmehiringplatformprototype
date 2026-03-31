/**
 * Supabase Edge Function: daily-trigger-check — Spec 9
 *
 * Runs on a daily pg_cron schedule (09:00 NZST) and:
 *  1. Queries all hired engagements with pending reviews / pulse checks
 *  2. Inserts notification records for due reviews
 *  3. Calls send-pulse-check for candidate pulse notifications
 *  4. Handles reminder logic (7-day window, max 2 reminders)
 *
 * Cron schedule (set in supabase/config.toml or via Dashboard):
 *   "0 21 * * *"  (21:00 UTC = 09:00 NZST)
 *
 * To invoke manually for testing:
 *   supabase functions invoke daily-trigger-check --no-verify-jwt
 */

// Deno / Supabase Edge Function runtime
declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function supabaseQuery(path: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase query failed: ${res.status} ${body}`);
  }
  return res.json();
}

Deno.serve(async (_req: Request) => {
  try {
    const today = new Date();
    const results: string[] = [];

    // ── 1. Fetch all hired engagements ───────────────────────────────────────
    const engagements: Array<{
      id: string;
      candidate_id: string;
      employer_id: string;
      hired_date: string;
      candidate_name: string;
      employer_name: string;
    }> = await supabaseQuery(
      "engagements?stage=eq.hired&hired_date=not.is.null&select=id,candidate_id,employer_id,hired_date,candidate_name,employer_name",
    );

    for (const eng of engagements) {
      const hiredDate = new Date(eng.hired_date);
      const daysPostHire = Math.floor(
        (today.getTime() - hiredDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // ── 2. Check which snapshots exist ────────────────────────────────────
      const snapshots: Array<{ snapshot_day: number }> = await supabaseQuery(
        `performance_snapshots?engagement_id=eq.${eng.id}&select=snapshot_day`,
      );
      const snapshot30Done = snapshots.some((s) => s.snapshot_day === 30);
      const snapshot90Done = snapshots.some((s) => s.snapshot_day === 90);

      // ── 3. Check which pulses exist ───────────────────────────────────────
      const pulses: Array<{ pulse_day: number }> = await supabaseQuery(
        `motivational_pulse_checks?engagement_id=eq.${eng.id}&select=pulse_day`,
      );
      const pulse30Done = pulses.some((p) => p.pulse_day === 30);
      const pulse90Done = pulses.some((p) => p.pulse_day === 90);

      // ── 4. Check existing notifications (to avoid duplicates & reminders) ──
      const existingNotifs: Array<{ type: string; created_at: string }> = await supabaseQuery(
        `notifications?engagement_id=eq.${eng.id}&select=type,created_at`,
      );

      // ── 30-day employer review ─────────────────────────────────────────────
      if (daysPostHire >= 30 && !snapshot30Done) {
        const already = existingNotifs.filter((n) => n.type === 'review_due');
        if (already.length === 0) {
          await supabaseQuery('notifications', {
            method: 'POST',
            body: JSON.stringify({
              user_id: eng.employer_id,
              type: 'review_due',
              engagement_id: eng.id,
              message: `${eng.candidate_name}'s 30-day review is due. Complete their performance snapshot to strengthen your hiring insights.`,
              action_url: `/pipeline?engagement=${eng.id}&review=30`,
            }),
          });
          results.push(`review_due_30 → ${eng.candidate_name}`);
        } else {
          // Reminder check: 7 days since last notification, max 2
          const lastNotif = already[already.length - 1];
          const daysSinceLast = Math.floor(
            (today.getTime() - new Date(lastNotif.created_at).getTime()) / (1000 * 60 * 60 * 24),
          );
          if (daysSinceLast >= 7 && already.length < 3) {
            await supabaseQuery('notifications', {
              method: 'POST',
              body: JSON.stringify({
                user_id: eng.employer_id,
                type: 'reminder',
                engagement_id: eng.id,
                message: `Reminder: ${eng.candidate_name}'s 30-day performance review is still pending.`,
                action_url: `/pipeline?engagement=${eng.id}&review=30`,
              }),
            });
            results.push(`reminder_30 → ${eng.candidate_name}`);
          }
        }
      }

      // ── 30-day candidate pulse ─────────────────────────────────────────────
      if (daysPostHire >= 30 && !pulse30Done) {
        const already = existingNotifs.filter((n) => n.type === 'pulse_check');
        if (already.length === 0) {
          // Delegate to send-pulse-check Edge Function (generates JWT + sends email)
          await fetch(`${SUPABASE_URL}/functions/v1/send-pulse-check`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              engagementId: eng.id,
              candidateId: eng.candidate_id,
              employerName: eng.employer_name,
              pulseDay: 30,
            }),
          });
          results.push(`pulse_check_30 → ${eng.candidate_name}`);
        }
      }

      // ── 90-day employer review (requires 30-day completed) ─────────────────
      if (daysPostHire >= 90 && !snapshot90Done && snapshot30Done) {
        const already = existingNotifs.filter(
          (n) => n.type === 'review_due' && n.created_at > new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        );
        if (already.length === 0) {
          await supabaseQuery('notifications', {
            method: 'POST',
            body: JSON.stringify({
              user_id: eng.employer_id,
              type: 'review_due',
              engagement_id: eng.id,
              message: `${eng.candidate_name}'s 90-day review is due. Complete their performance snapshot to strengthen your hiring insights.`,
              action_url: `/pipeline?engagement=${eng.id}&review=90`,
            }),
          });
          results.push(`review_due_90 → ${eng.candidate_name}`);
        }
      }

      // ── 90-day candidate pulse (requires 30-day pulse completed) ───────────
      if (daysPostHire >= 90 && !pulse90Done && pulse30Done) {
        const already = existingNotifs.filter(
          (n) => n.type === 'pulse_check' && n.created_at > new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        );
        if (already.length === 0) {
          await fetch(`${SUPABASE_URL}/functions/v1/send-pulse-check`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              engagementId: eng.id,
              candidateId: eng.candidate_id,
              employerName: eng.employer_name,
              pulseDay: 90,
            }),
          });
          results.push(`pulse_check_90 → ${eng.candidate_name}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, triggered: results.length, results }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('daily-trigger-check error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
