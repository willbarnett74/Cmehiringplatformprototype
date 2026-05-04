import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ApplicantWelcomePage } from '../components/applicant-pages/ApplicantWelcomePage';
import {
  completeApplicantOnboardingWizard,
  ensureApplicantProfile,
  setProfileOnboardingStep,
} from '../lib/applicantPersistence';
import { pathForOnboardingDbStep } from '../lib/onboardingRouting';
import type { WelcomeUiStep } from '../lib/onboardingRouting';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { PROFILE_ONBOARDING_QUERY_ROOT, type OnboardingOutletContext } from './OnboardingLayout';

export function OnboardingStepPage({ uiStep }: { uiStep: WelcomeUiStep }) {
  const ctx = useOutletContext<OnboardingOutletContext | undefined>();
  const userId = ctx?.userId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fafafa] px-6 text-center">
        <p className="max-w-md text-sm text-[#6B7280]">Something went wrong loading your session. Try refreshing.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#7DBBFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5aaeff]"
        >
          Refresh
        </button>
      </div>
    );
  }

  const goToOnboardingStep = async (next: 'welcome' | 'details' | 'how_it_works') => {
    if (!supabase) return;
    const { error } = await setProfileOnboardingStep(supabase, userId, next);
    if (error) console.warn('[CMe] setProfileOnboardingStep:', error);
    await queryClient.invalidateQueries({ queryKey: PROFILE_ONBOARDING_QUERY_ROOT });
    navigate(pathForOnboardingDbStep(next));
  };

  const finishServerOnboarding = async () => {
    if (!supabase) return;
    const { error } = await completeApplicantOnboardingWizard(supabase, userId);
    if (error) console.warn('[CMe] completeApplicantOnboardingWizard:', error);
    await queryClient.invalidateQueries({ queryKey: PROFILE_ONBOARDING_QUERY_ROOT });
    navigate('/profile-builder', { replace: true });
  };

  if (profileError && !profileId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fafafa] px-6 text-center text-[#111827]">
        <p className="max-w-md text-sm text-[#6B7280]">{profileError}</p>
        <button
          type="button"
          onClick={retryLoadProfile}
          className="rounded-lg bg-[#7DBBFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5aaeff]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#6B7280]">
        Loading…
      </div>
    );
  }

  return (
    <ApplicantWelcomePage
      userId={userId}
      profileId={profileId}
      onComplete={() => navigate('/profile-builder', { replace: true })}
      routeSync={{
        activeStep: uiStep,
        goToOnboardingStep,
        finishServerOnboarding,
      }}
    />
  );
}
