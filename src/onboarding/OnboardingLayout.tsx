import { useLayoutEffect, useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { OnboardingRouteShell } from '../components/layout/OnboardingRouteShell';
import { RouteFlowError, RouteFlowLoading } from '../components/shared/RouteFlowState';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { clearInvalidAuthSession, isInvalidAuthSessionError } from '../lib/ensureProfileRow';
import { useSupabaseSessionBootstrap } from '../lib/useSupabaseSessionBootstrap';
import { APPLICANT_PORTAL_PATH, pathForOnboardingDbStep } from '../lib/onboardingRouting';
import { fetchProfileOnboardingMeta } from './profileOnboardingMeta';

/** Prefix for React Query; use in invalidateQueries to bust all user-specific onboarding rows. */
export const PROFILE_ONBOARDING_QUERY_ROOT = ['profile-onboarding-meta'] as const;

export type OnboardingOutletContext = {
  userId: string;
};

const ONBOARDING_PATHS = ['/onboarding/welcome', '/onboarding/basics', '/onboarding/how-it-works'];

/**
 * Ensures onboarding URLs match profiles.onboarding_step; sends completed users to profile builder.
 */
export function OnboardingLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ready: authReady, session, timedOut, retry: retrySession, hasClient } =
    useSupabaseSessionBootstrap();
  const sessionUserId = session?.user?.id ?? null;
  const clearedInvalidSession = useRef(false);

  const { data, isLoading, isError, error, refetch, isPending } = useQuery({
    queryKey: [...PROFILE_ONBOARDING_QUERY_ROOT, sessionUserId ?? ''],
    enabled: Boolean(hasClient && supabase && authReady && !timedOut && sessionUserId),
    retry: 1,
    queryFn: async () => {
      if (!supabase || !sessionUserId) throw new Error('Not authenticated');
      return fetchProfileOnboardingMeta(supabase, sessionUserId);
    },
  });

  useEffect(() => {
    if (!isError || !isInvalidAuthSessionError(error) || clearedInvalidSession.current || !supabase) {
      return;
    }
    clearedInvalidSession.current = true;
    void clearInvalidAuthSession(supabase).then(() => {
      navigate('/onboarding/sign-in', { replace: true });
    });
  }, [isError, error, navigate]);

  useLayoutEffect(() => {
    if (!data || data.onboarding_completed_at) return;
    const expected = pathForOnboardingDbStep(data.onboarding_step);
    if (ONBOARDING_PATHS.includes(location.pathname) && location.pathname !== expected) {
      navigate(expected, { replace: true });
    }
  }, [data, location.pathname, navigate]);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <OnboardingRouteShell className="flex items-center justify-center px-4 text-center text-[var(--cme-onboarding-muted)]">
        Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use onboarding.
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
    if (isInvalidAuthSessionError(error)) {
      return <RouteFlowLoading message="Signing you out…" />;
    }
    return (
      <RouteFlowError
        message="We couldn’t load your onboarding status. Check your connection and try again."
        onRetry={() => void refetch()}
      />
    );
  }

  if (data.onboarding_completed_at) {
    return <Navigate to={APPLICANT_PORTAL_PATH} replace />;
  }

  return <Outlet context={{ userId: data.userId } as OnboardingOutletContext} />;
}
