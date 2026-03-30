/**
 * 01 · Hiring Profile — Dark-themed radar chart with state toggle buttons
 * 
 * State 1: Weights only (blue), info callout
 * State 2: Weights + Hired Avg (blue + amber/orange)
 * State 3: Weights + Hired Avg + Top Performers (all three)
 * 
 * Dark background chart matching reference design.
 * Divergence callouts auto-generated when gap > 10pts.
 */

import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { EmployerWeights, HiredCandidate, calculateAverageTraitScores } from '../../../lib/insightQueries';
import { WeightingDivergence } from '../../../lib/inferenceEngine';
import { PanelIntroBlock, Callout, DataState, DIMENSION_LABELS } from './shared';

interface HiringProfileSectionProps {
  employerWeights: EmployerWeights;
  topPerformers: HiredCandidate[];
  hiredCandidates: HiredCandidate[];
  divergences: WeightingDivergence[];
  dataState: DataState;
  snapshotCount: number;
}

const STATE_BUTTONS: { state: DataState; label: string }[] = [
  { state: 1, label: 'State 1 (<5 snapshots)' },
  { state: 2, label: 'State 2 (5-14)' },
  { state: 3, label: 'State 3 (15+)' },
];

export function HiringProfileSection({
  employerWeights,
  topPerformers,
  hiredCandidates,
  divergences,
  dataState: initialDataState,
  snapshotCount,
}: HiringProfileSectionProps) {
  const [previewState, setPreviewState] = useState<DataState>(initialDataState);
  const dataState = previewState;

  const topPerformerAverages = calculateAverageTraitScores(topPerformers);
  const hiredAverages = calculateAverageTraitScores(hiredCandidates);

  const radarData = Object.entries(employerWeights).map(([dim, weight]) => ({
    dimension: DIMENSION_LABELS[dim] || dim,
    'Your weighting': weight,
    'Hired average': Math.round(hiredAverages[dim] || 0),
    'Top performer avg': Math.round(topPerformerAverages[dim] || 0),
  }));

  const significantDivergences = divergences.filter(d => Math.abs(d.divergence) > 10);

  const stateDescriptions: Record<DataState, string> = {
    1: 'Only your weighting is visible. Hire and review at least 5 candidates to unlock the hired average layer.',
    2: 'Two layers visible. The hired average (orange) shows who you\'re actually selecting — compare it against your stated weighting (blue) to spot drift.',
    3: 'Three layers visible. Compare where your top performers (green) diverge from your weighting (blue) — that divergence tells you which traits actually predict success in your environment vs what you thought mattered.',
  };

  return (
    <div>
      <PanelIntroBlock
        sectionNumber="01"
        sectionLabel="Hiring Profile"
        heading="Are you hiring for what you think you're hiring for?"
        body="Here's the first chart — Panel 1, the hiring profile radar chart showing the three layers that build up over time."
      />

      {/* State Toggle Buttons */}
      <div className="flex gap-2 mb-5">
        {STATE_BUTTONS.map(({ state, label }) => (
          <button
            key={state}
            onClick={() => setPreviewState(state)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: previewState === state ? '#fff' : '#9CA3AF',
              background: previewState === state ? '#374151' : 'transparent',
              border: previewState === state ? '1.5px solid #6B7280' : '1px solid #4B5563',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4" style={{ fontSize: '13px', color: '#9CA3AF' }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#7DBBFF' }} />
          <span>Your weighting</span>
        </div>
        {dataState >= 2 && (
          <div className="flex items-center gap-2">
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#F59E0B' }} />
            <span>Hired average</span>
          </div>
        )}
        {dataState >= 3 && (
          <div className="flex items-center gap-2">
            <div style={{ width: 12, height: 12, borderRadius: 2, background: '#10B981' }} />
            <span>Top performer avg</span>
          </div>
        )}
      </div>

      {/* Dark Radar Chart Card */}
      <div
        style={{
          background: '#1F2937',
          borderRadius: '14px',
          padding: '28px 20px 20px',
          marginBottom: '20px',
        }}
      >
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#374151" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#D1D5DB', fontSize: 12 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={6}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              axisLine={false}
              stroke="#374151"
            />

            {/* Layer 3: Top performers (green) — rendered first so it's behind */}
            {dataState >= 3 && (
              <Radar
                name="Top performer avg"
                dataKey="Top performer avg"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.12}
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
              />
            )}

            {/* Layer 2: Hired average (orange/amber) */}
            {dataState >= 2 && (
              <Radar
                name="Hired average"
                dataKey="Hired average"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.08}
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
              />
            )}

            {/* Layer 1: Your weighting (blue) — always visible, on top */}
            <Radar
              name="Your weighting"
              dataKey="Your weighting"
              stroke="#7DBBFF"
              fill="#7DBBFF"
              fillOpacity={0.15}
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#7DBBFF', strokeWidth: 0 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* State Description */}
      <p
        style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.6,
          marginBottom: '20px',
          fontStyle: 'italic',
        }}
      >
        {stateDescriptions[dataState]}
      </p>

      {/* Callouts */}
      {dataState === 1 && (
        <Callout variant="info">
          Once you have 5+ performance snapshots, we'll overlay the average profile of your hired candidates so you can see where your actual hires differ from your stated priorities.
        </Callout>
      )}

      {dataState >= 2 && significantDivergences.length > 0 && (
        <div>
          {significantDivergences
            .sort((a, b) => Math.abs(b.divergence) - Math.abs(a.divergence))
            .map((div, idx) => {
              let variant: 'warn' | 'info' | 'good' = 'info';
              const hiredAvg = hiredAverages[div.dimension] || 0;
              if (div.employerWeight > div.topPerformerAverage) variant = 'warn';
              else if (div.topPerformerAverage > div.employerWeight) variant = 'info';
              if (div.topPerformerAverage > hiredAvg + 10) variant = 'good';

              return (
                <Callout key={`div-${div.dimension}-${idx}`} variant={variant}>
                  <span style={{ fontWeight: 600 }}>{DIMENSION_LABELS[div.dimension]}</span>
                  {' — '}
                  {div.callout || `${Math.round(div.divergence)}pt gap between your weight and top performer average.`}
                </Callout>
              );
            })}
        </div>
      )}

      {dataState >= 2 && significantDivergences.length === 0 && (
        <Callout variant="good">
          Your trait priorities are well-aligned with your top performers — no significant divergences detected.
        </Callout>
      )}
    </div>
  );
}
