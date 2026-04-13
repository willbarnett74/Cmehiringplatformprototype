/**
 * 02 · Performance Correlations — Grouped bar chart by performance band
 * 
 * State 1: Gated (requires 5 snapshots)
 * State 2: Chart visible with early-data callouts
 * State 3: Full chart with strongest/weakest predictor callouts
 * 
 * Bars: Top (#10B981), Mid (#7DBBFF), Low (#E5E7EB)
 * X-axis uses abbreviations: LV, OW, RE, CC, RI, MF
 * 
 * Uses the correct 6-dimension framework directly — no mapping needed.
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CorrelationData } from '../../../lib/insightQueries';
import type { DimensionSignal } from '../../../lib/inferenceEngine';
import { PanelIntroBlock, StateBanner, GateScreen, Callout, DIMENSION_ABBREVS, ABBREV_KEY } from './shared';
import type { DataState } from './shared';

interface CorrelationsSectionProps {
  correlationData: CorrelationData[];
  dimensionSignals: DimensionSignal[];
  dataState: DataState;
  snapshotCount: number;
}

export function CorrelationsSection({
  correlationData,
  dimensionSignals: _dimensionSignals,
  dataState,
  snapshotCount,
}: CorrelationsSectionProps) {
  // Gate at State 1
  if (dataState === 1) {
    return (
      <div>
        <PanelIntroBlock
          sectionNumber="02"
          sectionLabel="Performance Correlations"
          heading="Which traits at intake actually predict top performance?"
          body="This section shows which trait scores at intake correlated with top, mid, or low performance at 90-day review. It helps you understand which dimensions matter most for your specific hiring context."
        />
        <GateScreen
          requiredSnapshots={5}
          currentSnapshots={snapshotCount}
          sectionName="Performance Correlations"
        />
      </div>
    );
  }

  // Prepare bar chart data — dimensions are already correct 6-dimension keys
  const barChartData = correlationData.map(d => {
    const topAvg = d.topPerformers.length > 0
      ? d.topPerformers.reduce((sum, s) => sum + s, 0) / d.topPerformers.length
      : 0;
    const midAvg = d.midPerformers.length > 0
      ? d.midPerformers.reduce((sum, s) => sum + s, 0) / d.midPerformers.length
      : 0;
    const lowAvg = d.lowPerformers.length > 0
      ? d.lowPerformers.reduce((sum, s) => sum + s, 0) / d.lowPerformers.length
      : 0;

    const abbrev = DIMENSION_ABBREVS[d.dimension] || d.dimension;

    return {
      dimension: abbrev,
      Top: Math.round(topAvg),
      Mid: Math.round(midAvg),
      Low: Math.round(lowAvg),
      spread: Math.round(topAvg - lowAvg),
    };
  });

  const sortedBySpread = [...barChartData].sort((a, b) => b.spread - a.spread);

  const bannerMessages: Record<2 | 3, string> = {
    2: `Early data — ${snapshotCount} performance snapshots collected. Treat correlations as directional until you reach 15+.`,
    3: `Based on ${snapshotCount} performance snapshots. Correlations are reliable enough to inform hiring decisions.`,
  };

  return (
    <div>
      <PanelIntroBlock
        sectionNumber="02"
        sectionLabel="Performance Correlations"
        heading="Which traits at intake actually predict top performance?"
        body="This section shows which trait scores at intake correlated with top, mid, or low performance at 90-day review. It helps you understand which dimensions matter most for your specific hiring context."
      />

      <StateBanner state={dataState} message={bannerMessages[dataState as 2 | 3]} />

      {/* Confidence line */}
      <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '12px' }}>
        {dataState === 2 ? 'Early data — ' : ''}Based on {snapshotCount} performance snapshots
      </p>

      {/* Grouped Bar Chart */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '16px',
        }}
      >
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={barChartData} barGap={2} barSize={14}>
            <CartesianGrid
              strokeDasharray="0"
              stroke="#F3F4F6"
              vertical={false}
            />
            <XAxis
              dataKey="dimension"
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: '"DM Mono", monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="Top" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Mid" fill="#7DBBFF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Low" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-3" style={{ fontSize: '12px', color: '#6B7280' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
          <span>Top</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#7DBBFF' }} />
          <span>Mid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#E5E7EB', border: '1px solid #D1D5DB' }} />
          <span>Low</span>
        </div>
      </div>

      {/* Abbreviation key */}
      <p style={{ fontSize: '10px', fontFamily: '"DM Mono", monospace', color: '#9CA3AF', marginBottom: '16px' }}>
        {Object.entries(ABBREV_KEY).map(([abbrev, full], i) => (
          <span key={abbrev}>
            {abbrev} = {full}{i < Object.keys(ABBREV_KEY).length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>

      {/* Auto-generated callouts */}
      {dataState === 2 && (
        <>
          <Callout variant="info">
            Early data — treat correlations as directional. These patterns may shift as more performance snapshots are collected.
          </Callout>
          {sortedBySpread[0] && sortedBySpread[0].spread > 5 && (
            <Callout variant="good">
              <span style={{ fontWeight: 600 }}>Strongest early signal: {ABBREV_KEY[sortedBySpread[0].dimension] || sortedBySpread[0].dimension}</span>
              {' — '}top performers scored {sortedBySpread[0].spread}pts higher than low performers at intake.
            </Callout>
          )}
        </>
      )}

      {dataState === 3 && (
        <>
          {sortedBySpread[0] && (
            <Callout variant="good">
              <span style={{ fontWeight: 600 }}>Strongest predictor: {ABBREV_KEY[sortedBySpread[0].dimension] || sortedBySpread[0].dimension}</span>
              {' — '}top performers scored {sortedBySpread[0].spread}pts higher than low performers at intake. In your data, this dimension is most associated with top performance.
            </Callout>
          )}
          {sortedBySpread[1] && (
            <Callout variant="good">
              <span style={{ fontWeight: 600 }}>Second strongest: {ABBREV_KEY[sortedBySpread[1].dimension] || sortedBySpread[1].dimension}</span>
              {' — '}{sortedBySpread[1].spread}pt spread between top and low performers.
            </Callout>
          )}
          {sortedBySpread.length > 0 && sortedBySpread[sortedBySpread.length - 1].spread < 15 && (
            <Callout variant="warn">
              <span style={{ fontWeight: 600 }}>Weakest predictor: {ABBREV_KEY[sortedBySpread[sortedBySpread.length - 1].dimension] || sortedBySpread[sortedBySpread.length - 1].dimension}</span>
              {' — '}only {sortedBySpread[sortedBySpread.length - 1].spread}pt spread. This dimension shows little differentiation between performance bands in your data.
            </Callout>
          )}
        </>
      )}
    </div>
  );
}
