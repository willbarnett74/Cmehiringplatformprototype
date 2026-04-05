import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { EmployerWeightings } from '../../types/supabase';

// ─── Constants ───────────────────────────────────────────────
const FIXED_FLOOR = 5;   // pre-allocated per dimension (30 pts total)
const FREE_POINTS = 70;  // employer's free allocation budget

const DEFAULT_WEIGHTS: EmployerWeightings = {
  learning_velocity: 17,
  ownership_follow_through: 17,
  resilience: 17,
  communication_confidence: 17,
  relational_intelligence: 16,
  motivational_fit: 16,
};

// ─── Dimension Definitions ───────────────────────────────────
const DIMENSIONS: { key: keyof EmployerWeightings; label: string; definition: string }[] = [
  {
    key: 'learning_velocity',
    label: 'Learning Velocity',
    definition: 'How quickly someone acquires skills and updates their thinking',
  },
  {
    key: 'ownership_follow_through',
    label: 'Ownership & Follow-Through',
    definition: 'Whether someone takes genuine responsibility for outcomes, not just tasks',
  },
  {
    key: 'resilience',
    label: 'Resilience',
    definition: 'How well someone maintains effectiveness under pressure and setbacks',
  },
  {
    key: 'communication_confidence',
    label: 'Communication Confidence',
    definition: 'Whether someone communicates directly and raises difficult things when needed',
  },
  {
    key: 'relational_intelligence',
    label: 'Relational Intelligence',
    definition: 'How accurately someone reads people and situations and builds genuine trust',
  },
  {
    key: 'motivational_fit',
    label: 'Motivational Fit',
    definition: 'Whether what drives this person aligns with what this role actually offers',
  },
];

// ─── Props ───────────────────────────────────────────────────
type Props = {
  businessId: string;
  initialWeights?: EmployerWeightings;
  onSave?: (weights: EmployerWeightings) => void;
};

// ─── Component ───────────────────────────────────────────────
export function TraitWeightingUI({ businessId, initialWeights, onSave }: Props) {
  const [weights, setWeights] = useState<EmployerWeightings>(initialWeights ?? DEFAULT_WEIGHTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing weights from DB on mount (settings context).
  // Skip when initialWeights are provided (onboarding / template context).
  useEffect(() => {
    if (initialWeights) return;
    supabase
      .from('employer_trait_weightings')
      .select('*')
      .eq('business_id', businessId)
      .single()
      .then(({ data }) => {
        if (data) setWeights(data as EmployerWeightings);
      });
  }, [businessId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Running total (70 free points) ──────────────────────
  const freeAllocated = Object.values(weights).reduce(
    (sum, w) => sum + (w - FIXED_FLOOR),
    0,
  );
  const remaining = FREE_POINTS - freeAllocated;

  // ─── Handlers ─────────────────────────────────────────────
  const handleChange = (key: keyof EmployerWeightings, value: number) => {
    setWeights(prev => ({ ...prev, [key]: Math.max(FIXED_FLOOR, value) }));
  };

  const handleSave = async () => {
    if (remaining !== 0) return;
    setSaving(true);
    const { error } = await supabase
      .from('employer_trait_weightings')
      .upsert({ business_id: businessId, ...weights, updated_at: new Date().toISOString() });
    setSaving(false);
    if (!error) {
      setSaved(true);
      onSave?.(weights);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // ─── Save button label & styling ──────────────────────────
  const buttonDisabled = remaining !== 0 || saving || saved;

  const buttonLabel = saving
    ? 'Saving...'
    : saved
    ? 'Saved'
    : remaining > 0
    ? `${remaining} points left to allocate`
    : remaining < 0
    ? `Over allocated by ${Math.abs(remaining)}`
    : 'Save priorities';

  const buttonClass = saved
    ? 'bg-[#10B981] text-white cursor-default'
    : saving
    ? 'bg-[#D1D5DB] text-white cursor-not-allowed'
    : remaining > 0
    ? 'bg-[#D1D5DB] text-[#F59E0B] cursor-not-allowed'
    : remaining < 0
    ? 'bg-[#D1D5DB] text-[#EF4444] cursor-not-allowed'
    : 'bg-[#7DBBFF] text-white hover:bg-[#6aabef] cursor-pointer';

  const remainingColor =
    remaining === 0 ? 'text-[#10B981]' : remaining > 0 ? 'text-[#F59E0B]' : 'text-[#EF4444]';

  return (
    <div>
      {/* ── Zone 1: Header ── */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-1">Set your hiring priorities</h2>
        <p className="text-sm text-[#6B7280]">
          Each trait has a 5-point minimum (30 pts fixed). Distribute your remaining 70 free points.
        </p>
        <p className={`mt-2 text-sm font-semibold ${remainingColor}`}>
          {remaining === 0
            ? '✓ All 70 points allocated'
            : remaining > 0
            ? `${remaining} free points remaining`
            : `Over-allocated by ${Math.abs(remaining)} — reduce a dimension`}
        </p>
      </div>

      {/* ── Zone 2: Dimension Cards (2-column grid) ── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {DIMENSIONS.map(dim => {
          // Dynamic max prevents over-allocation
          const dynamicMax = FIXED_FLOOR + remaining + (weights[dim.key] - FIXED_FLOOR);
          return (
            <div
              key={dim.key}
              className="border border-black/[0.08] rounded-xl p-4 bg-white hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-[#111827] text-sm">{dim.label}</span>
                <span className="text-2xl font-bold text-[#7DBBFF]">{weights[dim.key]}%</span>
              </div>
              <p className="text-xs text-[#6B7280] mb-3">{dim.definition}</p>
              <input
                type="range"
                min={FIXED_FLOOR}
                max={dynamicMax}
                step={1}
                value={weights[dim.key]}
                onChange={e => handleChange(dim.key, +e.target.value)}
                className="w-full accent-[#7DBBFF]"
              />
            </div>
          );
        })}
      </div>

      {/* ── Zone 3: Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-black/[0.08]">
        <span className={`text-sm font-medium ${remainingColor}`}>
          {remaining === 0
            ? saved
              ? 'Priorities saved'
              : 'Ready to save'
            : remaining > 0
            ? `${remaining} points left to allocate`
            : `Over allocated by ${Math.abs(remaining)}`}
        </span>
        <button
          onClick={handleSave}
          disabled={buttonDisabled}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${buttonClass}`}
        >
          {saving && (
            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle" />
          )}
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
