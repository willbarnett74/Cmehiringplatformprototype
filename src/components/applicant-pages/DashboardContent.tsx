import { useState, useEffect, useMemo } from 'react';
import { Pencil, Check, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { ensureApplicantProfile } from '../../lib/applicantPersistence';
import type { DimensionScores } from '../../utils/intakeScoring';
import type { CandidateActivityEventType } from '../../types/supabase';
import { fetchApplicantOpportunities } from '../../lib/applicantEngagements';
import {
  applicantLifecycleConfig,
  applicantOpportunitiesMockData,
  fitLabelAndColor,
  type ApplicantOpportunity,
} from '../../lib/applicantOpportunitiesMock';
import { formatTimeAgo } from '../../lib/notificationService';

export interface DashboardSection1Narratives {
  backgroundNarrative?: string;
  proudMoment?: string;
}

export interface DashboardContentProps {
  userId: string | null;
  applicantProfileId: string | null;
  initialName?: string;
  initialCurrentSituation?: string;
  onProfileBuilderClick: (stepId?: number) => void;
  onEditProfile: () => void;
  onViewAllOpportunities: (opportunityId?: string) => void;
  traitScores: DimensionScores | null;
  intakeComplete: boolean;
  section1: DashboardSection1Narratives | null;
  /** Hydrated Section 7 from context — used when DB not yet synced or for "what you're looking for" copy */
  intakeSection7?: Record<string, unknown>;
  /** Increment after profile save so name / meta / activity refetch from Supabase */
  profileRefreshKey?: number;
}

function signalBand(score: number): { signal: string; signalColor: string } {
  if (score >= 75) return { signal: 'Strong', signalColor: '#10B981' };
  if (score >= 50) return { signal: 'Moderate', signalColor: '#7dbbff' };
  if (score >= 25) return { signal: 'Emerging', signalColor: '#F59E0B' };
  return { signal: 'Early', signalColor: '#EF4444' };
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

const TRAIT_ROWS_HANDOFF: Array<{ key: keyof DimensionScores; label: string }> = [
  { key: 'ownership_follow_through', label: 'Ownership & Drive' },
  { key: 'learning_velocity', label: 'Learning Velocity' },
  { key: 'motivational_fit_mastery', label: 'Drive for Mastery' },
  { key: 'motivational_fit_impact', label: 'Impact Drive' },
  { key: 'communication_confidence', label: 'Communication' },
  { key: 'resilience', label: 'Resilience' },
  { key: 'relational_intelligence', label: 'Collaboration' },
  { key: 'motivational_fit_autonomy', label: 'Autonomy' },
  { key: 'motivational_fit_recognition', label: 'Recognition' },
];

const STRENGTH_LABELS: Record<string, string> = {
  learning_velocity: 'Learning velocity',
  ownership_follow_through: 'Ownership & Drive',
  resilience: 'Resilience',
  communication_confidence: 'Communication',
  relational_intelligence: 'Collaboration',
  motivational_fit_mastery: 'Drive for Mastery',
  motivational_fit_impact: 'Impact drive',
  motivational_fit_recognition: 'Recognition',
  motivational_fit_autonomy: 'Autonomy',
};

function SectionRule({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3.5"
      style={{ margin: '32px 0 20px' }}
    >
      <span
        className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]"
      >
        {children}
      </span>
      <div className="h-px flex-1 bg-black/[0.08]" />
    </div>
  );
}

function activityDotColor(t: CandidateActivityEventType): string {
  if (t === 'match') return '#10B981';
  if (t === 'view') return '#7dbbff';
  return '#9CA3AF';
}

function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '—';
}

type Section7Parts = {
  lookingFor: string[] | null;
  roleTypes: string[] | null;
  workLocation: string | null;
  orgSize: string | null;
  partTime: string | null;
  growthTeaser: string | null;
};

function parseIntakeSection7(raw: Record<string, unknown> | undefined): Section7Parts | null {
  if (!raw || typeof raw !== 'object') return null;
  const q1 = raw.S7Q1 as { looking_for?: string[] } | undefined;
  const q2 = raw.S7Q2 as { growth_direction?: string } | undefined;
  const q4 = raw.S7Q4 as { role_type_preferences?: string[] } | undefined;
  const q5 = raw.S7Q5 as {
    work_location?: string;
    org_size?: string;
    part_time_openness?: string;
  } | undefined;
  const growth = q2?.growth_direction?.trim();
  const growthTeaser =
    growth && growth.length > 120 ? `${growth.slice(0, 117)}…` : growth ?? null;
  return {
    lookingFor: Array.isArray(q1?.looking_for) ? q1!.looking_for : null,
    roleTypes: Array.isArray(q4?.role_type_preferences) ? q4!.role_type_preferences : null,
    workLocation: q5?.work_location ?? null,
    orgSize: q5?.org_size ?? null,
    partTime: q5?.part_time_openness ?? null,
    growthTeaser,
  };
}

export function DashboardContent({
  userId,
  applicantProfileId,
  initialName = '',
  initialCurrentSituation = '',
  onProfileBuilderClick,
  onEditProfile,
  onViewAllOpportunities,
  traitScores,
  intakeComplete,
  section1,
  intakeSection7,
  profileRefreshKey = 0,
}: DashboardContentProps) {
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [experienceYears, setExperienceYears] = useState<string | null>(null);
  const [education, setEducation] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [currentSituation, setCurrentSituation] = useState<string | null>(initialCurrentSituation || null);
  const [preferredRolesDb, setPreferredRolesDb] = useState<string[]>([]);
  const [workTypeDb, setWorkTypeDb] = useState<string[]>([]);
  const [orgSizeDb, setOrgSizeDb] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activityRows, setActivityRows] = useState<
    Array<{ id: string; event_type: CandidateActivityEventType; body: string; created_at: string }>
  >([]);
  const [liveOpportunities, setLiveOpportunities] = useState<ApplicantOpportunity[] | undefined>(undefined);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setHasLoaded(true);
      return;
    }
    const client = supabase;
    void client.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        try {
          const uid = userId ?? session?.user?.id ?? null;
          if (!uid) return;

          const { data: profileRow } = await client
            .from('profiles')
            .select('full_name,avatar_url')
            .eq('id', uid)
            .maybeSingle();
          setName(typeof profileRow?.full_name === 'string' ? profileRow.full_name : initialName);
          setAvatarUrl(typeof profileRow?.avatar_url === 'string' ? profileRow.avatar_url : null);
          setAvatarLoadFailed(false);

          const profileId = applicantProfileId ?? await ensureApplicantProfile(client, uid);
          if (!profileId) return;

          const { data } = await client
            .from('candidate_profiles')
            .select(
              'location,experience_years,education_summary,availability,experience_narrative,intake_status,job_title,current_situation,preferred_role_types,preferred_work_type,org_size_preference',
            )
            .eq('id', profileId)
            .maybeSingle();

          if (data) {
            setLocation(typeof data.location === 'string' && data.location ? data.location : null);
            setExperienceYears(
              data.experience_years != null && data.experience_years !== ''
                ? `${data.experience_years} years`
                : null,
            );
            setEducation(
              typeof data.education_summary === 'string' && data.education_summary
                ? data.education_summary
                : null,
            );
            setAvailability(
              typeof data.availability === 'string' && data.availability ? data.availability : null,
            );
            setSummary(
              typeof data.experience_narrative === 'string' && data.experience_narrative
                ? data.experience_narrative
                : null,
            );
            setCurrentSituation(
              typeof data.job_title === 'string' && data.job_title
                ? data.job_title
                : typeof data.current_situation === 'string' && data.current_situation
                  ? data.current_situation
                  : initialCurrentSituation || null,
            );
            const pr = data.preferred_role_types as string[] | null;
            setPreferredRolesDb(Array.isArray(pr) ? pr : []);
            const pw = data.preferred_work_type as string[] | null;
            setWorkTypeDb(Array.isArray(pw) ? pw : []);
            setOrgSizeDb(
              typeof data.org_size_preference === 'string' ? data.org_size_preference : null,
            );
          }

          const { data: events, error: eventsErr } = await client
            .from('candidate_activity_events')
            .select('id,event_type,body,created_at')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(12);

          if (!eventsErr && events) {
            setActivityRows(
              events as Array<{
                id: string;
                event_type: CandidateActivityEventType;
                body: string;
                created_at: string;
              }>,
            );
          }

          if (profileId) {
            try {
              const opps = await fetchApplicantOpportunities(client, profileId);
              setLiveOpportunities(opps);
            } catch {
              setLiveOpportunities([]);
            }
          }
        } finally {
          setHasLoaded(true);
        }
      })
      .catch(() => {
        setHasLoaded(true);
      });
  }, [applicantProfileId, initialCurrentSituation, initialName, profileRefreshKey, userId]);

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const backgroundNarrative = section1?.backgroundNarrative?.trim() || (summary ?? '');
  const proudMoment = section1?.proudMoment?.trim() || '';

  const s7 = useMemo(() => parseIntakeSection7(intakeSection7), [intakeSection7]);

  const mergedRoleTypes = useMemo(() => {
    if (preferredRolesDb.length > 0) return preferredRolesDb;
    return s7?.roleTypes ?? [];
  }, [preferredRolesDb, s7]);

  const roleHeadline =
    mergedRoleTypes.length > 0 ? mergedRoleTypes.slice(0, 3).join(' · ') : null;

  const workSetupLine = useMemo(() => {
    if (workTypeDb.length > 0) return workTypeDb.filter(Boolean).join(' · ');
    const parts = [s7?.workLocation, s7?.partTime].filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : null;
  }, [workTypeDb, s7]);

  const orgSizeLine = useMemo(() => orgSizeDb ?? s7?.orgSize ?? null, [orgSizeDb, s7]);

  const lookingForLine = useMemo(() => {
    if (!s7?.lookingFor?.length) return null;
    return s7.lookingFor.join(' · ');
  }, [s7]);

  /** Compact "Available" line: welcome timing first, then work prefs from Section 7 / DB */
  const availableMetaValue = useMemo(() => {
    if (availability?.trim()) return availability.trim();
    const parts = [workSetupLine, orgSizeLine].filter(Boolean);
    if (parts.length > 0) return parts.join(' · ');
    return '';
  }, [availability, workSetupLine, orgSizeLine]);

  /** Compact "Focus" line: role types, else what you're looking for */
  const focusMetaValue = useMemo(() => {
    if (mergedRoleTypes.length > 0) return mergedRoleTypes.join(' · ');
    if (lookingForLine) return lookingForLine;
    return '';
  }, [mergedRoleTypes, lookingForLine]);

  const topStrengths = useMemo(() => {
    if (!traitScores) return [];
    return (Object.entries(traitScores) as [keyof DimensionScores, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => STRENGTH_LABELS[k] ?? k);
  }, [traitScores]);

  const topDimensionsNumbered = useMemo(() => {
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

  const achievementBullets = useMemo(() => {
    if (!traitScores) {
      return [
        { title: 'Complete your intake', body: 'Trait signals appear after Sections 2–6.' },
        { title: 'Add your proud moment', body: 'Section 1 captures the story we highlight here.' },
        { title: 'Finish your profile', body: 'Employers use these notes alongside your scores.' },
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

  const engagementPreviewList = useMemo(() => {
    if (!isSupabaseConfigured) {
      return applicantOpportunitiesMockData;
    }
    if (liveOpportunities === undefined) {
      return [];
    }
    return liveOpportunities;
  }, [liveOpportunities]);

  const newestReachOut = useMemo(() => {
    if (engagementPreviewList.length === 0) return null;
    return (
      engagementPreviewList.find((opp) => opp.unread || opp.status === 'contacted') ??
      engagementPreviewList[0]
    );
  }, [engagementPreviewList]);

  const dashboardOpportunities = useMemo(() => {
    if (!newestReachOut) return [];
    return engagementPreviewList.filter((opp) => opp.id !== newestReachOut.id).slice(0, 3);
  }, [engagementPreviewList, newestReachOut]);

  const metaFieldsRow1: Array<{ label: string; value: string }> = [
    { label: 'Location', value: location || '—' },
    { label: 'Experience', value: experienceYears || '—' },
    { label: 'Education', value: education || '—' },
    { label: 'Available', value: availableMetaValue || '—' },
  ];

  return (
    <div className="font-dashboard text-[#111827] antialiased">
      {/* Identity row */}
      <div
        className="flex flex-row items-start gap-7 border-b border-black/[0.08] pb-7"
      >
        <div
          className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#7dbbff] ${
            !hasLoaded ? 'animate-pulse' : ''
          }`}
        >
          {hasLoaded && avatarUrl && !avatarLoadFailed ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setAvatarLoadFailed(true)}
            />
          ) : null}
          {hasLoaded && (!avatarUrl || avatarLoadFailed) && initials ? (
            <span className="text-[18px] font-semibold text-white">{initials}</span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-baseline gap-3">
            <h2
              className="text-[22px] font-semibold tracking-[-0.025em] text-[#111827]"
              style={{ lineHeight: 1.3 }}
            >
              {hasLoaded ? name.trim() || '—' : '…'}
            </h2>
            {roleHeadline ? (
              <span className="text-[13px] text-[#9CA3AF]">{roleHeadline}</span>
            ) : null}
          </div>
          <p className="mb-4 text-[12.5px] text-[#6B7280]">
            {hasLoaded ? currentSituation || 'Situation not set' : '…'}
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-2.5">
            {metaFieldsRow1.map((f) => (
              <div key={f.label}>
                <p className="mb-0.5 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">{f.label}</p>
                <p className="text-[13px] font-medium text-[#111827]">{hasLoaded ? f.value : '…'}</p>
              </div>
            ))}
            <div className="w-full basis-full">
              <p className="mb-0.5 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">Focus</p>
              <p className="text-[13px] font-medium text-[#111827]">
                {hasLoaded ? focusMetaValue || '—' : '…'}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap border border-black/[0.11] bg-white px-3.5 py-1.5 transition-colors hover:bg-[#f9f9f9]"
          style={{ borderRadius: 5 }}
        >
          <Pencil className="h-[13px] w-[13px] text-[#6B7280]" strokeWidth={2} />
          <span className="text-[12px] font-medium text-[#374151]">Edit profile</span>
        </button>
      </div>

      {/* Profile status */}
      <div
        className="mb-1 mt-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
        style={{
          borderRadius: 5,
          ...(intakeComplete
            ? {
                background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.15)',
              }
            : {
                background: 'rgba(245,158,11,0.05)',
                border: '1px solid rgba(245,158,11,0.15)',
              }),
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: intakeComplete ? '#10B981' : '#F59E0B' }}
          />
          <p
            className="text-[12.5px] font-medium"
            style={{ color: intakeComplete ? '#065F46' : '#92400E' }}
          >
            {intakeComplete
              ? 'Trait profile complete — you are visible to matched employers'
              : 'Intake not yet complete — finish your profile to appear in employer searches'}
          </p>
        </div>
        {intakeComplete ? (
          <div className="flex items-center gap-1.5">
            <Check className="h-[13px] w-[13px] text-[#10B981]" strokeWidth={2.5} />
            <span className="text-[11px] font-semibold text-[#10B981]">Complete</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onProfileBuilderClick(1)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#F59E0B]"
          >
            Continue intake
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      <SectionRule>Trait Profile</SectionRule>

      <div className="grid grid-cols-1 gap-x-[52px] gap-y-2.5 lg:grid-cols-2">
        {TRAIT_ROWS_HANDOFF.map(({ key, label }) => {
          const score = traitScores ? Math.round(traitScores[key]) : 0;
          const band = traitScores ? signalBand(traitScores[key]) : { signal: '—', signalColor: '#9CA3AF' };
          const displayScore = traitScores ? score : 0;
          return (
            <div key={key} className="flex items-center gap-3">
              <span
                className="shrink-0 text-[12.5px] text-[#374151]"
                style={{ width: 158, lineHeight: 1.4 }}
              >
                {label}
              </span>
              <div className="h-0.5 min-w-0 flex-1 overflow-hidden rounded-[1px] bg-[#EBEBEB]">
                {traitScores ? (
                  <div
                    className="h-full rounded-[1px] transition-[width] duration-[600ms] ease-out"
                    style={{ width: `${displayScore}%`, background: band.signalColor }}
                  />
                ) : null}
              </div>
              <span
                className="w-6 shrink-0 text-right font-dashboard-mono text-[11px]"
                style={{ color: band.signalColor }}
              >
                {traitScores ? displayScore : '—'}
              </span>
              <span
                className="w-[54px] shrink-0 text-[10px] font-medium"
                style={{ color: band.signalColor }}
              >
                {traitScores ? band.signal : '—'}
              </span>
            </div>
          );
        })}
      </div>

      <SectionRule>Narrative</SectionRule>

      <div className="grid grid-cols-1 gap-[52px] lg:grid-cols-2">
        <div>
          <p className="mb-2.5 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">Background summary</p>
          <p className="text-[13.5px] leading-[1.7] text-[#374151]">
            {backgroundNarrative ||
              'Your background summary will appear here from your profile and Section 1 narrative.'}
          </p>
          <p className="mb-2.5 mt-5 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">Key strengths</p>
          <div className="flex flex-wrap gap-1.5">
            {topStrengths.length > 0 ? (
              topStrengths.map((tag) => (
                <span
                  key={tag}
                  className="border border-black/[0.13] px-2.5 py-1 text-[11.5px] font-medium text-[#374151]"
                  style={{ borderRadius: 3 }}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-[13.5px] text-[#9CA3AF]">Complete intake to see key strengths from scores.</span>
            )}
          </div>
        </div>
        <div>
          <p className="mb-2.5 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">
            Proudest professional moment
          </p>
          {proudMoment ? (
            <blockquote
              className="border-l-2 border-[#7dbbff] pl-4 text-[13.5px] italic leading-[1.75] text-[#111827]"
            >
              {proudMoment}
            </blockquote>
          ) : (
            <p className="text-[13.5px] leading-[1.7] text-[#6B7280]">
              Add your story in Profile Builder — Section 1.
            </p>
          )}
          <p className="mb-2.5 mt-5 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">Top dimensions</p>
          <div className="flex flex-col gap-2">
            {topDimensionsNumbered.length > 0 ? (
              topDimensionsNumbered.map((label, i) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="w-4 shrink-0 font-dashboard-mono text-[10px] text-[#C4C4CC]">{i + 1}</span>
                  <span className="text-[13px] font-medium text-[#111827]">{label}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-[#9CA3AF]">—</span>
            )}
          </div>
        </div>
      </div>

      <SectionRule>Work Style &amp; Signal Quality</SectionRule>

      <div className="grid grid-cols-1 gap-[52px] lg:grid-cols-3">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">Emphasis from scores</p>
          <div className="flex flex-col gap-3">
            {workContextRows.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12.5px] text-[#374151]">{item.label}</span>
                  <span className="font-dashboard-mono text-[10px] text-[#9CA3AF]">{item.level}/5</span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-0.5 flex-1 rounded-[1.5px]"
                      style={{
                        background: i <= item.level ? '#7dbbff' : '#E9E9EE',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">Score spread index</p>
          {consistencyOverall != null ? (
            <>
              <div className="mb-2 flex items-end gap-1">
                <span className="font-dashboard-mono text-[38px] font-semibold tracking-[-0.04em] text-[#111827]">
                  {consistencyOverall}
                </span>
                <span className="mb-1.5 font-dashboard-mono text-[13px] text-[#9CA3AF]">/100</span>
              </div>
              <div className="mb-2 h-0.5 w-full overflow-hidden rounded-[1px] bg-[#EBEBEB]">
                <div
                  className="h-full rounded-[1px] bg-[#10B981]"
                  style={{ width: `${consistencyOverall}%` }}
                />
              </div>
              <p className="text-[11.5px] font-medium text-[#10B981]">{consistencyLabel}</p>
              <p className="mt-2 text-[11.5px] leading-normal text-[#9CA3AF]">
                Higher means your dimension scores are closer together (fewer extreme outliers).
              </p>
            </>
          ) : (
            <p className="text-[13.5px] text-[#6B7280]">Complete intake to see spread index.</p>
          )}
        </div>
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]">Dimension alignment</p>
          <div>
            {traitScores ? (
              signalBreakdown.map((row, idx) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2.5"
                  style={{
                    borderTop: idx === 0 ? undefined : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <span className="text-[12.5px] text-[#374151]">{row.label}</span>
                  <span className="text-[11px] font-semibold" style={{ color: row.color }}>
                    {row.status}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-sm text-[#9CA3AF]">—</span>
            )}
          </div>
        </div>
      </div>

      <SectionRule>Achievement Notes</SectionRule>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {achievementBullets.map((b, i) => (
          <div key={i} className="flex gap-3.5">
            <span className="mt-0.5 shrink-0 font-dashboard-mono text-[11px] text-[#C4C4CC]">{i + 1}</span>
            <div>
              <p className="mb-1.5 text-[13px] font-semibold tracking-[-0.01em] text-[#111827]">{b.title}</p>
              <p className="text-[12.5px] leading-[1.6] text-[#6B7280]">{b.body}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionRule>Latest Reach-Out</SectionRule>

      {!hasLoaded && isSupabaseConfigured ? (
        <p className="text-[13px] text-[#9CA3AF]">Loading opportunities…</p>
      ) : null}

      {hasLoaded && engagementPreviewList.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-[#6B7280]">
          When employers reach out through CMe, their messages will show up here.
        </p>
      ) : null}

      {newestReachOut ? (
        <button
          type="button"
          onClick={() => onViewAllOpportunities(newestReachOut.id)}
          className="w-full border border-[#DDEBFF] bg-[#F7FBFF] p-5 text-left transition-colors hover:bg-[#F2F8FF]"
          style={{ borderRadius: 12 }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#7dbbff] text-[13px] font-bold text-white"
                style={{ borderRadius: 8 }}
              >
                {companyInitials(newestReachOut.company)}
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      color: applicantLifecycleConfig[newestReachOut.status].color,
                      backgroundColor: applicantLifecycleConfig[newestReachOut.status].bg,
                    }}
                  >
                    {applicantLifecycleConfig[newestReachOut.status].label}
                  </span>
                  {newestReachOut.unread ? (
                    <span className="rounded-full bg-[#EF4444]/10 px-2 py-0.5 text-[11px] font-semibold text-[#EF4444]">
                      Unread
                    </span>
                  ) : null}
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[#111827]">
                  {newestReachOut.company} reached out about {newestReachOut.role.title}
                </h3>
                <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[#6B7280]">
                  {newestReachOut.reachOutMessage}
                </p>
                <p className="mt-3 text-[12px] font-medium text-[#374151]">
                  {newestReachOut.whyMatches[0]}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4 lg:pt-1">
              <div>
                <p className="text-[10px] font-medium uppercase text-[#9CA3AF]">Fit</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-dashboard-mono text-xl font-bold text-[#10B981]">{newestReachOut.matchScore}</span>
                  <span className="font-dashboard-mono text-[10px] text-[#9CA3AF]">/100</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#7dbbff] px-3.5 py-2 text-[12px] font-semibold text-white">
                View opportunity
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </div>
          </div>
        </button>
      ) : null}

      <SectionRule>Opportunities Preview</SectionRule>

      <div>
        {hasLoaded && engagementPreviewList.length === 0 ? (
          <p className="text-[13px] text-[#6B7280]">No other active opportunities to preview yet.</p>
        ) : null}
        {dashboardOpportunities.map((opp, idx) => {
          const fit = fitLabelAndColor(opp.matchScore);
          const isLast = idx === dashboardOpportunities.length - 1;
          const type = opp.employmentType ?? 'Full-time';
          const sector = opp.sector ?? 'Technology';
          return (
            <button
              key={opp.id}
              type="button"
              onClick={() => onViewAllOpportunities(opp.id)}
              className="grid w-full grid-cols-[1fr_auto] gap-4 py-3.5 text-left transition-colors hover:bg-black/[0.02]"
              style={{
                borderBottom: isLast ? undefined : '1px solid rgba(0,0,0,0.07)',
              }}
            >
              <div className="flex gap-5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-black/[0.05] text-[12px] font-bold text-[#6B7280]"
                  style={{ borderRadius: 6 }}
                >
                  {companyInitials(opp.company)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-[#111827]">
                      {opp.role.title}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">{opp.company}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] text-[#6B7280]">
                    <span>{opp.location}</span>
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#D1D5DB]" />
                    <span>{type}</span>
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#D1D5DB]" />
                    <span>{sector}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase text-[#9CA3AF]">Fit</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-dashboard-mono text-base font-bold" style={{ color: fit.color }}>
                      {opp.matchScore}
                    </span>
                    <span className="font-dashboard-mono text-[10px] text-[#9CA3AF]">/100</span>
                  </div>
                  <div className="mt-1 h-[3px] w-20 overflow-hidden rounded-[1.5px] bg-[#EBEBEB]">
                    <div
                      className="h-full rounded-[1.5px]"
                      style={{ width: `${opp.matchScore}%`, background: fit.color }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold" style={{ color: fit.color }}>
                    {fit.label}
                  </p>
                </div>
                <ArrowRight className="h-[15px] w-[15px] text-[#C4C4CC]" strokeWidth={2} />
              </div>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onViewAllOpportunities()}
          className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#7dbbff]"
        >
          View all opportunities
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      <SectionRule>Recent Activity</SectionRule>

      <div className="relative pl-5">
        <div
          className="pointer-events-none absolute bottom-1.5 left-[5px] top-1.5 w-px bg-black/[0.07]"
          aria-hidden
        />
        {activityRows.length === 0 ? (
          <p className="text-[12.5px] text-[#6B7280]">
            Activity from your profile and intake will show up here.
          </p>
        ) : (
          activityRows.map((ev, idx) => {
            const col = activityDotColor(ev.event_type);
            const isLast = idx === activityRows.length - 1;
            return (
              <div
                key={ev.id}
                className="relative flex gap-3.5"
                style={{ paddingBottom: isLast ? 0 : 14 }}
              >
                <span
                  className="absolute left-[2px] mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px] border-white"
                  style={{
                    background: col,
                    boxShadow: `0 0 0 1px ${col}`,
                  }}
                />
                <div className="pl-4">
                  <p className="text-[12.5px] leading-normal text-[#374151]">{ev.body}</p>
                  <p className="mt-0.5 font-dashboard-mono text-[11px] text-[#9CA3AF]">
                    {formatTimeAgo(new Date(ev.created_at))}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
