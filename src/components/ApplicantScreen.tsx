import { useState } from 'react';
import { ProfileOverviewPage } from './applicant-pages/ProfileOverviewPage';
import { SignatureTraitsPageDynamic } from './applicant-pages/SignatureTraitsPageDynamic';
import { SkillsTestingPage } from './applicant-pages/SkillsTestingPage';
import { DeeperInsightsPage } from './applicant-pages/DeeperInsightsPage';
import { WorkHistoryPage } from './applicant-pages/WorkHistoryPage';
import { DirectionsPage } from './applicant-pages/DirectionsPage';
import { ProfileBuilderLayout } from './applicant-pages/ProfileBuilderLayout';
import { CompaniesPage } from './applicant-pages/CompaniesPage';
import { LayoutDashboard, User, Settings, Compass, ArrowRight, Sparkles, Target, Brain, Zap, TrendingUp, Building2 } from 'lucide-react';

/**
 * Frame Structure:
 * 
 * Parent Frame: 'Applicant Portal'
 * 
 * Frame 1: 'Dashboard'
 * Frame 2 (Parent): 'Profile Builder'
 *   - Subframe 1: 'Step 1 – Foundation Overview'
 *   - Subframe 2: 'Step 2 – Experience & Work History'
 *   - Subframe 3: 'Step 3 – Career Direction'
 *   - Subframe 4: 'Step 4 – Deeper Insights'
 *   - Subframe 5: 'Step 5 – Skills & Testing'
 *   - Subframe 6: 'Step 6 – Signature Traits'
 */

export function ApplicantScreen() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'profileBuilder' | 'companies' | 'settings'>('dashboard');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [cognitiveScore, setCognitiveScore] = useState<number | null>(null);
  
  // Step statuses: active | needsReview | upToDate
  const [stepStatuses] = useState<{ [key: number]: 'active' | 'needsReview' | 'upToDate' }>({
    1: 'upToDate',      // Foundation Overview
    2: 'upToDate',      // Experience & Work History
    3: 'needsReview',   // Career Direction
    4: 'needsReview',   // Deeper Insights
    5: 'needsReview',   // Skills & Testing
    6: 'upToDate',      // Signature Traits
  });

  // Profile Builder Steps
  const profileBuilderSteps = [
    { id: 1, label: 'Step 1 – Foundation Overview', component: ProfileOverviewPage },
    { id: 2, label: 'Step 2 – Experience & Work History', component: WorkHistoryPage },
    { id: 3, label: 'Step 3 – Career Direction', component: DirectionsPage },
    { id: 4, label: 'Step 4 – Deeper Insights', component: DeeperInsightsPage },
    { id: 5, label: 'Step 5 – Skills & Testing', component: SkillsTestingPage },
    { id: 6, label: 'Step 6 – Signature Traits', component: SignatureTraitsPageDynamic },
  ];

  // Handle navigation to Profile Builder
  const handleProfileBuilderClick = (stepId?: number) => {
    setActiveSection('profileBuilder');
    setActiveStep(stepId || 1);
  };

  // FRAME 2: Profile Builder
  if (activeSection === 'profileBuilder') {
    const currentStepData = profileBuilderSteps.find(step => step.id === activeStep);
    const StepComponent = currentStepData?.component || ProfileOverviewPage;

    const handleBack = () => {
      if (activeStep === 1) {
        setActiveSection('dashboard');
      } else {
        setActiveStep(activeStep - 1);
      }
    };

    const handleNext = () => {
      if (activeStep < 6) {
        setActiveStep(activeStep + 1);
      } else {
        // Complete and go back to dashboard
        setActiveSection('dashboard');
      }
    };

    return (
      <ProfileBuilderLayout
        currentStep={activeStep}
        stepStatuses={stepStatuses}
        onStepChange={(stepId) => setActiveStep(stepId)}
        onBack={handleBack}
        onNext={handleNext}
      >
        {activeStep === 5 ? (
          <SkillsTestingPage cognitiveScore={cognitiveScore} onCognitiveScoreChange={setCognitiveScore} />
        ) : activeStep === 6 ? (
          <SignatureTraitsPageDynamic cognitiveScore={cognitiveScore} />
        ) : (
          <StepComponent />
        )}
      </ProfileBuilderLayout>
    );
  }

  // FRAME 3: Companies Page
  if (activeSection === 'companies') {
    return (
      <div className="relative bg-[#fafafa] min-h-screen">
        <div className="relative flex min-h-screen">
          {/* Left Sidebar Navigation */}
          <aside className="w-[240px] bg-white border-r border-black/[0.08] sticky top-0 h-screen overflow-y-auto">
            <div className="p-6">
              {/* Logo / Brand */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#7dbbff] flex items-center justify-center shrink-0" style={{ borderRadius: '12px' }}>
                  <Compass className="w-5 h-5 text-white" strokeWidth={2} />
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
                  onClick={() => setActiveSection('dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all" 
                  style={{ borderRadius: '10px' }}
                >
                  <LayoutDashboard className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => handleProfileBuilderClick()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all" 
                  style={{ borderRadius: '10px' }}
                >
                  <User className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Profile Builder</span>
                </button>

                <button
                  onClick={() => setActiveSection('companies')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#7dbbff]/10 text-[#7dbbff] transition-all" 
                  style={{ borderRadius: '10px' }}
                >
                  <Building2 className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Companies</span>
                </button>

                <button
                  onClick={() => setActiveSection('settings')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all" 
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
                      placeholder="Search"
                      className="w-full px-4 py-2 pl-10 bg-[#fafafa] border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#7dbbff]" 
                      style={{ borderRadius: '10px' }}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-[#fafafa]" style={{ borderRadius: '10px' }}>
                    <div className="w-8 h-8 rounded-full bg-[#7dbbff] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-sm text-[#111827] font-medium">Alex Rivera</span>
                  </div>

                  <button className="relative p-2 hover:bg-[#fafafa] transition-colors" style={{ borderRadius: '10px' }}>
                    <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                </div>
              </div>
            </div>

            {/* Companies Page Content */}
            <div className="p-8">
              <CompaniesPage />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // FRAME 1: Dashboard
  return (
    <div className="relative bg-[#fafafa] min-h-screen">
      <div className="relative flex min-h-screen">
        {/* Left Sidebar Navigation */}
        <aside className="w-[240px] bg-white border-r border-black/[0.08] sticky top-0 h-screen overflow-y-auto">
          <div className="p-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#7dbbff] flex items-center justify-center shrink-0" style={{ borderRadius: '12px' }}>
                <Compass className="w-5 h-5 text-white" strokeWidth={2} />
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
                onClick={() => setActiveSection('dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#7dbbff]/10 text-[#7dbbff] transition-all" 
                style={{ borderRadius: '10px' }}
              >
                <LayoutDashboard className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => handleProfileBuilderClick()}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all" 
                style={{ borderRadius: '10px' }}
              >
                <User className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Profile Builder</span>
              </button>

              <button
                onClick={() => setActiveSection('companies')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all" 
                style={{ borderRadius: '10px' }}
              >
                <Building2 className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Companies</span>
              </button>

              <button
                onClick={() => setActiveSection('settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all" 
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
                    placeholder="Search"
                    className="w-full px-4 py-2 pl-10 bg-[#fafafa] border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#7dbbff]" 
                    style={{ borderRadius: '10px' }}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#fafafa]" style={{ borderRadius: '10px' }}>
                  <div className="w-8 h-8 rounded-full bg-[#7dbbff] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-[#111827] font-medium">Alex Rivera</span>
                </div>

                <button className="relative p-2 hover:bg-[#fafafa] transition-colors" style={{ borderRadius: '10px' }}>
                  <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-8">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-2xl text-[#111827] font-semibold">Dashboard</h1>
            </div>

            {/* Main CTA Card */}
            <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base text-[#111827] font-semibold mb-2">Continue Building Your Profile</h3>
                  <p className="text-sm text-[#6B7280]">Complete your foundation overview to improve your readiness score</p>
                </div>
                <button
                  onClick={() => handleProfileBuilderClick(1)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors"
                  style={{ borderRadius: '10px' }}
                >
                  <span className="text-sm font-medium">Foundation Overview</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Top Row - Key Metrics */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Profile Completion Card */}
              <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="mb-4">
                  <h3 className="text-base text-[#111827] font-semibold">Profile Completion</h3>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#7dbbff] flex items-center justify-center">
                    <User className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-base text-[#111827] font-semibold">Alex Rivera</p>
                    <p className="text-xs text-[#6B7280]">Product Designer</p>
                  </div>
                </div>

                {/* Completion Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#6B7280]">Overall Progress</span>
                    <span className="text-xs text-[#111827] font-semibold">78%</span>
                  </div>
                  <div className="w-full h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7dbbff] rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                {/* Profile Sections */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Foundation Overview</span>
                    <span className="text-[#10B981] font-semibold">Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Work History</span>
                    <span className="text-[#10B981] font-semibold">Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Career Direction</span>
                    <span className="text-[#F59E0B] font-semibold">In Progress</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Deeper Insights</span>
                    <span className="text-[#6B7280] font-semibold">Not Started</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Skills & Testing</span>
                    <span className="text-[#F59E0B] font-semibold">In Progress</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Signature Traits</span>
                    <span className="text-[#10B981] font-semibold">Complete</span>
                  </div>
                </div>
              </div>

              {/* Readiness Score */}
              <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="mb-3">
                  <p className="text-sm text-[#6B7280] mb-1">Readiness Score</p>
                </div>

                {/* Central Score */}
                <div className="flex flex-col items-center justify-center mb-3">
                  <p className="text-4xl text-[#111827] font-semibold mb-1">72<span className="text-xl text-[#6B7280]">/100</span></p>
                  <p className="text-xs text-[#6B7280]">Updated today</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-[#f5f5f5] rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-[#7dbbff] rounded-full transition-all" style={{ width: '72%' }} />
                </div>

                {/* Breakdown List */}
                <div className="space-y-2 mb-4 pb-4 border-b border-black/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">Profile depth</span>
                    <span className="text-xs text-[#111827] font-semibold">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">Trait clarity</span>
                    <span className="text-xs text-[#111827] font-semibold">66%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">Evidence signals</span>
                    <span className="text-xs text-[#111827] font-semibold">24 signals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">Skills validated</span>
                    <span className="text-xs text-[#111827] font-semibold">6 assessed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">Direction clarity</span>
                    <span className="text-xs text-[#111827] font-semibold">Clear</span>
                  </div>
                </div>

                {/* Improve Score Section */}
                <div>
                  <p className="text-xs text-[#6B7280] mb-2">Improve Score</p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#7dbbff] mt-1.5 shrink-0" />
                      <p className="text-xs text-[#111827]">Add 1 deeper insight</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#7dbbff] mt-1.5 shrink-0" />
                      <p className="text-xs text-[#111827]">Validate 3 more skills</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Your Profile Snapshot */}
              <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <h3 className="text-base text-[#111827] font-semibold mb-4">Your Profile Snapshot</h3>
                <p className="text-sm text-[#6B7280] mb-6">Who you are at a glance</p>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#7dbbff] flex items-center justify-center">
                    <User className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm text-[#111827] font-semibold">Alex Rivera</p>
                    <p className="text-xs text-[#6B7280]">Product Designer</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#6B7280]">Signals Added</span>
                      <span className="text-xs text-[#111827] font-semibold">24</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/[0.08]">
                    <p className="text-xs text-[#6B7280] mb-3">Top Strengths</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-[#7dbbff]/10 text-[#7dbbff] text-xs font-medium" style={{ borderRadius: '10px' }}>Ownership</span>
                      <span className="px-3 py-1.5 bg-[#50d5ff]/10 text-[#50d5ff] text-xs font-medium" style={{ borderRadius: '10px' }}>Clear Thinking</span>
                      <span className="px-3 py-1.5 bg-[#a8e6ff]/10 text-[#111827] text-xs font-medium" style={{ borderRadius: '10px' }}>Fast Learning</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Skills */}
              <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <h3 className="text-base text-[#111827] font-semibold mb-4">Top Skills</h3>
                <p className="text-sm text-[#6B7280] mb-6">Your strongest abilities</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6F1FD] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111827] font-medium">UX Design</p>
                      <p className="text-xs text-[#6B7280]">Advanced Level</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6F1FD] flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111827] font-medium">Strategy</p>
                      <p className="text-xs text-[#6B7280]">Intermediate Level</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6F1FD] flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111827] font-medium">Research</p>
                      <p className="text-xs text-[#6B7280]">Advanced Level</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6F1FD] flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111827] font-medium">User Testing</p>
                      <p className="text-xs text-[#6B7280]">Intermediate Level</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="mb-6">
                  <h3 className="text-base text-[#111827] font-semibold mb-1">Activity</h3>
                  <p className="text-2xl text-[#111827] font-semibold">156</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-red-500 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 rotate-180" strokeWidth={2} />
                      2.1%
                    </span>
                    <span className="text-xs text-[#6B7280]">vs last week</span>
                  </div>
                </div>

                <p className="text-xs text-[#6B7280] mb-4">Last 7 days</p>

                {/* Simple Line Chart */}
                <div className="h-32">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <polyline
                      points="0,80 50,60 100,70 150,50 200,55 250,40 300,30"
                      fill="none"
                      stroke="#7dbbff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-3 gap-6">
              {/* Career Direction */}
              <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <h3 className="text-base text-[#111827] font-semibold mb-4">Career Direction</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-2">Broad Direction</p>
                    <p className="text-sm text-[#111827] font-semibold">Product Design & Strategy</p>
                  </div>

                  <div className="pt-4 border-t border-black/[0.08]">
                    <p className="text-xs text-[#6B7280] mb-3">Problem Types</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-[#F9F9FA] text-[#111827] text-xs" style={{ borderRadius: '10px' }}>Design Systems</span>
                      <span className="px-3 py-1.5 bg-[#F9F9FA] text-[#111827] text-xs" style={{ borderRadius: '10px' }}>User Research</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/[0.08]">
                    <p className="text-xs text-[#6B7280] mb-3">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-[#F9F9FA] text-[#111827] text-xs" style={{ borderRadius: '10px' }}>SaaS Products</span>
                      <span className="px-3 py-1.5 bg-[#F9F9FA] text-[#111827] text-xs" style={{ borderRadius: '10px' }}>Innovation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <h3 className="text-base text-[#111827] font-semibold mb-4">Experience</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-2">Current Role</p>
                    <p className="text-sm text-[#111827] font-semibold mb-1">Senior Product Designer</p>
                    <p className="text-xs text-[#6B7280]">TechCorp Inc. • 2022–2024</p>
                  </div>

                  <div className="pt-4 border-t border-black/[0.08]">
                    <p className="text-xs text-[#6B7280] mb-2">Experience</p>
                    <p className="text-2xl text-[#111827] font-semibold">6 years</p>
                    <p className="text-xs text-[#6B7280] mt-1">Design & Strategy</p>
                  </div>

                  <div className="pt-4 border-t border-black/[0.08]">
                    <p className="text-xs text-[#6B7280] mb-2">Education</p>
                    <p className="text-sm text-[#111827] font-semibold mb-1">B.A. Interaction Design</p>
                    <p className="text-xs text-[#6B7280]">University of Design • 2018</p>
                  </div>
                </div>
              </div>

              {/* Deeper Insights */}
              <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <h3 className="text-base text-[#111827] font-semibold mb-4">Deeper Insights</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-[#7dbbff]" strokeWidth={2} />
                      <span className="text-sm text-[#111827] font-semibold">Motivation</span>
                    </div>
                    <p className="text-xs text-[#6B7280]">Impact and mastery driven</p>
                  </div>

                  <div className="p-4 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-[#7dbbff]" strokeWidth={2} />
                      <span className="text-sm text-[#111827] font-semibold">Decision-Making</span>
                    </div>
                    <p className="text-xs text-[#6B7280]">Analytical yet intuitive</p>
                  </div>

                  <div className="p-4 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-[#7dbbff]" strokeWidth={2} />
                      <span className="text-sm text-[#111827] font-semibold">Under Pressure</span>
                    </div>
                    <p className="text-xs text-[#6B7280]">Focused and systematic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fourth Row */}
            <div className="grid grid-cols-3 gap-6">
              {/* Companies Interested */}
              <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base text-[#111827] font-semibold mb-1">Companies Interested</h3>
                    <p className="text-xs text-[#6B7280]">Engagement from employers</p>
                  </div>
                  <div className="px-3 py-1.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-sm font-semibold" style={{ borderRadius: '8px' }}>
                    5
                  </div>
                </div>

                {/* Company Cards */}
                <div className="space-y-3 mb-4">
                  {/* Company 1 */}
                  <div className="p-3 bg-[#F9F9FA] border border-black/[0.06] hover:bg-white hover:shadow-sm transition-all" style={{ borderRadius: '12px' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06]">
                        <Building2 className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#111827] font-semibold">TechFlow Inc.</p>
                        <p className="text-xs text-[#6B7280]">Senior Product Designer</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20" style={{ borderRadius: '6px' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span>Interview Scheduled</span>
                    </div>
                  </div>

                  {/* Company 2 */}
                  <div className="p-3 bg-[#F9F9FA] border border-black/[0.06] hover:bg-white hover:shadow-sm transition-all" style={{ borderRadius: '12px' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06]">
                        <Building2 className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#111827] font-semibold">DesignHub</p>
                        <p className="text-xs text-[#6B7280]">Lead UX Designer</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-[#7DBBFF]/10 text-[#7DBBFF] border border-[#7DBBFF]/20" style={{ borderRadius: '6px' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7DBBFF]" />
                      <span>Contacted</span>
                    </div>
                  </div>

                  {/* Company 3 */}
                  <div className="p-3 bg-[#F9F9FA] border border-black/[0.06] hover:bg-white hover:shadow-sm transition-all" style={{ borderRadius: '12px' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06]">
                        <Building2 className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#111827] font-semibold">InnovateCo</p>
                        <p className="text-xs text-[#6B7280]">Product Designer</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20" style={{ borderRadius: '6px' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      <span>Shortlisted</span>
                    </div>
                  </div>
                </div>

                {/* View All Button */}
                <button
                  onClick={() => setActiveSection('companies')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-black/[0.08] text-[#7dbbff] hover:bg-[#7dbbff]/5 transition-all text-sm font-medium"
                  style={{ borderRadius: '10px' }}
                >
                  <span>View All Companies</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}