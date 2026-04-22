/**
 * Supabase Edge Function: send-pulse-check — Spec 9
 *
 * Called by daily-trigger-check when a 30 or 90-day pulse check is due.
 * Responsibilities:
 *  1. Generate a signed JWT token (short-lived, single-use) for the pulse check URL
 *  2. Insert a notification record for the candidate
 *  3. Call send-email to deliver the pulse check invitation
 *
 * Request body:
 *  {
 *    engagementId: string,
 *    candidateId:  string,
 *    employerName: string,
 *    pulseDay:     30 | 90
 *  }
 */

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const JWT_SECRET = Deno.env.get('PULSE_CHECK_JWT_SECRET')!;

/**
 * Generate a signed token for the pulse check URL.
 * In production use the jose or djwt library available in Deno:
 *   import { create } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
 */
async function generatePulseToken(engagementId: string, candidateId: string, pulseDay: number): Promise<string> {
  // Placeholder — replace with actual JWT signing in production
  // const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  // return create({ alg: "HS256", typ: "JWT" }, { sub: candidateId, engagement_id: engagementId, pulse_day: pulseDay, exp: Date.now() / 1000 + 7 * 24 * 60 * 60 }, key);
  return btoa(JSON.stringify({ engagementId, candidateId, pulseDay, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
}

Deno.serve(async (req: Request) => {
  try {
    const { engagementId, candidateId, employerName, pulseDay } = await req.json();

    // ── 1. Fetch applicant → profile (email / name live on profiles) ─────────
    const applicantRes = await fetch(
      `${SUPABASE_URL}/rest/v1/candidate_profiles?id=eq.${candidateId}&select=user_id`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );
    const applicants = await applicantRes.json() as Array<{ user_id: string }>;
    const applicant = applicants[0];
    if (!applicant) throw new Error(`Applicant profile ${candidateId} not found`);

    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${applicant.user_id}&select=email,full_name`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );
    const profiles = await profileRes.json() as Array<{ email: string; full_name: string | null }>;
    const candidate = profiles[0];
    if (!candidate) throw new Error(`Profile for applicant ${candidateId} not found`);

    // ── 2. Generate signed pulse check token ────────────────────────────────
    const token = await generatePulseToken(engagementId, candidateId, pulseDay);
    const pulseUrl = `${SUPABASE_URL.replace('/rest', '')}/pulse?token=${token}`;

    // ── 3. Insert in-app notification for candidate ──────────────────────────
    await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: applicant.user_id,
        type: 'pulse_check',
        engagement_id: engagementId,
        message: `Quick check-in: how's your new role going after ${pulseDay} days? Takes 2 minutes.`,
        action_url: pulseUrl,
      }),
    });

    // ── 4. Send email via send-email function ────────────────────────────────
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: candidate.email,
        subject: `Quick check-in on your new role`,
        template: 'pulse_check',
        variables: {
          candidate_name: candidate.full_name ?? 'there',
          employer_name: employerName,
          pulse_day: pulseDay,
          pulse_url: pulseUrl,
        },
      }),
    });

    return new Response(
      JSON.stringify({ ok: true, candidateId, pulseDay, pulseUrl }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('send-pulse-check error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
