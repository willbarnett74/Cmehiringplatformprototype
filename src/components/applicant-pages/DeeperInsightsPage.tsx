/**
 * DeeperInsightsPage — Spec 9 (candidate insight view)
 *
 * Two states:
 *  1. Pre-intake  — reflection cards to surface early patterns (existing UX)
 *  2. Post-intake — full insight view: trait summary, radar chart,
 *                   motivational profile, role direction suggestions,
 *                   industry alignment
 */

import { useState, useEffect } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Sparkles,
  Target,
  Users,
  Zap,
  Brain,
  Focus,
  TrendingUp,
  MapPin,
  Info,
} from 'lucide-react';
import { DSSectionHeader, DSSurfaceCard } from '../ds/DSComponents';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { roleTemplates, RoleTemplate } from '../../lib/roleTemplates';
import { DimensionScores } from '../../utils/intakeScoring';

// ── Types ────────────────────────────────────────────────────────────────────

interface RoleMatch {
  template: RoleTemplate;
  score: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const TRAIT_LABELS: Record<string, string> = {
  learning_velocity: 'Learning Velocity',
  ownership_follow_through: 'Ownership',
  resilience: 'Resilience',
  communication_confidence: 'Communication',
  relational_intelligence: 'Relational Intelligence',
  motivational_fit: 'Motivational Fit',
};

const MOTIVATION_LABELS: Record<string, string> = {
  motivational_fit_mastery: 'Mastery',
  motivational_fit_autonomy: 'Autonomy',
  motivational_fit_impact: 'Impact',
  motivational_fit_recognition: 'Recognition',
};

const MOTIVATION_DESC: Record<string, string> = {
  motivational_fit_mastery: 'depth and craft',
  motivational_fit_autonomy: 'independence over how you work',
  motivational_fit_impact: 'making a tangible difference',
  motivational_fit_recognition: 'visibility and acknowledgement',
};

const TRAIT_DESCRIPTIONS: Record<string, (score: number) => string> = {
  learning_velocity: (s) =>
    s >= 75
      ? 'You pick up new concepts quickly and actively seek out complexity. Environments that reward rapid learning suit you well.'
      : s >= 50
      ? 'You learn steadily and adapt well when given clear frameworks. You balance exploration with consolidation.'
      : 'You prefer mastering depth over breadth and thrive in roles with stable, well-defined learning paths.',
  ownership_follow_through: (s) =>
    s >= 75
      ? 'Your strongest signal is Ownership & Follow-Through — you take genuine responsibility for outcomes and follow through on commitments regardless of conditions.'
      : s >= 50
      ? 'You take ownership of your work and follow through reliably, especially when the stakes are clear.'
      : 'You work best with clear accountability structures and collaborate well when responsibilities are well-defined.',
  resilience: (s) =>
    s >= 75
      ? 'You recover quickly from setbacks and stay focused under pressure. Ambiguous, high-stakes environments energise rather than drain you.'
      : s >= 50
      ? 'You handle challenges well when you have time to process and respond thoughtfully.'
      : 'You work best in stable environments where you can plan ahead and avoid reactive decision-making.',
  communication_confidence: (s) =>
    s >= 75
      ? 'You communicate with clarity and confidence across contexts — written, verbal, and persuasive situations all feel natural.'
      : s >= 50
      ? 'You express yourself clearly in structured settings and build trust through consistent, considered communication.'
      : 'You communicate thoughtfully and precisely, preferring depth over volume.',
  relational_intelligence: (s) =>
    s >= 75
      ? 'You read group dynamics intuitively and build trust quickly. Collaborative, people-first environments bring out your best work.'
      : s >= 50
      ? 'You build strong working relationships over time and navigate interpersonal complexity when needed.'
      : 'You work effectively with small, trusted teams and prefer low-politics environments.',
};

function motivationalFitAvg(scores: DimensionScores): number {
  return Math.round(
    (scores.motivational_fit_mastery +
      scores.motivational_fit_autonomy +
      scores.motivational_fit_impact +
      scores.motivational_fit_recognition) /
      4,
  );
}

function buildRadarData(scores: DimensionScores) {
  return [
    { dimension: 'Learning', fullMark: 100, score: Math.round(scores.learning_velocity) },
    { dimension: 'Ownership', fullMark: 100, score: Math.round(scores.ownership_follow_through) },
    { dimension: 'Resilience', fullMark: 100, score: Math.round(scores.resilience) },
    { dimension: 'Communication', fullMark: 100, score: Math.round(scores.communication_confidence) },
    { dimension: 'Relational', fullMark: 100, score: Math.round(scores.relational_intelligence) },
    { dimension: 'Motivation', fullMark: 100, score: motivationalFitAvg(scores) },
  ];
}

function computeRoleMatches(scores: DimensionScores): RoleMatch[] {
  const motivFit = motivationalFitAvg(scores);
  return roleTemplates
    .map((template) => {
      const w = template.trait_weights;
      const score = Math.round(
        (scores.learning_velocity * w.learning_velocity +
          scores.ownership_follow_through * w.ownership_follow_through +
          scores.resilience * w.resilience +
          scores.communication_confidence * w.communication_confidence +
          scores.relational_intelligence * w.relational_intelligence +
          motivFit * w.motivational_fit) /
          100,
      );
      return { template, score };
    })
    .sort((a, b) => b.score - a.score);
}

function getTopTraits(scores: DimensionScores, n = 3): string[] {
  const core = [
    'learning_velocity',
    'ownership_follow_through',
    'resilience',
    'communication_confidence',
    'relational_intelligence',
  ] as const;
  return [...core]
    .sort((a, b) => (scores[b] as number) - (scores[a] as number))
    .slice(0, n);
}

function getMotivationRanking(scores: DimensionScores) {
  const keys = [
    'motivational_fit_mastery',
    'motivational_fit_autonomy',
    'motivational_fit_impact',
    'motivational_fit_recognition',
  ] as const;
  return [...keys].sort((a, b) => scores[b] - scores[a]);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? '#10B981' : score >= 55 ? '#F59E0B' : '#7DBBFF';
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5"
      style={{ color, backgroundColor: color + '18', borderRadius: '6px' }}
    >
      {score}
    </span>
  );
}

// ── Pre-intake reflection view (unchanged from original) ─────────────────────

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
            className={`px-3 py-1.5 text-sm transition-all border ${
              selectedOption === option
                ? 'bg-[#7DBBFF] text-white border-[#7DBBFF]'
                : 'bg-white text-[#6B7280] border-black/[0.08] hover:border-[#7DBBFF]/40 hover:text-[#7DBBFF]'
            }`}
            style={{ borderRadius: '12px' }}
          >
            {option}
          </button>
        ))}
      </div>
    </DSSurfaceCard>
  );
}

// ── Post-intake: full insight view ────────────────────────────────────────────

function PostIntakeInsights({ scores }: { scores: DimensionScores }) {
  const { profileData } = useUserProfile();
  const radarData = buildRadarData(scores);
  const topTraits = getTopTraits(scores);
  const motivRanking = getMotivationRanking(scores);
  const roleMatches = computeRoleMatches(scores).slice(0, 3);

  const industrySelections: string[] =
    profileData?.career_preferences?.industry_openness ?? [];

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-2xl text-[#111827] mb-2">Your Insight Profile</h2>
        <p className="text-[#6B7280]">
          Based on your completed assessment. These insights are identical to what employers see — no separate scoring.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* ── Trait Radar Chart ── */}
        <DSSurfaceCard className="p-6">
          <h3 className="text-[#111827] mb-1 font-semibold">Trait Profile</h3>
          <p className="text-xs text-[#6B7280] mb-4">Your six core dimensions at a glance.</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#6B7280', fontSize: 11 }}
              />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="#7DBBFF"
                fill="#7DBBFF"
                fillOpacity={0.18}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number) => [`${value}`, 'Score']}
                contentStyle={{ borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </DSSurfaceCard>

        {/* ── Motivational Profile ── */}
        <DSSurfaceCard className="p-6">
          <h3 className="text-[#111827] mb-1 font-semibold">Motivational Profile</h3>
          <p className="text-xs text-[#6B7280] mb-4">What drives you, in order of strength.</p>
          <div className="space-y-3">
            {motivRanking.map((key, idx) => {
              const score = scores[key as keyof DimensionScores] as number;
              const label = MOTIVATION_LABELS[key];
              const desc = MOTIVATION_DESC[key];
              const prefixes = ["You're most driven by", 'followed by', 'then', 'and finally'];
              return (
                <div key={key} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{ backgroundColor: idx === 0 ? '#7DBBFF' : idx === 1 ? '#8B5CF6' : '#D1D5DB' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#111827] font-medium">{label}</span>
                      <ScoreBadge score={Math.round(score)} />
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {prefixes[idx]} <span className="font-medium text-[#374151]">{label}</span> ({desc})
                    </p>
                    <div className="mt-1.5 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7DBBFF] to-[#8B5CF6] transition-all duration-700"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DSSurfaceCard>
      </div>

      {/* ── Top Trait Summaries ── */}
      <DSSurfaceCard className="p-6 mb-6">
        <h3 className="text-[#111827] mb-1 font-semibold">Your Strongest Signals</h3>
        <p className="text-xs text-[#6B7280] mb-4">Plain-English descriptions of your top trait dimensions.</p>
        <div className="space-y-4">
          {topTraits.map((key) => {
            const score = scores[key as keyof DimensionScores] as number;
            const label = TRAIT_LABELS[key];
            const description = TRAIT_DESCRIPTIONS[key]?.(score) ?? '';
            return (
              <div key={key} className="flex gap-4">
                <div className="pt-0.5 shrink-0">
                  <div
                    className="w-2 h-2 rounded-full mt-1"
                    style={{ backgroundColor: '#7DBBFF' }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[#111827] font-medium">{label}</span>
                    <ScoreBadge score={Math.round(score)} />
                  </div>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DSSurfaceCard>

      {/* ── Role Direction Suggestions ── */}
      <DSSurfaceCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
          <h3 className="text-[#111827] font-semibold">Where Your Traits Align</h3>
        </div>
        <p className="text-xs text-[#6B7280] mb-4">
          Based on your profile scored against typical employer weightings for each role type. Framed as exploration, not career advice.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {roleMatches.map(({ template, score }, idx) => (
            <div
              key={template.id}
              className="p-4 border border-black/[0.06] bg-[#FAFAFA]"
              style={{ borderRadius: '12px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#374151]">{template.name}</span>
                {idx === 0 && (
                  <span className="text-[10px] font-semibold text-[#7DBBFF] bg-[#7DBBFF]/10 px-1.5 py-0.5 rounded-full">
                    Top match
                  </span>
                )}
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF]">Alignment</span>
                  <span className="text-[#7DBBFF] font-medium">{score}%</span>
                </div>
                <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7DBBFF] to-[#8B5CF6]"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed line-clamp-2">
                {template.description}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#9CA3AF] mt-3 flex items-center gap-1">
          <Info className="w-3 h-3" strokeWidth={2} />
          Your traits align with these categories — this is one input, not a prescription.
        </p>
      </DSSurfaceCard>

      {/* ── Industry Alignment ── */}
      <DSSurfaceCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
          <h3 className="text-[#111827] font-semibold">Industry Interests</h3>
        </div>
        <p className="text-xs text-[#6B7280] mb-4">
          Industries you expressed interest in during your assessment.
        </p>
        {industrySelections.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {industrySelections.map((industry) => (
                <span
                  key={industry}
                  className="px-3 py-1.5 text-sm text-[#374151] bg-white border border-black/[0.08]"
                  style={{ borderRadius: '10px' }}
                >
                  {industry}
                </span>
              ))}
            </div>
            <div className="p-3 bg-[#F8FAFC] border border-[#7DBBFF]/20 rounded-lg">
              <p className="text-xs text-[#6B7280]">
                <span className="font-medium text-[#374151]">More coming: </span>
                As more people use CMe, we'll be able to show you how your profile compares to successful hires in similar roles within these industries.
              </p>
            </div>
          </>
        ) : (
          <div className="p-3 bg-[#F8FAFC] border border-black/[0.06] rounded-lg">
            <p className="text-xs text-[#6B7280]">
              Industry preferences will appear here after you complete Section 7 of your assessment.
            </p>
          </div>
        )}
      </DSSurfaceCard>

      {/* ── Future Features Notice ── */}
      <DSSurfaceCard className="p-5 bg-[#F8FAFC] border-[#7DBBFF]/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white border border-[#7DBBFF]/30 rounded-lg">
            <Sparkles className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-[#111827] text-sm font-medium mb-1">More insights coming</h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Once the platform has enough aggregate data, you'll also see comparative positioning (how your traits rank vs others in similar roles),
              success pattern matching, and post-hire reflection (comparing your intake motivations vs your 30/90-day pulse responses).
            </p>
          </div>
        </div>
      </DSSurfaceCard>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DeeperInsightsPage() {
  const { profileData, updateProfileData } = useUserProfile();
  const intakeComplete = profileData?.intakeData?.isComplete ?? false;
  const traitScores = profileData?.trait_scores ?? null;

  // Pre-intake reflection state
  const [reflections, setReflections] = useState<Record<string, string | null>>({
    decisionStyle: null,
    energyFlow: null,
    responseToChange: null,
    focusPreference: null,
    communicationStyle: null,
  });

  const handleReflectionSelect = (key: string, value: string) => {
    setReflections((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  useEffect(() => {
    if (reflections.responseToChange) {
      const map: Record<string, 'High' | 'Moderate' | 'Structured'> = {
        'Thrive on change': 'High',
        'Adapt when needed': 'Moderate',
        'Prefer stability': 'Structured',
        'Need clear structure': 'Structured',
      };
      updateProfileData({ adaptability_tag: map[reflections.responseToChange] || 'Moderate' });
    }
    if (reflections.decisionStyle) {
      const map: Record<string, 'Data-Driven' | 'Intuitive' | 'Collaborative' | 'Balanced'> = {
        'Data and analysis': 'Data-Driven',
        'Gut instinct': 'Intuitive',
        'Team consensus': 'Collaborative',
        'Mix of both': 'Balanced',
      };
      updateProfileData({ decision_style: map[reflections.decisionStyle] || 'Balanced' });
    }
    if (reflections.communicationStyle) {
      const map: Record<string, 'Direct' | 'Thoughtful' | 'Visual' | 'Facilitative'> = {
        'Direct and concise': 'Direct',
        'Thoughtful and detailed': 'Thoughtful',
        'Visual/storytelling': 'Visual',
        Facilitative: 'Facilitative',
      };
      updateProfileData({ communication_style: map[reflections.communicationStyle] || 'Direct' });
    }
  }, [reflections]);

  // Show full insight view when intake is complete and scores exist
  if (intakeComplete && traitScores) {
    return <PostIntakeInsights scores={traitScores} />;
  }

  // Pre-intake: reflection cards + teaser
  const allReflectionsComplete = Object.values(reflections).every((v) => v !== null);

  const reflectionCards = [
    { key: 'decisionStyle', title: 'Decision Style', question: 'How do you usually make important decisions?', options: ['Intuitive', 'Analytical', 'Collaborative', 'Balanced'] },
    { key: 'energyFlow', title: 'Energy Flow', question: 'When do you do your best work?', options: ['Mornings', 'Evenings', 'Under Pressure', 'Consistent Routine'] },
    { key: 'responseToChange', title: 'Response to Change', question: 'When things shift suddenly, you usually…', options: ['Adapt Quickly', 'Pause & Assess', 'Seek Clarity', 'Re-prioritize'] },
    { key: 'focusPreference', title: 'Focus Preference', question: 'What helps you stay focused?', options: ['Structure', 'Pressure', 'Collaboration', 'Autonomy', 'Breaks'] },
    { key: 'communicationStyle', title: 'Communication Style', question: 'How do you prefer to communicate in teams?', options: ['Verbally', 'In Writing', 'Spontaneous Chats', 'Structured Meetings'] },
  ];

  const earlyInsights = [
    { icon: Sparkles, title: 'Motivation Type', insight: "You're driven by growth and autonomy. Your responses suggest you thrive when given room to learn, experiment, and take ownership of your work.", nextValidation: "Next: We'll validate this through scenario-based questions in Skills & Testing.", confidence: 78 },
    { icon: Target, title: 'Problem Orientation', insight: "You enjoy analytical and people-focused challenges. You're energised by work that combines logical thinking with understanding human needs.", nextValidation: "Next: We'll explore how you apply this to real-world situations.", confidence: 82 },
    { icon: Users, title: 'Collaboration Style', insight: "You work best with clear communicators who respect independence. You value collaborative dialogue and space to think autonomously.", nextValidation: "Next: We'll assess team dynamics preferences through interactive exercises.", confidence: 75 },
    { icon: Zap, title: 'Adaptability Pattern', insight: "You adapt quickly to change but appreciate structure. You're comfortable with uncertainty while still valuing clear frameworks.", nextValidation: "Next: We'll test how you respond to evolving priorities.", confidence: 71 },
    { icon: Brain, title: 'Decision-Making Style', insight: 'You make decisions based on a balance of logic and intuition — weighing facts but trusting your instincts when confident.', nextValidation: "Skills & Testing will explore this through situational and reasoning challenges.", confidence: 76 },
    { icon: Focus, title: 'Focus & Work Rhythm', insight: 'You work best in focused bursts and value visible progress checkpoints to stay engaged.', nextValidation: 'Upcoming modules will help identify your ideal balance between deep-focus and adaptive multitasking.', confidence: 73 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl text-[#111827] mb-2">Deeper Insights — What Your Profile Is Starting to Reveal</h2>
        <p className="text-[#6B7280]">Answer a few quick reflections. Once you complete the full assessment, your Insight Profile unlocks with your full trait radar, motivational breakdown, and role alignment.</p>
      </div>

      {/* Teaser banner */}
      <div className="mb-6 p-4 bg-[#7DBBFF]/5 border border-[#7DBBFF]/20" style={{ borderRadius: '16px' }}>
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#7DBBFF] mt-0.5 shrink-0" strokeWidth={1.5} />
          <div>
            <h4 className="text-[#111827] text-sm font-medium mb-1">Full Insight Profile unlocks after completing your assessment</h4>
            <p className="text-xs text-[#6B7280]">You'll see your trait radar chart, motivational profile, role alignment scores, and industry insights — all based on your responses.</p>
          </div>
        </div>
      </div>

      {/* Reflection cards */}
      <div className="mb-8">
        <h3 className="text-[#111827] mb-4 font-medium">Quick Reflections</h3>
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

      {/* Early insights panel */}
      {allReflectionsComplete && (
        <div className="transition-all duration-700 ease-out" style={{ animation: 'fadeIn 0.7s ease-out' }}>
          <div className="mb-6 p-4 bg-[#7DBBFF]/5 border border-[#7DBBFF]/20" style={{ borderRadius: '16px' }}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#7DBBFF] mt-0.5" strokeWidth={1.5} />
              <div>
                <h3 className="text-[#111827] mb-1">Based on your responses, here's what we're learning about how you think and work.</h3>
                <p className="text-sm text-[#6B7280]">These early insights will deepen significantly once your full assessment is complete.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {earlyInsights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <DSSurfaceCard key={idx} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2.5 bg-[#7DBBFF]/10 border border-[#7DBBFF]/20" style={{ borderRadius: '10px' }}>
                      <Icon className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#111827] mb-2">{insight.title}</h3>
                      <p className="text-[#6B7280] leading-relaxed text-sm">{insight.insight}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-black/[0.06]">
                    <div className="text-xs italic text-[#9CA3AF] mb-3">{insight.nextValidation}</div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#9CA3AF]">Based on your inputs so far</span>
                      <span className="text-[#7DBBFF]">{insight.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F8FAFC] border border-black/[0.04]" style={{ borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="h-full bg-gradient-to-r from-[#7DBBFF] to-[#6aabef]" style={{ width: `${insight.confidence}%`, borderRadius: '4px' }} />
                    </div>
                  </div>
                </DSSurfaceCard>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
