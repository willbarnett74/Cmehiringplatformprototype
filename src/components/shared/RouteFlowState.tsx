import { OnboardingRouteShell } from '../layout/OnboardingRouteShell';

/** Reuse the same spinner treatment as AssessmentLink for consistency. */
function FlowSpinner() {
  return (
    <div
      className="h-10 w-10 shrink-0 rounded-full border-2 border-[#7DBBFF] border-t-transparent animate-spin"
      aria-hidden
    />
  );
}

export function RouteFlowLoading({ message, labelId }: { message: string; labelId?: string }) {
  return (
    <OnboardingRouteShell className="flex flex-col items-center justify-center gap-4 px-4">
      <FlowSpinner />
      <p
        id={labelId}
        className="text-center text-sm text-[var(--cme-onboarding-muted)]"
      >
        {message}
      </p>
    </OnboardingRouteShell>
  );
}

export function RouteFlowError({
  message,
  onRetry,
  retryLabel = 'Try again',
  secondaryAction,
}: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  secondaryAction?: { label: string; onClick: () => void };
}) {
  return (
    <OnboardingRouteShell className="flex flex-col items-center justify-center gap-4 px-6 text-center text-[#111827]">
      <p className="max-w-md text-sm text-[var(--cme-onboarding-muted)]">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-[#7DBBFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5aaeff]"
        >
          {retryLabel}
        </button>
        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="text-sm font-medium text-[var(--cme-onboarding-muted)] underline decoration-1 underline-offset-2 hover:text-[#374151]"
          >
            {secondaryAction.label}
          </button>
        ) : null}
      </div>
    </OnboardingRouteShell>
  );
}

export function RouteFlowInlineLoading({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-8">
      <FlowSpinner />
      <p className="text-center text-sm text-[var(--cme-onboarding-muted)]">{message}</p>
    </div>
  );
}
