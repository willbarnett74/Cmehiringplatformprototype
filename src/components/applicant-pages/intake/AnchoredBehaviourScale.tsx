// Stub component — full implementation lives in CMe-Spec-4-Intake-Flow
export type AnchoredOption = {
  id: string;
  text: string;
  scores: Record<string, number>;
};

type Props = {
  options: AnchoredOption[];
  value: string | null;
  onChange: (id: string, scores: Record<string, number>) => void;
};

export function AnchoredBehaviourScale({ options, value, onChange }: Props) {
  return (
    <div className="space-y-3">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id, opt.scores)}
          className={`w-full text-left p-4 border text-sm transition-all ${
            value === opt.id
              ? 'border-[#7DBBFF] bg-[#7DBBFF]/5'
              : 'border-black/[0.08] hover:border-[#7DBBFF]/50'
          }`}
          style={{ borderRadius: '10px' }}
        >
          {opt.text}
        </button>
      ))}
    </div>
  );
}
