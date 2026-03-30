import { useState, useEffect } from 'react';

interface IntakeSection6Props {
  onComplete: (data: { 
    section: number;
    responses: {
      S6Q1: {
        question_key: string;
        option_id: string;
        scores: Record<string, number>;
      };
      S6Q2: {
        question_key: string;
        option_id: string;
        scores: Record<string, number>;
      };
      S6Q3: {
        question_key: string;
        ranking: {
          mastery: number;
          impact: number;
          recognition: number;
          autonomy: number;
        };
        scores: {
          motivational_fit_mastery: number;
          motivational_fit_impact: number;
          motivational_fit_recognition: number;
          motivational_fit_autonomy: number;
        };
      };
      S6Q4: {
        question_key: string;
        option_id: string;
        scores: Record<string, number>;
      };
      S6Q5: {
        question_key: string;
        option_id: string;
        scores: Record<string, number>;
      };
      S6Q6: {
        question_key: string;
        narrative: string;
        word_count: number;
        llm_scores?: {
          intrinsic_vs_extrinsic: number;
          people_vs_task_orientation: number;
          consistency_check: number;
          self_awareness_quality: number;
        };
      };
    };
  }) => void;
  initialData?: any;
}

export function IntakeSection6({ onComplete, initialData }: IntakeSection6Props) {
  // S6Q1 - Satisfaction from good work (Anchored Behaviour Scale)
  const [q1Choice, setQ1Choice] = useState<string | null>(null);
  const [q1ShuffledOptions, setQ1ShuffledOptions] = useState<any[]>([]);

  // S6Q2 - What keeps you going (Anchored Behaviour Scale)
  const [q2Choice, setQ2Choice] = useState<string | null>(null);
  const [q2ShuffledOptions, setQ2ShuffledOptions] = useState<any[]>([]);

  // S6Q3 - Motivation Ranking (Drag to rank)
  const [q3Items, setQ3Items] = useState<any[]>([]);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // S6Q4 - Relationship with work (Anchored Behaviour Scale)
  const [q4Choice, setQ4Choice] = useState<string | null>(null);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<any[]>([]);

  // S6Q5 - What makes a role worthwhile (Anchored Behaviour Scale)
  const [q5Choice, setQ5Choice] = useState<string | null>(null);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<any[]>([]);

  // S6Q6 - Reflective narrative (60-120 words)
  const [q6Narrative, setQ6Narrative] = useState('');
  const q6WordCount = q6Narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q6MinWords = 60;
  const q6MaxWords = 120;
  const q6IsValid = q6WordCount >= q6MinWords && q6WordCount <= q6MaxWords;
  const q6IsOverMax = q6WordCount > q6MaxWords;

  // Shuffle options on mount
  useEffect(() => {
    // S6Q1 options
    const q1Options = [
      { id: 'sat-a', text: 'From seeing the effect it had on someone else. Knowing that what I did made a real difference to a person, a team, or an outcome is what makes work feel meaningful to me.', scores: { motivational_fit_impact: 5, motivational_fit_mastery: 2 } },
      { id: 'sat-b', text: 'From the quality of the work itself. Knowing I did something well — that the thinking was sharp, the execution was clean, the output was genuinely good — is where the satisfaction lives for me.', scores: { motivational_fit_mastery: 5, motivational_fit_impact: 2 } },
      { id: 'sat-c', text: 'From both equally. I need to know the work was good and that it mattered to someone — quality without impact feels hollow and impact without quality feels accidental.', scores: { motivational_fit_mastery: 3, motivational_fit_impact: 4 } },
      { id: 'sat-d', text: 'From having figured something out that was genuinely hard. The satisfaction is in the problem-solving — the effect on others is important but it\'s the challenge itself that I find most energising.', scores: { motivational_fit_mastery: 5, motivational_fit_impact: 1, learning_velocity: 5 } },
    ];
    setQ1ShuffledOptions([...q1Options].sort(() => Math.random() - 0.5));

    // S6Q2 options
    const q2Options = [
      { id: 'keep-a', text: 'Knowing that people I respect can see the effort and the progress. When external recognition is present it significantly helps me push through difficult patches — it confirms the effort is worth it.', scores: { motivational_fit_recognition: 5, motivational_fit_mastery: 1 } },
      { id: 'keep-b', text: 'My own internal standard. I have a clear sense of what good looks like and I find it difficult to walk away from something before I\'ve met that standard — the dissatisfaction of leaving it unfinished is its own motivator.', scores: { motivational_fit_mastery: 5, motivational_fit_recognition: 1 } },
      { id: 'keep-c', text: 'The knowledge that it matters to someone. If I can connect the difficult work to a real outcome for a real person or team it gives me enough purpose to push through even when it\'s unrewarding.', scores: { motivational_fit_impact: 5, motivational_fit_mastery: 2, motivational_fit_recognition: 2 } },
      { id: 'keep-d', text: 'A mix of internal drive and external signal. I have my own standards but I also find that recognition from the right people at the right moments meaningfully sustains my motivation through difficult patches.', scores: { motivational_fit_mastery: 3, motivational_fit_recognition: 4 } },
    ];
    setQ2ShuffledOptions([...q2Options].sort(() => Math.random() - 0.5));

    // S6Q3 ranking items (randomized initial order)
    const rankingItems = [
      { id: 'mastery', label: 'Mastery', description: 'Getting genuinely good at something. The craft, the depth, the feeling of knowing a subject or skill at a real level.' },
      { id: 'impact', label: 'Impact', description: 'Making a real difference. Knowing that what I do changes something meaningful for the people or outcomes I\'m working toward.' },
      { id: 'recognition', label: 'Recognition', description: 'Being seen and valued. Knowing that the people around me — peers, managers, clients — recognise and appreciate the contribution I\'m making.' },
      { id: 'autonomy', label: 'Autonomy', description: 'Working on my own terms. Having genuine independence over how I approach my work, set my priorities, and make decisions.' },
    ];
    setQ3Items([...rankingItems].sort(() => Math.random() - 0.5));

    // S6Q4 options
    const q4Options = [
      { id: 'rel-a', text: 'I\'m genuinely motivated by external outcomes — career progression, financial reward, recognition, status. These aren\'t superficial drivers for me — they\'re real and meaningful motivators that shape how hard I work and what I choose to pursue.', scores: { motivational_fit_recognition: 5, motivational_fit_mastery: 1 } },
      { id: 'rel-b', text: 'I care about external outcomes but they\'re not the primary thing. What keeps me most engaged is whether the work itself is interesting and whether I\'m getting better at something — the external rewards are a welcome signal, not the main event.', scores: { motivational_fit_mastery: 4, motivational_fit_recognition: 2 } },
      { id: 'rel-c', text: 'The work itself is the primary thing. I\'m most engaged when I\'m learning, solving something genuinely hard, or producing something I\'m proud of — external recognition matters but it doesn\'t drive me.', scores: { motivational_fit_mastery: 5, motivational_fit_recognition: 1 } },
      { id: 'rel-d', text: 'I\'m motivated by impact more than recognition or craft. What I most care about is whether what I\'m doing matters — whether it\'s changing something real for the people or outcomes I\'m working toward.', scores: { motivational_fit_impact: 5, motivational_fit_mastery: 2, motivational_fit_recognition: 1 } },
    ];
    setQ4ShuffledOptions([...q4Options].sort(() => Math.random() - 0.5));

    // S6Q5 options
    const q5Options = [
      { id: 'worth-a', text: 'Being part of something that matters beyond my own contribution. I find work most meaningful when I\'m contributing to a shared goal or a larger purpose — my individual autonomy matters less than whether the collective outcome is significant.', scores: { motivational_fit_impact: 5, motivational_fit_autonomy: 1 } },
      { id: 'worth-b', text: 'Having genuine independence over how I work. I find work most meaningful when I have real ownership over my approach, my priorities, and my decisions — I\'m more motivated by self-direction than by being part of a collective outcome.', scores: { motivational_fit_autonomy: 5, motivational_fit_impact: 2 } },
      { id: 'worth-c', text: 'A combination of meaningful work and genuine independence. I want to contribute to something that matters and I want the freedom to pursue it in my own way — I find either without the other feels incomplete.', scores: { motivational_fit_impact: 3, motivational_fit_autonomy: 4 } },
      { id: 'worth-d', text: 'Knowing that the people I\'m working with and for value what I bring. The relationships and the recognition within the work matter as much to me as the independence or the collective outcome.', scores: { motivational_fit_recognition: 4, motivational_fit_impact: 2, motivational_fit_autonomy: 2 } },
    ];
    setQ5ShuffledOptions([...q5Options].sort(() => Math.random() - 0.5));
  }, []);

  // Drag and drop handlers for S6Q3
  const handleDragStart = (item: any) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetItem: any) => {
    if (!draggedItem) return;
    
    const draggedIndex = q3Items.indexOf(draggedItem);
    const targetIndex = q3Items.indexOf(targetItem);
    
    const newItems = [...q3Items];
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    setQ3Items(newItems);
    setDraggedItem(null);
  };

  const canProceed = q1Choice && q2Choice && q3Items.length > 0 && q4Choice && q5Choice && q6IsValid;

  const handleNext = () => {
    if (!canProceed) return;

    const q1Option = q1ShuffledOptions.find(o => o.id === q1Choice);
    const q2Option = q2ShuffledOptions.find(o => o.id === q2Choice);
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice);
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice);

    // Calculate S6Q3 scores based on ranking
    const positionScores = [5, 3, 2, 1]; // 1st=5, 2nd=3, 3rd=2, 4th=1
    const q3Ranking: any = {};
    const q3Scores: any = {};
    
    q3Items.forEach((item, index) => {
      q3Ranking[item.id] = index + 1; // position 1-4
      q3Scores[`motivational_fit_${item.id}`] = positionScores[index];
    });

    onComplete({
      section: 6,
      responses: {
        S6Q1: {
          question_key: 'S6Q1',
          option_id: q1Choice,
          scores: q1Option.scores,
        },
        S6Q2: {
          question_key: 'S6Q2',
          option_id: q2Choice,
          scores: q2Option.scores,
        },
        S6Q3: {
          question_key: 'S6Q3',
          ranking: q3Ranking,
          scores: q3Scores,
        },
        S6Q4: {
          question_key: 'S6Q4',
          option_id: q4Choice,
          scores: q4Option.scores,
        },
        S6Q5: {
          question_key: 'S6Q5',
          option_id: q5Choice,
          scores: q5Option.scores,
        },
        S6Q6: {
          question_key: 'S6Q6',
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
          SECTION 6 — What Drives You
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
          <span className="text-[#7DBBFF] font-medium">
            Dimensions scored: Motivational Fit — all four sub-dimensions (Mastery, Impact, Recognition, Autonomy), Learning Velocity
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span>Est. time: 8–10 min</span>
        </div>
      </div>

      {/* Framing */}
      <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
        <p className="text-sm text-[#111827] leading-relaxed italic">
          "This section is about what genuinely motivates you — not what sounds impressive, but what actually gives you energy and keeps you engaged over time. The answers here help us understand whether a role is the right fit for you long-term, not just on paper."
        </p>
      </div>

      {/* S6Q1 - Source of satisfaction */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            At the end of a genuinely good piece of work — something you're proud of — which most accurately describes where the satisfaction comes from? <span className="text-[#EF4444]">*</span>
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

      {/* S6Q2 - What keeps you going */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            When a piece of work becomes genuinely difficult or unrewarding for a stretch — the kind of period where motivation is harder to find — which most accurately describes what keeps you going? <span className="text-[#EF4444]">*</span>
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

      {/* S6Q3 - What makes work meaningful (Drag to Rank) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Rank these four descriptions of what makes work meaningful <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-2">
            Drag to reorder from most to least true for you — 1 is most true, 4 is least true.
          </p>
          <p className="text-xs text-[#9CA3AF] italic">
            This is the hardest question to game — elevating one necessarily depresses another.
          </p>
        </div>

        <div className="space-y-3">
          {q3Items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(item)}
              className="flex items-start gap-4 p-5 border-2 border-black/[0.08] bg-white cursor-move hover:border-[#7DBBFF]/40 transition-all"
              style={{ borderRadius: '12px' }}
            >
              {/* Rank number */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#7DBBFF] text-white font-semibold text-sm" style={{ borderRadius: '6px' }}>
                {index + 1}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="text-sm font-medium text-[#111827] mb-1">{item.label}</div>
                <div className="text-sm text-[#6B7280] leading-relaxed">{item.description}</div>
              </div>

              {/* Drag handle icon */}
              <div className="flex-shrink-0 text-[#9CA3AF]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6C8 6.55228 7.55228 7 7 7C6.44772 7 6 6.55228 6 6C6 5.44772 6.44772 5 7 5C7.55228 5 8 5.44772 8 6Z" fill="currentColor"/>
                  <path d="M14 6C14 6.55228 13.5523 7 13 7C12.4477 7 12 6.55228 12 6C12 5.44772 12.4477 5 13 5C13.5523 5 14 5.44772 14 6Z" fill="currentColor"/>
                  <path d="M8 10C8 10.5523 7.55228 11 7 11C6.44772 11 6 10.5523 6 10C6 9.44772 6.44772 9 7 9C7.55228 9 8 9.44772 8 10Z" fill="currentColor"/>
                  <path d="M14 10C14 10.5523 13.5523 11 13 11C12.4477 11 12 10.5523 12 10C12 9.44772 12.4477 9 13 9C13.5523 9 14 9.44772 14 10Z" fill="currentColor"/>
                  <path d="M8 14C8 14.5523 7.55228 15 7 15C6.44772 15 6 14.5523 6 14C6 13.4477 6.44772 13 7 13C7.55228 13 8 13.4477 8 14Z" fill="currentColor"/>
                  <path d="M14 14C14 14.5523 13.5523 15 13 15C12.4477 15 12 14.5523 12 14C12 13.4477 12.4477 13 13 13C13.5523 13 14 13.4477 14 14Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-[#6B7280] bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
          <span className="font-medium text-[#111827]">Scoring:</span> 1st place = 5, 2nd place = 3, 3rd place = 2, 4th place = 1
        </div>
      </div>

      {/* S6Q4 - Relationship with work */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Which most accurately describes your honest relationship with the work you do? <span className="text-[#EF4444]">*</span>
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

        <div className="mt-4 text-xs text-[#6B7280] bg-[#F9FAFB] border border-black/[0.06] p-3" style={{ borderRadius: '8px' }}>
          <span className="font-medium text-[#111827]">Note:</span> Option A is designed to feel genuinely selectable. External motivation is real, valid, and valuable in the right roles.
        </div>
      </div>

      {/* S6Q5 - What makes a role worthwhile */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Which most accurately describes what makes a role feel genuinely worthwhile to you? <span className="text-[#EF4444]">*</span>
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

      {/* S6Q6 - Reflective narrative */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            S6Q6 — Reflective narrative <span className="text-[#EF4444]">*</span>
          </h3>
          
          {/* Two-tier prompts */}
          <div className="space-y-3">
            <div className="bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '10px' }}>
              <div className="text-xs font-semibold text-[#7DBBFF] mb-2">EXPERIENCED PROFESSIONAL</div>
              <p className="text-sm text-[#111827] leading-relaxed">
                Describe a role or project where you felt genuinely motivated — not just engaged, but actually energised by the work itself. What was it about that situation that produced that feeling? And if you can, describe a contrasting situation where the motivation was harder to find.
              </p>
            </div>
            
            <div className="bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '10px' }}>
              <div className="text-xs font-semibold text-[#7DBBFF] mb-2">EARLY CAREER</div>
              <p className="text-sm text-[#111827] leading-relaxed">
                Describe something you've done where you felt genuinely energised. What was it about that situation that produced that feeling?
              </p>
            </div>
          </div>

          {/* LLM Rubric Info */}
          <details className="mt-4 bg-[#F0F9FF] border border-[#7DBBFF]/20 p-3 text-xs text-[#6B7280]" style={{ borderRadius: '8px' }}>
            <summary className="font-medium cursor-pointer select-none">
              How this response is scored (LLM rubric)
            </summary>
            <div className="mt-3 space-y-2 leading-relaxed">
              <p><span className="font-semibold text-[#111827]">Intrinsic vs extrinsic language</span> → Mastery vs Recognition (Does the description reference internal satisfaction or external validation?)</p>
              <p><span className="font-semibold text-[#111827]">People vs task orientation</span> → Impact vs Autonomy (Do you describe motivation through relationships and effect on others, or through independent work and personal achievement?)</p>
              <p><span className="font-semibold text-[#111827]">Consistency check</span> → All four sub-dims (Does the narrative align with your S6Q3 ranking and anchored scale selections, or does it contradict them?)</p>
              <p><span className="font-semibold text-[#111827]">Self-awareness quality</span> → Learning Velocity (Do you show genuine insight into your own motivational pattern or describe it in generic terms?)</p>
              <p className="italic text-[#9CA3AF] mt-3">The consistency check is particularly valuable. A candidate who ranked Recognition last but describes their most motivated experience entirely in terms of external validation flags a meaningful inconsistency.</p>
            </div>
          </details>
        </div>

        <textarea
          value={q6Narrative}
          onChange={(e) => setQ6Narrative(e.target.value)}
          placeholder="Example: Most energised when I was building a new product feature from scratch — owned the full cycle, talked directly to users, saw the impact in real-time. What made it work was the combination of autonomy (full ownership of approach) and impact (direct user feedback showing it mattered). Contrast: spent six months on internal process documentation that nobody read. The work was fine but the lack of visible impact made motivation really hard to sustain..."
          className="w-full h-64 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
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