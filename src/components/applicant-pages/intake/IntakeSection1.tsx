import { useState, useEffect } from 'react';
import type { MutableRefObject } from 'react';

interface IntakeSection1Props {
  onComplete: (data: { 
    section: number;
    responses: {
      S1Q1: {
        question_key: string;
        narrative: string;
        word_count: number;
      };
      S1Q2: {
        question_key: string;
        narrative: string;
        word_count: number;
      };
    };
  }) => void;
  initialData?: { 
    S1Q1?: { narrative: string };
    S1Q2?: { narrative: string };
  };
  /** Flat chrome matching CMe Portal v2 / design handoff */
  layoutVariant?: 'default' | 'handoff';
  submitRef?: MutableRefObject<(() => void) | null>;
  hideFooterButton?: boolean;
}

export function IntakeSection1({
  onComplete,
  initialData,
  layoutVariant = 'default',
  submitRef,
  hideFooterButton = false,
}: IntakeSection1Props) {
  // S1Q1 - Background narrative
  const [narrativeQ1, setNarrativeQ1] = useState(initialData?.S1Q1?.narrative || '');
  const wordCountQ1 = narrativeQ1.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minWordsQ1 = 80;
  const maxWordsQ1 = 200;
  const softCapWarningQ1 = 180;
  const isValidQ1 = wordCountQ1 >= minWordsQ1 && wordCountQ1 <= maxWordsQ1;
  const showSoftWarningQ1 = wordCountQ1 >= softCapWarningQ1 && wordCountQ1 < maxWordsQ1;
  const isOverMaxQ1 = wordCountQ1 > maxWordsQ1;

  // S1Q2 - Proud moment
  const [narrativeQ2, setNarrativeQ2] = useState(initialData?.S1Q2?.narrative || '');
  const wordCountQ2 = narrativeQ2.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minWordsQ2 = 40;
  const maxWordsQ2 = 120;
  const isValidQ2 = wordCountQ2 >= minWordsQ2 && wordCountQ2 <= maxWordsQ2;
  const isOverMaxQ2 = wordCountQ2 > maxWordsQ2;

  // Both questions must be valid to proceed
  const canProceed = isValidQ1 && isValidQ2;

  const handleNext = () => {
    if (canProceed) {
      onComplete({ 
        section: 1,
        responses: {
          S1Q1: {
            question_key: 'S1Q1',
            narrative: narrativeQ1,
            word_count: wordCountQ1
          },
          S1Q2: {
            question_key: 'S1Q2',
            narrative: narrativeQ2,
            word_count: wordCountQ2
          }
        }
      });
    }
  };

  useEffect(() => {
    return () => {
      if (submitRef) submitRef.current = null;
    };
  }, [submitRef]);

  if (hideFooterButton && submitRef) {
    submitRef.current = handleNext;
  }

  if (layoutVariant === 'handoff') {
    return (
      <div className="flex flex-col gap-7">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
            Your professional background
          </label>
          <p className="mb-2.5 text-xs leading-[1.55] text-[#9CA3AF]">
            Describe your career trajectory, the types of roles you have held, and what you have built or led. 3–5
            sentences.
          </p>
          <textarea
            value={narrativeQ1}
            onChange={(e) => setNarrativeQ1(e.target.value)}
            placeholder="I have spent the last 7 years working in product management across B2B SaaS companies…"
            rows={5}
            className="w-full resize-y rounded-[5px] border border-black/[0.12] bg-white px-3.5 py-3 text-[13.5px] leading-[1.65] text-[#111827] placeholder:text-[#9CA3AF] transition-colors focus:border-[#7dbbff] focus:outline-none"
          />
          <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2">
            <div className="text-xs text-[#6B7280]">
              Required: {minWordsQ1}–{maxWordsQ1} words
              {showSoftWarningQ1 ? (
                <span className="ml-2 font-medium text-[#F59E0B]">Approaching upper range</span>
              ) : null}
              {isOverMaxQ1 ? <span className="ml-2 font-medium text-[#EF4444]">Maximum exceeded</span> : null}
            </div>
            <span className="font-dashboard-mono text-[11px] text-[#C4C4CC]">{narrativeQ1.length} chars</span>
          </div>
          {wordCountQ1 < minWordsQ1 ? (
            <p className="mt-1 text-xs text-[#6B7280]">
              {minWordsQ1 - wordCountQ1} more {minWordsQ1 - wordCountQ1 === 1 ? 'word' : 'words'} required
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
            Your proudest professional moment
          </label>
          <p className="mb-2.5 text-xs leading-[1.55] text-[#9CA3AF]">
            A specific situation where you did something you are genuinely proud of. Focus on what you did, the
            challenge, and the outcome.
          </p>
          <textarea
            value={narrativeQ2}
            onChange={(e) => setNarrativeQ2(e.target.value)}
            placeholder="The project I am most proud of was…"
            rows={5}
            className="w-full resize-y rounded-[5px] border border-black/[0.12] bg-white px-3.5 py-3 text-[13.5px] leading-[1.65] text-[#111827] placeholder:text-[#9CA3AF] transition-colors focus:border-[#7dbbff] focus:outline-none"
          />
          <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2">
            <div className="text-xs text-[#6B7280]">
              Required: {minWordsQ2}–{maxWordsQ2} words
              {isOverMaxQ2 ? <span className="ml-2 font-medium text-[#EF4444]">Maximum exceeded</span> : null}
            </div>
            <span className="font-dashboard-mono text-[11px] text-[#C4C4CC]">{narrativeQ2.length} chars</span>
          </div>
          {wordCountQ2 < minWordsQ2 ? (
            <p className="mt-1 text-xs text-[#6B7280]">
              {minWordsQ2 - wordCountQ2} more {minWordsQ2 - wordCountQ2 === 1 ? 'word' : 'words'} required
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#111827] mb-2">
          SECTION 1 — Background Narrative
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
          <span className="text-[#7DBBFF] font-medium">
            Dimension scored: LLM consistency signals only (not primary scoring)
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span>Est. time: 5–7 min</span>
        </div>
        <div className="text-sm text-[#6B7280] leading-relaxed bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '12px' }}>
          <p className="mb-2">
            Section 1 contains two required free-text prompts. No structured questions, no dimension scoring.
          </p>
          <p>
            The LLM processes both responses to generate soft trait signals used exclusively for consistency checking against Sections 2–6.
          </p>
        </div>
      </div>

      {/* Framing shown at section start */}
      <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
        <p className="text-sm text-[#111827] leading-relaxed italic">
          "This is about you — your background, your experiences, and what you've discovered about yourself through work or study. Write in your own voice. There are no right answers."
        </p>
      </div>

      {/* S1Q1 - Background narrative */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-4">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Background narrative <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-1">
            Tell us a bit about yourself — your background, the kind of work you do, and what you've found you're naturally good at.
          </p>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Don't worry about making it formal — write it how you'd say it.
          </p>
        </div>

        <textarea
          value={narrativeQ1}
          onChange={(e) => setNarrativeQ1(e.target.value)}
          placeholder="Example: I've spent most of my career in early-stage startups, mostly product and ops work. What I've learned is I'm good at taking messy problems and finding a clean path through them — whether that's building systems that scale or just figuring out what actually matters when everything feels urgent. I tend to work best when there's space to experiment but still clear accountability..."
          className="w-full h-56 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />

        {/* Word count and validation feedback */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280]">
                Required: {minWordsQ1}–{maxWordsQ1} words
              </span>
              {showSoftWarningQ1 && (
                <span className="text-[#F59E0B] font-medium">
                  ⚠ Approaching character limit
                </span>
              )}
              {isOverMaxQ1 && (
                <span className="text-[#EF4444] font-medium">
                  Maximum exceeded
                </span>
              )}
            </div>
            <div className={`font-medium tabular-nums ${
              wordCountQ1 < minWordsQ1 
                ? 'text-[#9CA3AF]' 
                : isValidQ1 
                  ? 'text-[#10B981]' 
                  : 'text-[#EF4444]'
            }`}>
              {wordCountQ1} / {maxWordsQ1} words
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${
                wordCountQ1 < minWordsQ1
                  ? 'bg-[#9CA3AF]'
                  : isValidQ1
                    ? 'bg-[#10B981]'
                    : 'bg-[#EF4444]'
              }`}
              style={{ width: `${Math.min((wordCountQ1 / maxWordsQ1) * 100, 100)}%` }}
            />
          </div>

          {wordCountQ1 < minWordsQ1 && (
            <p className="text-xs text-[#6B7280]">
              {minWordsQ1 - wordCountQ1} more {minWordsQ1 - wordCountQ1 === 1 ? 'word' : 'words'} required
            </p>
          )}
        </div>
      </div>

      {/* S1Q2 - Proud moment */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-4">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Proud moment <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
            Describe a time you did something you were genuinely proud of — at work, in study, in a team, or on a personal project. What was the situation and what did you do?
          </p>
          
          {/* Three-tier framing */}
          <div className="bg-[#F9FAFB] border border-black/[0.06] p-3 mb-4 text-xs text-[#6B7280] leading-relaxed" style={{ borderRadius: '8px' }}>
            <p className="mb-1">
              <span className="font-medium text-[#111827]">Experienced-professional context preferred</span> but any situation welcome.
            </p>
            <p className="mb-1">
              Early career stuff, sport, project, or any context.
            </p>
            <p>
              No experience, any situation you cared about.
            </p>
          </div>
        </div>

        <textarea
          value={narrativeQ2}
          onChange={(e) => setNarrativeQ2(e.target.value)}
          placeholder="Example: I led a project to redesign our company's onboarding flow. The existing process had a 60% drop-off rate and no one knew why. I organized user interviews, mapped the journey, identified three critical friction points, and rebuilt the flow from scratch. Within two months, we reduced drop-off to 22% and improved NPS by 40 points. What made me proud wasn't just the numbers — it was that I pushed for research when everyone wanted to jump straight to solutions..."
          className="w-full h-48 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />

        {/* Word count and validation feedback */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280]">
                Required: {minWordsQ2}–{maxWordsQ2} words
              </span>
              {isOverMaxQ2 && (
                <span className="text-[#EF4444] font-medium">
                  Maximum exceeded
                </span>
              )}
            </div>
            <div className={`font-medium tabular-nums ${
              wordCountQ2 < minWordsQ2 
                ? 'text-[#9CA3AF]' 
                : isValidQ2 
                  ? 'text-[#10B981]' 
                  : 'text-[#EF4444]'
            }`}>
              {wordCountQ2} / {maxWordsQ2} words
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${
                wordCountQ2 < minWordsQ2
                  ? 'bg-[#9CA3AF]'
                  : isValidQ2
                    ? 'bg-[#10B981]'
                    : 'bg-[#EF4444]'
              }`}
              style={{ width: `${Math.min((wordCountQ2 / maxWordsQ2) * 100, 100)}%` }}
            />
          </div>

          {wordCountQ2 < minWordsQ2 && (
            <p className="text-xs text-[#6B7280]">
              {minWordsQ2 - wordCountQ2} more {minWordsQ2 - wordCountQ2 === 1 ? 'word' : 'words'} required
            </p>
          )}
        </div>
      </div>

      {/* Combined Rules table - shown collapsed/as reference */}
      <details className="mb-8 bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '12px' }}>
        <summary className="text-sm text-[#6B7280] font-medium cursor-pointer select-none">
          Validation Rules (Both Questions)
        </summary>
        
        {/* S1Q1 Rules */}
        <div className="mt-4 mb-6">
          <h4 className="text-xs font-semibold text-[#111827] mb-2">Background narrative</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black/[0.06]">
                <th className="text-left py-2 pr-4 text-[#6B7280] font-medium">Rule</th>
                <th className="text-left py-2 text-[#6B7280] font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="text-[#111827]">
              <tr className="border-b border-black/[0.04]">
                <td className="py-2 pr-4 text-[#6B7280]">Minimum</td>
                <td className="py-2">80 words. Live counter shown. Submission blocked below minimum.</td>
              </tr>
              <tr className="border-b border-black/[0.04]">
                <td className="py-2 pr-4 text-[#6B7280]">Maximum</td>
                <td className="py-2">200 words. Soft cap with character warning at 180 words.</td>
              </tr>
              <tr className="border-b border-black/[0.04]">
                <td className="py-2 pr-4 text-[#6B7280]">Storage</td>
                <td className="py-2">intake_responses, section=1, question_key='S1Q1'. Raw use only.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-[#6B7280]">LLM use</td>
                <td className="py-2">
                  Processes into soft signals, which dimensions does this person spontaneously reference? 
                  Flags significant inconsistencies with later structured scores. Not scored directly.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* S1Q2 Rules */}
        <div>
          <h4 className="text-xs font-semibold text-[#111827] mb-2">Proud moment</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black/[0.06]">
                <th className="text-left py-2 pr-4 text-[#6B7280] font-medium">Rule</th>
                <th className="text-left py-2 text-[#6B7280] font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="text-[#111827]">
              <tr className="border-b border-black/[0.04]">
                <td className="py-2 pr-4 text-[#6B7280]">Three-tier framing</td>
                <td className="py-2">Experienced-professional context preferred but any situation welcome. Early career stuff, sport, project, or any context. No experience, any situation you cared about.</td>
              </tr>
              <tr className="border-b border-black/[0.04]">
                <td className="py-2 pr-4 text-[#6B7280]">Minimum</td>
                <td className="py-2">40 words. Live counter shown.</td>
              </tr>
              <tr className="border-b border-black/[0.04]">
                <td className="py-2 pr-4 text-[#6B7280]">Maximum</td>
                <td className="py-2">120 words.</td>
              </tr>
              <tr className="border-b border-black/[0.04]">
                <td className="py-2 pr-4 text-[#6B7280]">Storage</td>
                <td className="py-2">intake_responses, section=1, question_key='S1Q2'.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-[#6B7280]">LLM use</td>
                <td className="py-2">
                  Ownership signal: does the narrative centre on personal action or collective environment/pacing? 
                  Velocity signal: energy level, pacing. How they describe something stiff? Used for consistency check only.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>

      {/* Navigation */}
      {!hideFooterButton ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`px-6 py-3 text-sm font-medium transition-all shadow-sm ${
              canProceed
                ? 'bg-[#7DBBFF] text-white hover:bg-[#6AABEF] hover:shadow-md'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
            style={{ borderRadius: '12px' }}
          >
            Continue to Next Section →
          </button>
        </div>
      ) : null}
    </div>
  );
}