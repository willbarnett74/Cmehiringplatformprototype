# Spec 6 — Insight Layer v2 ✅ COMPLETE

## Summary

Implemented comprehensive analytics dashboard with 5 section tabs, intelligent pattern detection, automated callouts, and confidence-scored insights based on hiring performance data.

## Architecture

### Data Layer

**`/src/lib/insightQueries.ts`** — All Supabase data fetching
- `fetchInsightData()` — Promise.all fetches all data on mount
- No query logic in components
- Typed data structures for charts and inference
- Mock data with 10 hired candidates, 4 quarters of time series

**Key Data Structures:**
```typescript
InsightData {
  employerWeights: EmployerWeights
  hiredCandidates: HiredCandidate[]
  topPerformers: HiredCandidate[]
  allCandidates: CandidateProfile[]
  timeSeriesData: TimeSeriesDataPoint[]
  correlationData: CorrelationData[]
}
```

### Computation Layer

**`/src/lib/insightHelpers.ts`** — Pure utility functions
- Normalization (z-scores, standard deviation)
- Gap calculation (employer weights vs. actual performance)
- Callout generation (natural language)
- State pattern detection (green/amber/red)
- Formatting utilities (percent, numbers, dates)

**`/src/lib/inferenceEngine.ts`** — Pattern detection & business logic
- **Dimension signals**: which traits correlate with performance
- **Weighting divergence**: employer weights vs. top performer averages
- **Role detection**: hiring patterns by role
- **Pattern alerts**: churn, quality, overdue, trend warnings
- **Confidence scoring**: 0-100 based on sample size and variance

**Key Functions:**
```typescript
runInferenceEngine() → InferenceResult {
  dimensionSignals: DimensionSignal[]
  weightingDivergences: WeightingDivergence[]
  roleInsights: RoleDetection[]
  patternAlerts: PatternAlert[]
  hiringState: StatePattern
  overallConfidence: number
}
```

### Presentation Layer

**`/src/components/employer-pages/InsightPage.tsx`** — Top-level container
- 5 tab navigation (Overview, Hiring Profile, Correlations, Pipeline, Trends)
- Data fetching on mount with Promise.all
- Runs inference engine once
- Loading and error states

## Five Sections

### 1. Overview Section
**File:** `/src/components/employer-pages/insights/OverviewSection.tsx`

**Displays:**
- 4 metric cards: Total Hires, Avg Match Score, Top Performers, Departed
- Hiring state indicator (green/amber/red) with confidence score
- Pattern alerts with severity badges
- Empty state when no alerts

**Features:**
- State-based color coding
- Confidence-stained cards
- Auto-generated callouts

### 2. Hiring Profile Section
**File:** `/src/components/employer-pages/insights/HiringProfileSection.tsx`

**Displays:**
- **Radar chart**: 3 series
  - Employer weights (blue)
  - Hired average (amber)
  - Top performers (green)
- Auto divergence callouts when gap ≥ 15pts
- Confidence-scored insight cards

**Features:**
- Recharts RadarChart with 6 dimensions
- Automatic pattern detection
- Severity-based styling (high/medium)
- Dimension mapping: employer → candidate traits

**Example Callout:**
> "Top performers score 18pts higher in Communication than your current weighting suggests — consider increasing this dimension's importance"

### 3. Correlations Section
**File:** `/src/components/employer-pages/insights/CorrelationsSection.tsx`

**Displays:**
- **Grouped bar chart**: intake scores by performance band
  - Top performers (green)
  - Mid performers (amber)
  - Low performers (red)
- Strong/moderate correlation callouts
- **State 2+ gate**: requires n ≥ 5 samples

**Features:**
- Correlation strength detection (strong/moderate/weak/none)
- Confidence scoring based on sample size
- Insufficient data state with progress indicator

**Example Callout:**
> "Cognitive Agility strongly predicts success: top performers score 15pts higher than underperformers"

### 4. Pipeline Section
**File:** `/src/components/employer-pages/insights/PipelineSection.tsx`

**Displays:**
- Candidate table with columns:
  - Name & location
  - Role
  - Match score (with %)
  - Trait health indicators (6 colored dots)
  - Stage badge
  - View profile link
- Sortable by name, score, stage

**Features:**
- Trait health dots with hover tooltips
- Color-coded stage badges
- Click-to-sort headers
- Mock pipeline data (3 candidates)

### 5. Trends Section
**File:** `/src/components/employer-pages/insights/TrendsSection.tsx`

**Displays:**
- **Active/Departed subtabs**
- Line charts:
  - Hires per quarter
  - Avg match score trend
  - Departures per quarter
- Trend direction indicator (increasing/decreasing/stable)
- Pattern alerts: overdue flags, declining velocity

**Features:**
- Recharts LineChart with time series
- Trend pattern detection
- Overdue count alerts
- Confidence-scored warnings

## Pattern Detection

### Dimension Signals
Detects which traits correlate with high performance:

```typescript
detectDimensionSignals(correlationData) → DimensionSignal[]
```

**Logic:**
1. Calculate top/mid/low performer averages per dimension
2. Compute correlation (topAvg - lowAvg) / 100
3. Classify strength: strong (≥15%), moderate (≥8%), weak (≥3%), none
4. Generate natural language callout
5. Score confidence based on sample size and variance

### Weighting Divergence
Detects gaps between employer weights and actual top performer traits:

```typescript
detectWeightingDivergences(weights, topPerformers, threshold=12) → WeightingDivergence[]
```

**Logic:**
1. Calculate average trait scores for top performers
2. Map employer dimensions → candidate traits
3. Compute divergence = |weight - topPerformerAvg|
4. Classify severity: high (>20), medium (>12), low (≤12)
5. Generate callout if severity ≥ medium

### Pattern Alerts
Detects critical hiring issues:

```typescript
detectPatternAlerts(hired, timeSeries) → PatternAlert[]
```

**Checks:**
- **Overdue**: ≥ 3 candidates overdue in pipeline → amber
- **Churn**: departure rate > 25% → red, > 15% → amber
- **Quality**: avg match score < 75% → red
- **Trend**: declining hiring velocity → amber

### Hiring State
Overall health indicator:

```typescript
detectHiringState(hiredCount, avgMatch, departed, overdue) → StatePattern
```

**States:**
- 🔴 **Red**: churn > 30% OR avg match < 70
- 🟠 **Amber**: churn > 15% OR avg match < 80 OR overdue > 2
- 🟢 **Green**: healthy metrics

## Confidence Scoring

All insights include confidence scores (0-100):

**Factors:**
- Sample size: more data = higher confidence
- Variance: lower std dev = higher confidence
- Recency: recent data weighted more

**Formula:**
```typescript
confidence = min(100, (sampleSize / minRequired) * 100 * (1 - variance / 100))
```

**Display:**
- ≥ 85%: Green badge "High confidence"
- ≥ 60%: Amber badge "Medium confidence"
- < 60%: Red badge "Low confidence"

## Mock Data

### Hired Candidates (n=10)
- 3 top performers (rating 5)
- 4 mid performers (rating 3-4)
- 2 low performers (rating 2, 1 departed)
- 1 departed candidate
- Varied trait scores (48-96 range)

### Time Series (4 quarters)
```
Q2 2025: 3 hires, 0 departures, 93.7% avg match
Q3 2025: 2 hires, 0 departures, 92.5% avg match
Q4 2025: 3 hires, 0 departures, 88.3% avg match
Q1 2026: 2 hires, 1 departure, 75.0% avg match (2 overdue)
```

## Chart Configuration

All charts use Recharts with consistent styling:

**Colors:**
- Primary blue: `#7DBBFF` (employer weights)
- Green: `#10B981` (top performers, positive)
- Amber: `#F59E0B` (mid performers, warnings)
- Red: `#EF4444` (low performers, critical)

**Styling:**
- Grid: `#E5E7EB`
- Axis labels: `#6B7280` (12px)
- Tick marks: `#9CA3AF` (11px)
- Tooltips: dark `#111827` background, white text
- Border radius: `14px` (cards), `8px` (tooltips)

**Keys:**
Each chart element has unique `key` prop to prevent React warnings.

## Files Created

```
/src/lib/insightHelpers.ts                               — 350 lines
/src/lib/insightQueries.ts                               — 380 lines
/src/lib/inferenceEngine.ts                              — 450 lines
/src/components/employer-pages/InsightPage.tsx           — 140 lines
/src/components/employer-pages/insights/OverviewSection.tsx        — 150 lines
/src/components/employer-pages/insights/HiringProfileSection.tsx   — 180 lines
/src/components/employer-pages/insights/CorrelationsSection.tsx    — 200 lines
/src/components/employer-pages/insights/PipelineSection.tsx        — 250 lines
/src/components/employer-pages/insights/TrendsSection.tsx          — 240 lines
/SPEC_6_IMPLEMENTATION.md                                — This file
```

## Files Updated

```
/components/employer-pages/InsightsAnalyticsPage.tsx — Now wrapper for InsightPage
```

## Production Implementation

### Supabase Queries

Replace mock functions in `insightQueries.ts`:

```typescript
// 1. Employer weights
const { data: weights } = await supabase
  .from('employer_trait_weightings')
  .select('*')
  .eq('employer_id', employerId)
  .single();

// 2. Hired candidates with performance
const { data: hired } = await supabase
  .from('candidate_profiles')
  .select(`
    *,
    engagements!inner(match_score, hired_date, stage, departed, departed_date),
    performance_snapshots(performance_rating)
  `)
  .eq('engagements.stage', 'hired')
  .eq('engagements.employer_id', employerId);

// 3. Time series data
const { data: timeSeries } = await supabase
  .rpc('get_quarterly_hiring_stats', { p_employer_id: employerId });
```

### Edge Function for Auto-Insights

**File:** `supabase/functions/generate-insights/index.ts`

```typescript
import { runInferenceEngine } from './inferenceEngine.ts';

serve(async (req) => {
  const { employerId } = await req.json();
  
  // Fetch data
  const data = await fetchInsightData(employerId);
  
  // Run inference
  const insights = runInferenceEngine(
    data.employerWeights,
    data.hiredCandidates,
    data.topPerformers,
    data.correlationData,
    data.timeSeriesData
  );
  
  // Store insights in database
  await supabase
    .from('insight_snapshots')
    .insert({
      employer_id: employerId,
      insights: insights,
      generated_at: new Date().toISOString(),
    });
  
  return new Response(JSON.stringify(insights));
});
```

### Scheduled Insights Generation

**Cron:** Run weekly via Supabase Cron Jobs

```sql
SELECT cron.schedule(
  'generate-weekly-insights',
  '0 9 * * 1', -- Every Monday at 9am
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-insights',
    body := json_build_object('employerId', id)
  )
  FROM employers;
  $$
);
```

## Testing

### How to Test

1. **Navigate to Insights:**
   - Go to Employer View → "Insights & Analytics" tab
   - Should see 5 tabs: Overview, Hiring Profile, Correlations, Pipeline, Trends

2. **Verify Data Loading:**
   - Check for loading spinner on mount
   - Verify all charts render without console errors
   - Inspect callouts for natural language quality

3. **Test Radar Chart:**
   - Switch to "Hiring Profile" tab
   - Hover over radar chart series
   - Verify divergence callouts appear below chart

4. **Test Bar Chart:**
   - Switch to "Correlations" tab
   - Verify grouped bars show top/mid/low performers
   - Check correlation callouts for strong signals

5. **Test Pipeline Table:**
   - Switch to "Pipeline" tab
   - Click column headers to sort
   - Hover over trait health dots for tooltips

6. **Test Time Series:**
   - Switch to "Trends" tab
   - Toggle between "Active Hires" and "Departed" subtabs
   - Verify trend direction indicator

### Confidence Scoring

Inspect confidence badges on callouts:
- Should see percentages (e.g., "85% confidence")
- Colors: green (≥85), amber (≥60), red (<60)
- Tooltips explain sample size basis

## Design System Alignment

**Colors:**
- Cards: White `#FFFFFF` with `border-black/[0.08]`
- Text: Primary `#111827`, secondary `#6B7280`, tertiary `#9CA3AF`
- States: Green `#10B981`, amber `#F59E0B`, red `#EF4444`
- Primary accent: `#7DBBFF`

**Border Radius:**
- Cards: `14px`
- Buttons: `12px`
- Badges: `6px`
- Tooltips: `8px`

**Typography:**
- Page title: `text-2xl font-semibold`
- Section title: `text-lg font-semibold`
- Card title: `text-sm font-semibold`
- Body: `text-sm`
- Labels: `text-xs`

## Next Steps

1. **Real-time Updates:** WebSocket subscriptions for live insights
2. **Custom Alerts:** User-configurable thresholds
3. **Export Reports:** PDF/CSV export of insights
4. **Historical Comparison:** Year-over-year trends
5. **A/B Testing:** Test different weighting strategies
6. **Predictive Analytics:** ML-based hiring recommendations

## Dependencies

- ✅ Recharts (charts)
- ✅ Lucide React (icons)
- ✅ Spec 5: Match scoring library
- ✅ Spec 1-4: Data structures (candidate_profiles, engagements, etc.)

## Status

**✅ COMPLETE** — March 14, 2026

All 5 sections implemented with full pattern detection, confidence scoring, and automated insights.

---

**Implementation Notes:**
- All Supabase queries centralized in one file
- No query logic in React components
- Inference engine is stateless and testable
- All charts have unique keys to prevent React warnings
- Mock data demonstrates full range of states and patterns
- Production-ready architecture with clear separation of concerns
