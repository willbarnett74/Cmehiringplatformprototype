/**
 * Insight Page — Top-level insights container
 * 
 * Five section tabs (browser-tab style):
 * 1. Hiring Profile — Radar chart: employer weights vs. hired avg vs. top performers
 * 2. Performance Correlations — Grouped bar chart by performance band
 * 3. Pipeline — Candidate table with match scores and trait health
 * 4. Motivational Fit — Quarterly time series: role conditions vs intake baseline
 * 5. Inference — Plain English findings with explicit confidence
 * 
 * Data State System: State 1 (<5), State 2 (5-14), State 3 (15+) snapshots
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

type InsightTab = 'hiring-profile' | 'correlations' | 'pipeline' | 'motivational-fit' | 'inference';

const TAB_LABELS: { id: InsightTab; label: string }[] = [
  { id: 'hiring-profile', label: 'Hiring Profile' },
  { id: 'correlations', label: 'Performance Correlations' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'motivational-fit', label: 'Motivational Fit' },
  { id: 'inference', label: 'Inference' },
];

export function InsightPage() {
  const [activeTab, setActiveTab] = useState<InsightTab>('hiring-profile');
  const [data, setData] = useState<InsightData | null>(null);
  const [inference, setInference] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Suppress recharts internal duplicate key warnings
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

  const dataState = getDataState(data.snapshotCount);
  const activeHires = data.hiredCandidates.filter(c => !c.departed).length;
  const businessName = 'Meridian Design Co.'; // MOCK

  return (
    <div>
      {/* Topbar */}
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

      {/* Browser-tab Navigation */}
      <div className="relative">
        {/* Tab row */}
        <div className="flex" style={{ gap: '4px' }}>
          {TAB_LABELS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#111827' : '#9CA3AF',
                  background: isActive ? '#fff' : 'transparent',
                  border: isActive ? '1px solid #E5E7EB' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid #fff' : '1px solid transparent',
                  borderRadius: isActive ? '8px 8px 0 0' : '8px 8px 0 0',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: isActive ? 2 : 1,
                  marginBottom: '-1px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#6B7280';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: activeTab === 'hiring-profile' ? '0 12px 12px 12px' : '12px 12px 12px 12px',
            padding: '28px',
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
      </div>
    </div>
  );
}