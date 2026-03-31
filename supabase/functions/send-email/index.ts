/**
 * Supabase Edge Function: send-email — Spec 9
 *
 * Generic transactional email sender using Resend (or compatible API).
 * Called by other Edge Functions (send-pulse-check, daily-trigger-check).
 *
 * Request body:
 *  {
 *    to:        string           — recipient email
 *    subject:   string
 *    template:  'pulse_check' | 'employer_review_reminder' | 'stage_change'
 *    variables: Record<string, string | number>
 *  }
 *
 * Setup: add RESEND_API_KEY to Supabase project secrets:
 *   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
 */

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'CMe <noreply@cme.app>';

// ── Email templates ───────────────────────────────────────────────────────────

type Template = 'pulse_check' | 'employer_review_reminder' | 'stage_change';

interface TemplateVars {
  candidate_name?: string;
  employer_name?: string;
  pulse_day?: number;
  pulse_url?: string;
  review_url?: string;
  stage?: string;
  company_name?: string;
  details_url?: string;
}

function renderTemplate(template: Template, vars: TemplateVars): { subject: string; html: string; text: string } {
  switch (template) {
    case 'pulse_check':
      return {
        subject: `Quick check-in on your new role`,
        html: `
          <p>Hi ${vars.candidate_name},</p>
          <p>It's been ${vars.pulse_day} days since you started at ${vars.employer_name}. We'd love a 2-minute check-in on how things are going.</p>
          <p><a href="${vars.pulse_url}" style="display:inline-block;padding:12px 24px;background:#7DBBFF;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Complete check-in</a></p>
          <p style="color:#9CA3AF;font-size:12px;">This link expires in 7 days.</p>
        `,
        text: `Hi ${vars.candidate_name},\n\nIt's been ${vars.pulse_day} days since you started at ${vars.employer_name}. We'd love a 2-minute check-in.\n\n${vars.pulse_url}`,
      };

    case 'employer_review_reminder':
      return {
        subject: `Performance review due for ${vars.candidate_name}`,
        html: `
          <p>Hi ${vars.employer_name},</p>
          <p>${vars.candidate_name}'s ${vars.pulse_day}-day review is ready. Your feedback helps CMe build better hiring insights for your team.</p>
          <p><a href="${vars.review_url}" style="display:inline-block;padding:12px 24px;background:#7DBBFF;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Complete review</a></p>
        `,
        text: `Hi ${vars.employer_name},\n\n${vars.candidate_name}'s ${vars.pulse_day}-day review is ready.\n\n${vars.review_url}`,
      };

    case 'stage_change':
      return {
        subject: `Update on your application with ${vars.company_name}`,
        html: `
          <p>Hi ${vars.candidate_name},</p>
          <p>Your application status with ${vars.company_name} has been updated to <strong>${vars.stage}</strong>.</p>
          <p><a href="${vars.details_url}" style="display:inline-block;padding:12px 24px;background:#7DBBFF;color:white;text-decoration:none;border-radius:8px;font-weight:600;">View details</a></p>
        `,
        text: `Hi ${vars.candidate_name},\n\nYour application status with ${vars.company_name} has been updated to ${vars.stage}.\n\n${vars.details_url}`,
      };
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  try {
    const { to, template, variables } = await req.json();

    const { subject, html, text } = renderTemplate(template as Template, variables as TemplateVars);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API error: ${res.status} ${body}`);
    }

    const data = await res.json();
    return new Response(
      JSON.stringify({ ok: true, id: data.id }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('send-email error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
