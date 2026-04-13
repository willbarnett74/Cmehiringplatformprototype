import { useState, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const S5Q6_SYSTEM_PROMPT = `You are scoring a candidate's written response about navigating a difficult working relationship.
Score the response on FOUR dimensions, each from 1 (very low) to 5 (very high).
Return ONLY a valid JSON object with exactly these keys:
{
  "empathy_perspective_taking": <1-5>,
  "outcome_orientation": <1-5>,
  "self_awareness": <1-5>,
  "communication_approach": <1-5>
}
Rubric:
- empathy_perspective_taking: Does the candidate show curiosity about why the other person behaved as they did?
- outcome_orientation: Does the candidate focus on resolving the situation or just describing how difficult it was?
- self_awareness: Does the candidate acknowledge their own role in the dynamic?
- communication_approach: Does the candidate describe direct intentional communication or avoidance?`;

interface IntakeSection5Props {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: unknown;
}

export function IntakeSection5({ onComplete }: IntakeSection5Props) {
  const [q1Choice, setQ1Choice] = useState<string | null>(null);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);
  const [q1FollowUp, setQ1FollowUp] = useState('');
  const q1FollowUpWordCount = q1FollowUp.trim().split(/\s+/).filter(w => w.length > 0).length;

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
  const q6MinWords = 50;
  const q6MaxWords = 100;
  const q6IsValid = q6WordCount >= q6MinWords && q6WordCount <= q6MaxWords;
  const q6IsOverMax = q6WordCount > q6MaxWords;

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, []);

  const canProceed = q1Choice && q2Choice && q3Choice && q4Choice && q5Choice && q6IsValid && !isSubmitting;

  const handleNext = async () => {
    if (!canProceed) return;
    setIsSubmitting(true);

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice)!;
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice)!;
    const q3Option = q3ShuffledOptions.find(o => o.id === q3Choice)!;
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice)!;
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice)!;

    let llmScores: Record<string, number> | undefined;
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/score-behavioural-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ narrative: q6Narrative, system_prompt: S5Q6_SYSTEM_PROMPT }),
      });
      if (res.ok) {
        llmScores = await res.json();
      }
    } catch {
      // Non-blocking: proceed without LLM scores
    }

    onComplete({
      section: 5,
      responses: {
        S5Q1: { question_key: 'S5Q1', option_id: q1Choice, follow_up: q1FollowUp || undefined, scores: q1Option.scores },
        S5Q2: { question_key: 'S5Q2', option_id: q2Choice, scores: q2Option.scores },
        S5Q3: { question_key: 'S5Q3', option_id: q3Choice, scores: q3Option.scores },
        S5Q4: { question_key: 'S5Q4', option_id: q4Choice, scores: q4Option.scores },
        S5Q5: { question_key: 'S5Q5', option_id: q5Choice, scores: q5Option.scores },
        S5Q6: { question_key: 'S5Q6', narrative: q6Narrative, word_count: q6WordCount, llm_scores: llmScores },
      },
    });

    setIsSubmitting(false);
  };

  return (
    <div>
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

      {/* S5Q6 — LLM scored */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-4">
          Reflective narrative <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3 mb-4">
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
        <details className="mb-4 bg-[#F0F9FF] border border-[#7DBBFF]/20 p-3 text-xs text-[#6B7280]" style={{ borderRadius: '8px' }}>
          <summary className="font-medium cursor-pointer select-none">How this response is scored (LLM rubric)</summary>
          <div className="mt-3 space-y-2 leading-relaxed">
            <p><span className="font-semibold text-[#111827]">Empathy / perspective-taking</span> → Relational Intelligence</p>
            <p><span className="font-semibold text-[#111827]">Outcome orientation</span> → Ownership &amp; Follow-Through</p>
            <p><span className="font-semibold text-[#111827]">Self-awareness</span> → Relational Intelligence</p>
            <p><span className="font-semibold text-[#111827]">Communication approach</span> → Communication Confidence</p>
          </div>
        </details>
        <textarea
          value={q6Narrative}
          onChange={e => setQ6Narrative(e.target.value)}
          placeholder="Example: Worked with a senior stakeholder who dismissed my input in meetings..."
          className="w-full h-56 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
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
          {isSubmitting ? 'Scoring response…' : 'Continue to Next Section →'}
        </button>
      </div>
    </div>
  );
}
