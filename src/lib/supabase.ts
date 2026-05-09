import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Env must be the Supabase **project URL** only (Dashboard → Settings → API → Project URL):
 *   https://YOUR_PROJECT_REF.supabase.co
 * Do not append /rest/v1 — that breaks auth (requests become .../rest/v1/auth/v1/... → 404).
 */
export function normalizeSupabaseProjectUrl(raw: string): string {
  let u = raw.trim().replace(/\/+$/, '');
  if (/\/rest\/v1$/i.test(u)) {
    u = u.replace(/\/rest\/v1$/i, '');
  }
  u = u.replace(/\/+$/, '');
  return u;
}

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
const supabaseUrl = normalizeSupabaseProjectUrl(rawSupabaseUrl);
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

if (/\/rest\/v1/i.test(rawSupabaseUrl)) {
  console.warn(
    '[CMe] VITE_SUPABASE_URL must be the project root only (https://….supabase.co). Removed /rest/v1 so auth uses /auth/v1 correctly.',
  );
}

let supabaseClient: SupabaseClient | null = null;
let hasValidSupabaseConfig = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    hasValidSupabaseConfig = true;
  } catch (error) {
    console.warn('[CMe] Supabase is not configured correctly:', error);
  }
}

export const isSupabaseConfigured = hasValidSupabaseConfig;
export const supabase = supabaseClient;
