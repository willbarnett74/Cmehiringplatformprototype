/**
 * Insight Page — Employer insight layer
 *
 * Four panels in a 2×2 grid (desktop), single column (mobile):
 *   1. Hiring Profile      — radar chart, employer weights vs hired avg vs top performers
 *   2. Performance Correlations — grouped bar chart by performance band
 *   3. Pipeline Snapshot   — full-width candidate table with match scores (lg:col-span-2)
 *   4. Motivational Fit    — quarterly time-series per hire
 *
 * Data state system:
 *   State 1 (<5 snapshots)  — hiring profile + pipeline only; others show gate
 *   State 2 (5-14)          — early-signal framing throughout
 *   State 3 (15+)           — full correlations + confidence display
 */

import { useState, useEffect } from 'react';
import { AlertCircle, BarChart2, Download, Calendar } from 'lucide-react';
import { fetchInsightData, InsightData } from '../../lib/insightQueries';
import { runInferenceEngine, InferenceResult } from '../../lib/inferenceEngine';
import { getDataState, DataState } from './insights/shared';
import { HiringProfileSection } from './insights/HiringProfileSection';
import { CorrelationsSection } from './insights/CorrelationsSection';
import { PipelineSection } from './insights/PipelineSection';
import { MotivationalFitSection } from './insights/MotivationalFitSection';

// ─── Date Range Filter ───────────────────────────────────────────────────────

const DATE_RANGE_OPTIONS = [
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'Last 12 months', value: '12m' },
  { label: 'All time', value: 'all' },
] as const;

type DateRange = typeof DATE_RANGE_OPTIONS[number]['value'];

function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} strokeWidth={2} />
      <div className="flex" style={{ gap: '2px' }}>
        {DATE_RANGE_OPTIONS.map(opt => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: active ? 600 : 400,
                color: active ? '#111827' : '#6B7280',
                background: active ? '#fff' : 'transparent',
                border: active ? '1px solid #E5E7EB' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Panel Card Wrapper ──────────────────────────────────────────────────────

function PanelCard({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: '14px',
        padding: '28px',
        gridColumn: fullWidth ? 'span 2' : undefined,
      }}
    >
      {children}
    </div>
  );
}

// ─── State 1 Onboarding Message ──────────────────────────────────────────────

function OnboardingCallout() {
  return (
    <div
      style={{
        background: 'rgba(125,187,255,0.05)',
        border: '1px solid rgba(125,187,255,0.20)',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      <BarChart2
        className="flex-shrink-0"
        style={{ color: '#7DBBFF', marginTop: '2px' }}
        strokeWidth={1.5}
        size={22}
      />
      <p
        style={{
          fontSize: '14px',
          color: '#374151',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        Your insight layer builds as you hire. Every candidate you assess, hire, and track generates
        data that makes these panels sharper and more specific to your business. The employers who
        get the most from CMe are the ones who complete performance snapshots consistently — that is
        what turns hiring data into a genuine competitive advantage.
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function InsightPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [inference, setInference] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('12m');

  // Suppress recharts duplicate-key warnings (internal recharts issue)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Encountered two children with the same key')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const employerId = 1;
        const insightData = await fetchInsightData(employerId);
        const inferenceResult = runInferenceEngine(
          insightData.employerWeights,
          insightData.hiredCandidates,
          insightData.topPerformers,
          insightData.correlationData,
          insightData.timeSeriesData
        );
        setData(insightData);
        setInference(inferenceResult);
      } catch (err) {
        console.error('[InsightPage] Error loading data:', err);
        setError('Failed to load insights. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7DBBFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ fontSize: '12px', color: '#6B7280' }}>Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !inference) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#EF4444] mx-auto mb-4" strokeWidth={1.5} />
          <p style={{ fontSize: '12px', color: '#6B7280' }}>{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const dataState: DataState = getDataState(data.snapshotCount);
  const activeHires = data.hiredCandidates.filter(c => !c.departed).length;
  const businessName = 'Meridian Design Co.'; // MOCK — replace with real employer context
  const hasNoEngagements = data.hiredCandidates.length === 0 && data.allCandidates.length === 0;

  return (
    <div>
      {/* ── Topbar ── */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between mb-6"
        style={{
          background: 'rgba(244,246,249,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E5E7EB',
          padding: '16px 32px',
          margin: '-16px -32px 24px -32px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.4px',
              color: '#111827',
              marginBottom: '2px',
            }}
          >
            Insights & Analytics
          </h1>
          <p style={{ fontSize: '12px', color: '#6B7280' }}>
            {data.snapshotCount} performance snapshots · {activeHires} active hires · {businessName}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#374151',
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '7px 14px',
            cursor: 'pointer',
          }}
        >
          <span className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Export
          </span>
        </button>
      </div>

      {/* ── Date Range Filter ── */}
      <div className="mb-6">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* ── State 1 Onboarding Message (shown when no engagements yet) ── */}
      {dataState === 1 && hasNoEngagements && <OnboardingCallout />}

      {/* ── 2×2 Panel Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}
        className="insight-grid"
      >
        {/* Panel 1 — Hiring Profile */}
        <PanelCard>
          <HiringProfileSection
            employerWeights={data.employerWeights}
            topPerformers={data.topPerformers}
            hiredCandidates={data.hiredCandidates}
            divergences={inference.weightingDivergences}
            dataState={dataState}
            snapshotCount={data.snapshotCount}
          />
        </PanelCard>

        {/* Panel 2 — Performance Correlations */}
        <PanelCard>
          <CorrelationsSection
            correlationData={data.correlationData}
            dimensionSignals={inference.dimensionSignals}
            dataState={dataState}
            snapshotCount={data.snapshotCount}
          />
        </PanelCard>

        {/* Panel 3 — Pipeline Snapshot (full width) */}
        <PanelCard fullWidth>
          <PipelineSection
            candidates={data.allCandidates}
            employerWeights={data.employerWeights}
            dataState={dataState}
          />
        </PanelCard>

        {/* Panel 4 — Motivational Fit Watch */}
        <PanelCard>
          <MotivationalFitSection
            motivationalFitData={data.motivationalFitData}
            dataState={dataState}
            snapshotCount={data.snapshotCount}
          />
        </PanelCard>
      </div>

      {/* ── Print Stylesheet ── */}
      <style>{`
        @media print {
          .insight-grid {
            grid-template-columns: 1fr !important;
          }
          .insight-grid > * {
            grid-column: span 1 !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
        @media (max-width: 1023px) {
          .insight-grid {
            grid-template-columns: 1fr !important;
          }
          .insight-grid > * {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
