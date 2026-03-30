import { useState, useEffect } from 'react';

interface IntakeSection5Props {
  onComplete: (data: { 
    section: number;
    responses: {
      S5Q1: {
        question_key: string;
        option_id: string;
        follow_up?: string;
        scores: { relational_intelligence: number; communication_confidence: number };
      };
      S5Q2: {
        question_key: string;
        option_id: string;
        scores: { relational_intelligence: number; ownership: number };
      };
      S5Q3: {
        question_key: string;
        option_id: string;
        scores: { relational_intelligence: number; communication_confidence: number };
      };
      S5Q4: {
        question_key: string;
        option_id: string;
        scores: Record<string, number>;
      };
      S5Q5: {
        question_key: string;
        option_id: string;
        scores: Record<string, number>;
      };
      S5Q6: {
        question_key: string;
        narrative: string;
        word_count: number;
        llm_scores?: {
          empathy_perspective_taking: number;
          outcome_orientation: number;
          self_awareness: number;
          communication_approach: number;
        };
      };
    };
  }) => void;
  initialData?: any;
}

export function IntakeSection5({ onComplete, initialData }: IntakeSection5Props) {
  // S5Q1 - Reading the room (Anchored Behaviour Scale)
  const [q1Choice, setQ1Choice] = useState<string | null>(null);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<any[]>([]);
  const [q1FollowUp, setQ1FollowUp] = useState('');
  const q1FollowUpWordCount = q1FollowUp.trim().split(/\s+/).filter(w => w.length > 0).length;

  // S5Q2 - Disagreement affecting relationship (Anchored Behaviour Scale)
  const [q2Choice, setQ2Choice] = useState<string | null>(null);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<any[]>([]);

  // S5Q3 - Different communication styles (Anchored Behaviour Scale)
  const [q3Choice, setQ3Choice] = useState<string | null>(null);
  const [q3ShuffledOptions, setQ3ShuffledOptions] = useState<any[]>([]);

  // S5Q4 - How trust is built (Anchored Behaviour Scale)
  const [q4Choice, setQ4Choice] = useState<string | null>(null);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<any[]>([]);

  // S5Q5 - Difficult person (Anchored Behaviour Scale)
  const [q5Choice, setQ5Choice] = useState<string | null>(null);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<any[]>([]);

  // S5Q6 - Reflective narrative (50-100 words)
  const [q6Narrative, setQ6Narrative] = useState('');
  const q6WordCount = q6Narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q6MinWords = 50;
  const q6MaxWords = 100;
  const q6IsValid = q6WordCount >= q6MinWords && q6WordCount <= q6MaxWords;
  const q6IsOverMax = q6WordCount > q6MaxWords;

  // Shuffle options on mount
  useEffect(() => {
    // S5Q1 options
    const q1Options = [
      { id: 'room-a', text: 'I pick up on it immediately and adjust how I\'m engaging — I read the room carefully before saying much and try to understand what\'s happening beneath the surface before I respond to it.', scores: { relational_intelligence: 5, communication_confidence: 2 } },
      { id: 'room-b', text: 'I\'d name it directly. If something feels off I\'d rather bring it into the open than navigate around it — I think direct acknowledgment usually resolves tension faster than careful navigation.', scores: { relational_intelligence: 2, communication_confidence: 5 } },
      { id: 'room-c', text: 'I notice it and factor it in but I don\'t change my approach dramatically. I stay alert to the dynamics without letting them significantly alter how I show up.', scores: { relational_intelligence: 3, communication_confidence: 4 } },
      { id: 'room-d', text: 'I\'m aware something is off but I tend to focus on the task at hand rather than the underlying dynamics. I\'d wait for something more explicit before adjusting how I\'m engaging.', scores: { relational_intelligence: 2, communication_confidence: 3 } },
    ];
    setQ1ShuffledOptions([...q1Options].sort(() => Math.random() - 0.5));

    // S5Q2 options
    const q2Options = [
      { id: 'disagree-a', text: 'I\'d prioritise getting the work outcome right even if that means the relationship stays uncomfortable for a while. I think the best thing for the relationship long-term is delivering well together — the tension usually resolves when the work does.', scores: { relational_intelligence: 2, ownership: 5 } },
      { id: 'disagree-b', text: 'I\'d address the relationship directly and early. I find that unresolved interpersonal tension affects everything around it — I\'d rather have an uncomfortable conversation than let it sit and compound.', scores: { relational_intelligence: 5, ownership: 3 } },
      { id: 'disagree-c', text: 'I\'d try to separate the two — keep delivering on the work while finding a natural moment to address the tension. I wouldn\'t let either suffer at the expense of the other.', scores: { relational_intelligence: 4, ownership: 4 } },
      { id: 'disagree-d', text: 'I\'d give it some time and space before intervening. Tension often resolves naturally once the immediate pressure passes — I\'d only address it directly if it was clearly getting worse.', scores: { relational_intelligence: 3, ownership: 2 } },
    ];
    setQ2ShuffledOptions([...q2Options].sort(() => Math.random() - 0.5));

    // S5Q3 options
    const q3Options = [
      { id: 'style-a', text: 'I adapt my style to meet them where they are. I find that adjusting how I communicate based on the person I\'m talking to is just good practice — I don\'t experience it as compromising how I work.', scores: { relational_intelligence: 5, communication_confidence: 2 } },
      { id: 'style-b', text: 'I stay consistent in how I communicate and trust that clarity and directness will land well regardless of the other person\'s style. I\'d rather be predictable and clear than adapt in ways that feel inauthentic.', scores: { relational_intelligence: 2, communication_confidence: 5 } },
      { id: 'style-c', text: 'I\'d adapt somewhat but not completely. I\'d adjust my tone or pace but I wouldn\'t change the substance of how I communicate — there\'s a point where adapting starts to feel like losing yourself.', scores: { relational_intelligence: 3, communication_confidence: 4 } },
      { id: 'style-d', text: 'I\'d notice the style difference and consciously adjust my approach over time. I might not get it right immediately but I\'d work to find a way of communicating that works for both of us.', scores: { relational_intelligence: 4, communication_confidence: 3 } },
    ];
    setQ3ShuffledOptions([...q3Options].sort(() => Math.random() - 0.5));

    // S5Q4 options
    const q4Options = [
      { id: 'trust-a', text: 'Through consistent delivery and demonstrated competence. The people I work with trust me because I do what I say I\'ll do and know what I\'m talking about — the relationship follows from the quality of the work.', scores: { relational_intelligence: 2, learning_velocity: 5, ownership: 4 } },
      { id: 'trust-b', text: 'Through genuine personal investment in the people around me. I take time to understand what matters to others, remember what they\'ve told me, and show up for them beyond just the work — trust comes from feeling known.', scores: { relational_intelligence: 5, learning_velocity: 2 } },
      { id: 'trust-c', text: 'Through a combination of both — I think people trust me because I\'m reliable and competent but also because I genuinely care about them as people. I don\'t think you can fully separate the two.', scores: { relational_intelligence: 4, learning_velocity: 3 } },
      { id: 'trust-d', text: 'Through honest, direct communication over time. I think trust comes from people knowing exactly where they stand with me — I\'d rather be consistently transparent than strategically warm.', scores: { relational_intelligence: 3, communication_confidence: 5 } },
    ];
    setQ4ShuffledOptions([...q4Options].sort(() => Math.random() - 0.5));

    // S5Q5 options
    const q5Options = [
      { id: 'difficult-a', text: 'I\'d focus on delivering the work regardless of the friction. I\'d keep my interactions professional and minimal, protect my output, and not invest significant energy in changing the dynamic — some working relationships are just transactional.', scores: { relational_intelligence: 1, ownership: 5 } },
      { id: 'difficult-b', text: 'I\'d try to understand what\'s driving their behaviour before deciding how to respond. People are usually difficult for a reason — if I can understand what\'s underneath it I\'m in a much better position to find a way through.', scores: { relational_intelligence: 5, ownership: 2 } },
      { id: 'difficult-c', text: 'I\'d address it directly with them. I\'d pick a neutral moment, name what I\'ve noticed, and ask if there\'s something we need to work through — I find direct conversation more effective than either ignoring it or over-analysing it.', scores: { relational_intelligence: 3, communication_confidence: 5, ownership: 3 } },
      { id: 'difficult-d', text: 'I\'d adjust how I\'m engaging with them to reduce the friction. I\'d think about what they respond well to and modify my approach — I\'d rather find a way to make the relationship functional than push through the difficulty unchanged.', scores: { relational_intelligence: 4, ownership: 3 } },
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
      section: 5,
      responses: {
        S5Q1: {
          question_key: 'S5Q1',
          option_id: q1Choice,
          follow_up: q1FollowUp || undefined,
          scores: q1Option.scores,
        },
        S5Q2: {
          question_key: 'S5Q2',
          option_id: q2Choice,
          scores: q2Option.scores,
        },
        S5Q3: {
          question_key: 'S5Q3',
          option_id: q3Choice,
          scores: q3Option.scores,
        },
        S5Q4: {
          question_key: 'S5Q4',
          option_id: q4Choice,
          scores: q4Option.scores,
        },
        S5Q5: {
          question_key: 'S5Q5',
          option_id: q5Choice,
          scores: q5Option.scores,
        },
        S5Q6: {
          question_key: 'S5Q6',
          narrative: q6Narrative,
          word_count: q6WordCount,
          // Note: LLM scoring would happen server-side after submission
        },
      },
    });
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#111827] mb-2">
          SECTION 5 — How You Relate to Others
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
          <span className="text-[#7DBBFF] font-medium">
            Dimensions scored: Relational Intelligence (primary), Communication Confidence, Ownership, Learning Velocity
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span>Est. time: 8–10 min</span>
        </div>
      </div>

      {/* Framing */}
      <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
        <p className="text-sm text-[#111827] leading-relaxed italic">
          "This section is about how you navigate relationships, read situations, and communicate with the people around you. There are no right answers — different approaches work well in different contexts."
        </p>
      </div>

      {/* S5Q1 - Reading the room */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            You walk into a situation — a meeting, a conversation, a new group — and something feels off. The mood is tense but nobody has said anything directly. Which most accurately describes your natural response? <span className="text-[#EF4444]">*</span>
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

        {/* Optional Follow-up */}
        {q1Choice && (
          <div className="pt-4 mt-6 border-t border-black/[0.08]">
            <label className="block text-sm text-[#6B7280] mb-2">
              Optional: What do you usually do with that read once you have it? (20–40 words)
            </label>
            <textarea
              value={q1FollowUp}
              onChange={(e) => setQ1FollowUp(e.target.value)}
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

      {/* S5Q2 - Handling disagreements */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            You're in a disagreement with someone you work with regularly. It's starting to affect the working relationship. Which most accurately describes your natural approach? <span className="text-[#EF4444]">*</span>
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

      {/* S5Q3 - Adapting to communication styles */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            You're working with someone whose communication style is very different from yours — either much more direct than you're comfortable with, or much more indirect. Which most accurately describes how you handle it? <span className="text-[#EF4444]">*</span>
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
      </div>

      {/* S5Q4 - Building trust */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Think about the working relationships where you've felt most effective and trusted. Which most accurately describes how that trust was built? <span className="text-[#EF4444]">*</span>
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

      {/* S5Q5 - Working with difficult people */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            You're working with someone who is being consistently difficult — unresponsive, dismissive, or creating friction. The work still needs to get done. Which most accurately describes your approach? <span className="text-[#EF4444]">*</span>
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

      {/* S5Q6 - Reflective narrative */}
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
                Describe a situation where you had to work with someone you found genuinely difficult — a colleague, a client, a manager. What made it difficult, what did you do, and how did it resolve?
              </p>
            </div>
            
            <div className="bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '10px' }}>
              <div className="text-xs font-semibold text-[#7DBBFF] mb-2">EARLY CAREER</div>
              <p className="text-sm text-[#111827] leading-relaxed">
                Describe a situation where you had to navigate a relationship that felt difficult or uncomfortable. What made it hard and what did you do?
              </p>
            </div>
          </div>

          {/* LLM Rubric Info */}
          <details className="mt-4 bg-[#F0F9FF] border border-[#7DBBFF]/20 p-3 text-xs text-[#6B7280]" style={{ borderRadius: '8px' }}>
            <summary className="font-medium cursor-pointer select-none">
              How this response is scored (LLM rubric)
            </summary>
            <div className="mt-3 space-y-2 leading-relaxed">
              <p><span className="font-semibold text-[#111827]">Empathy / perspective-taking</span> → Relational Intelligence (Do you show curiosity about why the other person behaved as they did?)</p>
              <p><span className="font-semibold text-[#111827]">Outcome orientation</span> → Ownership (Do you focus on resolving the situation or describing how difficult it was?)</p>
              <p><span className="font-semibold text-[#111827]">Self-awareness</span> → Relational Intelligence (Do you acknowledge your own role in the dynamic?)</p>
              <p><span className="font-semibold text-[#111827]">Communication approach</span> → Communication Confidence (Do you describe direct intentional communication or avoidance?)</p>
              <p className="italic text-[#9CA3AF] mt-3">This narrative is the most important consistency check for Relational Intelligence specifically.</p>
            </div>
          </details>
        </div>

        <textarea
          value={q6Narrative}
          onChange={(e) => setQ6Narrative(e.target.value)}
          placeholder="Example: Worked with a senior stakeholder who dismissed my input in meetings and went around me to my manager. It was frustrating but I realized they'd had a bad experience with my predecessor. I scheduled a 1:1, acknowledged the history, and asked what would help rebuild trust. Turned out they needed more frequent updates and direct communication. Once I adjusted, the dynamic shifted completely..."
          className="w-full h-56 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
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