import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  Settings,
  Compass,
  Search,
  TrendingUp,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DashboardPage } from './employer-pages/DashboardPage';
import { SearchPage } from './employer-pages/SearchPage';
import { CandidatesPage } from './employer-pages/CandidatesPage';
import { InsightsAnalyticsPage } from './employer-pages/InsightsAnalyticsPage';
import { SettingsPage } from './employer-pages/SettingsPage';
import { CandidateModal } from './employer-pages/CandidateModal';
import { CandidateProfileView } from './employer-pages/ApplicantProfileView';
import {
  PerformanceSnapshotForm,
  type PerformanceSnapshotData,
} from './employer-pages/PerformanceSnapshotForm';
import type { ManagerObservationData } from './employer-pages/ManagerObservationForm';
import type { Candidate, PerformanceSnapshot, Section } from './types/employer';
import { NotificationBell } from './shared/NotificationBell';
import { EmployerMessenger } from './employer-pages/messaging/EmployerMessenger';
import { fetchEmployerBusiness } from '../lib/employerPersistence';
import {
  fetchEmployerEngagements,
  createEngagement,
  insertEmployerEngagementMessage,
  markEmployerThreadRead,
  updateEngagementStageFromEmployer,
  mapKanbanColumnToDbStage,
  type EmployerEngagementThread,
} from '../lib/employerEngagements';
import {
  fetchPublishedCandidates,
  filterCandidates,
  computeCandidateMatchScore,
} from '../lib/employerCandidateSearch';
import {
  fetchPerformanceSnapshotsForBusiness,
  insertPerformanceSnapshot,
} from '../lib/employerPerformanceSnapshots';
import type { EmployerLikeStage } from '../lib/applicantOpportunitiesMock';
import type { EmployerWeights } from '../lib/matchScoring';
import { RouteFlowError } from './shared/RouteFlowState';

const EMPLOYER_DATA_KEY = ['employer-portal-data'] as const;

export function EmployerScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | 'messages'>('dashboard');
  const [, setSearchResultsCount] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showTraitsDropdown, setShowTraitsDropdown] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [selectedEngagementId, setSelectedEngagementId] = useState<string | null>(null);
  const [reviewCandidate, setReviewCandidate] = useState<Candidate | null>(null);
  const [reviewSnapshotDay, setReviewSnapshotDay] = useState<30 | 90>(30);
  const [reviewEngagementId, setReviewEngagementId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: portalData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...EMPLOYER_DATA_KEY, userId],
    enabled: Boolean(supabase && userId),
    queryFn: async () => {
      if (!supabase || !userId) throw new Error('Not authenticated');
      const { business, weightings } = await fetchEmployerBusiness(supabase, userId);
      const weights: EmployerWeights | null = weightings;

      const [threads, searchPool, snapshots] = await Promise.all([
        business
          ? fetchEmployerEngagements(supabase, business.id, weights).catch((err: unknown) => {
              console.warn('[CMe] fetchEmployerEngagements failed:', err);
              return [];
            })
          : Promise.resolve([] as EmployerEngagementThread[]),
        fetchPublishedCandidates(supabase, business?.id ?? null, weights),
        business
          ? fetchPerformanceSnapshotsForBusiness(supabase, business.id)
          : Promise.resolve([] as PerformanceSnapshot[]),
      ]);
      return { business, weightings: weights, threads, searchPool, snapshots };
    },
    refetchInterval: currentSection === 'messages' ? 8000 : false,
  });

  const employerBusinessName = portalData?.business?.name ?? 'Your company';
  const businessId = portalData?.business?.id ?? null;
  const weights = portalData?.weightings ?? null;
  const threads = portalData?.threads ?? [];
  const candidates = useMemo(() => threads.map((t) => t.candidate), [threads]);

  const filteredSearchCandidates = useMemo(() => {
    const pool = portalData?.searchPool ?? [];
    return filterCandidates(pool, {
      location: selectedLocation,
      level: selectedLevel,
      traitKeywords: selectedTraits,
    });
  }, [portalData?.searchPool, selectedLocation, selectedLevel, selectedTraits]);

  const reload = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...EMPLOYER_DATA_KEY, userId] });
  }, [queryClient, userId]);

  const engagementIdForCandidate = (c: Candidate): string | undefined => {
    const t = threads.find(
      (th) =>
        String(th.candidateProfileId) === String(c.candidate_id) ||
        String(th.candidate.id) === String(c.id),
    );
    return t?.engagementId;
  };

  const handleMoveToStage = async (candidateId: number | string, newStage: string) => {
    const dbStage = mapKanbanColumnToDbStage(newStage);
    const thread = threads.find((t) => String(t.candidate.id) === String(candidateId));
    if (!thread || !supabase) return;
    await updateEngagementStageFromEmployer(supabase, thread.engagementId, dbStage as Candidate['stage']);
    reload();
  };

  const handleContactCandidate = async (candidate: Candidate, message?: string) => {
    if (!supabase || !businessId || !weights) return;
    let engId = engagementIdForCandidate(candidate);
    if (!engId) {
      const matchScore = computeCandidateMatchScore(candidate, weights);
      engId = await createEngagement(
        supabase,
        String(candidate.candidate_id ?? candidate.id),
        businessId,
        matchScore,
      );
    }
    if (message?.trim()) {
      await insertEmployerEngagementMessage(supabase, engId, message.trim(), {
        advanceToContacted: true,
      });
    }
    setSelectedEngagementId(engId);
    setCurrentSection('messages');
    reload();
  };

  const handleShortlistCandidate = async (candidate: Candidate) => {
    if (!supabase || !businessId || !weights) return;
    const existing = engagementIdForCandidate(candidate);
    if (existing) return; // already engaged, no duplicate
    const matchScore = computeCandidateMatchScore(candidate, weights);
    await createEngagement(
      supabase,
      String(candidate.candidate_id ?? candidate.id),
      businessId,
      matchScore,
      'employer_search',
    );
    reload();
  };

  const handleSendMessage = async (engagementId: string, body: string) => {
    if (!supabase) return;
    const thread = threads.find((t) => t.engagementId === engagementId);
    const advance = thread?.stage === 'discovered';
    await insertEmployerEngagementMessage(supabase, engagementId, body, {
      advanceToContacted: advance,
    });
    reload();
  };

  const handleSelectEngagement = async (engagementId: string) => {
    setSelectedEngagementId(engagementId);
    if (supabase) {
      await markEmployerThreadRead(supabase, engagementId);
      reload();
    }
  };

  const handleStageChange = async (engagementId: string, stage: EmployerLikeStage) => {
    if (!supabase) return;
    await updateEngagementStageFromEmployer(supabase, engagementId, stage);
    reload();
  };

  const snapshots = portalData?.snapshots ?? [];
  const completedSnapshotDays = (candidate: Candidate): number[] => {
    const eid = engagementIdForCandidate(candidate);
    if (!eid) return [];
    return snapshots
      .filter((s) => s.engagement_id === eid)
      .map((s) => s.snapshot_day as 30 | 90);
  };

  const daysSinceHire = (candidate: Candidate): number => {
    if (!candidate.hired_date) return 0;
    return Math.floor((Date.now() - new Date(candidate.hired_date).getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleOpenReview = (candidate: Candidate, snapshotDay: 30 | 90) => {
    setReviewCandidate(candidate);
    setReviewSnapshotDay(snapshotDay);
    setReviewEngagementId(engagementIdForCandidate(candidate) ?? null);
  };

  const handleSubmitReview = async (
    snapshotData: PerformanceSnapshotData,
    _managerObs: ManagerObservationData,
  ) => {
    if (!supabase || !reviewEngagementId) return;
    await insertPerformanceSnapshot(supabase, reviewEngagementId, reviewSnapshotDay, snapshotData);
    setReviewCandidate(null);
    reload();
  };

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait],
    );
  };

  const clearFilters = () => {
    setSelectedLocation(null);
    setSelectedLevel(null);
    setSelectedTraits([]);
  };

  const hasActiveFilters = Boolean(selectedLocation || selectedLevel || selectedTraits.length > 0);
  const employerInitials =
    employerBusinessName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'EM';

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/onboarding/sign-in', { replace: true });
  };

  const EmployerNavBtn = ({
    active,
    icon: Icon,
    label,
    badge,
    onClick,
  }: {
    active: boolean;
    icon: typeof LayoutDashboard;
    label: string;
    badge?: number;
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
        style={{ width: 15, height: 15, color: active ? '#7dbbff' : 'rgba(255,255,255,0.35)' }}
        strokeWidth={2}
      />
      <span
        className="min-w-0 flex-1 truncate text-left text-[13px]"
        style={{ fontWeight: active ? 500 : 400, color: active ? '#7dbbff' : 'rgba(255,255,255,0.82)' }}
      >
        {label}
      </span>
      {badge && badge > 0 ? (
        <span className="rounded-full bg-[#7dbbff] px-1.5 text-[10px] font-semibold text-white">{badge}</span>
      ) : null}
    </button>
  );

  const topBarTitle =
    currentSection === 'dashboard'
      ? 'Dashboard'
      : currentSection === 'search'
        ? 'Search Candidates'
        : currentSection === 'candidates'
          ? 'Candidate Pipeline'
          : currentSection === 'messages'
            ? 'Messages'
            : currentSection === 'insights'
              ? 'Insights & Analytics'
              : 'Settings';

  if (isLoading && !portalData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] font-dashboard text-sm text-[#6B7280]">
        Loading employer portal…
      </div>
    );
  }

  if (isError && !portalData) {
    return (
      <RouteFlowError
        message={
          error instanceof Error
            ? error.message
            : 'We could not load the employer portal. Check your connection and try again.'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa] font-dashboard text-[#111827] antialiased">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-white/[0.05] bg-[#030213]">
          <div className="flex flex-1 flex-col px-[18px] pb-4 pt-[22px]">
            <div className="mb-[18px] flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#7dbbff]" style={{ borderRadius: 7 }}>
                <Compass className="h-[15px] w-[15px] text-white" strokeWidth={2} />
              </div>
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">CMe</span>
            </div>
            <p className="mb-1.5 px-0.5 text-[10px] uppercase tracking-[0.1em] text-white/35">Menu</p>
            <nav className="flex flex-col gap-0.5">
              <EmployerNavBtn active={currentSection === 'dashboard'} icon={LayoutDashboard} label="Dashboard" onClick={() => setCurrentSection('dashboard')} />
              <EmployerNavBtn active={currentSection === 'search'} icon={Search} label="Search" onClick={() => setCurrentSection('search')} />
              <EmployerNavBtn active={currentSection === 'candidates'} icon={Users} label="Candidates" onClick={() => setCurrentSection('candidates')} />
              <EmployerNavBtn active={currentSection === 'messages'} icon={MessageSquare} label="Messages" badge={totalUnread} onClick={() => setCurrentSection('messages')} />
              <EmployerNavBtn active={currentSection === 'insights'} icon={TrendingUp} label="Insights & Analytics" onClick={() => setCurrentSection('insights')} />
              <EmployerNavBtn active={currentSection === 'settings'} icon={Settings} label="Settings" onClick={() => setCurrentSection('settings')} />
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
              <button type="button" onClick={() => void handleSignOut()} className="flex w-full items-center gap-2 px-0.5 py-1.5 text-white/35 transition-colors hover:text-white/55">
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
              <span className="truncate text-[12.5px] text-[#9CA3AF]">{employerBusinessName}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <NotificationBell
                userId={userId ?? 'employer'}
                onNavigate={(url) => {
                  if (url === '#candidates') setCurrentSection('candidates');
                  if (url === '#insights') setCurrentSection('insights');
                  if (url === '#messages') setCurrentSection('messages');
                }}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className={currentSection === 'messages' ? 'h-full min-h-0 px-9 py-7' : 'px-9 pb-12 pt-7'}>
              {currentSection === 'dashboard' && (
                <DashboardPage
                  hasActiveFilters={hasActiveFilters}
                  candidateCount={candidates.length}
                  candidates={candidates}
                  businessName={employerBusinessName}
                  onNavigateToSearch={() => setCurrentSection('search')}
                  onNavigateToCandidates={() => setCurrentSection('candidates')}
                  onNavigateToInsights={() => setCurrentSection('insights')}
                  onCandidateClick={setSelectedCandidate}
                />
              )}
              {currentSection === 'search' && (
                <SearchPage
                  candidates={filteredSearchCandidates}
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
                  onLocationDropdownToggle={() => {
                    setShowLocationDropdown(!showLocationDropdown);
                    setShowLevelDropdown(false);
                    setShowTraitsDropdown(false);
                  }}
                  onLevelDropdownToggle={() => {
                    setShowLevelDropdown(!showLevelDropdown);
                    setShowLocationDropdown(false);
                    setShowTraitsDropdown(false);
                  }}
                  onTraitsDropdownToggle={() => {
                    setShowTraitsDropdown(!showTraitsDropdown);
                    setShowLocationDropdown(false);
                    setShowLevelDropdown(false);
                  }}
                  onCandidateClick={setSelectedCandidate}
                  onFilteredCountChange={setSearchResultsCount}
                  onShortlist={(candidate) => void handleShortlistCandidate(candidate)}
                  onContact={(candidate) => void handleContactCandidate(candidate)}
                />
              )}
              {currentSection === 'candidates' && (
                <CandidatesPage
                  candidates={candidates}
                  onCandidateClick={setSelectedCandidate}
                  onMoveToNextStage={() => {}}
                  onMoveToStage={(id, stage) => void handleMoveToStage(id, stage)}
                  daysSinceHire={daysSinceHire}
                  completedSnapshotDays={completedSnapshotDays}
                  onOpenReview={handleOpenReview}
                />
              )}
              {currentSection === 'messages' && (
                <EmployerMessenger
                  threads={threads}
                  selectedEngagementId={selectedEngagementId}
                  onSelectEngagement={(id) => void handleSelectEngagement(id)}
                  onSendMessage={(id, body) => void handleSendMessage(id, body)}
                  onStageChange={(id, stage) => void handleStageChange(id, stage)}
                  onOpenProfile={(thread) => {
                    setSelectedCandidate(thread.candidate);
                    setShowFullProfile(true);
                  }}
                />
              )}
              {currentSection === 'insights' && (
                <InsightsAnalyticsPage employerBusinessName={employerBusinessName} businessId={businessId} weights={weights} />
              )}
              {currentSection === 'settings' && (
                <SettingsPage
                  business={portalData?.business ?? null}
                  userId={userId}
                  onSaved={reload}
                  onEditWeightings={() => setCurrentSection('settings')}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {selectedCandidate && !showFullProfile && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onMoveToNextStage={() => {}}
          onAddNote={() => {}}
          onViewFullProfile={() => setShowFullProfile(true)}
          onContact={() => void handleContactCandidate(selectedCandidate)}
          onShortlist={(candidate) => void handleShortlistCandidate(candidate)}
        />
      )}

      {showFullProfile && selectedCandidate && (
        <CandidateProfileView
          candidate={selectedCandidate}
          onClose={() => {
            setShowFullProfile(false);
            setSelectedCandidate(null);
          }}
          onMoveToNextStage={() => {}}
          onAddNote={() => {}}
        />
      )}

      {reviewCandidate && reviewEngagementId && (
        <PerformanceSnapshotForm
          candidateName={reviewCandidate.name}
          engagementId={reviewEngagementId as unknown as number}
          snapshotDay={reviewSnapshotDay}
          onSubmit={(snapshotData, managerObs) => void handleSubmitReview(snapshotData, managerObs)}
          onClose={() => setReviewCandidate(null)}
        />
      )}

      {!isSupabaseConfigured && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Supabase not configured — showing limited demo mode.
        </div>
      )}
    </div>
  );
}
