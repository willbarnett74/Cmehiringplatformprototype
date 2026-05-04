import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  pathForOnboardingDbStep,
  type OnboardingStepDb,
} from '../lib/onboardingRouting';

export const profileOnboardingQueryKey = ['profile-onboarding-meta'] as const;

const ONBOARDING_PATHS = ['/onboarding/welcome', '/onboarding/basics', '/onboarding/how-it-works'];

export type OnboardingOutletContext = {
  userId: string;
};

/**
 * Ensures onboarding URLs match profiles.onboarding_step; sends completed users to profile builder.
 */
export function OnboardingLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError } = useQuery({
    queryKey: profileOnboardingQueryKey,
    enabled: Boolean(isSupabaseConfigured && supabase),
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;
      const { data: row, error } = await supabase
        .from('profiles')
        .select('onboarding_step, onboarding_completed_at')
        .eq('id', session.user.id)
        .single();
      if (error) throw error;
      return {
        userId: session.user.id,
        onboarding_step: row.onboarding_step as OnboardingStepDb,
        onboarding_completed_at: row.onboarding_completed_at as string | null,
      };
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
