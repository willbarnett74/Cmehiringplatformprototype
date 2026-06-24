import type { NavigateFunction } from 'react-router-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { OnboardingStepDb } from './onboardingRouting';
import { APPLICANT_PORTAL_PATH, pathForOnboardingDbStep } from './onboardingRouting';
import {
  EMPLOYER_PORTAL_PATH,
  isEmployerOnboardingStep,
  pathForEmployerOnboardingDbStep,
} from './employerOnboardingRouting';
import { claimInitialProfileRole } from './employerOnboardingPersistence';

/** Set by OnboardingSignInPage before navigating home; App reads once on mount. */
export const RESTORE_TAB_STORAGE_KEY = 'cme_restore_tab';

/** OAuth signup: role chosen on Create account before Google redirect. */
export const SIGNUP_ROLE_STORAGE_KEY = 'cme_signup_role';

export const EMPLOYER_PENDING_REVIEW_PATH = '/onboarding/employer/pending-review';

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

function normalizeProfileRoleFromMetadata(value: unknown): 'candidate' | 'employer' {
  if (value === 'employer') return 'employer';
  if (value === 'applicant' || value === 'candidate') return 'candidate';
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
  roleHint: 'candidate' | 'employer' | null,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== sessionUserId) return;

  const meta = (user.user_metadata as Record<string, unknown> | undefined) ?? undefined;
  const role = roleHint ?? normalizeProfileRoleFromMetadata(meta?.role);
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

  // Duplicate profile row means another request created it first — safe to ignore.
  if (error && error.code !== '23505') {
    console.warn('[CMe] ensure profile row failed:', error.message);
  }
}

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

export function persistSignupRoleToSession(role: 'candidate' | 'employer'): void {
  sessionStorage.setItem(
    SIGNUP_ROLE_STORAGE_KEY,
    JSON.stringify({ role, at: Date.now() }),
  );
}

export function consumeSignupRoleFromSession(): 'candidate' | 'employer' | null {
  const raw = sessionStorage.getItem(SIGNUP_ROLE_STORAGE_KEY);
  sessionStorage.removeItem(SIGNUP_ROLE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { role?: string; at?: number };
    if (typeof parsed.at !== 'number' || Date.now() - parsed.at > 30 * 60 * 1000) return null;
    if (parsed.role === 'employer' || parsed.role === 'candidate') return parsed.role;
  } catch {
    return null;
  }
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

  let { data: profile, error } = await supabase
    .from('profiles')
    .select('role, employer_status, onboarding_complete, onboarding_completed_at, onboarding_step')
    .eq('id', session.user.id)
    .maybeSingle();

  const signupRole = state?.signupRole ?? consumeSignupRoleFromSession();
  const roleHint: 'candidate' | 'employer' | null =
    signupRole === 'candidate' || signupRole === 'employer' ? signupRole : null;

  if (!error && !profile) {
    await ensureProfileRowForSession(supabase, session.user.id, roleHint);
    const retry = await supabase
      .from('profiles')
      .select('role, employer_status, onboarding_complete, onboarding_completed_at, onboarding_step')
      .eq('id', session.user.id)
      .maybeSingle();
    profile = retry.data;
    error = retry.error;
  }

  if (error || !profile) {
    navigate(pathForOnboardingDbStep('welcome'), { replace: true });
    return;
  }

  if (signupRole === 'employer' && profile.role === 'candidate') {
    await claimInitialProfileRole(supabase, 'employer');
  }

  const { data: refreshedProfile, error: refreshError } = await supabase
    .from('profiles')
    .select('role, employer_status, onboarding_complete, onboarding_completed_at, onboarding_step')
    .eq('id', session.user.id)
    .maybeSingle();

  if (refreshError || !refreshedProfile) {
    navigate(pathForOnboardingDbStep('welcome'), { replace: true });
    return;
  }

  consumeRestoreTabFromSession();
  const role = refreshedProfile.role as string;
  const employerStatus = (refreshedProfile.employer_status as string | null) ?? null;
  const isCandidate = role === 'applicant' || role === 'candidate';
  const isEmployer = role === 'employer';

  const fromRaw = state?.from;
  const from = normalizePostAuthPath(fromRaw);

  if (isCandidate) {
    sessionStorage.removeItem(RESTORE_TAB_STORAGE_KEY);

    if (!refreshedProfile.onboarding_completed_at) {
      const step = (refreshedProfile as { onboarding_step?: string | null }).onboarding_step;
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

    if (employerStatus === 'pending' || employerStatus === 'rejected' || employerStatus == null) {
      navigate(EMPLOYER_PENDING_REVIEW_PATH, {
        replace: true,
        state: { employerStatus: employerStatus ?? 'pending' },
      });
      return;
    }

    const onboardingComplete = Boolean(
      (refreshedProfile as { onboarding_complete?: boolean | null }).onboarding_complete,
    );
    const step = (refreshedProfile as { onboarding_step?: string | null }).onboarding_step;

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
