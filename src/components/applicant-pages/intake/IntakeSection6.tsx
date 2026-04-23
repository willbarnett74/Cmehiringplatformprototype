import { useState, useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { RankedPreference, type RankItem } from './RankedPreference';

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
}

export function IntakeSection6({ onComplete, submitRef, hideFooterButton = false }: IntakeSection6Props) {
  const [q1Choice, setQ1Choice] = useState<string | null>(null);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q2Choice, setQ2Choice] = useState<string | null>(null);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q3OrderedIds, setQ3OrderedIds] = useState<string[]>([]);
  const [q3Scores, setQ3Scores] = useState<Record<string, number>>({});

  const [q4Choice, setQ4Choice] = useState<string | null>(null);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q5Choice, setQ5Choice] = useState<string | null>(null);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q6Choice, setQ6Choice] = useState<string | null>(null);
  const [q6ShuffledOptions, setQ6ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

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

    const q5Options = [
      { id: 'worth-a', text: 'Being part of something that matters beyond their own contribution. Work is most meaningful when contributing to a shared goal or a larger purpose — individual autonomy matters less than whether the collective outcome is significant.', scores: { motivational_fit_impact: 5, motivational_fit_autonomy: 1 } },
      { id: 'worth-b', text: 'Having genuine independence over how the work gets done. Work is most meaningful when there\'s real ownership over approach, priorities, and decisions — more motivated by self-direction than by being part of a collective outcome.', scores: { motivational_fit_autonomy: 5, motivational_fit_impact: 2 } },
      { id: 'worth-c', text: 'A combination of meaningful work and genuine independence. Contributing to something that matters while having the freedom to pursue it in their own way — either without the other feels incomplete.', scores: { motivational_fit_impact: 3, motivational_fit_autonomy: 4 } },
      { id: 'worth-d', text: 'Knowing that the people they\'re working with and for value what they bring. The relationships and the recognition within the work matter as much as the independence or the collective outcome.', scores: { motivational_fit_recognition: 4, motivational_fit_impact: 2, motivational_fit_autonomy: 2 } },
    ];
    setQ5ShuffledOptions(
      [...q5Options]
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

  const handleRankChange = (orderedIds: string[], scores: Record<string, number>) => {
    setQ3OrderedIds(orderedIds);
    setQ3Scores(scores);
  };

  const canProceed =
    q1Choice && q2Choice && q3OrderedIds.length === RANK_ITEMS.length &&
    q4Choice && q5Choice && q6Choice;

  const handleNext = () => {
    if (!canProceed) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice)!;
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice)!;
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice)!;
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice)!;
    const q6Option = q6ShuffledOptions.find(o => o.id === q6Choice)!;

    // Build motivational_fit_* scores from ranking
    const q3MotiScores: Record<string, number> = {};
    q3OrderedIds.forEach((id, idx) => {
      q3MotiScores[`motivational_fit_${id}`] = q3Scores[id] ?? (4 - idx);
    });

    onComplete({
      section: 6,
      responses: {
        S6Q1: { question_key: 'S6Q1', option_id: q1Choice, scores: q1Option.scores },
        S6Q2: { question_key: 'S6Q2', option_id: q2Choice, scores: q2Option.scores },
        S6Q3: { question_key: 'S6Q3', ordered_ids: q3OrderedIds, scores: q3MotiScores },
        S6Q4: { question_key: 'S6Q4', option_id: q4Choice, scores: q4Option.scores },
        S6Q5: { question_key: 'S6Q5', option_id: q5Choice, scores: q5Option.scores },
        S6Q6: { question_key: 'S6Q6', option_id: q6Choice, scores: q6Option.scores },
      },
    });
  };

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
          {q1ShuffledOptions.map(option => (
            <button key={option.id} onClick={() => setQ1Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${q1Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}>
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
          {q2ShuffledOptions.map(option => (
            <button key={option.id} onClick={() => setQ2Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${q2Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}>
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
        <RankedPreference items={RANK_ITEMS} onChange={handleRankChange} />
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
          {q4ShuffledOptions.map(option => (
            <button key={option.id} onClick={() => setQ4Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${q4Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}>
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs text-[#6B7280] bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
          <span className="font-medium text-[#111827]">Note:</span> Option A is designed to feel genuinely selectable. External motivation is real, valid, and valuable in the right roles.
        </div>
      </div>

      {/* S6Q5 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Which most accurately describes what makes a role feel genuinely worthwhile to you? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q5ShuffledOptions.map(option => (
            <button key={option.id} onClick={() => setQ5Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${q5Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}>
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S6Q6 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          When you reflect honestly on what's actually driven your best work — not what sounds good, but what's genuinely true — which most accurately describes what you find? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q6ShuffledOptions.map(option => (
            <button key={option.id} onClick={() => setQ6Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${q6Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}>
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
            disabled={!canProceed}
            className={`px-6 py-3 text-sm font-medium transition-all shadow-sm ${
              canProceed ? 'bg-[#7DBBFF] text-white hover:bg-[#6AABEF] hover:shadow-md' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
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
