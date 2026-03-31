/**
 * ManagerObservationForm.tsx
 *
 * Spec 8 §4 — Manager behavioural observation form.
 * Managers rate OBSERVABLE BEHAVIOURS only — not motivational interpretations.
 * Four dimensions, each 1–5, corresponding to mastery / impact / recognition / autonomy.
 *
 * Can be rendered standalone or embedded inside PerformanceSnapshotForm.
 */

import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ManagerObservationData {
  mastery_behaviour_rating: number | null;
  impact_behaviour_rating: number | null;
  recognition_behaviour_rating: number | null;
  autonomy_behaviour_rating: number | null;
}

interface ManagerObservationFormProps {
  candidateName: string;
  existingData?: Partial<ManagerObservationData>;
  /** Called on every change when embedded; called on explicit submit when standalone */
  onChange?: (data: ManagerObservationData) => void;
  onSubmit?: (data: ManagerObservationData) => void;
  onClose?: () => void;
  /** True = renders inline, no modal chrome, no submit button */
  embedded?: boolean;
}

// ─── Dimension config ─────────────────────────────────────────────────────────

const DIMENSIONS = [
  {
    key: 'mastery_behaviour_rating' as const,
    label: 'Mastery behaviour',
    question: 'How often does this person seek out new challenges or push beyond what is required?',
    low: 'Rarely',
    high: 'Consistently',
  },
  {
    key: 'impact_behaviour_rating' as const,
    label: 'Impact behaviour',
    question: 'How much does this person focus on the tangible outcomes of their work?',
    low: 'Task-focused',
    high: 'Outcome-focused',
  },
  {
    key: 'recognition_behaviour_rating' as const,
    label: 'Recognition behaviour',
    question: 'How does this person respond to feedback and acknowledgment?',
    low: 'Indifferent',
    high: 'Visibly energised',
  },
  {
    key: 'autonomy_behaviour_rating' as const,
    label: 'Autonomy behaviour',
    question: 'How independently does this person operate when given the freedom to?',
    low: 'Seeks constant guidance',
    high: 'Fully self-directed',
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
      <div className="flex items-center gap-2 mb-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="w-9 h-9 rounded-lg text-sm font-semibold transition-all flex items-center justify-center border"
            style={{
              background: value === n ? '#8B5CF6' : '#F9FAFB',
              borderColor: value === n ? '#8B5CF6' : '#E5E7EB',
              color: value === n ? '#fff' : '#374151',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px]" style={{ color: '#9CA3AF' }}>
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ManagerObservationForm({
  candidateName,
  existingData,
  onChange,
  onSubmit,
  onClose,
  embedded = false,
}: ManagerObservationFormProps) {
  const [ratings, setRatings] = useState<ManagerObservationData>({
    mastery_behaviour_rating: existingData?.mastery_behaviour_rating ?? null,
    impact_behaviour_rating: existingData?.impact_behaviour_rating ?? null,
    recognition_behaviour_rating: existingData?.recognition_behaviour_rating ?? null,
    autonomy_behaviour_rating: existingData?.autonomy_behaviour_rating ?? null,
  });
  const [submitted, setSubmitted] = useState(false);

  const setRating = (key: DimensionKey, value: number) => {
    const updated = { ...ratings, [key]: value };
    setRatings(updated);
    onChange?.(updated);
  };

  const allFilled = DIMENSIONS.every((d) => ratings[d.key] !== null);

  const handleSubmit = () => {
    if (!allFilled) return;
    onSubmit?.(ratings);
    setSubmitted(true);
  };

  // Embedded mode: just render the fields inline
  if (embedded) {
    return (
      <div className="space-y-5">
        <div
          className="text-xs px-3 py-2 rounded-lg"
          style={{ background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' }}
        >
          Rate observable behaviours only — what you can directly see, not motivational interpretations.
        </div>
        {DIMENSIONS.map((dim) => (
          <div key={dim.key}>
            <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
              {dim.label}
            </p>
            <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
              {dim.question}
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
    );
  }

  // Standalone modal mode
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div
          className="bg-white p-10 text-center flex flex-col items-center gap-4"
          style={{ borderRadius: '20px', maxWidth: 400, width: '90%' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: '#EDE9FE' }}
          >
            <CheckCircle2 className="w-7 h-7" style={{ color: '#8B5CF6' }} strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
            Observations saved
          </h3>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Your behavioural observations for {candidateName} have been recorded.
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
        style={{ borderRadius: '20px', maxWidth: 560, maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5 border-b flex-shrink-0"
          style={{ borderColor: '#F3F4F6' }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
              Manager behavioural observation
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">
          <div
            className="text-xs px-3 py-2.5 rounded-xl"
            style={{ background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE' }}
          >
            Rate observable behaviours only — what you can directly see from {candidateName}'s day-to-day work, not motivational interpretations.
          </div>

          {DIMENSIONS.map((dim) => (
            <div key={dim.key}>
              <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>
                {dim.label}
              </p>
              <p className="text-xs mb-2.5" style={{ color: '#6B7280' }}>
                {dim.question}
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

        {/* Footer */}
        <div
          className="px-7 py-4 border-t flex items-center justify-between flex-shrink-0"
          style={{ borderColor: '#F3F4F6' }}
        >
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            {!allFilled ? 'All four ratings are required' : 'Ready to submit'}
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
              disabled={!allFilled}
              className="px-5 py-2 text-sm font-medium rounded-xl text-white transition-all"
              style={{
                background: allFilled ? '#8B5CF6' : '#D1D5DB',
                cursor: allFilled ? 'pointer' : 'not-allowed',
              }}
            >
              Save observations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
