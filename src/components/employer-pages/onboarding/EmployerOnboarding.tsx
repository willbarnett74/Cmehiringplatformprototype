import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { CompanyProfileStep, type CompanyProfile } from './steps/CompanyProfileStep';
import { RoleTemplateStep } from './steps/RoleTemplateStep';
import { TraitWeightingStep } from './steps/TraitWeightingStep';
import { CalibrationStep } from './steps/CalibrationStep';
import type { CalibrationCriteria } from '../../../lib/calibration';
import type { RoleTemplate } from '../RoleTemplatePicker';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import { setProfileRoleEmployer, insertEmployerBusiness, markEmployerProfileOnboardingComplete } from '../../../lib/employerOnboardingPersistence';

interface TraitWeights {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

interface OnboardingData {
  companyProfile?: CompanyProfile;
  selectedTemplate?: RoleTemplate | null;
  traitWeights?: TraitWeights;
  calibrationCriteria?: CalibrationCriteria;
}

interface EmployerOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export function EmployerOnboarding({ onComplete }: EmployerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [savedBusinessId, setSavedBusinessId] = useState<string | null>(null);

  const steps = [
    { number: 1, name: 'Company Profile', required: true },
    { number: 2, name: 'Role Template', required: true },
    { number: 3, name: 'Trait Weighting', required: true },
    { number: 4, name: 'Calibration', required: false },
  ];

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;
    void client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        void setProfileRoleEmployer(client, session.user.id);
      }
    });
  }, []);

  const handleCompanyProfileNext = async (data: CompanyProfile) => {
    setOnboardingData((prev) => ({ ...prev, companyProfile: data }));
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const bid = await insertEmployerBusiness(supabase, session.user.id, data);
        if (bid) setSavedBusinessId(bid);
      }
    }
    setCurrentStep(2);
  };

  const handleRoleTemplateNext = (template: RoleTemplate | null) => {
    setOnboardingData((prev) => ({ ...prev, selectedTemplate: template }));
    setCurrentStep(3);
  };

  const handleRoleTemplateBack = () => {
    setCurrentStep(1);
  };

  const handleTraitWeightingNext = (weights: TraitWeights) => {
    setOnboardingData((prev) => ({ ...prev, traitWeights: weights }));
    setCurrentStep(4);
  };

  const handleTraitWeightingBack = () => {
    setCurrentStep(2);
  };

  const handleCalibrationNext = async (criteria: CalibrationCriteria) => {
    const finalData = { ...onboardingData, calibrationCriteria: criteria };
    setOnboardingData(finalData);
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await markEmployerProfileOnboardingComplete(supabase, session.user.id);
      }
    }
    onComplete(finalData);
  };

  const handleCalibrationSkip = async () => {
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await markEmployerProfileOnboardingComplete(supabase, session.user.id);
      }
    }
    onComplete(onboardingData);
  };

  const handleCalibrationBack = () => {
    setCurrentStep(3);
  };

  return (
    <div className="fixed inset-0 bg-[#F9F9FA] z-50 overflow-y-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-[#111827] font-semibold mb-2">Welcome to CMe</h1>
          <p className="text-sm text-[#6B7280]">Let's set up your hiring platform in 4 simple steps</p>
        </div>

        <div className="bg-white p-6 mb-8 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep > step.number
                        ? 'bg-[#10B981] border-[#10B981]'
                        : currentStep === step.number
                          ? 'bg-[#7DBBFF] border-[#7DBBFF]'
                          : 'bg-white border-black/[0.15]'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
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
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-medium ${
                        currentStep >= step.number ? 'text-[#111827]' : 'text-[#9CA3AF]'
                      }`}
                    >
                      {step.name}
                    </p>
                    {!step.required && <p className="text-xs text-[#9CA3AF]">(Optional)</p>}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 mb-8">
                    <div
                      className={`h-full transition-all ${
                        currentStep > step.number ? 'bg-[#10B981]' : 'bg-black/[0.08]'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-black/[0.08]">
            <p className="text-sm text-[#6B7280]">
              Step {currentStep} of {steps.length}
              {currentStep === 4 && ' (Skippable)'}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          {currentStep === 1 && (
            <CompanyProfileStep initialData={onboardingData.companyProfile} onNext={handleCompanyProfileNext} />
          )}

          {currentStep === 2 && (
            <RoleTemplateStep
              initialSelection={onboardingData.selectedTemplate?.id}
              onNext={handleRoleTemplateNext}
              onBack={handleRoleTemplateBack}
            />
          )}

          {currentStep === 3 && (
            <TraitWeightingStep
              selectedTemplate={onboardingData.selectedTemplate ?? null}
              initialWeights={onboardingData.traitWeights}
              businessId={savedBusinessId}
              onNext={handleTraitWeightingNext}
              onBack={handleTraitWeightingBack}
            />
          )}

          {currentStep === 4 && (
            <CalibrationStep
              roleTemplateId={onboardingData.selectedTemplate?.id ?? null}
              initialCriteria={onboardingData.calibrationCriteria}
              onNext={handleCalibrationNext}
              onBack={handleCalibrationBack}
              onSkip={handleCalibrationSkip}
            />
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-[#9CA3AF]">
            {currentStep < 3
              ? 'Steps 1-3 are required before accessing the platform'
              : currentStep === 3
                ? 'Almost there! One more step (or skip to finish)'
                : 'Complete or skip this step to access your dashboard'}
          </p>
        </div>
      </div>
    </div>
  );
}
