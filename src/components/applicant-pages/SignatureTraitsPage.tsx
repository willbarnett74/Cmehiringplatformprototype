import { Target, Zap, MessageSquare, Lightbulb, Brain, Users, TrendingUp, Briefcase, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { DSSectionHeader, DSTraitCard, DSTag, DSSurfaceCard, DSMetricCard } from '../ds/DSComponents';

interface SignatureTraitsPageProps {
  cognitiveScore?: number | null;
}

export function SignatureTraitsPage({ cognitiveScore }: SignatureTraitsPageProps = {}) {
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);

  const traits = [
    { name: 'Ownership', score: 92, color: 'purple' as const, icon: Target, context: 'Shows initiative' },
    { name: 'Learning Speed', score: 88, color: 'blue' as const, icon: Zap, context: 'Learns new tools quickly' },
    { name: 'Communication', score: 85, color: 'teal' as const, icon: MessageSquare, context: 'Clear and thoughtful' },
    { name: 'Adaptability', score: 90, color: 'purple' as const, icon: Lightbulb, context: 'Flexible in changing environments' },
    { name: 'Problem-Solving', score: 87, color: 'blue' as const, icon: Brain, context: 'Finds creative solutions' },
    { name: 'Collaboration', score: 91, color: 'teal' as const, icon: Users, context: 'Works well in teams' },
  ];

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

  // Inference logic connecting previous sections to trait outcomes
  const traitInferences = [
    {
      trait: 'Ownership',
      score: 92,
      color: 'purple' as const,
      inputs: [
        { section: 'Experience & Work History', signal: 'Led 3 self-initiated projects from concept to launch', icon: Briefcase },
        { section: 'Career Direction', signal: 'Seeks roles with high autonomy and impact', icon: Target },
        { section: 'Deeper Insights', signal: 'Values: Independence, Impact, Achievement', icon: Lightbulb }
      ],
      inference: 'Proven track record of initiative + Strong desire for autonomy + Achievement-oriented values = High Ownership trait'
    },
    {
      trait: 'Learning Speed',
      score: 88,
      color: 'blue' as const,
      inputs: [
        { section: 'Skills & Testing', signal: `Cognitive Agility score: ${cognitiveScore || 87}/100`, icon: Brain },
        { section: 'Experience & Work History', signal: 'Self-taught 4 new technologies in 6 months', icon: BookOpen },
        { section: 'Deeper Insights', signal: 'Growth-oriented mindset, curiosity-driven', icon: TrendingUp }
      ],
      inference: 'Strong cognitive processing + Rapid skill acquisition history + Growth mindset = High Learning Speed'
    },
    {
      trait: 'Communication',
      score: 85,
      color: 'teal' as const,
      inputs: [
        { section: 'Experience & Work History', signal: 'Facilitated cross-functional workshops', icon: MessageSquare },
        { section: 'Deeper Insights', signal: 'Collaboration and clarity valued highly', icon: Users },
        { section: 'Foundation Overview', signal: 'Clear articulation of goals and context', icon: CheckCircle2 }
      ],
      inference: 'Strong facilitation skills + Values clarity + Demonstrated articulation = Effective Communication'
    },
    {
      trait: 'Adaptability',
      score: 90,
      color: 'purple' as const,
      inputs: [
        { section: 'Career Direction', signal: 'Successful transition from marketing to product design', icon: TrendingUp },
        { section: 'Experience & Work History', signal: 'Thrived in 3 different work environments', icon: Briefcase },
        { section: 'Deeper Insights', signal: 'Comfortable with ambiguity and change', icon: Lightbulb }
      ],
      inference: 'Career pivot success + Multi-environment performance + Comfort with uncertainty = High Adaptability'
    },
    {
      trait: 'Problem-Solving',
      score: 87,
      color: 'blue' as const,
      inputs: [
        { section: 'Skills & Testing', signal: 'Top 15% in logical deduction & pattern recognition', icon: Brain },
        { section: 'Experience & Work History', signal: 'Created reusable systems reducing work by 40hrs/month', icon: Target },
        { section: 'Career Direction', signal: 'Drawn to complex, systemic challenges', icon: Lightbulb }
      ],
      inference: 'Strong analytical assessment + Systems thinking demonstrated + Complex problem attraction = Strong Problem-Solving'
    },
    {
      trait: 'Collaboration',
      score: 91,
      color: 'teal' as const,
      inputs: [
        { section: 'Deeper Insights', signal: 'Team success prioritized over individual wins', icon: Users },
        { section: 'Experience & Work History', signal: '6 peer endorsements for teamwork quality', icon: Award },
        { section: 'Foundation Overview', signal: 'Remote-first, async communication preference', icon: MessageSquare }
      ],
      inference: 'Team-oriented values + Strong peer validation + Effective async habits = Excellent Collaboration'
    }
  ];

  return (
    <div>
      <DSSectionHeader
        title="Signature Traits"
        description="Your core behavioral patterns and working style"
        onEdit={() => console.log('Edit traits')}
      />

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
          {cognitiveScore !== null && cognitiveScore !== undefined && (
            <DSMetricCard
              icon={Brain}
              title="Cognitive Agility"
              value={`${cognitiveScore}/100`}
              subtitle={
                cognitiveScore >= 80 ? 'Strong' :
                cognitiveScore >= 60 ? 'Solid' : 'Developing'
              }
              progress={cognitiveScore}
              color="blue"
            />
          )}
          <DSMetricCard
            icon={Target}
            title="Profile Strength"
            value="Complete and verified"
            progress={89}
            color="purple"
          />
          <DSMetricCard
            icon={Zap}
            title="Learning Speed"
            value="High velocity"
            subtitle="Top 15% globally"
            color="blue"
          />
          <DSMetricCard
            icon={Users}
            title="Collaboration Style"
            value="Team-oriented"
            subtitle="Remote-first"
            color="teal"
          />
          {(!cognitiveScore || cognitiveScore === null) && (
            <DSMetricCard
              icon={Brain}
              title="Working Style"
              value="Builder"
              subtitle="Execution-focused"
              color="purple"
            />
          )}
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
