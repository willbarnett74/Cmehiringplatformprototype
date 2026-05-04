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
import { profileOnboardingQueryKey, type OnboardingOutletContext } from './OnboardingLayout';

export function OnboardingStepPage({ uiStep }: { uiStep: WelcomeUiStep }) {
  const { userId } = useOutletContext<OnboardingOutletContext>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !userId) return;
    void ensureApplicantProfile(supabase, userId).then((id) => setProfileId(id ?? null));
  }, [userId]);

  const goToOnboardingStep = async (next: 'welcome' | 'details' | 'how_it_works') => {
    if (!supabase) return;
    const { error } = await setProfileOnboardingStep(supabase, userId, next);
    if (error) console.warn('[CMe] setProfileOnboardingStep:', error);
    await queryClient.invalidateQueries({ queryKey: profileOnboardingQueryKey });
    navigate(pathForOnboardingDbStep(next));
  };

  const finishServerOnboarding = async () => {
    if (!supabase) return;
    const { error } = await completeApplicantOnboardingWizard(supabase, userId);
    if (error) console.warn('[CMe] completeApplicantOnboardingWizard:', error);
    await queryClient.invalidateQueries({ queryKey: profileOnboardingQueryKey });
    navigate('/profile-builder', { replace: true });
  };

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
