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

import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Lock, Users, BarChart, Compass } from 'lucide-react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { ProfileBuilderLayout } from '../../components/applicant-pages/ProfileBuilderLayout';
import { IntakeSection1 } from '../../components/applicant-pages/intake/IntakeSection1';
import { IntakeSection2 } from '../../components/applicant-pages/intake/IntakeSection2';
import { IntakeSection3 } from '../../components/applicant-pages/intake/IntakeSection3';
import { IntakeSection4 } from '../../components/applicant-pages/intake/IntakeSection4';
import { IntakeSection5 } from '../../components/applicant-pages/intake/IntakeSection5';
import { IntakeSection6 } from '../../components/applicant-pages/intake/IntakeSection6';
import { IntakeSection7 } from '../../components/applicant-pages/intake/IntakeSection7';
import { IntakeSection8 } from '../../components/applicant-pages/intake/IntakeSection8';
import { computeIntakeScores } from '../../utils/intakeScoring';
import { mockEdgeFunctionTrigger } from '../lib/matchScoring';

interface AssessmentLinkProps {
  // In production, pass token from URL params via React Router
  token?: string;
}

export function AssessmentLink({ token = 'demo_token_abc123' }: AssessmentLinkProps) {
  const { profileData, updateIntakeSection, updateTraitScores, markIntakeComplete, resetProfile } = useUserProfile();
  const [step, setStep] = useState<'landing' | 'intake' | 'complete'>('landing');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  
  // Mock: Decode token to get employer info
  // In production: validate server-side, fetch employer details
  const employerInfo = {
    company_name: 'DeanKernel Design Co.',
    role_title: 'Senior Product Designer',
    employer_id: 1,
  };

  // Reset profile on mount (cold start)
  useEffect(() => {
    resetProfile();
  }, []);

  const handleStartIntake = () => {
    setStep('intake');
  };

  // ─── Profile Builder Logic (mirrors ApplicantScreen exactly) ───

  // Calculate step statuses dynamically based on completed sections
  const getStepStatus = (stepId: number): 'active' | 'needsReview' | 'upToDate' => {
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
      // Go back to landing page
      setStep('landing');
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = (data?: any) => {
    console.log('[AssessmentLink] Section data:', data);

    // Save section data to context (identical to ApplicantScreen)
    if (data && data.section) {
      updateIntakeSection(data.section, data.responses);

      // Check if we've completed section 8 (final section)
      if (data.section === 8) {
        // Calculate trait scores from sections 2-6
        const intakeResponses = {
          section2: profileData.intakeData.section2,
          section3: profileData.intakeData.section3,
          section4: profileData.intakeData.section4,
          section5: profileData.intakeData.section5,
          section6: profileData.intakeData.section6,
        };

        const scores = computeIntakeScores(intakeResponses);
        updateTraitScores(scores);
        markIntakeComplete();

        console.log('[AssessmentLink] Intake complete! Trait scores:', scores);
      }
    }

    if (activeStep < 8) {
      setActiveStep(activeStep + 1);
    } else {
      // Final section completed — trigger completion flow
      handleIntakeComplete();
    }
  };

  // Render the appropriate intake section (identical to ApplicantScreen)
  const renderSection = () => {
    switch (activeStep) {
      case 1:
        return <IntakeSection1 onComplete={(data) => handleNext(data)} />;
      case 2:
        return <IntakeSection2 onComplete={(data) => handleNext(data)} />;
      case 3:
        return <IntakeSection3 onComplete={(data) => handleNext(data)} />;
      case 4:
        return <IntakeSection4 onComplete={(data) => handleNext(data)} />;
      case 5:
        return <IntakeSection5 onComplete={(data) => handleNext(data)} />;
      case 6:
        return <IntakeSection6 onComplete={(data) => handleNext(data)} />;
      case 7:
        return <IntakeSection7 onComplete={(data) => handleNext(data)} />;
      case 8:
        return <IntakeSection8 onComplete={() => handleNext()} />;
      default:
        return <IntakeSection1 onComplete={(data) => handleNext(data)} />;
    }
  };

  // ─── Completion Logic ───

  const handleIntakeComplete = async () => {
    setIsLoading(true);
    
    // MOCK: In production, this happens server-side via Supabase Edge Function
    try {
      // 1. Create candidate_profiles record
      console.log('[AssessmentLink] Creating candidate profile...', profileData);
      
      // 2. Create engagement record
      const candidateId = Math.floor(Math.random() * 10000); // Mock ID
      console.log('[AssessmentLink] Creating engagement record...', {
        candidate_id: candidateId,
        employer_id: employerInfo.employer_id,
        stage: 'newSignals',
      });
      
      // 3. Trigger Edge Function to compute match score
      const result = await mockEdgeFunctionTrigger(candidateId, employerInfo.employer_id);
      
      if (result.success) {
        setMatchScore(result.matchScore);
      }
      
      // 4. Transition to completion screen
      setTimeout(() => {
        setIsLoading(false);
        setStep('complete');
      }, 1500);
    } catch (error) {
      console.error('[AssessmentLink] Error completing intake:', error);
      setIsLoading(false);
    }
  };

  // ─── Landing Screen ───
  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
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

            {/* CTA Button */}
            <button
              onClick={handleStartIntake}
              className="w-full bg-[#7DBBFF] text-white py-4 font-medium text-base flex items-center justify-center gap-2 hover:bg-[#5BA3E8] transition-colors"
              style={{ borderRadius: '14px' }}
            >
              Start Assessment
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
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
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* Employer Context Banner */}
        <div className="bg-white border-b border-black/[0.08] px-6 py-3 z-20 relative">
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

        {/* Profile Builder Layout — same as Applicant View */}
        <ProfileBuilderLayout
          currentStep={activeStep}
          stepStatuses={stepStatuses}
          onStepChange={(stepId) => setActiveStep(stepId)}
          onBack={handleBack}
          onNext={() => handleNext()}
        >
          {renderSection()}
        </ProfileBuilderLayout>
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

            {/* Match Score (if computed) */}
            {matchScore !== null && (
              <div className="bg-[#7DBBFF]/5 border border-[#7DBBFF]/20 p-6 mb-8 mx-auto max-w-md" style={{ borderRadius: '16px' }}>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <BarChart className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                  <span className="text-4xl font-semibold text-[#7DBBFF]">{matchScore}%</span>
                </div>
                <p className="text-sm text-[#6B7280]">
                  Your trait alignment score for this role
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
                  <span>The hiring team will review your profile and match score</span>
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
