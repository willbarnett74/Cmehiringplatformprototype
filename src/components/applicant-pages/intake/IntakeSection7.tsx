import { useState } from 'react';

interface IntakeSection7Props {
  onComplete: (data: { 
    section: number;
    responses: {
      S7Q1: {
        question_key: string;
        looking_for: string[];
      };
      S7Q2: {
        question_key: string;
        growth_direction: string;
        word_count: number;
      };
      S7Q3: {
        question_key: string;
        industry_openness: string;
      };
      S7Q4: {
        question_key: string;
        role_type_preferences: string[];
      };
      S7Q5: {
        question_key: string;
        minimum_salary?: string;
        work_location: string;
        org_size: string;
        part_time_openness: string;
      };
    };
  }) => void;
  initialData?: any;
}

export function IntakeSection7({ onComplete, initialData }: IntakeSection7Props) {
  // S7Q1 - What you're looking for (multi-select, max 2)
  const [q1Selections, setQ1Selections] = useState<string[]>([]);

  // S7Q2 - Growth direction (40-80 words)
  const [q2Narrative, setQ2Narrative] = useState('');
  const q2WordCount = q2Narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const q2MinWords = 40;
  const q2MaxWords = 80;
  const q2IsValid = q2WordCount >= q2MinWords && q2WordCount <= q2MaxWords;
  const q2IsOverMax = q2WordCount > q2MaxWords;

  // S7Q3 - Industry openness (single select)
  const [q3Choice, setQ3Choice] = useState<string | null>(null);

  // S7Q4 - Role type preference (multi-select, max 2)
  const [q4Selections, setQ4Selections] = useState<string[]>([]);

  // S7Q5 - Employment preferences
  const [q5Salary, setQ5Salary] = useState('');
  const [q5Location, setQ5Location] = useState('');
  const [q5OrgSize, setQ5OrgSize] = useState('');
  const [q5PartTime, setQ5PartTime] = useState('');

  const lookingForOptions = [
    'A chance to develop deep expertise in a specific area',
    'A role where I can use the direct impact of my work',
    'A fast-moving environment where I can grow quickly',
    'A stable role where I can perform consistently',
    'A leadership or management opportunity',
    'A significant increase in responsibilities',
    'The ability to build or lead something from scratch',
    'Work I genuinely care about',
    'Flexibility and work-life balance as a genuine priority',
    'Financial progression as a primary driver',
    'I\'m not sure yet — I\'m open and exploring',
  ];

  const industryOpennessOptions = [
    { id: 'comfortable', label: 'Comfortable, open — industry doesn\'t matter much to me' },
    { id: 'open_right_opp', label: 'Open with the right opportunity' },
    { id: 'mildly_open', label: 'Mildly open — I\'d consider it' },
    { id: 'prefer_stay', label: 'Prefer to stay — my industry knowledge is important to me' },
    { id: 'no_background', label: 'Not especially — I don\'t have a specific industry background yet' },
  ];

  const roleTypeOptions = [
    'IC & Analytical',
    'Technical Engineering',
    'People & Culture',
    'Leadership & Management',
    'Administrative & Coordination',
    'Strategy & Consulting',
    'Sales & Business Development',
    'Creative & Design',
    'Operations & Logistics',
    'Not sure yet',
  ];

  const toggleQ1Selection = (option: string) => {
    if (q1Selections.includes(option)) {
      setQ1Selections(q1Selections.filter(s => s !== option));
    } else if (q1Selections.length < 2) {
      setQ1Selections([...q1Selections, option]);
    }
  };

  const toggleQ4Selection = (option: string) => {
    if (q4Selections.includes(option)) {
      setQ4Selections(q4Selections.filter(s => s !== option));
    } else if (q4Selections.length < 2) {
      setQ4Selections([...q4Selections, option]);
    }
  };

  const canProceed = 
    q1Selections.length > 0 && 
    q2IsValid && 
    q3Choice && 
    q4Selections.length > 0 && 
    q5Location && 
    q5OrgSize && 
    q5PartTime;

  const handleNext = () => {
    if (!canProceed) return;

    onComplete({
      section: 7,
      responses: {
        S7Q1: {
          question_key: 'S7Q1',
          looking_for: q1Selections,
        },
        S7Q2: {
          question_key: 'S7Q2',
          growth_direction: q2Narrative,
          word_count: q2WordCount,
        },
        S7Q3: {
          question_key: 'S7Q3',
          industry_openness: q3Choice,
        },
        S7Q4: {
          question_key: 'S7Q4',
          role_type_preferences: q4Selections,
        },
        S7Q5: {
          question_key: 'S7Q5',
          minimum_salary: q5Salary || undefined,
          work_location: q5Location,
          org_size: q5OrgSize,
          part_time_openness: q5PartTime,
        },
      },
    });
  };

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#111827] mb-2">
          SECTION 7 — Career Direction
        </h2>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
          <span className="text-[#7DBBFF] font-medium">
            Dimensions scored: Employer filtering data only — no trait scoring
          </span>
          <span className="text-[#9CA3AF]">•</span>
          <span>Est. time: 4–5 min</span>
        </div>
      </div>

      {/* Framing */}
      <div className="bg-white border border-[#7DBBFF]/30 p-6 mb-8" style={{ borderRadius: '16px' }}>
        <p className="text-sm text-[#111827] leading-relaxed italic">
          "Almost there. This section is about where you're headed — not where you think you should be headed, but what genuinely interests and motivates you about your next step."
        </p>
      </div>

      {/* S7Q1 - What you're looking for */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            What you're looking for <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-2">
            Which of these best describes what you're looking for in your next role? Select up to two.
          </p>
          <p className="text-xs text-[#9CA3AF] italic">
            No trait scoring. Used for employer filtering only.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {lookingForOptions.map((option) => (
            <button
              key={option}
              onClick={() => toggleQ1Selection(option)}
              disabled={!q1Selections.includes(option) && q1Selections.length >= 2}
              className={`text-left px-5 py-4 border-2 transition-all ${
                q1Selections.includes(option)
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                  : q1Selections.length >= 2
                    ? 'border-black/[0.04] text-[#9CA3AF] cursor-not-allowed'
                    : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              {option}
            </button>
          ))}
        </div>

        {q1Selections.length > 0 && (
          <div className="mt-4 text-xs text-[#6B7280]">
            {q1Selections.length} / 2 selected
          </div>
        )}
      </div>

      {/* S7Q2 - Growth direction */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Growth direction <span className="text-[#EF4444]">*</span>
          </h3>
          
          {/* Two-tier prompts */}
          <div className="space-y-3">
            <div className="bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '10px' }}>
              <div className="text-xs font-semibold text-[#7DBBFF] mb-2">EXPERIENCED PROFESSIONAL</div>
              <p className="text-sm text-[#111827] leading-relaxed">
                Where do you see yourself in three to five years? Not in terms of job titles, but in terms of what you're doing and how you think.
              </p>
            </div>
            
            <div className="bg-[#F9FAFB] border border-black/[0.06] p-4" style={{ borderRadius: '10px' }}>
              <div className="text-xs font-semibold text-[#7DBBFF] mb-2">EARLY CAREER</div>
              <p className="text-sm text-[#111827] leading-relaxed">
                Where do you think you'd like to be in three to five years — even if you're not sure yet?
              </p>
            </div>
          </div>

          <div className="mt-3 text-xs text-[#9CA3AF] italic">
            LLM evaluation: does the response reflect genuine self-awareness or performed ambition? Consistency check with Section 6 Motivation! Not scored.
          </div>
        </div>

        <textarea
          value={q2Narrative}
          onChange={(e) => setQ2Narrative(e.target.value)}
          placeholder="Example: I want to be doing work that combines strategic thinking with hands-on execution — probably leading a small team but still close enough to the work to shape it directly. Less interested in climbing a traditional hierarchy than in building genuine expertise in something I care about..."
          className="w-full h-40 px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] leading-relaxed focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 resize-none transition-all"
          style={{ borderRadius: '12px' }}
        />

        {/* Word count and validation feedback */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280]">
                Required: {q2MinWords}–{q2MaxWords} words
              </span>
              {q2IsOverMax && (
                <span className="text-[#EF4444] font-medium">
                  Maximum exceeded
                </span>
              )}
            </div>
            <div className={`font-medium tabular-nums ${
              q2WordCount < q2MinWords 
                ? 'text-[#9CA3AF]' 
                : q2IsValid 
                  ? 'text-[#10B981]' 
                  : 'text-[#EF4444]'
            }`}>
              {q2WordCount} / {q2MaxWords} words
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className={`h-full transition-all duration-200 ${
                q2WordCount < q2MinWords
                  ? 'bg-[#9CA3AF]'
                  : q2IsValid
                    ? 'bg-[#10B981]'
                    : 'bg-[#EF4444]'
              }`}
              style={{ width: `${Math.min((q2WordCount / q2MaxWords) * 100, 100)}%` }}
            />
          </div>

          {q2WordCount < q2MinWords && (
            <p className="text-xs text-[#6B7280]">
              {q2MinWords - q2WordCount} more {q2MinWords - q2WordCount === 1 ? 'word' : 'words'} required
            </p>
          )}
        </div>
      </div>

      {/* S7Q3 - Industry openness */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Industry openness <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            How do you feel about moving into a different industry from the one you've worked in?
          </p>
        </div>

        <div className="space-y-3">
          {industryOpennessOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setQ3Choice(option.id)}
              className={`w-full text-left px-5 py-4 border-2 transition-all ${
                q3Choice === option.id
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                  : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* S7Q4 - Role type preference */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Role type preference <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-2">
            Which of these role categories feels most aligned with where you want to go? Select your top two.
          </p>
          <p className="text-xs text-[#9CA3AF] italic">
            Role template categories for matching.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {roleTypeOptions.map((option) => (
            <button
              key={option}
              onClick={() => toggleQ4Selection(option)}
              disabled={!q4Selections.includes(option) && q4Selections.length >= 2}
              className={`text-left px-5 py-4 border-2 transition-all ${
                q4Selections.includes(option)
                  ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                  : q4Selections.length >= 2
                    ? 'border-black/[0.04] text-[#9CA3AF] cursor-not-allowed'
                    : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
              }`}
              style={{ borderRadius: '12px' }}
            >
              {option}
            </button>
          ))}
        </div>

        {q4Selections.length > 0 && (
          <div className="mt-4 text-xs text-[#6B7280]">
            {q4Selections.length} / 2 selected
          </div>
        )}
      </div>

      {/* S7Q5 - Employment preferences */}
      <div className="bg-white border border-black/[0.08] p-8 mb-8" style={{ borderRadius: '20px' }}>
        <div className="mb-6">
          <h3 className="text-base text-[#111827] font-medium mb-2">
            Employment preferences <span className="text-[#EF4444]">*</span>
          </h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            A couple of quick practical ones to complete your profile.
          </p>
        </div>

        <div className="space-y-6">
          {/* Minimum salary */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-3">
              Minimum salary expectation (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQ5Salary('prefer_not_say')}
                className={`px-4 py-3 text-sm border-2 transition-all ${
                  q5Salary === 'prefer_not_say'
                    ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                    : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
                }`}
                style={{ borderRadius: '10px' }}
              >
                Prefer not to say
              </button>
              <input
                type="text"
                value={q5Salary !== 'prefer_not_say' ? q5Salary : ''}
                onChange={(e) => setQ5Salary(e.target.value)}
                placeholder="e.g., $80,000"
                className="px-4 py-3 border border-black/[0.10] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] focus:ring-2 focus:ring-[#7DBBFF]/20 transition-all"
                style={{ borderRadius: '10px' }}
              />
            </div>
          </div>

          {/* Preferred work location */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-3">
              Preferred work location <span className="text-[#EF4444]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Remote', 'Hybrid', 'In-person', 'Flexible', 'Relocating'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setQ5Location(loc)}
                  className={`px-4 py-3 text-sm border-2 transition-all ${
                    q5Location === loc
                      ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                      : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
                  }`}
                  style={{ borderRadius: '10px' }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred org size */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-3">
              Preferred org size <span className="text-[#EF4444]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Start-up', 'Small co', 'Scale-up', 'Mid-sized', 'Enterprise', 'No strong preference'].map((size) => (
                <button
                  key={size}
                  onClick={() => setQ5OrgSize(size)}
                  className={`px-4 py-3 text-sm border-2 transition-all ${
                    q5OrgSize === size
                      ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                      : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
                  }`}
                  style={{ borderRadius: '10px' }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Part-time or contract openness */}
          <div>
            <label className="block text-sm text-[#111827] font-medium mb-3">
              Open to part-time or contract? <span className="text-[#EF4444]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Yes', 'Open to it', 'Prefer full-time only'].map((option) => (
                <button
                  key={option}
                  onClick={() => setQ5PartTime(option)}
                  className={`px-4 py-3 text-sm border-2 transition-all ${
                    q5PartTime === option
                      ? 'border-[#7DBBFF] bg-[#7DBBFF]/10 text-[#111827] font-medium'
                      : 'border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]/40'
                  }`}
                  style={{ borderRadius: '10px' }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
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