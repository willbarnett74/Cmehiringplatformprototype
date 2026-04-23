import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ProfileBuilderLayoutProps {
  currentStep: number;
  stepStatuses: { [key: number]: 'active' | 'needsReview' | 'upToDate' };
  onStepChange: (stepId: number) => void;
  onBack: () => void;
  /** Sticky footer primary — calls into the active intake section via ref */
  onFooterContinue: () => void;
  children: ReactNode;
}

const steps = [
  {
    id: 1,
    label: 'Background Narrative',
    time: '5–7 min',
    subtitle:
      'Tell us about your professional background and a moment you are proud of. These become the qualitative layer over your trait scores — employers see this alongside your assessment results.',
  },
  {
    id: 2,
    label: 'How You Work',
    time: '7–9 min',
    subtitle:
      'We want to understand how you structure your day, how you prioritise, and how you prefer to operate within a team or independently.',
  },
  {
    id: 3,
    label: 'How You Think',
    time: '10–12 min',
    subtitle:
      'Describe how you approach new problems, learn unfamiliar subjects, and frame complex decisions.',
  },
  {
    id: 4,
    label: 'How You Handle Difficulty',
    time: '8–10 min',
    subtitle:
      'Share how you respond to setbacks, ambiguity, and pressure — resilience and recovery patterns.',
  },
  {
    id: 5,
    label: 'How You Relate to Others',
    time: '8–10 min',
    subtitle:
      'Collaboration, communication, and how you tend to show up with teammates and stakeholders.',
  },
  {
    id: 6,
    label: 'What Drives You',
    time: '8–10 min',
    subtitle:
      'Motivation, autonomy, mastery, impact, and recognition — what keeps you engaged over time.',
  },
  {
    id: 7,
    label: 'Career Direction',
    time: '4–5 min',
    subtitle: 'Role types, industries, and environments where you want to do your best work.',
  },
  {
    id: 8,
    label: 'Your Profile',
    time: '3–5 min',
    subtitle: 'Review and confirm your profile before employers see it.',
  },
] as const;

/** Matches CMe Portal v2.html ProfileBuilderPage */
const STATUS_DOT = {
  active: '#7dbbff',
  needsReview: '#F59E0B',
  upToDate: '#10B981',
} as const;

export function ProfileBuilderLayout({
  currentStep,
  stepStatuses,
  onStepChange,
  onBack,
  onFooterContinue,
  children,
}: ProfileBuilderLayoutProps) {
  const upToDateCount = Object.values(stepStatuses).filter((s) => s === 'upToDate').length;
  const readinessPercentage = Math.round((upToDateCount / steps.length) * 100);

  const stepUiStatus = (stepId: number): 'active' | 'needsReview' | 'upToDate' => {
    if (stepId === currentStep) return 'active';
    return stepStatuses[stepId] || 'needsReview';
  };

  const meta = steps.find((s) => s.id === currentStep);
  const nextMeta = steps.find((s) => s.id === currentStep + 1);
  const sectionPadded = currentStep < 10 ? `0${currentStep}` : String(currentStep);

  return (
    <div className="flex min-h-[calc(100vh-52px)] flex-col bg-[#fafafa] font-dashboard text-[#111827] antialiased">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Step sidebar — design_handoff / Portal v2 */}
        <aside className="flex h-auto w-[240px] shrink-0 flex-col overflow-hidden border-r border-black/[0.08] bg-white">
          <div className="border-b border-black/[0.07] px-5 pb-4 pt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-[11px] font-semibold tracking-[0.02em] text-[#111827]">Profile Readiness</p>
              <span className="font-dashboard-mono text-xs font-medium text-[#7dbbff]">{readinessPercentage}%</span>
            </div>
            <div className="h-0.5 overflow-hidden rounded-[1px] bg-[#EBEBEB]">
              <div
                className="h-full rounded-[1px] bg-[#7dbbff] transition-[width] duration-300 ease-out"
                style={{ width: `${readinessPercentage}%` }}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto py-3">
            <div className="relative pl-9 pr-2">
              <div
                className="absolute bottom-2 left-[27px] top-2 w-px bg-black/[0.07]"
                aria-hidden
              />
              {steps.map((step, idx) => {
                const st = stepUiStatus(step.id);
                const dotColor = STATUS_DOT[st];
                const isActive = st === 'active';
                const statusWord =
                  st === 'upToDate' ? 'Complete' : st === 'active' ? 'Editing now' : 'To complete';
                const num = step.id < 10 ? `0${step.id}` : String(step.id);

                return (
                  <div
                    key={step.id}
                    className={`relative ${idx < steps.length - 1 ? 'mb-1' : ''}`}
                  >
                    <div
                      className="absolute left-[-12px] top-2.5 z-[1] h-[9px] w-[9px] rounded-full border-2 border-white"
                      style={{ background: dotColor, boxShadow: `0 0 0 1px ${dotColor}` }}
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => onStepChange(step.id)}
                      className={`w-full rounded-[7px] py-2 pl-1 pr-4 text-left transition-colors ${
                        isActive ? 'bg-[#7dbbff]/10' : 'bg-transparent hover:bg-[#FAFAFA]'
                      }`}
                    >
                      <div className="mb-0.5 flex items-baseline justify-between gap-2">
                        <span
                          className={`text-[12.5px] leading-snug ${
                            isActive ? 'font-semibold text-[#111827]' : 'font-medium text-[#374151]'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span
                          className={`shrink-0 font-dashboard-mono text-[13px] font-normal tracking-[0.02em] ${
                            isActive ? 'text-[#7dbbff]' : 'text-[#C4C4CC]'
                          }`}
                        >
                          {num}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium" style={{ color: dotColor }}>
                        {statusWord}
                        <span className="font-normal text-[#C4C4CC]"> · {step.time}</span>
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-9">
            {meta ? (
              <div className="mb-7 border-b border-black/[0.08] pb-6">
                <div className="mb-2 flex flex-wrap items-center gap-2.5">
                  <span className="font-dashboard-mono text-[11px] font-normal tracking-[0.04em] text-[#9CA3AF]">
                    Section {sectionPadded} of 08
                  </span>
                  <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#D1D5DB]" aria-hidden />
                  <span className="text-[11px] text-[#9CA3AF]">{meta.time}</span>
                </div>
                <h1 className="mb-2 text-xl font-semibold tracking-[-0.02em] text-[#111827] sm:text-[20px]">
                  {meta.label}
                </h1>
                <p className="max-w-3xl text-[13.5px] leading-[1.65] text-[#6B7280]">{meta.subtitle}</p>
              </div>
            ) : null}

            <div className="w-full min-w-0">{children}</div>

            <div className="mt-7 w-full min-w-0 border-t border-black/[0.07] pt-5">
              <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
                <span className="font-semibold text-[#C4C4CC]">Note:</span> Your responses are not scored or judged.
                They form the qualitative layer employers see alongside your trait assessment — be honest and specific
                for the best results.
              </p>
            </div>
          </main>

          <footer className="flex shrink-0 items-center justify-between border-t border-black/[0.08] bg-white px-6 py-3.5 sm:px-11">
            <button
              type="button"
              onClick={onBack}
              disabled={currentStep === 1}
              className={`inline-flex items-center gap-1.5 rounded-[5px] border border-black/[0.11] bg-white px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                currentStep === 1
                  ? 'cursor-default opacity-50 text-[#C4C4CC]'
                  : 'cursor-pointer text-[#374151] hover:bg-[#FAFAFA]'
              }`}
            >
              <ArrowLeft className="h-[13px] w-[13px] shrink-0" strokeWidth={2} />
              Back
            </button>
            <div className="flex items-center gap-2.5">
              <span className="hidden text-xs text-[#9CA3AF] sm:inline">
                {nextMeta ? `Next: ${nextMeta.label}` : 'Final step'}
              </span>
              <button
                type="button"
                onClick={onFooterContinue}
                className="inline-flex items-center gap-1.5 rounded-[5px] border-none bg-[#7dbbff] px-[18px] py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[#6aabef]"
              >
                {currentStep === 8 ? 'Complete profile' : 'Save & continue'}
                <ArrowRight className="h-[13px] w-[13px] shrink-0 text-white" strokeWidth={2} />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
