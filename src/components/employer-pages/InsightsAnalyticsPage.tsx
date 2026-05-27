/**
 * InsightsAnalyticsPage — Wrapper for new InsightPage component
 *
 * This file preserved for backward compatibility with EmployerScreen routing.
 * All new functionality is in /src/components/employer-pages/InsightPage.tsx
 */

import type { EmployerWeights } from '../../lib/matchScoring';
import { InsightPage } from './InsightPage';

export function InsightsAnalyticsPage({
  employerBusinessName,
  businessId,
  weights,
}: {
  employerBusinessName?: string;
  businessId?: string | null;
  weights?: EmployerWeights | null;
}) {
  return (
    <InsightPage
      employerBusinessName={employerBusinessName}
      businessId={businessId}
      weights={weights}
    />
  );
}
