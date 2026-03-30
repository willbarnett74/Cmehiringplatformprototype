import { Briefcase, Check } from 'lucide-react';
import { useState } from 'react';
import { roleTemplates, type RoleTemplate } from '../../../../lib/roleTemplates';

interface RoleTemplateStepProps {
  initialSelection?: string | null;
  onNext: (templateId: string | null) => void;
  onBack: () => void;
}

export function RoleTemplateStep({ initialSelection, onNext, onBack }: RoleTemplateStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    initialSelection || null
  );

  const handleContinue = () => {
    onNext(selectedTemplate);
  };

  // Organize templates into 3 columns
  const columnsCount = 3;
  const templatesPerColumn = Math.ceil(roleTemplates.length / columnsCount);
  const columns = Array.from({ length: columnsCount }, (_, colIndex) =>
    roleTemplates.slice(
      colIndex * templatesPerColumn,
      (colIndex + 1) * templatesPerColumn
    )
  );

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

      {/* 3-Column Template Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {columns.map((columnTemplates, colIndex) => (
          <div key={colIndex} className="space-y-4">
            {columnTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={() => setSelectedTemplate(template.id)}
              />
            ))}
          </div>
        ))}
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

// Template Card Component
interface TemplateCardProps {
  template: RoleTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 border transition-all ${
        isSelected
          ? 'border-[#7DBBFF] bg-[#7DBBFF]/5 shadow-md'
          : 'border-black/[0.08] bg-white hover:border-[#7DBBFF]/50 hover:bg-[#F9F9FA]'
      }`}
      style={{ borderRadius: '12px' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h4 className="text-sm text-[#111827] font-semibold mb-1">{template.name}</h4>
          <p className="text-xs text-[#7DBBFF] font-medium">{template.category}</p>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#7DBBFF] flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <p className="text-xs text-[#6B7280] leading-relaxed">{template.description}</p>
    </button>
  );
}
