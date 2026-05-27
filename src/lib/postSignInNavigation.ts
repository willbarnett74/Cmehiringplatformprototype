import type { NavigateFunction } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { OnboardingStepDb } from './onboardingRouting';
import { APPLICANT_PORTAL_PATH, pathForOnboardingDbStep } from './onboardingRouting';
import {
  EMPLOYER_PORTAL_PATH,
  isEmployerOnboardingStep,
  pathForEmployerOnboardingDbStep,
} from './employerOnboardingRouting';
import { setProfileRoleEmployer } from './employerOnboardingPersistence';

/** Set by OnboardingSignInPage before navigating home; App reads once on mount. */
export const RESTORE_TAB_STORAGE_KEY = 'cme_restore_tab';

export type RestoreTabValue = 'applicant' | 'employer';

export type SignInLocationState = {
  /** Return user to prototype shell tab after auth */
  restoreTab?: RestoreTabValue;
  /** Sign-up role hint from marketing path picker */
  signupRole?: 'candidate' | 'employer';
  /** Default login screen mode */
  initialMode?: 'signin' | 'signup';
  /** Path user tried to open (e.g. from RequireAuth) */
  from?: string;
};

export function persistRestoreTabToSession(restoreTab: RestoreTabValue | undefined): void {
  if (restoreTab === 'applicant' || restoreTab === 'employer') {
    sessionStorage.setItem(RESTORE_TAB_STORAGE_KEY, restoreTab);
  }
}

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

  const restoreTab = state?.restoreTab ?? consumeRestoreTabFromSession();
  let role = profile.role as string;
  const isCandidate = role === 'applicant' || role === 'candidate';
  let isEmployer = role === 'employer';

  if (!isEmployer && restoreTab === 'employer' && session.user.id) {
    await setProfileRoleEmployer(supabase, session.user.id);
    role = 'employer';
    isEmployer = true;
  }

  const fromRaw = state?.from;
  const from = normalizePostAuthPath(fromRaw);

  if (isCandidate && restoreTab !== 'employer') {
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
    sessionStorage.removeItem(RESTORE_TAB_STORAGE_KEY);

    const { data: businessRow } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', session.user.id)
      .maybeSingle();

    const onboardingComplete = Boolean(profile.onboarding_completed_at) || Boolean(businessRow?.id);
    const step = (profile as { onboarding_step?: string | null }).onboarding_step;

    if (!onboardingComplete) {
      const employerStep = isEmployerOnboardingStep(step) ? step : 'employer_company';
      navigate(pathForEmployerOnboardingDbStep(employerStep), { replace: true });
      return;
    }

    if (
      from &&
      from !== '/onboarding/sign-in' &&
      isSafeInternalPath(from) &&
      from.startsWith('/onboarding/employer/')
    ) {
      navigate(from, { replace: true });
      return;
    }

    if (
      from &&
      from !== '/onboarding/sign-in' &&
      isSafeInternalPath(from) &&
      !from.startsWith('/onboarding/') &&
      from !== APPLICANT_PORTAL_PATH &&
      !from.startsWith('/profile-builder') &&
      from !== EMPLOYER_PORTAL_PATH
    ) {
      navigate(from, { replace: true });
      return;
    }
    navigate(EMPLOYER_PORTAL_PATH, { replace: true });
    return;
  }

  navigate('/', { replace: true });
}
