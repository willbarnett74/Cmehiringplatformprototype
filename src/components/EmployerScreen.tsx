import { useState } from 'react';
import { LayoutDashboard, Users, Settings, Building2, Search, BarChart3 } from 'lucide-react';
import { DashboardPage } from './employer-pages/DashboardPage';
import { SearchPage } from './employer-pages/SearchPage';
import { CandidatesPage } from './employer-pages/CandidatesPage';
import { InsightsAnalyticsPage } from './employer-pages/InsightsAnalyticsPage';
import { SettingsPage } from './employer-pages/SettingsPage';
import { CandidateModal } from './employer-pages/CandidateModal';
import { CandidateProfileView } from './employer-pages/ApplicantProfileView';
import { PerformanceSnapshotForm, type PerformanceSnapshotData } from './employer-pages/PerformanceSnapshotForm';
import type { ManagerObservationData } from './employer-pages/ManagerObservationForm';
import { Candidate, Section, PerformanceSnapshot, MotivationalPulseCheck } from './types/employer';
import { EmployerOnboarding } from './employer-pages/onboarding/EmployerOnboarding';
import { NotificationBell } from './shared/NotificationBell';

export function EmployerScreen() {
  // Onboarding state - check if employer has completed onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return localStorage.getItem('cme_employer_onboarding_complete') === 'true';
    } catch {
      return false;
    }
  });

  // Navigation state
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');

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

  // Candidate data with stage management
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      candidate_id: 1,
      id: 1,
      name: 'Jordan Chen',
      role: 'Senior Product Designer',
      location: 'San Francisco, CA',
      level: 'Senior',
      traits: ['Ownership', 'Learning Speed', 'Adaptability'],
      score: 94,
      stage: 'discovered' as const,
      daysInStage: 2,
      aiMatchPercent: 92,
      totalExperience: 8,
      transitioning: false,
      openToChange: false,
      readyToStepUp: true,
      retrained: false,
      traitScores: { adaptability: 85, decisionMaking: 90, communication: 88, cognitiveAgility: 92, collaboration: 87, ownership: 94 },
    },
    {
      candidate_id: 2,
      id: 2,
      name: 'Riley Martinez',
      role: 'Lead UX Designer',
      location: 'New York, NY',
      level: 'Lead',
      traits: ['Communication', 'Collaboration', 'Innovation'],
      score: 91,
      stage: 'discovered' as const,
      daysInStage: 9,
      aiMatchPercent: 88,
      totalExperience: 12,
      transitioning: false,
      openToChange: false,
      readyToStepUp: false,
      retrained: false,
      traitScores: { adaptability: 80, decisionMaking: 85, communication: 92, cognitiveAgility: 86, collaboration: 91, ownership: 83 },
    },
    {
      candidate_id: 3,
      id: 3,
      name: 'Taylor Kim',
      role: 'Product Designer',
      location: 'Austin, TX',
      level: 'Mid-level',
      traits: ['Problem Solving', 'Creativity', 'Ownership'],
      score: 88,
      stage: 'contacted' as const,
      daysInStage: 4,
      aiMatchPercent: 85,
      totalExperience: 4,
      transitioning: false,
      openToChange: true,
      readyToStepUp: true,
      retrained: false,
      traitScores: { adaptability: 82, decisionMaking: 88, communication: 80, cognitiveAgility: 89, collaboration: 84, ownership: 90 },
    },
    {
      candidate_id: 4,
      id: 4,
      name: 'Morgan Lee',
      role: 'Senior Designer',
      location: 'San Francisco, CA',
      level: 'Senior',
      traits: ['Learning Speed', 'Detail-oriented', 'Leadership'],
      score: 92,
      stage: 'contacted' as const,
      daysInStage: 12,
      aiMatchPercent: 90,
      totalExperience: 7,
      transitioning: false,
      openToChange: false,
      readyToStepUp: false,
      retrained: false,
      traitScores: { adaptability: 78, decisionMaking: 92, communication: 85, cognitiveAgility: 91, collaboration: 80, ownership: 88 },
    },
    {
      candidate_id: 5,
      id: 5,
      name: 'Casey Wong',
      role: 'Lead Product Designer',
      location: 'Remote',
      level: 'Lead',
      traits: ['Leadership', 'Strategic Thinking', 'Communication'],
      score: 96,
      stage: 'interviewing' as const,
      daysInStage: 3,
      aiMatchPercent: 95,
      totalExperience: 15,
      transitioning: false,
      openToChange: false,
      readyToStepUp: false,
      retrained: false,
      traitScores: { adaptability: 88, decisionMaking: 94, communication: 93, cognitiveAgility: 90, collaboration: 92, ownership: 96 },
    },
    {
      candidate_id: 6,
      id: 6,
      name: 'Alex Rivera',
      role: 'Senior UX Designer',
      location: 'Remote',
      level: 'Senior',
      traits: ['Adaptability', 'Innovation', 'Collaboration'],
      score: 89,
      stage: 'discovered' as const,
      daysInStage: 1,
      aiMatchPercent: 87,
      totalExperience: 2,
      transitioning: true,
      openToChange: true,
      readyToStepUp: false,
      retrained: true,
      traitScores: { adaptability: 91, decisionMaking: 82, communication: 86, cognitiveAgility: 84, collaboration: 89, ownership: 80 },
    },
    {
      candidate_id: 7,
      id: 7,
      name: 'Sam Patel',
      role: 'Product Designer',
      location: 'Austin, TX',
      level: 'Mid-level',
      traits: ['Creativity', 'Learning Speed', 'Problem Solving'],
      score: 85,
      stage: 'contacted' as const,
      daysInStage: 8,
      aiMatchPercent: 82,
      totalExperience: 3,
      transitioning: false,
      openToChange: false,
      readyToStepUp: true,
      retrained: false,
      traitScores: { adaptability: 79, decisionMaking: 83, communication: 81, cognitiveAgility: 87, collaboration: 82, ownership: 85 },
    },
    {
      candidate_id: 8,
      id: 8,
      name: 'Jamie Foster',
      role: 'Lead Designer',
      location: 'New York, NY',
      level: 'Lead',
      traits: ['Strategic Thinking', 'Leadership', 'Ownership'],
      score: 93,
      stage: 'decision' as const,
      daysInStage: 5,
      aiMatchPercent: 91,
      totalExperience: 11,
      transitioning: false,
      openToChange: true,
      readyToStepUp: false,
      retrained: false,
      traitScores: { adaptability: 84, decisionMaking: 91, communication: 90, cognitiveAgility: 88, collaboration: 86, ownership: 93 },
    },
    {
      candidate_id: 9,
      id: 9,
      name: 'Drew Anderson',
      role: 'Junior Designer',
      location: 'Chicago, IL',
      level: 'Entry',
      traits: ['Growing', 'Eager', 'Creative'],
      score: 68,
      stage: 'discovered' as const,
      daysInStage: 0,
      aiMatchPercent: 65,
      totalExperience: 1,
      transitioning: false,
      openToChange: true,
      readyToStepUp: false,
      retrained: true,
      traitScores: { adaptability: 72, decisionMaking: 55, communication: 78, cognitiveAgility: 48, collaboration: 82, ownership: 52 },
    },
    {
      candidate_id: 10,
      id: 10,
      name: 'Priya Nair',
      role: 'Product Designer',
      location: 'Austin, TX',
      level: 'Mid-level',
      traits: ['Ownership', 'Communication', 'Learning Speed'],
      score: 87,
      stage: 'hired' as const,
      // 35 days ago — 30-day review due
      hired_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      aiMatchPercent: 85,
      totalExperience: 5,
      transitioning: false,
      openToChange: false,
      readyToStepUp: true,
      retrained: false,
      traitScores: { adaptability: 83, decisionMaking: 87, communication: 90, cognitiveAgility: 85, collaboration: 80, ownership: 88 },
    },
    {
      candidate_id: 11,
      id: 11,
      name: 'Marcus Webb',
      role: 'Senior Designer',
      location: 'Remote',
      level: 'Senior',
      traits: ['Leadership', 'Resilience', 'Strategic Thinking'],
      score: 91,
      stage: 'hired' as const,
      // 95 days ago — 90-day review due
      hired_date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
      aiMatchPercent: 89,
      totalExperience: 9,
      transitioning: false,
      openToChange: false,
      readyToStepUp: false,
      retrained: false,
      traitScores: { adaptability: 86, decisionMaking: 91, communication: 88, cognitiveAgility: 89, collaboration: 85, ownership: 92 },
    },
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

  const hasActiveFilters = selectedLocation || selectedLevel || selectedTraits.length > 0;

  return (
    <div className="relative bg-[#fafafa] min-h-screen">
      <div className="relative flex min-h-screen">
        {/* Left Sidebar Navigation */}
        <aside className="w-[240px] bg-white border-r border-black/[0.08] sticky top-0 h-screen overflow-y-auto">
          <div className="p-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 bg-[#7dbbff] flex items-center justify-center shrink-0"
                style={{ borderRadius: '12px' }}
              >
                <Building2 className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-lg text-[#111827] font-semibold">CMe</span>
            </div>

            {/* Menu Header */}
            <div className="mb-4">
              <p className="text-xs text-[#6B7280] uppercase tracking-wider px-3">Menu</p>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1 mb-8">
              <button
                onClick={() => setCurrentSection('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                  currentSection === 'dashboard'
                    ? 'bg-[#7dbbff]/10 text-[#7dbbff]'
                    : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <LayoutDashboard className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentSection('search')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                  currentSection === 'search'
                    ? 'bg-[#7dbbff]/10 text-[#7dbbff]'
                    : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <Search className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Search</span>
              </button>

              <button
                onClick={() => setCurrentSection('candidates')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                  currentSection === 'candidates'
                    ? 'bg-[#7dbbff]/10 text-[#7dbbff]'
                    : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <Users className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Candidates</span>
              </button>

              <button
                onClick={() => setCurrentSection('insights')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                  currentSection === 'insights'
                    ? 'bg-[#7dbbff]/10 text-[#7dbbff]'
                    : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <BarChart3 className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Insights & Analytics</span>
              </button>

              <button
                onClick={() => setCurrentSection('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                  currentSection === 'settings'
                    ? 'bg-[#7dbbff]/10 text-[#7dbbff]'
                    : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <Settings className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Top Header Bar */}
          <div className="bg-white border-b border-black/[0.08] px-8 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search candidates"
                    className="w-full px-4 py-2 pl-10 bg-[#fafafa] border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#7dbbff]"
                    style={{ borderRadius: '10px' }}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-[#6B7280]" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#fafafa]" style={{ borderRadius: '10px' }}>
                  <div className="w-8 h-8 rounded-full bg-[#7dbbff] flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-[#111827] font-medium">TechCorp Inc.</span>
                </div>

                <NotificationBell
                  userId="employer-1"
                  onNavigate={(url) => {
                    if (url === '#candidates') setCurrentSection('candidates');
                    if (url === '#insights') setCurrentSection('insights');
                  }}
                />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {currentSection === 'dashboard' && (
              <DashboardPage
                hasActiveFilters={hasActiveFilters}
                candidateCount={candidates.length}
                candidates={candidates}
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
            {currentSection === 'insights' && <InsightsAnalyticsPage />}
            {currentSection === 'settings' && <SettingsPage />}
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