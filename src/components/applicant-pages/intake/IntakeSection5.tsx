import { useState, useEffect } from 'react';
import type { MutableRefObject } from 'react';

interface IntakeSection5Props {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: unknown;
  submitRef?: MutableRefObject<(() => void) | null>;
  hideFooterButton?: boolean;
}

function parseSection5Saved(initialData: unknown) {
  const s = initialData as Record<string, Record<string, unknown>> | undefined;
  if (!s) {
    return {
      q1Choice: null as string | null,
      q1FollowUp: '',
      q2Choice: null as string | null,
      q3Choice: null as string | null,
      q4Choice: null as string | null,
      q5Choice: null as string | null,
      q6Choice: null as string | null,
    };
  }
  return {
    q1Choice: typeof s.S5Q1?.option_id === 'string' ? s.S5Q1.option_id : null,
    q1FollowUp: typeof s.S5Q1?.follow_up === 'string' ? s.S5Q1.follow_up : '',
    q2Choice: typeof s.S5Q2?.option_id === 'string' ? s.S5Q2.option_id : null,
    q3Choice: typeof s.S5Q3?.option_id === 'string' ? s.S5Q3.option_id : null,
    q4Choice: typeof s.S5Q4?.option_id === 'string' ? s.S5Q4.option_id : null,
    q5Choice: typeof s.S5Q5?.option_id === 'string' ? s.S5Q5.option_id : null,
    q6Choice: typeof s.S5Q6?.option_id === 'string' ? s.S5Q6.option_id : null,
  };
}

export function IntakeSection5({ onComplete, initialData, submitRef, hideFooterButton = false }: IntakeSection5Props) {
  const saved = parseSection5Saved(initialData);

  const [q1Choice, setQ1Choice] = useState<string | null>(() => saved.q1Choice);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);
  const [q1FollowUp, setQ1FollowUp] = useState(() => saved.q1FollowUp);
  const q1FollowUpWordCount = q1FollowUp.trim().split(/\s+/).filter(w => w.length > 0).length;

  const [q2Choice, setQ2Choice] = useState<string | null>(() => saved.q2Choice);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q3Choice, setQ3Choice] = useState<string | null>(() => saved.q3Choice);
  const [q3ShuffledOptions, setQ3ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q4Choice, setQ4Choice] = useState<string | null>(() => saved.q4Choice);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q5Choice, setQ5Choice] = useState<string | null>(() => saved.q5Choice);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q6Choice, setQ6Choice] = useState<string | null>(() => saved.q6Choice);
  const [q6ShuffledOptions, setQ6ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  useEffect(() => {
    const q1Options = [
      { id: 'room-a', text: 'Picks up on it immediately and adjusts how they\'re engaging — reads the room carefully before saying much and tries to understand what\'s happening beneath the surface before responding.', scores: { relational_intelligence: 5, communication_confidence: 2 } },
      { id: 'room-b', text: 'Names it directly. If something feels off, prefers bringing it into the open rather than navigating around it — direct acknowledgment usually resolves tension faster than careful navigation.', scores: { relational_intelligence: 2, communication_confidence: 5 } },
      { id: 'room-c', text: 'Notices it and factors it in but doesn\'t change approach dramatically. Stays alert to the dynamics without letting them significantly alter how they show up.', scores: { relational_intelligence: 3, communication_confidence: 4 } },
      { id: 'room-d', text: 'Aware something is off but tends to focus on the task at hand rather than the underlying dynamics. Waits for something more explicit before adjusting how they\'re engaging.', scores: { relational_intelligence: 2, communication_confidence: 3 } },
    ];
    setQ1ShuffledOptions([...q1Options].sort(() => Math.random() - 0.5));

    const q2Options = [
      { id: 'disagree-a', text: 'Prioritises getting the work outcome right even if that means the relationship stays uncomfortable for a while. The best thing for the relationship long-term is delivering well together — tension usually resolves when the work does.', scores: { relational_intelligence: 2, ownership_follow_through: 5 } },
      { id: 'disagree-b', text: 'Addresses the relationship directly and early. Unresolved interpersonal tension affects everything around it — prefers an uncomfortable conversation over letting it sit and compound.', scores: { relational_intelligence: 5, ownership_follow_through: 3 } },
      { id: 'disagree-c', text: 'Tries to separate the two — keeps delivering on the work while finding a natural moment to address the tension. Wouldn\'t let either suffer at the expense of the other.', scores: { relational_intelligence: 4, ownership_follow_through: 4 } },
      { id: 'disagree-d', text: 'Gives it some time and space before intervening. Tension often resolves naturally once the immediate pressure passes — only addresses it directly if it\'s clearly getting worse.', scores: { relational_intelligence: 3, ownership_follow_through: 2 } },
    ];
    setQ2ShuffledOptions([...q2Options].sort(() => Math.random() - 0.5));

    const q3Options = [
      { id: 'style-a', text: 'Adapts style to meet them where they are. Adjusting how to communicate based on the person is just good practice — doesn\'t experience it as compromising how they work.', scores: { relational_intelligence: 5, communication_confidence: 2 } },
      { id: 'style-b', text: 'Stays consistent in how they communicate and trusts that clarity and directness will land well regardless of the other person\'s style. Prefers being predictable and clear over adapting in ways that feel inauthentic.', scores: { relational_intelligence: 2, communication_confidence: 5 } },
      { id: 'style-c', text: 'Adapts somewhat but not completely. Adjusts tone or pace but not the substance of how they communicate — there\'s a point where adapting starts to feel like losing yourself.', scores: { relational_intelligence: 3, communication_confidence: 4 } },
      { id: 'style-d', text: 'Notices the style difference and consciously adjusts approach over time. Might not get it right immediately but works to find a way of communicating that works for both.', scores: { relational_intelligence: 4, communication_confidence: 3 } },
    ];
    setQ3ShuffledOptions([...q3Options].sort(() => Math.random() - 0.5));

    const q4Options = [
      { id: 'trust-a', text: 'Through consistent delivery and demonstrated competence. Trusted because they do what they say they\'ll do and know what they\'re talking about — the relationship follows from the quality of the work.', scores: { relational_intelligence: 2, learning_velocity: 5, ownership_follow_through: 4 } },
      { id: 'trust-b', text: 'Through genuine personal investment in the people around them. Takes time to understand what matters to others, remembers what they\'ve shared, and shows up for them beyond just the work — trust comes from feeling known.', scores: { relational_intelligence: 5, learning_velocity: 2 } },
      { id: 'trust-c', text: 'Through a combination of both — trusted for being reliable and competent but also for genuinely caring about the people. The two can\'t be fully separated.', scores: { relational_intelligence: 4, learning_velocity: 3 } },
      { id: 'trust-d', text: 'Through honest, direct communication over time. Trust comes from people knowing exactly where they stand — prefers being consistently transparent over being strategically warm.', scores: { relational_intelligence: 3, communication_confidence: 5 } },
    ];
    setQ4ShuffledOptions(
      [...q4Options]
        .sort(() => Math.random() - 0.5)
        .map((o) => ({ ...o, scores: o.scores as unknown as Record<string, number> }))
    );

    const q5Options = [
      { id: 'difficult-a', text: 'Focuses on delivering the work regardless of the friction. Keeps interactions professional and minimal, protects output, and doesn\'t invest significant energy in changing the dynamic — some working relationships are just transactional.', scores: { relational_intelligence: 1, ownership_follow_through: 5 } },
      { id: 'difficult-b', text: 'Tries to understand what\'s driving the behaviour before deciding how to respond. People are usually difficult for a reason — understanding what\'s underneath puts them in a much better position to find a way through.', scores: { relational_intelligence: 5, ownership_follow_through: 2 } },
      { id: 'difficult-c', text: 'Addresses it directly. Picks a neutral moment, names what has been noticed, and asks if there\'s something to work through — direct conversation is more effective than either ignoring it or over-analysing it.', scores: { relational_intelligence: 3, communication_confidence: 5, ownership_follow_through: 3 } },
      { id: 'difficult-d', text: 'Adjusts how they\'re engaging to reduce the friction. Thinks about what the other person responds well to and modifies approach — prefers finding a way to make the relationship functional over pushing through the difficulty unchanged.', scores: { relational_intelligence: 4, ownership_follow_through: 3 } },
    ];
    setQ5ShuffledOptions(
      [...q5Options]
        .sort(() => Math.random() - 0.5)
        .map((o) => ({ ...o, scores: o.scores as unknown as Record<string, number> }))
    );

    const q6Options = [
      { id: 'reflect-a', text: 'Recognises their own approach probably contributed to the difficulty in some way and can name specifically how — genuinely curious about what they could have done differently, not just in theory.', scores: { relational_intelligence: 5, communication_confidence: 4, ownership_follow_through: 4 } },
      { id: 'reflect-b', text: 'Sees it primarily as the other person\'s issue to manage — some people are just difficult, and the main task was getting the work done despite that.', scores: { relational_intelligence: 1, communication_confidence: 2, ownership_follow_through: 3 } },
      { id: 'reflect-c', text: 'Can see both sides but is honest that they wouldn\'t change much about how they handled it — acted reasonably and the other person made it unnecessarily hard.', scores: { relational_intelligence: 3, communication_confidence: 3, ownership_follow_through: 3 } },
      { id: 'reflect-d', text: 'Wishes they\'d raised the tension directly sooner rather than navigating around it — the indirect approach probably prolonged something a direct conversation would have resolved faster.', scores: { relational_intelligence: 4, communication_confidence: 5, ownership_follow_through: 4 } },
    ];
    setQ6ShuffledOptions([...q6Options].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    const next = parseSection5Saved(initialData);
    setQ1Choice((prev) => prev ?? next.q1Choice);
    setQ1FollowUp((prev) => (prev.trim() ? prev : next.q1FollowUp));
    setQ2Choice((prev) => prev ?? next.q2Choice);
    setQ3Choice((prev) => prev ?? next.q3Choice);
    setQ4Choice((prev) => prev ?? next.q4Choice);
    setQ5Choice((prev) => prev ?? next.q5Choice);
    setQ6Choice((prev) => prev ?? next.q6Choice);
  }, [initialData]);

  const canProceed = q1Choice && q2Choice && q3Choice && q4Choice && q5Choice && q6Choice;

  const handleNext = () => {
    if (!canProceed) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice)!;
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice)!;
    const q3Option = q3ShuffledOptions.find(o => o.id === q3Choice)!;
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice)!;
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice)!;
    const q6Option = q6ShuffledOptions.find(o => o.id === q6Choice)!;

    onComplete({
      section: 5,
      responses: {
        S5Q1: { question_key: 'S5Q1', option_id: q1Choice, follow_up: q1FollowUp || undefined, scores: q1Option.scores },
        S5Q2: { question_key: 'S5Q2', option_id: q2Choice, scores: q2Option.scores },
        S5Q3: { question_key: 'S5Q3', option_id: q3Choice, scores: q3Option.scores },
        S5Q4: { question_key: 'S5Q4', option_id: q4Choice, scores: q4Option.scores },
        S5Q5: { question_key: 'S5Q5', option_id: q5Choice, scores: q5Option.scores },
        S5Q6: { question_key: 'S5Q6', option_id: q6Choice, scores: q6Option.scores },
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
            <h2 className="text-2xl text-[#111827] mb-2">SECTION 5 — How You Relate to Others</h2>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
              <span className="text-[#7DBBFF] font-medium">
                Dimensions scored: Relational Intelligence (primary), Communication Confidence, Ownership &amp; Follow-Through, Learning Velocity
              </span>
              <span className="text-[#9CA3AF]">•</span>
              <span>Est. time: 8–10 min</span>
            </div>
          </div>

          <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
            <p className="text-sm text-[#111827] leading-relaxed italic">
              "This section is about how you navigate relationships, read situations, and communicate with the people around you. There are no right answers — different approaches work well in different contexts."
            </p>
          </div>
        </>
      ) : null}

      {/* S5Q1 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          You walk into a situation — a meeting, a conversation, a new group — and something feels off. The mood is tense but nobody has said anything directly. Which most accurately describes your natural response? <span className="text-[#EF4444]">*</span>
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
        {q1Choice && (
          <div className="pt-4 mt-6 border-t border-black/[0.08]">
            <label className="block text-sm text-[#6B7280] mb-2">
              Optional: What do you usually do with that read once you have it? (20–40 words)
            </label>
            <textarea
              value={q1FollowUp}
              onChange={e => setQ1FollowUp(e.target.value)}
              placeholder="Optional response..."
              className="w-full h-20 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
              style={{ borderRadius: '12px' }}
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs ${q1FollowUpWordCount >= 20 && q1FollowUpWordCount <= 40 ? 'text-[#10B981]' : 'text-[#6B7280]'}`}>
                {q1FollowUpWordCount} / 40 words
              </span>
            </div>
          </div>
        )}
      </div>

      {/* S5Q2 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          You're in a disagreement with someone you work with regularly. It's starting to affect the working relationship. Which most accurately describes your natural approach? <span className="text-[#EF4444]">*</span>
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

      {/* S5Q3 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          You're working with someone whose communication style is very different from yours. Which most accurately describes how you handle it? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q3ShuffledOptions.map(option => (
            <button key={option.id} onClick={() => setQ3Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${q3Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}>
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S5Q4 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Think about the working relationships where you've felt most effective and trusted. Which most accurately describes how that trust was built? <span className="text-[#EF4444]">*</span>
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
      </div>

      {/* S5Q5 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          You're working with someone who is being consistently difficult — unresponsive, dismissive, or creating friction. The work still needs to get done. Which most accurately describes your approach? <span className="text-[#EF4444]">*</span>
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

      {/* S5Q6 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Thinking back on a working relationship you found genuinely difficult — which most accurately describes how you reflected on your own role in it? <span className="text-[#EF4444]">*</span>
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
