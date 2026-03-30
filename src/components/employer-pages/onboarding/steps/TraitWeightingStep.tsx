import { Sliders, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { TraitWeightingUI } from '../../TraitWeightingUI';
import { getRoleTemplateById } from '../../../../lib/roleTemplates';

interface TraitWeights {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

interface TraitWeightingStepProps {
  selectedTemplateId: string | null;
  initialWeights?: Partial<TraitWeights>;
  onNext: (weights: TraitWeights) => void;
  onBack: () => void;
}

export function TraitWeightingStep({
  selectedTemplateId,
  initialWeights,
  onNext,
  onBack,
}: TraitWeightingStepProps) {
  const template = selectedTemplateId ? getRoleTemplateById(selectedTemplateId) : null;
  const prepopulatedWeights = template?.trait_weights || initialWeights;

  const handleSave = (weights: TraitWeights) => {
    onNext(weights);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
          <Sliders className="w-8 h-8 text-[#7DBBFF]" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl text-[#111827] font-semibold mb-2">Configure Trait Weighting</h2>
        <p className="text-sm text-[#6B7280]">
          {template
            ? `Pre-populated from "${template.name}" template`
            : 'Allocate 100 points across six trait dimensions'}
        </p>
      </div>

      {template && (
        <div
          className="mb-6 p-4 bg-[#7DBBFF]/5 border border-[#7DBBFF]/20"
          style={{ borderRadius: '12px' }}
        >
          <p className="text-sm text-[#111827]">
            <span className="font-semibold">Selected Template:</span> {template.name}
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            Weights have been pre-configured based on this role. You can adjust them as needed.
          </p>
          {template.motivation_signals && template.motivation_signals.length > 0 && (
            <p className="text-xs text-[#7DBBFF] mt-1">
              Key motivation signals: {template.motivation_signals.join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <TraitWeightingUI
          initialWeights={prepopulatedWeights}
          onSave={handleSave}
        />
      </div>

      <div className="max-w-3xl mx-auto mt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium"
          style={{ borderRadius: '10px' }}
        >
          Back to Role Selection
        </button>
      </div>
    </div>
  );
}
