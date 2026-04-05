import { useState, useEffect } from 'react';

interface IntakeSection4Props {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: unknown;
}

export function IntakeSection4({ onComplete }: IntakeSection4Props) {
  const [q1Choice, setQ1Choice] = useState<string | null>(null);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q2Choice, setQ2Choice] = useState<string | null>(null);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q3Choice, setQ3Choice] = useState<string | null>(null);
  const [q3ShuffledOptions, setQ3ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q4Choice, setQ4Choice] = useState<string | null>(null);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q5Choice, setQ5Choice] = useState<string | null>(null);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q6Narrative, setQ6Narrative] = useState('');
  const q6WordCount = q6Narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q6MinWords = 40;
  const q6MaxWords = 80;
  const q6IsValid = q6WordCount >= q6MinWords && q6WordCount <= q6MaxWords;
  const q6IsOverMax = q6WordCount > q6MaxWords;

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

    const q5Options = [
      { id: 'learn-a', text: 'Takes something from difficult experiences but it usually takes time. The reflection comes after the fact — once worked through, looks back and identifies what to do differently.', scores: { resilience: 2, learning_velocity: 3 } },
      { id: 'learn-b', text: 'Difficult experiences are useful reference points but moves through them quickly. Extracts what can be learned, applies it, and moves forward — prolonged reflection produces diminishing returns.', scores: { resilience: 5, learning_velocity: 3 } },
      { id: 'learn-c', text: 'Hard periods take significant energy to get through and most of that energy goes on managing the difficulty itself. The learning tends to come later once there\'s distance from it.', scores: { resilience: 1, learning_velocity: 4 } },
      { id: 'learn-d', text: 'Fairly naturally extracts lessons from difficulty. Tends to process slowly but thoroughly — prefers taking the time to understand something deeply rather than moving on quickly with a partial lesson.', scores: { resilience: 4, learning_velocity: 5 } },
    ];
    setQ5ShuffledOptions([...q5Options].sort(() => Math.random() - 0.5));
  }, []);

  const canProceed = q1Choice && q2Choice && q3Choice && q4Choice && q5Choice && q6IsValid;

  const handleNext = () => {
    if (!canProceed) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice)!;
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice)!;
    const q3Option = q3ShuffledOptions.find(o => o.id === q3Choice)!;
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice)!;
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice)!;

    onComplete({
      section: 4,
      responses: {
        S4Q1: { question_key: 'S4Q1', option_id: q1Choice, scores: q1Option.scores },
        S4Q2: { question_key: 'S4Q2', option_id: q2Choice, scores: q2Option.scores },
        S4Q3: { question_key: 'S4Q3', option_id: q3Choice, scores: q3Option.scores },
        S4Q4: { question_key: 'S4Q4', option_id: q4Choice, scores: q4Option.scores },
        S4Q5: { question_key: 'S4Q5', option_id: q5Choice, scores: q5Option.scores },
        S4Q6: { question_key: 'S4Q6', narrative: q6Narrative, word_count: q6WordCount },
      },
    });
  };

  return (
    <div>
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

      {/* S4Q1 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Think about a time something you'd worked hard on didn't go the way you'd hoped. Which most accurately describes what happened for you? <span className="text-[#EF4444]">*</span>
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

      {/* S4Q2 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Something goes wrong on a piece of work you were involved in. There were things you could have done differently. Which most accurately describes your typical response? <span className="text-[#EF4444]">*</span>
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

      {/* S4Q3 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Think about how you perform when the pressure is genuinely high. Which most accurately describes what tends to happen? <span className="text-[#EF4444]">*</span>
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
          {q4ShuffledOptions.map(option => (
            <button key={option.id} onClick={() => setQ4Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${q4Choice === option.id ? 'border-[#7DBBFF] bg-[#7DBBFF]/10' : 'border-black/[0.08] hover:border-[#7DBBFF]/40'}`}
              style={{ borderRadius: '12px' }}>
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S4Q5 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          Looking back at the harder periods in your work or life — which most accurately describes what you tend to take from those experiences? <span className="text-[#EF4444]">*</span>
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
          onChange={e => setQ6Narrative(e.target.value)}
          placeholder="Example: Led a product launch that missed its revenue target by 40%..."
          className="w-full h-40 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
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

      <div className="flex justify-end">
        <button
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
    </div>
  );
}
