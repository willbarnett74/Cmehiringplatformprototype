import { useState, useEffect } from 'react';
import { IntakeSection1 } from './applicant-pages/intake/IntakeSection1';
import { IntakeSection2 } from './applicant-pages/intake/IntakeSection2';
import { IntakeSection3 } from './applicant-pages/intake/IntakeSection3';
import { IntakeSection4 } from './applicant-pages/intake/IntakeSection4';
import { IntakeSection5 } from './applicant-pages/intake/IntakeSection5';
import { IntakeSection6 } from './applicant-pages/intake/IntakeSection6';
import { IntakeSection7 } from './applicant-pages/intake/IntakeSection7';
import { IntakeSection8 } from './applicant-pages/intake/IntakeSection8';
import { ProfileBuilderLayout } from './applicant-pages/ProfileBuilderLayout';
import { OpportunitiesPage } from './applicant-pages/OpportunitiesPage';
import { TraitScoresDisplay } from './applicant-pages/TraitScoresDisplay';
import { LayoutDashboard, User, Settings, Compass, ArrowRight, Layers, LogOut } from 'lucide-react';
import { NotificationBell } from './shared/NotificationBell';
import { DashboardContent } from './applicant-pages/DashboardContent';
import { EditBasicInfoPage } from './applicant-pages/EditBasicInfoPage';
import { useUserProfile } from '../contexts/UserProfileContext';
import { computeIntakeScores } from '../utils/intakeScoring';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  ensureApplicantProfile,
  upsertIntakeSectionResponses,
  markApplicantIntakeComplete,
} from '../lib/applicantPersistence';

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
  const { profileData, updateIntakeSection, updateTraitScores, markIntakeComplete } = useUserProfile();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'profileBuilder' | 'companies' | 'settings' | 'intake'>('dashboard');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [cognitiveScore, setCognitiveScore] = useState<number | null>(null);
  const [applicantProfileId, setApplicantProfileId] = useState<string | null>(null);
  const [dbTraitScores, setDbTraitScores] = useState<import('../utils/intakeScoring').DimensionScores | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.id) return;
      const id = await ensureApplicantProfile(supabase, session.user.id);
      setApplicantProfileId(id);
      if (!id) return;
      const { data: scores } = await supabase
        .from('candidate_profiles')
        .select('learning_velocity,ownership_follow_through,resilience,communication_confidence,relational_intelligence,motivational_fit_mastery,motivational_fit_impact,motivational_fit_recognition,motivational_fit_autonomy')
        .eq('id', id)
        .maybeSingle();
      if (scores) setDbTraitScores(scores as import('../utils/intakeScoring').DimensionScores);
    });
  }, []);
  
  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  // Safety check - ensure profileData is available
  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <p className="text-[#6B7280]">Loading...</p>
      </div>
    );
  }
  
  // Calculate step statuses dynamically based on completed sections
  const getStepStatus = (stepId: number): 'active' | 'needsReview' | 'upToDate' => {
    if (profileData?.intakeData?.completedSections?.includes(stepId)) {
      return 'upToDate';
    }
    return 'needsReview';
  };

  const stepStatuses = {
    1: getStepStatus(1),
    2: getStepStatus(2),
    3: getStepStatus(3),
    4: getStepStatus(4),
    5: getStepStatus(5),
    6: getStepStatus(6),
    7: getStepStatus(7),
    8: getStepStatus(8),
  };

  // Profile Builder Steps
  const profileBuilderSteps = [
    { id: 1, label: 'Section 1 – Background Narrative', component: 'IntakeSection1', time: '5–7 min' },
    { id: 2, label: 'Section 2 – How You Work', component: 'IntakeSection2', time: '7–9 min' },
    { id: 3, label: 'Section 3 – How You Think', component: 'IntakeSection3', time: '10–12 min' },
    { id: 4, label: 'Section 4 – How You Handle Difficulty', component: 'IntakeSection4', time: '8–10 min' },
    { id: 5, label: 'Section 5 – How You Relate to Others', component: 'IntakeSection5', time: '8–10 min' },
    { id: 6, label: 'Section 6 – What Drives You', component: 'IntakeSection6', time: '8–10 min' },
    { id: 7, label: 'Section 7 – Career Direction', component: 'IntakeSection7', time: '4–5 min' },
    { id: 8, label: 'Section 8 – Your Profile', component: 'IntakeSection8', time: '3–5 min' },
  ];

  // Handle navigation to Profile Builder
  const handleProfileBuilderClick = (stepId?: number) => {
    setActiveSection('profileBuilder');
    setActiveStep(stepId || 1);
  };

  // FRAME 2: Profile Builder
  if (activeSection === 'profileBuilder') {
    const handleBack = () => {
      if (activeStep === 1) {
        setActiveSection('dashboard');
      } else {
        setActiveStep(activeStep - 1);
      }
    };

    const handleNext = async (data?: Record<string, unknown>) => {
      if (data && data.section) {
        const sectionNum = data.section as number;
        updateIntakeSection(sectionNum, data.responses);

        if (supabase && applicantProfileId) {
          await upsertIntakeSectionResponses(supabase, applicantProfileId, sectionNum, data);
        }

        if (sectionNum === 8) {
          const intakeResponses = {
            section2: profileData.intakeData.section2,
            section3: profileData.intakeData.section3,
            section4: profileData.intakeData.section4,
            section5: profileData.intakeData.section5,
            section6: profileData.intakeData.section6,
          };

          const scores = computeIntakeScores(intakeResponses);
          updateTraitScores(scores);
          markIntakeComplete();

          if (supabase && applicantProfileId) {
            await markApplicantIntakeComplete(supabase, applicantProfileId);
          }
        }
      }

      if (activeStep < 8) {
        setActiveStep(activeStep + 1);
      } else {
        setActiveSection('dashboard');
      }
    };

    // Render the appropriate intake section
    const renderSection = () => {
      switch (activeStep) {
        case 1:
          return <IntakeSection1 onComplete={(data) => void handleNext(data)} />;
        case 2:
          return <IntakeSection2 onComplete={(data) => void handleNext(data)} />;
        case 3:
          return <IntakeSection3 onComplete={(data) => void handleNext(data)} />;
        case 4:
          return <IntakeSection4 onComplete={(data) => void handleNext(data)} />;
        case 5:
          return <IntakeSection5 onComplete={(data) => void handleNext(data)} />;
        case 6:
          return <IntakeSection6 onComplete={(data) => void handleNext(data)} />;
        case 7:
          return <IntakeSection7 onComplete={(data) => void handleNext(data)} />;
        case 8:
          return <IntakeSection8 onComplete={(data) => void handleNext(data)} />;
        default:
          return <IntakeSection1 onComplete={(data) => void handleNext(data)} />;
      }
    };

    return (
      <ProfileBuilderLayout
        currentStep={activeStep}
        stepStatuses={stepStatuses}
        onStepChange={(stepId) => setActiveStep(stepId)}
        onBack={handleBack}
        onNext={() => handleNext()}
      >
        {renderSection()}
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
                  <Layers className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Opportunities</span>
                </button>

                <button
                  onClick={() => setActiveSection('settings')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all"
                  style={{ borderRadius: '10px' }}
                >
                  <Settings className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Settings</span>
                </button>

                <button
                  onClick={() => void handleSignOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-red-50 hover:text-red-500 transition-all mt-2"
                  style={{ borderRadius: '10px' }}
                >
                  <LogOut className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Sign out</span>
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
              <OpportunitiesPage />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // FRAME 4: Settings / Edit Basic Info
  if (activeSection === 'settings') {
    return (
      <div className="relative bg-[#fafafa] min-h-screen">
        <div className="relative flex min-h-screen">
          {/* Left Sidebar Navigation */}
          <aside className="w-[240px] bg-white border-r border-black/[0.08] sticky top-0 h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#7dbbff] flex items-center justify-center shrink-0" style={{ borderRadius: '12px' }}>
                  <Compass className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className="text-lg text-[#111827] font-semibold">CMe</span>
              </div>
              <div className="mb-4">
                <p className="text-xs text-[#6B7280] uppercase tracking-wider px-3">Menu</p>
              </div>
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all"
                  style={{ borderRadius: '10px' }}
                >
                  <Layers className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Opportunities</span>
                </button>
                <button
                  onClick={() => setActiveSection('settings')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#7dbbff]/10 text-[#7dbbff] transition-all"
                  style={{ borderRadius: '10px' }}
                >
                  <Settings className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Settings</span>
                </button>

                <button
                  onClick={() => void handleSignOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-red-50 hover:text-red-500 transition-all mt-2"
                  style={{ borderRadius: '10px' }}
                >
                  <LogOut className="w-5 h-5" strokeWidth={2} />
                  <span className="text-sm font-medium">Sign out</span>
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
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="p-8">
              <EditBasicInfoPage />
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
                <Layers className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Opportunities</span>
              </button>

              <button
                onClick={() => setActiveSection('settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827] transition-all"
                style={{ borderRadius: '10px' }}
              >
                <Settings className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Settings</span>
              </button>

              <button
                onClick={() => void handleSignOut()}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-red-50 hover:text-red-500 transition-all mt-2"
                style={{ borderRadius: '10px' }}
              >
                <LogOut className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium">Sign out</span>
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

                <NotificationBell
                  userId="candidate-1"
                  onNavigate={(url) => {
                    if (url === '#opportunities') setActiveSection('companies');
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-8">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-2xl text-[#111827] font-semibold">Dashboard</h1>
            </div>

            <DashboardContent onProfileBuilderClick={handleProfileBuilderClick} />
            {(dbTraitScores || profileData.traitScores) && (
              <div className="mt-6">
                <TraitScoresDisplay scores={dbTraitScores ?? profileData.traitScores} showAll />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}