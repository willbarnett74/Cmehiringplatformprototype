/**
 * 05 · Inference — Plain English findings with explicit confidence
 * 
 * State 1: Gated (requires 15 snapshots)
 * State 2 (5-14): Early signal cards
 * State 3 (15+): Reliable pattern + retention risk + role-level cards
 * 
 * Four card types: Early Signal, Reliable Pattern, Retention Risk Signal, Role-level Pattern
 * Calibration nudge banner (conditional)
 * Inference footer (always visible when unlocked)
 * 
 * Language rules (non-negotiable):
 * ✓ Always state findings in plain English before showing data
 * ✓ Always state confidence explicitly: 'Based on X performance snapshots'
 * ✓ State 2: prefix with 'Early signal:' or 'Based on early data:'
 * ✓ State 3: use 'Based on your data:' — never 'research shows' or 'typically'
 * ⚠ Never say 'always', 'definitely', or 'predicts'. Use: 'associated with', 'tend to', 'in your data'
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import type { InferenceResult } from '../../../lib/inferenceEngine';
import type { HiredCandidate } from '../../../lib/insightQueries';
import { PanelIntroBlock, GateScreen, DIMENSION_LABELS } from './shared';
import type { DataState } from './shared';

interface InferenceSectionProps {
  inference: InferenceResult;
  hiredCandidates: HiredCandidate[];
  dataState: DataState;
  snapshotCount: number;
}

type FindingType = 'early_signal' | 'reliable_pattern' | 'retention_risk' | 'role_level';

const FINDING_CONFIG: Record<FindingType, { label: string; bg: string; border: string; labelColor: string; boldColor: string }> = {
  early_signal: { label: 'EARLY SIGNAL', bg: '#EFF6FF', border: '#BFDBFE', labelColor: '#2563EB', boldColor: '#1E40AF' },
  reliable_pattern: { label: 'RELIABLE PATTERN', bg: '#F0FDF4', border: '#BBF7D0', labelColor: '#16A34A', boldColor: '#166534' },
  retention_risk: { label: 'RETENTION RISK SIGNAL', bg: '#FEF2F2', border: '#FECACA', labelColor: '#DC2626', boldColor: '#991B1B' },
  role_level: { label: 'ROLE-LEVEL PATTERN', bg: '#FFFBEB', border: '#FDE68A', labelColor: '#D97706', boldColor: '#92400E' },
};

interface Finding {
  type: FindingType;
  body: React.ReactNode;
  confidence: string;
}

export function InferenceSection({ inference, hiredCandidates, dataState, snapshotCount }: InferenceSectionProps) {
  const [calibrationDismissed, setCalibrationDismissed] = useState(false);

  if (dataState === 1) {
    return (
      <div>
        <PanelIntroBlock
          sectionNumber="05"
          sectionLabel="Inference"
          heading="What patterns is CMe finding in your hiring data?"
          body="Platform-generated findings derived entirely from your own data. Cards unlock progressively as you collect more performance snapshots."
        />
        <GateScreen
          requiredSnapshots={15}
          currentSnapshots={snapshotCount}
          sectionName="Inference"
          subtitle={`You have ${snapshotCount}. Submit ${15 - snapshotCount} more to begin seeing patterns emerge in your hiring data.`}
        />
      </div>
    );
  }

  // Calibration nudge: top band > 40% of rated hires
  const ratedHires = hiredCandidates.filter(c => c.performance_rating !== undefined);
  const topBand = ratedHires.filter(c => (c.performance_rating || 0) === 5);
  const topBandPercent = ratedHires.length > 0 ? Math.round((topBand.length / ratedHires.length) * 100) : 0;
  const showCalibrationNudge = topBandPercent > 40 && !calibrationDismissed;

  const findings = generateFindings(inference, hiredCandidates, dataState, snapshotCount);

  return (
    <div>
      <PanelIntroBlock
        sectionNumber="05"
        sectionLabel="Inference"
        heading="What patterns is CMe finding in your hiring data?"
        body="Platform-generated findings derived entirely from your own data. Cards unlock progressively as you collect more performance snapshots."
      />

      {/* Calibration nudge banner */}
      {showCalibrationNudge && (
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderLeft: '3px solid #7DBBFF',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '16px',
            position: 'relative',
          }}
        >
          <button
            onClick={() => setCalibrationDismissed(true)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#93C5FD',
            }}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1E40AF', marginBottom: '4px' }}>
            Calibration check
          </p>
          <p style={{ fontSize: '12px', color: '#3B82F6', lineHeight: 1.55, marginBottom: '6px' }}>
            Your top band currently includes {topBand.length} of {ratedHires.length} hires ({topBandPercent}%). For CMe's patterns to be most reliable, top performers should represent the genuinely exceptional 15-25% — the people who, if you lost them, would be the hardest to replace. If this looks higher than that, it may be worth revisiting your ratings before acting on these findings.
          </p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ fontSize: '12px', color: '#1D4ED8', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Review performance ratings →
          </a>
        </div>
      )}

      {/* Finding cards */}
      {findings.map((finding, idx) => (
        <FindingCard key={`finding-${idx}`} finding={finding} />
      ))}

      {findings.length === 0 && (
        <div className="py-8 text-center">
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
            No inference findings available yet. Continue collecting performance data to see patterns emerge.
          </p>
        </div>
      )}

      {/* Inference footer */}
      <div
        style={{
          background: '#F9FAFB',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '6px',
          padding: '14px 18px',
          marginTop: '20px',
        }}
      >
        <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.65 }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>How inference works: </span>
          {dataState === 2
            ? 'Findings only appear when your data supports them. At this stage, all findings are directional — treat as hypotheses to test.'
            : 'At this stage, findings reflect patterns repeated across multiple cohorts and are reliable enough to act on.'
          }
        </p>
      </div>
    </div>
  );
}

// ─── Finding Card ───

function FindingCard({ finding }: { finding: Finding }) {
  const config = FINDING_CONFIG[finding.type];

  return (
    <div
      style={{
        border: `1px solid ${config.border}`,
        borderRadius: '12px',
        padding: '18px 20px',
        background: config.bg,
        marginBottom: '12px',
      }}
    >
      <p
        style={{
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: config.labelColor,
          marginBottom: '6px',
        }}
      >
        {config.label}
      </p>
      <div
        style={{
          fontSize: '13px',
          color: '#111827',
          lineHeight: 1.65,
          marginBottom: '10px',
        }}
      >
        {finding.body}
      </div>
      <div
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: '10px',
        }}
      >
        <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
          {finding.confidence}
        </p>
      </div>
    </div>
  );
}

// ─── Finding Generation ───

function generateFindings(
  inference: InferenceResult,
  hiredCandidates: HiredCandidate[],
  dataState: DataState,
  snapshotCount: number
): Finding[] {
  const findings: Finding[] = [];
  const { dimensionSignals, weightingDivergences } = inference;

  if (dataState === 2) {
    const strongSignals = dimensionSignals.filter(s => s.strength === 'strong' || s.strength === 'moderate');

    if (strongSignals.length > 0) {
      const top = strongSignals[0];
      findings.push({
        type: 'early_signal',
        body: (
          <span>
            Based on early data: <span style={{ fontWeight: 600, color: FINDING_CONFIG.early_signal.boldColor }}>{formatDimName(top.dimension)}</span> tends to be associated with higher performance in your hires. Top performers scored notably higher at intake on this dimension.
          </span>
        ),
        confidence: `Based on ${snapshotCount} performance snapshots`,
      });
    }

    const significantDivergences = weightingDivergences.filter(d => d.divergence > 15);
    if (significantDivergences.length > 0) {
      findings.push({
        type: 'early_signal',
        body: (
          <span>
            Early signal: Your stated priorities and actual hiring outcomes show a gap in{' '}
            <span style={{ fontWeight: 600, color: FINDING_CONFIG.early_signal.boldColor }}>
              {formatDimName(significantDivergences[0].dimension)}
            </span>
            . You weight it at {Math.round(significantDivergences[0].employerWeight)}, but your top performers average {Math.round(significantDivergences[0].topPerformerAverage)} in this area.
          </span>
        ),
        confidence: `Based on ${snapshotCount} performance snapshots`,
      });
    }
  }

  if (dataState === 3) {
    const strongSignals = dimensionSignals
      .filter(s => s.strength === 'strong')
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    if (strongSignals.length > 0) {
      findings.push({
        type: 'reliable_pattern',
        body: (
          <span>
            Based on your data: <span style={{ fontWeight: 600, color: FINDING_CONFIG.reliable_pattern.boldColor }}>{formatDimName(strongSignals[0].dimension)}</span> is the strongest predictor of top performance. Candidates who score high at intake on this dimension tend to reach the top performance band at a significantly higher rate.
          </span>
        ),
        confidence: `Based on ${snapshotCount} performance snapshots`,
      });
    }

    if (strongSignals.length > 1) {
      findings.push({
        type: 'reliable_pattern',
        body: (
          <span>
            Based on your data: <span style={{ fontWeight: 600, color: FINDING_CONFIG.reliable_pattern.boldColor }}>{formatDimName(strongSignals[1].dimension)}</span> is the second strongest predictor. In your data, this dimension is associated with sustained performance and lower departure rates.
          </span>
        ),
        confidence: `Based on ${snapshotCount} performance snapshots`,
      });
    }

    // Retention risk
    const departedCount = hiredCandidates.filter(c => c.departed).length;
    const churnRate = departedCount / Math.max(hiredCandidates.length, 1);
    if (churnRate > 0.1 && departedCount > 0) {
      findings.push({
        type: 'retention_risk',
        body: (
          <span>
            Based on your data: Hires with lower <span style={{ fontWeight: 600, color: FINDING_CONFIG.retention_risk.boldColor }}>match scores</span> tend to depart earlier. {departedCount} of {hiredCandidates.length} hires have departed ({Math.round(churnRate * 100)}%). Departed hires had a lower average match score than retained hires.
          </span>
        ),
        confidence: `Based on ${snapshotCount} performance snapshots · departure rate ${Math.round(churnRate * 100)}% · ${hiredCandidates.length} total hires`,
      });
    }

    // Role-level pattern
    const roleGroups: Record<string, HiredCandidate[]> = {};
    hiredCandidates.forEach(c => {
      if (!roleGroups[c.role]) roleGroups[c.role] = [];
      roleGroups[c.role].push(c);
    });

    for (const [role, candidates] of Object.entries(roleGroups)) {
      if (candidates.length >= 3) {
        const avgScore = candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length;
        if (avgScore < 85) {
          findings.push({
            type: 'role_level',
            body: (
              <span>
                Based on your data: <span style={{ fontWeight: 600, color: FINDING_CONFIG.role_level.boldColor }}>{role}</span> hires ({candidates.length} total) have a lower average match score ({Math.round(avgScore)}%) than other roles. Consider reviewing the role template or screening criteria for this position.
              </span>
            ),
            confidence: `Based on ${candidates.length} hires in this role · ${snapshotCount} total performance snapshots`,
          });
          break;
        }
      }
    }
  }

  return findings;
}

/**
 * Formats a dimension key into its human-readable label.
 * Uses the correct 6-dimension framework names directly.
 */
function formatDimName(dim: string): string {
  return DIMENSION_LABELS[dim] || dim;
}
