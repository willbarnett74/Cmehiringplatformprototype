import { useState, useEffect } from 'react';
import type { MutableRefObject } from 'react';

interface IntakeSection8Props {
  onComplete: (data: { 
    section: number;
    responses: {
      S8Q1: {
        question_key: string;
        strengths: string[];
      };
      S8Q2?: {
        question_key: string;
        working_context: string;
        word_count: number;
      };
      S8Q3?: {
        question_key: string;
        testimonial?: {
          name: string;
          relationship: string;
          quote: string;
        };
      };
      S8Q4?: {
        question_key: string;
        anything_else: string;
        word_count: number;
      };
    };
    optional_fields_completed: boolean;
  }) => void;
  initialData?: any;
  submitRef?: MutableRefObject<(() => void) | null>;
  hideFooterButton?: boolean;
}

function parseSection8Saved(initialData: unknown) {
  const s = initialData as Record<string, Record<string, unknown>> | undefined;
  const empty = {
    q1Strength1: '',
    q1Strength2: '',
    q1Strength3: '',
    q2Context: '',
    q3Name: '',
    q3Relationship: '',
    q3Quote: '',
    q4Anything: '',
  };
  if (!s) return empty;

  const strsUnknown = s.S8Q1?.strengths;
  let q1Strength1 = '';
  let q1Strength2 = '';
  let q1Strength3 = '';
  if (Array.isArray(strsUnknown)) {
    const strs = strsUnknown.filter((x): x is string => typeof x === 'string');
    q1Strength1 = strs[0] ?? '';
    q1Strength2 = strs[1] ?? '';
    q1Strength3 = strs[2] ?? '';
  }

  const q2Context = typeof s.S8Q2?.working_context === 'string' ? s.S8Q2.working_context : '';
  const t = s.S8Q3?.testimonial as Record<string, unknown> | undefined;
  const q3Name = typeof t?.name === 'string' ? t.name : '';
  const q3Relationship = typeof t?.relationship === 'string' ? t.relationship : '';
  const q3Quote = typeof t?.quote === 'string' ? t.quote : '';
  const q4Anything = typeof s.S8Q4?.anything_else === 'string' ? s.S8Q4.anything_else : '';

  return { q1Strength1, q1Strength2, q1Strength3, q2Context, q3Name, q3Relationship, q3Quote, q4Anything };
}

export function IntakeSection8({
  onComplete,
  initialData,
  submitRef,
  hideFooterButton = false,
}: IntakeSection8Props) {
  const saved = parseSection8Saved(initialData);

  // S8Q1 - Strengths (required - 3 entries, max 80 words each)
  const [q1Strength1, setQ1Strength1] = useState(() => saved.q1Strength1);
  const [q1Strength2, setQ1Strength2] = useState(() => saved.q1Strength2);
  const [q1Strength3, setQ1Strength3] = useState(() => saved.q1Strength3);
  
  const strength1WordCount = q1Strength1.trim().split(/\s+/).filter(w => w.length > 0).length;
  const strength2WordCount = q1Strength2.trim().split(/\s+/).filter(w => w.length > 0).length;
  const strength3WordCount = q1Strength3.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  const strength1Valid = q1Strength1.trim().length > 0 && strength1WordCount <= 80;
  const strength2Valid = q1Strength2.trim().length > 0 && strength2WordCount <= 80;
  const strength3Valid = q1Strength3.trim().length > 0 && strength3WordCount <= 80;

  // S8Q2 - Working context (optional, up to 150 words)
  const [q2Context, setQ2Context] = useState(() => saved.q2Context);
  const q2WordCount = q2Context.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q2IsValid = q2WordCount === 0 || q2WordCount <= 150;

  // S8Q3 - Testimonial (optional, structured)
  const [q3Name, setQ3Name] = useState(() => saved.q3Name);
  const [q3Relationship, setQ3Relationship] = useState(() => saved.q3Relationship);
  const [q3Quote, setQ3Quote] = useState(() => saved.q3Quote);
  const q3QuoteWordCount = q3Quote.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q3IsValid = !q3Quote.trim() || (q3QuoteWordCount >= 30 && q3QuoteWordCount <= 80 && q3Name.trim() && q3Relationship.trim());
  const q3HasContent = q3Name.trim() || q3Relationship.trim() || q3Quote.trim();

  // S8Q4 - Anything else (optional, up to 150 words)
  const [q4Anything, setQ4Anything] = useState(() => saved.q4Anything);
  const q4WordCount = q4Anything.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q4IsValid = q4WordCount === 0 || q4WordCount <= 150;

  const canProceed = strength1Valid && strength2Valid && strength3Valid && q2IsValid && q3IsValid && q4IsValid;

  const handleNext = () => {
    if (!canProceed) return;

    // Check if any optional fields were completed
    const optionalFieldsCompleted = Boolean(
      q2Context.trim().length > 0 ||
        (q3Name.trim().length > 0 &&
          q3Relationship.trim().length > 0 &&
          q3Quote.trim().length > 0) ||
        q4Anything.trim().length > 0
    );

    const responseData: any = {
      S8Q1: {
        question_key: 'S8Q1',
        strengths: [q1Strength1.trim(), q1Strength2.trim(), q1Strength3.trim()],
      },
    };

    // Only include optional fields if they have content
    if (q2Context.trim().length > 0) {
      responseData.S8Q2 = {
        question_key: 'S8Q2',
        working_context: q2Context,
        word_count: q2WordCount,
      };
    }

    if (q3Name.trim() && q3Relationship.trim() && q3Quote.trim()) {
      responseData.S8Q3 = {
        question_key: 'S8Q3',
        testimonial: {
          name: q3Name.trim(),
          relationship: q3Relationship.trim(),
          quote: q3Quote.trim(),
        },
      };
    }

    if (q4Anything.trim().length > 0) {
      responseData.S8Q4 = {
        question_key: 'S8Q4',
        anything_else: q4Anything,
        word_count: q4WordCount,
      };
    }

    onComplete({
      section: 8,
      responses: responseData,
      optional_fields_completed: optionalFieldsCompleted,
    });
  };

  useEffect(() => {
    const next = parseSection8Saved(initialData);
    setQ1Strength1((prev) => (prev.trim() ? prev : next.q1Strength1));
    setQ1Strength2((prev) => (prev.trim() ? prev : next.q1Strength2));
    setQ1Strength3((prev) => (prev.trim() ? prev : next.q1Strength3));
    setQ2Context((prev) => (prev.trim() ? prev : next.q2Context));
    setQ3Name((prev) => (prev.trim() ? prev : next.q3Name));
    setQ3Relationship((prev) => (prev.trim() ? prev : next.q3Relationship));
    setQ3Quote((prev) => (prev.trim() ? prev : next.q3Quote));
    setQ4Anything((prev) => (prev.trim() ? prev : next.q4Anything));
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (submitRef) submitRef.current = null;
    };
  }, [submitRef]);

  if (hideFooterButton && submitRef) {
    submitRef.current = handleNext;
  }

  return (
    <div>
      {!hideFooterButton ? (
        <>
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="text-2xl text-[#111827] mb-2">
              SECTION 8 — Your Profile
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
              <span className="text-[#7DBBFF] font-medium">
                Dimensions scored: No trait scoring — qualitative human context for employer display
              </span>
              <span className="text-[#9CA3AF]">•</span>
              <span>Est. time: 3–5 min</span>
            </div>
          </div>

          {/* Framing */}
          <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
            <p className="text-sm text-[#111827] leading-relaxed italic">
              "Last section. This is your chance to add the human layer on top of everything you've shared — the things that don't fit neatly into questions but matter to who you are."
            </p>
          </div>
        </>
      ) : null}

      {/* S8Q1 - Strengths (required) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Strengths <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
            What are the three things you're genuinely best at? Not the three things that sound most impressive — the three things people who know your work well would actually say about you.
          </p>
          <div className="text-xs text-[#9CA3AF] italic bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
            The prompt is intentionally open — candidates may list technical skills, soft skills, or approaches. Multiple approaches are valid. Not scored. Flags significant mismatches with scored dimensions throughout.
          </div>
        </div>

        {/* Strength 1 */}
        <div className="mb-6">
          <label className="block text-sm text-[#111827] font-medium mb-2">
            Strength 1 <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            value={q1Strength1}
            onChange={(e) => setQ1Strength1(e.target.value)}
            placeholder="e.g., Framing complex problems in ways that make them actionable"
            className="w-full h-20 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
            style={{ borderRadius: '12px' }}
          />
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${strength1WordCount > 80 ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
              {strength1WordCount} / 80 words
            </span>
          </div>
        </div>

        {/* Strength 2 */}
        <div className="mb-6">
          <label className="block text-sm text-[#111827] font-medium mb-2">
            Strength 2 <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            value={q1Strength2}
            onChange={(e) => setQ1Strength2(e.target.value)}
            placeholder="e.g., Building trust quickly with people I don't know well"
            className="w-full h-20 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
            style={{ borderRadius: '12px' }}
          />
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${strength2WordCount > 80 ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
              {strength2WordCount} / 80 words
            </span>
          </div>
        </div>

        {/* Strength 3 */}
        <div className="mb-0">
          <label className="block text-sm text-[#111827] font-medium mb-2">
            Strength 3 <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            value={q1Strength3}
            onChange={(e) => setQ1Strength3(e.target.value)}
            placeholder="e.g., Staying calm and effective when things go wrong"
            className="w-full h-20 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
            style={{ borderRadius: '12px' }}
          />
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${strength3WordCount > 80 ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
              {strength3WordCount} / 80 words
            </span>
          </div>
        </div>
      </div>

      {/* S8Q2 - Working context (optional) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Working context <span className="text-[#9CA3AF] text-xs font-normal">(optional)</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Is there anything about how you work best — environment, pace, collaboration style, time of day, autonomy — that helps you perform at your best?
          </p>
          <p className="text-xs text-[#9CA3AF] mt-2 italic">
            No guidance beyond the question. Open field for things that don't fit elsewhere — communication preferences, conditions that help performance, working styles that take time to understand but produce strong results.
          </p>
        </div>

        <textarea
          value={q2Context}
          onChange={(e) => setQ2Context(e.target.value)}
          placeholder="Optional response..."
          className="w-full h-32 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />
        <div className="flex justify-end mt-2">
          <span className={`text-xs ${q2WordCount > 150 ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
            {q2WordCount} / 150 words
          </span>
        </div>
      </div>

      {/* S8Q3 - Testimonial (optional) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Testimonial <span className="text-[#9CA3AF] text-xs font-normal">(optional)</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
            Add a brief testimonial from someone who has worked with you — a manager, colleague, client, teacher, whoever. One or two sentences from them about what you're like to work with or what it's like to be taught by you, to coach, or supervise from any kind of work or volunteering, or anyone who has seen you in action in any context.
          </p>
          <div className="text-xs text-[#9CA3AF] italic bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
            Quote length: 30–80 words. Name and relationship both required if testimonial is submitted. Build note: testimonials flagged as unverified in employer view. Future version: verification API.
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Name {q3HasContent && <span className="text-[#EF4444]">*</span>}
            </label>
            <input
              type="text"
              value={q3Name}
              onChange={(e) => setQ3Name(e.target.value)}
              placeholder="e.g., Sarah Chen"
              className="w-full px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 transition-all"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Relationship {q3HasContent && <span className="text-[#EF4444]">*</span>}
            </label>
            <input
              type="text"
              value={q3Relationship}
              onChange={(e) => setQ3Relationship(e.target.value)}
              placeholder="e.g., Former manager at XYZ Corp"
              className="w-full px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 transition-all"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div>
            <label className="block text-sm text-[#6B7280] mb-2">
              Quote {q3HasContent && <span className="text-[#EF4444]">*</span>}
            </label>
            <textarea
              value={q3Quote}
              onChange={(e) => setQ3Quote(e.target.value)}
              placeholder="e.g., Alex has this rare ability to take genuinely complex situations and make them feel navigable without oversimplifying them. People trust them because they're consistently honest about what they know and what they don't."
              className="w-full h-24 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
              style={{ borderRadius: '12px' }}
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs ${
                q3QuoteWordCount > 0 && (q3QuoteWordCount < 30 || q3QuoteWordCount > 80) 
                  ? 'text-[#EF4444]' 
                  : 'text-[#6B7280]'
              }`}>
                {q3QuoteWordCount} / 80 words {q3QuoteWordCount > 0 && q3QuoteWordCount < 30 && '(min 30)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* S8Q4 - Anything else (optional) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Anything else <span className="text-[#9CA3AF] text-xs font-normal">(optional)</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Is there anything about your background, situation, or approach that you'd want a potential employer to know that hasn't come up yet?
          </p>
          <p className="text-xs text-[#9CA3AF] mt-2 italic">
            No prompt, no guidance, no examples. Exists for things candidates spontaneously raise — marginal identity, family circumstances, projects, gaps someone wants to contextualize on their own terms, disabilities or circumstances they want to flag.
          </p>
        </div>

        <textarea
          value={q4Anything}
          onChange={(e) => setQ4Anything(e.target.value)}
          placeholder="Optional response..."
          className="w-full h-32 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />
        <div className="flex justify-end mt-2">
          <span className={`text-xs ${q4WordCount > 150 ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
            {q4WordCount} / 150 words
          </span>
        </div>
      </div>

      {/* Conscientiousness note */}
      <div className="bg-[#F0F9FF] border border-[#7DBBFF]/20 p-4 mb-8 text-xs text-[#6B7280]" style={{ borderRadius: '12px' }}>
        <div className="flex items-start gap-2">
          <span className="text-[#7DBBFF]">✓</span>
          <p className="leading-relaxed">
            <span className="font-semibold text-[#111827]">Conscientiousness signal:</span> Whether a candidate completed the optional fields (S8Q2, Q3, Q4) is stored as <span className="font-mono text-xs">optional_fields_completed</span> boolean on candidate_profiles. Completing optional fields when not required is a meaningful Conscientiousness signal — employers can see this in the candidate profile display.
          </p>
        </div>
      </div>

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
            Complete Intake Flow →
          </button>
        </div>
      ) : null}
    </div>
  );
}