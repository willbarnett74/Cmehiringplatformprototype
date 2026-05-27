import { X, MapPin, Briefcase, Mail, Phone, Linkedin, Star, MessageSquare, FileText, ArrowRight, Copy, Sparkles, Building2, Download, Share2, Calendar, Award, TrendingUp, Target, Users, Zap, Brain, Heart, CheckCircle2, ExternalLink } from 'lucide-react';
import type { Candidate } from '../types/employer';
import { useState } from 'react';
import type { CandidateDimensionScores } from '../../utils/intakeScoreAggregate';
import { toCandidateDimensionScores } from '../../utils/intakeScoreAggregate';
import {
  MOTIVATIONAL_FIT_SUB_KEYS,
  MOTIVATIONAL_FIT_SUB_LABELS,
  TRAIT_DIMENSION_KEYS,
  TRAIT_LABELS,
} from '../../lib/traits';
import {
  candidateSummary,
  candidateTagline,
  computeProfileCompleteness,
  formatLinkedInHref,
  formatSalary,
  listOrDash,
} from '../../lib/candidateProfileDisplay';

function resolveCandidateProfileDims(candidate: Candidate): CandidateDimensionScores | null {
  if (candidate.dimensionScores) return candidate.dimensionScores;
  if (candidate.trait_scores) return toCandidateDimensionScores(candidate.trait_scores);
  return null;
}

const DIMENSION_BAR_COLORS = ['#7DBBFF', '#8B5CF6', '#14B8A6', '#F59E0B'];

const MOCK_ROLE_TARGET_BY_KEY: Record<(typeof TRAIT_DIMENSION_KEYS)[number], number> = {
  learning_velocity: 72,
  ownership_follow_through: 74,
  resilience: 70,
  communication_confidence: 73,
  relational_intelligence: 71,
  motivational_fit: 72,
};

const CORE_DIMENSION_DESCRIPTIONS: Record<(typeof TRAIT_DIMENSION_KEYS)[number], string> = {
  learning_velocity: 'Picks up new skills quickly and adapts to changing environments.',
  ownership_follow_through: 'Takes responsibility end-to-end and follows through on commitments.',
  resilience: 'Maintains composure under pressure and recovers quickly from setbacks.',
  communication_confidence: 'Communicates clearly and confidently across contexts.',
  relational_intelligence: 'Reads people well and builds trust through empathy and awareness.',
  motivational_fit: 'Driven by intrinsic motivators aligned with role and environment.',
};

interface CandidateProfileViewProps {
  candidate: Candidate;
  onClose: () => void;
  onMoveToNextStage: (candidateId: number) => void;
  onAddNote: (candidateId: number) => void;
  onMoveToStage?: (candidateId: number, stage: string) => void;
}

export function CandidateProfileView({ candidate, onClose, onMoveToNextStage, onAddNote, onMoveToStage }: CandidateProfileViewProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isShortlisted, setIsShortlisted] = useState(false);

  const getFitLevel = (score: number): { label: string; color: string; bgColor: string; hex: string } => {
    if (score >= 75) return { label: 'Strong Match', color: 'text-[#10B981]', bgColor: 'bg-[#10B981]/10', hex: '#10B981' };
    if (score >= 50) return { label: 'Moderate Match', color: 'text-[#F59E0B]', bgColor: 'bg-[#F59E0B]/10', hex: '#F59E0B' };
    return { label: 'Low Match', color: 'text-[#9CA3AF]', bgColor: 'bg-[#9CA3AF]/10', hex: '#9CA3AF' };
  };

  const fitLevel = getFitLevel(candidate.score);

  const profileDims = resolveCandidateProfileDims(candidate);
  const tagline = candidateTagline(candidate);
  const summaryText = candidateSummary(candidate);
  const completeness = candidate.profileCompleteness ?? computeProfileCompleteness(candidate);
  const linkedInHref = formatLinkedInHref(candidate.linkedinUrl);
  const salaryLabel = formatSalary(candidate.salaryMin, candidate.salaryCurrency);

  const statedStrengths = [candidate.strength1, candidate.strength2, candidate.strength3].filter(
    (s): s is string => !!s?.trim(),
  );

  const coreSorted = profileDims
    ? TRAIT_DIMENSION_KEYS.map((k) => ({ key: k, score: profileDims[k] })).sort((a, b) => b.score - a.score)
    : [];

  const traitClusterBars = profileDims
    ? coreSorted
        .slice(0, 4)
        .map((row, i) => ({
          name: TRAIT_LABELS[row.key],
          value: Math.round(row.score),
          color: DIMENSION_BAR_COLORS[i % DIMENSION_BAR_COLORS.length],
        }))
    : [];

  const derivedStrengths = coreSorted.slice(0, 2).map(({ key }) => ({
    label: TRAIT_LABELS[key],
    description: CORE_DIMENSION_DESCRIPTIONS[key],
  }));

  const derivedGrowth = coreSorted.length >= 2
    ? coreSorted.slice(-2).map(({ key }) => ({
        label: TRAIT_LABELS[key],
        description: `Room to strengthen ${TRAIT_LABELS[key].toLowerCase()} with targeted practice and feedback.`,
      }))
    : [];

  const assessmentFromProfile =
    profileDims && coreSorted.length > 0
      ? coreSorted.slice(0, 3).map(({ key, score }) => ({
          title: TRAIT_LABELS[key],
          score: Math.round(score),
          percentile: score >= 85 ? 'Strong signal' : score >= 70 ? 'Solid signal' : 'Emerging',
          description: CORE_DIMENSION_DESCRIPTIONS[key],
        }))
      : null;

  const sections = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'traits', label: 'Signature Traits', icon: Sparkles },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'insights', label: 'Insights', icon: Brain },
    { id: 'documents', label: 'CV / Documents', icon: FileText },
  ];

  const assessmentResults = assessmentFromProfile ?? [
    {
      title: 'CMe trait profile',
      score: 0,
      percentile: 'Pending',
      description: 'Scores populate when the applicant completes the profile builder (Sections 2–6).',
    },
  ];

  const insightBlocks = [
    {
      title: 'Motivation & drivers',
      icon: Heart,
      color: '#F59E0B',
      items: [
        candidate.enjoyedMost?.trim(),
        candidate.openContext?.trim(),
        candidate.workingContext?.trim(),
      ].filter(Boolean) as string[],
    },
    {
      title: 'Ideal work environment',
      icon: Users,
      color: '#7DBBFF',
      items: [
        listOrDash(candidate.preferredWorkType),
        candidate.orgSizePreference ? `Org size: ${candidate.orgSizePreference}` : null,
        candidate.openToContract ? `Contract: ${candidate.openToContract}` : null,
      ].filter((x) => x && x !== '—') as string[],
    },
    {
      title: 'Role preferences',
      icon: Target,
      color: '#14B8A6',
      items: [
        listOrDash(candidate.preferredRoleTypes),
        candidate.currentSituation?.trim(),
        candidate.industryBackground?.length
          ? `Industries: ${candidate.industryBackground.join(', ')}`
          : null,
      ].filter(Boolean) as string[],
    },
    {
      title: 'Availability & logistics',
      icon: MessageSquare,
      color: '#8B5CF6',
      items: [
        candidate.availability ? `Availability: ${candidate.availability}` : null,
        candidate.noticePeriod ? `Notice: ${candidate.noticePeriod}` : null,
        candidate.workRights ? `Work rights: ${candidate.workRights}` : null,
        salaryLabel ? `Salary from: ${salaryLabel}` : null,
      ].filter(Boolean) as string[],
    },
  ].filter((block) => block.items.length > 0);

  return (
    <div className="fixed inset-0 bg-[#F9F9FA] z-50 flex">
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-black/[0.08] p-6 flex flex-col overflow-y-auto">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-8 transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-medium">Back to Search</span>
        </button>

        <nav className="flex-1 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-[#7DBBFF]/10 text-[#7DBBFF]'
                    : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-black/[0.08]">
          <p className="text-xs text-[#9CA3AF] mb-2">Profile Completeness</p>
          <div className="w-full h-2 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div className="h-full bg-[#7DBBFF]" style={{ width: `${completeness}%`, borderRadius: '4px' }} />
          </div>
          <p className="text-xs text-[#6B7280] mt-2">{completeness}% Complete</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Header with Cover Gradient */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-[#7DBBFF]/20 via-[#8B5CF6]/20 to-[#14B8A6]/20" />
            
            <div className="bg-white border-b border-black/[0.08]">
              <div className="max-w-5xl mx-auto px-8 -mt-16">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-[#7DBBFF] flex items-center justify-center text-white text-2xl font-semibold shadow-lg ring-4 ring-white overflow-hidden">
                      {candidate.avatarUrl ? (
                        <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        candidate.name.split(' ').map((n) => n[0]).join('')
                      )}
                    </div>
                    <div className="pt-4">
                      <h1 className="text-2xl text-[#111827] font-semibold mb-2">{candidate.name}</h1>
                      <p className="text-base text-[#6B7280] mb-1">{candidate.role}</p>
                      {candidate.currentCompany ? (
                        <p className="text-sm text-[#6B7280] mb-3">{candidate.currentCompany}</p>
                      ) : null}
                      {tagline ? (
                        <p className="text-sm text-[#7DBBFF] italic mb-4">{tagline}</p>
                      ) : null}
                      
                      {/* Tags and Fit Level */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1.5 ${fitLevel.bgColor} ${fitLevel.color} font-semibold text-xs flex items-center gap-1.5`} style={{ borderRadius: '8px' }}>
                          <span className="text-sm font-bold">{candidate.score}%</span>
                          <span className="opacity-70">·</span>
                          {fitLevel.label}
                        </span>
                        <span className="px-3 py-1.5 bg-[#34D399]/10 text-[#34D399] font-medium text-xs" style={{ borderRadius: '8px' }}>
                          {candidate.availability?.trim() || 'Open to opportunities'}
                        </span>
                        {candidate.preferredWorkType?.some((w) => /remote/i.test(w)) ? (
                          <span className="px-3 py-1.5 bg-[#3B82F6]/10 text-[#3B82F6] font-medium text-xs" style={{ borderRadius: '8px' }}>
                            Remote-ready
                          </span>
                        ) : null}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9F9FA] text-[#6B7280] text-xs" style={{ borderRadius: '8px' }}>
                          <MapPin className="w-3 h-3" strokeWidth={1.5} />
                          <span>{candidate.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-4">
                    <button
                      onClick={() => setIsShortlisted(!isShortlisted)}
                      className={`px-4 py-2 border text-[#111827] hover:bg-[#F9F9FA] transition-all text-sm font-medium flex items-center gap-2 ${
                        isShortlisted
                          ? 'border-[#7DBBFF] shadow-[0_0_0_3px_rgba(125,187,255,0.1)]'
                          : 'border-black/[0.08] hover:border-[#7DBBFF]/30'
                      }`}
                      style={{ borderRadius: '10px' }}
                    >
                      <Star className="w-4 h-4" strokeWidth={2} fill={isShortlisted ? '#7DBBFF' : 'none'} />
                      <span>Shortlist</span>
                    </button>
                    <button
                      onClick={() => onAddNote(candidate.id)}
                      className="px-4 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 transition-all text-sm font-medium flex items-center gap-2"
                      style={{ borderRadius: '10px' }}
                    >
                      <MessageSquare className="w-4 h-4" strokeWidth={2} />
                      <span>Add Note</span>
                    </button>
                    <button
                      className="px-4 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                      style={{ borderRadius: '10px' }}
                    >
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                      <span>Invite to Assessment</span>
                    </button>
                  </div>
                </div>

                {/* Contact Info Row */}
                <div className="flex items-center gap-6 pb-6 flex-wrap">
                  {candidate.email ? (
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Mail className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                      <span>{candidate.email}</span>
                      <button
                        type="button"
                        className="p-1 hover:bg-[#F9F9FA] transition-colors"
                        style={{ borderRadius: '4px' }}
                        onClick={() => void navigator.clipboard.writeText(candidate.email ?? '')}
                      >
                        <Copy className="w-3 h-3 text-[#9CA3AF]" strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : null}
                  {candidate.phone ? (
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Phone className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                      <span>{candidate.phone}</span>
                    </div>
                  ) : null}
                  {linkedInHref ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Linkedin className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                      <a
                        href={linkedInHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7DBBFF] hover:text-[#6aabef] transition-colors"
                      >
                        LinkedIn profile
                      </a>
                    </div>
                  ) : null}
                  {!candidate.email && !candidate.phone && !linkedInHref ? (
                    <p className="text-sm text-[#9CA3AF] italic">No contact details shared yet.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="max-w-5xl mx-auto px-8 py-8 pb-32">{/* Added pb-32 for footer clearance */}
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Profile Summary */}
                <div className="p-5 bg-[#F9F9FA] border border-black/[0.08]" style={{ borderRadius: '16px' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-[#7DBBFF]" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#111827] mb-1">Profile Summary</p>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{summaryText}</p>
                    </div>
                  </div>
                </div>

                {/* Career Readiness & Growth */}
                <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-[#7DBBFF]" strokeWidth={2} />
                    <h2 className="text-base text-[#111827] font-semibold">Career Readiness & Growth</h2>
                  </div>

                  {(() => {
                    const exp = candidate.totalExperience ?? 0;
                    const hasReadinessData = candidate.transitioning || candidate.openToChange || candidate.readyToStepUp || candidate.retrained || exp > 0;

                    if (!hasReadinessData) {
                      return (
                        <div className="p-4 bg-[#F9F9FA] border border-black/[0.08] text-center" style={{ borderRadius: '12px' }}>
                          <p className="text-sm text-[#9CA3AF] italic">
                            No readiness information shared by this candidate.
                          </p>
                        </div>
                      );
                    }

                    // Determine career stage
                    let stageLabel = '';
                    let stageSubtitle = '';
                    
                    if (candidate.transitioning) {
                      stageLabel = 'Career Transition / Returner';
                      stageSubtitle = 'Currently transitioning or returning to workforce';
                    } else if (exp <= 2) {
                      stageLabel = 'Early Career';
                      stageSubtitle = `${exp} ${exp === 1 ? 'year' : 'years'} of experience`;
                    } else if (exp <= 5) {
                      stageLabel = 'Developing';
                      stageSubtitle = `${exp} years of experience`;
                    } else if (exp <= 10) {
                      stageLabel = 'Established';
                      stageSubtitle = `${exp} years of experience`;
                    } else {
                      stageLabel = 'Experienced';
                      stageSubtitle = `${exp}+ years of experience`;
                    }

                    return (
                      <div className="space-y-4">
                        {/* Career Stage - Large Chip */}
                        <div>
                          <label className="block text-xs text-[#6B7280] font-medium mb-2">Career Stage</label>
                          <div className="inline-flex flex-col p-4 bg-[#E8F2FF] border-2 border-[#7DBBFF]/30" style={{ borderRadius: '12px' }}>
                            <span className="text-sm font-semibold text-[#7DBBFF] mb-1">{stageLabel}</span>
                            <span className="text-xs text-[#7DBBFF]/80">{stageSubtitle}</span>
                          </div>
                        </div>

                        {/* Readiness Tags */}
                        {(candidate.openToChange || candidate.readyToStepUp || candidate.retrained) && (
                          <div>
                            <label className="block text-xs text-[#6B7280] font-medium mb-3">Readiness Indicators</label>
                            <div className="flex flex-wrap gap-2">
                              {candidate.openToChange && (
                                <div className="flex items-start gap-2 p-3 bg-[#F3E8FF] border border-[#8B5CF6]/20" style={{ borderRadius: '10px' }}>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#8B5CF6] mb-0.5">Open to Career Change</p>
                                    <p className="text-xs text-[#8B5CF6]/70">Exploring new career paths and opportunities</p>
                                  </div>
                                </div>
                              )}
                              
                              {candidate.readyToStepUp && (
                                <div className="flex items-start gap-2 p-3 bg-[#D1FAE5] border border-[#10B981]/20" style={{ borderRadius: '10px' }}>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#10B981] mb-0.5">Ready to Step Up</p>
                                    <p className="text-xs text-[#10B981]/70">Actively seeking leadership opportunities</p>
                                  </div>
                                </div>
                              )}
                              
                              {candidate.retrained && (
                                <div className="flex items-start gap-2 p-3 bg-[#FEF3C7] border border-[#F59E0B]/20" style={{ borderRadius: '10px' }}>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#F59E0B] mb-0.5">Recently Retrained</p>
                                    <p className="text-xs text-[#F59E0B]/70">Recently completed reskilling or upskilling</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Total Experience Breakdown */}
                        {exp > 0 && (
                          <div className="pt-4 border-t border-black/[0.06]">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#6B7280]">Total Work Experience</span>
                              <span className="text-sm font-semibold text-[#111827]">{exp} {exp === 1 ? 'year' : 'years'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Top dimensions (same six core axes as profile builder radar) */}
                {traitClusterBars.length > 0 && (
                  <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <h2 className="text-base text-[#111827] font-semibold mb-5">Strongest profile dimensions</h2>
                    <div className="grid grid-cols-2 gap-6">
                      {traitClusterBars.map((cluster) => (
                        <div key={cluster.name}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[#111827] font-medium">{cluster.name}</span>
                            <span className="text-sm font-semibold" style={{ color: cluster.color }}>{cluster.value}%</span>
                          </div>
                          <div className="w-full h-2 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
                            <div
                              className="h-full transition-all duration-500"
                              style={{ width: `${cluster.value}%`, backgroundColor: cluster.color, borderRadius: '4px' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dimension Breakdown — Spec 1 / candidate_profiles columns */}
                {profileDims && (
                  <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center gap-2 mb-5">
                      <Zap className="w-5 h-5 text-[#8B5CF6]" strokeWidth={2} />
                      <h2 className="text-base text-[#111827] font-semibold">Dimension breakdown</h2>
                      <span className="ml-auto text-xs text-[#9CA3AF]">vs. mock role target (0–100)</span>
                    </div>
                    <div className="space-y-3">
                      {TRAIT_DIMENSION_KEYS.map((key) => {
                        const score = Math.round(profileDims[key]);
                        const target = MOCK_ROLE_TARGET_BY_KEY[key];
                        const gap = score - target;
                        const hasDivergence = Math.abs(gap) > 15;
                        const scoreColor = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#9CA3AF';
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm text-[#111827]">{TRAIT_LABELS[key]}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-[#9CA3AF]">Target: {target}</span>
                                <span className="text-sm font-semibold" style={{ color: scoreColor }}>{score}</span>
                                {hasDivergence && (
                                  <span className={`text-xs font-medium px-1.5 py-0.5 ${gap > 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`} style={{ borderRadius: '4px' }}>
                                    {gap > 0 ? '+' : ''}{gap}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="relative w-full h-2 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
                              <div className="absolute top-0 h-full w-0.5 bg-[#111827]/20 z-10" style={{ left: `${target}%` }} />
                              <div className="h-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: scoreColor, borderRadius: '4px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-4">Divergence flag (±) when the gap to the mock target exceeds 15 points.</p>
                  </div>
                )}

                {/* Motivational sub-dimensions (intake section 6 — same keys as profile builder) */}
                <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="flex items-center gap-2 mb-5">
                    <Heart className="w-5 h-5 text-[#F59E0B]" strokeWidth={2} />
                    <h2 className="text-base text-[#111827] font-semibold">Motivational profile</h2>
                  </div>
                  {profileDims ? (
                    (() => {
                      const motivations = [...MOTIVATIONAL_FIT_SUB_KEYS.map((k) => ({
                        label: MOTIVATIONAL_FIT_SUB_LABELS[k],
                        score: Math.round(profileDims[k]),
                      }))].sort((a, b) => b.score - a.score).map((m, i) => ({
                        ...m,
                        rank: i + 1,
                        roleExpected: i < 2,
                      }));
                      return (
                        <div className="space-y-3">
                          {motivations.map((m) => (
                            <div key={m.label} className="flex flex-wrap items-center gap-3 p-3 bg-[#F9F9FA]" style={{ borderRadius: '10px' }}>
                              <span className="w-5 h-5 rounded-full bg-white border border-black/[0.08] text-xs text-[#6B7280] flex items-center justify-center font-medium shrink-0">{m.rank}</span>
                              <span className="text-sm text-[#111827] font-medium flex-1 min-w-[8rem]">{m.label}</span>
                              <div className="w-24 h-1.5 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
                                <div className="h-full bg-[#F59E0B]" style={{ width: `${m.score}%`, borderRadius: '4px' }} />
                              </div>
                              <span className="text-xs text-[#9CA3AF] w-8 text-right">{m.score}</span>
                              {m.roleExpected && (
                                <span className="text-xs px-1.5 py-0.5 bg-[#10B981]/10 text-[#10B981] font-medium" style={{ borderRadius: '4px' }}>Top driver</span>
                              )}
                            </div>
                          ))}
                          <p className="text-xs text-[#9CA3AF] pt-1">Ranked by score from the applicant profile builder (Section 6).</p>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-sm text-[#6B7280]">No motivational dimension data on this profile.</p>
                  )}
                </div>

                {/* Strengths and Growth Areas — derived from core six ordering */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-[#34D399]" strokeWidth={2} />
                      <h3 className="text-base text-[#111827] font-semibold">Core strengths</h3>
                    </div>
                    <div className="space-y-3">
                      {statedStrengths.length > 0 ? (
                        statedStrengths.map((strength, idx) => (
                          <div key={idx} className="p-3 bg-[#34D399]/5 border border-[#34D399]/10" style={{ borderRadius: '10px' }}>
                            <p className="text-sm text-[#111827] font-medium">{strength}</p>
                          </div>
                        ))
                      ) : derivedStrengths.length > 0 ? (
                        derivedStrengths.map((strength, idx) => (
                          <div key={idx} className="p-3 bg-[#34D399]/5 border border-[#34D399]/10" style={{ borderRadius: '10px' }}>
                            <p className="text-sm text-[#111827] font-medium mb-1">{strength.label}</p>
                            <p className="text-xs text-[#6B7280]">{strength.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#6B7280]">Trait scores will appear here after intake.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-[#3B82F6]" strokeWidth={2} />
                      <h3 className="text-base text-[#111827] font-semibold">Growth areas</h3>
                    </div>
                    <div className="space-y-3">
                      {derivedGrowth.length > 0 ? (
                        derivedGrowth.map((area, idx) => (
                          <div key={idx} className="p-3 bg-[#3B82F6]/5 border border-[#3B82F6]/10" style={{ borderRadius: '10px' }}>
                            <p className="text-sm text-[#111827] font-medium mb-1">{area.label}</p>
                            <p className="text-xs text-[#6B7280]">{area.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#6B7280]">Trait scores will appear here after intake.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Traits Section */}
            {activeSection === 'traits' && (
              <div className="space-y-6">
                <h2 className="text-lg text-[#111827] font-semibold">Signature traits</h2>
                <p className="text-sm text-[#6B7280]">
                  Top dimensions from the same Spec 1 model as the applicant profile builder (signature = highest core scores).
                </p>
                <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                  <h3 className="text-sm text-[#111827] font-semibold mb-4">Top dimensions</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileDims && coreSorted.length > 0
                      ? coreSorted.slice(0, 3).map((row) => (
                          <div
                            key={row.key}
                            className="group relative px-4 py-2.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-sm font-medium hover:bg-[#7DBBFF]/20 transition-all cursor-pointer"
                            style={{ borderRadius: '10px' }}
                          >
                            <div className="flex items-center gap-2">
                              <span>{TRAIT_LABELS[row.key]}</span>
                              <span className="text-xs font-semibold text-[#111827]/70">{Math.round(row.score)}</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#111827] text-white text-xs max-w-[240px] text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ borderRadius: '8px' }}>
                              From intake-derived dimension scores
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#111827] transform rotate-45" />
                            </div>
                          </div>
                        ))
                      : candidate.traits.slice(0, 3).map((trait) => (
                          <div
                            key={trait}
                            className="px-4 py-2.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-sm font-medium"
                            style={{ borderRadius: '10px' }}
                          >
                            {trait}
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg text-[#111827] font-semibold">Experience & background</h2>
                </div>

                {candidate.educationSummary?.trim() ? (
                  <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <h3 className="text-sm text-[#111827] font-semibold mb-3">Education</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-wrap">{candidate.educationSummary}</p>
                  </div>
                ) : null}

                {candidate.experienceNarrative?.trim() ? (
                  <div className="relative bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-[#7DBBFF]/10">
                        <Building2 className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-base text-[#111827] font-semibold mb-1">{candidate.role}</h3>
                            {candidate.currentCompany ? (
                              <p className="text-sm text-[#6B7280] mb-2">{candidate.currentCompany}</p>
                            ) : null}
                            {candidate.totalExperience ? (
                              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                                <span>{candidate.totalExperience} years total experience</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-wrap">{candidate.experienceNarrative}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-white border border-black/[0.08] text-center" style={{ borderRadius: '16px' }}>
                    <p className="text-sm text-[#9CA3AF] italic">No work history narrative shared yet.</p>
                  </div>
                )}

                {candidate.certifications?.trim() ? (
                  <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <h3 className="text-sm text-[#111827] font-semibold mb-3">Certifications</h3>
                    <p className="text-sm text-[#6B7280] whitespace-pre-wrap">{candidate.certifications}</p>
                  </div>
                ) : null}

                {candidate.testimonialText?.trim() ? (
                  <div className="bg-[#F9F9FA] p-6 border border-black/[0.08]" style={{ borderRadius: '16px' }}>
                    <p className="text-sm text-[#6B7280] italic leading-relaxed mb-3">&ldquo;{candidate.testimonialText}&rdquo;</p>
                    <p className="text-xs text-[#9CA3AF]">
                      — {candidate.testimonialName || 'Reference'}
                      {candidate.testimonialRelation ? `, ${candidate.testimonialRelation}` : ''}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Assessments Section */}
            {activeSection === 'assessments' && (
              <div className="space-y-6">
                <h2 className="text-lg text-[#111827] font-semibold">Assessment Results</h2>

                <div className="grid grid-cols-3 gap-4">
                  {assessmentResults.map((assessment, idx) => (
                    <div key={idx} className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                      <div className="flex items-center justify-between mb-3">
                        <Award className="w-5 h-5 text-[#7DBBFF]" strokeWidth={2} />
                        <span className="px-2 py-1 bg-[#34D399]/10 text-[#34D399] text-xs font-semibold" style={{ borderRadius: '6px' }}>
                          {assessment.percentile}
                        </span>
                      </div>
                      <h3 className="text-sm text-[#111827] font-semibold mb-1">{assessment.title}</h3>
                      <p className="text-3xl text-[#7DBBFF] font-semibold mb-2">{assessment.score}</p>
                      <p className="text-xs text-[#6B7280]">{assessment.description}</p>

                      {/* Progress Bar */}
                      <div className="mt-4 w-full h-2 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
                        <div
                          className="h-full bg-[#7DBBFF]"
                          style={{ width: `${assessment.score}%`, borderRadius: '4px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights Section */}
            {activeSection === 'insights' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg text-[#111827] font-semibold">Preferences & context</h2>
                  <span className="text-xs text-[#9CA3AF]">From applicant profile builder</span>
                </div>

                {insightBlocks.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6">
                    {insightBlocks.map((insight, idx) => {
                      const Icon = insight.icon;
                      return (
                        <div key={idx} className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${insight.color}20` }}>
                              <Icon className="w-4 h-4" style={{ color: insight.color }} strokeWidth={2} />
                            </div>
                            <h3 className="text-sm text-[#111827] font-semibold">{insight.title}</h3>
                          </div>
                          <ul className="space-y-2">
                            {insight.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: insight.color }} />
                                <span className="text-sm text-[#6B7280]">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-white border border-black/[0.08] text-center" style={{ borderRadius: '16px' }}>
                    <p className="text-sm text-[#9CA3AF] italic">No preference or context details shared yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Documents Section */}
            {activeSection === 'documents' && (
              <div className="space-y-6">
                <h2 className="text-lg text-[#111827] font-semibold">Links & documents</h2>

                <div className="grid grid-cols-2 gap-4">
                  {linkedInHref ? (
                    <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#0077B5]/10 flex items-center justify-center shrink-0">
                          <Linkedin className="w-6 h-6 text-[#0077B5]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm text-[#111827] font-semibold mb-1">LinkedIn</h3>
                          <a href={linkedInHref} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7DBBFF] hover:text-[#6aabef] font-medium flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" strokeWidth={2} />
                            <span>Open profile</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {candidate.certifications?.trim() ? (
                    <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                          <Award className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm text-[#111827] font-semibold mb-1">Certifications</h3>
                          <p className="text-xs text-[#6B7280] whitespace-pre-wrap">{candidate.certifications}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {!linkedInHref && !candidate.certifications?.trim() ? (
                  <div className="p-8 bg-white border border-black/[0.08] text-center" style={{ borderRadius: '16px' }}>
                    <p className="text-sm text-[#9CA3AF] italic">No documents or external links uploaded yet.</p>
                    <p className="text-xs text-[#9CA3AF] mt-2">CV upload is planned for a future release.</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-black/[0.08] px-8 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onAddNote(candidate.id)}
                className="px-5 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 transition-all text-sm font-medium flex items-center gap-2"
                style={{ borderRadius: '10px' }}
              >
                <MessageSquare className="w-4 h-4" strokeWidth={2} />
                <span>Add Note</span>
              </button>
              <button className="px-5 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 transition-all text-sm font-medium flex items-center gap-2" style={{ borderRadius: '10px' }}>
                <Share2 className="w-4 h-4" strokeWidth={2} />
                <span>Share Profile</span>
              </button>
              <button className="px-5 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 transition-all text-sm font-medium flex items-center gap-2" style={{ borderRadius: '10px' }}>
                <Download className="w-4 h-4" strokeWidth={2} />
                <span>Download Summary</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onMoveToStage) onMoveToStage(candidate.id, 'rejected');
                  onClose();
                }}
                className="px-5 py-2.5 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/5 transition-all text-sm font-medium flex items-center gap-2"
                style={{ borderRadius: '10px' }}
              >
                <X className="w-4 h-4" strokeWidth={2} />
                <span>Reject</span>
              </button>
              <button
                onClick={() => {
                  onMoveToNextStage(candidate.id);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#7DBBFF] text-white hover:bg-[#6aabef] hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                style={{ borderRadius: '10px' }}
              >
                <span>Move to Interview</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}