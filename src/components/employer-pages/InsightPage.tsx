/**
 * Insight Page — Employer insight layer
 *
 * Five tabs:
 *   Hiring Profile, Performance Correlations, Pipeline, Motivational Fit, Inference
 *
 * Data state system:
 *   State 1 (<5 snapshots)  — hiring profile + pipeline only; others gated
 *   State 2 (5-14)          — early-signal framing throughout
 *   State 3 (15+)           — full correlations + confidence display
 */

import { useState, useEffect } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { fetchEmployerInsightData } from '../../lib/employerInsightQueries';
import { fetchInsightData } from '../../lib/insightQueries';
import type { InsightData } from '../../lib/insightQueries';
import { runInferenceEngine } from '../../lib/inferenceEngine';
import type { InferenceResult } from '../../lib/inferenceEngine';
import { supabase } from '../../lib/supabaseClient';
import type { EmployerWeights } from '../../lib/matchScoring';
import { getDataState, SectionRule } from './insights/shared';
import type { DataState } from './insights/shared';
import { HiringProfileSection } from './insights/HiringProfileSection';
import { CorrelationsSection } from './insights/CorrelationsSection';
import { PipelineSection } from './insights/PipelineSection';
import { MotivationalFitSection } from './insights/MotivationalFitSection';
import { InferenceSection } from './insights/InferenceSection';

type TabId = 'hiring-profile' | 'correlations' | 'pipeline' | 'motivational-fit' | 'inference';

const TABS: { id: TabId; label: string }[] = [
  { id: 'hiring-profile', label: 'Hiring Profile' },
  { id: 'correlations', label: 'Performance Correlations' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'motivational-fit', label: 'Motivational Fit' },
  { id: 'inference', label: 'Inference' },
];

export function InsightPage({
  employerBusinessName,
  businessId,
  weights,
}: {
  employerBusinessName?: string;
  businessId?: string | null;
  weights?: EmployerWeights | null;
}) {
  const [data, setData] = useState<InsightData | null>(null);
  const [inference, setInference] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('hiring-profile');

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
        let insightData: InsightData;
        if (supabase && businessId && weights) {
          insightData = await fetchEmployerInsightData(supabase, businessId, weights);
        } else {
          insightData = await fetchInsightData(0);
        }
        const inferenceResult = runInferenceEngine(
          insightData.employerWeights,
          insightData.hiredCandidates,
          insightData.topPerformers,
          insightData.correlationData,
          insightData.timeSeriesData,
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
    void loadData();
  }, [businessId, weights]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#7DBBFF] border-t-transparent" />
          <p className="text-xs text-[#6B7280]">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !inference) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#EF4444]" strokeWidth={1.5} />
          <p className="text-xs text-[#6B7280]">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const dataState: DataState = getDataState(data.snapshotCount);
  const activeHires = data.hiredCandidates.filter((c) => !c.departed).length;
  const orgLabel = employerBusinessName?.trim() || 'Your organization';

  return (
    <div>
      <SectionRule mt={0} mb={20}>
        Insight modules
      </SectionRule>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#6B7280]">
          {data.snapshotCount} performance snapshots · {activeHires} active hires · {orgLabel}
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#fafafa]"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          Export
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'border border-[#7dbbff] bg-[#7dbbff]/10 text-[#111827]'
                  : 'border border-transparent text-[#9CA3AF] hover:bg-black/[0.03] hover:text-[#6B7280]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="insight-content-panel mt-3 rounded-md border border-black/[0.08] bg-white p-7">
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

      <style>{`
        @media print {
          .insight-content-panel {
            border-radius: 6px !important;
          }
        }
      `}</style>
    </div>
  );
}
