import { useEffect, useRef } from 'react';
import type { EmployerWeightings } from '../../types/supabase';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  fetchActiveEmployerTraitWeightings,
  upsertActiveEmployerTraitWeightings,
} from '../../lib/employerOnboardingPersistence';

export type TraitWeights = EmployerWeightings;

const MIN_PCT = 5;

const DIMENSIONS = [
  { key: 'learning_velocity', label: 'Learning velocity' },
  { key: 'ownership_follow_through', label: 'Ownership & follow-through' },
  { key: 'resilience', label: 'Resilience' },
  { key: 'communication_confidence', label: 'Communication confidence' },
  { key: 'relational_intelligence', label: 'Relational intelligence' },
  { key: 'motivational_fit', label: 'Motivational fit' },
] as const;

export function defaultTraitWeights(): TraitWeights {
  return {
    learning_velocity: 17,
    ownership_follow_through: 17,
    resilience: 17,
    communication_confidence: 17,
    relational_intelligence: 16,
    motivational_fit: 16,
  };
}

export interface TraitWeightingUIProps {
  weights: TraitWeights;
  onChange: (weights: TraitWeights) => void;
  onSave: () => void;
  /** When set with Supabase configured, loads the active row on mount (via `onChange`) and upserts on Save. */
  businessId?: string | null;
  /** Stored on insert only when no active row exists yet (e.g. onboarding). */
  roleTemplateSlug?: string | null;
}

function clampDimension(value: number): number {
  const n = Math.round(Number.isFinite(value) ? value : MIN_PCT);
  return Math.max(MIN_PCT, Math.min(100, n));
}

export function TraitWeightingUI({
  weights,
  onChange,
  onSave,
  businessId = null,
  roleTemplateSlug = null,
}: TraitWeightingUIProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const total =
    weights.learning_velocity +
    weights.ownership_follow_through +
    weights.resilience +
    weights.communication_confidence +
    weights.relational_intelligence +
    weights.motivational_fit;
  const totalOk = total === 100;

  useEffect(() => {
    if (!businessId || !isSupabaseConfigured || !supabase) return;
    let cancelled = false;
    void (async () => {
      const row = await fetchActiveEmployerTraitWeightings(supabase, businessId);
      if (!cancelled && row) onChangeRef.current(row);
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const setKey = (key: keyof TraitWeights, raw: number) => {
    const next = clampDimension(raw);
    onChange({ ...weights, [key]: next });
  };

  const handleSave = async () => {
    if (!totalOk) return;
    if (businessId && isSupabaseConfigured && supabase) {
      await upsertActiveEmployerTraitWeightings(supabase, businessId, weights, {
        roleTemplateSlug,
      });
    }
    onSave();
  };

  return (
    <div className="text-[#111827]">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Trait weighting</h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">Allocate 100% across six dimensions (minimum 5% each).</p>
        </div>
        <p
          className={`shrink-0 text-sm font-medium tabular-nums ${totalOk ? 'text-emerald-600' : 'text-red-600'}`}
          aria-live="polite"
        >
          Total: {total}%
        </p>
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-white">
        {DIMENSIONS.map((dim, i) => {
          const v = weights[dim.key];
          return (
            <div
              key={dim.key}
              className={`grid grid-cols-1 items-center gap-3 px-4 py-4 sm:grid-cols-[minmax(0,11rem)_1fr_3.5rem] sm:gap-6 ${
                i < DIMENSIONS.length - 1 ? 'border-b border-[#E5E7EB]' : ''
              }`}
            >
              <span className="text-sm font-medium text-[#374151]">{dim.label}</span>
              <input
                type="range"
                min={MIN_PCT}
                max={100}
                step={1}
                value={Math.max(MIN_PCT, v)}
                onChange={(e) => setKey(dim.key, parseInt(e.target.value, 10))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#F3F4F6] accent-[#111827] [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#111827] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#111827]"
                aria-valuemin={MIN_PCT}
                aria-valuemax={100}
                aria-valuenow={v}
                aria-label={dim.label}
              />
              <span className="text-right text-sm tabular-nums text-[#111827] sm:min-w-[2.75rem]">{v}%</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!totalOk}
          className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
