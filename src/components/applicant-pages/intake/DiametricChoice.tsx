/**
 * Format A — Diametric Choice
 * Renders two person descriptions and four choice buttons (Strongly A / Mostly A / Mostly B / Strongly B).
 */

interface DiametricChoiceProps {
  personA: string;
  personB: string;
  value: 'strongly_a' | 'mostly_a' | 'mostly_b' | 'strongly_b' | null;
  onChange: (value: 'strongly_a' | 'mostly_a' | 'mostly_b' | 'strongly_b') => void;
  labelA?: string;
  labelB?: string;
}

export function DiametricChoice({
  personA,
  personB,
  value,
  onChange,
  labelA = 'PERSON A',
  labelB = 'PERSON B',
}: DiametricChoiceProps) {
  const choices: Array<{ key: 'strongly_a' | 'mostly_a' | 'mostly_b' | 'strongly_b'; label: string }> = [
    { key: 'strongly_a', label: 'Strongly A' },
    { key: 'mostly_a', label: 'Mostly A' },
    { key: 'mostly_b', label: 'Mostly B' },
    { key: 'strongly_b', label: 'Strongly B' },
  ];

  return (
    <div>
      <div className="space-y-4 mb-6">
        <div className="p-5 border-2 border-black/[0.08]" style={{ borderRadius: '12px' }}>
          <div className="text-xs font-medium text-[#7DBBFF] mb-2">{labelA}</div>
          <p className="text-sm text-[#111827] leading-relaxed">{personA}</p>
        </div>
        <div className="p-5 border-2 border-black/[0.08]" style={{ borderRadius: '12px' }}>
          <div className="text-xs font-medium text-[#7DBBFF] mb-2">{labelB}</div>
          <p className="text-sm text-[#111827] leading-relaxed">{personB}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {choices.map((c) => (
          <button
            key={c.key}
            onClick={() => onChange(c.key)}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              value === c.key
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
