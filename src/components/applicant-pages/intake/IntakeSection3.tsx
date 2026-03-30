import { useState, useEffect } from 'react';

interface IntakeSection3Props {
  onComplete: (data: { 
    section: number;
    responses: {
      S3Q1: {
        question_key: string;
        option_id: 'lv-a' | 'lv-b' | 'lv-c' | 'lv-d';
        scores: { learning_velocity: number };
      };
      S3Q2: {
        question_key: string;
        option_id: 'view-a' | 'view-b' | 'view-c' | 'view-d';
        scores: { learning_velocity: number; communication_confidence: number };
      };
      S3Q3: {
        question_key: string;
        narrative: string;
        word_count: number;
        llm_scores?: {
          clarity_of_reasoning: number;
          handling_ambiguity: number;
          initiative_and_ownership: number;
          communication_intent: number;
        };
      };
      S3Q4: {
        question_key: string;
        option_id: 'dis-a' | 'dis-b' | 'dis-c' | 'dis-d';
        scores: { communication_confidence: number; ownership_follow_through: number };
      };
      S3Q5: {
        question_key: string;
        option_id: 'comm-a' | 'comm-b' | 'comm-c' | 'comm-d';
        scores: { communication_confidence: number };
      };
    };
  }) => void;
  initialData?: any;
}

export function IntakeSection3({ onComplete, initialData }: IntakeSection3Props) {
  // S3Q1 - Learning approach (Anchored Behaviour Scale)
  const [q1Choice, setQ1Choice] = useState<'lv-a' | 'lv-b' | 'lv-c' | 'lv-d' | null>(null);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<any[]>([]);

  // S3Q2 - Forming and holding views (Anchored Behaviour Scale)
  const [q2Choice, setQ2Choice] = useState<'view-a' | 'view-b' | 'view-c' | 'view-d' | null>(null);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<any[]>([]);

  // S3Q3 - Behavioural Task (LLM rubric scored)
  const [q3Narrative, setQ3Narrative] = useState('');
  const q3WordCount = q3Narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q3MinWords = 80;
  const q3MaxWords = 150;
  const q3IsValid = q3WordCount >= q3MinWords && q3WordCount <= q3MaxWords;
  const q3IsOverMax = q3WordCount > q3MaxWords;

  // S3Q4 - Disagreement handling (Anchored Behaviour Scale)
  const [q4Choice, setQ4Choice] = useState<'dis-a' | 'dis-b' | 'dis-c' | 'dis-d' | null>(null);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<any[]>([]);

  // S3Q5 - Explaining complex topics (Anchored Behaviour Scale)
  const [q5Choice, setQ5Choice] = useState<'comm-a' | 'comm-b' | 'comm-c' | 'comm-d' | null>(null);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<any[]>([]);

  // Shuffle options on mount
  useEffect(() => {
    // S3Q1 options
    const q1Options = [
      { id: 'lv-a', text: 'I like to take my time with new things. I go deep before I feel confident applying something — I\'d rather be thorough than move quickly and miss something important.', scores: { learning_velocity: 1 } },
      { id: 'lv-b', text: 'I tend to get on top of new things reasonably quickly. Once I have a solid grounding I can move independently without needing a lot of ongoing guidance.', scores: { learning_velocity: 4 } },
      { id: 'lv-c', text: 'New things tend to click for me fairly quickly. I connect what I\'m learning to things I already know and usually feel confident applying something before I\'ve had a lot of time with it.', scores: { learning_velocity: 5 } },
      { id: 'lv-d', text: 'I learn at a deliberate pace. I like to revisit material, let things settle, and build up a solid understanding over time before I feel genuinely confident applying something independently.', scores: { learning_velocity: 2 } },
    ];
    setQ1ShuffledOptions([...q1Options].sort(() => Math.random() - 0.5));

    // S3Q2 options
    const q2Options = [
      { id: 'view-a', text: 'I form strong views and hold them firmly. I take a lot of convincing to change my position — I see consistency and conviction as a strength and I don\'t shift easily under social pressure.', scores: { learning_velocity: 1, communication_confidence: 4 } },
      { id: 'view-b', text: 'I hold views but update them when the argument is strong enough. I try to separate my ego from my opinions — if someone makes a better point I\'d rather acknowledge it than defend a weaker position.', scores: { learning_velocity: 4, communication_confidence: 4 } },
      { id: 'view-c', text: 'I actively seek out challenges to my thinking. I form strong views but I\'m genuinely open to better ones — if someone makes a more compelling argument I\'ll update my position and move on.', scores: { learning_velocity: 5, communication_confidence: 3 } },
      { id: 'view-d', text: 'I develop considered positions and don\'t change them lightly. I\'ll engage seriously with a counter-argument but I need substantial evidence before I\'d update my view.', scores: { learning_velocity: 2, communication_confidence: 3 } },
    ];
    setQ2ShuffledOptions([...q2Options].sort(() => Math.random() - 0.5));

    // S3Q4 options
    const q4Options = [
      { id: 'dis-a', text: 'I\'d find the right moment to raise my concern directly with the person involved, framing it as a question or alternative perspective rather than a direct challenge.', scores: { communication_confidence: 4, ownership_follow_through: 4 } },
      { id: 'dis-b', text: 'I\'d accept the decision and direct my energy toward executing it as well as possible. In my experience, debating decisions that have already been made rarely changes the outcome — I\'d rather demonstrate value through the quality of my work.', scores: { communication_confidence: 2, ownership_follow_through: 3 } },
      { id: 'dis-c', text: 'I\'d raise my disagreement clearly and directly at the earliest appropriate moment. I\'d be respectful but I wouldn\'t dilute my view — I think honest challenge is part of doing a good job.', scores: { communication_confidence: 5, ownership_follow_through: 5 } },
      { id: 'dis-d', text: 'I\'d note my disagreement privately and look for ways to demonstrate through my work that a different approach might be better. I\'d rather let results make the argument than create friction directly.', scores: { communication_confidence: 3, ownership_follow_through: 4 } },
    ];
    setQ4ShuffledOptions([...q4Options].sort(() => Math.random() - 0.5));

    // S3Q5 options
    const q5Options = [
      { id: 'comm-a', text: 'I actively adjust to my audience. I\'ll find an analogy, cut the jargon, and test whether it\'s landing as I go — I\'d rather explain something twice in different ways than lose someone once.', scores: { communication_confidence: 4 } },
      { id: 'comm-b', text: 'I give people the context I think they need and follow up afterwards to check it landed. I\'d rather confirm understanding after the fact than interrupt the flow of an explanation to keep checking in.', scores: { communication_confidence: 3 } },
      { id: 'comm-c', text: 'I tend to strip explanations right back to the core of what the other person needs. I\'m probably guilty of oversimplifying sometimes but I\'d rather re-add detail than lose someone in complexity.', scores: { communication_confidence: 4 } },
      { id: 'comm-d', text: 'I prioritise completeness. It\'s important to me that the person has the full picture, even if that means a longer explanation. Oversimplifying feels like doing them a disservice.', scores: { communication_confidence: 3 } },
    ];
    setQ5ShuffledOptions([...q5Options].sort(() => Math.random() - 0.5));
  }, []);

  const canProceed = q1Choice && q2Choice && q3IsValid && q4Choice && q5Choice;

  const handleNext = () => {
    if (!canProceed) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice);
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice);
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice);
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice);

    onComplete({
      section: 3,
      responses: {
        S3Q1: {
          question_key: 'S3Q1',
          option_id: q1Choice,
          scores: q1Option.scores,
        },
        S3Q2: {
          question_key: 'S3Q2',
          option_id: q2Choice,
          scores: q2Option.scores,
        },
        S3Q3: {
          question_key: 'S3Q3',
          narrative: q3Narrative,
          word_count: q3WordCount,
          // Note: LLM scoring would happen server-side after submission
          // Placeholder for the four rubric scores that would be returned
        },
        S3Q4: {
          question_key: 'S3Q4',
          option_id: q4Choice,
          scores: q4Option.scores,
        },
        S3Q5: {
          question_key: 'S3Q5',
          option_id: q5Choice,
          scores: q5Option.scores,
        },
      },
    });
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#111827] mb-2">
          SECTION 3 — How You Think
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
          <span className="text-[#7DBBFF] font-medium">
            Dimensions scored: Learning Velocity, Communication Confidence, Ownership & Follow-Through
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span>Est. time: 10–12 min</span>
        </div>
      </div>

      {/* Framing */}
      <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
        <p className="text-sm text-[#111827] leading-relaxed italic">
          "This section is about how you approach new situations, process information, and communicate your thinking. There are no right answers — we're genuinely interested in how your mind works."
        </p>
      </div>

      {/* S3Q1 - Learning approach (Anchored Behaviour Scale) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            When you encounter something new that you need to get on top of — a skill, a system, a role — which most accurately describes how that typically goes? <span className="text-[#EF4444]">*</span>
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

      {/* S3Q2 - Forming and holding views (Anchored Behaviour Scale) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            When it comes to forming and holding views, which most accurately describes you? <span className="text-[#EF4444]">*</span>
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

      {/* S3Q3 - Behavioural Task (LLM rubric scored) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Read the following situation and tell us what you'd do <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
            There's no right answer — we're interested in how you think through it.
          </p>

          {/* Scenario */}
          <div className="bg-[#F9FAFB] border border-black/[0.06] p-5 mb-4" style={{ borderRadius: '12px' }}>
            <div className="text-xs font-semibold text-[#7DBBFF] mb-3">SCENARIO</div>
            <p className="text-sm text-[#111827] leading-relaxed mb-3">
              You've just started in a new role — two weeks in. Your manager pulls you aside before heading into back-to-back meetings and says: <span className="italic">"Can you sort out the situation with the Henderson account before end of day? They're not happy."</span> Then they're gone.
            </p>
            <p className="text-sm text-[#111827] leading-relaxed mb-3">
              You have no handover notes on Henderson. You can find the account history in the system but it will take time to piece together. It's 11am. Your manager is unavailable until 4pm.
            </p>
            <p className="text-sm text-[#111827] leading-relaxed font-medium">
              What do you do? Walk us through your thinking and the actions you'd take.
            </p>
          </div>

          {/* LLM Rubric Info */}
          <details className="mb-4 bg-[#F0F9FF] border border-[#7DBBFF]/20 p-3 text-xs text-[#6B7280]" style={{ borderRadius: '8px' }}>
            <summary className="font-medium cursor-pointer select-none">
              How this response is scored
            </summary>
            <div className="mt-3 space-y-2 leading-relaxed">
              <p><span className="font-semibold text-[#111827]">Clarity of reasoning</span> → Learning Velocity (explains logic clearly vs vague)</p>
              <p><span className="font-semibold text-[#111827]">Handling ambiguity</span> → Learning Velocity (acknowledges unknowns and adapts)</p>
              <p><span className="font-semibold text-[#111827]">Initiative and ownership</span> → Ownership & Follow-Through (takes ownership of outcome, not just tasks)</p>
              <p><span className="font-semibold text-[#111827]">Communication intent</span> → Communication Confidence (proactively communicates to both client AND manager)</p>
            </div>
          </details>
        </div>

        <textarea
          value={q3Narrative}
          onChange={(e) => setQ3Narrative(e.target.value)}
          placeholder="Example: First, I'd spend 15-20 minutes quickly reviewing the Henderson account history to understand the relationship basics — revenue, tenure, recent interactions. I wouldn't try to become an expert, just get enough context to avoid saying something uninformed. Then I'd reach out to Henderson directly (probably email with a follow-up call offer) to acknowledge the issue and ask them to walk me through what's not working..."
          className="w-full h-64 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />

        {/* Word count and validation feedback */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280]">
                Required: {q3MinWords}–{q3MaxWords} words
              </span>
              {q3IsOverMax && (
                <span className="text-[#EF4444] font-medium">
                  Maximum exceeded
                </span>
              )}
            </div>
            <div className={`font-medium tabular-nums ${
              q3WordCount < q3MinWords 
                ? 'text-[#9CA3AF]' 
                : q3IsValid 
                  ? 'text-[#10B981]' 
                  : 'text-[#EF4444]'
            }`}>
              {q3WordCount} / {q3MaxWords} words
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${
                q3WordCount < q3MinWords
                  ? 'bg-[#9CA3AF]'
                  : q3IsValid
                    ? 'bg-[#10B981]'
                    : 'bg-[#EF4444]'
              }`}
              style={{ width: `${Math.min((q3WordCount / q3MaxWords) * 100, 100)}%` }}
            />
          </div>

          {q3WordCount < q3MinWords && (
            <p className="text-xs text-[#6B7280]">
              {q3MinWords - q3WordCount} more {q3MinWords - q3WordCount === 1 ? 'word' : 'words'} required
            </p>
          )}
        </div>
      </div>

      {/* S3Q4 - Disagreement handling (Anchored Behaviour Scale) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            You genuinely disagree with a decision that someone more senior than you has just made. Which most accurately describes your typical approach? <span className="text-[#EF4444]">*</span>
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

      {/* S3Q5 - Explaining complex topics (Anchored Behaviour Scale) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            You need to explain something genuinely complex to someone without your level of knowledge on it. Which most accurately describes your approach? <span className="text-[#EF4444]">*</span>
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