import { ReactNode } from 'react';

interface ProfileBuilderLayoutProps {
  currentStep: number;
  stepStatuses: { [key: number]: 'active' | 'needsReview' | 'upToDate' };
  onStepChange: (stepId: number) => void;
  onBack: () => void;
  onNext: () => void;
  children: ReactNode;
}

const steps = [
  { id: 1, label: 'Background Narrative', time: '5–7 min' },
  { id: 2, label: 'How You Work', time: '7–9 min' },
  { id: 3, label: 'How You Think', time: '10–12 min' },
  { id: 4, label: 'How You Handle Difficulty', time: '8–10 min' },
  { id: 5, label: 'How You Relate to Others', time: '8–10 min' },
  { id: 6, label: 'What Drives You', time: '8–10 min' },
  { id: 7, label: 'Career Direction', time: '4–5 min' },
  { id: 8, label: 'Your Profile', time: '3–5 min' },
];

const statusConfig = {
  active: {
    color: '#7DBBFF',
    label: 'Currently editing',
    textColor: 'text-[#7dbbff]',
    bgColor: 'bg-[#7dbbff]',
  },
  needsReview: {
    color: '#FBBF24',
    label: 'Add more details',
    textColor: 'text-[#FBBF24]',
    bgColor: 'bg-[#FBBF24]',
  },
  upToDate: {
    color: '#10B981',
    label: 'Ready to edit anytime',
    textColor: 'text-[#10B981]',
    bgColor: 'bg-[#10B981]',
  },
};

export function ProfileBuilderLayout({
  currentStep,
  stepStatuses,
  onStepChange,
  onBack,
  onNext,
  children,
}: ProfileBuilderLayoutProps) {
  // Calculate readiness based on upToDate steps
  const upToDateCount = Object.values(stepStatuses).filter(status => status === 'upToDate').length;
  const readinessPercentage = Math.round((upToDateCount / steps.length) * 100);
  
  const currentStepData = steps.find(s => s.id === currentStep);
  const nextStepData = steps.find(s => s.id === currentStep + 1);

  const getStepStatus = (stepId: number): 'active' | 'needsReview' | 'upToDate' => {
    if (stepId === currentStep) return 'active';
    return stepStatuses[stepId] || 'needsReview';
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Left Sidebar Navigation */}
      <aside className="w-[260px] bg-white border-r border-black/[0.08] sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h3 className="text-sm text-[#111827] font-semibold mb-1">Profile Builder</h3>
            <p className="text-xs text-[#6B7280]">Refine and update anytime</p>
          </div>

          {/* Steps List */}
          <nav className="space-y-2">
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              const statusInfo = statusConfig[status];
              const isActive = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => onStepChange(step.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 transition-all text-left ${
                    isActive ? 'bg-[#7dbbff]/10' : 'hover:bg-[#F9F9FA]'
                  }`}
                  style={{ borderRadius: '10px' }}
                >
                  {/* Status Dot */}
                  <div className="shrink-0 mt-0.5">
                    <div 
                      className={`${statusInfo.bgColor}`}
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%' 
                      }} 
                    />
                  </div>

                  {/* Label and Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium ${statusInfo.textColor}`}>{step.id}</span>
                      <span className={`text-xs font-medium truncate ${statusInfo.textColor}`}>{step.label}</span>
                    </div>
                    <p className="text-xs text-[#6B7280]">{statusInfo.label}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Progress Bar */}
        <div className="bg-white border-b border-black/[0.08] px-8 py-4 sticky top-0 z-10">
          <div className="mb-2">
            <p className="text-xs text-[#111827] font-medium">Profile Readiness</p>
            <p className="text-xs text-[#6B7280] mt-1">Your profile evolves as you refine it — readiness score updates with every change.</p>
          </div>
          <div className="w-full bg-[#f5f5f5] overflow-hidden mt-3" style={{ height: '4px', borderRadius: '2px' }}>
            <div
              className="h-full bg-[#7dbbff] transition-all duration-300"
              style={{ width: `${readinessPercentage}%` }}
            />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-8">
            {children}
          </div>
        </main>

        {/* Bottom CTA Card */}
        <div className="bg-white border-t border-[#E5E7EB] px-8 py-4 sticky bottom-0">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-[#7dbbff] hover:bg-[#7dbbff]/10 transition-colors"
              style={{ borderRadius: '8px' }}
            >
              <span className="text-sm font-medium">← Back</span>
            </button>

            {/* Next Button */}
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors"
              style={{ borderRadius: '8px' }}
            >
              <span className="text-sm font-medium">
                {nextStepData ? `Next: ${nextStepData.label} →` : 'Complete →'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}