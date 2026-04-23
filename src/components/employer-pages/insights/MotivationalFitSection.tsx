/**
 * 04 · Motivational Fit Watch — Quarterly time series
 * 
 * State 1: Gated (requires first quarterly check-in)
 * State 2+: Hire cards with line charts showing role conditions vs intake baseline
 * 
 * Sub-dimensions: Mastery (#7DBBFF), Impact (#10B981), Recognition (#F59E0B), Autonomy (#A78BFA)
 * Active / Departed subtabs
 * Pattern alerts at State 3
 */

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MotivationalFitHire } from '../../../lib/insightQueries';
import { PanelIntroBlock, StateBanner, GateScreen, Callout } from './shared';
import type { DataState } from './shared';

interface MotivationalFitSectionProps {
  motivationalFitData: MotivationalFitHire[];
  dataState: DataState;
  snapshotCount: number;
}

const SUB_DIM_COLORS: Record<string, string> = {
  mastery: '#7DBBFF',
  impact: '#10B981',
  recognition: '#F59E0B',
  autonomy: '#A78BFA',
};

const ALIGNMENT_STYLES: Record<string, { bg: string; border: string; text: string; dotColor: string; avatarBg: string; avatarBorder: string; avatarText: string }> = {
  aligned: { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', dotColor: '#10B981', avatarBg: '#F0FDF4', avatarBorder: '#BBF7D0', avatarText: '#16A34A' },
  watch: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', dotColor: '#F59E0B', avatarBg: '#FFFBEB', avatarBorder: '#FDE68A', avatarText: '#D97706' },
  at_risk: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', dotColor: '#EF4444', avatarBg: '#FEF2F2', avatarBorder: '#FECACA', avatarText: '#DC2626' },
  departed: { bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280', dotColor: '#9CA3AF', avatarBg: '#F9FAFB', avatarBorder: '#E5E7EB', avatarText: '#6B7280' },
};

export function MotivationalFitSection({ motivationalFitData, dataState, snapshotCount }: MotivationalFitSectionProps) {
  const [activeSubtab, setActiveSubtab] = useState<'active' | 'departed'>('active');

  // Gate at State 1
  if (dataState === 1) {
    return (
      <div>
        <PanelIntroBlock
          sectionNumber="04"
          sectionLabel="Motivational Fit Watch"
          heading="Is the role structurally delivering what each hire needs?"
          body="This section tracks whether the role is providing what each hire said they need at intake — across mastery, impact, recognition, and autonomy. Quarterly manager ratings are compared against each candidate's intake motivation profile."
        />
        <GateScreen
          requiredSnapshots={5}
          currentSnapshots={snapshotCount}
          sectionName="Motivational Fit Watch"
          subtitle="This panel unlocks once a manager submits the first quarterly role-conditions rating for a hired candidate."
        />
      </div>
    );
  }

  const activeHires = motivationalFitData.filter(h => h.status === 'active');
  const departedHires = motivationalFitData.filter(h => h.status === 'departed');
  const currentHires = activeSubtab === 'active' ? activeHires : departedHires;

  const bannerMessages: Record<2 | 3, string> = {
    2: `Motivational fit data is being collected. ${activeHires.length} active hires with quarterly check-ins.`,
    3: `All quarterly data active — ${activeHires.length} active hires, ${departedHires.length} departed hires tracked.`,
  };

  // Check for pattern alerts (State 3 only)
  const patternAlert = dataState === 3 ? detectPatternAlert(motivationalFitData) : null;

  return (
    <div>
      <PanelIntroBlock
        sectionNumber="04"
        sectionLabel="Motivational Fit Watch"
        heading="Is the role structurally delivering what each hire needs?"
        body="This section tracks whether the role is providing what each hire said they need at intake — across mastery, impact, recognition, and autonomy. Quarterly manager ratings are compared against each candidate's intake motivation profile."
      />

      <StateBanner state={dataState} message={bannerMessages[dataState as 2 | 3]} />

      {/* How to read callout */}
      <Callout variant="info">
        <span style={{ fontWeight: 600 }}>How to read this chart:</span> Solid lines show quarterly role-conditions scores (what the role is providing). Dashed lines show intake baselines (what the person said they need). Green zone (gap &le;15) = aligned. Amber (16-30) = watch. Red (&gt;30) = warrants a direct conversation.
      </Callout>

      {/* Sub-dimension legend */}
      <div className="flex items-center gap-5 mt-4 mb-4" style={{ fontSize: '12px', color: '#6B7280' }}>
        {Object.entries(SUB_DIM_COLORS).map(([dim, color]) => (
          <div key={dim} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="capitalize">{dim}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div style={{ width: '16px', height: '2px', borderTop: '2px dashed #9CA3AF' }} />
          <span>Intake baseline</span>
        </div>
      </div>

      {/* Active / Departed subtabs */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setActiveSubtab('active')}
          style={{
            padding: '6px 14px',
            borderRadius: '99px',
            fontSize: '12px',
            fontWeight: activeSubtab === 'active' ? 600 : 500,
            color: activeSubtab === 'active' ? '#2563EB' : '#6B7280',
            background: activeSubtab === 'active' ? '#EFF6FF' : 'transparent',
            border: `1px solid ${activeSubtab === 'active' ? '#BFDBFE' : '#E5E7EB'}`,
            cursor: 'pointer',
          }}
        >
          Active hires
        </button>
        <button
          onClick={() => setActiveSubtab('departed')}
          style={{
            padding: '6px 14px',
            borderRadius: '99px',
            fontSize: '12px',
            fontWeight: activeSubtab === 'departed' ? 600 : 500,
            color: activeSubtab === 'departed' ? '#2563EB' : '#6B7280',
            background: activeSubtab === 'departed' ? '#EFF6FF' : 'transparent',
            border: `1px solid ${activeSubtab === 'departed' ? '#BFDBFE' : '#E5E7EB'}`,
            cursor: 'pointer',
          }}
        >
          Departed cohort
        </button>
      </div>

      {/* Pattern alert (State 3 only) */}
      {patternAlert && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderLeft: '3px solid #EF4444',
            borderRadius: '12px',
            padding: '16px 18px',
            marginBottom: '16px',
          }}
        >
          <div className="flex items-start gap-3">
            <span style={{ fontSize: '18px', flexShrink: 0 }}>🔴</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#991B1B', marginBottom: '4px' }}>
                {patternAlert.title}
              </p>
              <p style={{ fontSize: '12px', color: '#B91C1C', lineHeight: 1.55, marginBottom: '6px' }}>
                {patternAlert.body}
              </p>
              <p style={{ fontSize: '11px', color: '#DC2626', opacity: 0.8 }}>
                {patternAlert.confidence}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hire card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {currentHires.map(hire => (
          <HireCard key={hire.candidate_id} hire={hire} />
        ))}
      </div>

      {currentHires.length === 0 && (
        <div className="py-12 text-center">
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
            No {activeSubtab === 'active' ? 'active' : 'departed'} hires to display
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Hire Card ───

function HireCard({ hire }: { hire: MotivationalFitHire }) {
  const style = ALIGNMENT_STYLES[hire.alignment_status] || ALIGNMENT_STYLES.aligned;
  const isDeparted = hire.status === 'departed';
  const initials = hire.name.split(' ').map(n => n[0]).join('');

  // Prepare chart data
  const chartData = hire.quarterly_scores.map(q => ({
    quarter: q.quarter.replace(/\s\d{4}/, ''),
    mastery: q.mastery,
    impact: q.impact,
    recognition: q.recognition,
    autonomy: q.autonomy,
    mastery_baseline: hire.intake_baseline.mastery,
    impact_baseline: hire.intake_baseline.impact,
    recognition_baseline: hire.intake_baseline.recognition,
    autonomy_baseline: hire.intake_baseline.autonomy,
  }));

  const alignmentLabels: Record<string, string> = {
    aligned: 'Aligned',
    watch: 'Watch',
    at_risk: 'At Risk',
    departed: 'Departed',
  };

  return (
    <div
      style={{
        background: '#FAFAFA',
        border: `1px solid ${style.border}`,
        borderRadius: '12px',
        padding: '22px',
        opacity: isDeparted ? 0.85 : 1,
      }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: style.avatarBg,
              border: `1px solid ${style.avatarBorder}`,
              fontSize: '13px',
              fontWeight: 700,
              color: style.avatarText,
            }}
          >
            {initials}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{hire.name}</p>
            <p style={{ fontSize: '11px', color: '#6B7280' }}>
              {hire.role_type} · hired {hire.hired_quarter}
            </p>
          </div>
        </div>

        {/* Alignment badge */}
        <div
          className="flex items-center gap-1.5"
          style={{
            padding: '4px 10px',
            borderRadius: '99px',
            background: style.bg,
            border: `1px solid ${style.border}`,
            fontSize: '11px',
            fontWeight: 500,
            color: style.text,
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: style.dotColor }} />
          {alignmentLabels[hire.alignment_status]}
        </div>
      </div>

      {/* Overdue or source tag */}
      {hire.overdue_quarter ? (
        <div
          style={{
            display: 'inline-block',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#B45309',
            fontSize: '10px',
            fontWeight: 500,
            padding: '4px 9px',
            borderRadius: '5px',
            marginBottom: '12px',
          }}
        >
          ⏱ {hire.overdue_quarter} check-in overdue
        </div>
      ) : (
        <div
          style={{
            display: 'inline-block',
            background: '#F3F4F6',
            color: '#9CA3AF',
            fontSize: '10px',
            fontWeight: 400,
            padding: '4px 9px',
            borderRadius: '5px',
            marginBottom: '12px',
          }}
        >
          Quarterly role-conditions · manager-rated
        </div>
      )}

      {/* Time series chart */}
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="quarter"
            tick={{ fill: '#9CA3AF', fontSize: 10, fontFamily: '"DM Mono", monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '11px',
            }}
          />
          {/* Solid lines — quarterly scores */}
          <Line type="monotone" dataKey="mastery" stroke="#7DBBFF" strokeWidth={2} dot={{ r: 3, fill: '#7DBBFF' }} connectNulls={false} />
          <Line type="monotone" dataKey="impact" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} connectNulls={false} />
          <Line type="monotone" dataKey="recognition" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} connectNulls={false} />
          <Line type="monotone" dataKey="autonomy" stroke="#A78BFA" strokeWidth={2} dot={{ r: 3, fill: '#A78BFA' }} connectNulls={false} />
          {/* Dashed baseline lines */}
          <Line type="monotone" dataKey="mastery_baseline" stroke="#7DBBFF" strokeWidth={1} strokeDasharray="4 3" dot={false} opacity={0.5} />
          <Line type="monotone" dataKey="impact_baseline" stroke="#10B981" strokeWidth={1} strokeDasharray="4 3" dot={false} opacity={0.5} />
          <Line type="monotone" dataKey="recognition_baseline" stroke="#F59E0B" strokeWidth={1} strokeDasharray="4 3" dot={false} opacity={0.5} />
          <Line type="monotone" dataKey="autonomy_baseline" stroke="#A78BFA" strokeWidth={1} strokeDasharray="4 3" dot={false} opacity={0.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Pattern Alert Detection ───

function detectPatternAlert(data: MotivationalFitHire[]): { title: string; body: string; confidence: string } | null {
  // Check: 3+ hires in same role_type, same sub-dimension gap >= 25, gap at 2+ consecutive quarters
  const roleGroups: Record<string, MotivationalFitHire[]> = {};
  data.forEach(h => {
    if (!roleGroups[h.role_type]) roleGroups[h.role_type] = [];
    roleGroups[h.role_type].push(h);
  });

  for (const [role, hires] of Object.entries(roleGroups)) {
    if (hires.length < 3) continue;

    const subDims = ['mastery', 'impact', 'recognition', 'autonomy'] as const;
    for (const dim of subDims) {
      let gapCount = 0;
      for (const hire of hires) {
        const baseline = hire.intake_baseline[dim];
        const consecutiveGaps = hire.quarterly_scores.filter(q => {
          const score = q[dim];
          return score !== null && Math.abs(score - baseline) >= 25;
        });
        if (consecutiveGaps.length >= 2) gapCount++;
      }

      if (gapCount >= 3) {
        const activeCount = hires.filter(h => h.status === 'active').length;
        const departedCount = hires.filter(h => h.status === 'departed').length;
        return {
          title: `Role-level pattern detected: ${role} · ${dim}`,
          body: `Multiple hires in the ${role} role are experiencing a structural gap in ${dim}. The role may not be providing sufficient ${dim} opportunities relative to what candidates need.`,
          confidence: `Based on ${hires.length} hires (${activeCount} active, ${departedCount} departed) · pattern present across multiple quarters`,
        };
      }
    }
  }

  return null;
}
