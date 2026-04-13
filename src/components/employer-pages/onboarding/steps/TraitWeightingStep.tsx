import { useRef, useState } from 'react';
import { Sliders } from 'lucide-react';
import { TraitWeightingUI, defaultTraitWeights, type TraitWeights } from '../../TraitWeightingUI';
import { templateToWeights, type RoleTemplate } from '../../RoleTemplatePicker';

interface TraitWeightingStepProps {
  selectedTemplate: RoleTemplate | null;
  initialWeights?: Partial<TraitWeights>;
  businessId: string | null;
  onNext: (weights: TraitWeights) => void;
  onBack: () => void;
}

function mergeInitial(
  selectedTemplate: RoleTemplate | null,
  initialWeights: Partial<TraitWeights> | undefined,
): TraitWeights {
  const base = defaultTraitWeights();
  if (selectedTemplate) return templateToWeights(selectedTemplate);
  if (!initialWeights) return base;
  return {
    learning_velocity: initialWeights.learning_velocity ?? base.learning_velocity,
    ownership_follow_through: initialWeights.ownership_follow_through ?? base.ownership_follow_through,
    resilience: initialWeights.resilience ?? base.resilience,
    communication_confidence: initialWeights.communication_confidence ?? base.communication_confidence,
    relational_intelligence: initialWeights.relational_intelligence ?? base.relational_intelligence,
    motivational_fit: initialWeights.motivational_fit ?? base.motivational_fit,
  };
}

export function TraitWeightingStep({
  selectedTemplate,
  initialWeights,
  businessId,
  onNext,
  onBack,
}: TraitWeightingStepProps) {
  const [weights, setWeights] = useState<TraitWeights>(() =>
    mergeInitial(selectedTemplate, initialWeights),
  );
  const weightsRef = useRef(weights);
  weightsRef.current = weights;

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#7DBBFF]/10">
          <Sliders className="h-8 w-8 text-[#7DBBFF]" strokeWidth={1.5} />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-[#111827]">Configure trait weighting</h2>
        <p className="text-sm text-[#6B7280]">
          {selectedTemplate
            ? `Pre-populated from "${selectedTemplate.name}" template`
            : 'Allocate 100% across six trait dimensions'}
        </p>
      </div>

      {selectedTemplate && (
        <div className="mb-6 rounded-xl border border-[#7DBBFF]/20 bg-[#7DBBFF]/5 p-4">
          <p className="text-sm text-[#111827]">
            <span className="font-semibold">Selected template:</span> {selectedTemplate.name}
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Weights have been pre-configured based on this role. You can adjust them as needed.
          </p>
          {selectedTemplate.motivation_signal && (
            <p className="mt-1 text-xs text-[#7DBBFF]">Key motivation signals: {selectedTemplate.motivation_signal}</p>
          )}
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <TraitWeightingUI
          weights={weights}
          onChange={setWeights}
          onSave={() => onNext(weightsRef.current)}
          businessId={businessId}
          roleTemplateSlug={selectedTemplate?.id ?? null}
        />
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="rounded-[10px] border border-black/[0.08] px-6 py-3 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9F9FA]"
        >
          Back to role selection
        </button>
      </div>
    </div>
  );
}
