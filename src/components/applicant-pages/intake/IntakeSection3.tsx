import { useState, useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

const HENDERSON_SYSTEM_PROMPT = `You are scoring a candidate response for a hiring assessment. The candidate was given this scenario: they're two weeks into a new role, their manager asks them to sort out an unhappy client account before end of day with no handover notes, and the manager is unavailable until 4pm. They were asked what they'd do.

Score the response on four criteria, each 1-5. Return ONLY a JSON object with these exact keys:
{ "clarity_of_reasoning": N, "handling_ambiguity": N, "initiative_and_ownership": N, "communication_intent": N }

clarity_of_reasoning (1-5)
  5 = explains logic clearly and explicitly, walks through reasoning step by step
  3 = lists actions without explaining why
  1 = vague or no reasoning given

handling_ambiguity (1-5)
  5 = acknowledges what they don't know AND adapts approach to gather information first
  3 = acts without acknowledging the ambiguity
  2 = acknowledges ambiguity but does not adapt their approach to address it
  1 = ignores the ambiguity entirely

initiative_and_ownership (1-5)
  5 = takes clear ownership of the outcome, treats it as their problem to solve
  3 = describes tasks they'd do, no clear ownership of the outcome
  1 = waits for more information or guidance before acting

communication_intent (1-5)
  5 = proactively communicates to BOTH the client AND their manager
  3 = communicates to one party only (client OR manager)
  1 = no communication intent mentioned

Return only the JSON object. No preamble, no commentary.`;

const HENDERSON_LLM_KEYS = ['clarity_of_reasoning', 'handling_ambiguity', 'initiative_and_ownership', 'communication_intent'] as const;

function normalizeHendersonLlmScores(data: unknown): Record<string, number> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const k of HENDERSON_LLM_KEYS) {
    const v = o[k];
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    out[k] = v;
  }
  return out;
}

function parseSection3Saved(initialData: unknown) {
  const s = initialData as Record<string, Record<string, unknown>> | undefined;
  if (!s) {
    return {
      q1Choice: null as string | null,
      q2Choice: null as string | null,
      q3Narrative: '',
      q4Choice: null as string | null,
      q5Choice: null as string | null,
    };
  }
  return {
    q1Choice: typeof s.S3Q1?.option_id === 'string' ? s.S3Q1.option_id : null,
    q2Choice: typeof s.S3Q2?.option_id === 'string' ? s.S3Q2.option_id : null,
    q3Narrative: typeof s.S3Q3?.narrative === 'string' ? s.S3Q3.narrative : '',
    q4Choice: typeof s.S3Q4?.option_id === 'string' ? s.S3Q4.option_id : null,
    q5Choice: typeof s.S3Q5?.option_id === 'string' ? s.S3Q5.option_id : null,
  };
}

interface IntakeSection3Props {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: unknown;
  submitRef?: MutableRefObject<(() => void) | null>;
  hideFooterButton?: boolean;
  /** Profile builder: sync LLM scoring busy state to disable footer continue */
  onQ3ScoringBusyChange?: (busy: boolean) => void;
}

export function IntakeSection3({
  onComplete,
  initialData,
  submitRef,
  hideFooterButton = false,
  onQ3ScoringBusyChange,
}: IntakeSection3Props) {
  const saved = parseSection3Saved(initialData);

  const [q1Choice, setQ1Choice] = useState<string | null>(() => saved.q1Choice);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q2Choice, setQ2Choice] = useState<string | null>(() => saved.q2Choice);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q3Narrative, setQ3Narrative] = useState(() => saved.q3Narrative);
  const [q3IsScoring, setQ3IsScoring] = useState(false);
  const [q3ScoreError, setQ3ScoreError] = useState<string | null>(null);
  const scoreFailCountRef = useRef(0);
  /** Prevents overlapping requests before React re-renders (e.g. profile footer double-clicks). */
  const scoringInFlightRef = useRef(false);

  const [q4Choice, setQ4Choice] = useState<string | null>(() => saved.q4Choice);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q5Choice, setQ5Choice] = useState<string | null>(() => saved.q5Choice);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const q3WordCount = q3Narrative.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minWordsQ3 = 80;
  const maxWordsQ3 = 150;
  const softCapWarningQ3 = 135;
  const isValidQ3 = q3WordCount >= minWordsQ3 && q3WordCount <= maxWordsQ3;
  const showSoftWarningQ3 = q3WordCount >= softCapWarningQ3 && q3WordCount < maxWordsQ3;
  const isOverMaxQ3 = q3WordCount > maxWordsQ3;

  useEffect(() => {
    const q1Options = [
      { id: 'lv-a', text: 'Takes time with new things. Goes deep before feeling confident applying something — prefers being thorough over moving quickly and missing something important.', scores: { learning_velocity: 1 } },
      { id: 'lv-b', text: 'Gets on top of new things reasonably quickly. Once there\'s a solid grounding, able to move independently without needing a lot of ongoing guidance.', scores: { learning_velocity: 4 } },
      { id: 'lv-c', text: 'New things tend to click fairly quickly. Connects new learning to existing knowledge and usually feels confident applying something before spending a lot of time with it.', scores: { learning_velocity: 5 } },
      { id: 'lv-d', text: 'Learns at a deliberate pace. Likes to revisit material, let things settle, and build up a solid understanding over time before feeling genuinely confident applying something independently.', scores: { learning_velocity: 2 } },
    ];
    setQ1ShuffledOptions([...q1Options].sort(() => Math.random() - 0.5));

    const q2Options = [
      { id: 'view-a', text: 'Forms strong views and holds them firmly. Takes a lot of convincing to change position — sees consistency and conviction as a strength and doesn\'t shift easily under social pressure.', scores: { learning_velocity: 1, communication_confidence: 4 } },
      { id: 'view-b', text: 'Holds views but updates them when the argument is strong enough. Tries to separate ego from opinions — if someone makes a better point, would rather acknowledge it than defend a weaker position.', scores: { learning_velocity: 4, communication_confidence: 4 } },
      { id: 'view-c', text: 'Actively seeks out challenges to own thinking. Forms strong views but is genuinely open to better ones — if someone makes a more compelling argument, updates position and moves on.', scores: { learning_velocity: 5, communication_confidence: 3 } },
      { id: 'view-d', text: 'Develops considered positions and doesn\'t change them lightly. Engages seriously with counter-arguments but needs substantial evidence before updating a view.', scores: { learning_velocity: 2, communication_confidence: 3 } },
    ];
    setQ2ShuffledOptions([...q2Options].sort(() => Math.random() - 0.5));

    const q4Options = [
      { id: 'dis-a', text: 'Finds the right moment to raise the concern directly with the person involved, framing it as a question or alternative perspective rather than a direct challenge.', scores: { communication_confidence: 4, ownership_follow_through: 4 } },
      { id: 'dis-b', text: 'Accepts the decision and directs energy toward executing it as well as possible. Debating decisions that have already been made rarely changes the outcome — prefers to demonstrate value through the quality of the work.', scores: { communication_confidence: 2, ownership_follow_through: 3 } },
      { id: 'dis-c', text: 'Raises disagreement clearly and directly at the earliest appropriate moment. Respectful but wouldn\'t dilute the view — honest challenge is part of doing a good job.', scores: { communication_confidence: 5, ownership_follow_through: 5 } },
      { id: 'dis-d', text: 'Notes disagreement privately and looks for ways to demonstrate through the work that a different approach might be better. Prefers to let results make the argument rather than create friction directly.', scores: { communication_confidence: 3, ownership_follow_through: 4 } },
    ];
    setQ4ShuffledOptions([...q4Options].sort(() => Math.random() - 0.5));

    const q5Options = [
      { id: 'comm-a', text: 'Actively adjusts to the audience. Finds an analogy, cuts the jargon, and tests whether it\'s landing — would rather explain something twice in different ways than lose someone once.', scores: { communication_confidence: 4 } },
      { id: 'comm-b', text: 'Gives people the context they need and follows up afterwards to check it landed. Prefers to confirm understanding after the fact rather than interrupt the flow of an explanation.', scores: { communication_confidence: 3 } },
      { id: 'comm-c', text: 'Tends to strip explanations right back to the core of what the other person needs. Probably guilty of oversimplifying sometimes but would rather re-add detail than lose someone in complexity.', scores: { communication_confidence: 4 } },
      { id: 'comm-d', text: 'Prioritises completeness. It\'s important that the person has the full picture, even if that means a longer explanation. Oversimplifying feels like doing them a disservice.', scores: { communication_confidence: 3 } },
    ];
    setQ5ShuffledOptions([...q5Options].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    const next = parseSection3Saved(initialData);
    setQ1Choice((prev) => prev ?? next.q1Choice);
    setQ2Choice((prev) => prev ?? next.q2Choice);
    setQ3Narrative((prev) => (prev.trim() ? prev : next.q3Narrative));
    setQ4Choice((prev) => prev ?? next.q4Choice);
    setQ5Choice((prev) => prev ?? next.q5Choice);
  }, [initialData]);

  const canProceed =
    !!(q1Choice && q2Choice && q4Choice && q5Choice && isValidQ3);

  const flushComplete = (
    llm_scores: Record<string, number>,
    wordCountOverride?: number,
  ) => {
    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice)!;
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice)!;
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice)!;
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice)!;

    const wc = wordCountOverride ?? q3WordCount;

    onComplete({
      section: 3,
      responses: {
        S3Q1: { question_key: 'S3Q1', option_id: q1Choice, scores: q1Option.scores },
        S3Q2: { question_key: 'S3Q2', option_id: q2Choice, scores: q2Option.scores },
        S3Q3: {
          question_key: 'S3Q3',
          narrative: q3Narrative,
          word_count: wc,
          llm_scores,
        },
        S3Q4: { question_key: 'S3Q4', option_id: q4Choice, scores: q4Option.scores },
        S3Q5: { question_key: 'S3Q5', option_id: q5Choice, scores: q5Option.scores },
      },
    });
  };

  const runHandleNextAsync = async () => {
    if (!canProceed || scoringInFlightRef.current) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice);
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice);
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice);
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice);
    if (!q1Option || !q2Option || !q4Option || !q5Option || !isValidQ3) return;

    const narrativeTrimmed = q3Narrative.trim();

    scoringInFlightRef.current = true;
    setQ3IsScoring(true);
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
          system_prompt: HENDERSON_SYSTEM_PROMPT,
        }),
      });
      if (!res.ok) throw new Error(`Score request failed: ${res.status}`);
      let parsed: unknown;
      try {
        parsed = await res.json();
      } catch {
        throw new Error('Invalid score response');
      }
      const llmScores = normalizeHendersonLlmScores(parsed);
      if (llmScores === null) throw new Error('Invalid score payload');
      scoreFailCountRef.current = 0;
      setQ3ScoreError(null);
      const wc =
        narrativeTrimmed.split(/\s+/).filter(w => w.length > 0).length;
      flushComplete(llmScores, wc);
    } catch {
      scoreFailCountRef.current += 1;
      if (scoreFailCountRef.current >= 2) {
        setQ3ScoreError(null);
        scoreFailCountRef.current = 0;
        flushComplete({});
      } else {
        setQ3ScoreError('Could not score response. Please try again.');
      }
    } finally {
      scoringInFlightRef.current = false;
      setQ3IsScoring(false);
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
    onQ3ScoringBusyChange?.(q3IsScoring);
  }, [q3IsScoring, onQ3ScoringBusyChange]);

  if (hideFooterButton && submitRef) {
    submitRef.current = handleNext;
  }

  const proceedEnabled = canProceed && !q3IsScoring;

  return (
    <div>
      {!hideFooterButton ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl text-[#111827] mb-2">SECTION 3 — How You Think</h2>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
              <span className="text-[#7DBBFF] font-medium">
                Dimensions scored: Learning Velocity, Communication Confidence, Ownership &amp; Follow-Through
              </span>
              <span className="text-[#9CA3AF]">•</span>
              <span>Est. time: 8–10 min</span>
            </div>
          </div>

          <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
            <p className="text-sm text-[#111827] leading-relaxed italic">
              "This section is about how you approach new situations, process information, and communicate your thinking. There are no right answers — we're genuinely interested in how your mind works."
            </p>
          </div>
        </>
      ) : null}

      {/* S3Q1 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          When you encounter something new that you need to get on top of — a skill, a system, a role — which most accurately describes how that typically goes? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q1ShuffledOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setQ1Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q1Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S3Q2 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          When it comes to forming and holding views, which most accurately describes you? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q2ShuffledOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setQ2Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q2Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S3Q3 — Henderson narrative */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-4">
          <h3 className="text-base text-[#111827] font-medium mb-4">
            Behavioural response <span className="text-[#EF4444]">*</span>
          </h3>
          <div className="space-y-3 text-sm text-[#111827] leading-relaxed">
            <p>
              You&apos;ve just started in a new role — two weeks in. Your manager pulls you aside before heading into
              back-to-back meetings and says:{' '}
              <span className="italic">&apos;Can you sort out the situation with the Henderson account before end of
                day? They&apos;re not happy.&apos;</span>{' '}
              Then they&apos;re gone.
            </p>
            <p>
              You have no handover notes on Henderson. You can find the account history in the system but it&apos;ll
              take time to piece together. It&apos;s 11am. Your manager is unavailable until 4pm.
            </p>
            <p className="font-medium text-[#111827]">
              What do you do? Walk us through your thinking and the actions you&apos;d take.
            </p>
          </div>
        </div>

        <textarea
          value={q3Narrative}
          onChange={e => setQ3Narrative(e.target.value)}
          placeholder="Walk through what you would do first, how you would prioritise, and who you would communicate with — and why."
          className="w-full h-56 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#6B7280]">
                Required: {minWordsQ3}–{maxWordsQ3} words
              </span>
              {showSoftWarningQ3 ? (
                <span className="text-[#F59E0B] font-medium">⚠ Approaching character limit</span>
              ) : null}
              {isOverMaxQ3 ? <span className="text-[#EF4444] font-medium">Maximum exceeded</span> : null}
            </div>
            <div
              className={`font-medium tabular-nums ${
                q3WordCount < minWordsQ3 ? 'text-[#9CA3AF]' : isValidQ3 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {q3WordCount} / {maxWordsQ3} words
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${
                q3WordCount < minWordsQ3 ? 'bg-[#9CA3AF]' : isValidQ3 ? 'bg-[#10B981]' : 'bg-[#EF4444]'
              }`}
              style={{ width: `${Math.min((q3WordCount / maxWordsQ3) * 100, 100)}%` }}
            />
          </div>

          {q3WordCount < minWordsQ3 ? (
            <p className="text-xs text-[#6B7280]">
              {minWordsQ3 - q3WordCount} more {minWordsQ3 - q3WordCount === 1 ? 'word' : 'words'} required
            </p>
          ) : null}
        </div>

        {q3ScoreError ? <p className="mt-3 text-sm text-[#EF4444]">{q3ScoreError}</p> : null}
      </div>

      {/* S3Q4 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          You genuinely disagree with a decision that someone more senior than you has just made. Which most accurately describes your typical approach? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q4ShuffledOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setQ4Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q4Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S3Q5 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          You need to explain something genuinely complex to someone without your level of knowledge on it. Which most accurately describes your approach? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q5ShuffledOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setQ5Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q5Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {!hideFooterButton ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={!proceedEnabled}
            className={`px-6 py-3 text-sm font-medium transition-all shadow-sm ${
              proceedEnabled
                ? 'bg-[#7DBBFF] text-white hover:bg-[#6AABEF] hover:shadow-md'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
            }`}
            style={{ borderRadius: '12px' }}
          >
            {q3IsScoring ? 'Scoring response…' : 'Continue to Next Section →'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
