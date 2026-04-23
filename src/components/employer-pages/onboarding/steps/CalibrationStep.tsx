import { Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { upsertCalibration, type CalibrationCriteria } from '../../../../lib/calibration';

interface CalibrationStepProps {
  roleTemplateId: string | null;
  initialCriteria?: CalibrationCriteria;
  onNext: (criteria: CalibrationCriteria) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function CalibrationStep({
  roleTemplateId,
  initialCriteria,
  onNext,
  onBack,
  onSkip,
}: CalibrationStepProps) {
  const [criteria, setCriteria] = useState<CalibrationCriteria>(
    initialCriteria || {
      criterion_1: '',
      criterion_2: '',
      criterion_3: '',
      criterion_4: '',
      kpi_targets: '',
    }
  );

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const hasAnyInput = Object.values(criteria).some((value) => value && value.trim() !== '');

  const handleSave = () => {
    // Save to performance_calibrations_versions with version tracking
    void upsertCalibration(roleTemplateId, criteria);
    
    // Show brief success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      onNext(criteria);
    }, 1500);
  };

  const handleBack = () => {
    if (hasAnyInput) {
      setShowUnsavedWarning(true);
    } else {
      onBack();
    }
  };

  const handleSkipClick = () => {
    setShowSkipConfirmation(true);
  };

  const confirmSkip = () => {
    setShowSkipConfirmation(false);
    onSkip();
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
          <Target className="w-8 h-8 text-[#7DBBFF]" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl text-[#111827] font-semibold mb-2">
          Define What Great Looks Like
        </h2>
        <p className="text-sm text-[#6B7280]">
          Set performance calibration criteria (all fields optional)
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Criteria Fields */}
        <div className="space-y-5">
          {/* Criterion 1 */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-2">
              Criterion 1{' '}
              <span className="text-[#6B7280] font-normal">(Optional)</span>
            </label>
            <textarea
              value={criteria.criterion_1 || ''}
              onChange={(e) => setCriteria({ ...criteria, criterion_1: e.target.value })}
              placeholder="e.g., Consistently delivers high-quality code with minimal bugs"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-colors resize-none"
              style={{ borderRadius: '10px' }}
            />
          </div>

          {/* Criterion 2 */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-2">
              Criterion 2{' '}
              <span className="text-[#6B7280] font-normal">(Optional)</span>
            </label>
            <textarea
              value={criteria.criterion_2 || ''}
              onChange={(e) => setCriteria({ ...criteria, criterion_2: e.target.value })}
              placeholder="e.g., Proactively communicates blockers and seeks solutions"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-colors resize-none"
              style={{ borderRadius: '10px' }}
            />
          </div>

          {/* Criterion 3 */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-2">
              Criterion 3{' '}
              <span className="text-[#6B7280] font-normal">(Optional)</span>
            </label>
            <textarea
              value={criteria.criterion_3 || ''}
              onChange={(e) => setCriteria({ ...criteria, criterion_3: e.target.value })}
              placeholder="e.g., Collaborates effectively across teams"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-colors resize-none"
              style={{ borderRadius: '10px' }}
            />
          </div>

          {/* Criterion 4 */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-2">
              Criterion 4{' '}
              <span className="text-[#6B7280] font-normal">(Optional)</span>
            </label>
            <textarea
              value={criteria.criterion_4 || ''}
              onChange={(e) => setCriteria({ ...criteria, criterion_4: e.target.value })}
              placeholder="e.g., Demonstrates growth mindset and continuous learning"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-colors resize-none"
              style={{ borderRadius: '10px' }}
            />
          </div>

          {/* KPI Targets */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-2">
              KPI Targets{' '}
              <span className="text-[#6B7280] font-normal">(Optional)</span>
            </label>
            <textarea
              value={criteria.kpi_targets || ''}
              onChange={(e) => setCriteria({ ...criteria, kpi_targets: e.target.value })}
              placeholder="e.g., 90% sprint completion rate, <5% bug rate, 4+ peer review score"
              rows={3}
              className="w-full px-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-colors resize-none"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Info Box */}
        <div
          className="p-4 bg-[#F9F9FA] border border-black/[0.08]"
          style={{ borderRadius: '12px' }}
        >
          <p className="text-xs text-[#6B7280]">
            <span className="font-semibold text-[#111827]">Note:</span> These criteria help
            define performance expectations. All fields are optional, and you can update them
            later in Settings. Each save creates a new version, preserving history.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium"
            style={{ borderRadius: '10px' }}
          >
            Back
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkipClick}
              className="px-6 py-3 border border-black/[0.08] text-[#6B7280] hover:text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium"
              style={{ borderRadius: '10px' }}
            >
              Skip This Step
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors text-sm font-medium"
              style={{ borderRadius: '10px' }}
            >
              Save & Complete Setup
            </button>
          </div>
        </div>
      </form>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div
          className="fixed inset-0 bg-black/[0.5] flex items-center justify-center z-50"
          onClick={() => setShowUnsavedWarning(false)}
        >
          <div
            className="bg-white p-6 max-w-md w-full"
            style={{ borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base text-[#111827] font-semibold mb-1">
                  Unsaved Changes
                </h3>
                <p className="text-sm text-[#6B7280]">
                  You have unsaved calibration criteria. Going back will discard these changes.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/[0.08]">
              <button
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium"
                style={{ borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUnsavedWarning(false);
                  onBack();
                }}
                className="px-4 py-2 bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors text-sm font-medium"
                style={{ borderRadius: '10px' }}
              >
                Discard & Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Confirmation Modal */}
      {showSkipConfirmation && (
        <div
          className="fixed inset-0 bg-black/[0.5] flex items-center justify-center z-50"
          onClick={() => setShowSkipConfirmation(false)}
        >
          <div
            className="bg-white p-6 max-w-md w-full"
            style={{ borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-[#7DBBFF]" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base text-[#111827] font-semibold mb-1">
                  Skip Calibration Step?
                </h3>
                <p className="text-sm text-[#6B7280]">
                  You can complete this step later in Settings. Are you sure you want to skip?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/[0.08]">
              <button
                onClick={() => setShowSkipConfirmation(false)}
                className="px-4 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium"
                style={{ borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSkip}
                className="px-4 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors text-sm font-medium"
                style={{ borderRadius: '10px' }}
              >
                Skip & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div
          className="fixed inset-0 bg-black/[0.5] flex items-center justify-center z-50"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="bg-white p-6 max-w-md w-full flex flex-col items-center"
            style={{ borderRadius: '20px' }}
          >
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-[#10B981]" strokeWidth={2} />
            </div>
            <h3 className="text-lg text-[#111827] font-semibold mb-1">
              Calibration Saved!
            </h3>
            <p className="text-sm text-[#6B7280] text-center">
              Your performance criteria have been saved successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
