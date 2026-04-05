import { useState, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const S3Q3_SYSTEM_PROMPT = `You are scoring a candidate's written response to a workplace scenario.
Score the response on FOUR dimensions, each from 1 (very low) to 5 (very high).
Return ONLY a valid JSON object with exactly these keys:
{
  "clarity_of_reasoning": <1-5>,
  "handling_ambiguity": <1-5>,
  "initiative_and_ownership": <1-5>,
  "communication_intent": <1-5>
}
Rubric:
- clarity_of_reasoning: Does the response explain logic clearly rather than vaguely?
- handling_ambiguity: Does the candidate acknowledge unknowns and adapt rather than assume?
- initiative_and_ownership: Does the candidate take ownership of the outcome, not just individual tasks?
- communication_intent: Does the candidate proactively communicate to both client AND manager?`;

interface IntakeSection3Props {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: unknown;
}

export function IntakeSection3({ onComplete }: IntakeSection3Props) {
  const [q1Choice, setQ1Choice] = useState<string | null>(null);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q2Choice, setQ2Choice] = useState<string | null>(null);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q3Narrative, setQ3Narrative] = useState('');
  const q3WordCount = q3Narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q3MinWords = 80;
  const q3MaxWords = 150;
  const q3IsValid = q3WordCount >= q3MinWords && q3WordCount <= q3MaxWords;
  const q3IsOverMax = q3WordCount > q3MaxWords;

  const [q4Choice, setQ4Choice] = useState<string | null>(null);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [q5Choice, setQ5Choice] = useState<string | null>(null);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<{ id: string; text: string; scores: Record<string, number> }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const canProceed = q1Choice && q2Choice && q3IsValid && q4Choice && q5Choice && !isSubmitting;

  const handleNext = async () => {
    if (!canProceed) return;
    setIsSubmitting(true);

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice)!;
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice)!;
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
        body: JSON.stringify({ narrative: q3Narrative, system_prompt: S3Q3_SYSTEM_PROMPT }),
      });
      if (res.ok) {
        llmScores = await res.json();
      }
    } catch {
      // Non-blocking: proceed without LLM scores
    }

    onComplete({
      section: 3,
      responses: {
        S3Q1: { question_key: 'S3Q1', option_id: q1Choice, scores: q1Option.scores },
        S3Q2: { question_key: 'S3Q2', option_id: q2Choice, scores: q2Option.scores },
        S3Q3: { question_key: 'S3Q3', narrative: q3Narrative, word_count: q3WordCount, llm_scores: llmScores },
        S3Q4: { question_key: 'S3Q4', option_id: q4Choice, scores: q4Option.scores },
        S3Q5: { question_key: 'S3Q5', option_id: q5Choice, scores: q5Option.scores },
      },
    });

    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-[#111827] mb-2">SECTION 3 — How You Think</h2>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
          <span className="text-[#7DBBFF] font-medium">
            Dimensions scored: Learning Velocity, Communication Confidence, Ownership &amp; Follow-Through
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span>Est. time: 10–12 min</span>
        </div>
      </div>

      <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
        <p className="text-sm text-[#111827] leading-relaxed italic">
          "This section is about how you approach new situations, process information, and communicate your thinking. There are no right answers — we're genuinely interested in how your mind works."
        </p>
      </div>

      {/* S3Q1 */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-6">
          When you encounter something new that you need to get on top of — a skill, a system, a role — which most accurately describes how that typically goes? <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="space-y-3">
          {q1ShuffledOptions.map(option => (
            <button
              key={option.id}
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

      {/* S3Q3 — LLM scored */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-medium mb-2">
          Read the following situation and tell us what you'd do <span className="text-[#EF4444]">*</span>
        </h3>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
          There's no right answer — we're interested in how you think through it.
        </p>
        <div className="bg-[#F9FAFB] border border-black/[0.06] p-5 mb-4" style={{ borderRadius: '12px' }}>
          <div className="text-xs font-semibold text-[#7DBBFF] mb-3">SCENARIO</div>
          <p className="text-sm text-[#111827] leading-relaxed mb-3">
            You've just started in a new role — two weeks in. Your manager pulls you aside before heading into back-to-back meetings and says:{' '}
            <span className="italic">"Can you sort out the situation with the Henderson account before end of day? They're not happy."</span> Then they're gone.
          </p>
          <p className="text-sm text-[#111827] leading-relaxed mb-3">
            You have no handover notes on Henderson. You can find the account history in the system but it will take time to piece together. It's 11am. Your manager is unavailable until 4pm.
          </p>
          <p className="text-sm text-[#111827] leading-relaxed font-medium">
            What do you do? Walk us through your thinking and the actions you'd take.
          </p>
        </div>
        <details className="mb-4 bg-[#F0F9FF] border border-[#7DBBFF]/20 p-3 text-xs text-[#6B7280]" style={{ borderRadius: '8px' }}>
          <summary className="font-medium cursor-pointer select-none">How this response is scored</summary>
          <div className="mt-3 space-y-2 leading-relaxed">
            <p><span className="font-semibold text-[#111827]">Clarity of reasoning</span> → Learning Velocity</p>
            <p><span className="font-semibold text-[#111827]">Handling ambiguity</span> → Learning Velocity</p>
            <p><span className="font-semibold text-[#111827]">Initiative and ownership</span> → Ownership &amp; Follow-Through</p>
            <p><span className="font-semibold text-[#111827]">Communication intent</span> → Communication Confidence</p>
          </div>
        </details>
        <textarea
          value={q3Narrative}
          onChange={e => setQ3Narrative(e.target.value)}
          placeholder="Example: First, I'd spend 15-20 minutes quickly reviewing the Henderson account history to understand the relationship basics..."
          className="w-full h-64 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280]">Required: {q3MinWords}–{q3MaxWords} words</span>
              {q3IsOverMax && <span className="text-[#EF4444] font-medium">Maximum exceeded</span>}
            </div>
            <div className={`font-medium tabular-nums ${q3WordCount < q3MinWords ? 'text-[#9CA3AF]' : q3IsValid ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {q3WordCount} / {q3MaxWords} words
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${q3WordCount < q3MinWords ? 'bg-[#9CA3AF]' : q3IsValid ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
              style={{ width: `${Math.min((q3WordCount / q3MaxWords) * 100, 100)}%` }}
            />
          </div>
          {q3WordCount < q3MinWords && (
            <p className="text-xs text-[#6B7280]">{q3MinWords - q3WordCount} more {q3MinWords - q3WordCount === 1 ? 'word' : 'words'} required</p>
          )}
        </div>
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
