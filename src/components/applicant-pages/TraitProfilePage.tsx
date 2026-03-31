/**
 * Spec 7 §3.2 — Candidate self-view profile
 * Trait radar chart, signature traits, motivational profile,
 * career direction, profile completeness, and publish toggle.
 *
 * Component: components/applicant-pages/TraitProfilePage.tsx
 */
import { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useUserProfile } from '../../contexts/UserProfileContext';
import {
  Eye,
  EyeOff,
  Zap,
  Target,
  Brain,
  Users,
  MessageSquare,
  Flame,
  CheckCircle2,
} from 'lucide-react';

// Six core dimensions matching the scoring schema
const DIMENSIONS = [
  { key: 'learning_velocity', label: 'Learning Velocity', shortLabel: 'Learning', icon: Zap },
  { key: 'ownership_follow_through', label: 'Ownership', shortLabel: 'Ownership', icon: Target },
  { key: 'resilience', label: 'Resilience', shortLabel: 'Resilience', icon: Flame },
  { key: 'communication_confidence', label: 'Communication', shortLabel: 'Comms', icon: MessageSquare },
  { key: 'relational_intelligence', label: 'Relational IQ', shortLabel: 'Relational', icon: Users },
  { key: 'motivational_fit', label: 'Motivational Fit', shortLabel: 'Motivation', icon: Brain },
];

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  learning_velocity: 'Picks up new skills quickly and adapts to changing environments.',
  ownership_follow_through: 'Takes responsibility end-to-end and follows through on commitments.',
  resilience: 'Maintains composure under pressure and recovers quickly from setbacks.',
  communication_confidence: 'Communicates clearly and confidently across contexts.',
  relational_intelligence: 'Reads people well and builds trust through empathy and awareness.',
  motivational_fit: 'Driven by intrinsic motivators aligned with role and environment.',
};

// Four motivational sub-dimensions from Section 6
const MOTIVATION_DIMS = [
  { key: 'motivational_fit_mastery', label: 'Mastery', description: 'Drive to deepen expertise', color: '#7DBBFF' },
  { key: 'motivational_fit_impact', label: 'Impact', description: 'Drive to make a visible difference', color: '#10B981' },
  { key: 'motivational_fit_recognition', label: 'Recognition', description: 'Drive to be seen and valued', color: '#F59E0B' },
  { key: 'motivational_fit_autonomy', label: 'Autonomy', description: 'Drive to work independently', color: '#8B5CF6' },
];

const PROFILE_SECTIONS = [
  { id: 1, label: 'Background Narrative' },
  { id: 2, label: 'How You Work' },
  { id: 3, label: 'How You Think' },
  { id: 4, label: 'Handling Difficulty' },
  { id: 5, label: 'Relating to Others' },
  { id: 6, label: 'What Drives You' },
  { id: 7, label: 'Career Direction' },
  { id: 8, label: 'Your Profile' },
];

export function TraitProfilePage() {
  const { profileData } = useUserProfile();
  const [published, setPublished] = useState(false);

  const traitScores = profileData?.traitScores ?? null;
  const intakeData = profileData?.intakeData;
  const isComplete = profileData?.isComplete ?? false;

  // Radar data — uses short labels so the chart isn't cramped
  const radarData = DIMENSIONS.map((d) => ({
    dimension: d.shortLabel,
    score: traitScores ? (traitScores as any)[d.key] ?? 0 : 0,
    fullMark: 100,
  }));

  // Signature traits: top 3 by score (Spec 7 §3.2)
  const signatureTraits = traitScores
    ? DIMENSIONS.map((d) => ({ ...d, score: (traitScores as any)[d.key] ?? 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  // Motivational profile sorted highest → lowest (Spec 7 §3.2)
  const motivationScores = MOTIVATION_DIMS.map((d) => ({
    ...d,
    score: traitScores ? (traitScores as any)[d.key] ?? 0 : 0,
  })).sort((a, b) => b.score - a.score);

  // Profile completeness
  const completedSections = intakeData?.completedSections ?? [];
  const completeness = Math.round((completedSections.length / 8) * 100);

  // Career direction from Section 7
  const section7 = intakeData?.section7 as any;
  const roleTypes: string[] = section7?.roleTypes ?? [];
  const industries: string[] = section7?.industries ?? [];

  return (
    <div className="space-y-6">
      {/* Header + Publish Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#111827] font-semibold">Trait Profile</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Your assessed trait dimensions, motivational profile and career direction
          </p>
        </div>

        {/* Publish toggle — Spec 7 §3.2: controls candidate_profiles.published */}
        <div
          className="flex items-center gap-3 px-4 py-3 bg-white border border-black/[0.08] shadow-sm"
          style={{ borderRadius: '12px' }}
        >
          <div>
            <p className="text-xs text-[#111827] font-medium">Profile Visibility</p>
            <p className="text-xs text-[#6B7280]">
              {published ? 'Discoverable by employers' : 'Hidden from employers'}
            </p>
          </div>
          <button
            onClick={() => setPublished((v) => !v)}
            disabled={!isComplete}
            title={!isComplete ? 'Complete all 8 sections to publish' : undefined}
            className={`relative w-11 h-6 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              published ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'
            }`}
            style={{ borderRadius: '12px' }}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white shadow-sm transition-transform ${
                published ? 'translate-x-5' : 'translate-x-0'
              }`}
              style={{ borderRadius: '10px' }}
            />
          </button>
          {published ? (
            <Eye className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
          ) : (
            <EyeOff className="w-4 h-4 text-[#6B7280]" strokeWidth={2} />
          )}
        </div>
      </div>

      {/* Profile Completeness — Spec 7 §3.2 */}
      <div
        className="bg-white p-5 border border-black/[0.08] shadow-sm"
        style={{ borderRadius: '16px' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#111827] font-semibold">Profile Completeness</span>
          <span
            className={`text-sm font-semibold ${isComplete ? 'text-[#10B981]' : 'text-[#7DBBFF]'}`}
          >
            {completeness}%{isComplete && ' — Complete'}
          </span>
        </div>
        <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-[#10B981]' : 'bg-[#7DBBFF]'
            }`}
            style={{ width: `${completeness}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PROFILE_SECTIONS.map((s) => {
            const done = completedSections.includes(s.id);
            return (
              <div
                key={s.id}
                className={`flex items-center gap-1.5 px-2 py-1.5 text-xs ${
                  done ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F9F9FA] text-[#9CA3AF]'
                }`}
                style={{ borderRadius: '8px' }}
              >
                {done ? (
                  <CheckCircle2 className="w-3 h-3 shrink-0" strokeWidth={2} />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-[#D1D5DB] shrink-0" />
                )}
                <span className="truncate">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Trait Radar Chart — Spec 7 §3.2: single-series, no employer weighting in self-view */}
        <div
          className="bg-white p-6 border border-black/[0.08] shadow-sm"
          style={{ borderRadius: '20px' }}
        >
          <h3 className="text-base text-[#111827] font-semibold mb-1">Trait Radar</h3>
          <p className="text-xs text-[#6B7280] mb-4">
            Your six core dimensions — self-view only, no employer weighting applied
          </p>

          {isComplete && traitScores ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
                />
                <Radar
                  name="You"
                  dataKey="score"
                  stroke="#7DBBFF"
                  fill="#7DBBFF"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}`, 'Score']}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-[280px] bg-[#F9F9FA]"
              style={{ borderRadius: '12px' }}
            >
              <Brain className="w-10 h-10 text-[#D1D5DB] mb-3" strokeWidth={1.5} />
              <p className="text-sm text-[#9CA3AF] text-center px-6">
                Complete all 8 intake sections to see your trait radar
              </p>
            </div>
          )}
        </div>

        {/* Signature Traits — Spec 7 §3.2: top 2-3 dimensions highlighted */}
        <div
          className="bg-white p-6 border border-black/[0.08] shadow-sm"
          style={{ borderRadius: '20px' }}
        >
          <h3 className="text-base text-[#111827] font-semibold mb-1">Signature Traits</h3>
          <p className="text-xs text-[#6B7280] mb-4">
            Your highest-scoring dimensions with plain-English descriptions
          </p>

          {signatureTraits.length > 0 ? (
            <div className="space-y-4">
              {signatureTraits.map((trait, idx) => {
                const Icon = trait.icon;
                const colors = ['#7DBBFF', '#10B981', '#8B5CF6'];
                const color = colors[idx] ?? '#7DBBFF';
                return (
                  <div
                    key={trait.key}
                    className="p-4 bg-[#F9F9FA] border border-black/[0.05]"
                    style={{ borderRadius: '14px' }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
                      </div>
                      <p className="text-sm text-[#111827] font-semibold flex-1">{trait.label}</p>
                      <span className="text-base font-bold shrink-0" style={{ color }}>
                        {trait.score}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${trait.score}%`, backgroundColor: color }}
                      />
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {DIMENSION_DESCRIPTIONS[trait.key]}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-[220px] bg-[#F9F9FA]"
              style={{ borderRadius: '12px' }}
            >
              <Zap className="w-10 h-10 text-[#D1D5DB] mb-3" strokeWidth={1.5} />
              <p className="text-sm text-[#9CA3AF] text-center px-6">
                Complete your intake to reveal your signature traits
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Profile — Spec 7 §3.2: four sub-dimensions as ordered cards */}
      <div
        className="bg-white p-6 border border-black/[0.08] shadow-sm"
        style={{ borderRadius: '20px' }}
      >
        <h3 className="text-base text-[#111827] font-semibold mb-1">Motivational Profile</h3>
        <p className="text-xs text-[#6B7280] mb-5">
          Your four motivational sub-dimensions ranked by strength (Section 6)
        </p>
        <div className="grid grid-cols-4 gap-4">
          {motivationScores.map((dim, rank) => (
            <div
              key={dim.key}
              className="p-4 border"
              style={{
                borderRadius: '14px',
                borderColor: `${dim.color}30`,
                borderTopColor: dim.color,
                borderTopWidth: '3px',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-semibold px-2 py-0.5"
                  style={{ color: dim.color, backgroundColor: `${dim.color}15`, borderRadius: '6px' }}
                >
                  #{rank + 1}
                </span>
                {isComplete && (
                  <span className="text-sm font-bold" style={{ color: dim.color }}>
                    {dim.score}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#111827] font-semibold mb-1">{dim.label}</p>
              <p className="text-xs text-[#9CA3AF] mb-3">{dim.description}</p>
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: isComplete ? `${dim.score}%` : '0%', backgroundColor: dim.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Direction — Spec 7 §3.2: from Section 7, framed as exploration not prescription */}
      <div
        className="bg-white p-6 border border-black/[0.08] shadow-sm"
        style={{ borderRadius: '20px' }}
      >
        <h3 className="text-base text-[#111827] font-semibold mb-1">Career Direction</h3>
        <p className="text-xs text-[#6B7280] mb-5">
          Role types and industry interests from Section 7 — framed as exploration, not prescription
        </p>

        {completedSections.includes(7) && (roleTypes.length > 0 || industries.length > 0) ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mb-3">
                Role Types
              </p>
              <div className="flex flex-wrap gap-2">
                {roleTypes.length > 0 ? (
                  roleTypes.map((role: string) => (
                    <span
                      key={role}
                      className="px-3 py-1.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-xs font-medium"
                      style={{ borderRadius: '8px' }}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#9CA3AF]">None selected</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mb-3">
                Industry Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {industries.length > 0 ? (
                  industries.map((industry: string) => (
                    <span
                      key={industry}
                      className="px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] text-xs font-medium"
                      style={{ borderRadius: '8px' }}
                    >
                      {industry}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#9CA3AF]">None selected</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="p-6 bg-[#F9F9FA] text-center"
            style={{ borderRadius: '12px' }}
          >
            <p className="text-sm text-[#9CA3AF]">
              Complete Section 7 (Career Direction) to populate this section
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
