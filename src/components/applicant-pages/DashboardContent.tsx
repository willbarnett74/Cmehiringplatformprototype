import { useState, useEffect, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  User,
  ArrowRight,
  Target,
  Brain,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  Award,
  ShieldCheck,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Building2,
  Zap,
  MessageSquare,
  Users,
  Flame,
  Eye,
  X,
  ClipboardList,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { ensureApplicantProfile } from '../../lib/applicantPersistence';
import type { DimensionScores } from '../../utils/intakeScoring';

export interface DashboardSection1Narratives {
  backgroundNarrative?: string;
  proudMoment?: string;
}

interface DashboardContentProps {
  onProfileBuilderClick: (stepId?: number) => void;
  traitScores: DimensionScores | null;
  intakeComplete: boolean;
  section1: DashboardSection1Narratives | null;
}

function signalBand(score: number): { signal: string; signalColor: string; level: number } {
  if (score >= 75) return { signal: 'Strong', signalColor: '#10B981', level: 4 };
  if (score >= 50) return { signal: 'Moderate', signalColor: '#7dbbff', level: 3 };
  if (score >= 25) return { signal: 'Emerging', signalColor: '#F59E0B', level: 2 };
  return { signal: 'Early', signalColor: '#EF4444', level: 1 };
}

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const v = values.reduce((s, x) => s + (x - mean) ** 2, 0) / values.length;
  return Math.sqrt(v);
}

function consistencyScoreFromTraits(scores: DimensionScores): number {
  const vals = [
    scores.learning_velocity,
    scores.ownership_follow_through,
    scores.resilience,
    scores.communication_confidence,
    scores.relational_intelligence,
    scores.motivational_fit_mastery,
    scores.motivational_fit_impact,
    scores.motivational_fit_recognition,
    scores.motivational_fit_autonomy,
  ];
  const spread = stdDev(vals);
  const raw = Math.round(100 - spread * 1.1);
  return Math.max(35, Math.min(100, raw));
}

function dimensionStatus(score: number): { status: string; color: string } {
  if (score >= 66) return { status: 'Aligned', color: '#10B981' };
  if (score >= 40) return { status: 'Mixed', color: '#F59E0B' };
  return { status: 'Lower signal', color: '#6B7280' };
}

const INSIGHT_TRAIT_DEFS: Array<{
  key: keyof DimensionScores;
  trait: string;
  descriptor: string;
  icon: LucideIcon;
}> = [
  { key: 'ownership_follow_through', trait: 'Ownership & Drive', descriptor: 'Initiative and follow-through', icon: Target },
  { key: 'learning_velocity', trait: 'Learning & Structure', descriptor: 'Pace and problem framing', icon: Brain },
  { key: 'communication_confidence', trait: 'Communication', descriptor: 'Clarity and intent', icon: MessageSquare },
  { key: 'resilience', trait: 'Resilience', descriptor: 'Steadiness under pressure', icon: Flame },
  { key: 'relational_intelligence', trait: 'Collaboration', descriptor: 'Working with others', icon: Users },
  { key: 'motivational_fit_mastery', trait: 'Drive for Mastery', descriptor: 'Craft and depth', icon: Zap },
];

const STRENGTH_LABELS: Record<string, string> = {
  learning_velocity: 'Learning velocity',
  ownership_follow_through: 'Ownership',
  resilience: 'Resilience',
  communication_confidence: 'Communication',
  relational_intelligence: 'Collaboration',
  motivational_fit_mastery: 'Mastery drive',
  motivational_fit_impact: 'Impact drive',
  motivational_fit_recognition: 'Recognition',
  motivational_fit_autonomy: 'Autonomy',
};

export function DashboardContent({
  onProfileBuilderClick,
  traitScores,
  intakeComplete,
  section1,
}: DashboardContentProps) {
  const [name, setName] = useState('Alex Rivera');
  const [location, setLocation] = useState('San Francisco, CA');
  const [experienceYears, setExperienceYears] = useState('6 years');
  const [education, setEducation] = useState('B.A. Interaction Design');
  const [availability, setAvailability] = useState('Open to offers');
  const [summary, setSummary] = useState(
    'Experienced product designer specializing in early-stage startups with a focus on taking messy, ambiguous problems and building clean, scalable solutions. Thrives in environments that balance experimentation with clear accountability.',
  );
  const [currentSituation, setCurrentSituation] = useState<string | null>(null);
  const [careerFocus, setCareerFocus] = useState<string | null>(null);
  const [showIntakeNudge, setShowIntakeNudge] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.id) return;

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profileRow?.full_name) setName(profileRow.full_name as string);

      const profileId = await ensureApplicantProfile(supabase, session.user.id);
      if (!profileId) return;

      const { data } = await supabase
        .from('candidate_profiles')
        .select(
          'location,experience_years,education_summary,availability,experience_narrative,intake_status,current_situation,preferred_role_types',
        )
        .eq('id', profileId)
        .maybeSingle();

      if (data) {
        if (data.location) setLocation(data.location as string);
        if (data.experience_years != null) setExperienceYears(`${data.experience_years} years`);
        if (data.education_summary) setEducation(data.education_summary as string);
        if (data.availability) setAvailability(data.availability as string);
        if (data.experience_narrative) setSummary(data.experience_narrative as string);
        if (data.current_situation) setCurrentSituation(data.current_situation as string);
        const pr = data.preferred_role_types as string[] | null;
        if (pr && pr.length > 0) setCareerFocus(pr.slice(0, 3).join(', '));
        const complete = data.intake_status === 'complete';
        if (!complete && !sessionStorage.getItem('cme_intake_nudge_dismissed')) {
          setShowIntakeNudge(true);
        }
      }
    });
  }, []);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dismissNudge = () => {
    sessionStorage.setItem('cme_intake_nudge_dismissed', '1');
    setShowIntakeNudge(false);
  };

  const backgroundNarrative = section1?.backgroundNarrative?.trim() || summary;
  const proudMoment = section1?.proudMoment?.trim() || '';

  const narrativeInsightCards = useMemo(() => {
    if (!traitScores) return null;
    return INSIGHT_TRAIT_DEFS.map((def) => {
      const score = traitScores[def.key];
      const band = signalBand(score);
      return {
        trait: def.trait,
        descriptor: def.descriptor,
        icon: def.icon,
        key: def.key,
        ...band,
        score,
        blurb: `Your structured assessment scores this area around ${Math.round(score)}/100 — a ${band.signal.toLowerCase()} signal compared to your other dimensions.`,
      };
    });
  }, [traitScores]);

  const topStrengths = useMemo(() => {
    if (!traitScores) return [];
    return (Object.entries(traitScores) as [keyof DimensionScores, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => STRENGTH_LABELS[k] ?? k);
  }, [traitScores]);

  const workContextRows = useMemo(() => {
    if (!traitScores) return [];
    const aut = traitScores.motivational_fit_autonomy;
    const rel = traitScores.relational_intelligence;
    const pace = traitScores.learning_velocity;
    const impact = traitScores.motivational_fit_impact;
    const toLevel = (s: number) => Math.max(1, Math.min(5, Math.round(s / 20)));
    return [
      { label: 'Autonomy preference', level: toLevel(aut) },
      { label: 'Collaboration energy', level: toLevel(rel) },
      { label: 'Learning / pace', level: toLevel(pace) },
      { label: 'Impact orientation', level: toLevel(impact) },
    ];
  }, [traitScores]);

  const consistencyOverall = traitScores ? consistencyScoreFromTraits(traitScores) : null;
  const consistencyLabel =
    consistencyOverall != null && consistencyOverall >= 70
      ? 'Strong alignment'
      : consistencyOverall != null && consistencyOverall >= 50
        ? 'Moderate alignment'
        : 'Developing alignment';

  const signalBreakdown = useMemo(() => {
    if (!traitScores) return [];
    return [
      { label: 'Ownership & follow-through', ...dimensionStatus(traitScores.ownership_follow_through) },
      { label: 'Learning velocity', ...dimensionStatus(traitScores.learning_velocity) },
      { label: 'Communication', ...dimensionStatus(traitScores.communication_confidence) },
      { label: 'Collaboration', ...dimensionStatus(traitScores.relational_intelligence) },
      { label: 'Resilience', ...dimensionStatus(traitScores.resilience) },
    ];
  }, [traitScores]);

  const observations = useMemo(() => {
    if (!traitScores) return [];
    const out: Array<{ type: 'ok' | 'warn'; text: string }> = [];
    const own = traitScores.ownership_follow_through;
    const rel = traitScores.relational_intelligence;
    if (own >= 66 && rel >= 66) {
      out.push({ type: 'ok', text: 'Ownership and collaboration signals are both strong in your assessment profile.' });
    } else if (own - rel >= 25) {
      out.push({
        type: 'warn',
        text: 'You show higher ownership than collaboration preference — you may prefer driving work individually.',
      });
    } else if (rel - own >= 25) {
      out.push({
        type: 'ok',
        text: 'Collaboration-oriented profile with solid relational signals relative to ownership emphasis.',
      });
    }
    const mast = traitScores.motivational_fit_mastery;
    const rec = traitScores.motivational_fit_recognition;
    if (Math.abs(mast - rec) >= 30) {
      out.push({
        type: 'warn',
        text:
          mast > rec
            ? 'Motivation skews toward mastery and craft over external recognition.'
            : 'Motivation skews toward recognition and visibility alongside your other drivers.',
      });
    } else {
      out.push({ type: 'ok', text: 'Motivational sub-dimensions are relatively balanced across mastery and recognition.' });
    }
    return out.slice(0, 3);
  }, [traitScores]);

  const achievementBullets = useMemo(() => {
    if (!traitScores) {
      return [
        { title: 'Complete your intake', body: 'Trait signals appear after Sections 2–6.' },
        { title: 'Add your proud moment', body: 'Section 1 captures the story we highlight here.' },
      ];
    }
    const top = (Object.entries(traitScores) as [keyof DimensionScores, number][]).sort((a, b) => b[1] - a[1]);
    const first = STRENGTH_LABELS[top[0][0]] ?? 'Top dimension';
    const second = STRENGTH_LABELS[top[1][0]] ?? 'Second dimension';
    return [
      {
        title: `${first} stands out`,
        body: 'This dimension scored highest in your structured assessment — it is a recurring theme in how you work.',
      },
      {
        title: `${second} also features strongly`,
        body: 'Together, these paint a picture of where you are likely to add the most value.',
      },
      {
        title: 'Context from your story',
        body: proudMoment
          ? 'Your written proud moment adds qualitative detail on how you approach challenges.'
          : 'Complete Section 1 to add your proudest professional moment for richer context.',
      },
    ];
  }, [traitScores, proudMoment]);

  const behavioralTags = useMemo(() => {
    if (!traitScores) return [];
    const tags: string[] = [];
    if (traitScores.ownership_follow_through >= 66) tags.push('High ownership');
    if (traitScores.learning_velocity >= 66) tags.push('Fast learner');
    if (traitScores.communication_confidence >= 66) tags.push('Clear communicator');
    if (traitScores.relational_intelligence >= 66) tags.push('People-aware');
    if (traitScores.motivational_fit_impact >= 66) tags.push('Impact-led');
    return tags.slice(0, 5);
  }, [traitScores]);

  return (
    <>
      {showIntakeNudge && !intakeComplete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-[420px] p-8 shadow-xl" style={{ borderRadius: '20px' }}>
            <div className="w-12 h-12 bg-[#7dbbff]/10 flex items-center justify-center mb-6" style={{ borderRadius: '14px' }}>
              <ClipboardList className="w-6 h-6 text-[#7dbbff]" strokeWidth={2} />
            </div>

            <h3 className="text-xl text-[#111827] font-semibold mb-2 tracking-tight">Complete your trait profile</h3>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              8 short sections — takes about 15 minutes. Once done, employers can find and match you based on how you
              actually work, not just your CV.
            </p>

            <div className="space-y-2 mb-8">
              {[
                'How you work and what drives you',
                'How you think and handle difficulty',
                'How you relate to others',
                'Your career direction and goals',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7dbbff] shrink-0" />
                  <span className="text-sm text-[#374151]">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                dismissNudge();
                onProfileBuilderClick(1);
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors font-medium text-sm mb-3"
              style={{ borderRadius: '12px' }}
            >
              <span>Start now</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>

            <button
              onClick={dismissNudge}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
              Maybe later
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between">
          {intakeComplete ? (
            <>
              <div>
                <h3 className="text-base text-[#111827] font-semibold mb-2">Your Profile is Ready</h3>
                <p className="text-sm text-[#6B7280]">Your trait scores have been computed — explore your results below</p>
              </div>
              <button
                onClick={() => onProfileBuilderClick()}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] text-white hover:bg-[#0ea572] transition-colors"
                style={{ borderRadius: '10px' }}
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">View Profile</span>
              </button>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-base text-[#111827] font-semibold mb-2">Complete Your Intake</h3>
                <p className="text-sm text-[#6B7280]">Answer 8 short sections to build your trait profile and get matched</p>
              </div>
              <button
                onClick={() => onProfileBuilderClick(1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors"
                style={{ borderRadius: '10px' }}
              >
                <span className="text-sm font-medium">Start Intake</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
          <h3 className="text-base text-[#111827] font-semibold">General Overview</h3>
        </div>

        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#7dbbff] flex items-center justify-center mb-3">
              <span className="text-white text-xl font-semibold">{initials}</span>
            </div>
            <p className="text-sm text-[#111827] font-semibold">{name}</p>
            <p className="text-xs text-[#6B7280] text-center max-w-[140px]">
              {currentSituation || 'Role / situation not set'}
            </p>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Location</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{location}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Experience</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{experienceYears}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Education</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{education}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Current situation</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{currentSituation || '—'}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Availability</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{availability}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Career focus</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{careerFocus || '—'}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-black/[0.08]">
          <p className="text-xs text-[#6B7280] mb-2">Background summary</p>
          <p className="text-sm text-[#111827] leading-relaxed">{summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm col-span-2" style={{ borderRadius: '20px' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
              <h3 className="text-base text-[#111827] font-semibold">Narrative Insights</h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7dbbff]/8" style={{ borderRadius: '8px' }}>
              <Eye className="w-3.5 h-3.5 text-[#7dbbff]" strokeWidth={2} />
              <span className="text-xs text-[#7dbbff] font-medium">From assessment</span>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-6">
            Trait signals from your structured intake (Sections 2–6). Section 1 narratives are summarised below — they are
            not separately scored.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {narrativeInsightCards ? (
              narrativeInsightCards.map((item) => {
                const TraitIcon = item.icon;
                return (
                <div
                  key={item.trait}
                  className="p-4 bg-[#F9FAFB] border border-black/[0.05] relative overflow-hidden"
                  style={{ borderRadius: '14px' }}
                >
                  <div className="absolute top-0 left-0 h-1 w-full bg-[#F3F4F6]">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(item.level / 5) * 100}%`,
                        backgroundColor: item.signalColor,
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  </div>
                  <div className="flex items-start justify-between mt-1 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${item.signalColor}15` }}
                      >
                        <TraitIcon className="w-4 h-4" style={{ color: item.signalColor }} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm text-[#111827] font-medium">{item.trait}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{item.descriptor}</p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 mt-1"
                      style={{ color: item.signalColor, backgroundColor: `${item.signalColor}12`, borderRadius: '6px' }}
                    >
                      {item.signal}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{item.blurb}</p>
                </div>
              );
              })
            ) : (
              <div className="col-span-3 p-6 bg-[#F9FAFB] border border-black/[0.06] text-sm text-[#6B7280]" style={{ borderRadius: '12px' }}>
                Complete the intake to see trait-based narrative signals here.
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-[#7dbbff]/[0.06] to-[#7dbbff]/[0.02] border border-[#7dbbff]/10 p-5 mb-6" style={{ borderRadius: '14px' }}>
            <p className="text-xs text-[#7dbbff] font-medium mb-2 uppercase tracking-wide">How you describe yourself</p>
            <p className="text-sm text-[#111827] leading-relaxed">
              {backgroundNarrative ||
                'Your Section 1 background narrative will appear here after you complete Profile Builder — Section 1.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-[#6B7280] mb-3">Strongest dimensions (from scores)</p>
              <div className="flex flex-wrap gap-2">
                {topStrengths.length > 0 ? (
                  topStrengths.map((strength) => (
                    <span
                      key={strength}
                      className="px-3 py-1.5 bg-[#7dbbff]/10 text-[#7dbbff] text-xs font-medium"
                      style={{ borderRadius: '10px' }}
                    >
                      {strength}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#9CA3AF]">—</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-[#6B7280] mb-3">Work-style emphasis (from motivation &amp; collaboration scores)</p>
              {workContextRows.length > 0 ? (
                <div className="space-y-2">
                  {workContextRows.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-[#111827]">{item.label}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-5 h-1.5 ${i <= item.level ? 'bg-[#7dbbff]' : 'bg-[#E5E7EB]'}`}
                            style={{ borderRadius: '2px' }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-[#9CA3AF]">Complete intake to see work-style emphasis.</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-black/[0.08] shadow-sm col-span-2" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
            <h3 className="text-base text-[#111827] font-semibold">Achievement Spotlight</h3>
          </div>
          <p className="text-xs text-[#6B7280] mb-4">From Section 1 — your proudest professional moment</p>

          <div className="bg-[#F9FAFB] border border-black/[0.06] p-4 mb-5" style={{ borderRadius: '12px' }}>
            {proudMoment ? (
              <p className="text-sm text-[#111827] leading-relaxed italic">&ldquo;{proudMoment}&rdquo;</p>
            ) : (
              <p className="text-sm text-[#6B7280] leading-relaxed">
                You have not added a proud moment yet. Open Profile Builder → Section 1 to capture the story you want
                employers to see here.
              </p>
            )}
          </div>

          <div className="mb-5">
            <p className="text-xs text-[#6B7280] mb-3">What your scores suggest</p>
            <div className="space-y-2.5">
              {achievementBullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      i === 0 ? 'bg-[#10B981]/10' : i === 1 ? 'bg-[#7dbbff]/10' : 'bg-[#F59E0B]/10'
                    }`}
                  >
                    {i === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
                    ) : i === 1 ? (
                      <BarChart3 className="w-4 h-4 text-[#7dbbff]" strokeWidth={2} />
                    ) : (
                      <Brain className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#111827] font-medium">{b.title}</p>
                    <p className="text-xs text-[#6B7280]">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-black/[0.08]">
            <p className="text-xs text-[#6B7280] mb-2.5">Behavioral tags (from top dimensions)</p>
            <div className="flex flex-wrap gap-2">
              {behavioralTags.length > 0 ? (
                behavioralTags.map((tag, i) => {
                  const palette = ['#10B981', '#7dbbff', '#F59E0B', '#8B5CF6', '#6366F1'];
                  const c = palette[i % palette.length];
                  return (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-xs font-medium"
                      style={{ borderRadius: '10px', color: c, backgroundColor: `${c}15` }}
                    >
                      {tag}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-[#9CA3AF]">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
            <h3 className="text-base text-[#111827] font-semibold">Consistency &amp; Signal Quality</h3>
          </div>
          {traitScores && consistencyOverall != null && (
            <div
              className="flex items-center gap-2 px-3 py-1.5"
              style={{
                borderRadius: '8px',
                backgroundColor: consistencyOverall >= 70 ? '#10B98115' : consistencyOverall >= 50 ? '#F59E0B15' : '#F3F4F6',
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: consistencyOverall >= 70 ? '#10B981' : consistencyOverall >= 50 ? '#F59E0B' : '#6B7280',
                }}
              />
              <span
                className="text-xs font-medium"
                style={{
                  color: consistencyOverall >= 70 ? '#10B981' : consistencyOverall >= 50 ? '#F59E0B' : '#6B7280',
                }}
              >
                {consistencyLabel}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-[#6B7280] mb-5">
          Spread across your nine dimension scores (lower spread = more even profile). This is a heuristic — not a stored
          LLM consistency grade.
        </p>

        <div className="grid grid-cols-3 gap-5">
          <div className="p-4 bg-[#F9F9FA] border border-black/[0.06]" style={{ borderRadius: '14px' }}>
            <p className="text-xs text-[#6B7280] mb-3">Score spread index</p>
            {consistencyOverall != null ? (
              <>
                <div className="flex items-end gap-2 mb-3">
                  <p className="text-3xl text-[#111827] font-semibold">{consistencyOverall}</p>
                  <p className="text-sm text-[#6B7280] mb-1">/100</p>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${consistencyOverall}%` }} />
                </div>
                <p className="text-xs text-[#6B7280]">
                  Higher means your dimension scores are closer together (fewer extreme outliers).
                </p>
              </>
            ) : (
              <p className="text-sm text-[#6B7280]">Complete intake to see a spread-based consistency index.</p>
            )}
          </div>

          <div className="p-4 bg-[#F9F9FA] border border-black/[0.06]" style={{ borderRadius: '14px' }}>
            <p className="text-xs text-[#6B7280] mb-3">Dimension alignment</p>
            <div className="space-y-3">
              {traitScores ? (
                signalBreakdown.map((signal) => (
                  <div key={signal.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#111827]">{signal.label}</span>
                    <span className="text-xs font-medium" style={{ color: signal.color }}>
                      {signal.status}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-[#9CA3AF]">—</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-[#F9F9FA] border border-black/[0.06]" style={{ borderRadius: '14px' }}>
            <p className="text-xs text-[#6B7280] mb-3">Observations</p>
            <div className="space-y-3">
              {observations.length > 0 ? (
                observations.map((o, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {o.type === 'ok' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" strokeWidth={2} />
                    )}
                    <p className="text-xs text-[#111827] leading-relaxed">{o.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B7280]">Complete intake for automated observations from your score pattern.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
