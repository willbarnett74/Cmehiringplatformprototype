import { useState, useEffect } from 'react';
import { roleTemplates as staticTemplates } from '../../lib/roleTemplates';
import type { EmployerWeightings } from '../../types/supabase';

// ─── RoleTemplate type (matches role_templates Supabase table) ────────────────
// Flat shape: each trait dimension is a direct column, not nested.
// motivation_signal is a single string (not an array).

export type RoleTemplate = {
  id: string;
  name: string;
  category: string;
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
  motivation_signal: string;
  is_system: boolean;
};

// ─── templateToWeights ────────────────────────────────────────────────────────
// Maps a RoleTemplate to EmployerWeightings, stripping non-weight fields.

export function templateToWeights(template: RoleTemplate): EmployerWeightings {
  return {
    learning_velocity: template.learning_velocity,
    ownership_follow_through: template.ownership_follow_through,
    resilience: template.resilience,
    communication_confidence: template.communication_confidence,
    relational_intelligence: template.relational_intelligence,
    motivational_fit: template.motivational_fit,
  };
}

// ─── topTwoDimensions ─────────────────────────────────────────────────────────

const DIMENSION_LABELS: Record<string, string> = {
  learning_velocity: 'Learning Velocity',
  ownership_follow_through: 'Ownership',
  resilience: 'Resilience',
  communication_confidence: 'Communication',
  relational_intelligence: 'Relational Intelligence',
  motivational_fit: 'Motivational Fit',
};

function topTwoDimensions(template: RoleTemplate) {
  const dims = Object.entries(DIMENSION_LABELS).map(([key, label]) => ({
    key,
    label,
    value: template[key as keyof RoleTemplate] as number,
  }));
  return dims.sort((a, b) => b.value - a.value).slice(0, 2);
}

// ─── Static data fallback ─────────────────────────────────────────────────────
// Maps the local roleTemplates (nested trait_weights) to the flat RoleTemplate
// shape so the component works without a live Supabase connection.

function mapStaticToFlat(): RoleTemplate[] {
  return staticTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    learning_velocity: t.trait_weights.learning_velocity,
    ownership_follow_through: t.trait_weights.ownership_follow_through,
    resilience: t.trait_weights.resilience,
    communication_confidence: t.trait_weights.communication_confidence,
    relational_intelligence: t.trait_weights.relational_intelligence,
    motivational_fit: t.trait_weights.motivational_fit,
    motivation_signal: t.motivation_signals.join(', '),
    is_system: true,
  }));
}

// ─── Supabase fetch ───────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

async function fetchTemplates(): Promise<RoleTemplate[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return mapStaticToFlat();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/role_templates?is_system=eq.true&order=name`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    }
  );
  if (!res.ok) return mapStaticToFlat();
  const data: RoleTemplate[] = await res.json();
  return data.length > 0 ? data : mapStaticToFlat();
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  onSelect: (template: RoleTemplate) => void;
  selectedId?: string;
};

export function RoleTemplatePicker({ onSelect, selectedId }: Props) {
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-[#6B7280]">
        Loading templates…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => {
        const isSelected = selectedId === template.id;
        const topDims = topTwoDimensions(template);
        return (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`text-left p-4 border transition-all ${
              isSelected
                ? 'border-[#7DBBFF] ring-2 ring-[#7DBBFF] bg-[#7DBBFF]/5'
                : 'border-black/[0.08] bg-white hover:border-[#7DBBFF]/50 hover:bg-[#F9F9FA]'
            }`}
            style={{ borderRadius: '12px' }}
          >
            <h3 className="font-semibold text-[#111827] text-sm mb-1">
              {template.name}
            </h3>
            <p className="text-xs text-[#6B7280] mb-3">
              {template.motivation_signal}
            </p>
            <div className="flex gap-1 flex-wrap">
              {topDims.map((dim) => (
                <span
                  key={dim.key}
                  className="text-xs bg-[#7DBBFF]/10 text-[#7DBBFF] border border-[#7DBBFF]/20 rounded-full px-2 py-0.5"
                >
                  {dim.label}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
