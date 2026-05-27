/**
 * AssessmentLink Page
 * 
 * Public cold-start flow for candidates to complete intake without creating an account first.
 * 
 * Flow:
 * 1. Landing: Candidate receives email/link from employer with token
 * 2. Intake: Candidate completes full 8-section intake flow (identical to Profile Builder)
 * 3. Completion: Creates account record linking candidate to business
 * 4. Trigger: Supabase Edge Function computes match score automatically
 * 
 * URL Pattern: /assessment/:token
 * Token contains: candidate email, employer_id, role_template_id (signed JWT)
 * 
 * The intake step uses ProfileBuilderLayout and the exact same section components
 * and UserProfileContext data flow as the Applicant View Profile Builder.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Lock, Users, BarChart, Compass } from 'lucide-react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ProfileBuilderLayout } from '../components/applicant-pages/ProfileBuilderLayout';
import { IntakeSection1 } from '../components/applicant-pages/intake/IntakeSection1';
import { IntakeSection2 } from '../components/applicant-pages/intake/IntakeSection2';
import { IntakeSection3 } from '../components/applicant-pages/intake/IntakeSection3';
import { IntakeSection4 } from '../components/applicant-pages/intake/IntakeSection4';
import { IntakeSection5 } from '../components/applicant-pages/intake/IntakeSection5';
import { IntakeSection6 } from '../components/applicant-pages/intake/IntakeSection6';
import { IntakeSection7 } from '../components/applicant-pages/intake/IntakeSection7';
import { IntakeSection8 } from '../components/applicant-pages/intake/IntakeSection8';
import { computeIntakeScores } from '../utils/intakeScoring';
import {
  computeMotivationalFitAverage,
  toCandidateDimensionScores,
} from '../utils/intakeScoreAggregate';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  ensureApplicantProfile,
  upsertIntakeSectionResponses,
  markApplicantIntakeComplete,
  getProfileLockedUntilIso,
  syncSection7ToCandidateProfile,
} from '../lib/applicantPersistence';
import { createEngagement } from '../lib/employerEngagements';
import { computeMatchScore, type EmployerWeights } from '../lib/matchScoring';
import { TraitLockGate2Interstitial, ProfileSubmitGate3Confirmation } from '../components/applicant-pages/intake/ProfileLockGates';

type ResolvedAssessmentRole = {
  roleId: string;
  businessId: string;
  title: string;
  businessName: string;
};

async function fetchEmployerWeightsForBusiness(
  businessId: string,
): Promise<EmployerWeights | null> {
  if (!supabase) return null;
  const { data: wt, error } = await supabase
    .from('employer_trait_weightings')
    .select(
      'learning_velocity, ownership_follow_through, resilience, communication_confidence, relational_intelligence, motivational_fit',
    )
    .eq('business_id', businessId)
    .is('superseded_at', null)
    .maybeSingle();
  if (error || !wt) {
    console.warn('[AssessmentLink] Could not load employer weights:', error?.message ?? 'none found');
    return null;
  }
  return wt as EmployerWeights;
}

interface AssessmentLinkProps {
  // In production, pass token from URL params via React Router
  token?: string;
}

export function AssessmentLink({ token: tokenProp }: AssessmentLinkProps) {
  const [searchParams] = useSearchParams();
  const token = tokenProp ?? searchParams.get('token') ?? 'demo_token_abc123';
  const { profileData, updateIntakeSection, updateTraitScores, markIntakeComplete, resetProfile, updateProfileData } =
    useUserProfile();
  const [step, setStep] = useState<'landing' | 'intake' | 'complete'>('landing');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [candidateProfileId, setCandidateProfileId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showTraitLockInterstitial, setShowTraitLockInterstitial] = useState(true);
  const [pendingIntakeCompletion, setPendingIntakeCompletion] = useState(false);
  const [preSubmitTraitReview, setPreSubmitTraitReview] = useState(false);
  const [deferralMessage, setDeferralMessage] = useState<string | null>(null);
  const profileBuilderSubmitRef = useRef<(() => void) | null>(null);
  const [section3ScoringBusy, setSection3ScoringBusy] = useState(false);
  const [section4ScoringBusy, setSection4ScoringBusy] = useState(false);
  const [section6ScoringBusy, setSection6ScoringBusy] = useState(false);
  const [roleFromDb, setRoleFromDb] = useState<ResolvedAssessmentRole | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !token || token === 'demo_token_abc123') return;
    void (async () => {
      const { data: role } = await supabase
        .from('roles')
        .select('id, title, business_id, businesses(name)')
        .eq('assessment_link_token', token)
        .maybeSingle();
      if (role?.title && role.id && role.business_id) {
        const biz = role.businesses as { name?: string } | null;
        setRoleFromDb({
          roleId: role.id as string,
          businessId: role.business_id as string,
          title: role.title as string,
          businessName: biz?.name ?? 'Employer',
        });
      }
    })();
  }, [token]);

  const employerInfo = useMemo(
    () => ({
      company_name: roleFromDb?.businessName ?? 'DeanKernel Design Co.',
      role_title: roleFromDb?.title ?? 'Senior Product Designer',
    }),
    [roleFromDb],
  );

  // Reset profile on mount (cold start)
  useEffect(() => {
    resetProfile();
  }, []);

  const handleStartIntake = async () => {
    setSubmitError(null);
    setDeferralMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setSubmitError('Supabase is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Anonymous auth — gives the candidate a real auth.uid() so RLS passes.
      //    If they already have a session from a previous attempt, reuse it.
      const { data: sessionData } = await supabase.auth.getSession();
      let userId = sessionData.session?.user?.id ?? null;

      if (!userId) {
        const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr || !anonData.user) {
          throw new Error(anonErr?.message ?? 'Anonymous sign-in failed');
        }
        userId = anonData.user.id;
      }

      // 2. Create (or find) the candidate_profiles row for this auth user.
      const profileId = await ensureApplicantProfile(supabase, userId);
      if (!profileId) {
        throw new Error('Could not create candidate profile');
      }

      setCandidateProfileId(profileId);
      setStep('intake');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[AssessmentLink] handleStartIntake failed:', message);
      setSubmitError(`We couldn't start your assessment: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Profile Builder Logic (mirrors ApplicantScreen) ───

  const isTraitProfileLocked =
    profileData.profile_locked_until != null &&
    new Date(profileData.profile_locked_until) > new Date();

  const traitSectionsReadOnly = isTraitProfileLocked || preSubmitTraitReview;

  const getStepStatus = (stepId: number): 'active' | 'needsReview' | 'upToDate' | 'locked' => {
    if (isTraitProfileLocked && stepId >= 2 && stepId <= 6) {
      return 'locked';
    }
    if (profileData?.intakeData?.completedSections?.includes(stepId)) {
      return 'upToDate';
    }
    return 'needsReview';
  };

  const stepStatuses = {
    1: getStepStatus(1),
    2: getStepStatus(2),
    3: getStepStatus(3),
    4: getStepStatus(4),
    5: getStepStatus(5),
    6: getStepStatus(6),
    7: getStepStatus(7),
    8: getStepStatus(8),
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setStep('landing');
    } else {
      if (activeStep === 8 && pendingIntakeCompletion) {
        setPendingIntakeCompletion(false);
        setPreSubmitTraitReview(false);
      }
      setActiveStep(activeStep - 1);
    }
  };

  const runAssessmentFooterContinue = () => {
    if (traitSectionsReadOnly && activeStep >= 2 && activeStep <= 6) {
      if (activeStep < 8) {
        setActiveStep(activeStep + 1);
      }
      return;
    }
    profileBuilderSubmitRef.current?.();
  };

  const confirmAssessmentSubmit = async () => {
    const intakeResponses = {
      section2: profileData.intakeData.section2,
      section3: profileData.intakeData.section3,
      section4: profileData.intakeData.section4,
      section5: profileData.intakeData.section5,
      section6: profileData.intakeData.section6,
    };
    const scores = computeIntakeScores(intakeResponses);
    updateTraitScores(scores);

    let computedMatchScore: number | null = null;

    if (supabase && candidateProfileId) {
      const motivational_fit = computeMotivationalFitAverage(scores);
      await supabase
        .from('candidate_profiles')
        .update({
          learning_velocity: scores.learning_velocity,
          ownership_follow_through: scores.ownership_follow_through,
          resilience: scores.resilience,
          communication_confidence: scores.communication_confidence,
          relational_intelligence: scores.relational_intelligence,
          motivational_fit_mastery: scores.motivational_fit_mastery,
          motivational_fit_impact: scores.motivational_fit_impact,
          motivational_fit_recognition: scores.motivational_fit_recognition,
          motivational_fit_autonomy: scores.motivational_fit_autonomy,
          motivational_fit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateProfileId);

      if (roleFromDb?.businessId) {
        const weights = await fetchEmployerWeightsForBusiness(roleFromDb.businessId);
        if (weights) {
          const candidateScores = toCandidateDimensionScores(scores);
          computedMatchScore = Math.round(computeMatchScore(candidateScores, weights).matchScore);
        }
      }
    }

    markIntakeComplete();
    setPendingIntakeCompletion(false);
    setPreSubmitTraitReview(false);
    await handleIntakeComplete(computedMatchScore);
  };

  const handleNext = async (data?: Record<string, unknown>) => {
    if (data && data.section) {
      const sectionNum = data.section as number;
      updateIntakeSection(sectionNum, data.responses);

      if (candidateProfileId && isSupabaseConfigured && supabase) {
        try {
          await upsertIntakeSectionResponses(supabase, candidateProfileId, sectionNum, data);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('[AssessmentLink] section persist failed:', message);
          setSubmitError(`We couldn't save section ${sectionNum}: ${message}`);
        }
      }

      if (sectionNum === 7 && supabase && candidateProfileId && data.responses) {
        await syncSection7ToCandidateProfile(
          supabase,
          candidateProfileId,
          data.responses as Record<string, unknown>,
        );
      }

      if (sectionNum === 8) {
        setPendingIntakeCompletion(true);
        return;
      }
    }

    if (activeStep < 8) {
      setActiveStep(activeStep + 1);
    }
  };

  const renderSection = () => {
    const s1 = profileData.intakeData.section1 as
      | { S1Q1?: { narrative?: string }; S1Q2?: { narrative?: string } }
      | undefined;

    switch (activeStep) {
      case 1:
        return (
          <IntakeSection1
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            initialData={{
              S1Q1: s1?.S1Q1?.narrative != null ? { narrative: s1.S1Q1.narrative } : undefined,
              S1Q2: s1?.S1Q2?.narrative != null ? { narrative: s1.S1Q2.narrative } : undefined,
            }}
          />
        );
      case 2:
        if (showTraitLockInterstitial && !isTraitProfileLocked) {
          return (
            <TraitLockGate2Interstitial
              onContinue={() => setShowTraitLockInterstitial(false)}
              onComeBackLater={() => {
                setDeferralMessage('Your progress is saved. You can return anytime to continue.');
                setStep('landing');
              }}
            />
          );
        }
        return (
          <IntakeSection2
            readOnly={traitSectionsReadOnly}
            hideFooterButton
            submitRef={traitSectionsReadOnly ? undefined : profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            initialData={profileData.intakeData.section2}
          />
        );
      case 3:
        return (
          <IntakeSection3
            readOnly={traitSectionsReadOnly}
            hideFooterButton
            submitRef={traitSectionsReadOnly ? undefined : profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            onQ3ScoringBusyChange={setSection3ScoringBusy}
            initialData={profileData.intakeData.section3}
          />
        );
      case 4:
        return (
          <IntakeSection4
            readOnly={traitSectionsReadOnly}
            hideFooterButton
            submitRef={traitSectionsReadOnly ? undefined : profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            onQ5ScoringBusyChange={setSection4ScoringBusy}
            initialData={profileData.intakeData.section4}
          />
        );
      case 5:
        return (
          <IntakeSection5
            readOnly={traitSectionsReadOnly}
            hideFooterButton
            submitRef={traitSectionsReadOnly ? undefined : profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            initialData={profileData.intakeData.section5}
          />
        );
      case 6:
        return (
          <IntakeSection6
            readOnly={traitSectionsReadOnly}
            hideFooterButton
            submitRef={traitSectionsReadOnly ? undefined : profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            onQ5ScoringBusyChange={setSection6ScoringBusy}
            initialData={profileData.intakeData.section6}
          />
        );
      case 7:
        return (
          <IntakeSection7
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            initialData={profileData.intakeData.section7}
          />
        );
      case 8:
        if (pendingIntakeCompletion) {
          return (
            <ProfileSubmitGate3Confirmation
              onSubmit={() => void confirmAssessmentSubmit()}
              onReviewAnswers={() => {
                setPreSubmitTraitReview(true);
                setActiveStep(2);
              }}
            />
          );
        }
        return (
          <IntakeSection8
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            initialData={profileData.intakeData.section8}
          />
        );
      default:
        return (
          <IntakeSection1
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleNext(data)}
            initialData={{
              S1Q1: s1?.S1Q1?.narrative != null ? { narrative: s1.S1Q1.narrative } : undefined,
              S1Q2: s1?.S1Q2?.narrative != null ? { narrative: s1.S1Q2.narrative } : undefined,
            }}
          />
        );
    }
  };

  const profileBuilderFooterHidden =
    (activeStep === 2 && showTraitLockInterstitial && !isTraitProfileLocked) ||
    (activeStep === 8 && pendingIntakeCompletion);

  // ─── Completion Logic ───

  const handleIntakeComplete = async (computedMatchScore: number | null = null) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      if (!candidateProfileId || !isSupabaseConfigured || !supabase) {
        throw new Error('Missing candidate profile or Supabase configuration');
      }

      const ok = await markApplicantIntakeComplete(supabase, candidateProfileId);
      if (ok) {
        updateProfileData({ profile_locked_until: getProfileLockedUntilIso() });
      }

      if (roleFromDb?.businessId) {
        try {
          await createEngagement(
            supabase,
            candidateProfileId,
            roleFromDb.businessId,
            computedMatchScore,
            'assessment_link',
            roleFromDb.roleId,
          );
        } catch (engErr) {
          const message = engErr instanceof Error ? engErr.message : 'Unknown error';
          console.warn('[AssessmentLink] engagement insert failed (may be RLS until Phase 2):', message);
        }
      }

      setMatchScore(computedMatchScore);
      setStep('complete');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[AssessmentLink] Error completing intake:', message);
      setSubmitError(`We couldn't submit your assessment: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Landing Screen ───
  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {deferralMessage ? (
            <div
              className="mb-4 rounded-xl border border-[#7DBBFF]/25 bg-[#F0F7FF] px-4 py-3 text-sm text-[#374151]"
              role="status"
            >
              {deferralMessage}
            </div>
          ) : null}
          {/* Card Container */}
          <div className="bg-white border border-black/[0.08] shadow-lg p-12" style={{ borderRadius: '24px' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7DBBFF]/10 rounded-full mb-4">
                <Users className="w-8 h-8 text-[#7DBBFF]" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl text-[#111827] font-semibold mb-3">
                You've Been Invited
              </h1>
              <p className="text-base text-[#6B7280]">
                <span className="font-medium text-[#111827]">{employerInfo.company_name}</span> has invited you to apply for the <span className="font-medium text-[#111827]">{employerInfo.role_title}</span> role.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-black/[0.06] my-8" />

            {/* Benefits */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#7DBBFF]/10 rounded-full flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-1">
                    Match Based on What Matters
                  </h3>
                  <p className="text-sm text-[#6B7280]">
                    CMe matches you based on deeper traits like adaptability, decision-making style, and cognitive agility — not just work history.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#10B981]/10 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#10B981]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-1">
                    Secure & Private
                  </h3>
                  <p className="text-sm text-[#6B7280]">
                    Your responses are only visible to {employerInfo.company_name}. No third-party sharing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#8B5CF6]/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#8B5CF6]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-1">
                    57–73 Minutes to Complete
                  </h3>
                  <p className="text-sm text-[#6B7280]">
                    Complete 8 sections covering your background, work style, problem-solving, resilience, collaboration, motivations, career direction, and profile details. No resume required.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Breakdown */}
            <div className="bg-[#F9FAFB] border border-black/[0.06] p-5 mb-8" style={{ borderRadius: '14px' }}>
              <h4 className="text-xs text-[#6B7280] uppercase tracking-wider mb-3">What You'll Cover</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { num: 1, label: 'Background Narrative', time: '5–7 min' },
                  { num: 2, label: 'How You Work', time: '7–9 min' },
                  { num: 3, label: 'How You Think', time: '10–12 min' },
                  { num: 4, label: 'How You Handle Difficulty', time: '8–10 min' },
                  { num: 5, label: 'How You Relate to Others', time: '8–10 min' },
                  { num: 6, label: 'What Drives You', time: '8–10 min' },
                  { num: 7, label: 'Career Direction', time: '4–5 min' },
                  { num: 8, label: 'Your Profile', time: '3–5 min' },
                ].map(s => (
                  <div key={s.num} className="flex items-center gap-2.5 px-3 py-2 bg-white border border-black/[0.05]" style={{ borderRadius: '8px' }}>
                    <div className="w-6 h-6 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-[#7DBBFF] font-semibold">{s.num}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#111827] font-medium truncate">{s.label}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{s.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div
                className="mb-4 px-4 py-3 bg-[#FEE2E2] border border-[#FCA5A5] text-sm text-[#B91C1C]"
                style={{ borderRadius: '10px' }}
              >
                {submitError}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleStartIntake}
              disabled={isLoading}
              className="w-full bg-[#7DBBFF] text-white py-4 font-medium text-base flex items-center justify-center gap-2 hover:bg-[#5BA3E8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ borderRadius: '14px' }}
            >
              {isLoading ? 'Starting…' : 'Start Assessment'}
              {!isLoading && <ArrowRight className="w-5 h-5" strokeWidth={2} />}
            </button>

            {/* Footer Note */}
            <p className="text-xs text-[#9CA3AF] text-center mt-6">
              By proceeding, you agree to CMe's Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* CMe Branding */}
          <div className="text-center mt-8">
            <p className="text-xs text-[#9CA3AF]">
              Powered by <span className="font-semibold text-[#111827]">CMe</span> — Matching on what matters
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Intake Screen (uses ProfileBuilderLayout — identical to Applicant View) ───
  if (step === 'intake') {
    return (
      <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#FAFAFA]">
        {/* Employer Context Banner */}
        <div className="relative z-20 shrink-0 border-b border-black/[0.08] bg-white px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#7DBBFF] flex items-center justify-center shrink-0" style={{ borderRadius: '8px' }}>
                <Compass className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">
                  Assessment for {employerInfo.company_name}
                </h2>
                <p className="text-xs text-[#6B7280]">
                  {employerInfo.role_title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
              <span className="text-xs text-[#9CA3AF]">Secure Assessment</span>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {submitError && (
          <div className="max-w-7xl mx-auto shrink-0 px-6 pt-4">
            <div
              className="px-4 py-3 bg-[#FEE2E2] border border-[#FCA5A5] text-sm text-[#B91C1C]"
              style={{ borderRadius: '10px' }}
            >
              {submitError}
            </div>
          </div>
        )}

        {/* Profile Builder Layout — fills remaining viewport; scroll lives inside layout */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ProfileBuilderLayout
            currentStep={activeStep}
            stepStatuses={stepStatuses}
            onStepChange={(stepId) => setActiveStep(stepId)}
            onBack={handleBack}
            onFooterContinue={runAssessmentFooterContinue}
            footerContinueBusy={
              (activeStep === 3 && section3ScoringBusy) ||
              (activeStep === 4 && section4ScoringBusy) ||
              (activeStep === 6 && section6ScoringBusy)
            }
            footerHidden={profileBuilderFooterHidden}
          >
            {renderSection()}
          </ProfileBuilderLayout>
        </div>
      </div>
    );
  }

  // ─── Completion Screen ───
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white border border-black/[0.08] shadow-lg p-12 text-center" style={{ borderRadius: '24px' }}>
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10B981]/10 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-[#10B981]" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h1 className="text-3xl text-[#111827] font-semibold mb-3">
              Assessment Complete!
            </h1>

            {/* Description */}
            <p className="text-base text-[#6B7280] mb-8 max-w-md mx-auto">
              Thank you for completing the assessment. Your profile has been submitted to <span className="font-medium text-[#111827]">{employerInfo.company_name}</span>.
            </p>

            {/* Match Score (when computed) or neutral submitted state */}
            {matchScore !== null ? (
              <div className="bg-[#7DBBFF]/5 border border-[#7DBBFF]/20 p-6 mb-8 mx-auto max-w-md" style={{ borderRadius: '16px' }}>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <BarChart className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                  <span className="text-4xl font-semibold text-[#7DBBFF]">{matchScore}%</span>
                </div>
                <p className="text-sm text-[#6B7280]">
                  Your trait alignment score for this role
                </p>
              </div>
            ) : (
              <div
                className="bg-[#F9FAFB] border border-black/[0.06] p-5 mb-8 mx-auto max-w-md"
                style={{ borderRadius: '14px' }}
              >
                <p className="text-sm text-[#6B7280]">
                  Your profile has been submitted successfully. The hiring team at{' '}
                  <span className="font-medium text-[#111827]">{employerInfo.company_name}</span> will
                  review your responses.
                </p>
              </div>
            )}

            {/* Completed Sections Summary */}
            <div className="bg-[#F9FAFB] border border-black/[0.06] p-5 text-left mb-6" style={{ borderRadius: '14px' }}>
              <h4 className="text-xs text-[#6B7280] uppercase tracking-wider mb-3">Sections Completed</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { num: 1, label: 'Background Narrative' },
                  { num: 2, label: 'How You Work' },
                  { num: 3, label: 'How You Think' },
                  { num: 4, label: 'How You Handle Difficulty' },
                  { num: 5, label: 'How You Relate to Others' },
                  { num: 6, label: 'What Drives You' },
                  { num: 7, label: 'Career Direction' },
                  { num: 8, label: 'Your Profile' },
                ].map(s => {
                  const isComplete = profileData?.intakeData?.completedSections?.includes(s.num);
                  return (
                    <div key={s.num} className="flex items-center gap-2 px-3 py-2">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 ${isComplete ? 'text-[#10B981]' : 'text-[#D1D5DB]'}`}
                        strokeWidth={2}
                      />
                      <span className={`text-xs ${isComplete ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-[#F9F9FA] border border-black/[0.06] p-6 text-left mb-8" style={{ borderRadius: '14px' }}>
              <h3 className="text-sm font-semibold text-[#111827] mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li className="flex items-start gap-2">
                  <span className="text-[#7DBBFF] mt-0.5">•</span>
                  <span>
                    {matchScore !== null
                      ? 'The hiring team will review your profile and match score'
                      : 'The hiring team will review your profile'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7DBBFF] mt-0.5">•</span>
                  <span>You'll receive an email if they'd like to move forward</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7DBBFF] mt-0.5">•</span>
                  <span>Keep an eye out for next steps within 3-5 business days</span>
                </li>
              </ul>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center gap-3 text-[#6B7280]">
                <div className="w-5 h-5 border-2 border-[#7DBBFF] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Processing your profile...</span>
              </div>
            )}

            {/* Footer */}
            <p className="text-xs text-[#9CA3AF] mt-6">
              Questions? Contact {employerInfo.company_name} directly or reach out to support@cme.com
            </p>
          </div>

          {/* CMe Branding */}
          <div className="text-center mt-8">
            <p className="text-xs text-[#9CA3AF]">
              Powered by <span className="font-semibold text-[#111827]">CMe</span> — Matching on what matters
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
