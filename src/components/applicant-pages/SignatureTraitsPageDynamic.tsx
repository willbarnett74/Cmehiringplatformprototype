import { Target, Zap, MessageSquare, Lightbulb, Brain, Users, TrendingUp, Briefcase, BookOpen, Award, CheckCircle2, Save } from 'lucide-react';
import { useState } from 'react';
import { DSSectionHeader, DSTraitCard, DSTag, DSSurfaceCard, DSMetricCard } from '../ds/DSComponents';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface SignatureTraitsPageProps {
  cognitiveScore?: number | null;
}

// Trait variant types
type TraitVariant = {
  name: string;
  score: number;
  color: 'purple' | 'blue' | 'teal';
  icon: React.ElementType;
  context: string;
};

// Define trait variants based on user profile data
function getTraitVariants(profileData: any): TraitVariant[] {
  const { work_style_selection, adaptability_tag, decision_style, communication_style, cognitive_score, motivation_tags } = profileData;
  
  const traits: TraitVariant[] = [];
  
  // 1. Ownership - based on motivation_tags
  const hasImpactMotivation = motivation_tags?.some((tag: string) => 
    tag.toLowerCase().includes('impact') || tag.toLowerCase().includes('ownership') || tag.toLowerCase().includes('autonomy')
  );
  traits.push({
    name: 'Ownership',
    score: hasImpactMotivation ? 92 : 85,
    color: 'purple',
    icon: Target,
    context: hasImpactMotivation ? 'Takes strong initiative' : 'Shows initiative'
  });
  
  // 2. Learning Speed - based on cognitive_score
  const cogScore = cognitive_score || 75;
  traits.push({
    name: 'Learning Speed',
    score: Math.min(95, Math.max(70, cogScore + 3)),
    color: 'blue',
    icon: Zap,
    context: cogScore >= 85 ? 'Extremely fast learner' : cogScore >= 75 ? 'Quick to adapt' : 'Steady learner'
  });
  
  // 3. Communication - based on communication_style
  let commScore = 82;
  let commContext = 'Clear communicator';
  if (communication_style === 'Direct') {
    commScore = 88;
    commContext = 'Direct and concise';
  } else if (communication_style === 'Thoughtful') {
    commScore = 90;
    commContext = 'Thoughtful and detailed';
  } else if (communication_style === 'Visual') {
    commScore = 85;
    commContext = 'Visual storyteller';
  } else if (communication_style === 'Facilitative') {
    commScore = 91;
    commContext = 'Facilitates dialogue';
  }
  traits.push({
    name: 'Communication',
    score: commScore,
    color: 'teal',
    icon: MessageSquare,
    context: commContext
  });
  
  // 4. Adaptability - based on adaptability_tag
  let adaptScore = 85;
  let adaptContext = 'Adapts when needed';
  if (adaptability_tag === 'High') {
    adaptScore = 93;
    adaptContext = 'Thrives on change';
  } else if (adaptability_tag === 'Structured') {
    adaptScore = 78;
    adaptContext = 'Prefers structure';
  }
  traits.push({
    name: 'Adaptability',
    score: adaptScore,
    color: 'purple',
    icon: Lightbulb,
    context: adaptContext
  });
  
  // 5. Problem-Solving - based on decision_style and cognitive_score
  let problemScore = 85;
  let problemContext = 'Finds solutions';
  if (decision_style === 'Data-Driven') {
    problemScore = 90;
    problemContext = 'Data-driven problem solver';
  } else if (decision_style === 'Intuitive') {
    problemScore = 86;
    problemContext = 'Intuitive problem solver';
  } else if (decision_style === 'Collaborative') {
    problemScore = 87;
    problemContext = 'Collaborative problem solver';
  }
  // Boost by cognitive score
  if (cogScore >= 85) problemScore = Math.min(95, problemScore + 3);
  
  traits.push({
    name: 'Problem-Solving',
    score: problemScore,
    color: 'blue',
    icon: Brain,
    context: problemContext
  });
  
  // 6. Collaboration - based on work_style_selection
  let collabScore = 85;
  let collabContext = 'Team contributor';
  if (work_style_selection === 'Collaborative') {
    collabScore = 93;
    collabContext = 'Strong team player';
  } else if (work_style_selection === 'Analytical') {
    collabScore = 80;
    collabContext = 'Independent contributor';
  } else if (work_style_selection === 'Creative') {
    collabScore = 88;
    collabContext = 'Creative collaborator';
  }
  traits.push({
    name: 'Collaboration',
    score: collabScore,
    color: 'teal',
    icon: Users,
    context: collabContext
  });
  
  return traits;
}

// Generate dynamic inferences based on profile data
function getDynamicInferences(profileData: any) {
  const { work_style_selection, adaptability_tag, decision_style, communication_style, cognitive_score, motivation_tags } = profileData;
  
  const cogScore = cognitive_score || 75;
  
  const inferences = [
    {
      trait: 'Ownership',
      score: motivation_tags?.some((tag: string) => tag.toLowerCase().includes('impact')) ? 92 : 85,
      color: 'purple' as const,
      inputs: [
        { section: 'Profile Overview', signal: `Motivated by: ${motivation_tags?.slice(0, 2).join(', ') || 'Impact, Growth'}`, icon: Briefcase },
        { section: 'Career Direction', signal: 'Seeks roles with high autonomy and impact', icon: Target },
        { section: 'Deeper Insights', signal: `Decision style: ${decision_style || 'Balanced'}`, icon: Lightbulb }
      ],
      inference: `${motivation_tags?.includes('impact') ? 'Strong impact motivation' : 'Goal-oriented approach'} + Autonomy-seeking + ${decision_style || 'Balanced'} decision-making = ${motivation_tags?.includes('impact') ? 'High' : 'Strong'} Ownership trait`
    },
    {
      trait: 'Learning Speed',
      score: Math.min(95, Math.max(70, cogScore + 3)),
      color: 'blue' as const,
      inputs: [
        { section: 'Skills & Testing', signal: `Cognitive Agility: ${cogScore}/100`, icon: Brain },
        { section: 'Profile Overview', signal: work_style_selection === 'Analytical' ? 'Analytical work style' : 'Fast-paced executor', icon: BookOpen },
        { section: 'Deeper Insights', signal: `Adapts ${adaptability_tag === 'High' ? 'quickly' : 'effectively'} to change`, icon: TrendingUp }
      ],
      inference: `Cognitive score ${cogScore}/100 + ${work_style_selection || 'Balanced'} work style + ${adaptability_tag || 'Moderate'} adaptability = ${cogScore >= 85 ? 'Exceptional' : 'Strong'} Learning Speed`
    },
    {
      trait: 'Communication',
      score: communication_style === 'Thoughtful' ? 90 : communication_style === 'Direct' ? 88 : 85,
      color: 'teal' as const,
      inputs: [
        { section: 'Deeper Insights', signal: `Style: ${communication_style || 'Clear and direct'}`, icon: MessageSquare },
        { section: 'Profile Overview', signal: work_style_selection === 'Collaborative' ? 'Team-oriented communicator' : 'Clear communicator', icon: Users },
        { section: 'Experience', signal: 'Cross-functional collaboration experience', icon: CheckCircle2 }
      ],
      inference: `${communication_style || 'Direct'} communication + ${work_style_selection === 'Collaborative' ? 'Team-oriented' : 'Professional'} approach = Effective Communication`
    },
    {
      trait: 'Adaptability',
      score: adaptability_tag === 'High' ? 93 : adaptability_tag === 'Structured' ? 78 : 85,
      color: 'purple' as const,
      inputs: [
        { section: 'Deeper Insights', signal: `Response to change: ${adaptability_tag || 'Moderate'}`, icon: TrendingUp },
        { section: 'Profile Overview', signal: work_style_selection || 'Balanced work style', icon: Briefcase },
        { section: 'Experience', signal: 'Experience in multiple work environments', icon: Lightbulb }
      ],
      inference: `${adaptability_tag || 'Moderate'} change response + ${work_style_selection || 'Balanced'} style + Multi-environment experience = ${adaptability_tag === 'High' ? 'High' : 'Strong'} Adaptability`
    },
    {
      trait: 'Problem-Solving',
      score: decision_style === 'Data-Driven' ? 90 : 85,
      color: 'blue' as const,
      inputs: [
        { section: 'Skills & Testing', signal: `Cognitive score: ${cogScore}/100 in pattern recognition`, icon: Brain },
        { section: 'Deeper Insights', signal: `${decision_style || 'Balanced'} decision-making`, icon: Target },
        { section: 'Profile Overview', signal: 'Analytical and solutions-focused', icon: Lightbulb }
      ],
      inference: `Strong cognitive abilities + ${decision_style || 'Balanced'} approach + Solutions focus = ${decision_style === 'Data-Driven' ? 'Exceptional' : 'Strong'} Problem-Solving`
    },
    {
      trait: 'Collaboration',
      score: work_style_selection === 'Collaborative' ? 93 : 85,
      color: 'teal' as const,
      inputs: [
        { section: 'Profile Overview', signal: `Work style: ${work_style_selection || 'Balanced'}`, icon: Users },
        { section: 'Deeper Insights', signal: `Communication: ${communication_style || 'Direct'}`, icon: MessageSquare },
        { section: 'Experience', signal: 'Team project experience', icon: Award }
      ],
      inference: `${work_style_selection || 'Balanced'} work style + ${communication_style || 'Direct'} communication + Team experience = ${work_style_selection === 'Collaborative' ? 'Excellent' : 'Strong'} Collaboration`
    }
  ];
  
  return inferences;
}

export function SignatureTraitsPageDynamic({ cognitiveScore }: SignatureTraitsPageProps = {}) {
  const { profileData, updateProfileData } = useUserProfile();
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  
  // Generate dynamic traits based on profile data
  const traits = getTraitVariants(profileData);
  const traitInferences = getDynamicInferences(profileData);
  
  const handleSaveProgress = () => {
    updateProfileData({ profile_complete: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const traitDetails: Record<string, { explanation: string; inference: string; examples: string[] }> = {
    'Ownership': {
      explanation: 'Ownership reflects your tendency to take responsibility for outcomes and drive initiatives forward without needing constant direction. High ownership means you naturally step up to solve problems and see projects through to completion.',
      inference: 'This trait is measured through behavioral assessments that track initiative-taking patterns, project completion rates, and self-directed work behaviors.',
      examples: [
        'Led 3 projects from ideation to launch without direct oversight',
        'Proactively identified and resolved blocking issues in Q3 sprint',
        'Peer feedback: "Always takes responsibility for outcomes"'
      ]
    },
    'Learning Speed': {
      explanation: 'Learning Speed measures how quickly you absorb new information, adapt to new tools and methodologies, and apply knowledge in practical contexts. This trait indicates your ability to skill up rapidly in dynamic environments.',
      inference: 'Based on timed skill assessments, portfolio analysis showing technology adoption, and peer observations of onboarding and skill acquisition.',
      examples: [
        'Mastered Figma in 2 weeks, shipping production work',
        'Self-taught React within 1 month for project delivery',
        'Assessment score: Top 15% in pattern recognition tasks'
      ]
    },
    'Communication': {
      explanation: 'Communication encompasses both clarity and thoughtfulness in how you share ideas, provide context, and collaborate asynchronously or in real-time. Strong communicators make complex ideas accessible.',
      inference: 'Evaluated through writing samples, presentation assessments, peer feedback on clarity, and analysis of documentation quality.',
      examples: [
        'Design documentation praised for clarity and thoroughness',
        'Facilitated 5 cross-functional workshops with positive feedback',
        'Peer feedback: "Explains complex concepts in simple terms"'
      ]
    },
    'Adaptability': {
      explanation: 'Adaptability shows your comfort with change, ambiguity, and shifting priorities. High adaptability means you can pivot quickly, work effectively in uncertain conditions, and remain productive during transitions.',
      inference: 'Measured through situational judgment tests, portfolio diversity, and evidence of successful pivots in work history or project contexts.',
      examples: [
        'Successfully transitioned from marketing to product design',
        'Adapted project scope 3 times based on stakeholder feedback',
        'Thrived during company reorganization with minimal disruption'
      ]
    },
    'Problem-Solving': {
      explanation: 'Problem-Solving reflects your ability to break down complex challenges, think creatively about solutions, and apply structured or innovative approaches to resolve obstacles.',
      inference: 'Assessed through case study exercises, portfolio examples showing problem-framing, and peer endorsements highlighting solution quality.',
      examples: [
        'Redesigned checkout flow, reducing drop-off by 23%',
        'Created reusable component system saving 40 hours/month',
        'Assessment: Scored 87/100 on design thinking case study'
      ]
    },
    'Collaboration': {
      explanation: 'Collaboration measures how effectively you work with others, contribute to team dynamics, share credit, and create psychological safety. Strong collaborators elevate the entire team.',
      inference: 'Evaluated through peer endorsements, team project outcomes, 360-degree feedback, and observation of cross-functional work patterns.',
      examples: [
        '6 peer endorsements highlighting teamwork and support',
        'Led weekly design critiques with 95% attendance rate',
        'Cross-functional partners rated collaboration 4.8/5'
      ]
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <DSSectionHeader
          title="Signature Traits"
          description="Your core behavioral patterns based on your profile responses"
          onEdit={() => console.log('Edit traits')}
        />
        <button
          onClick={handleSaveProgress}
          className={`flex items-center gap-2 px-4 py-2 transition-all border ${
            saved
              ? 'bg-[#10B981] text-white border-[#10B981]'
              : 'bg-white text-[#7DBBFF] border-[#7DBBFF] hover:bg-[#7DBBFF]/5'
          }`}
          style={{ borderRadius: '10px' }}
        >
          <Save className="w-4 h-4" strokeWidth={1.5} />
          {saved ? 'Saved!' : 'Save Progress'}
        </button>
      </div>
      
      {/* Profile Status Indicator */}
      {profileData.profile_complete && (
        <div className="mb-6 p-4 bg-[#10B981]/5 border border-[#10B981]/20" style={{ borderRadius: '12px' }}>
          <div className="flex items-center gap-2 text-[#10B981]">
            <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-medium">Profile Complete</span>
            <span className="text-sm text-[#6B7280] ml-2">— Your traits are ready for employer review</span>
          </div>
        </div>
      )}

      {/* Dynamic explanation banner */}
      <div className="mb-6 p-4 bg-[#7DBBFF]/5 border border-[#7DBBFF]/20" style={{ borderRadius: '12px' }}>
        <p className="text-sm text-[#6B7280]">
          <span className="font-medium text-[#111827]">✨ Personalized for you:</span> These traits are dynamically calculated based on your responses in Profile Overview, Career Direction, Deeper Insights, and Skills & Testing sections.
        </p>
      </div>

      {/* Trait Cards Section */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {traits.map((trait) => (
          <button
            key={trait.name}
            onClick={() => setExpandedTrait(trait.name)}
            className="text-left"
          >
            <DSTraitCard trait={trait} />
          </button>
        ))}
      </div>

      {/* Assessment Inputs Section */}
      <div className="mb-12">
        <div className="mb-6">
          <h3 className="text-[#111827] mb-1">Assessment Inputs</h3>
          <p className="text-[#6B7280]">Quantitative measurements contributing to trait analysis</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DSMetricCard
            icon={Brain}
            title="Cognitive Agility"
            value={`${profileData.cognitive_score || 0}/100`}
            subtitle={
              (profileData.cognitive_score || 0) >= 80 ? 'Strong' :
              (profileData.cognitive_score || 0) >= 60 ? 'Solid' : 'Developing'
            }
            progress={profileData.cognitive_score || 0}
            color="blue"
          />
          <DSMetricCard
            icon={Target}
            title="Work Style"
            value={profileData.work_style_selection || 'Balanced'}
            subtitle="Based on your inputs"
            color="purple"
          />
          <DSMetricCard
            icon={Lightbulb}
            title="Adaptability"
            value={profileData.adaptability_tag || 'Moderate'}
            subtitle={profileData.decision_style || 'Balanced'}
            color="blue"
          />
          <DSMetricCard
            icon={Users}
            title="Communication"
            value={profileData.communication_style || 'Direct'}
            subtitle="Your preferred style"
            color="teal"
          />
        </div>
      </div>

      {/* How We Determined Your Traits Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h3 className="text-[#111827] mb-1">How We Determined Your Traits</h3>
          <p className="text-[#6B7280]">Connected insights from your profile showing the 1+1 logic behind each trait score</p>
        </div>

        <div className="space-y-6">
          {traitInferences.map((item, index) => (
            <DSSurfaceCard key={index} className="p-6">
              {/* Trait Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-[#111827] text-lg font-medium">{item.trait}</div>
                  <DSTag color={item.color} size="sm">{item.score}/100</DSTag>
                </div>
              </div>

              {/* Input Signals */}
              <div className="space-y-3 mb-6">
                {item.inputs.map((input, idx) => {
                  const Icon = input.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#FAFAFA] border border-black/[0.04]" style={{ borderRadius: '12px' }}>
                      <div className="w-8 h-8 bg-white border border-black/[0.08] flex items-center justify-center flex-shrink-0" style={{ borderRadius: '8px' }}>
                        <Icon className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-[#6B7280] mb-1">{input.section}</div>
                        <div className="text-[#111827] text-sm">{input.signal}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inference Logic */}
              <div className="pt-4 border-t border-black/[0.08]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#7DBBFF]/10 border border-[#7DBBFF]/20 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '8px' }}>
                    <Lightbulb className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7280] mb-1">Inference</div>
                    <div className="text-[#111827] text-sm leading-relaxed">{item.inference}</div>
                  </div>
                </div>
              </div>
            </DSSurfaceCard>
          ))}
        </div>
      </div>

      {/* Trait Detail Modal */}
      {expandedTrait && traitDetails[expandedTrait] && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          onClick={() => setExpandedTrait(null)}
        >
          <div
            className="bg-white border border-black/[0.08] max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto shadow-lg"
            style={{ borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="mb-2 text-[#111827]">{expandedTrait}</h3>
                <p className="text-[#6B7280]">
                  Score: {traits.find((t) => t.name === expandedTrait)?.score}/100
                </p>
              </div>
              <button
                onClick={() => setExpandedTrait(null)}
                className="text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-2 text-[#6B7280]">What This Means</div>
                <p className="text-[#111827] leading-relaxed">
                  {traitDetails[expandedTrait].explanation}
                </p>
              </div>

              <div>
                <div className="mb-2 text-[#6B7280]">How We Measure This</div>
                <p className="text-[#111827] leading-relaxed">
                  {traitDetails[expandedTrait].inference}
                </p>
              </div>

              <div>
                <div className="mb-3 text-[#6B7280]">Evidence from Your Profile</div>
                <ul className="space-y-2">
                  {traitDetails[expandedTrait].examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#7dbbff] mt-1">•</span>
                      <span className="text-[#111827]">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
