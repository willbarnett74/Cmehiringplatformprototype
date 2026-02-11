import { Sparkles, Target, Users, Zap, Brain, Focus } from 'lucide-react';
import { DSSectionHeader, DSSurfaceCard } from '../ds/DSComponents';
import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface ReflectionCardProps {
  title: string;
  question: string;
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string) => void;
}

function ReflectionCard({ title, question, options, selectedOption, onSelect }: ReflectionCardProps) {
  return (
    <DSSurfaceCard className="p-5">
      <h4 className="text-[#111827] mb-1">{title}</h4>
      <p className="text-sm text-[#6B7280] mb-4">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`
              px-3 py-1.5 text-sm transition-all border
              ${
                selectedOption === option
                  ? 'bg-[#7DBBFF] text-white border-[#7DBBFF]'
                  : 'bg-white text-[#6B7280] border-black/[0.08] hover:border-[#7DBBFF]/40 hover:text-[#7DBBFF]'
              }
            `}
            style={{ borderRadius: '12px' }}
          >
            {option}
          </button>
        ))}
      </div>
    </DSSurfaceCard>
  );
}

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  insight: string;
  nextValidation: string;
  confidence: number;
  confidenceLabel?: string;
}

function InsightCard({ icon: Icon, title, insight, nextValidation, confidence, confidenceLabel }: InsightCardProps) {
  return (
    <DSSurfaceCard className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2.5 bg-[#7DBBFF]/10 border border-[#7DBBFF]/20" style={{ borderRadius: '10px' }}>
          <Icon className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-[#111827] mb-2">{title}</h3>
          <p className="text-[#6B7280] leading-relaxed">{insight}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-black/[0.06]">
        <div className="text-xs italic text-[#9CA3AF] mb-3">{nextValidation}</div>
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#9CA3AF]">{confidenceLabel || 'Based on your inputs so far'}</span>
            <span className="text-[#7DBBFF]">{confidence}%</span>
          </div>
          <div className="h-1.5 bg-[#F8FAFC] border border-black/[0.04]" style={{ borderRadius: '4px', overflow: 'hidden' }}>
            <div
              className="h-full bg-gradient-to-r from-[#7DBBFF] to-[#6aabef] transition-all"
              style={{ width: `${confidence}%`, borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>
    </DSSurfaceCard>
  );
}

export function DeeperInsightsPage() {
  const { profileData, updateProfileData } = useUserProfile();
  
  const [reflections, setReflections] = useState<Record<string, string | null>>({
    decisionStyle: null,
    energyFlow: null,
    responseToChange: null,
    focusPreference: null,
    communicationStyle: null,
  });

  const handleReflectionSelect = (key: string, value: string) => {
    setReflections((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value, // Toggle selection
    }));
  };
  
  // Update context when reflections change
  useEffect(() => {
    if (reflections.responseToChange) {
      const adaptabilityMap: Record<string, 'High' | 'Moderate' | 'Structured'> = {
        'Thrive on change': 'High',
        'Adapt when needed': 'Moderate',
        'Prefer stability': 'Structured',
        'Need clear structure': 'Structured'
      };
      updateProfileData({ adaptability_tag: adaptabilityMap[reflections.responseToChange] || 'Moderate' });
    }
    
    if (reflections.decisionStyle) {
      const decisionMap: Record<string, 'Data-Driven' | 'Intuitive' | 'Collaborative' | 'Balanced'> = {
        'Data and analysis': 'Data-Driven',
        'Gut instinct': 'Intuitive',
        'Team consensus': 'Collaborative',
        'Mix of both': 'Balanced'
      };
      updateProfileData({ decision_style: decisionMap[reflections.decisionStyle] || 'Balanced' });
    }
    
    if (reflections.communicationStyle) {
      const commMap: Record<string, 'Direct' | 'Thoughtful' | 'Visual' | 'Facilitative'> = {
        'Direct and concise': 'Direct',
        'Thoughtful and detailed': 'Thoughtful',
        'Visual/storytelling': 'Visual',
        'Facilitative': 'Facilitative'
      };
      updateProfileData({ communication_style: commMap[reflections.communicationStyle] || 'Direct' });
    }
  }, [reflections]);

  const allReflectionsComplete = Object.values(reflections).every((value) => value !== null);

  const reflectionCards = [
    {
      key: 'decisionStyle',
      title: 'Decision Style',
      question: 'How do you usually make important decisions?',
      options: ['Intuitive', 'Analytical', 'Collaborative', 'Balanced'],
    },
    {
      key: 'energyFlow',
      title: 'Energy Flow',
      question: 'When do you do your best work?',
      options: ['Mornings', 'Evenings', 'Under Pressure', 'Consistent Routine'],
    },
    {
      key: 'responseToChange',
      title: 'Response to Change',
      question: 'When things shift suddenly, you usually…',
      options: ['Adapt Quickly', 'Pause & Assess', 'Seek Clarity', 'Re-prioritize'],
    },
    {
      key: 'focusPreference',
      title: 'Focus Preference',
      question: 'What helps you stay focused?',
      options: ['Structure', 'Pressure', 'Collaboration', 'Autonomy', 'Breaks'],
    },
    {
      key: 'communicationStyle',
      title: 'Communication Style',
      question: 'How do you prefer to communicate in teams?',
      options: ['Verbally', 'In Writing', 'Spontaneous Chats', 'Structured Meetings'],
    },
  ];

  const insights = [
    {
      icon: Sparkles,
      title: 'Motivation Type',
      insight: "You're driven by growth and autonomy. Your responses suggest you thrive when given room to learn, experiment, and take ownership of your work.",
      nextValidation: "Next: We'll validate this through scenario-based questions in Skills & Testing.",
      confidence: 78,
    },
    {
      icon: Target,
      title: 'Problem Orientation',
      insight: "You enjoy analytical and people-focused challenges. You're energized by work that combines logical thinking with understanding human needs and behaviors.",
      nextValidation: "Next: We'll explore how you apply this to real-world situations.",
      confidence: 82,
    },
    {
      icon: Users,
      title: 'Collaboration Style',
      insight: "You work best with clear communicators who respect independence. You value both collaborative dialogue and the space to think and work autonomously.",
      nextValidation: "Next: We'll assess team dynamics preferences through interactive exercises.",
      confidence: 75,
    },
    {
      icon: Zap,
      title: 'Adaptability Pattern',
      insight: "You adapt quickly to change but appreciate structure. You're comfortable with uncertainty while still valuing clear frameworks and processes to guide your work.",
      nextValidation: "Next: We'll test how you respond to evolving priorities and ambiguity.",
      confidence: 71,
    },
    {
      icon: Brain,
      title: 'Decision-Making Style',
      insight: 'You make decisions based on a balance of logic and intuition — weighing facts but trusting your instincts when confident.',
      nextValidation: 'Skills & Testing will later explore this through situational and reasoning challenges.',
      confidence: 76,
      confidenceLabel: 'Based on your reflection patterns so far',
    },
    {
      icon: Focus,
      title: 'Focus & Work Rhythm',
      insight: 'You work best in focused bursts and value visible progress checkpoints to stay engaged.',
      nextValidation: 'Upcoming modules will help identify your ideal balance between deep-focus and adaptive multitasking.',
      confidence: 73,
      confidenceLabel: 'Based on your work-style inputs',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl text-[#111827] mb-2">
          Deeper Insights — What Your Profile Is Starting to Reveal
        </h2>
        <p className="text-[#6B7280]">
          Start by answering a few quick reflections. We'll use these to reveal personalized insights about how you think and work.
        </p>
      </div>

      {/* Quick Reflection Inputs */}
      <div className="mb-8">
        <h3 className="text-[#111827] mb-4">Quick Reflections</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {reflectionCards.map((card) => (
            <ReflectionCard
              key={card.key}
              title={card.title}
              question={card.question}
              options={card.options}
              selectedOption={reflections[card.key]}
              onSelect={(option) => handleReflectionSelect(card.key, option)}
            />
          ))}
        </div>
      </div>

      {/* Insights Section - Revealed when complete */}
      {allReflectionsComplete && (
        <div
          className="transition-all duration-700 ease-out"
          style={{
            animation: 'fadeIn 0.7s ease-out',
          }}
        >
          <div className="mb-6 p-4 bg-[#7DBBFF]/5 border border-[#7DBBFF]/20" style={{ borderRadius: '16px' }}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#7DBBFF] mt-0.5" strokeWidth={1.5} />
              <div>
                <h3 className="text-[#111827] mb-1">
                  Based on your responses, here's what we're learning about how you think and work.
                </h3>
                <p className="text-sm text-[#6B7280]">
                  These insights are generated from your profile and reflections. You'll explore them further in the next step.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <InsightCard
                key={index}
                icon={insight.icon}
                title={insight.title}
                insight={insight.insight}
                nextValidation={insight.nextValidation}
                confidence={insight.confidence}
                confidenceLabel={insight.confidenceLabel}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transition Note */}
      {allReflectionsComplete && (
        <DSSurfaceCard className="mt-6 p-6 bg-[#F8FAFC] border-[#7DBBFF]/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white border border-[#7DBBFF]/30" style={{ borderRadius: '8px' }}>
              <Sparkles className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-[#111827] mb-1">Ready to validate these insights?</h4>
              <p className="text-sm text-[#6B7280]">
                In the next step, you'll complete interactive assessments and skill evaluations that help us verify and deepen these early patterns. This creates a richer, more accurate profile for employers.
              </p>
            </div>
          </div>
        </DSSurfaceCard>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}