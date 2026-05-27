/**
 * 03 · Pipeline — Candidate table with match score and trait health
 * 
 * Always visible at all states — no gate.
 * Full-width table sorted by match score with:
 * - Circle avatar with gradient + initials
 * - Match score (DM Mono) with progress bar
 * - Trait health dots for dimensions where employer weight >= 8
 * - Stage badges (Interviewing, Contacted, Discovered)
 * - View profile action button
 * - Sort and filter controls
 * 
 * Uses the correct 6-dimension framework directly.
 */

import { useState } from 'react';
import type { CandidateProfile } from '../../types/employer';
import type { EmployerWeights, TraitScores } from '../../../lib/insightQueries';
import { PanelIntroBlock, DIMENSION_LABELS } from './shared';
import type { DataState } from './shared';

interface PipelineSectionProps {
  candidates: CandidateProfile[];
  employerWeights: EmployerWeights;
  dataState: DataState;
}

// Mock pipeline candidates using the correct 6-dimension trait keys
const mockPipelineCandidates: {
  id: number;
  name: string;
  initials: string;
  role_type: string;
  match_score: number;
  stage: 'Interviewing' | 'Contacted' | 'Discovered';
  traitScores: TraitScores;
}[] = [
  {
    id: 1,
    name: 'Jordan Chen',
    initials: 'JC',
    role_type: 'Senior Product Designer',
    match_score: 94,
    stage: 'Interviewing',
    traitScores: {
      learning_velocity: 92,
      ownership_follow_through: 94,
      resilience: 85,
      communication_confidence: 88,
      relational_intelligence: 87,
      motivational_fit: 90,
    },
  },
  {
    id: 2,
    name: 'Riley Martinez',
    initials: 'RM',
    role_type: 'Lead UX Designer',
    match_score: 91,
    stage: 'Interviewing',
    traitScores: {
      learning_velocity: 86,
      ownership_follow_through: 83,
      resilience: 80,
      communication_confidence: 92,
      relational_intelligence: 91,
      motivational_fit: 85,
    },
  },
  {
    id: 3,
    name: 'Casey Wong',
    initials: 'CW',
    role_type: 'Lead Product Designer',
    match_score: 96,
    stage: 'Contacted',
    traitScores: {
      learning_velocity: 90,
      ownership_follow_through: 96,
      resilience: 88,
      communication_confidence: 93,
      relational_intelligence: 92,
      motivational_fit: 94,
    },
  },
  {
    id: 4,
    name: 'Taylor Kim',
    initials: 'TK',
    role_type: 'Product Designer',
    match_score: 88,
    stage: 'Discovered',
    traitScores: {
      learning_velocity: 89,
      ownership_follow_through: 90,
      resilience: 82,
      communication_confidence: 80,
      relational_intelligence: 84,
      motivational_fit: 88,
    },
  },
  {
    id: 5,
    name: 'Morgan Lee',
    initials: 'ML',
    role_type: 'Senior Designer',
    match_score: 92,
    stage: 'Interviewing',
    traitScores: {
      learning_velocity: 91,
      ownership_follow_through: 88,
      resilience: 78,
      communication_confidence: 85,
      relational_intelligence: 80,
      motivational_fit: 92,
    },
  },
  {
    id: 6,
    name: 'Sam Patel',
    initials: 'SP',
    role_type: 'Product Designer',
    match_score: 85,
    stage: 'Contacted',
    traitScores: {
      learning_velocity: 87,
      ownership_follow_through: 85,
      resilience: 79,
      communication_confidence: 81,
      relational_intelligence: 82,
      motivational_fit: 83,
    },
  },
];

type SortField = 'match_score' | 'date_added' | 'stage';
type StageFilter = 'all' | 'Interviewing' | 'Contacted' | 'Discovered';

export function PipelineSection({ candidates: _candidates, employerWeights, dataState: _dataState }: PipelineSectionProps) {
  const [sortField, setSortField] = useState<SortField>('match_score');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');

  // Get dimensions where employer weight >= 8 (high priority)
  const highWeightDimensions = Object.entries(employerWeights)
    .filter(([_, weight]) => weight >= 8)
    .sort((a, b) => b[1] - a[1])
    .map(([dim]) => dim as keyof TraitScores)
    .filter(Boolean);

  // Map live candidates when available; fall back to demo rows
  const pipelineRows =
    _candidates.length > 0
      ? _candidates.map((c) => ({
          id: c.id,
          name: c.name,
          initials: c.name
            .split(/\s+/)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          role_type: c.role,
          match_score: c.score,
          stage:
            c.stage === 'interviewing' || c.stage === 'decision'
              ? ('Interviewing' as const)
              : c.stage === 'contacted'
                ? ('Contacted' as const)
                : ('Discovered' as const),
          traitScores: c.dimensionScores ?? {
            learning_velocity: 0,
            ownership_follow_through: 0,
            resilience: 0,
            communication_confidence: 0,
            relational_intelligence: 0,
            motivational_fit: 0,
          },
        }))
      : mockPipelineCandidates;

  // Filter and sort
  let filteredCandidates = [...pipelineRows];
  if (stageFilter !== 'all') {
    filteredCandidates = filteredCandidates.filter(c => c.stage === stageFilter);
  }

  filteredCandidates.sort((a, b) => {
    if (sortField === 'match_score') return b.match_score - a.match_score;
    if (sortField === 'stage') return a.stage.localeCompare(b.stage);
    return b.match_score - a.match_score;
  });

  const getTraitHealth = (score: number): { level: string; color: string; dotColor: string } => {
    if (score >= 75) return { level: 'High', color: '#16A34A', dotColor: '#10B981' };
    if (score >= 50) return { level: 'Medium', color: '#D97706', dotColor: '#F59E0B' };
    return { level: 'Low', color: '#DC2626', dotColor: '#EF4444' };
  };

  const stageBadgeConfig: Record<string, { bg: string; text: string }> = {
    Interviewing: { bg: '#DCFCE7', text: '#166534' },
    Contacted: { bg: '#DBEAFE', text: '#1E40AF' },
    Discovered: { bg: '#F3F4F6', text: '#374151' },
  };

  return (
    <div>
      <PanelIntroBlock
        sectionNumber="03"
        sectionLabel="Pipeline"
        heading="How does each active candidate stack up against your priorities?"
        body="Active candidates ranked by match score. Trait health shows how each candidate performs on the dimensions you weight most heavily."
      />

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: '12px', color: '#6B7280' }}>
          Showing <span style={{ fontWeight: 700, color: '#111827' }}>{filteredCandidates.length}</span> active candidates · ranked by match score
        </p>
        <div className="flex items-center gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            style={{
              padding: '6px 11px',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#374151',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="match_score">Sort: Match score</option>
            <option value="date_added">Sort: Date added</option>
            <option value="stage">Sort: Stage</option>
          </select>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as StageFilter)}
            style={{
              padding: '6px 11px',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#374151',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="all">All stages</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Contacted">Contacted</option>
            <option value="Discovered">Discovered</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              {['CANDIDATE', 'MATCH SCORE', 'TRAIT HEALTH', 'STAGE', ''].map(header => (
                <th
                  key={header || 'action'}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((candidate) => {
              const traitDims = highWeightDimensions.slice(0, 4);

              return (
                <tr
                  key={candidate.id}
                  style={{ borderBottom: '1px solid #F3F4F6' }}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  {/* Candidate */}
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #DBEAFE, #D1FAE5)',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#374151',
                        }}
                      >
                        {candidate.initials}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {candidate.name}
                        </p>
                        <p style={{ fontSize: '11px', fontWeight: 400, color: '#6B7280' }}>
                          {candidate.role_type}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Match Score */}
                  <td style={{ padding: '14px 16px' }}>
                    <div>
                      <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '24px', fontWeight: 700, color: '#2563EB' }}>
                        {candidate.match_score}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#93C5FD' }}>%</span>
                    </div>
                    <div
                      style={{
                        width: '64px',
                        height: '3px',
                        background: 'rgba(0,0,0,0.08)',
                        borderRadius: '99px',
                        marginTop: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${candidate.match_score}%`,
                          height: '100%',
                          background: 'linear-gradient(to right, #93C5FD, #2563EB)',
                          borderRadius: '99px',
                        }}
                      />
                    </div>
                  </td>

                  {/* Trait Health */}
                  <td style={{ padding: '14px 16px' }}>
                    <div className="space-y-1">
                      {traitDims.map(dim => {
                        const score = candidate.traitScores[dim] || 0;
                        const health = getTraitHealth(score);
                        return (
                          <div key={dim} className="flex items-center gap-2">
                            <span style={{ fontSize: '12px', color: '#6B7280', width: '120px', display: 'inline-block' }}>
                              {DIMENSION_LABELS[dim] || dim}
                            </span>
                            <div
                              style={{
                                width: '9px',
                                height: '9px',
                                borderRadius: '50%',
                                background: health.dotColor,
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: '11px', color: health.color, fontWeight: 500 }}>
                              {health.level}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* Stage */}
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '5px 11px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: stageBadgeConfig[candidate.stage]?.bg || '#F3F4F6',
                        color: stageBadgeConfig[candidate.stage]?.text || '#374151',
                      }}
                    >
                      {candidate.stage}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#1a6bb5',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '6px',
                        padding: '5px 11px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      View profile →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredCandidates.length === 0 && (
          <div className="p-12 text-center">
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No candidates match the current filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
