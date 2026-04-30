/**
 * 01 · Hiring Profile — Radar chart with state toggle buttons
 *
 * State 1: Weights only (blue), info callout
 * State 2: Weights + Hired Avg (blue + amber/orange)
 * State 3: Weights + Hired Avg + Top Performers (all three)
 */

import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { calculateAverageTraitScores } from '../../../lib/insightQueries';
import type { EmployerWeights, HiredCandidate } from '../../../lib/insightQueries';
import type { WeightingDivergence } from '../../../lib/inferenceEngine';
import { PanelIntroBlock, Callout, DIMENSION_LABELS } from './shared';
import type { DataState } from './shared';

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
  snapshotCount: _snapshotCount,
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

  const significantDivergences = divergences.filter((d) => Math.abs(d.divergence) > 10);

  const stateDescriptions: Record<DataState, string> = {
    1: "Only your weighting is visible. Hire and review at least 5 candidates to unlock the hired average layer.",
    2: "Two layers visible. The hired average (orange) shows who you're actually selecting — compare it against your stated weighting (blue) to spot drift.",
    3: "Three layers visible. Compare where your top performers (green) diverge from your weighting (blue) — that divergence tells you which traits actually predict success in your environment vs what you thought mattered.",
  };

  return (
    <div>
      <PanelIntroBlock
        sectionNumber="01"
        sectionLabel="Hiring Profile"
        heading="Are you hiring for what you think you're hiring for?"
        body="Here's the first chart — Panel 1, the hiring profile radar chart showing the three layers that build up over time."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {STATE_BUTTONS.map(({ state, label }) => {
          const on = previewState === state;
          return (
            <button
              key={state}
              type="button"
              onClick={() => setPreviewState(state)}
              className={`rounded-md px-4 py-2 text-[13px] font-semibold transition-colors ${
                on
                  ? 'border border-[#7dbbff] bg-[#7dbbff]/10 text-[#111827]'
                  : 'border border-black/[0.08] bg-white text-[#9CA3AF] hover:border-black/[0.12] hover:text-[#6B7280]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-5 text-[13px] text-[#9CA3AF]">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-[#7DBBFF]" />
          <span>Your weighting</span>
        </div>
        {dataState >= 2 && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-[#F59E0B]" />
            <span>Hired average</span>
          </div>
        )}
        {dataState >= 3 && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-[#10B981]" />
            <span>Top performer avg</span>
          </div>
        )}
      </div>

      <div className="mb-5 rounded-md border border-black/[0.08] bg-white px-5 pb-5 pt-7">
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#374151', fontSize: 12 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={6}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={false}
              stroke="rgba(0,0,0,0.08)"
            />

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
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '8px',
                color: '#111827',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p className="mb-5 text-sm italic leading-relaxed text-[#6B7280]">{stateDescriptions[dataState]}</p>

      {dataState === 1 && (
        <Callout variant="info">
          Once you have 5+ performance snapshots, we'll overlay the average profile of your hired candidates so you
          can see where your actual hires differ from your stated priorities.
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
                  <span className="font-semibold">{DIMENSION_LABELS[div.dimension]}</span>
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
