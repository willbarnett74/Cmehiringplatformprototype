import { useState, useEffect } from 'react';

interface IntakeSection2Props {
  onComplete: (data: { 
    section: number;
    responses: {
      S2Q1: {
        question_key: string;
        choice: 'strongly_a' | 'mostly_a' | 'mostly_b' | 'strongly_b';
        follow_up?: string;
        scores: { motivational_fit_autonomy: number };
      };
      S2Q2: {
        question_key: string;
        choice: 'strongly_a' | 'mostly_a' | 'mostly_b' | 'strongly_b';
        follow_up?: string;
        scores: { motivational_fit_mastery: number; motivational_fit_impact: number };
      };
      S2Q3: {
        question_key: string;
        option_id: 'collab-a' | 'collab-b' | 'collab-c' | 'collab-d';
        scores: { autonomy: number; relational_intelligence: number };
      };
      S2Q4: {
        question_key: string;
        option_id: 'recog-a' | 'recog-b' | 'recog-c' | 'recog-d';
        scores: { motivational_fit_mastery: number; motivational_fit_recognition: number };
      };
      S2Q5: {
        question_key: string;
        option_id: 'press-a' | 'press-b' | 'press-c' | 'press-d';
        scores: { resilience: number; autonomy: number };
      };
      S2Q6: {
        question_key: string;
        work_preferences: string[];
      };
    };
  }) => void;
  initialData?: any;
}

export function IntakeSection2({ onComplete, initialData }: IntakeSection2Props) {
  // S2Q1 - Work environment (Diametric Choice)
  const [q1Choice, setQ1Choice] = useState<'strongly_a' | 'mostly_a' | 'mostly_b' | 'strongly_b' | null>(null);
  const [q1FollowUp, setQ1FollowUp] = useState('');
  const q1FollowUpWordCount = q1FollowUp.trim().split(/\s+/).filter(w => w.length > 0).length;

  // S2Q2 - Good day at work (Diametric Choice)
  const [q2Choice, setQ2Choice] = useState<'strongly_a' | 'mostly_a' | 'mostly_b' | 'strongly_b' | null>(null);
  const [q2FollowUp, setQ2FollowUp] = useState('');
  const q2FollowUpWordCount = q2FollowUp.trim().split(/\s+/).filter(w => w.length > 0).length;

  // S2Q3 - Collaboration preference (Anchored Behaviour Scale)
  const [q3Choice, setQ3Choice] = useState<'collab-a' | 'collab-b' | 'collab-c' | 'collab-d' | null>(null);
  const [q3ShuffledOptions, setQ3ShuffledOptions] = useState<any[]>([]);

  // S2Q4 - Feedback and recognition (Anchored Behaviour Scale)
  const [q4Choice, setQ4Choice] = useState<'recog-a' | 'recog-b' | 'recog-c' | 'recog-d' | null>(null);
  const [q4ShuffledOptions, setQ4ShuffledOptions] = useState<any[]>([]);

  // S2Q5 - Pressure response (Anchored Behaviour Scale)
  const [q5Choice, setQ5Choice] = useState<'press-a' | 'press-b' | 'press-c' | 'press-d' | null>(null);
  const [q5ShuffledOptions, setQ5ShuffledOptions] = useState<any[]>([]);

  // S2Q6 - Work style preferences (Multi-select)
  const [q6Preferences, setQ6Preferences] = useState<string[]>([]);

  // Shuffle options on mount
  useEffect(() => {
    // S2Q3 options
    const q3Options = [
      { id: 'collab-a', text: 'I work best with regular back-and-forth — thinking through problems with others, consistent collaboration, and frequent touchpoints throughout.', scores: { autonomy: 2, relational_intelligence: 4 } },
      { id: 'collab-b', text: 'I work best independently. I like owning my work completely and find too much collaboration slows me down or dilutes the output.', scores: { autonomy: 5, relational_intelligence: 2 } },
      { id: 'collab-c', text: 'I thrive in highly collaborative environments. Working closely with others is genuinely how I do my best thinking — not just a nice to have.', scores: { autonomy: 1, relational_intelligence: 5 } },
      { id: 'collab-d', text: 'I work best independently with deliberate checkpoints. I want alignment at the right moments but I don\'t want my day-to-day work to be shaped by constant group input.', scores: { autonomy: 4, relational_intelligence: 3 } },
    ];
    setQ3ShuffledOptions([...q3Options].sort(() => Math.random() - 0.5));

    // S2Q4 options
    const q4Options = [
      { id: 'recog-a', text: 'I\'m mostly self-directed — I appreciate acknowledgment but I don\'t seek it and I don\'t need it to stay motivated.', scores: { motivational_fit_mastery: 4, motivational_fit_recognition: 2 } },
      { id: 'recog-b', text: 'I perform best in environments where good work gets regularly acknowledged — recognition from the right people is a meaningful motivator for me.', scores: { motivational_fit_mastery: 1, motivational_fit_recognition: 5 } },
      { id: 'recog-c', text: 'I rarely think about whether my work is being noticed. I have my own internal measure of whether I\'ve done something well — that\'s generally enough.', scores: { motivational_fit_mastery: 5, motivational_fit_recognition: 1 } },
      { id: 'recog-d', text: 'Feedback and recognition are important to how I stay engaged over time — I perform better in environments where my contribution is visible.', scores: { motivational_fit_mastery: 2, motivational_fit_recognition: 4 } },
    ];
    setQ4ShuffledOptions([...q4Options].sort(() => Math.random() - 0.5));

    // S2Q5 options
    const q5Options = [
      { id: 'press-a', text: 'Pressure tends to focus me. When the stakes are high I find I\'m more switched on than usual — urgency brings out a level of concentration I don\'t always access in lower-pressure situations.', scores: { resilience: 5, autonomy: 1 } },
      { id: 'press-b', text: 'Pressure affects my output somewhat. I deliver, but performance is more consistent when there is room to work at a pace that suits me.', scores: { resilience: 2, autonomy: 4 } },
      { id: 'press-c', text: 'I\'m fairly consistent regardless of the pressure level. I feel it when the stakes are high but it doesn\'t significantly change how I work — I tend to deliver either way.', scores: { resilience: 4, autonomy: 2 } },
      { id: 'press-d', text: 'I work best at a steady, consistent pace. I do my best thinking when I can set my own rhythm without external urgency driving me.', scores: { resilience: 1, autonomy: 5 } },
    ];
    setQ5ShuffledOptions([...q5Options].sort(() => Math.random() - 0.5));
  }, []);

  const canProceed = q1Choice && q2Choice && q3Choice && q4Choice && q5Choice && q6Preferences.length > 0;

  const handleNext = () => {
    if (!canProceed) return;

    // Calculate scores based on selections
    const q1Scores = { motivational_fit_autonomy: q1Choice === 'strongly_a' ? 1 : q1Choice === 'mostly_a' ? 2 : q1Choice === 'mostly_b' ? 4 : 5 };
    const q2Scores = q2Choice === 'strongly_a' 
      ? { motivational_fit_mastery: 5, motivational_fit_impact: 1 }
      : q2Choice === 'mostly_a'
      ? { motivational_fit_mastery: 4, motivational_fit_impact: 2 }
      : q2Choice === 'mostly_b'
      ? { motivational_fit_mastery: 2, motivational_fit_impact: 4 }
      : { motivational_fit_mastery: 1, motivational_fit_impact: 5 };

    const q3Option = q3ShuffledOptions.find(o => o.id === q3Choice);
    const q4Option = q4ShuffledOptions.find(o => o.id === q4Choice);
    const q5Option = q5ShuffledOptions.find(o => o.id === q5Choice);

    onComplete({
      section: 2,
      responses: {
        S2Q1: {
          question_key: 'S2Q1',
          choice: q1Choice,
          follow_up: q1FollowUp || undefined,
          scores: q1Scores,
        },
        S2Q2: {
          question_key: 'S2Q2',
          choice: q2Choice,
          follow_up: q2FollowUp || undefined,
          scores: q2Scores,
        },
        S2Q3: {
          question_key: 'S2Q3',
          option_id: q3Choice,
          scores: q3Option.scores,
        },
        S2Q4: {
          question_key: 'S2Q4',
          option_id: q4Choice,
          scores: q4Option.scores,
        },
        S2Q5: {
          question_key: 'S2Q5',
          option_id: q5Choice,
          scores: q5Option.scores,
        },
        S2Q6: {
          question_key: 'S2Q6',
          work_preferences: q6Preferences,
        },
      },
    });
  };

  const workStyleOptions = [
    'Remote', 'Hybrid', 'In-person', 'Flexible hours', 'Standard hours',
    'Fast-paced', 'Steady and structured', 'Small team', 'Large organisation',
    'Customer or client facing', 'Behind the scenes', 'Leading others', 
    'Contributing as an individual'
  ];

  const togglePreference = (pref: string) => {
    setQ6Preferences(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#111827] mb-2">
          SECTION 2 — How You Work
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
          <span className="text-[#7DBBFF] font-medium">
            Dimensions scored: Motivational Fit (Autonomy, Mastery, Recognition, Impact), Resilience, Relational Intelligence
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span>Est. time: 7–9 min</span>
        </div>
      </div>

      {/* Framing */}
      <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
        <p className="text-sm text-[#111827] leading-relaxed italic">
          "There's no right way to work. This section is about understanding what brings out the best in you — your natural style, what energises you, and the environments where you genuinely thrive."
        </p>
      </div>

      {/* S2Q1 - Work environment (Diametric Choice) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Two people describe their ideal work environment. Which is closer to you — and it's fine if neither is perfect? <span className="text-[#EF4444]">*</span>
          </h3>
        </div>

        {/* Person A and B Options */}
        <div className="space-y-4 mb-6">
          <div className="p-5 border-2 border-black/[0.08] transition-all" style={{ borderRadius: '12px' }}>
            <div className="text-xs font-medium text-[#7DBBFF] mb-2">PERSON A</div>
            <p className="text-sm text-[#111827] leading-relaxed mb-4">
              "I do my best work when I have clear structure and defined responsibilities. I like knowing what's expected, having reliable processes to follow, and being able to focus deeply without constant interruption."
            </p>
          </div>

          <div className="p-5 border-2 border-black/[0.08] transition-all" style={{ borderRadius: '12px' }}>
            <div className="text-xs font-medium text-[#7DBBFF] mb-2">PERSON B</div>
            <p className="text-sm text-[#111827] leading-relaxed mb-4">
              "I do my best work when things are moving fast and changing. I like variety, figuring things out as I go, and environments where I can shape my own approach rather than following a set path."
            </p>
          </div>
        </div>

        {/* Selection Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setQ1Choice('strongly_a')}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              q1Choice === 'strongly_a'
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Strongly A
          </button>
          <button
            onClick={() => setQ1Choice('strongly_b')}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              q1Choice === 'strongly_b'
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Strongly B
          </button>
          <button
            onClick={() => setQ1Choice('mostly_a')}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              q1Choice === 'mostly_a'
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Mostly A
          </button>
          <button
            onClick={() => setQ1Choice('mostly_b')}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              q1Choice === 'mostly_b'
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Mostly B
          </button>
        </div>

        {/* Optional Follow-up */}
        {q1Choice && (
          <div className="pt-4 border-t border-black/[0.08]">
            <label className="block text-sm text-[#6B7280] mb-2">
              Optional: What specifically makes that environment work well for you? (20–40 words)
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

      {/* S2Q2 - Good day at work (Diametric Choice) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Which of these sounds more like a good day at work? <span className="text-[#EF4444]">*</span>
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          <div className="p-5 border-2 border-black/[0.08] transition-all" style={{ borderRadius: '12px' }}>
            <div className="text-xs font-medium text-[#7DBBFF] mb-2">OPTION A</div>
            <p className="text-sm text-[#111827] leading-relaxed">
              "A day where I got to grips with something I hadn't dealt with before — figured out a problem, picked up a new skill, or found a better way of doing something. I finished feeling like I'd moved forward."
            </p>
          </div>

          <div className="p-5 border-2 border-black/[0.08] transition-all" style={{ borderRadius: '12px' }}>
            <div className="text-xs font-medium text-[#7DBBFF] mb-2">OPTION B</div>
            <p className="text-sm text-[#111827] leading-relaxed">
              "A day where I got a lot done, delivered on everything I'd committed to, and left knowing I'd been genuinely useful to the people around me."
            </p>
          </div>
        </div>

        {/* Selection Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setQ2Choice('strongly_a')}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              q2Choice === 'strongly_a'
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Strongly A
          </button>
          <button
            onClick={() => setQ2Choice('strongly_b')}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              q2Choice === 'strongly_b'
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Strongly B
          </button>
          <button
            onClick={() => setQ2Choice('mostly_a')}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              q2Choice === 'mostly_a'
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Mostly A
          </button>
          <button
            onClick={() => setQ2Choice('mostly_b')}
            className={`px-4 py-3 text-sm border-2 transition-all ${
              q2Choice === 'mostly_b'
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Mostly B
          </button>
        </div>

        {/* Optional Follow-up */}
        {q2Choice && (
          <div className="pt-4 border-t border-black/[0.08]">
            <label className="block text-sm text-[#6B7280] mb-2">
              Optional: What does a genuinely bad day at work look or feel like for you? (20–50 words)
            </label>
            <textarea
              value={q2FollowUp}
              onChange={(e) => setQ2FollowUp(e.target.value)}
              placeholder="Optional response..."
              className="w-full h-20 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
              style={{ borderRadius: '12px' }}
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs ${q2FollowUpWordCount >= 20 && q2FollowUpWordCount <= 50 ? 'text-[#10B981]' : 'text-[#6B7280]'}`}>
                {q2FollowUpWordCount} / 50 words
              </span>
            </div>
          </div>
        )}
      </div>

      {/* S2Q3 - Collaboration preference (Anchored Behaviour Scale) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Which of these most accurately describes how you prefer to work? <span className="text-[#EF4444]">*</span>
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

      {/* S2Q4 - Feedback and recognition (Anchored Behaviour Scale) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Which most accurately describes your relationship with feedback and recognition at work? <span className="text-[#EF4444]">*</span>
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

      {/* S2Q5 - Pressure response (Anchored Behaviour Scale) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Think about the work environment where you tend to perform at your best. Which most accurately describes you? <span className="text-[#EF4444]">*</span>
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

      {/* S2Q6 - Work style preferences (Multi-select) */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Work style preferences <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-2">
            Which of these describe how you prefer to work? Select all that apply.
          </p>
          <p className="text-xs text-[#9CA3AF] italic">
            No trait scoring. Used for employer filtering only.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {workStyleOptions.map((option) => (
            <button
              key={option}
              onClick={() => togglePreference(option)}
              className={`px-4 py-3 text-sm border-2 text-left transition-all ${
                q6Preferences.includes(option)
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                  : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '10px' }}
            >
              {option}
            </button>
          ))}
        </div>

        {q6Preferences.length > 0 && (
          <div className="mt-4 text-xs text-[#6B7280]">
            {q6Preferences.length} preference{q6Preferences.length !== 1 ? 's' : ''} selected
          </div>
        )}
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