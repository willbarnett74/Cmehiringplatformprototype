import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  Compass,
  Search,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DashboardPage } from './employer-pages/DashboardPage';
import { SearchPage } from './employer-pages/SearchPage';
import { CandidatesPage } from './employer-pages/CandidatesPage';
import { InsightsAnalyticsPage } from './employer-pages/InsightsAnalyticsPage';
import { SettingsPage } from './employer-pages/SettingsPage';
import { CandidateModal } from './employer-pages/CandidateModal';
import { CandidateProfileView } from './employer-pages/ApplicantProfileView';
import { PerformanceSnapshotForm, type PerformanceSnapshotData } from './employer-pages/PerformanceSnapshotForm';
import type { ManagerObservationData } from './employer-pages/ManagerObservationForm';
import type { Candidate, Section, PerformanceSnapshot, MotivationalPulseCheck } from './types/employer';
import { EmployerOnboarding } from './employer-pages/onboarding/EmployerOnboarding';
import { NotificationBell } from './shared/NotificationBell';
import { TRAIT_DIMENSION_KEYS, TRAIT_LABELS } from '../lib/traits';
import type { DimensionScores } from '../utils/intakeScoreAggregate';
import { toCandidateDimensionScores } from '../utils/intakeScoreAggregate';

function topCoreTraitLabels(dimensionScores: NonNullable<Candidate['dimensionScores']>): string[] {
  const pairs = TRAIT_DIMENSION_KEYS.map((k) => [k, dimensionScores[k]] as const).filter(
    ([, v]) => typeof v === 'number' && !Number.isNaN(v),
  );
  pairs.sort((a, b) => b[1] - a[1]);
  return pairs.slice(0, 3).map(([k]) => TRAIT_LABELS[k]);
}

type MockCandidateSeed = Omit<Candidate, 'traits' | 'dimensionScores' | 'trait_scores'> & {
  trait_scores: DimensionScores;
};

function buildMockCandidate(row: MockCandidateSeed): Candidate {
  const dimensionScores = toCandidateDimensionScores(row.trait_scores);
  const { trait_scores, ...rest } = row;
  return {
    ...rest,
    trait_scores,
    dimensionScores,
    traits: topCoreTraitLabels(dimensionScores),
  };
}

export function EmployerScreen() {
  // Onboarding state - check if employer has completed onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return localStorage.getItem('cme_employer_onboarding_complete') === 'true';
    } catch {
      return false;
    }
  });

  const [employerBusinessName, setEmployerBusinessName] = useState('TechCorp Inc.');

  // Check Supabase for existing business row on mount — skip onboarding if already done
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', session.user.id)
        .maybeSingle();
      if (data?.id) {
        setHasCompletedOnboarding(true);
        try { localStorage.setItem('cme_employer_onboarding_complete', 'true'); } catch { /* ignore */ }
      }
      if (data?.name && typeof data.name === 'string' && data.name.trim()) {
        setEmployerBusinessName(data.name.trim());
      }
    });
  }, []);

  // Navigation state
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [searchResultsCount, setSearchResultsCount] = useState(0);

  useEffect(() => {
    if (currentSection !== 'search') setSearchResultsCount(0);
  }, [currentSection]);

  // Filter state
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showTraitsDropdown, setShowTraitsDropdown] = useState(false);

  // Modal state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showFullProfile, setShowFullProfile] = useState(false);

  // Candidate data with stage management (dimension scores align with applicant profile builder / Spec 1)
  const [candidates, setCandidates] = useState<Candidate[]>([
    buildMockCandidate({
      candidate_id: 1,
      id: 1,
      name: 'Jordan Chen',
      role: 'Senior Product Designer',
      location: 'San Francisco, CA',
      level: 'Senior',
      score: 94,
      stage: 'discovered' as const,
      daysInStage: 2,
      aiMatchPercent: 92,
      totalExperience: 8,
      transitioning: false,
      openToChange: false,
      readyToStepUp: true,
      retrained: false,
      trait_scores: {
        learning_velocity: 91,
        ownership_follow_through: 94,
        resilience: 84,
        communication_confidence: 86,
        relational_intelligence: 82,
        motivational_fit_mastery: 88,
        motivational_fit_impact: 76,
        motivational_fit_recognition: 72,
        motivational_fit_autonomy: 84,
      },
    }),
    buildMockCandidate({
      candidate_id: 2,
      id: 2,
      name: 'Riley Martinez',
      role: 'Lead UX Designer',
      location: 'New York, NY',
      level: 'Lead',
      score: 91,
      stage: 'discovered' as const,
      daysInStage: 9,
      aiMatchPercent: 88,
      totalExperience: 12,
      transitioning: false,
      openToChange: false,
      readyToStepUp: false,
      retrained: false,
      trait_scores: {
        learning_velocity: 84,
        ownership_follow_through: 83,
        resilience: 79,
        communication_confidence: 93,
        relational_intelligence: 91,
        motivational_fit_mastery: 80,
        motivational_fit_impact: 90,
        motivational_fit_recognition: 85,
        motivational_fit_autonomy: 88,
      },
    }),
    buildMockCandidate({
      candidate_id: 3,
      id: 3,
      name: 'Taylor Kim',
      role: 'Product Designer',
      location: 'Austin, TX',
      level: 'Mid-level',
      score: 88,
      stage: 'contacted' as const,
      daysInStage: 4,
      aiMatchPercent: 85,
      totalExperience: 4,
      transitioning: false,
      openToChange: true,
      readyToStepUp: true,
      retrained: false,
      trait_scores: {
        learning_velocity: 86,
        ownership_follow_through: 90,
        resilience: 88,
        communication_confidence: 78,
        relational_intelligence: 81,
        motivational_fit_mastery: 87,
        motivational_fit_impact: 84,
        motivational_fit_recognition: 80,
        motivational_fit_autonomy: 89,
      },
    }),
    buildMockCandidate({
      candidate_id: 4,
      id: 4,
      name: 'Morgan Lee',
      role: 'Senior Designer',
      location: 'San Francisco, CA',
      level: 'Senior',
      score: 92,
      stage: 'contacted' as const,
      daysInStage: 12,
      aiMatchPercent: 90,
      totalExperience: 7,
      transitioning: false,
      openToChange: false,
      readyToStepUp: false,
      retrained: false,
      trait_scores: {
        learning_velocity: 93,
        ownership_follow_through: 88,
        resilience: 80,
        communication_confidence: 84,
        relational_intelligence: 77,
        motivational_fit_mastery: 91,
        motivational_fit_impact: 78,
        motivational_fit_recognition: 74,
        motivational_fit_autonomy: 85,
      },
    }),
    buildMockCandidate({
      candidate_id: 5,
      id: 5,
      name: 'Casey Wong',
      role: 'Lead Product Designer',
      location: 'Remote',
      level: 'Lead',
      score: 96,
      stage: 'interviewing' as const,
      daysInStage: 3,
      aiMatchPercent: 95,
      totalExperience: 15,
      transitioning: false,
      openToChange: false,
      readyToStepUp: false,
      retrained: false,
      trait_scores: {
        learning_velocity: 90,
        ownership_follow_through: 96,
        resilience: 88,
        communication_confidence: 94,
        relational_intelligence: 91,
        motivational_fit_mastery: 86,
        motivational_fit_impact: 94,
        motivational_fit_recognition: 88,
        motivational_fit_autonomy: 90,
      },
    }),
    buildMockCandidate({
      candidate_id: 6,
      id: 6,
      name: 'Alex Rivera',
      role: 'Senior UX Designer',
      location: 'Remote',
      level: 'Senior',
      score: 89,
      stage: 'discovered' as const,
      daysInStage: 1,
      aiMatchPercent: 87,
      totalExperience: 2,
      transitioning: true,
      openToChange: true,
      readyToStepUp: false,
      retrained: true,
      trait_scores: {
        learning_velocity: 88,
        ownership_follow_through: 80,
        resilience: 91,
        communication_confidence: 85,
        relational_intelligence: 89,
        motivational_fit_mastery: 82,
        motivational_fit_impact: 88,
        motivational_fit_recognition: 80,
        motivational_fit_autonomy: 86,
      },
    }),
    buildMockCandidate({
      candidate_id: 7,
      id: 7,
      name: 'Sam Patel',
      role: 'Product Designer',
      location: 'Austin, TX',
      level: 'Mid-level',
      score: 85,
      stage: 'contacted' as const,
      daysInStage: 8,
      aiMatchPercent: 82,
      totalExperience: 3,
      transitioning: false,
      openToChange: false,
      readyToStepUp: true,
      retrained: false,
      trait_scores: {
        learning_velocity: 89,
        ownership_follow_through: 84,
        resilience: 76,
        communication_confidence: 80,
        relational_intelligence: 87,
        motivational_fit_mastery: 85,
        motivational_fit_impact: 80,
        motivational_fit_recognition: 82,
        motivational_fit_autonomy: 84,
      },
    }),
    buildMockCandidate({
      candidate_id: 8,
      id: 8,
      name: 'Jamie Foster',
      role: 'Lead Designer',
      location: 'New York, NY',
      level: 'Lead',
      score: 93,
      stage: 'decision' as const,
      daysInStage: 5,
      aiMatchPercent: 91,
      totalExperience: 11,
      transitioning: false,
      openToChange: true,
      readyToStepUp: false,
      retrained: false,
      trait_scores: {
        learning_velocity: 90,
        ownership_follow_through: 93,
        resilience: 85,
        communication_confidence: 89,
        relational_intelligence: 86,
        motivational_fit_mastery: 90,
        motivational_fit_impact: 86,
        motivational_fit_recognition: 84,
        motivational_fit_autonomy: 92,
      },
    }),
    buildMockCandidate({
      candidate_id: 9,
      id: 9,
      name: 'Drew Anderson',
      role: 'Junior Designer',
      location: 'Chicago, IL',
      level: 'Entry',
      score: 68,
      stage: 'discovered' as const,
      daysInStage: 0,
      aiMatchPercent: 65,
      totalExperience: 1,
      transitioning: false,
      openToChange: true,
      readyToStepUp: false,
      retrained: true,
      trait_scores: {
        learning_velocity: 62,
        ownership_follow_through: 55,
        resilience: 58,
        communication_confidence: 72,
        relational_intelligence: 68,
        motivational_fit_mastery: 65,
        motivational_fit_impact: 72,
        motivational_fit_recognition: 68,
        motivational_fit_autonomy: 74,
      },
    }),
    buildMockCandidate({
      candidate_id: 10,
      id: 10,
      name: 'Priya Nair',
      role: 'Product Designer',
      location: 'Austin, TX',
      level: 'Mid-level',
      score: 87,
      stage: 'hired' as const,
      hired_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      aiMatchPercent: 85,
      totalExperience: 5,
      transitioning: false,
      openToChange: false,
      readyToStepUp: true,
      retrained: false,
      trait_scores: {
        learning_velocity: 86,
        ownership_follow_through: 88,
        resilience: 80,
        communication_confidence: 90,
        relational_intelligence: 82,
        motivational_fit_mastery: 83,
        motivational_fit_impact: 85,
        motivational_fit_recognition: 82,
        motivational_fit_autonomy: 86,
      },
    }),
    buildMockCandidate({
      candidate_id: 11,
      id: 11,
      name: 'Marcus Webb',
      role: 'Senior Designer',
      location: 'Remote',
      level: 'Senior',
      score: 91,
      stage: 'hired' as const,
      hired_date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
      aiMatchPercent: 89,
      totalExperience: 9,
      transitioning: false,
      openToChange: false,
      readyToStepUp: false,
      retrained: false,
      trait_scores: {
        learning_velocity: 87,
        ownership_follow_through: 92,
        resilience: 91,
        communication_confidence: 87,
        relational_intelligence: 84,
        motivational_fit_mastery: 88,
        motivational_fit_impact: 84,
        motivational_fit_recognition: 80,
        motivational_fit_autonomy: 90,
      },
    }),
  ]);

  // ── Post-hire data state ───────────────────────────────────────────────────
  const [performanceSnapshots, setPerformanceSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [pulseChecks, setPulseChecks] = useState<MotivationalPulseCheck[]>([]);

  // Review form state
  const [reviewCandidate, setReviewCandidate] = useState<Candidate | null>(null);
  const [reviewSnapshotDay, setReviewSnapshotDay] = useState<30 | 90>(30);

  const handleOpenReview = (candidate: Candidate, snapshotDay: 30 | 90) => {
    setReviewCandidate(candidate);
    setReviewSnapshotDay(snapshotDay);
  };

  const handleSubmitReview = (
    snapshotData: PerformanceSnapshotData,
    managerObs: ManagerObservationData,
  ) => {
    const engagementId = reviewCandidate?.id ?? 0;
    const now = new Date().toISOString();

    // Save performance snapshot
    const newSnapshot: PerformanceSnapshot = {
      id: performanceSnapshots.length + 1,
      engagement_id: engagementId,
      snapshot_day: reviewSnapshotDay,
      ...snapshotData,
      would_rehire: snapshotData.would_rehire ?? false,
      submitted_at: now,
    };
    setPerformanceSnapshots((prev) => [...prev, newSnapshot]);

    // Save / merge manager observation into pulse check row
    setPulseChecks((prev) => {
      const existingIdx = prev.findIndex(
        (p) => p.engagement_id === engagementId && p.snapshot_day === reviewSnapshotDay,
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          mastery_behaviour_rating: managerObs.mastery_behaviour_rating ?? undefined,
          impact_behaviour_rating: managerObs.impact_behaviour_rating ?? undefined,
          recognition_behaviour_rating: managerObs.recognition_behaviour_rating ?? undefined,
          autonomy_behaviour_rating: managerObs.autonomy_behaviour_rating ?? undefined,
          manager_submitted: true,
        };
        return updated;
      }
      const newCheck: MotivationalPulseCheck = {
        id: prev.length + 1,
        engagement_id: engagementId,
        snapshot_day: reviewSnapshotDay,
        candidate_submitted: false,
        mastery_behaviour_rating: managerObs.mastery_behaviour_rating ?? undefined,
        impact_behaviour_rating: managerObs.impact_behaviour_rating ?? undefined,
        recognition_behaviour_rating: managerObs.recognition_behaviour_rating ?? undefined,
        autonomy_behaviour_rating: managerObs.autonomy_behaviour_rating ?? undefined,
        manager_submitted: true,
        submitted_at: now,
      };
      return [...prev, newCheck];
    });
  };

  /** Days since hire for a given candidate */
  const daysSinceHire = (candidate: Candidate): number => {
    if (!candidate.hired_date) return 0;
    return Math.floor((Date.now() - new Date(candidate.hired_date).getTime()) / (1000 * 60 * 60 * 24));
  };

  /** Snapshot days already submitted for a candidate */
  const completedSnapshotDays = (candidate: Candidate): number[] => {
    return performanceSnapshots
      .filter((s) => s.engagement_id === candidate.id)
      .map((s) => s.snapshot_day);
  };

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const clearFilters = () => {
    setSelectedLocation(null);
    setSelectedLevel(null);
    setSelectedTraits([]);
  };

  const handleLocationDropdownToggle = () => {
    setShowLocationDropdown(!showLocationDropdown);
    setShowLevelDropdown(false);
    setShowTraitsDropdown(false);
  };

  const handleLevelDropdownToggle = () => {
    setShowLevelDropdown(!showLevelDropdown);
    setShowLocationDropdown(false);
    setShowTraitsDropdown(false);
  };

  const handleTraitsDropdownToggle = () => {
    setShowTraitsDropdown(!showTraitsDropdown);
    setShowLocationDropdown(false);
    setShowLevelDropdown(false);
  };

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleMoveToNextStage = (candidateId: number) => {
    setCandidates((prevCandidates) =>
      prevCandidates.map((candidate) => {
        if (candidate.id === candidateId) {
          // Spec 7 §5.1 pipeline: discovered → contacted → interviewing → decision → hired
          let newStage: 'discovered' | 'contacted' | 'interviewing' | 'decision' | 'hired' | 'rejected' = candidate.stage;
          if (candidate.stage === 'discovered') newStage = 'contacted';
          else if (candidate.stage === 'contacted') newStage = 'interviewing';
          else if (candidate.stage === 'interviewing') newStage = 'decision';
          else if (candidate.stage === 'decision') newStage = 'hired';
          const hiredDate = newStage === 'hired' && !candidate.hired_date
            ? new Date().toISOString()
            : candidate.hired_date;
          return { ...candidate, stage: newStage, hired_date: hiredDate };
        }
        return candidate;
      })
    );
  };

  const handleMoveToStage = (candidateId: number, newStage: string) => {
    setCandidates((prevCandidates) =>
      prevCandidates.map((candidate) => {
        if (candidate.id === candidateId) {
          return { ...candidate, stage: newStage as 'discovered' | 'contacted' | 'interviewing' | 'decision' | 'hired' | 'rejected' };
        }
        return candidate;
      })
    );
  };

  const handleAddNote = (candidateId: number) => {
    // In a real app, this would open a note-taking interface
    console.log('Add note for candidate:', candidateId);
  };

  const hasActiveFilters = Boolean(
    selectedLocation || selectedLevel || selectedTraits.length > 0,
  );

  const portalMonthYear = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const employerInitials =
    employerBusinessName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TC';

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const EmployerNavBtn = ({
    active,
    icon: Icon,
    label,
    onClick,
  }: {
    active: boolean;
    icon: typeof LayoutDashboard;
    label: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 py-2 pl-2.5 pr-2.5 transition-colors"
      style={{ borderRadius: 7, background: active ? 'rgba(125,187,255,0.12)' : 'transparent' }}
    >
      <Icon
        className="shrink-0"
        style={{
          width: 15,
          height: 15,
          color: active ? '#7dbbff' : 'rgba(255,255,255,0.35)',
        }}
        strokeWidth={2}
      />
      <span
        className="min-w-0 truncate text-left text-[13px]"
        style={{
          fontWeight: active ? 500 : 400,
          color: active ? '#7dbbff' : 'rgba(255,255,255,0.82)',
        }}
      >
        {label}
      </span>
    </button>
  );

  const topBarTitle =
    currentSection === 'dashboard'
      ? 'Dashboard'
      : currentSection === 'search'
        ? 'Search Candidates'
        : currentSection === 'candidates'
          ? 'Candidate Pipeline'
          : currentSection === 'insights'
            ? 'Insights & Analytics'
            : 'Settings';

  const topBarSubtitle =
    currentSection === 'dashboard'
      ? portalMonthYear
      : currentSection === 'search'
        ? `${searchResultsCount} result${searchResultsCount !== 1 ? 's' : ''}`
        : currentSection === 'candidates'
          ? `${candidates.length} total`
          : employerBusinessName;

  return (
    <div className="relative min-h-screen bg-[#fafafa] font-dashboard text-[#111827] antialiased">
      <div className="flex min-h-screen">
        {/* Left sidebar — CMe Portal v2 handoff (dark rail, same language as applicant) */}
        <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-white/[0.05] bg-[#030213]">
          <div className="flex flex-1 flex-col px-[18px] pb-4 pt-[22px]">
            <div className="mb-[18px] flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#7dbbff]"
                style={{ borderRadius: 7 }}
              >
                <Compass className="h-[15px] w-[15px] text-white" strokeWidth={2} />
              </div>
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">CMe</span>
            </div>

            <p className="mb-1.5 px-0.5 text-[10px] uppercase tracking-[0.1em] text-white/35">Menu</p>
            <nav className="flex flex-col gap-0.5">
              <EmployerNavBtn
                active={currentSection === 'dashboard'}
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => setCurrentSection('dashboard')}
              />
              <EmployerNavBtn
                active={currentSection === 'search'}
                icon={Search}
                label="Search"
                onClick={() => setCurrentSection('search')}
              />
              <EmployerNavBtn
                active={currentSection === 'candidates'}
                icon={Users}
                label="Candidates"
                onClick={() => setCurrentSection('candidates')}
              />
              <EmployerNavBtn
                active={currentSection === 'insights'}
                icon={TrendingUp}
                label="Insights & Analytics"
                onClick={() => setCurrentSection('insights')}
              />
              <EmployerNavBtn
                active={currentSection === 'settings'}
                icon={Settings}
                label="Settings"
                onClick={() => setCurrentSection('settings')}
              />
            </nav>

            <div className="mt-auto border-t border-white/[0.05] pt-4">
              <div className="mb-3.5 flex items-center gap-2.5 px-0.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7dbbff] text-[10px] font-semibold text-white">
                  {employerInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white/80">{employerBusinessName}</p>
                  <p className="truncate text-[10.5px] text-white/35">Employer account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex w-full items-center gap-2 px-0.5 py-1.5 text-white/35 transition-colors hover:text-white/55"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span className="text-xs">Sign out</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#fafafa]">
          <div className="sticky top-0 z-10 flex h-[52px] shrink-0 items-center justify-between border-b border-black/[0.08] bg-[#fafafa] px-9">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-[13px] font-medium text-[#111827]">{topBarTitle}</span>
              <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#D1D5DB]" />
              <span className="truncate text-[12.5px] text-[#9CA3AF]">{topBarSubtitle}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <NotificationBell
                userId="employer-1"
                onNavigate={(url) => {
                  if (url === '#candidates') setCurrentSection('candidates');
                  if (url === '#insights') setCurrentSection('insights');
                }}
              />
              <div
                className="flex items-center gap-1.5 border border-black/[0.08] bg-white px-2.5 py-1"
                style={{ borderRadius: 5 }}
              >
                <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#7dbbff] text-[9px] font-semibold text-white">
                  {employerInitials}
                </div>
                <span className="max-w-[160px] truncate text-[12.5px] font-medium text-[#111827]">
                  {employerBusinessName}
                </span>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-9 pb-12 pt-7">
            {currentSection === 'dashboard' && (
              <DashboardPage
                hasActiveFilters={hasActiveFilters}
                candidateCount={candidates.length}
                candidates={candidates}
                businessName={employerBusinessName}
                onNavigateToSearch={() => setCurrentSection('search')}
                onNavigateToCandidates={() => setCurrentSection('candidates')}
                onNavigateToInsights={() => setCurrentSection('insights')}
                onCandidateClick={handleCandidateClick}
              />
            )}
            {currentSection === 'search' && (
              <SearchPage
                candidates={candidates}
                selectedLocation={selectedLocation}
                selectedLevel={selectedLevel}
                selectedTraits={selectedTraits}
                showLocationDropdown={showLocationDropdown}
                showLevelDropdown={showLevelDropdown}
                showTraitsDropdown={showTraitsDropdown}
                onLocationChange={setSelectedLocation}
                onLevelChange={setSelectedLevel}
                onTraitToggle={toggleTrait}
                onClearFilters={clearFilters}
                onLocationDropdownToggle={handleLocationDropdownToggle}
                onLevelDropdownToggle={handleLevelDropdownToggle}
                onTraitsDropdownToggle={handleTraitsDropdownToggle}
                onCandidateClick={handleCandidateClick}
                onFilteredCountChange={setSearchResultsCount}
              />
            )}
            {currentSection === 'candidates' && (
              <CandidatesPage
                candidates={candidates}
                onCandidateClick={handleCandidateClick}
                onMoveToNextStage={handleMoveToNextStage}
                onMoveToStage={handleMoveToStage}
                daysSinceHire={daysSinceHire}
                completedSnapshotDays={completedSnapshotDays}
                onOpenReview={handleOpenReview}
              />
            )}
            {currentSection === 'insights' && (
              <InsightsAnalyticsPage employerBusinessName={employerBusinessName} />
            )}
            {currentSection === 'settings' && <SettingsPage />}
            </div>
          </div>
        </main>
      </div>

      {/* Candidate Modal */}
      {selectedCandidate && !showFullProfile && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onMoveToNextStage={handleMoveToNextStage}
          onAddNote={handleAddNote}
          onViewFullProfile={() => setShowFullProfile(true)}
        />
      )}

      {/* Full Profile View */}
      {showFullProfile && selectedCandidate && (
        <CandidateProfileView
          candidate={selectedCandidate}
          onClose={() => {
            setShowFullProfile(false);
            setSelectedCandidate(null);
          }}
          onMoveToNextStage={handleMoveToNextStage}
          onAddNote={handleAddNote}
        />
      )}

      {/* Performance Review Form */}
      {reviewCandidate && (
        <PerformanceSnapshotForm
          candidateName={reviewCandidate.name}
          engagementId={reviewCandidate.id}
          snapshotDay={reviewSnapshotDay}
          existingSnapshot={
            performanceSnapshots.find(
              (s) => s.engagement_id === reviewCandidate.id && s.snapshot_day === reviewSnapshotDay,
            )
          }
          existingPulseCheck={
            pulseChecks.find(
              (p) => p.engagement_id === reviewCandidate.id && p.snapshot_day === reviewSnapshotDay,
            )
          }
          topPerformerPercent={
            performanceSnapshots.length > 0
              ? Math.round(
                  (performanceSnapshots.filter((s) => s.performance_band === 'Top').length /
                    performanceSnapshots.length) *
                    100,
                )
              : 0
          }
          onSubmit={(snapshotData, managerObs) => {
            handleSubmitReview(snapshotData, managerObs);
          }}
          onClose={() => setReviewCandidate(null)}
        />
      )}

      {/* Onboarding Modal */}
      {!hasCompletedOnboarding && (
        <EmployerOnboarding
          onComplete={() => {
            setHasCompletedOnboarding(true);
            localStorage.setItem('cme_employer_onboarding_complete', 'true');
          }}
        />
      )}
    </div>
  );
}