/**
 * Pluggable analytics — replace `trackEvent` body when product wires PostHog / etc.
 * In development, events log to the console with an `[analytics]` prefix.
 */

export const AnalyticsEvents = {
  sign_in_started: 'sign_in_started',
  oauth_return: 'oauth_return',
  onboarding_step_viewed: 'onboarding_step_viewed',
  onboarding_complete: 'onboarding_complete',
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export function trackEvent(name: AnalyticsEventName, props?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.info('[analytics]', name, props ?? {});
  }
}
