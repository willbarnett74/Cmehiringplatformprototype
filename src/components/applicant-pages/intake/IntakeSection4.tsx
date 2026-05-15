import { useState, useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

const SETBACK_SYSTEM_PROMPT = `You are scoring a candidate's reflective response to a hiring assessment prompt. They were asked to describe a time something went wrong on a piece of work that mattered to them — what happened, what they did, and how they reflect on it now.

Score the response on four criteria, each 1-5. Return ONLY a JSON object with these exact keys:
{ "ownership_of_outcome": N, "recovery_action": N, "learning_extracted": N, "emotional_regulation": N }

ownership_of_outcome (1-5)
  5 = takes clear personal accountability, describes their own decisions and actions
  3 = mentions own role but distributes responsibility across team/circumstances
  1 = blames external factors, describes themselves as a passive participant or victim

recovery_action (1-5)
  5 = describes a constructive recovery action they took (re-engaged, fixed it, found a path forward)
  3 = describes processing it but unclear what action followed
  1 = passive, avoidant, or no recovery described — situation just ended

learning_extracted (1-5)
  5 = articulates a specific transferable lesson, shows insight into pattern or principle
  3 = mentions learning generically ("I learned a lot")
  1 = no insight extracted, or framing suggests they'd do nothing differently

emotional_regulation (1-5)
  5 = composed reflection, processed the difficulty, can describe it without rumination or blame
  3 = some lingering frustration but mostly balanced
  1 = ruminative, blaming, or emotionally dysregulated in the telling

Important: this is a reflection on a real past event. Don't penalise candidates for events going badly — score how they handled and integrated the experience. A candidate describing a clean recovery from a serious failure scores high; a candidate describing a minor inconvenience with bitterness scores low.

Return only the JSON object. No preamble, no commentary.`;

const SETBACK_LLM_KEYS = [
  'ownership_of_outcome',
  'recovery_action',
  'learning_extracted',
  'emotional_regulation',
] as const;

function normalizeSetbackLlmScores(data: unknown): Record<string, number> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const k of SETBACK_LLM_KEYS) {
    const v = o[k];
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    out[k] = v;
  }
  return out;
}

function parseSection4Saved(initialData: unknown) {
  const s = initialData as Record<string, Record<string, unknown>> | undefined;
  if (!s) {
    return {
      q1Choice: null as string | null,
      q2Choice: null as string | null,
      q3Choice: null as string | null,
      q4Choice: null as string | null,
      q5Narrative: '',
      q6Narrative: '',
    };
  }
  return {
    q1Choice: typeof s.S4Q1?.option_id === 'string' ? s.S4Q1.option_id : null,
    q2Choice: typeof s.S4Q2?.option_id === 'string' ? s.S4Q2.option_id : null,
    q3Choice: typeof s.S4Q3?.option_id === 'string' ? s.S4Q3.option_id : null,
    q4Choice: typeof s.S4Q4?.option_id === 'string' ? s.S4Q4.option_id : null,
    q5Narrative: typeof s.S4Q5?.narrative === 'string' ? s.S4Q5.narrative : '',
    q6Narrative: typeof s.S4Q6?.narrative === 'string' ? s.S4Q6.narrative : '',
  };
}

interface IntakeSection4Props {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: unknown;
  submitRef?: MutableRefObject<(() => void) | null>;
  hideFooterButton?: boolean;
  onQ5ScoringBusyChange?: (busy: boolean) => void;
  readOnly?: boolean;
}

export function IntakeSection4({
  onComplete,
  initialData,
  submitRef,
  hideFooterButton = false,
  onQ5ScoringBusyChange,
  readOnly = false,
}: IntakeSection4Props) {
  const saved = parseSection4Saved(initialData);

  const [q1Choice, setQ1Choice] = useState<string | null>(() => saved.q1Choice);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q2Choice, setQ2Choice] = useState<string | null>(() => saved.q2Choice);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q3Choice, setQ3Choice] = useState<string | null>(() => saved.q3Choice);
  const [q3ShuffledOptions, setQ3ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q4Choice, setQ4Choice] = useState<string | null>(() => saved.q4Choice);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q5Narrative, setQ5Narrative] = useState(() => saved.q5Narrative);
  const [q5IsScoring, setQ5IsScoring] = useState(false);
  const [q5ScoreError, setQ5ScoreError] = useState<string | null>(null);
  const scoreFailCountRef = useRef(0);
  const scoringInFlightRef = useRef(false);

  const [q6Narrative, setQ6Narrative] = useState(() => saved.q6Narrative);
  const q6WordCount = q6Narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q6MinWords = 40;
  const q6MaxWords = 80;
  const q6IsValid = q6WordCount >= q6MinWords && q6WordCount <= q6MaxWords;
  const q6IsOverMax = q6WordCount > q6MaxWords;

  const q5WordCount = q5Narrative.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minWordsQ5 = 60;
  const maxWordsQ5 = 120;
  const softCapWarningQ5 = 108;
  const isValidQ5 = q5WordCount >= minWordsQ5 && q5WordCount <= maxWordsQ5;
  const showSoftWarningQ5 = q5WordCount >= softCapWarningQ5 && q5WordCount < maxWordsQ5;
  const isOverMaxQ5 = q5WordCount > maxWordsQ5;

  useEffect(() => {
    const q1Options = [
      { id: 'setback-a', text: 'Disappointing but moves through it fairly naturally. Takes what can be learned and refocuses — sitting with it too long stops the lesson from being applied.', scores: { resilience: 4, ownership_follow_through: 3 } },
      { id: 'setback-b', text: 'Hits hard and takes genuine time to work through. Cares deeply about the work and significant setbacks stay — that investment is part of what drives doing things well in the first place.', scores: { resilience: 1, ownership_follow_through: 5 } },
      { id: 'setback-c', text: 'Feels the disappointment and moves through it quickly. More interested in what can be taken from it than in sitting with how it felt — fast processing is more useful than extended reflection.', scores: { resilience: 5, ownership_follow_through: 2 } },
      { id: 'setback-d', text: 'Feels it and is affected for a period. Once worked through the emotional side, able to look at what to do differently and move forward with that understanding.', scores: { resilience: 2, ownership_follow_through: 4 } },
    ];
    setQ1ShuffledOptions([...q1Options].sort(() => Math.random() - 0.5));

    const q2Options = [
      { id: 'wrong-a', text: 'Acknowledges their part honestly and takes time to understand what to do differently. Doesn\'t rush past it but doesn\'t carry it indefinitely — once properly reflected, able to move on.', scores: { ownership_follow_through: 4, resilience: 3 } },
      { id: 'wrong-b', text: 'Identifies what to do differently and moves quickly to applying it. Extended analysis of what went wrong is less useful than changing approach going forward.', scores: { ownership_follow_through: 3, resilience: 5 } },
      { id: 'wrong-c', text: 'Analyses their contribution thoroughly and doesn\'t move on quickly. Sitting with what went wrong — really understanding their part in it — is what stops making the same mistake again.', scores: { ownership_follow_through: 5, resilience: 1 } },
      { id: 'wrong-d', text: 'Looks at what could have been done better, takes the lesson, and refocuses. Would rather over-own than under-own but tries not to dwell longer than is useful.', scores: { ownership_follow_through: 4, resilience: 4 } },
    ];
    setQ2ShuffledOptions([...q2Options].sort(() => Math.random() - 0.5));

    const q3Options = [
      { id: 'press-a', text: 'Pressure tends to lift output. The focus and urgency of high-stakes situations often produces better work — accessing a level of concentration that isn\'t always present in lower-pressure conditions.', scores: { resilience: 5, motivational_fit_autonomy: 1 } },
      { id: 'press-b', text: 'Pressure affects output somewhat. Delivers, but it\'s not always the best work — performs more consistently when there\'s room to work at a natural pace.', scores: { resilience: 2, motivational_fit_autonomy: 4 } },
      { id: 'press-c', text: 'Stays fairly consistent under pressure. Feels it but it doesn\'t significantly change what gets produced — tends to deliver regardless of conditions.', scores: { resilience: 4, motivational_fit_autonomy: 2 } },
      { id: 'press-d', text: 'Best work comes from having space and time to work properly. When external urgency is high, output suffers — performs better when able to set own pace without pressure shaping how the work gets done.', scores: { resilience: 1, motivational_fit_autonomy: 5 } },
    ];
    setQ3ShuffledOptions([...q3Options].sort(() => Math.random() - 0.5));

    const q4Options = [
      { id: 'commit-a', text: 'Flags early if something is becoming harder than expected. Prefers to reset expectations proactively rather than quietly struggle — communicating difficulty early is part of managing a commitment well.', scores: { ownership_follow_through: 4, communication_confidence: 4 } },
      { id: 'commit-b', text: 'Pushes through independently and figures it out along the way. Would rather work harder to deliver on the commitment than involve others or reset expectations — independent delivery is part of taking a commitment seriously.', scores: { ownership_follow_through: 5, communication_confidence: 1 } },
      { id: 'commit-c', text: 'Surfaces problems as soon as they emerge and works with others to find solutions. Early honest communication about difficulty is taking the commitment more seriously, not less.', scores: { ownership_follow_through: 3, communication_confidence: 5 } },
      { id: 'commit-d', text: 'Reassesses quietly and adjusts approach without making it a big deal. Deprioritises other things to protect the commitment and only involves others if it becomes genuinely unmanageable.', scores: { ownership_follow_through: 4, communication_confidence: 2 } },
    ];
    setQ4ShuffledOptions([...q4Options].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    const next = parseSection4Saved(initialData);
    setQ1Choice((prev) => prev ?? next.q1Choice);
    setQ2Choice((prev) => prev ?? next.q2Choice);
    setQ3Choice((prev) => prev ?? next.q3Choice);
    setQ4Choice((prev) => prev ?? next.q4Choice);
    setQ5Narrative((prev) => (prev.trim() ? prev : next.q5Narrative));
    setQ6Narrative((prev) => (prev.trim() ? prev : next.q6Narrative));
  }, [initialData]);

  const canProceed = !!(q1Choice && q2Choice && q3Choice && q4Choice && isValidQ5 && q6IsValid);

  const flushComplete = (llm_scores: Record<string, number>, q5WordCountOverride?: number) => {
    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice)!;
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice)!;
    const q3Option = q3ShuffledOptions.find(o => o.id === q3Choice)!;
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice)!;

    const wc = q5WordCountOverride ?? q5WordCount;

    onComplete({
      section: 4,
      responses: {
        S4Q1: { question_key: 'S4Q1', option_id: q1Choice, scores: q1Option.scores },
        S4Q2: { question_key: 'S4Q2', option_id: q2Choice, scores: q2Option.scores },
        S4Q3: { question_key: 'S4Q3', option_id: q3Choice, scores: q3Option.scores },
        S4Q4: { question_key: 'S4Q4', option_id: q4Choice, scores: q4Option.scores },
        S4Q5: {
          question_key: 'S4Q5',
          narrative: q5Narrative,
          word_count: wc,
          llm_scores,
        },
        S4Q6: { question_key: 'S4Q6', narrative: q6Narrative, word_count: q6WordCount },
      },
    });
  };

  const runHandleNextAsync = async () => {
    if (readOnly) return;
    if (!canProceed || scoringInFlightRef.current) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice);
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice);
    const q3Option = q3ShuffledOptions.find(o => o.id === q3Choice);
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice);
    if (!q1Option || !q2Option || !q3Option || !q4Option || !isValidQ5 || !q6IsValid) return;

    const narrativeTrimmed = q5Narrative.trim();

    scoringInFlightRef.current = true;
    setQ5IsScoring(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/score-behavioural-task`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          narrative: narrativeTrimmed,
          system_prompt: SETBACK_SYSTEM_PROMPT,
        }),
      });
      if (!res.ok) throw new Error(`Score request failed: ${res.status}`);
      let parsed: unknown;
      try {
        parsed = await res.json();
      } catch {
        throw new Error('Invalid score response');
      }
      const llmScores = normalizeSetbackLlmScores(parsed);
      if (llmScores === null) throw new Error('Invalid score payload');
      scoreFailCountRef.current = 0;
      setQ5ScoreError(null);
      const wc =
        narrativeTrimmed.split(/\s+/).filter(w => w.length > 0).length;
      flushComplete(llmScores, wc);
    } catch {
      scoreFailCountRef.current += 1;
      if (scoreFailCountRef.current >= 2) {
        setQ5ScoreError(null);
        scoreFailCountRef.current = 0;
        flushComplete({});
      } else {
        setQ5ScoreError('Could not score response. Please try again.');
      }
    } finally {
      scoringInFlightRef.current = false;
      setQ5IsScoring(false);
    }
  };

  const handleNext = () => {
    void runHandleNextAsync();
  };

  useEffect(() => {
    return () => {
      if (submitRef) submitRef.current = null;
    };
  }, [submitRef]);

  useEffect(() => {
    onQ5ScoringBusyChange?.(q5IsScoring);
  }, [q5IsScoring, onQ5ScoringBusyChange]);

  if (hideFooterButton && submitRef) {
    submitRef.current = readOnly ? null : handleNext;
  }

  const roAct = readOnly ? 'opacity-60 cursor-not-allowed' : '';

  const proceedEnabled = canProceed && !q5IsScoring && !readOnly;

  return (
    <div>
      {!hideFooterButton ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl text-[#111827] mb-2">SECTION 4 — How You Handle Difficulty</h2>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
              <span className="text-[#7DBBFF] font-medium">
                Dimensions scored: Resilience (primary), Ownership &amp; Follow-Through (primary), Learning Velocity, Communication Confidence
              </span>
              <span className="text-[#9CA3AF]">•</span>
              <span>Est. time: 8–10 min</span>
            </div>
          </div>

          <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
            <p className="text-sm text-[#111827] leading-relaxed italic">
              "Every role has hard moments — setbacks, pressure, things that don't go to plan. This section isn't looking for perfect responses. It's interested in what actually happens for you when things get difficult."
            </p>
          </div>
        </>
      ) : null}

      {/* S4Q1 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Think about a time something you'd worked hard on didn't go the way you'd hoped. Which most accurately describes what happened for you? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q1ShuffledOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && setQ1Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${roAct} ${q1Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S4Q2 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Something goes wrong on a piece of work you were involved in. There were things you could have done differently. Which most accurately describes your typical response? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q2ShuffledOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && setQ2Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${roAct} ${q2Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S4Q3 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Think about how you perform when the pressure is genuinely high. Which most accurately describes what tends to happen? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q3ShuffledOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && setQ3Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${roAct} ${q3Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs text-[#6B7280] bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
          <span className="font-medium text-[#111827]">Consistency check:</span> Your response here is compared with S2Q5 (Section 2) for significant inconsistencies.
        </div>
      </div>

      {/* S4Q4 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          You've taken on a significant commitment and it becomes more demanding than you expected. Which most accurately describes your natural approach? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q4ShuffledOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && setQ4Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${roAct} ${q4Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S4Q5 — Setback narrative (LLM) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-4">
          <h3 className="text-base text-[#111827] font-medium mb-3">
            Setback reflection <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#111827] leading-relaxed mb-2">
            Tell us about a time something went wrong on a piece of work that mattered to you. What happened, what did you do, and how do you reflect on it now?
          </p>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            There&apos;s no ideal answer here — we&apos;re interested in how you naturally describe difficult moments.
          </p>
        </div>

        <textarea
          value={q5Narrative}
          onChange={(e) => !readOnly && setQ5Narrative(e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
          placeholder="Describe the situation honestly: what went wrong, what you did next, and what you take away from it now."
          className={`w-full h-56 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all ${roAct}`}
          style={{ borderRadius: '12px' }}
        />

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#6B7280]">
                Required: {minWordsQ5}–{maxWordsQ5} words
              </span>
              {showSoftWarningQ5 ? (
                <span className="text-[#F59E0B] font-medium">⚠ Approaching character limit</span>
              ) : null}
              {isOverMaxQ5 ? <span className="text-[#EF4444] font-medium">Maximum exceeded</span> : null}
            </div>
            <div
              className={`font-medium tabular-nums ${
                q5WordCount < minWordsQ5 ? 'text-[#9CA3AF]' : isValidQ5 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {q5WordCount} / {maxWordsQ5} words
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${
                q5WordCount < minWordsQ5 ? 'bg-[#9CA3AF]' : isValidQ5 ? 'bg-[#10B981]' : 'bg-[#EF4444]'
              }`}
              style={{ width: `${Math.min((q5WordCount / maxWordsQ5) * 100, 100)}%` }}
            />
          </div>

          {q5WordCount < minWordsQ5 ? (
            <p className="text-xs text-[#6B7280]">
              {minWordsQ5 - q5WordCount} more {minWordsQ5 - q5WordCount === 1 ? 'word' : 'words'} required
            </p>
          ) : null}
        </div>

        {q5ScoreError ? <p className="mt-3 text-sm text-[#EF4444]">{q5ScoreError}</p> : null}
      </div>

      {/* S4Q6 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-4">
          Reflective narrative <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3 mb-4">
          <div className="bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '10px' }}>
            <div className="text-xs font-semibold text-[#7DBBFF] mb-2">EXPERIENCED PROFESSIONAL</div>
            <p className="text-sm text-[#111827] leading-relaxed">
              Briefly describe a situation where things didn't go to plan at work and how you handled it — what happened, what you did, and what came out of it.
            </p>
          </div>
          <div className="bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '10px' }}>
            <div className="text-xs font-semibold text-[#7DBBFF] mb-2">EARLY CAREER</div>
            <p className="text-sm text-[#111827] leading-relaxed">
              Describe a situation where something important to you didn't go the way you hoped. What happened and what did you do with it?
            </p>
          </div>
        </div>
        <textarea
          value={q6Narrative}
          onChange={(e) => !readOnly && setQ6Narrative(e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
          placeholder="Example: Led a product launch that missed its revenue target by 40%..."
          className={`w-full h-40 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all ${roAct}`}
          style={{ borderRadius: '12px' }}
        />
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280]">Required: {q6MinWords}–{q6MaxWords} words</span>
              {q6IsOverMax && <span className="text-[#EF4444] font-medium">Maximum exceeded</span>}
            </div>
            <div className={`font-medium tabular-nums ${q6WordCount < q6MinWords ? 'text-[#9CA3AF]' : q6IsValid ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {q6WordCount} / {q6MaxWords} words
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${q6WordCount < q6MinWords ? 'bg-[#9CA3AF]' : q6IsValid ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
              style={{ width: `${Math.min((q6WordCount / q6MaxWords) * 100, 100)}%` }}
            />
          </div>
          {q6WordCount < q6MinWords && (
            <p className="text-xs text-[#6B7280]">{q6MinWords - q6WordCount} more {q6MinWords - q6WordCount === 1 ? 'word' : 'words'} required</p>
          )}
        </div>
      </div>

      {!hideFooterButton ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={readOnly || !proceedEnabled}
            className={`px-6 py-3 text-sm font-medium transition-all shadow-sm ${roAct} ${
              !readOnly && proceedEnabled
                ? 'bg-[#7DBBFF] text-white hover:bg-[#6AABEF] hover:shadow-md'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
            style={{ borderRadius: '12px' }}
          >
            {q5IsScoring ? 'Scoring response…' : 'Continue to Next Section →'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
