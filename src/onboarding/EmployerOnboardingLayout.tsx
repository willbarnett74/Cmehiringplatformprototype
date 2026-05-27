import { useLayoutEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { OnboardingRouteShell } from '../components/layout/OnboardingRouteShell';
import { RouteFlowError, RouteFlowLoading } from '../components/shared/RouteFlowState';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useSupabaseSessionBootstrap } from '../lib/useSupabaseSessionBootstrap';
import {
  EMPLOYER_ONBOARDING_PATHS,
  EMPLOYER_PORTAL_PATH,
  pathForEmployerOnboardingDbStep,
} from '../lib/employerOnboardingRouting';
import {
  fetchEmployerProfileMeta,
  isEmployerOnboardingComplete,
  resolveEmployerOnboardingStep,
} from '../lib/employerPersistence';

export const EMPLOYER_ONBOARDING_QUERY_ROOT = ['employer-onboarding-meta'] as const;

export type EmployerOnboardingOutletContext = {
  userId: string;
  businessId: string | null;
};

export function EmployerOnboardingLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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

  useLayoutEffect(() => {
    if (!data || isEmployerOnboardingComplete(data)) return;
    const expected = pathForEmployerOnboardingDbStep(resolveEmployerOnboardingStep(data));
    if (
      (EMPLOYER_ONBOARDING_PATHS as readonly string[]).includes(location.pathname) &&
      location.pathname !== expected
    ) {
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

  if (isEmployerOnboardingComplete(data)) {
    return <Navigate to={EMPLOYER_PORTAL_PATH} replace />;
  }

  return (
    <Outlet
      context={
        { userId: data.userId, businessId: data.businessId } as EmployerOnboardingOutletContext
      }
    />
  );
}
