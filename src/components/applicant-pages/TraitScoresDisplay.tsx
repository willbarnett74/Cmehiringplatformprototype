import type { DimensionScores } from '../../utils/intakeScoring';
import { Brain, Target, Zap, MessageSquare, Users, Trophy, TrendingUp, Star, Compass } from 'lucide-react';

interface TraitScoresDisplayProps {
  scores: DimensionScores | null;
  showAll?: boolean;
}

export function TraitScoresDisplay({ scores, showAll = false }: TraitScoresDisplayProps) {
  if (!scores) {
    return (
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-semibold mb-4">Trait Scores</h3>
        <p className="text-sm text-[#6B7280]">Complete the intake flow to see your trait scores</p>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 75) return 'text-[#10B981]';
    if (score >= 50) return 'text-[#7DBBFF]';
    if (score >= 25) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 75) return 'bg-[#10B981]';
    if (score >= 50) return 'bg-[#7DBBFF]';
    if (score >= 25) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 75) return 'High';
    if (score >= 50) return 'Medium';
    if (score >= 25) return 'Developing';
    return 'Low';
  };

  const traits = [
    { 
      key: 'learning_velocity', 
      label: 'Learning Velocity', 
      icon: Brain,
      description: 'Speed of learning and adapting to new information'
    },
    { 
      key: 'ownership_follow_through', 
      label: 'Ownership & Follow-Through', 
      icon: Target,
      description: 'Taking responsibility and completing commitments'
    },
    { 
      key: 'resilience', 
      label: 'Resilience', 
      icon: Zap,
      description: 'Bouncing back from setbacks and maintaining performance'
    },
    { 
      key: 'communication_confidence', 
      label: 'Communication Confidence', 
      icon: MessageSquare,
      description: 'Clarity and effectiveness in communicating ideas'
    },
    { 
      key: 'relational_intelligence', 
      label: 'Relational Intelligence', 
      icon: Users,
      description: 'Understanding and navigating interpersonal dynamics'
    },
    { 
      key: 'motivational_fit_mastery', 
      label: 'Motivation: Mastery', 
      icon: Trophy,
      description: 'Drive to develop deep expertise and excellence'
    },
    { 
      key: 'motivational_fit_impact', 
      label: 'Motivation: Impact', 
      icon: TrendingUp,
      description: 'Desire to create visible, meaningful change'
    },
    { 
      key: 'motivational_fit_recognition', 
      label: 'Motivation: Recognition', 
      icon: Star,
      description: 'Value placed on acknowledgment and visibility'
    },
    { 
      key: 'motivational_fit_autonomy', 
      label: 'Motivation: Autonomy', 
      icon: Compass,
      description: 'Preference for independence and self-direction'
    },
  ];

  // Show top 3 traits if showAll is false
  const displayTraits = showAll ? traits : traits.slice(0, 3);

  return (
    <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base text-[#111827] font-semibold mb-1">Trait Scores</h3>
          <p className="text-xs text-[#6B7280]">Based on your intake responses</p>
        </div>
        {!showAll && traits.length > 3 && (
          <span className="text-xs text-[#7DBBFF] font-medium">+{traits.length - 3} more</span>
        )}
      </div>

      <div className="space-y-5">
        {displayTraits.map((trait) => {
          const score = scores[trait.key as keyof DimensionScores];
          const Icon = trait.icon;
          
          return (
            <div key={trait.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm text-[#111827] font-medium">{trait.label}</p>
                    {showAll && (
                      <p className="text-xs text-[#6B7280]">{trait.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getScoreColor(score)}`}>
                    {score.toFixed(0)}
                  </p>
                  <p className="text-xs text-[#6B7280]">{getScoreLabel(score)}</p>
                </div>
              </div>
              <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getScoreBarColor(score)} transition-all duration-300`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && (
        <div className="mt-6 pt-4 border-t border-black/[0.08]">
          <p className="text-xs text-[#6B7280] text-center">
            View your full profile to see all 9 trait dimensions
          </p>
        </div>
      )}
    </div>
  );
}
