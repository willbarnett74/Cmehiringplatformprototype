import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { pathForOnboardingDbStep } from '../lib/onboardingRouting';
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
  const [authReady, setAuthReady] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthReady(true);
      setSessionUserId(null);
      return;
    }
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...PROFILE_ONBOARDING_QUERY_ROOT, sessionUserId ?? ''],
    enabled: Boolean(isSupabaseConfigured && supabase && authReady && sessionUserId),
    retry: false,
    queryFn: async () => {
      if (!supabase || !sessionUserId) throw new Error('Not authenticated');
      return fetchProfileOnboardingMeta(supabase, sessionUserId);
    },
  });

  useEffect(() => {
    if (!data || data.onboarding_completed_at) return;
    const expected = pathForOnboardingDbStep(data.onboarding_step);
    if (ONBOARDING_PATHS.includes(location.pathname) && location.pathname !== expected) {
      navigate(expected, { replace: true });
    }
  }, [data, location.pathname, navigate]);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 text-center text-[#6B7280]">
        Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use onboarding.
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#6B7280]">
        Loading…
      </div>
    );
  }

  if (!sessionUserId) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#6B7280]">
        Loading…
      </div>
    );
  }

  if (isError || !data) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }

  if (data.onboarding_completed_at) {
    return <Navigate to="/profile-builder" replace />;
  }

  return <Outlet context={{ userId: data.userId } as OnboardingOutletContext} />;
}
