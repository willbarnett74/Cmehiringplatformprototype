import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import App from './App';
import { LoginScreen } from './components/LoginScreen';
import { LegalBetaPage } from './components/legal/LegalBetaPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ApplicantScreen } from './components/ApplicantScreen';
import { OnboardingRouteShell } from './components/layout/OnboardingRouteShell';
import { RouteFlowError, RouteFlowLoading } from './components/shared/RouteFlowState';
import { OnboardingLayout, PROFILE_ONBOARDING_QUERY_ROOT } from './onboarding/OnboardingLayout';
import { OnboardingStepPage } from './onboarding/OnboardingStepPage';
import { AnalyticsEvents, trackEvent } from './lib/analytics';
import { fetchProfileOnboardingMeta } from './onboarding/profileOnboardingMeta';
import { APPLICANT_PORTAL_PATH, pathForOnboardingDbStep } from './lib/onboardingRouting';
import { navigateAfterSignIn, persistRestoreTabToSession, type SignInLocationState } from './lib/postSignInNavigation';
import { supabase } from './lib/supabaseClient';
import { useSupabaseSessionBootstrap } from './lib/useSupabaseSessionBootstrap';
import { EmployerOnboardingLayout, EMPLOYER_ONBOARDING_QUERY_ROOT } from './onboarding/EmployerOnboardingLayout';
import { EmployerOnboardingStepPage } from './onboarding/EmployerOnboardingStepPage';
import { pathForEmployerOnboardingDbStep } from './lib/employerOnboardingRouting';
import {
  fetchEmployerProfileMeta,
  isEmployerOnboardingComplete,
  resolveEmployerOnboardingStep,
} from './lib/employerPersistence';

const EmployerScreen = lazy(() =>
  import('./components/EmployerScreen').then((module) => ({ default: module.EmployerScreen })),
);
const AssessmentLink = lazy(() =>
  import('./pages/AssessmentLink').then((module) => ({ default: module.AssessmentLink })),
);

const routeFlowFallback = <RouteFlowLoading message="Loading…" />;

export function RequireAuth() {
  const location = useLocation();
  const { ready, session, timedOut, retry, hasClient } = useSupabaseSessionBootstrap();

  if (!hasClient) {
    return <Navigate to="/onboarding/sign-in" replace state={{ from: location.pathname }} />;
  }
  if (timedOut) {
    return (
      <RouteFlowError
        message="We couldn’t verify your session. Check your connection and try again."
        onRetry={retry}
      />
    );
  }
  if (!ready) {
    return <RouteFlowLoading message="Checking your session…" />;
  }
  if (!session) {
    return <Navigate to="/onboarding/sign-in" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireOnboardingComplete() {
  const { ready: authReady, session, timedOut, retry: retrySession, hasClient } =
    useSupabaseSessionBootstrap();
  const sessionUserId = session?.user?.id ?? null;

  const { data, isLoading, isError, refetch, isPending } = useQuery({
    queryKey: [...PROFILE_ONBOARDING_QUERY_ROOT, sessionUserId ?? ''],
    enabled: Boolean(hasClient && supabase && authReady && !timedOut && sessionUserId),
    retry: 1,
    queryFn: async () => {
      if (!supabase || !sessionUserId) throw new Error('Not authenticated');
      return fetchProfileOnboardingMeta(supabase, sessionUserId);
    },
  });

  if (!hasClient || !supabase) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }
  if (timedOut) {
    return (
      <RouteFlowError
        message="We couldn’t verify your session. Check your connection and try again."
        onRetry={retrySession}
      />
    );
  }
  if (!authReady) {
    return <RouteFlowLoading message="Checking your session…" />;
  }
  if (!sessionUserId) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }
  if (isLoading || isPending) {
    return <RouteFlowLoading message="Loading your profile…" />;
  }
  if (isError || !data) {
    return (
      <RouteFlowError
        message="We couldn’t load your onboarding status. Check your connection and try again."
        onRetry={() => void refetch()}
      />
    );
  }
  if (!data.onboarding_completed_at) {
    return <Navigate to={pathForOnboardingDbStep(data.onboarding_step)} replace />;
  }
  return <Outlet />;
}

function OnboardingSignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SignInLocationState | null;
  const { ready, session, timedOut, retry: retrySession, hasClient } = useSupabaseSessionBootstrap();
  const [postAuthRetryKey, setPostAuthRetryKey] = useState(0);
  const [postAuthError, setPostAuthError] = useState<string | null>(null);
  const oauthReturnFired = useRef(false);
  /** Capture OAuth/PKCE return before Supabase may strip the URL. */
  const oauthReturnEligibleRef = useRef(
    typeof window !== 'undefined' &&
      (window.location.hash.includes('access_token') || /[?&]code=/.test(window.location.search)),
  );
  const redirectStarted = useRef(false);

  const retryPostAuth = useCallback(() => {
    redirectStarted.current = false;
    setPostAuthError(null);
    setPostAuthRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (state?.restoreTab) {
      persistRestoreTabToSession(state.restoreTab);
    }
  }, [state?.restoreTab]);

  useEffect(() => {
    if (!hasClient || !supabase) return;
    if (!ready || !session) return;
    if (postAuthError) return;
    if (redirectStarted.current) return;
    redirectStarted.current = true;
    let cancelled = false;

    void (async () => {
      try {
        if (oauthReturnEligibleRef.current && !oauthReturnFired.current) {
          oauthReturnFired.current = true;
          trackEvent(AnalyticsEvents.oauth_return, {});
        }
        await navigateAfterSignIn(navigate, state, supabase);
      } catch (e) {
        redirectStarted.current = false;
        if (!cancelled) {
          setPostAuthError(
            e instanceof Error ? e.message : 'Something went wrong after sign-in. Please try again.',
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasClient, ready, session, navigate, state, postAuthError, postAuthRetryKey]);

  if (!hasClient) {
    return (
      <OnboardingRouteShell className="flex items-center justify-center px-4 text-center text-[var(--cme-onboarding-muted)]">
        Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use sign-in.
      </OnboardingRouteShell>
    );
  }
  if (timedOut) {
    return (
      <RouteFlowError
        message="We couldn’t verify your session. Check your connection and try again."
        onRetry={retrySession}
      />
    );
  }
  if (!ready) {
    return <RouteFlowLoading message="Checking your session…" />;
  }
  if (postAuthError) {
    return (
      <RouteFlowError
        message={postAuthError}
        onRetry={retryPostAuth}
        retryLabel="Try again"
      />
    );
  }
  if (session) {
    return <RouteFlowLoading message="Finishing sign-in…" />;
  }

  return (
    <LoginScreen
      initialMode={state?.initialMode ?? (state?.signupRole === 'employer' ? 'signup' : 'signin')}
      signupRole={state?.signupRole ?? (state?.restoreTab === 'employer' ? 'employer' : 'candidate')}
      onAuthenticated={() => {
        /* Session updates via useSupabaseSessionBootstrap; effect above runs navigateAfterSignIn. */
      }}
    />
  );
}

export function RequireEmployerOnboardingComplete() {
  const { ready: authReady, session, timedOut, retry: retrySession, hasClient } =
    useSupabaseSessionBootstrap();
  const sessionUserId = session?.user?.id ?? null;

  const { data, isLoading, isError, refetch, isPending } = useQuery({
    queryKey: [...EMPLOYER_ONBOARDING_QUERY_ROOT, sessionUserId ?? ''],
    enabled: Boolean(hasClient && supabase && authReady && !timedOut && sessionUserId),
    retry: 1,
    queryFn: async () => {
      if (!supabase || !sessionUserId) throw new Error('Not authenticated');
      return fetchEmployerProfileMeta(supabase, sessionUserId);
    },
  });

  if (!hasClient || !supabase) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }
  if (timedOut) {
    return (
      <RouteFlowError
        message="We couldn't verify your session. Check your connection and try again."
        onRetry={retrySession}
      />
    );
  }
  if (!authReady) {
    return <RouteFlowLoading message="Checking your session…" />;
  }
  if (!sessionUserId) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }
  if (isLoading || isPending) {
    return <RouteFlowLoading message="Loading your profile…" />;
  }
  if (isError || !data) {
    return (
      <RouteFlowError
        message="We couldn't load your onboarding status. Check your connection and try again."
        onRetry={() => void refetch()}
      />
    );
  }
  if (!isEmployerOnboardingComplete(data)) {
    return (
      <Navigate
        to={pathForEmployerOnboardingDbStep(resolveEmployerOnboardingStep(data))}
        replace
      />
    );
  }
  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/legal/terms" element={<LegalBetaPage variant="terms" />} />
      <Route path="/legal/privacy" element={<LegalBetaPage variant="privacy" />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/product" element={<App />} />
      <Route path="/assessment-link" element={<Suspense fallback={routeFlowFallback}><AssessmentLink /></Suspense>} />
      <Route path="/onboarding/sign-in" element={<OnboardingSignInPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/onboarding/employer" element={<EmployerOnboardingLayout />}>
          <Route path="company" element={<EmployerOnboardingStepPage stepKey="company" />} />
          <Route path="role-template" element={<EmployerOnboardingStepPage stepKey="role-template" />} />
          <Route path="trait-weighting" element={<EmployerOnboardingStepPage stepKey="trait-weighting" />} />
          <Route path="calibration" element={<EmployerOnboardingStepPage stepKey="calibration" />} />
        </Route>
        <Route element={<RequireEmployerOnboardingComplete />}>
          <Route path="/employer-portal" element={<Suspense fallback={routeFlowFallback}><EmployerScreen /></Suspense>} />
        </Route>
        <Route path="/onboarding" element={<OnboardingLayout />}>
          <Route path="welcome" element={<OnboardingStepPage uiStep="welcome" />} />
          <Route path="basics" element={<OnboardingStepPage uiStep="details" />} />
          <Route path="how-it-works" element={<OnboardingStepPage uiStep="how-it-works" />} />
        </Route>
        <Route element={<RequireOnboardingComplete />}>
          <Route path="/applicant-portal" element={<ApplicantScreen />} />
          <Route path="/profile-builder" element={<Navigate to={APPLICANT_PORTAL_PATH} replace />} />
        </Route>
      </Route>
      <Route path="*" element={<App />} />
    </Routes>
  );
}
