import { useState, useEffect } from 'react';

interface IntakeSection4Props {
  onComplete: (data: { 
    section: number;
    responses: {
      S4Q1: {
        question_key: string;
        option_id: string;
        scores: { resilience: number; ownership: number };
      };
      S4Q2: {
        question_key: string;
        option_id: string;
        scores: { ownership: number; resilience: number };
      };
      S4Q3: {
        question_key: string;
        option_id: string;
        scores: { resilience: number; autonomy: number };
      };
      S4Q4: {
        question_key: string;
        option_id: string;
        scores: { ownership: number; communication_confidence: number };
      };
      S4Q5: {
        question_key: string;
        option_id: string;
        scores: { resilience: number; mastery: number };
      };
      S4Q6: {
        question_key: string;
        narrative: string;
        word_count: number;
      };
    };
  }) => void;
  initialData?: any;
}

export function IntakeSection4({ onComplete, initialData }: IntakeSection4Props) {
  // S4Q1 - Setback response (Anchored Behaviour Scale)
  const [q1Choice, setQ1Choice] = useState<string | null>(null);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<any[]>([]);

  // S4Q2 - When things go wrong (Anchored Behaviour Scale)
  const [q2Choice, setQ2Choice] = useState<string | null>(null);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<any[]>([]);

  // S4Q3 - Performance under pressure (Anchored Behaviour Scale)
  const [q3Choice, setQ3Choice] = useState<string | null>(null);
  const [q3ShuffledOptions, setQ3ShuffledOptions] = useState<any[]>([]);

  // S4Q4 - Commitment becomes demanding (Anchored Behaviour Scale)
  const [q4Choice, setQ4Choice] = useState<string | null>(null);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<any[]>([]);

  // S4Q5 - Learning from difficulty (Anchored Behaviour Scale)
  const [q5Choice, setQ5Choice] = useState<string | null>(null);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<any[]>([]);

  // S4Q6 - Reflective narrative (40-80 words)
  const [q6Narrative, setQ6Narrative] = useState('');
  const q6WordCount = q6Narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q6MinWords = 40;
  const q6MaxWords = 80;
  const q6IsValid = q6WordCount >= q6MinWords && q6WordCount <= q6MaxWords;
  const q6IsOverMax = q6WordCount > q6MaxWords;

  // Shuffle options on mount
  useEffect(() => {
    // S4Q1 options
    const q1Options = [
      { id: 'setback-a', text: 'It was disappointing but I moved through it fairly naturally. I take what I can learn and refocus — I find that sitting with it too long stops me from applying the lesson.', scores: { resilience: 4, ownership: 3 } },
      { id: 'setback-b', text: 'It hit me hard and took genuine time to work through. I care deeply about my work and significant setbacks stay with me — that investment is part of what drives me to do things well in the first place.', scores: { resilience: 1, ownership: 5 } },
      { id: 'setback-c', text: 'I felt the disappointment and moved through it quickly. I\'m more interested in what I can take from it than in sitting with how it felt — I find fast processing more useful than extended reflection.', scores: { resilience: 5, ownership: 2 } },
      { id: 'setback-d', text: 'I felt it and it affected me for a period. Once I\'d worked through the emotional side I could look at what I\'d do differently and move forward with that understanding.', scores: { resilience: 2, ownership: 4 } },
    ];
    setQ1ShuffledOptions([...q1Options].sort(() => Math.random() - 0.5));

    // S4Q2 options
    const q2Options = [
      { id: 'wrong-a', text: 'I acknowledge my part honestly and take time to understand what I\'d do differently. I don\'t rush past it but I don\'t carry it indefinitely either — once I\'ve reflected properly I can move on.', scores: { ownership: 4, resilience: 3 } },
      { id: 'wrong-b', text: 'I identify what I\'d do differently and move quickly to applying it. I find extended analysis of what went wrong less useful than changing my approach going forward.', scores: { ownership: 3, resilience: 5 } },
      { id: 'wrong-c', text: 'I analyse my contribution thoroughly and don\'t move on quickly. I find that sitting with what went wrong — really understanding my part in it — is what stops me making the same mistake again.', scores: { ownership: 5, resilience: 1 } },
      { id: 'wrong-d', text: 'I look at what I could have done better, take the lesson, and refocus. I\'d rather over-own than under-own but I try not to dwell longer than is useful.', scores: { ownership: 4, resilience: 4 } },
    ];
    setQ2ShuffledOptions([...q2Options].sort(() => Math.random() - 0.5));

    // S4Q3 options
    const q3Options = [
      { id: 'press-a', text: 'Pressure tends to lift my output. The focus and urgency of high-stakes situations often produces some of my better work — I access a level of concentration that isn\'t always present in lower-pressure conditions.', scores: { resilience: 5, autonomy: 1 } },
      { id: 'press-b', text: 'Pressure affects my output somewhat. I deliver but I\'m aware it\'s not always my best work — I perform more consistently when I have room to work at a pace that suits me.', scores: { resilience: 2, autonomy: 4 } },
      { id: 'press-c', text: 'I stay fairly consistent under pressure. I feel it but it doesn\'t significantly change what I produce — I tend to deliver regardless of conditions.', scores: { resilience: 4, autonomy: 2 } },
      { id: 'press-d', text: 'My best work comes from having space and time to work properly. When external urgency is high my output suffers — I perform better when I can set my own pace without pressure shaping how I work.', scores: { resilience: 1, autonomy: 5 } },
    ];
    setQ3ShuffledOptions([...q3Options].sort(() => Math.random() - 0.5));

    // S4Q4 options
    const q4Options = [
      { id: 'commit-a', text: 'I flag early if something is becoming harder than expected. I\'d rather reset expectations proactively than quietly struggle — I think communicating difficulty early is part of managing a commitment well.', scores: { ownership: 4, communication_confidence: 4 } },
      { id: 'commit-b', text: 'I push through independently and figure it out as I go. I\'d rather work harder to deliver what I committed to than involve others or reset expectations — I see independent delivery as part of taking a commitment seriously.', scores: { ownership: 5, communication_confidence: 1 } },
      { id: 'commit-c', text: 'I surface problems as soon as they emerge and work with others to find solutions. I see early honest communication about difficulty as taking the commitment more seriously, not less.', scores: { ownership: 3, communication_confidence: 5 } },
      { id: 'commit-d', text: 'I reassess quietly and adjust my approach without making it a big deal. I\'ll deprioritise other things to protect the commitment and only involve others if it becomes genuinely unmanageable.', scores: { ownership: 4, communication_confidence: 2 } },
    ];
    setQ4ShuffledOptions([...q4Options].sort(() => Math.random() - 0.5));

    // S4Q5 options
    const q5Options = [
      { id: 'learn-a', text: 'I take something from difficult experiences but it usually takes time. The reflection comes after the fact — once I\'ve worked through it I look back and identify what I\'d do differently.', scores: { resilience: 2, mastery: 3 } },
      { id: 'learn-b', text: 'Difficult experiences are useful reference points but I move through them quickly. I extract what I can, apply it, and move forward — I find that prolonged reflection produces diminishing returns for me.', scores: { resilience: 5, mastery: 3 } },
      { id: 'learn-c', text: 'Hard periods take significant energy to get through and I focus most of that energy on managing the difficulty itself. The learning tends to come later once I\'ve had distance from it.', scores: { resilience: 1, mastery: 4 } },
      { id: 'learn-d', text: 'I fairly naturally extract lessons from difficulty. I tend to process slowly but thoroughly — I\'d rather take the time to understand something deeply than move on quickly with a partial lesson.', scores: { resilience: 4, mastery: 5 } },
    ];
    setQ5ShuffledOptions([...q5Options].sort(() => Math.random() - 0.5));
  }, []);

  const canProceed = q1Choice && q2Choice && q3Choice && q4Choice && q5Choice && q6IsValid;

  const handleNext = () => {
    if (!canProceed) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice);
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice);
    const q3Option = q3ShuffledOptions.find(o => o.id === q3Choice);
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice);
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice);

    onComplete({
      section: 4,
      responses: {
        S4Q1: {
          question_key: 'S4Q1',
          option_id: q1Choice,
          scores: q1Option.scores,
        },
        S4Q2: {
          question_key: 'S4Q2',
          option_id: q2Choice,
          scores: q2Option.scores,
        },
        S4Q3: {
          question_key: 'S4Q3',
          option_id: q3Choice,
          scores: q3Option.scores,
        },
        S4Q4: {
          question_key: 'S4Q4',
          option_id: q4Choice,
          scores: q4Option.scores,
        },
        S4Q5: {
          question_key: 'S4Q5',
          option_id: q5Choice,
          scores: q5Option.scores,
        },
        S4Q6: {
          question_key: 'S4Q6',
          narrative: q6Narrative,
          word_count: q6WordCount,
        },
      },
    });
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#111827] mb-2">
          SECTION 4 — How You Handle Difficulty
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
          <span className="text-[#7DBBFF] font-medium">
            Dimensions scored: Resilience (primary), Ownership (primary), Learning Velocity, Communication Confidence, Autonomy, Mastery
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span>Est. time: 8–10 min</span>
        </div>
      </div>

      {/* Framing */}
      <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
        <p className="text-sm text-[#111827] leading-relaxed italic">
          "Every role has hard moments — setbacks, pressure, things that don't go to plan. This section isn't looking for perfect responses. It's interested in what actually happens for you when things get difficult."
        </p>
      </div>

      {/* S4Q1 - Setbacks and disappointment */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Think about a time something you'd worked hard on didn't go the way you'd hoped. Which most accurately describes what happened for you? <span className="text-[#EF4444]">*</span>
          </h3>
        </div>

        <div className="space-y-3">
          {q1ShuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setQ1Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q1Choice === option.id
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10'
                  : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S4Q2 - When things go wrong */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Something goes wrong on a piece of work you were involved in. There were things you could have done differently. Which most accurately describes your typical response? <span className="text-[#EF4444]">*</span>
          </h3>
        </div>

        <div className="space-y-3">
          {q2ShuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setQ2Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q2Choice === option.id
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10'
                  : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S4Q3 - Performance under pressure */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Think about how you perform when the pressure is genuinely high — a tight deadline, a difficult situation, a period where a lot is riding on you. Which most accurately describes what tends to happen? <span className="text-[#EF4444]">*</span>
          </h3>
        </div>

        <div className="space-y-3">
          {q3ShuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setQ3Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q3Choice === option.id
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10'
                  : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>

        {/* Cross-check note */}
        <div className="mt-4 text-xs text-[#6B7280] bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
          <span className="font-medium text-[#111827]">Consistency check:</span> Your response here is compared with S2Q5 (Section 2) for significant inconsistencies.
        </div>
      </div>

      {/* S4Q4 - Commitment becomes demanding */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            You've taken on a significant commitment and it becomes more demanding than you expected. Which most accurately describes your natural approach? <span className="text-[#EF4444]">*</span>
          </h3>
        </div>

        <div className="space-y-3">
          {q4ShuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setQ4Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q4Choice === option.id
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10'
                  : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S4Q5 - Learning from difficulty */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Looking back at the harder periods in your work or life — times things didn't go to plan or required more from you than you expected — which most accurately describes what you tend to take from those experiences? <span className="text-[#EF4444]">*</span>
          </h3>
        </div>

        <div className="space-y-3">
          {q5ShuffledOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setQ5Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q5Choice === option.id
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10'
                  : 'border-black/[0.08] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <p className="text-sm text-[#111827] leading-relaxed">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* S4Q6 - Reflective narrative */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Reflective narrative <span className="text-[#EF4444]">*</span>
          </h3>
          
          {/* Two-tier prompts */}
          <div className="space-y-3">
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

          <div className="mt-3 text-xs text-[#9CA3AF] italic">
            LLM consistency check: does the narrative align with your structured option selections above?
          </div>
        </div>

        <textarea
          value={q6Narrative}
          onChange={(e) => setQ6Narrative(e.target.value)}
          placeholder="Example: Led a product launch that missed its revenue target by 40%. I'd pushed for an aggressive timeline against some internal resistance. When numbers came in low, I took full ownership in the post-mortem, identified where my assumptions had been wrong, and used that to inform the next iteration. The product eventually hit target three months later with a revised approach..."
          className="w-full h-40 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />

        {/* Word count and validation feedback */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280]">
                Required: {q6MinWords}–{q6MaxWords} words
              </span>
              {q6IsOverMax && (
                <span className="text-[#EF4444] font-medium">
                  Maximum exceeded
                </span>
              )}
            </div>
            <div className={`font-medium tabular-nums ${
              q6WordCount < q6MinWords 
                ? 'text-[#9CA3AF]' 
                : q6IsValid 
                  ? 'text-[#10B981]' 
                  : 'text-[#EF4444]'
            }`}>
              {q6WordCount} / {q6MaxWords} words
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${
                q6WordCount < q6MinWords
                  ? 'bg-[#9CA3AF]'
                  : q6IsValid
                    ? 'bg-[#10B981]'
                    : 'bg-[#EF4444]'
              }`}
              style={{ width: `${Math.min((q6WordCount / q6MaxWords) * 100, 100)}%` }}
            />
          </div>

          {q6WordCount < q6MinWords && (
            <p className="text-xs text-[#6B7280]">
              {q6MinWords - q6WordCount} more {q6MinWords - q6WordCount === 1 ? 'word' : 'words'} required
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
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
    </div>
  );
}