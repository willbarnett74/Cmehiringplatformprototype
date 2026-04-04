import { Briefcase } from 'lucide-react';
import { useState } from 'react';
import { RoleTemplatePicker, type RoleTemplate } from '../../RoleTemplatePicker';

interface RoleTemplateStepProps {
  initialSelection?: string | null;
  onNext: (template: RoleTemplate | null) => void;
  onBack: () => void;
}

export function RoleTemplateStep({ initialSelection, onNext, onBack }: RoleTemplateStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null);

  const handleContinue = () => {
    onNext(selectedTemplate);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-[#7DBBFF]" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl text-[#111827] font-semibold mb-2">Select a Role Template</h2>
        <p className="text-sm text-[#6B7280]">
          Choose a template to pre-populate trait weightings in the next step
        </p>
      </div>

      <div className="mb-6">
        <RoleTemplatePicker
          onSelect={setSelectedTemplate}
          selectedId={selectedTemplate?.id ?? initialSelection ?? undefined}
        />
      </div>

      {/* Skip Option */}
      <div className="text-center mb-6">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          {selectedTemplate === null ? (
            <span className="font-medium text-[#7DBBFF]">
              ✓ No template selected (equal distribution will be used)
            </span>
          ) : (
            'Skip template selection'
          )}
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 max-w-xl mx-auto">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium"
          style={{ borderRadius: '10px' }}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 px-6 py-3 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors text-sm font-medium"
          style={{ borderRadius: '10px' }}
        >
          Continue to Trait Weighting
        </button>
      </div>
    </div>
  );
}
