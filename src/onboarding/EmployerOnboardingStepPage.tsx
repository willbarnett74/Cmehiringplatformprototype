import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { OnboardingRouteShell } from '../components/layout/OnboardingRouteShell';
import { CompanyProfileStep, type CompanyProfile } from '../components/employer-pages/onboarding/steps/CompanyProfileStep';
import { RoleTemplateStep } from '../components/employer-pages/onboarding/steps/RoleTemplateStep';
import { TraitWeightingStep } from '../components/employer-pages/onboarding/steps/TraitWeightingStep';
import { CalibrationStep } from '../components/employer-pages/onboarding/steps/CalibrationStep';
import type { RoleTemplate } from '../components/employer-pages/RoleTemplatePicker';
import type { CalibrationCriteria } from '../lib/calibration';
import {
  insertEmployerBusiness,
  markEmployerProfileOnboardingComplete,
  setEmployerOnboardingStep,
} from '../lib/employerOnboardingPersistence';
import {
  EMPLOYER_PORTAL_PATH,
  pathForEmployerOnboardingDbStep,
  type EmployerOnboardingStepDb,
} from '../lib/employerOnboardingRouting';
import { supabase } from '../lib/supabaseClient';
import {
  EMPLOYER_ONBOARDING_QUERY_ROOT,
  type EmployerOnboardingOutletContext,
} from './EmployerOnboardingLayout';
import type { EmployerProfileMeta } from '../lib/employerPersistence';

type StepKey = 'company' | 'role-template' | 'trait-weighting' | 'calibration';

const STEP_META: { key: StepKey; number: number; name: string; db: EmployerOnboardingStepDb }[] = [
  { key: 'company', number: 1, name: 'Company Profile', db: 'employer_company' },
  { key: 'role-template', number: 2, name: 'Role Template', db: 'employer_template' },
  { key: 'trait-weighting', number: 3, name: 'Trait Weighting', db: 'employer_weights' },
  { key: 'calibration', number: 4, name: 'Calibration', db: 'employer_calibration' },
];

interface TraitWeights {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

type OnboardingData = {
  companyProfile?: CompanyProfile;
  selectedTemplate?: RoleTemplate | null;
  traitWeights?: TraitWeights;
  calibrationCriteria?: CalibrationCriteria;
};

export function EmployerOnboardingStepPage({ stepKey }: { stepKey: StepKey }) {
  const ctx = useOutletContext<EmployerOnboardingOutletContext | undefined>();
  const userId = ctx?.userId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [savedBusinessId, setSavedBusinessId] = useState<string | null>(ctx?.businessId ?? null);
  const [busy, setBusy] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const current = STEP_META.find((s) => s.key === stepKey)!;
  const currentStep = current.number;

  useEffect(() => {
    if (ctx?.businessId) setSavedBusinessId(ctx.businessId);
  }, [ctx?.businessId]);

  const goToStep = async (dbStep: EmployerOnboardingStepDb) => {
    if (!supabase || !userId) return;
    setBusy(true);
    try {
      await setEmployerOnboardingStep(supabase, userId, dbStep as Exclude<EmployerOnboardingStepDb, 'completed'>);
      queryClient.setQueryData<EmployerProfileMeta | undefined>(
        [...EMPLOYER_ONBOARDING_QUERY_ROOT, userId],
        (old) => (old ? { ...old, onboarding_step: dbStep } : old),
      );
      navigate(pathForEmployerOnboardingDbStep(dbStep));
    } finally {
      setBusy(false);
    }
  };

  const finishOnboarding = async () => {
    if (!supabase || !userId) return;
    if (!savedBusinessId) {
      setCompanyError('Your company wasn’t saved. Please re-enter your company details.');
      navigate(pathForEmployerOnboardingDbStep('employer_company'));
      return;
    }
    setBusy(true);
    try {
      await markEmployerProfileOnboardingComplete(supabase, userId);
      try {
        localStorage.setItem('cme_employer_onboarding_complete', 'true');
      } catch {
        /* ignore */
      }
      const now = new Date().toISOString();
      queryClient.setQueryData<EmployerProfileMeta | undefined>(
        [...EMPLOYER_ONBOARDING_QUERY_ROOT, userId],
        (old) =>
          old
            ? { ...old, onboarding_step: 'completed', onboarding_completed_at: now, businessId: savedBusinessId }
            : old,
      );
      navigate(EMPLOYER_PORTAL_PATH, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  if (!userId) {
    return (
      <OnboardingRouteShell className="flex items-center justify-center px-4 text-center text-[var(--cme-onboarding-muted)]">
        Session error — please refresh.
      </OnboardingRouteShell>
    );
  }

  const handleCompanyProfileNext = async (data: CompanyProfile) => {
    setOnboardingData((prev) => ({ ...prev, companyProfile: data }));
    if (supabase) {
      setCompanyError(null);
      const { businessId, error } = await insertEmployerBusiness(supabase, userId, data);
      if (error || !businessId) {
        setCompanyError(error ?? 'We could not save your company. Please try again.');
        return;
      }
      setSavedBusinessId(businessId);
      await setEmployerOnboardingStep(supabase, userId, 'employer_template');
    }
    await goToStep('employer_template');
  };

  const handleRoleTemplateNext = async (template: RoleTemplate | null) => {
    setOnboardingData((prev) => ({ ...prev, selectedTemplate: template }));
    await goToStep('employer_weights');
  };

  const handleTraitWeightingNext = async (weights: TraitWeights) => {
    setOnboardingData((prev) => ({ ...prev, traitWeights: weights }));
    await goToStep('employer_calibration');
  };

  const handleCalibrationNext = async (criteria: CalibrationCriteria) => {
    setOnboardingData((prev) => ({ ...prev, calibrationCriteria: criteria }));
    await finishOnboarding();
  };

  const handleCalibrationSkip = async () => {
    await finishOnboarding();
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#F9F9FA] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-[#111827]">Welcome to CMe</h1>
          <p className="text-sm text-[#6B7280]">Set up your hiring platform in 4 simple steps</p>
        </div>

        <div className="mb-8 border border-black/[0.08] bg-white p-6 shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="mb-4 flex items-center justify-between">
            {STEP_META.map((step, index) => (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex shrink-0 flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      currentStep > step.number
                        ? 'border-[#10B981] bg-[#10B981]'
                        : currentStep === step.number
                          ? 'border-[#7DBBFF] bg-[#7DBBFF]'
                          : 'border-black/[0.15] bg-white'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          currentStep === step.number ? 'text-white' : 'text-[#6B7280]'
                        }`}
                      >
                        {step.number}
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-center text-xs font-medium ${
                      currentStep >= step.number ? 'text-[#111827]' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < STEP_META.length - 1 && (
                  <div className="mx-4 mb-8 h-0.5 flex-1">
                    <div
                      className={`h-full ${currentStep > step.number ? 'bg-[#10B981]' : 'bg-black/[0.08]'}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-black/[0.08] bg-white p-8 shadow-sm" style={{ borderRadius: '20px' }}>
          {stepKey === 'company' && (
            <CompanyProfileStep
              initialData={onboardingData.companyProfile}
              onNext={handleCompanyProfileNext}
              error={companyError}
              isSaving={busy}
            />
          )}
          {stepKey === 'role-template' && (
            <RoleTemplateStep
              initialSelection={onboardingData.selectedTemplate?.id}
              onNext={handleRoleTemplateNext}
              onBack={() => void goToStep('employer_company')}
            />
          )}
          {stepKey === 'trait-weighting' && (
            <TraitWeightingStep
              selectedTemplate={onboardingData.selectedTemplate ?? null}
              initialWeights={onboardingData.traitWeights}
              businessId={savedBusinessId}
              onNext={handleTraitWeightingNext}
              onBack={() => void goToStep('employer_template')}
            />
          )}
          {stepKey === 'calibration' && (
            <CalibrationStep
              roleTemplateId={onboardingData.selectedTemplate?.id ?? null}
              initialCriteria={onboardingData.calibrationCriteria}
              onNext={handleCalibrationNext}
              onBack={() => void goToStep('employer_weights')}
              onSkip={handleCalibrationSkip}
            />
          )}
        </div>

        {busy ? (
          <p className="mt-4 text-center text-xs text-[#9CA3AF]">Saving…</p>
        ) : null}
      </div>
    </div>
  );
}
