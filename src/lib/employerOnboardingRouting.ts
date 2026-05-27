/** Logged-in employer shell */
export const EMPLOYER_PORTAL_PATH = '/employer-portal';

/** DB values on public.profiles.onboarding_step for employer wizard */
export type EmployerOnboardingStepDb =
  | 'employer_company'
  | 'employer_template'
  | 'employer_weights'
  | 'employer_calibration'
  | 'completed';

export const EMPLOYER_ONBOARDING_PATHS = [
  '/onboarding/employer/company',
  '/onboarding/employer/role-template',
  '/onboarding/employer/trait-weighting',
  '/onboarding/employer/calibration',
] as const;

export function pathForEmployerOnboardingDbStep(step: EmployerOnboardingStepDb | string | null | undefined): string {
  switch (step) {
    case 'employer_company':
      return '/onboarding/employer/company';
    case 'employer_template':
      return '/onboarding/employer/role-template';
    case 'employer_weights':
      return '/onboarding/employer/trait-weighting';
    case 'employer_calibration':
      return '/onboarding/employer/calibration';
    case 'completed':
      return EMPLOYER_PORTAL_PATH;
    default:
      return '/onboarding/employer/company';
  }
}

export function employerDbStepFromPath(pathname: string): EmployerOnboardingStepDb | null {
  switch (pathname) {
    case '/onboarding/employer/company':
      return 'employer_company';
    case '/onboarding/employer/role-template':
      return 'employer_template';
    case '/onboarding/employer/trait-weighting':
      return 'employer_weights';
    case '/onboarding/employer/calibration':
      return 'employer_calibration';
    default:
      return null;
  }
}

export function isEmployerOnboardingStep(step: string | null | undefined): step is EmployerOnboardingStepDb {
  return (
    step === 'employer_company' ||
    step === 'employer_template' ||
    step === 'employer_weights' ||
    step === 'employer_calibration' ||
    step === 'completed'
  );
}
