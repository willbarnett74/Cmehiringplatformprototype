import { Link } from 'react-router-dom';
import { OnboardingRouteShell } from '../layout/OnboardingRouteShell';

export type LegalBetaPageProps = {
  variant: 'terms' | 'privacy';
};

export function LegalBetaPage({ variant }: LegalBetaPageProps) {
  const title = variant === 'terms' ? 'Terms of use (beta)' : 'Privacy (beta)';

  return (
    <OnboardingRouteShell className="p-6 text-[#111827] md:p-10">
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 rounded-[10px] border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <span className="font-medium">Beta product.</span>{' '}
          CMe is under active development. The information on this page is a plain-language summary for
          testers, not a substitute for formal legal agreements. We will publish full terms and privacy
          policies before general availability.
        </p>

        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>

        {variant === 'terms' ? (
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--cme-onboarding-muted)]">
            <p>
              By using CMe during beta, you agree to use the service responsibly: provide accurate
              information where asked, do not attempt to disrupt or misuse the platform, and respect
              confidentiality of any employer or candidate data you see as part of testing.
            </p>
            <p>
              Features and data handling may change. We may contact you about important updates. Nothing on
              this page limits any rights you have under New Zealand law that cannot be waived.
            </p>
            <p>
              For questions, contact the CMe team through the channel you were given for beta access.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--cme-onboarding-muted)]">
            <p>
              We collect the information you submit in the product (such as account and assessment-related
              inputs) and technical data needed to run the service (for example, session and security
              logs as configured in our backend). We use this to operate CMe, improve the beta, and
              support hiring workflows you choose to run.
            </p>
            <p>
              During beta, treat any production-like data as sensitive. Do not paste real employee or
              candidate personal information unless you are authorised to do so for testing. A detailed
              privacy policy with retention, subprocessors, and your rights will be published before
              launch.
            </p>
            <p>
              For questions, contact the CMe team through the channel you were given for beta access.
            </p>
          </div>
        )}

        <p className="mt-10 text-sm">
          <Link
            to="/onboarding/sign-in"
            className="font-medium text-[#7dbbff] underline decoration-1 underline-offset-2"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </OnboardingRouteShell>
  );
}
