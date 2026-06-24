import type { SupabaseClient } from '@supabase/supabase-js';
import type { OnboardingStepDb } from '../lib/onboardingRouting';
import {
  ensureProfileRowForSession,
  InvalidAuthSessionError,
  validateAuthSession,
} from '../lib/ensureProfileRow';

export type ProfileOnboardingMeta = {
  userId: string;
  onboarding_step: OnboardingStepDb;
  onboarding_completed_at: string | null /** ISO string or null */;
};

export { InvalidAuthSessionError };

/**
 * Postgres / PostgREST error when selected columns are not in the schema (migration not applied).
 */
function isMissingColumnOrSchemaError(error: { code?: string; message?: string }): boolean {
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();
  return (
    code === 'PGRST204' ||
    code === '42703' ||
    msg.includes('schema cache') ||
    msg.includes('onboarding_step') ||
    msg.includes('onboarding_completed_at') ||
    (msg.includes('column') && msg.includes('does not exist'))
  );
}

function welcomeFallback(userId: string): ProfileOnboardingMeta {
  return {
    userId,
    onboarding_step: 'welcome',
    onboarding_completed_at: null,
  };
}

/**
 * Load onboarding routing fields from profiles. If the URL-onboarding migration has not been
 * applied remotely, falls back to id-only select and defaults (welcome / not completed).
 */
export async function fetchProfileOnboardingMeta(
  supabase: SupabaseClient,
  sessionUserId: string,
): Promise<ProfileOnboardingMeta> {
  const validated = await validateAuthSession(supabase, sessionUserId);
  if (validated instanceof InvalidAuthSessionError) {
    throw validated;
  }

  let withStep = await supabase
    .from('profiles')
    .select('onboarding_step, onboarding_completed_at')
    .eq('id', sessionUserId)
    .maybeSingle();

  if (!withStep.error && withStep.data == null) {
    const ensured = await ensureProfileRowForSession(supabase, sessionUserId);
    if (!ensured.ok) {
      if (ensured.reason === 'not_authenticated' || ensured.reason === 'auth_user_missing') {
        throw new InvalidAuthSessionError();
      }
      return welcomeFallback(sessionUserId);
    }
    withStep = await supabase
      .from('profiles')
      .select('onboarding_step, onboarding_completed_at')
      .eq('id', sessionUserId)
      .maybeSingle();
  }

  if (!withStep.error && withStep.data != null) {
    const row = withStep.data as {
      onboarding_step: unknown;
      onboarding_completed_at: unknown;
    };
    return {
      userId: sessionUserId,
      onboarding_step: (row.onboarding_step ?? 'welcome') as OnboardingStepDb,
      onboarding_completed_at:
        typeof row.onboarding_completed_at === 'string' ? row.onboarding_completed_at : null,
    };
  }

  const err = withStep.error;
  if (!err) {
    return welcomeFallback(sessionUserId);
  }

  if (err.code === 'PGRST116') {
    const ensured = await ensureProfileRowForSession(supabase, sessionUserId);
    if (!ensured.ok) {
      if (ensured.reason === 'not_authenticated' || ensured.reason === 'auth_user_missing') {
        throw new InvalidAuthSessionError();
      }
      return welcomeFallback(sessionUserId);
    }
    const retry = await supabase
      .from('profiles')
      .select('onboarding_step, onboarding_completed_at')
      .eq('id', sessionUserId)
      .maybeSingle();
    if (!retry.error && retry.data != null) {
      const row = retry.data as {
        onboarding_step: unknown;
        onboarding_completed_at: unknown;
      };
      return {
        userId: sessionUserId,
        onboarding_step: (row.onboarding_step ?? 'welcome') as OnboardingStepDb,
        onboarding_completed_at:
          typeof row.onboarding_completed_at === 'string' ? row.onboarding_completed_at : null,
      };
    }
    return welcomeFallback(sessionUserId);
  }

  if (isMissingColumnOrSchemaError(err)) {
    console.warn(
      '[CMe] profiles.onboarding_step / onboarding_completed_at missing — using defaults. Apply supabase/migrations/20260504183000_profiles_onboarding_urls.sql on your project.',
    );
    const basic = await supabase.from('profiles').select('id').eq('id', sessionUserId).maybeSingle();
    if (basic.error) throw basic.error;
    if (!basic.data) return welcomeFallback(sessionUserId);
    return welcomeFallback(sessionUserId);
  }

  throw err;
}
