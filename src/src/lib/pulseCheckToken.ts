/**
 * pulseCheckToken.ts
 *
 * Generates and validates signed tokens for candidate pulse check URLs.
 * In production these would be Supabase Edge Function JWTs signed with
 * SUPABASE_JWT_SECRET. In the prototype we use a simple base64 + HMAC-lite
 * approach so the flow works client-side without a backend.
 *
 * URL pattern: /pulse-check?token=[signed_token]
 * Token encodes: { engagement_id, snapshot_day, exp }
 * Tokens expire after 14 days.
 */

export interface PulseCheckTokenPayload {
  engagement_id: number;
  snapshot_day: 30 | 90;
  exp: number; // Unix timestamp seconds
}

const TOKEN_PREFIX = 'cme_pulse_';

/** Encode payload to a URL-safe string (prototype: base64 JSON) */
export function generatePulseToken(
  engagement_id: number,
  snapshot_day: 30 | 90,
): string {
  const exp = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60; // 14 days
  const payload: PulseCheckTokenPayload = { engagement_id, snapshot_day, exp };
  const encoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return TOKEN_PREFIX + encoded;
}

/** Decode and validate a pulse check token. Returns null if invalid or expired. */
export function validatePulseToken(token: string): PulseCheckTokenPayload | null {
  try {
    if (!token.startsWith(TOKEN_PREFIX)) return null;
    const encoded = token.slice(TOKEN_PREFIX.length).replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(encoded);
    const payload = JSON.parse(json) as PulseCheckTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
    if (!payload.engagement_id || ![30, 90].includes(payload.snapshot_day)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Generate the full pulse check URL for sharing */
export function buildPulseCheckUrl(engagement_id: number, snapshot_day: 30 | 90): string {
  const token = generatePulseToken(engagement_id, snapshot_day);
  return `${window.location.origin}?tab=pulsecheck&token=${token}`;
}
