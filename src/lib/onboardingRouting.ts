/** Logged-in applicant shell (dashboard, profile builder, etc.) */
export const APPLICANT_PORTAL_PATH = '/applicant-portal';

/** DB values on public.profiles.onboarding_step */
export type OnboardingStepDb = 'welcome' | 'details' | 'how_it_works' | 'completed';

/** Matches ApplicantWelcomePage UI segments */
export type WelcomeUiStep = 'welcome' | 'details' | 'how-it-works';

export function dbStepFromWelcomeUi(step: WelcomeUiStep): Exclude<OnboardingStepDb, 'completed'> {
  if (step === 'how-it-works') return 'how_it_works';
  return step;
}

export function welcomeUiFromDb(step: OnboardingStepDb): WelcomeUiStep | null {
  switch (step) {
    case 'welcome':
      return 'welcome';
    case 'details':
      return 'details';
    case 'how_it_works':
      return 'how-it-works';
    default:
      return null;
  }
}

export function pathForOnboardingDbStep(step: OnboardingStepDb): string {
  switch (step) {
    case 'welcome':
      return '/onboarding/welcome';
    case 'details':
      return '/onboarding/basics';
    case 'how_it_works':
      return '/onboarding/how-it-works';
    case 'completed':
      return APPLICANT_PORTAL_PATH;
    default:
      return '/onboarding/welcome';
  }
}
