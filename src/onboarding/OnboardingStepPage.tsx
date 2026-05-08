import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { OnboardingRouteShell } from '../components/layout/OnboardingRouteShell';
import { RouteFlowInlineLoading } from '../components/shared/RouteFlowState';
import ApplicantWelcomePage from '../components/applicant-pages/ApplicantWelcomePage';
import {
  completeApplicantOnboardingWizard,
  ensureApplicantProfile,
  setProfileOnboardingStep,
} from '../lib/applicantPersistence';
import { APPLICANT_PORTAL_PATH, pathForOnboardingDbStep } from '../lib/onboardingRouting';
import type { WelcomeUiStep } from '../lib/onboardingRouting';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
import { PROFILE_ONBOARDING_QUERY_ROOT, type OnboardingOutletContext } from './OnboardingLayout';

export function OnboardingStepPage({ uiStep }: { uiStep: WelcomeUiStep }) {
  const ctx = useOutletContext<OnboardingOutletContext | undefined>();
  const userId = ctx?.userId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent(AnalyticsEvents.onboarding_step_viewed, { step: uiStep });
  }, [uiStep]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !userId) return;
    let cancelled = false;
    setProfileError(null);
    void ensureApplicantProfile(supabase, userId).then((id) => {
      if (cancelled) return;
      if (id) {
        setProfileId(id);
        return;
      }
      setProfileError(
        'We could not finish loading your profile. Please refresh the page or try signing in again.',
      );
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const retryLoadProfile = () => {
    if (!isSupabaseConfigured || !supabase || !userId) return;
    setProfileError(null);
    setProfileId(null);
    void ensureApplicantProfile(supabase, userId).then((id) => {
      if (id) {
        setProfileId(id);
        return;
      }
      setProfileError(
        'We could not finish loading your profile. Please refresh the page or try signing in again.',
      );
    });
  };

  if (!userId) {
    return (
      <OnboardingRouteShell className="flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-md text-sm text-[var(--cme-onboarding-muted)]">
          Something went wrong loading your session. Try refreshing.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#7DBBFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5aaeff]"
        >
          Refresh
        </button>
      </OnboardingRouteShell>
    );
  }

  const goToOnboardingStep = async (next: 'welcome' | 'details' | 'how_it_works') => {
    if (!supabase) return;
    const { error } = await setProfileOnboardingStep(supabase, userId, next);
    if (error) {
      console.warn('[CMe] setProfileOnboardingStep:', error);
      return;
    }
    // Refetch before navigate: OnboardingLayout syncs URL to profiles.onboarding_step; stale cache
    // would snap the user back to the previous step (e.g. welcome) right after "Let's begin".
    await queryClient.refetchQueries({ queryKey: [...PROFILE_ONBOARDING_QUERY_ROOT, userId] });
    navigate(pathForOnboardingDbStep(next));
  };

  const finishServerOnboarding = async () => {
    if (!supabase) return;
    const { error } = await completeApplicantOnboardingWizard(supabase, userId);
    if (error) {
      console.warn('[CMe] completeApplicantOnboardingWizard:', error);
      return;
    }
    trackEvent(AnalyticsEvents.onboarding_complete, {});
    await queryClient.refetchQueries({ queryKey: [...PROFILE_ONBOARDING_QUERY_ROOT, userId] });
    navigate(APPLICANT_PORTAL_PATH, { replace: true });
  };

  if (profileError && !profileId) {
    return (
      <OnboardingRouteShell className="flex flex-col items-center justify-center gap-4 px-6 text-center text-[#111827]">
        <p className="max-w-md text-sm text-[var(--cme-onboarding-muted)]">{profileError}</p>
        <button
          type="button"
          onClick={retryLoadProfile}
          className="rounded-lg bg-[#7DBBFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5aaeff]"
        >
          Try again
        </button>
      </OnboardingRouteShell>
    );
  }

  if (!profileId) {
    return (
      <OnboardingRouteShell>
        <RouteFlowInlineLoading message="Preparing your profile…" />
      </OnboardingRouteShell>
    );
  }

  return (
    <ApplicantWelcomePage
      userId={userId}
      profileId={profileId}
      onComplete={() => navigate(APPLICANT_PORTAL_PATH, { replace: true })}
      routeSync={{
        activeStep: uiStep,
        goToOnboardingStep,
        finishServerOnboarding,
      }}
    />
  );
}
