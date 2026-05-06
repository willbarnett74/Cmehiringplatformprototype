import type { ReactNode } from 'react';

/**
 * Light full-bleed canvas for authenticated onboarding, sign-in, and auth-gate loading states.
 *
 * Route groups: The marketing prototype shell (`App`) uses `--cme-marketing-shell-bg` for the
 * dark chrome; this wrapper uses `--cme-onboarding-canvas` so onboarding/auth match `LoginScreen`
 * and dashboard-style surfaces without scattering ad hoc `#fafafa` values.
 */
export function OnboardingRouteShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-h-screen bg-[var(--cme-onboarding-canvas)] transition-colors duration-150 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
