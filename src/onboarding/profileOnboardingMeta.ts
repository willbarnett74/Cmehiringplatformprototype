import type { SupabaseClient } from '@supabase/supabase-js';
import type { OnboardingStepDb } from '../lib/onboardingRouting';

export type ProfileOnboardingMeta = {
  userId: string;
  onboarding_step: OnboardingStepDb;
  onboarding_completed_at: string | null /** ISO string or null */;
};

function normalizeProfileRoleFromMetadata(value: unknown): 'candidate' | 'employer' {
  if (value === 'employer') return 'employer';
  if (value === 'candidate' || value === 'applicant') return 'candidate';
  return 'candidate';
}

function profileDisplayNameFromMetadata(meta: Record<string, unknown> | undefined): string | null {
  if (!meta) return null;
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (typeof meta.user_name === 'string' && meta.user_name.trim()) ||
    (typeof meta.preferred_username === 'string' && meta.preferred_username.trim()) ||
    '';
  return fullName || null;
}

async function ensureProfileRowForSession(
  supabase: SupabaseClient,
  sessionUserId: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== sessionUserId) return;

  const meta = (user.user_metadata as Record<string, unknown> | undefined) ?? undefined;
  const role = normalizeProfileRoleFromMetadata(meta?.role);
  const onboardingStep = role === 'employer' ? 'employer_company' : 'welcome';

  const { error } = await supabase.from('profiles').insert({
    id: sessionUserId,
    email: user.email ?? '',
    full_name: profileDisplayNameFromMetadata(meta),
    role,
    onboarding_complete: false,
    onboarding_step: onboardingStep,
    onboarding_completed_at: null,
    employer_status: role === 'employer' ? 'pending' : null,
  });

  if (error && error.code !== '23505') {
    throw error;
  }
}

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

/**
 * Load onboarding routing fields from profiles. If the URL-onboarding migration has not been
 * applied remotely, falls back to id-only select and defaults (welcome / not completed).
 */
export async function fetchProfileOnboardingMeta(
  supabase: SupabaseClient,
  sessionUserId: string,
): Promise<ProfileOnboardingMeta> {
  let withStep = await supabase
    .from('profiles')
    .select('onboarding_step, onboarding_completed_at')
    .eq('id', sessionUserId)
    .maybeSingle();

  if (!withStep.error && withStep.data == null) {
    await ensureProfileRowForSession(supabase, sessionUserId);
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
    return {
      userId: sessionUserId,
      onboarding_step: 'welcome',
      onboarding_completed_at: null,
    };
  }

  if (err.code === 'PGRST116') {
    await ensureProfileRowForSession(supabase, sessionUserId);
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
    return {
      userId: sessionUserId,
      onboarding_step: 'welcome',
      onboarding_completed_at: null,
    };
  }

  if (isMissingColumnOrSchemaError(err)) {
    console.warn(
      '[CMe] profiles.onboarding_step / onboarding_completed_at missing — using defaults. Apply supabase/migrations/20260504183000_profiles_onboarding_urls.sql on your project.',
    );
    const basic = await supabase.from('profiles').select('id').eq('id', sessionUserId).maybeSingle();
    if (basic.error) throw basic.error;
    if (!basic.data) throw new Error('Profile not found');
    return {
      userId: sessionUserId,
      onboarding_step: 'welcome',
      onboarding_completed_at: null,
    };
  }

  throw err;
}
