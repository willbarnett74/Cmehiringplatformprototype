/**
 * PerformanceSnapshotForm.tsx
 *
 * Spec 8 §2 — Primary post-hire data collection form.
 * Employer rates a hired candidate at 30 or 90 days:
 *   - Performance band (Top / Mid / Low)
 *   - Six dimension behaviour ratings (1–5)
 *   - Would rehire (Yes / No)
 *   - Notes (optional)
 *
 * Includes calibration cross-reference panel (§2.3) and forced-distribution nudge.
 * Also embeds ManagerObservationForm as a collapsible second section (§4.3).
 */

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getActiveCriteria } from '../../lib/calibration';
import { ManagerObservationForm, type ManagerObservationData } from './ManagerObservationForm';
import type { PerformanceSnapshot, MotivationalPulseCheck } from '../types/employer';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PerformanceSnapshotData {
  performance_band: 'Top' | 'Mid' | 'Low';
  learning_velocity_rating: number;
  ownership_rating: number;
  resilience_rating: number;
  communication_confidence_rating: number;
  relational_intelligence_rating: number;
  motivational_fit_rating: number;
  would_rehire: boolean | null;
  notes: string;
}

interface PerformanceSnapshotFormProps {
  candidateName: string;
  engagementId: number;
  snapshotDay: 30 | 90;
  /** Existing snapshot to show in edit mode (duplicate-prevention) */
  existingSnapshot?: Partial<PerformanceSnapshot>;
  /** Existing pulse check manager fields */
  existingPulseCheck?: Partial<MotivationalPulseCheck>;
  /** Percentage of this employer's hires rated Top (for forced-distribution nudge) */
  topPerformerPercent?: number;
  onSubmit: (snapshot: PerformanceSnapshotData, managerObs: ManagerObservationData) => void;
  onClose: () => void;
}

// ─── Dimension config ─────────────────────────────────────────────────────────

const DIMENSIONS = [
  {
    key: 'learning_velocity_rating' as const,
    label: 'Learning velocity',
    low: 'Needs significant guidance on familiar tasks',
    high: 'Rapidly acquires new skills and applies them independently',
  },
  {
    key: 'ownership_rating' as const,
    label: 'Ownership',
    low: 'Waits to be told what to do',
    high: 'Takes full ownership of outcomes without prompting',
  },
  {
    key: 'resilience_rating' as const,
    label: 'Resilience',
    low: 'Struggles under normal pressure',
    high: 'Maintains effectiveness through significant setbacks',
  },
  {
    key: 'communication_confidence_rating' as const,
    label: 'Communication confidence',
    low: 'Avoids raising issues',
    high: 'Communicates directly and raises difficult things proactively',
  },
  {
    key: 'relational_intelligence_rating' as const,
    label: 'Relational intelligence',
    low: 'Misreads people and situations regularly',
    high: 'Reads situations accurately and builds trust naturally',
  },
  {
    key: 'motivational_fit_rating' as const,
    label: 'Motivational fit',
    low: 'Appears disengaged from the work',
    high: 'Visibly energised and aligned with the role',
  },
];

type DimensionKey = typeof DIMENSIONS[number]['key'];

// ─── Sub-component: Rating Scale ──────────────────────────────────────────────

function RatingScale({
  value,
  onChange,
  low,
  high,
}: {
  value: number | null;
  onChange: (v: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="w-9 h-9 rounded-lg text-sm font-semibold transition-all flex items-center justify-center border"
            style={{
              background: value === n ? '#7DBBFF' : '#F9FAFB',
              borderColor: value === n ? '#7DBBFF' : '#E5E7EB',
              color: value === n ? '#fff' : '#374151',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px]" style={{ color: '#9CA3AF' }}>
        <span className="max-w-[42%]">{low}</span>
        <span className="max-w-[42%] text-right">{high}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PerformanceSnapshotForm({
  candidateName,
  engagementId: _engagementId,
  snapshotDay,
  existingSnapshot,
  existingPulseCheck,
  topPerformerPercent = 0,
  onSubmit,
  onClose,
}: PerformanceSnapshotFormProps) {
  const calibration = getActiveCriteria(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [band, setBand] = useState<'Top' | 'Mid' | 'Low' | null>(
    (existingSnapshot?.performance_band as 'Top' | 'Mid' | 'Low') ?? null,
  );
  const [ratings, setRatings] = useState<Record<DimensionKey, number | null>>({
    learning_velocity_rating: existingSnapshot?.learning_velocity_rating ?? null,
    ownership_rating: existingSnapshot?.ownership_rating ?? null,
    resilience_rating: existingSnapshot?.resilience_rating ?? null,
    communication_confidence_rating: existingSnapshot?.communication_confidence_rating ?? null,
    relational_intelligence_rating: existingSnapshot?.relational_intelligence_rating ?? null,
    motivational_fit_rating: existingSnapshot?.motivational_fit_rating ?? null,
  });
  const [wouldRehire, setWouldRehire] = useState<boolean | null>(
    existingSnapshot?.would_rehire ?? null,
  );
  const [notes, setNotes] = useState(existingSnapshot?.notes ?? '');
  const [managerObs, setManagerObs] = useState<ManagerObservationData | null>(null);
  const [managerExpanded, setManagerExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setRating = (key: DimensionKey, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const allRatingsFilled = DIMENSIONS.every((d) => ratings[d.key] !== null);
  const canSubmit = band !== null && allRatingsFilled && wouldRehire !== null;

  // ── Forced-distribution nudge ───────────────────────────────────────────────
  const showDistributionNudge = band === 'Top' && topPerformerPercent > 40;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!canSubmit) return;
    const snapshotData: PerformanceSnapshotData = {
      performance_band: band!,
      learning_velocity_rating: ratings.learning_velocity_rating!,
      ownership_rating: ratings.ownership_rating!,
      resilience_rating: ratings.resilience_rating!,
      communication_confidence_rating: ratings.communication_confidence_rating!,
      relational_intelligence_rating: ratings.relational_intelligence_rating!,
      motivational_fit_rating: ratings.motivational_fit_rating!,
      would_rehire: wouldRehire,
      notes,
    };
    const obsData: ManagerObservationData = managerObs ?? {
      mastery_behaviour_rating: null,
      impact_behaviour_rating: null,
      recognition_behaviour_rating: null,
      autonomy_behaviour_rating: null,
    };
    onSubmit(snapshotData, obsData);
    setSubmitted(true);
  };

  // ─── Success state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div
          className="bg-white p-10 text-center flex flex-col items-center gap-4"
          style={{ borderRadius: '20px', maxWidth: 400, width: '90%' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle2 className="w-7 h-7" style={{ color: '#10B981' }} strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            Review submitted
          </h3>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {candidateName}'s {snapshotDay}-day performance review has been saved.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 text-sm font-medium rounded-xl text-white"
            style={{ background: '#111827' }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white w-full overflow-hidden flex flex-col"
        style={{ borderRadius: '20px', maxWidth: 660, maxHeight: '92vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5 border-b flex-shrink-0"
          style={{ borderColor: '#F3F4F6' }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
              {snapshotDay}-day performance review
            </h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {candidateName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" style={{ color: '#9CA3AF' }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-7">

          {/* ── Performance band ─────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>
              Overall performance band <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
              Relative to your expectations for this role and timeframe, how would you rate this hire?
            </p>

            {/* Calibration reference panel */}
            {calibration && (
              <div
                className="p-3 rounded-xl mb-3 flex gap-2"
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
              >
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#3B82F6' }} />
                <div className="text-xs" style={{ color: '#1E40AF' }}>
                  <span className="font-semibold">Your calibration criteria</span>
                  {calibration.criterion_1 && <p className="mt-0.5">Top: {calibration.criterion_1}</p>}
                  {calibration.criterion_2 && <p className="mt-0.5">Mid: {calibration.criterion_2}</p>}
                  {calibration.criterion_3 && <p className="mt-0.5">Low: {calibration.criterion_3}</p>}
                  {calibration.kpi_targets && <p className="mt-0.5">KPIs: {calibration.kpi_targets}</p>}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {(['Top', 'Mid', 'Low'] as const).map((b) => {
                const colors = {
                  Top: { active: '#10B981', bg: '#DCFCE7', border: '#86EFAC' },
                  Mid: { active: '#F59E0B', bg: '#FEF3C7', border: '#FCD34D' },
                  Low: { active: '#EF4444', bg: '#FEE2E2', border: '#FCA5A5' },
                };
                const c = colors[b];
                const isActive = band === b;
                return (
                  <button
                    key={b}
                    onClick={() => setBand(b)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all"
                    style={{
                      background: isActive ? c.bg : '#F9FAFB',
                      borderColor: isActive ? c.border : '#E5E7EB',
                      color: isActive ? c.active : '#6B7280',
                    }}
                  >
                    {b} performer
                  </button>
                );
              })}
            </div>

            {/* Forced distribution nudge */}
            {showDistributionNudge && (
              <div
                className="mt-3 p-3 rounded-xl flex gap-2"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
                <p className="text-xs" style={{ color: '#92400E' }}>
                  You've rated <strong>{topPerformerPercent}%</strong> of your hires as top performers.
                  {calibration?.criterion_1 && (
                    <> Your calibration criteria defined top performance as: "{calibration.criterion_1}". </>
                  )}
                  Consider whether this rating reflects genuinely exceptional performance.
                </p>
              </div>
            )}
          </div>

          {/* ── Dimension ratings ─────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>
              Behaviour ratings <span style={{ color: '#EF4444' }}>*</span>
            </h3>
            <div className="space-y-6">
              {DIMENSIONS.map((dim) => (
                <div key={dim.key}>
                  <p className="text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    {dim.label}
                  </p>
                  <RatingScale
                    value={ratings[dim.key]}
                    onChange={(v) => setRating(dim.key, v)}
                    low={dim.low}
                    high={dim.high}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Would rehire ─────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#111827' }}>
              Would you rehire this person? <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div className="flex gap-3">
              {[
                { label: 'Yes', value: true, activeColor: '#10B981', activeBg: '#DCFCE7', activeBorder: '#86EFAC' },
                { label: 'No', value: false, activeColor: '#EF4444', activeBg: '#FEE2E2', activeBorder: '#FCA5A5' },
              ].map((opt) => {
                const isActive = wouldRehire === opt.value;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setWouldRehire(opt.value)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all"
                    style={{
                      background: isActive ? opt.activeBg : '#F9FAFB',
                      borderColor: isActive ? opt.activeBorder : '#E5E7EB',
                      color: isActive ? opt.activeColor : '#6B7280',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#111827' }}>
              Notes <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>(optional)</span>
            </label>
            <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
              What has stood out about this person's performance — positive or negative?
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any observations…"
              className="w-full text-sm px-3 py-2.5 border rounded-xl resize-none focus:outline-none transition-colors"
              style={{
                borderColor: '#E5E7EB',
                color: '#111827',
                background: '#FAFAFA',
              }}
            />
          </div>

          {/* ── Manager observation section (collapsible) ─────────────────── */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1.25rem' }}>
            <button
              onClick={() => setManagerExpanded(!managerExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                  Manager behavioural observation
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                  Rate the observable behaviours you've seen from {candidateName}
                </p>
              </div>
              {managerExpanded ? (
                <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
              )}
            </button>

            {managerExpanded && (
              <div className="mt-4">
                <ManagerObservationForm
                  candidateName={candidateName}
                  existingData={
                    existingPulseCheck
                      ? {
                          mastery_behaviour_rating: existingPulseCheck.mastery_behaviour_rating ?? null,
                          impact_behaviour_rating: existingPulseCheck.impact_behaviour_rating ?? null,
                          recognition_behaviour_rating: existingPulseCheck.recognition_behaviour_rating ?? null,
                          autonomy_behaviour_rating: existingPulseCheck.autonomy_behaviour_rating ?? null,
                        }
                      : undefined
                  }
                  onChange={setManagerObs}
                  embedded
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-7 py-4 border-t flex items-center justify-between flex-shrink-0"
          style={{ borderColor: '#F3F4F6' }}
        >
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            {!canSubmit ? 'Complete all required fields to submit' : 'Ready to submit'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl border transition-colors"
              style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-5 py-2 text-sm font-medium rounded-xl text-white transition-all"
              style={{
                background: canSubmit ? '#111827' : '#D1D5DB',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              Submit review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
