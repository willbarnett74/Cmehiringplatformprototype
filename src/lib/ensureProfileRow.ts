import type { SupabaseClient } from '@supabase/supabase-js';

export class InvalidAuthSessionError extends Error {
  constructor(message = 'Invalid auth session') {
    super(message);
    this.name = 'InvalidAuthSessionError';
  }
}

type EnsureProfileRowResult =
  | { ok: true }
  | { ok: false; reason: 'not_authenticated' | 'auth_user_missing' | 'rpc_failed' };

function normalizeProfileRoleFromMetadata(value: unknown): 'candidate' | 'employer' {
  if (value === 'employer') return 'employer';
  if (value === 'applicant' || value === 'candidate') return 'candidate';
  return 'candidate';
}

/** Validates the JWT with Supabase Auth (not just local storage). */
export async function validateAuthSession(
  supabase: SupabaseClient,
  expectedUserId?: string | null,
): Promise<{ userId: string } | InvalidAuthSessionError> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return new InvalidAuthSessionError(error?.message ?? 'Session could not be verified');
  }
  if (expectedUserId && user.id !== expectedUserId) {
    return new InvalidAuthSessionError('Session user mismatch');
  }
  return { userId: user.id };
}

export async function clearInvalidAuthSession(supabase: SupabaseClient): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
}

export function isInvalidAuthSessionError(error: unknown): error is InvalidAuthSessionError {
  return error instanceof InvalidAuthSessionError;
}

/**
 * Ensures public.profiles exists for the current auth user via security-definer RPC.
 * Falls back to a direct insert only when the RPC is not deployed yet.
 */
export async function ensureProfileRowForSession(
  supabase: SupabaseClient,
  sessionUserId: string,
  roleHint: 'candidate' | 'employer' | null = null,
): Promise<EnsureProfileRowResult> {
  const validated = await validateAuthSession(supabase, sessionUserId);
  if (validated instanceof InvalidAuthSessionError) {
    return { ok: false, reason: 'not_authenticated' };
  }

  const hint =
    roleHint === 'employer' ? 'employer' : roleHint === 'candidate' ? 'candidate' : null;

  const { data, error } = await supabase.rpc('ensure_own_profile_row', {
    p_role_hint: hint,
  });

  if (!error && data && typeof data === 'object') {
    const payload = data as { ok?: boolean; reason?: string };
    if (payload.ok === false && payload.reason === 'auth_user_missing') {
      return { ok: false, reason: 'auth_user_missing' };
    }
    if (payload.ok === false && payload.reason === 'not_authenticated') {
      return { ok: false, reason: 'not_authenticated' };
    }
    if (payload.ok === true) {
      return { ok: true };
    }
  }

  if (error) {
    const msg = (error.message ?? '').toLowerCase();
    const rpcMissing =
      error.code === 'PGRST202' ||
      error.code === '42883' ||
      msg.includes('ensure_own_profile_row') ||
      msg.includes('could not find the function');

    if (!rpcMissing) {
      console.warn('[CMe] ensure_own_profile_row failed:', error.message);
      return { ok: false, reason: 'rpc_failed' };
    }
  }

  // Legacy fallback when migration has not been applied remotely.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== sessionUserId) {
    return { ok: false, reason: 'not_authenticated' };
  }

  const meta = (user.user_metadata as Record<string, unknown> | undefined) ?? undefined;
  const role = roleHint ?? normalizeProfileRoleFromMetadata(meta?.role);
  const onboardingStep = role === 'employer' ? 'employer_company' : 'welcome';

  const { error: insertError } = await supabase.from('profiles').insert({
    id: sessionUserId,
    email: user.email ?? '',
    full_name:
      (typeof meta?.full_name === 'string' && meta.full_name.trim()) ||
      (typeof meta?.name === 'string' && meta.name.trim()) ||
      (typeof meta?.user_name === 'string' && meta.user_name.trim()) ||
      (typeof meta?.preferred_username === 'string' && meta.preferred_username.trim()) ||
      null,
    role,
    onboarding_complete: false,
    onboarding_step: onboardingStep,
    onboarding_completed_at: null,
    employer_status: role === 'employer' ? 'pending' : null,
  });

  if (insertError && insertError.code !== '23505') {
    console.warn('[CMe] ensure profile row failed:', insertError.message);
    if (insertError.code === '23503') {
      return { ok: false, reason: 'auth_user_missing' };
    }
    return { ok: false, reason: 'rpc_failed' };
  }

  return { ok: true };
}
