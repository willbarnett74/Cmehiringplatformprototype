import { useState } from 'react';
import { LayoutDashboard, Users, Settings, Building2, Search, BarChart3 } from 'lucide-react';
import { DashboardPage } from './employer-pages/DashboardPage';
import { SearchPage } from './employer-pages/SearchPage';
import { CandidatesPage } from './employer-pages/CandidatesPage';
import { InsightsAnalyticsPage } from './employer-pages/InsightsAnalyticsPage';
import { SettingsPage } from './employer-pages/SettingsPage';
import { CandidateModal } from './employer-pages/CandidateModal';
import { CandidateProfileView } from './employer-pages/ApplicantProfileView';
import { Candidate, Section } from './types/employer';
import { EmployerOnboarding } from './employer-pages/onboarding/EmployerOnboarding';

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
      stage: 'newSignals' as const,
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
      stage: 'newSignals' as const,
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
      stage: 'assessmentSent' as const,
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
      stage: 'assessmentSent' as const,
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
      stage: 'finalRound' as const,
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
      stage: 'newSignals' as const,
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
      stage: 'assessmentSent' as const,
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
      stage: 'finalRound' as const,
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
      stage: 'newSignals' as const,
      aiMatchPercent: 65,
      totalExperience: 1,
      transitioning: false,
      openToChange: true,
      readyToStepUp: false,
      retrained: true,
      traitScores: { adaptability: 72, decisionMaking: 55, communication: 78, cognitiveAgility: 48, collaboration: 82, ownership: 52 },
    },
  ]);

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
          let newStage: 'newSignals' | 'assessmentSent' | 'finalRound' | 'hired' | 'rejected' = candidate.stage;
          if (candidate.stage === 'newSignals') newStage = 'assessmentSent';
          else if (candidate.stage === 'assessmentSent') newStage = 'finalRound';
          else if (candidate.stage === 'finalRound') newStage = 'hired';
          return { ...candidate, stage: newStage };
        }
        return candidate;
      })
    );
  };

  const handleMoveToStage = (candidateId: number, newStage: string) => {
    setCandidates((prevCandidates) =>
      prevCandidates.map((candidate) => {
        if (candidate.id === candidateId) {
          return { ...candidate, stage: newStage as 'newSignals' | 'assessmentSent' | 'finalRound' | 'hired' | 'rejected' };
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

                <button className="relative p-2 hover:bg-[#fafafa] transition-colors" style={{ borderRadius: '10px' }}>
                  <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
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