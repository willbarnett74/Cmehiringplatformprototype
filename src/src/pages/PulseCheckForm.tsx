/**
 * PulseCheckForm.tsx
 *
 * Spec 8 §3 — Standalone candidate pulse check page.
 * Accessible via signed URL: /pulse-check?token=[signed_token]
 * No auth required — the token acts as authentication.
 *
 * Four motivational dimensions (1–5):
 *   Mastery | Impact | Recognition | Autonomy
 *
 * In prototype mode the token is decoded client-side. The form writes to
 * motivational_pulse_checks (candidate-side fields).
 */

import { useState } from 'react';
import { CheckCircle2, Heart } from 'lucide-react';
import { validatePulseToken, type PulseCheckTokenPayload } from '../lib/pulseCheckToken';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PulseCheckFormProps {
  /** Token string from URL — prototype passes it via prop, production via query param */
  token?: string;
}

interface PulseRatings {
  mastery: number | null;
  impact: number | null;
  recognition: number | null;
  autonomy: number | null;
}

// ─── Dimension config ─────────────────────────────────────────────────────────

const DIMENSIONS = [
  {
    key: 'mastery' as const,
    label: 'Mastery',
    question: 'How often are you encountering genuinely new challenges that stretch your thinking?',
    low: 'Rarely',
    high: 'Constantly',
    color: '#7DBBFF',
    bg: '#EFF6FF',
  },
  {
    key: 'impact' as const,
    label: 'Impact',
    question: 'How clearly can you see the effect of your work on outcomes or people around you?',
    low: 'Not at all',
    high: 'Very clearly',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    key: 'recognition' as const,
    label: 'Recognition',
    question: 'How well does the feedback and acknowledgment you receive match what motivates you?',
    low: 'Poorly',
    high: 'Very well',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    key: 'autonomy' as const,
    label: 'Autonomy',
    question: 'How much genuine independence do you have over how you approach your work?',
    low: 'Very little',
    high: 'Significant',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
];

// ─── Sub-component: Dimension Rating ─────────────────────────────────────────

function DimensionCard({
  label,
  question,
  low,
  high,
  color,
  bg,
  value,
  onChange,
}: {
  label: string;
  question: string;
  low: string;
  high: string;
  color: string;
  bg: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: '#fff', border: '1px solid #F3F4F6' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: bg, color }}
        >
          {label[0]}
        </div>
        <span className="text-sm font-semibold" style={{ color: '#111827' }}>
          {label}
        </span>
      </div>
      <p className="text-sm mb-4" style={{ color: '#374151', lineHeight: '1.5' }}>
        {question}
      </p>
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const isActive = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className="flex-1 h-10 rounded-xl text-sm font-semibold border-2 transition-all"
              style={{
                background: isActive ? bg : '#F9FAFB',
                borderColor: isActive ? color : '#E5E7EB',
                color: isActive ? color : '#9CA3AF',
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px]" style={{ color: '#9CA3AF' }}>
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PulseCheckForm({ token }: PulseCheckFormProps) {
  // In production, read from URL query params:
  // const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const demoToken = token ?? new URLSearchParams(window.location.search).get('token') ?? '';

  const [payload] = useState<PulseCheckTokenPayload | null>(() =>
    demoToken ? validatePulseToken(demoToken) : null,
  );

  const [ratings, setRatings] = useState<PulseRatings>({
    mastery: null,
    impact: null,
    recognition: null,
    autonomy: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const setRating = (key: keyof PulseRatings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const allFilled = Object.values(ratings).every((v) => v !== null);

  const handleSubmit = () => {
    if (!allFilled) return;
    // In production: POST to Supabase Edge Function with payload.engagement_id + snapshot_day
    console.log('Pulse check submitted:', { payload, ratings });
    setSubmitted(true);
  };

  // ── Invalid / expired token ─────────────────────────────────────────────────
  if (!payload && demoToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6">
        <div
          className="bg-white p-10 text-center max-w-sm w-full"
          style={{ borderRadius: '24px', border: '1px solid #F3F4F6' }}
        >
          <p className="text-4xl mb-4">⏳</p>
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
            This link has expired
          </h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Pulse check links are valid for 14 days. Contact your recruitment team if you need a new link.
          </p>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6">
        <div
          className="bg-white p-10 text-center flex flex-col items-center gap-4 max-w-sm w-full"
          style={{ borderRadius: '24px', border: '1px solid #F3F4F6' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>
            Thanks for checking in
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
            Your responses help CMe learn what makes roles work for different people. We'll check in again at the next milestone.
          </p>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7DBBFF)' }}
            >
              <Heart className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="font-semibold" style={{ color: '#111827' }}>CMe</span>
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#111827' }}>
            Quick check-in
            {payload && (
              <span className="ml-2 text-sm font-normal" style={{ color: '#9CA3AF' }}>
                {payload.snapshot_day}-day milestone
              </span>
            )}
          </h1>
          <div
            className="text-sm px-5 py-3 rounded-2xl mx-auto max-w-sm leading-relaxed"
            style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}
          >
            This is a quick check-in about how your work is going. Your answers help CMe understand what environments and roles suit different people. There are no right or wrong answers.
          </div>
        </div>

        {/* Dimension cards */}
        <div className="space-y-4 mb-8">
          {DIMENSIONS.map((dim) => (
            <DimensionCard
              key={dim.key}
              label={dim.label}
              question={dim.question}
              low={dim.low}
              high={dim.high}
              color={dim.color}
              bg={dim.bg}
              value={ratings[dim.key]}
              onChange={(v) => setRating(dim.key, v)}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="w-full py-4 text-sm font-semibold rounded-2xl text-white transition-all"
          style={{
            background: allFilled
              ? 'linear-gradient(135deg, #8B5CF6, #7DBBFF)'
              : '#D1D5DB',
            cursor: allFilled ? 'pointer' : 'not-allowed',
          }}
        >
          {allFilled ? 'Submit check-in' : `${Object.values(ratings).filter(Boolean).length} of 4 complete`}
        </button>

        <p className="text-center text-xs mt-4" style={{ color: '#9CA3AF' }}>
          Your responses are private and used only to improve role matching.
        </p>
      </div>
    </div>
  );
}
