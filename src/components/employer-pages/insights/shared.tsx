/**
 * Shared Insight Components — Reusable across all 5 insight sections
 * 
 * Components: PanelIntroBlock, StateBanner, GateScreen, Callout
 * All styled to match the CMe Insights design spec.
 */

import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

// ─── Data State Types ───

export type DataState = 1 | 2 | 3;

export function getDataState(snapshotCount: number): DataState {
  if (snapshotCount < 5) return 1;
  if (snapshotCount < 15) return 2;
  return 3;
}

// ─── Section rule (handoff: uppercase label + hairline) ───

interface SectionRuleProps {
  children: React.ReactNode;
  className?: string;
  mt?: number;
  mb?: number;
}

export function SectionRule({ children, className = '', mt = 32, mb = 20 }: SectionRuleProps) {
  return (
    <div
      className={['flex', 'items-center', 'gap-3.5', className].filter(Boolean).join(' ')}
      style={{ marginTop: mt, marginBottom: mb }}
    >
      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        {children}
      </span>
      <div className="h-px flex-1 bg-black/[0.08]" />
    </div>
  );
}

// ─── Panel Intro Block ───

interface PanelIntroBlockProps {
  sectionNumber: string;
  sectionLabel: string;
  heading: string;
  body: string;
}

export function PanelIntroBlock({ sectionNumber, sectionLabel, heading, body }: PanelIntroBlockProps) {
  return (
    <div className="mb-5 border-b border-black/[0.08] pb-5">
      <p
        className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]"
      >
        {sectionNumber} · {sectionLabel}
      </p>
      <h2
        className="mb-2"
        style={{
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.4px',
          color: '#111827',
        }}
      >
        {heading}
      </h2>
      <p
        style={{
          fontSize: '13px',
          fontWeight: 400,
          color: '#6B7280',
          lineHeight: 1.65,
          maxWidth: '660px',
        }}
      >
        {body}
      </p>
    </div>
  );
}

// ─── State Banner ───

interface StateBannerProps {
  state: DataState;
  message: string;
}

export function StateBanner({ state, message }: StateBannerProps) {
  const bgStyles: Record<DataState, React.CSSProperties> = {
    1: { background: '#F9FAFB' },
    2: { background: '#FFFBEB' },
    3: { background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)' },
  };

  const iconMap: Record<DataState, React.ReactNode> = {
    1: <Info className="w-4 h-4 text-[#9CA3AF] flex-shrink-0 mt-px" strokeWidth={2} />,
    2: <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-px" strokeWidth={2} />,
    3: <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-px" strokeWidth={2} />,
  };

  return (
    <div
      className="flex items-start gap-3 mb-5"
      style={{
        ...bgStyles[state],
        padding: '12px 16px',
        borderRadius: '8px',
      }}
    >
      {iconMap[state]}
      <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.55 }}>
        {message}
      </p>
    </div>
  );
}

// ─── Gate Screen ───

interface GateScreenProps {
  requiredSnapshots: number;
  currentSnapshots: number;
  sectionName: string;
  subtitle?: string;
}

export function GateScreen({ requiredSnapshots, currentSnapshots, sectionName, subtitle }: GateScreenProps) {
  const remaining = requiredSnapshots - currentSnapshots;
  const progress = Math.min(100, (currentSnapshots / requiredSnapshots) * 100);

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '360px' }}>
      <div className="text-center">
        <p
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '64px',
            fontWeight: 700,
            color: 'rgba(0,0,0,0.08)',
            lineHeight: 1,
            marginBottom: '12px',
          }}
        >
          {remaining}
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
          performance snapshots needed to unlock {sectionName}
        </p>
        <p
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
            maxWidth: '320px',
            lineHeight: 1.5,
            margin: '0 auto 16px',
          }}
        >
          {subtitle || `You have ${currentSnapshots}. Submit ${remaining} more to begin seeing patterns emerge in your hiring data.`}
        </p>
        {/* Progress bar */}
        <div
          className="mx-auto bg-black/[0.08]"
          style={{
            width: '200px',
            height: '5px',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#7DBBFF',
              borderRadius: '99px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Callout Component ───

export type CalloutVariant = 'warn' | 'good' | 'info' | 'risk';

interface CalloutProps {
  variant: CalloutVariant;
  children: React.ReactNode;
}

const calloutConfig: Record<CalloutVariant, { bg: string; iconColor: string; icon: React.ReactNode }> = {
  warn: {
    bg: '#FFFBEB',
    iconColor: '#F59E0B',
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ marginTop: '1px', color: '#F59E0B' }} strokeWidth={2} />,
  },
  good: {
    bg: '#F0FDF4',
    iconColor: '#10B981',
    icon: <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ marginTop: '1px', color: '#10B981' }} strokeWidth={2} />,
  },
  info: {
    bg: '#EFF6FF',
    iconColor: '#3B82F6',
    icon: <Info className="w-4 h-4 flex-shrink-0" style={{ marginTop: '1px', color: '#3B82F6' }} strokeWidth={2} />,
  },
  risk: {
    bg: '#FEF2F2',
    iconColor: '#EF4444',
    icon: <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ marginTop: '1px', color: '#EF4444' }} strokeWidth={2} />,
  },
};

export function Callout({ variant, children }: CalloutProps) {
  const config = calloutConfig[variant];

  return (
    <div
      className="flex items-start gap-3"
      style={{
        background: config.bg,
        padding: '12px 16px',
        borderRadius: '8px',
        marginTop: '12px',
      }}
    >
      {config.icon}
      <div style={{ fontSize: '13px', lineHeight: 1.55, color: '#374151' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Dimension Labels (shared across sections) ───

export const DIMENSION_LABELS: Record<string, string> = {
  learning_velocity: 'Learning Velocity',
  ownership_follow_through: 'Ownership & Follow-Through',
  resilience: 'Resilience',
  communication_confidence: 'Comm Confidence',
  relational_intelligence: 'Relational Intelligence',
  motivational_fit: 'Motivational Fit',
};

export const DIMENSION_ABBREVS: Record<string, string> = {
  learning_velocity: 'LV',
  ownership_follow_through: 'OW',
  resilience: 'RE',
  communication_confidence: 'CC',
  relational_intelligence: 'RI',
  motivational_fit: 'MF',
};

export const ABBREV_KEY: Record<string, string> = {
  LV: 'Learning Velocity',
  OW: 'Ownership & Follow-Through',
  RE: 'Resilience',
  CC: 'Comm Confidence',
  RI: 'Relational Intelligence',
  MF: 'Motivational Fit',
};