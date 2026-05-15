import { useState, useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { RankedPreference, type RankItem } from './RankedPreference';

const MOTIVATION_SYSTEM_PROMPT = `You are scoring a candidate's reflective response to a hiring assessment prompt. They were asked to describe a time they felt completely engaged and at their best — what was happening and what made it feel that way.

Your task: detect which of four motivational drivers the candidate spontaneously reaches for in describing what energised them. Each candidate may reference multiple drivers — score each independently based on how prominently it features in their language.

Score the response on four criteria, each 1-5. Return ONLY a JSON object with these exact keys:
{ "mastery_language": N, "impact_language": N, "recognition_language": N, "autonomy_language": N }

mastery_language (1-5)
  Look for: skill development, depth of expertise, getting genuinely good at something, craft, learning a domain at a real level, the satisfaction of competence itself.
  5 = mastery is the central driver they describe
  3 = mastery is mentioned but not central
  1 = no mastery language present

impact_language (1-5)
  Look for: effect on others, real-world outcomes, contribution to a cause or team, "making a difference," helping someone, changing something meaningful.
  5 = impact is the central driver they describe
  3 = impact is mentioned but not central
  1 = no impact language present

recognition_language (1-5)
  Look for: being seen, being valued, acknowledgment from peers/managers/clients, status, visibility, "being part of something prestigious," external validation.
  5 = recognition is the central driver they describe
  3 = recognition is mentioned but not central
  1 = no recognition language present

autonomy_language (1-5)
  Look for: independence, freedom over how/when/what, ownership of approach, working without close oversight, self-directed decisions, "doing it my way."
  5 = autonomy is the central driver they describe
  3 = autonomy is mentioned but not central
  1 = no autonomy language present

Important: do not normalise the scores to sum to a fixed total. A candidate may genuinely have 5/5/5/5 (all four drivers strongly present) or 5/1/1/1 (single dominant driver). Score each independently.

Return only the JSON object. No preamble, no commentary.`;

const MOTIVATION_LLM_KEYS = [
  'mastery_language',
  'impact_language',
  'recognition_language',
  'autonomy_language',
] as const;

function normalizeMotivationLlmScores(data: unknown): Record<string, number> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const k of MOTIVATION_LLM_KEYS) {
    const v = o[k];
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    out[k] = v;
  }
  return out;
}

function parseMotivationRankScores(savedScores: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of ['mastery', 'impact', 'recognition', 'autonomy'] as const) {
    const k = `motivational_fit_${id}`;
    const v = savedScores[k];
    if (typeof v === 'number' && Number.isFinite(v)) out[id] = v;
  }
  return out;
}

function parseSection6Saved(initialData: unknown) {
  const s = initialData as Record<string, Record<string, unknown>> | undefined;
  if (!s) {
    return {
      q1Choice: null as string | null,
      q2Choice: null as string | null,
      q3OrderedIds: [] as string[],
      q3Scores: {} as Record<string, number>,
      q4Choice: null as string | null,
      q5Narrative: '',
      q6Choice: null as string | null,
    };
  }

  const q3 = s.S6Q3 as Record<string, unknown> | undefined;
  const orderedRaw = q3?.ordered_ids;
  const orderedIds =
    Array.isArray(orderedRaw) &&
    orderedRaw.length === 4 &&
    orderedRaw.every((x) => typeof x === 'string')
      ? (orderedRaw as string[])
      : [];

  let q3Scores: Record<string, number> = {};
  const sc = q3?.scores;
  if (orderedIds.length === 4 && sc && typeof sc === 'object' && !Array.isArray(sc)) {
    q3Scores = parseMotivationRankScores(sc as Record<string, unknown>);
  }

  return {
    q1Choice: typeof s.S6Q1?.option_id === 'string' ? s.S6Q1.option_id : null,
    q2Choice: typeof s.S6Q2?.option_id === 'string' ? s.S6Q2.option_id : null,
    q3OrderedIds: orderedIds,
    q3Scores,
    q4Choice: typeof s.S6Q4?.option_id === 'string' ? s.S6Q4.option_id : null,
    q5Narrative: typeof s.S6Q5?.narrative === 'string' ? s.S6Q5.narrative : '',
    q6Choice: typeof s.S6Q6?.option_id === 'string' ? s.S6Q6.option_id : null,
  };
}

const RANK_ITEMS: RankItem[] = [
  { id: 'mastery', label: 'Mastery', description: 'Getting genuinely good at something. The craft, the depth, the feeling of knowing a subject or skill at a real level.' },
  { id: 'impact', label: 'Impact', description: 'Making a real difference. Knowing that what you do changes something meaningful for the people or outcomes being worked toward.' },
  { id: 'recognition', label: 'Recognition', description: 'Being seen and valued. Knowing that the people around you — peers, managers, clients — recognise and appreciate the contribution being made.' },
  { id: 'autonomy', label: 'Autonomy', description: 'Working on your own terms. Having genuine independence over how you approach the work, set priorities, and make decisions.' },
];

interface IntakeSection6Props {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: unknown;
  submitRef?: MutableRefObject<(() => void) | null>;
  hideFooterButton?: boolean;
  onQ5ScoringBusyChange?: (busy: boolean) => void;
  readOnly?: boolean;
}

export function IntakeSection6({
  onComplete,
  initialData,
  submitRef,
  hideFooterButton = false,
  onQ5ScoringBusyChange,
  readOnly = false,
}: IntakeSection6Props) {
  const saved = parseSection6Saved(initialData);
  const hydratedRankIds = saved.q3OrderedIds;
  const rankPreferenceKey =
    hydratedRankIds.length === RANK_ITEMS.length ? hydratedRankIds.join('|') : 'fresh';

  const [q1Choice, setQ1Choice] = useState<string | null>(() => saved.q1Choice);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q2Choice, setQ2Choice] = useState<string | null>(() => saved.q2Choice);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q3OrderedIds, setQ3OrderedIds] = useState<string[]>(() => saved.q3OrderedIds);
  const [q3Scores, setQ3Scores] = useState<Record<string, number>>(() => saved.q3Scores);

  const [q4Choice, setQ4Choice] = useState<string | null>(() => saved.q4Choice);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q5Narrative, setQ5Narrative] = useState(() => saved.q5Narrative);
  const [q5IsScoring, setQ5IsScoring] = useState(false);
  const [q5ScoreError, setQ5ScoreError] = useState<string | null>(null);
  const scoreFailCountRef = useRef(0);
  const scoringInFlightRef = useRef(false);

  const [q6Choice, setQ6Choice] = useState<string | null>(() => saved.q6Choice);
  const [q6ShuffledOptions, setQ6ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const q5WordCount = q5Narrative.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minWordsQ5 = 60;
  const maxWordsQ5 = 120;
  const softCapWarningQ5 = 108;
  const isValidQ5 = q5WordCount >= minWordsQ5 && q5WordCount <= maxWordsQ5;
  const showSoftWarningQ5 = q5WordCount >= softCapWarningQ5 && q5WordCount < maxWordsQ5;
  const isOverMaxQ5 = q5WordCount > maxWordsQ5;

  useEffect(() => {
    const q1Options = [
      { id: 'sat-a', text: 'From seeing the effect it had on someone else. Knowing that the work made a real difference to a person, a team, or an outcome is what makes work feel meaningful.', scores: { motivational_fit_impact: 5, motivational_fit_mastery: 2 } },
      { id: 'sat-b', text: 'From the quality of the work itself. Knowing something was done well — that the thinking was sharp, the execution was clean, the output was genuinely good — is where the satisfaction lives.', scores: { motivational_fit_mastery: 5, motivational_fit_impact: 2 } },
      { id: 'sat-c', text: 'From both equally. Needs to know the work was good and that it mattered to someone — quality without impact feels hollow and impact without quality feels accidental.', scores: { motivational_fit_mastery: 3, motivational_fit_impact: 4 } },
      { id: 'sat-d', text: 'From having figured something out that was genuinely hard. The satisfaction is in the problem-solving — the effect on others is important but it\'s the challenge itself that is most energising.', scores: { motivational_fit_mastery: 5, motivational_fit_impact: 1, learning_velocity: 5 } },
    ];
    setQ1ShuffledOptions(
      [...q1Options]
        .sort(() => Math.random() - 0.5)
        .map((o) => ({ ...o, scores: o.scores as unknown as Record<string, number> }))
    );

    const q2Options = [
      { id: 'keep-a', text: 'Knowing that people they respect can see the effort and the progress. When external recognition is present it significantly helps push through difficult patches — it confirms the effort is worth it.', scores: { motivational_fit_recognition: 5, motivational_fit_mastery: 1 } },
      { id: 'keep-b', text: 'An internal standard. There\'s a clear sense of what good looks like and it\'s difficult to walk away from something before that standard is met — the dissatisfaction of leaving it unfinished is its own motivator.', scores: { motivational_fit_mastery: 5, motivational_fit_recognition: 1 } },
      { id: 'keep-c', text: 'The knowledge that it matters to someone. Connecting the difficult work to a real outcome for a real person or team gives enough purpose to push through even when it\'s unrewarding.', scores: { motivational_fit_impact: 5, motivational_fit_mastery: 2, motivational_fit_recognition: 2 } },
      { id: 'keep-d', text: 'A mix of internal drive and external signal. Has own standards but also finds that recognition from the right people at the right moments meaningfully sustains motivation through difficult patches.', scores: { motivational_fit_mastery: 3, motivational_fit_recognition: 4 } },
    ];
    setQ2ShuffledOptions(
      [...q2Options]
        .sort(() => Math.random() - 0.5)
        .map((o) => ({ ...o, scores: o.scores as unknown as Record<string, number> }))
    );

    const q4Options = [
      { id: 'rel-a', text: 'Genuinely motivated by external outcomes — career progression, financial reward, recognition, status. These aren\'t superficial drivers — they\'re real and meaningful motivators that shape how hard the work is pursued.', scores: { motivational_fit_recognition: 5, motivational_fit_mastery: 1 } },
      { id: 'rel-b', text: 'Cares about external outcomes but they\'re not the primary thing. What keeps engagement up is whether the work itself is interesting and whether getting better at something — the external rewards are a welcome signal, not the main event.', scores: { motivational_fit_mastery: 4, motivational_fit_recognition: 2 } },
      { id: 'rel-c', text: 'The work itself is the primary thing. Most engaged when learning, solving something genuinely hard, or producing something to be proud of — external recognition matters but it doesn\'t drive them.', scores: { motivational_fit_mastery: 5, motivational_fit_recognition: 1 } },
      { id: 'rel-d', text: 'Motivated by impact more than recognition or craft. What matters most is whether the work matters — whether it\'s changing something real for the people or outcomes being worked toward.', scores: { motivational_fit_impact: 5, motivational_fit_mastery: 2, motivational_fit_recognition: 1 } },
    ];
    setQ4ShuffledOptions(
      [...q4Options]
        .sort(() => Math.random() - 0.5)
        .map((o) => ({ ...o, scores: o.scores as unknown as Record<string, number> }))
    );

    const q6Options = [
      { id: 'drive-a', text: 'Mainly internal — the quality of the output, getting better, solving something hard. External recognition matters, but it\'s not where the energy actually comes from.', scores: { motivational_fit_mastery: 5, motivational_fit_recognition: 1, learning_velocity: 4 } },
      { id: 'drive-b', text: 'More external than is always comfortable to admit — recognition, progression, the visible markers of success. These aren\'t superficial drivers, but they\'re more prominent than pure craft.', scores: { motivational_fit_mastery: 1, motivational_fit_recognition: 5, learning_velocity: 3 } },
      { id: 'drive-c', text: 'A genuine mix — internal standards around quality, but the external signals matter more than they probably should. Hard to fully separate the two when being honest.', scores: { motivational_fit_mastery: 3, motivational_fit_recognition: 4, learning_velocity: 4 } },
      { id: 'drive-d', text: 'Impact-driven more than either. What creates energy isn\'t recognition or craft for its own sake — it\'s knowing the work actually changed something real for someone.', scores: { motivational_fit_mastery: 2, motivational_fit_recognition: 1, motivational_fit_impact: 5, learning_velocity: 3 } },
    ];
    setQ6ShuffledOptions(
      [...q6Options]
        .sort(() => Math.random() - 0.5)
        .map((o) => ({ ...o, scores: o.scores as unknown as Record<string, number> }))
    );
  }, []);

  useEffect(() => {
    const next = parseSection6Saved(initialData);
    setQ1Choice((prev) => prev ?? next.q1Choice);
    setQ2Choice((prev) => prev ?? next.q2Choice);
    setQ4Choice((prev) => prev ?? next.q4Choice);
    setQ6Choice((prev) => prev ?? next.q6Choice);
    setQ5Narrative((prev) => (prev.trim() ? prev : next.q5Narrative));

    if (next.q3OrderedIds.length === RANK_ITEMS.length) {
      setQ3OrderedIds((prev) => (prev.length === RANK_ITEMS.length ? prev : next.q3OrderedIds));
      setQ3Scores((prev) =>
        Object.keys(prev).length >= RANK_ITEMS.length ? prev : next.q3Scores,
      );
    }
  }, [initialData]);

  const handleRankChange = (orderedIds: string[], scores: Record<string, number>) => {
    setQ3OrderedIds(orderedIds);
    setQ3Scores(scores);
  };

  const canProceed =
    !!(q1Choice && q2Choice && q3OrderedIds.length === RANK_ITEMS.length &&
    q4Choice && isValidQ5 && q6Choice);

  const flushComplete = (llm_scores: Record<string, number>, q5WordCountOverride?: number) => {
    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice)!;
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice)!;
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice)!;
    const q6Option = q6ShuffledOptions.find(o => o.id === q6Choice)!;

    const q3MotiScores: Record<string, number> = {};
    q3OrderedIds.forEach((id, idx) => {
      q3MotiScores[`motivational_fit_${id}`] = q3Scores[id] ?? (4 - idx);
    });

    const wc = q5WordCountOverride ?? q5WordCount;

    onComplete({
      section: 6,
      responses: {
        S6Q1: { question_key: 'S6Q1', option_id: q1Choice, scores: q1Option.scores },
        S6Q2: { question_key: 'S6Q2', option_id: q2Choice, scores: q2Option.scores },
        S6Q3: { question_key: 'S6Q3', ordered_ids: q3OrderedIds, scores: q3MotiScores },
        S6Q4: { question_key: 'S6Q4', option_id: q4Choice, scores: q4Option.scores },
        S6Q5: {
          question_key: 'S6Q5',
          narrative: q5Narrative,
          word_count: wc,
          llm_scores,
        },
        S6Q6: { question_key: 'S6Q6', option_id: q6Choice, scores: q6Option.scores },
      },
    });
  };

  const runHandleNextAsync = async () => {
    if (readOnly) return;
    if (!canProceed || scoringInFlightRef.current) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice);
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice);
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice);
    const q6Option = q6ShuffledOptions.find(o => o.id === q6Choice);
    if (
      !q1Option || !q2Option || !q4Option || !q6Option ||
      q3OrderedIds.length !== RANK_ITEMS.length ||
      !isValidQ5
    ) {
      return;
    }

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
          system_prompt: MOTIVATION_SYSTEM_PROMPT,
        }),
      });
      if (!res.ok) throw new Error(`Score request failed: ${res.status}`);
      let parsed: unknown;
      try {
        parsed = await res.json();
      } catch {
        throw new Error('Invalid score response');
      }
      const llmScores = normalizeMotivationLlmScores(parsed);
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
            <h2 className="text-2xl text-[#111827] mb-2">SECTION 6 — What Drives You</h2>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
              <span className="text-[#7DBBFF] font-medium">
                Dimensions scored: Motivational Fit — all four sub-dimensions (Mastery, Impact, Recognition, Autonomy), Learning Velocity
              </span>
              <span className="text-[#9CA3AF]">•</span>
              <span>Est. time: 8–10 min</span>
            </div>
          </div>

          <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
            <p className="text-sm text-[#111827] leading-relaxed italic">
              "This section is about what genuinely motivates you — not what sounds impressive, but what actually gives you energy and keeps you engaged over time."
            </p>
          </div>
        </>
      ) : null}

      {/* S6Q1 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          At the end of a genuinely good piece of work — something you're proud of — which most accurately describes where the satisfaction comes from? <span className="text-[#EF4444]">*</span>
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

      {/* S6Q2 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          When a piece of work becomes genuinely difficult or unrewarding for a stretch — which most accurately describes what keeps you going? <span className="text-[#EF4444]">*</span>
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

      {/* S6Q3 — Drag to rank */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-2">
          Rank these four descriptions of what makes work meaningful <span className="text-[#EF4444]">*</span>
        </h3>
        <p className="text-sm text-[#6B7280] mb-2">Drag to reorder from most to least true for you — 1 is most true, 4 is least true.</p>
        <p className="text-xs text-[#9CA3AF] italic mb-6">This is the hardest question to game — elevating one necessarily depresses another.</p>
        <RankedPreference
          key={rankPreferenceKey}
          items={RANK_ITEMS}
          onChange={handleRankChange}
          readOnly={readOnly}
          initialOrderedIds={
            hydratedRankIds.length === RANK_ITEMS.length ? hydratedRankIds : undefined
          }
        />
        <div className="mt-4 text-xs text-[#6B7280] bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
          <span className="font-medium text-[#111827]">Scoring:</span> 1st place = 5, 2nd place = 3, 3rd place = 2, 4th place = 1
        </div>
      </div>

      {/* S6Q4 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Which most accurately describes your honest relationship with the work you do? <span className="text-[#EF4444]">*</span>
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
        <div className="mt-4 text-xs text-[#6B7280] bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
          <span className="font-medium text-[#111827]">Note:</span> Option A is designed to feel genuinely selectable. External motivation is real, valid, and valuable in the right roles.
        </div>
      </div>

      {/* S6Q5 — Motivation narrative (LLM) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-4">
          <h3 className="text-base text-[#111827] font-medium mb-3">
            At your best <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#111827] leading-relaxed">
            Tell us about a time at work — or a project, study, sport, anything you&apos;ve done — when you felt completely engaged and at your best. What was happening, and what about it made you feel that way?
          </p>
        </div>

        <textarea
          value={q5Narrative}
          onChange={(e) => !readOnly && setQ5Narrative(e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
          placeholder="Describe the situation and what made it energising for you — be specific about what you were doing and what mattered to you in the moment."
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

      {/* S6Q6 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          When you reflect honestly on what's actually driven your best work — not what sounds good, but what's genuinely true — which most accurately describes what you find? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q6ShuffledOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && setQ6Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${roAct} ${q6Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
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
