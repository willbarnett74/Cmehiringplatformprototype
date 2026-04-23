// ============================================================
// CMe Platform — Spec 5: CandidateCard Component
// Displays match score, dimension flags, stage badge, and CTA.
// Used in pipeline and search views across the employer portal.
// ============================================================

import { FileText, Send, ArrowRight } from 'lucide-react';
import type { Candidate } from '../types/employer';
import {
  computeMotivationalFit,
  computeMatchScoreSimple,
  getDimensionFlags,
  type DimensionFlag,
} from '../../lib/matchScoring';

// ─── Types ──────────────────────────────────────────────────

interface EmployerWeightsShape {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

export interface CandidateCardProps {
  candidate: Candidate;
  /** Employer's active trait weightings — required for match score display */
  employerWeights?: EmployerWeightsShape;
  onCandidateClick: (candidate: Candidate) => void;
  /** Optional handler for CTA actions (view, interview, assess) */
  onAction?: (candidate: Candidate, action: 'view' | 'interview' | 'assess') => void;
}

// ─── Helpers ────────────────────────────────────────────────

function daysInStage(stageUpdatedAt: string | undefined): number | null {
  if (!stageUpdatedAt) return null;
  const ms = Date.now() - new Date(stageUpdatedAt).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function stageBadgeStyles(stage: Candidate['stage']): string {
  switch (stage) {
    case 'discovered':   return 'bg-[#7DBBFF]/10 text-[#7DBBFF]';
    case 'contacted':    return 'bg-[#8B5CF6]/10 text-[#8B5CF6]';
    case 'interviewing': return 'bg-[#F59E0B]/10 text-[#F59E0B]';
    case 'decision':     return 'bg-[#6366F1]/10 text-[#6366F1]';
    case 'hired':        return 'bg-[#10B981]/10 text-[#10B981]';
    case 'rejected':     return 'bg-[#EF4444]/10 text-[#EF4444]';
    default:             return 'bg-[#F3F4F6] text-[#6B7280]';
  }
}

function stageLabel(stage: Candidate['stage']): string {
  switch (stage) {
    case 'discovered':   return 'New Signal';
    case 'contacted':    return 'Contacted';
    case 'interviewing': return 'Interviewing';
    case 'decision':     return 'Decision';
    case 'hired':        return 'Hired';
    case 'rejected':     return 'Not Hired';
    default:             return stage;
  }
}

// ─── Sub-components ─────────────────────────────────────────

function DimensionPill({ flag, variant }: { flag: DimensionFlag; variant: 'strongest' | 'weakest' }) {
  const styles =
    variant === 'strongest'
      ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
      : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles}`}>
      {flag.label}
    </span>
  );
}

function CTAButton({
  stage,
  candidate,
  onCandidateClick,
  onAction,
}: {
  stage: Candidate['stage'];
  candidate: Candidate;
  onCandidateClick: (c: Candidate) => void;
  onAction?: (c: Candidate, action: 'view' | 'interview' | 'assess') => void;
}) {
  if (stage === 'discovered') {
    return (
      <button
        onClick={() => onAction ? onAction(candidate, 'assess') : onCandidateClick(candidate)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors text-xs font-medium"
        style={{ borderRadius: '10px' }}
      >
        <Send className="w-3.5 h-3.5" strokeWidth={2} />
        Send Assessment
      </button>
    );
  }

  if (stage === 'contacted') {
    return (
      <button
        onClick={() => onAction ? onAction(candidate, 'interview') : onCandidateClick(candidate)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#8B5CF6] text-white hover:bg-[#7c3aed] transition-colors text-xs font-medium"
        style={{ borderRadius: '10px' }}
      >
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        Move to Interview
      </button>
    );
  }

  return (
    <button
      onClick={() => onCandidateClick(candidate)}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] transition-colors text-xs font-medium"
      style={{ borderRadius: '10px' }}
    >
      <FileText className="w-3.5 h-3.5" strokeWidth={2} />
      View Profile
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function CandidateCard({ candidate, employerWeights, onCandidateClick, onAction }: CandidateCardProps) {
  // Build a flat dimension scores object, computing motivational_fit from sub-dims if needed
  const dims = candidate.dimensionScores;

  let matchScore: number | null = null;
  let flags: { strongest: DimensionFlag[]; weakest: DimensionFlag } | null = null;

  if (dims && employerWeights) {
    // If sub-dimensions are present, recompute motivational_fit from them for accuracy
    const mf = computeMotivationalFit({
      motivational_fit_mastery: dims.motivational_fit_mastery,
      motivational_fit_impact: dims.motivational_fit_impact,
      motivational_fit_recognition: dims.motivational_fit_recognition,
      motivational_fit_autonomy: dims.motivational_fit_autonomy,
    });

    const scores = { ...dims, motivational_fit: mf };
    matchScore = computeMatchScoreSimple(scores, employerWeights);
    flags = getDimensionFlags(scores, employerWeights);
  }

  const days = daysInStage(candidate.stageUpdatedAt);
  const stageOverdue = days !== null && days > 7;

  return (
    <div
      className="bg-white p-4 border border-black/[0.08] shadow-sm hover:shadow-md transition-all"
      style={{ borderRadius: '14px' }}
    >
      {/* Match Score */}
      {matchScore !== null ? (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl font-bold text-[#7DBBFF]">{matchScore}%</span>
          <span className="text-xs text-[#6B7280]">match</span>
        </div>
      ) : candidate.score ? (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl font-bold text-[#7DBBFF]">{candidate.score}%</span>
          <span className="text-xs text-[#6B7280]">match</span>
        </div>
      ) : null}

      {/* Name + Role */}
      <button
        onClick={() => onCandidateClick(candidate)}
        className="w-full text-left mb-3 group"
      >
        <h4 className="text-sm text-[#111827] font-semibold mb-0.5 group-hover:text-[#7DBBFF] transition-colors truncate">
          {candidate.name}
        </h4>
        <p className="text-xs text-[#6B7280] truncate">{candidate.role}</p>
        {candidate.location && (
          <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{candidate.location}</p>
        )}
      </button>

      {/* Dimension Flags */}
      {flags && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {flags.strongest.map((dim) => (
            <DimensionPill key={dim.key} flag={dim} variant="strongest" />
          ))}
          <DimensionPill flag={flags.weakest} variant="weakest" />
        </div>
      )}

      {/* Stage Badge + Days in Stage */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs px-2 py-0.5 font-medium ${stageBadgeStyles(candidate.stage)}`}
          style={{ borderRadius: '6px' }}
        >
          {stageLabel(candidate.stage)}
        </span>
        {days !== null && (
          <span className={`text-xs ${stageOverdue ? 'text-[#F59E0B] font-medium' : 'text-[#9CA3AF]'}`}>
            {days}d{stageOverdue ? ' ⚠' : ''}
          </span>
        )}
      </div>

      {/* CTA */}
      <CTAButton
        stage={candidate.stage}
        candidate={candidate}
        onCandidateClick={onCandidateClick}
        onAction={onAction}
      />
    </div>
  );
}
