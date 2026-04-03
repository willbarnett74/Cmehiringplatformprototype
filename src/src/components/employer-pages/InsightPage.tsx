/**
 * Insight Page — Employer insight layer
 *
 * Five tabs with browser-tab navigation:
 *   01 · Hiring Profile         — radar chart, three layers
 *   02 · Performance Correlations — grouped bar chart by performance band
 *   03 · Pipeline               — full-width candidate table
 *   04 · Motivational Fit Watch — quarterly time-series per hire
 *   05 · Inference              — plain-English findings with confidence
 *
 * Data state system:
 *   State 1 (<5 snapshots)  — hiring profile + pipeline only; others gated
 *   State 2 (5-14)          — early-signal framing throughout
 *   State 3 (15+)           — full correlations + confidence display
 *
 * Layout: active tab connects visually to the content panel via matching
 * white background and no bottom border — a browser-tab effect.
 */

import { useState, useEffect } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { fetchInsightData, InsightData } from '../../lib/insightQueries';
import { runInferenceEngine, InferenceResult } from '../../lib/inferenceEngine';
import { getDataState, DataState } from './insights/shared';
import { HiringProfileSection } from './insights/HiringProfileSection';
import { CorrelationsSection } from './insights/CorrelationsSection';
import { PipelineSection } from './insights/PipelineSection';
import { MotivationalFitSection } from './insights/MotivationalFitSection';
import { InferenceSection } from './insights/InferenceSection';

// ─── Tab Definitions ─────────────────────────────────────────────────────────

type TabId = 'hiring-profile' | 'correlations' | 'pipeline' | 'motivational-fit' | 'inference';

const TABS: { id: TabId; label: string }[] = [
  { id: 'hiring-profile',    label: 'Hiring Profile' },
  { id: 'correlations',      label: 'Performance Correlations' },
  { id: 'pipeline',          label: 'Pipeline' },
  { id: 'motivational-fit',  label: 'Motivational Fit' },
  { id: 'inference',         label: 'Inference' },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function InsightPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [inference, setInference] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('hiring-profile');

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

  return (
    <div>
      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between"
        style={{
          background: 'rgba(244,246,249,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E5E7EB',
          padding: '16px 32px',
          margin: '-16px -32px 0 -32px',
          marginBottom: '24px',
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
            Insights &amp; Analytics
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
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          Export
        </button>
      </div>

      {/* ── Section Tab Navigation ──────────────────────────────────────────── */}
      {/*
        Browser-tab effect:
        - Active tab: white bg, 1px #E5E7EB border top/left/right, bottom matches panel bg (white)
        - Tab row sits directly above the content panel with no gap so the active tab
          visually merges into the panel below it.
      */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          paddingBottom: '0',
        }}
      >
        {TABS.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#111827' : '#9CA3AF',
                background: isActive ? '#ffffff' : 'transparent',
                border: isActive ? '1px solid #E5E7EB' : '1px solid transparent',
                borderBottom: isActive ? '1px solid #ffffff' : '1px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                transition: 'color 0.12s ease',
                position: 'relative',
                zIndex: isActive ? 1 : 0,
                marginBottom: isActive ? '-1px' : '0',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#6B7280';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF';
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Content Panel ───────────────────────────────────────────────────── */}
      {/*
        border-radius 0 12px 12px 12px — flat top-left corner aligns with the first
        active tab. When another tab is active the panel corners are all 12px but
        the visual connection still works because of the border-bottom flush.
      */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: activeTab === 'hiring-profile' ? '0 12px 12px 12px' : '12px',
          padding: '28px',
          position: 'relative',
          zIndex: 0,
        }}
      >
        {activeTab === 'hiring-profile' && (
          <HiringProfileSection
            employerWeights={data.employerWeights}
            topPerformers={data.topPerformers}
            hiredCandidates={data.hiredCandidates}
            divergences={inference.weightingDivergences}
            dataState={dataState}
            snapshotCount={data.snapshotCount}
          />
        )}

        {activeTab === 'correlations' && (
          <CorrelationsSection
            correlationData={data.correlationData}
            dimensionSignals={inference.dimensionSignals}
            dataState={dataState}
            snapshotCount={data.snapshotCount}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineSection
            candidates={data.allCandidates}
            employerWeights={data.employerWeights}
            dataState={dataState}
          />
        )}

        {activeTab === 'motivational-fit' && (
          <MotivationalFitSection
            motivationalFitData={data.motivationalFitData}
            dataState={dataState}
            snapshotCount={data.snapshotCount}
          />
        )}

        {activeTab === 'inference' && (
          <InferenceSection
            inference={inference}
            hiredCandidates={data.hiredCandidates}
            dataState={dataState}
            snapshotCount={data.snapshotCount}
          />
        )}
      </div>

      {/* ── Print Stylesheet ─────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          .insight-content-panel {
            border-radius: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
