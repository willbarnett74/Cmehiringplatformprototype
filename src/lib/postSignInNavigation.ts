import type { NavigateFunction } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { OnboardingStepDb } from './onboardingRouting';
import { APPLICANT_PORTAL_PATH, pathForOnboardingDbStep } from './onboardingRouting';

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

/** Legacy URL before /applicant-portal */
function normalizePostAuthPath(path: string | undefined): string | undefined {
  if (path == null) return undefined;
  if (path === '/profile-builder') return APPLICANT_PORTAL_PATH;
  if (path.startsWith('/profile-builder?')) {
    return APPLICANT_PORTAL_PATH + path.slice('/profile-builder'.length);
  }
  return path;
}

/**
 * After email/password success on /onboarding/sign-in, send the user to the right place.
 */
export async function navigateAfterSignIn(
  navigate: NavigateFunction,
  state: SignInLocationState | null | undefined,
  supabase: SupabaseClient,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, onboarding_completed_at, onboarding_step')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error || !profile) {
    navigate(pathForOnboardingDbStep('welcome'), { replace: true });
    return;
  }

  const role = profile.role as string;
  const isCandidate = role === 'applicant' || role === 'candidate';
  const isEmployer = role === 'employer';

  const fromRaw = state?.from;
  const from = normalizePostAuthPath(fromRaw);

  if (isCandidate) {
    sessionStorage.removeItem(RESTORE_TAB_STORAGE_KEY);

    if (!profile.onboarding_completed_at) {
      const step = (profile as { onboarding_step?: string | null }).onboarding_step;
      const dbStep: OnboardingStepDb =
        step === 'details' || step === 'how_it_works' || step === 'welcome' || step === 'completed'
          ? step
          : 'welcome';
      navigate(pathForOnboardingDbStep(dbStep), { replace: true });
      return;
    }

    if (
      from &&
      from !== '/onboarding/sign-in' &&
      isSafeInternalPath(from) &&
      from.startsWith('/onboarding/')
    ) {
      navigate(from, { replace: true });
      return;
    }

    navigate(APPLICANT_PORTAL_PATH, { replace: true });
    return;
  }

  if (isEmployer) {
    sessionStorage.setItem(RESTORE_TAB_STORAGE_KEY, 'employer');
    if (
      from &&
      from !== '/onboarding/sign-in' &&
      isSafeInternalPath(from) &&
      !from.startsWith('/onboarding/') &&
      from !== APPLICANT_PORTAL_PATH &&
      !from.startsWith('/profile-builder')
    ) {
      navigate(from, { replace: true });
      return;
    }
    navigate('/', { replace: true });
    return;
  }

  navigate('/', { replace: true });
}
