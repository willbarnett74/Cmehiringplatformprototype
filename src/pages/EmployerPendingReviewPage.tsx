import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { OnboardingRouteShell } from '../components/layout/OnboardingRouteShell';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { EmployerStatus } from '../lib/employerPersistence';
import { EMPLOYER_PORTAL_PATH } from '../lib/employerOnboardingRouting';
import { pathForEmployerOnboardingDbStep } from '../lib/employerOnboardingRouting';

export function EmployerPendingReviewPage({
  status,
}: {
  status: Exclude<EmployerStatus, null | 'approved'>;
}) {
  const navigate = useNavigate();

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      void navigate('/onboarding/sign-in', { replace: true });
      return;
    }
    await supabase.auth.signOut();
    void navigate('/onboarding/sign-in', { replace: true });
  };

  const isRejected = status === 'rejected';

  return (
    <OnboardingRouteShell className="flex min-h-screen items-center justify-center px-4 py-12 text-[#111827]">
      <div className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center bg-[#7dbbff]/15 text-[#7dbbff]"
          style={{ borderRadius: '14px' }}
        >
          <Clock className="h-6 w-6" strokeWidth={2} aria-hidden />
        </div>
        <h1 className="mb-2 text-xl font-semibold">
          {isRejected ? 'Employer access not approved' : 'Your employer account is under review'}
        </h1>
        <p className="text-sm leading-6 text-[var(--cme-onboarding-muted)]">
          {isRejected
            ? 'This account is not approved for employer access. Contact support if you believe this is a mistake.'
            : 'Thanks for signing up as a hiring team. We review new employer accounts before unlocking candidate search and messaging. You will get full access once approved — usually within one business day.'}
        </p>
        {!isRejected ? (
          <p className="mt-4 text-xs leading-5 text-[#9CA3AF]">
            You can sign out and come back later. After approval, sign in again to continue employer
            onboarding at{' '}
            <span className="font-medium text-[#6B7280]">{pathForEmployerOnboardingDbStep('employer_company')}</span>{' '}
            and your portal at{' '}
            <span className="font-medium text-[#6B7280]">{EMPLOYER_PORTAL_PATH}</span>.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-black/[0.08] px-4 py-2.5 text-sm font-medium text-[#111827] transition hover:bg-[#F9F9FA]"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
          Sign out
        </button>
      </div>
    </OnboardingRouteShell>
  );
}
