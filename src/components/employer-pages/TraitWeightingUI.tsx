import { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';

// Six trait dimensions — correct 6-dimension framework (Big Five / OCEAN + SDT)
const TRAIT_DIMENSIONS = [
  { key: 'learning_velocity', label: 'Learning Velocity' },
  { key: 'ownership_follow_through', label: 'Ownership & Follow-Through' },
  { key: 'resilience', label: 'Resilience' },
  { key: 'communication_confidence', label: 'Communication Confidence' },
  { key: 'relational_intelligence', label: 'Relational Intelligence' },
  { key: 'motivational_fit', label: 'Motivational Fit' },
] as const;

interface TraitWeights {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
}

interface TraitWeightingUIProps {
  onSave?: (weights: TraitWeights) => void;
  initialWeights?: Partial<TraitWeights>;
  callback?: () => void;
}

// Spec rule: 5% minimum floor per dimension (30 points pre-allocated, 70 free)
const MIN_WEIGHT = 5;

export function TraitWeightingUI({ onSave, initialWeights, callback }: TraitWeightingUIProps) {
  // Initialize weights - either from props or evenly distributed
  const [weights, setWeights] = useState<TraitWeights>(() => {
    if (initialWeights) {
      return {
        learning_velocity: initialWeights.learning_velocity ?? MIN_WEIGHT,
        ownership_follow_through: initialWeights.ownership_follow_through ?? MIN_WEIGHT,
        resilience: initialWeights.resilience ?? MIN_WEIGHT,
        communication_confidence: initialWeights.communication_confidence ?? MIN_WEIGHT,
        relational_intelligence: initialWeights.relational_intelligence ?? MIN_WEIGHT,
        motivational_fit: initialWeights.motivational_fit ?? MIN_WEIGHT,
      };
    }
    // Default: evenly distributed (~16-17 each)
    return {
      learning_velocity: 17,
      ownership_follow_through: 17,
      resilience: 17,
      communication_confidence: 17,
      relational_intelligence: 16,
      motivational_fit: 16,
    };
  });

  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 2000);
  };

  // Calculate running total
  const total = Object.values(weights).reduce((sum, val) => sum + val, 0);
  const isValid = total === 100;
  const remaining = 100 - total;

  // Check 5% minimum floor
  const belowFloor = TRAIT_DIMENSIONS.filter(t => weights[t.key] < MIN_WEIGHT);

  // Handle weight change with snap to 5s, enforcing 5% floor
  const handleWeightChange = (key: keyof TraitWeights, value: number) => {
    const snappedValue = Math.max(MIN_WEIGHT, Math.round(value / 5) * 5);
    setWeights((prev) => ({
      ...prev,
      [key]: snappedValue,
    }));
  };

  const handleSave = () => {
    if (!isValid || belowFloor.length > 0) return;

    console.log('Saving trait weights:', weights);
    onSave?.(weights);
    showToast('Trait weights saved successfully!');
  };

  const handleReset = () => {
    setWeights({
      learning_velocity: 17,
      ownership_follow_through: 17,
      resilience: 17,
      communication_confidence: 17,
      relational_intelligence: 16,
      motivational_fit: 16,
    });
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-1">Trait Weighting</h1>
        <p className="text-sm text-[#6B7280]">Allocate 100 points across six trait dimensions</p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
        <div className="flex items-center gap-3 mb-6">
          <Sliders className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
          <h3 className="text-base text-[#111827] font-semibold">Trait Allocation</h3>
        </div>

        {/* Constraint Feedback */}
        <div
          className={`mb-6 p-4 border transition-colors ${
            isValid
              ? 'bg-[#10B981]/5 border-[#10B981]/20'
              : remaining > 0
              ? 'bg-[#F59E0B]/5 border-[#F59E0B]/20'
              : 'bg-[#EF4444]/5 border-[#EF4444]/20'
          }`}
          style={{ borderRadius: '12px' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${
                isValid ? 'text-[#10B981]' :
                remaining > 0 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
              }`}>
                {isValid ? '✓ Perfect! All 100 points allocated' :
                 remaining > 0 ? `${remaining} points remaining` :
                 `${Math.abs(remaining)} points over limit`}
              </p>
              <p className="text-xs text-[#6B7280] mt-1">
                Running Total: {total} / 100
              </p>
            </div>
            {!isValid && (
              <div className="text-right">
                <p className="text-xs text-[#6B7280]">
                  Adjust sliders to reach exactly 100
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trait Sliders */}
        <div className="space-y-6 mb-8">
          {TRAIT_DIMENSIONS.map((trait) => {
            const value = weights[trait.key];
            const isBelowFloor = value < MIN_WEIGHT;
            return (
              <div key={trait.key}>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-[#111827] font-medium">
                    {trait.label}
                  </label>
                  <span className={`text-sm font-semibold min-w-[3rem] text-right ${
                    isBelowFloor ? 'text-[#EF4444]' : 'text-[#7DBBFF]'
                  }`}>
                    {value} pts
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min={MIN_WEIGHT}
                    max="100"
                    step="5"
                    value={value}
                    onChange={(e) => handleWeightChange(trait.key, parseInt(e.target.value))}
                    onMouseEnter={() => setTooltipVisible(trait.key)}
                    onMouseLeave={() => setTooltipVisible(null)}
                    className="w-full h-2 bg-[#F3F3F5] appearance-none cursor-pointer slider-thumb"
                    style={{
                      borderRadius: '4px',
                      border: '1px solid #b5b7bb',
                    }}
                  />

                  {/* Tooltip on hover */}
                  {tooltipVisible === trait.key && (
                    <div
                      className="absolute -top-10 bg-[#111827] text-white text-xs px-3 py-1.5 pointer-events-none"
                      style={{
                        borderRadius: '8px',
                        left: `${((value - MIN_WEIGHT) / (100 - MIN_WEIGHT)) * 100}%`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {value} points
                      <div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#111827]"
                      />
                    </div>
                  )}
                </div>

                {/* Visual progress bar for current value */}
                <div className="mt-2 h-1 bg-[#F3F3F5] overflow-hidden" style={{ borderRadius: '2px' }}>
                  <div
                    className="h-full bg-[#7DBBFF] transition-all duration-200"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sliders Constraint Info */}
        <div className="mb-6 p-4 bg-[#F9F9FA] border border-black/[0.08]" style={{ borderRadius: '12px' }}>
          <p className="text-xs text-[#6B7280]">
            <span className="font-semibold text-[#111827]">Allocation Rules:</span>
            <br />
            • Each dimension has a 5-point minimum floor (30 points pre-allocated)
            <br />
            • 70 free points to distribute across dimensions
            <br />
            • Values snap to increments of 5
            <br />
            • Total must equal exactly 100 to save
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-black/[0.08]">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium"
            style={{ borderRadius: '10px' }}
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-4 py-2 text-white text-sm font-medium transition-colors ${
              isValid
                ? 'bg-[#7DBBFF] hover:bg-[#6aabef] cursor-pointer'
                : 'bg-[#D1D5DB] cursor-not-allowed opacity-60'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Save Weights
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className="fixed bottom-5 right-5 bg-[#10B981] text-white px-4 py-2 rounded shadow-md"
          style={{ zIndex: 1000 }}
        >
          {toast.message}
        </div>
      )}

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7DBBFF;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7DBBFF;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          background: #6aabef;
          transform: scale(1.1);
        }

        .slider-thumb::-moz-range-thumb:hover {
          background: #6aabef;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
