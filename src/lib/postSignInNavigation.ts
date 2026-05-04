import type { NavigateFunction } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Set by OnboardingSignInPage before navigating home; App reads once on mount. */
export const RESTORE_TAB_STORAGE_KEY = 'cme_restore_tab';

export type RestoreTabValue = 'applicant' | 'employer';

export type SignInLocationState = {
  /** Return user to prototype shell tab after auth */
  restoreTab?: RestoreTabValue;
  /** Path user tried to open (e.g. from RequireAuth) */
  from?: string;
};

export function consumeRestoreTabFromSession(): RestoreTabValue | null {
  const raw = sessionStorage.getItem(RESTORE_TAB_STORAGE_KEY);
  sessionStorage.removeItem(RESTORE_TAB_STORAGE_KEY);
  if (raw === 'applicant' || raw === 'employer') return raw;
  return null;
}

function isSafeInternalPath(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/http') &&
    path.length < 512
  );
}

/**
 * After email/password success on /onboarding/sign-in, send the user to the right place.
 */
export async function navigateAfterSignIn(
  navigate: NavigateFunction,
  state: SignInLocationState | null | undefined,
  supabase: SupabaseClient,
): Promise<void> {
  const restoreTab = state?.restoreTab;
  if (restoreTab) {
    sessionStorage.setItem(RESTORE_TAB_STORAGE_KEY, restoreTab);
    navigate('/', { replace: true });
    return;
  }

  const from = state?.from;
  if (from && from !== '/onboarding/sign-in' && isSafeInternalPath(from)) {
    navigate(from, { replace: true });
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, onboarding_completed_at')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error || !profile) {
    navigate('/onboarding/welcome', { replace: true });
    return;
  }

  const role = profile.role as string;
  if (role === 'employer') {
    sessionStorage.setItem(RESTORE_TAB_STORAGE_KEY, 'employer');
    navigate('/', { replace: true });
    return;
  }

  const isCandidate = role === 'applicant' || role === 'candidate';
  if (isCandidate && !profile.onboarding_completed_at) {
    navigate('/onboarding/welcome', { replace: true });
    return;
  }

  if (isCandidate) {
    navigate('/profile-builder', { replace: true });
    return;
  }

  navigate('/', { replace: true });
}
