import { useState, useEffect, useCallback, useRef } from 'react';
import { IntakeSection1 } from './applicant-pages/intake/IntakeSection1';
import { IntakeSection2 } from './applicant-pages/intake/IntakeSection2';
import { IntakeSection3 } from './applicant-pages/intake/IntakeSection3';
import { IntakeSection4 } from './applicant-pages/intake/IntakeSection4';
import { IntakeSection5 } from './applicant-pages/intake/IntakeSection5';
import { IntakeSection6 } from './applicant-pages/intake/IntakeSection6';
import { IntakeSection7 } from './applicant-pages/intake/IntakeSection7';
import { IntakeSection8 } from './applicant-pages/intake/IntakeSection8';
import { ProfileBuilderLayout } from './applicant-pages/ProfileBuilderLayout';
import {
  ApplicantPipelinePanel,
  ApplicantExploreIndustriesPanel,
  ApplicantMessagingPanel,
  exploreIndustriesMatchedCount,
  applicantMessagingUnreadMockCount,
} from './applicant-pages/OpportunitiesPage';
import { applicantPipelineMockData } from '../lib/applicantOpportunitiesMock';
import { LayoutDashboard, User, Settings, Compass, Layers, LogOut, X, Globe, MessageSquare } from 'lucide-react';
import { NotificationBell } from './shared/NotificationBell';
import { DashboardContent } from './applicant-pages/DashboardContent';
import { EditBasicInfoPage } from './applicant-pages/EditBasicInfoPage';
import { ApplicantWelcomePage } from './applicant-pages/ApplicantWelcomePage';
import { useUserProfile } from '../contexts/UserProfileContext';
import { computeIntakeScores, computeMotivationalFitAverage } from '../utils/intakeScoring';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  ensureApplicantProfile,
  loadApplicantProfileFromSupabase,
  upsertIntakeSectionResponses,
  markApplicantIntakeComplete,
  syncSection7ToCandidateProfile,
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
  const { profileData, updateIntakeSection, updateTraitScores, markIntakeComplete, replaceProfileData } =
    useUserProfile();
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'profileBuilder' | 'pipeline' | 'explore' | 'messaging' | 'settings' | 'intake'
  >('dashboard');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [applicantProfileId, setApplicantProfileId] = useState<string | null>(null);
  const [dbTraitScores, setDbTraitScores] = useState<import('../utils/intakeScoring').DimensionScores | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showEditBasicInfo, setShowEditBasicInfo] = useState(false);
  const [messagingFocusCompany, setMessagingFocusCompany] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [sidebarSituation, setSidebarSituation] = useState<string>('');
  const [dashboardProfileRefreshKey, setDashboardProfileRefreshKey] = useState(0);

  const refreshApplicantShell = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !userId) return;
    const { data: profileRow } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle();
    setUserName(typeof profileRow?.full_name === 'string' ? profileRow.full_name : '');
    if (!applicantProfileId) return;
    const { data: sitRow } = await supabase
      .from('candidate_profiles')
      .select('current_situation')
      .eq('id', applicantProfileId)
      .maybeSingle();
    setSidebarSituation(
      typeof sitRow?.current_situation === 'string' ? sitRow.current_situation : '',
    );
  }, [userId, applicantProfileId]);

  const handleBasicInfoSaved = useCallback(() => {
    void refreshApplicantShell();
    setDashboardProfileRefreshKey((k) => k + 1);
  }, [refreshApplicantShell]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.id) return;
      const uid = session.user.id;
      setUserId(uid);
      const { data: profileRow } = await supabase.from('profiles').select('full_name').eq('id', uid).maybeSingle();
      setUserName(typeof profileRow?.full_name === 'string' ? profileRow.full_name : '');
      const id = await ensureApplicantProfile(supabase, uid);
      setApplicantProfileId(id);
      if (!id) return;
      const { data: sitRow } = await supabase
        .from('candidate_profiles')
        .select('current_situation')
        .eq('id', id)
        .maybeSingle();
      setSidebarSituation(
        typeof sitRow?.current_situation === 'string' ? sitRow.current_situation : '',
      );
      const loaded = await loadApplicantProfileFromSupabase(supabase, id);
      if (loaded) {
        replaceProfileData(loaded.profile);
        setDbTraitScores(loaded.traitScores);
        if (!loaded.profile.intakeData.isComplete && !localStorage.getItem(`cme_welcomed_${uid}`)) {
          setShowWelcome(true);
        }
      }
    });
  }, []);
  
  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  // First-login welcome flow
  if (showWelcome && userId && applicantProfileId) {
    return (
      <ApplicantWelcomePage
        userId={userId}
        profileId={applicantProfileId}
        onComplete={() => setShowWelcome(false)}
      />
    );
  }

  // Safety check - ensure profileData is available
  if (!profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] font-dashboard antialiased">
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

  // Handle navigation to Profile Builder
  const handleProfileBuilderClick = (stepId?: number) => {
    setActiveSection('profileBuilder');
    setActiveStep(stepId || 1);
  };

  const profileBuilderSubmitRef = useRef<(() => void) | null>(null);

  const handleProfileBuilderBack = () => {
    if (activeStep === 1) {
      setActiveSection('dashboard');
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleProfileBuilderNext = async (data?: Record<string, unknown>) => {
    if (data && data.section) {
      const sectionNum = data.section as number;
      updateIntakeSection(sectionNum, data.responses);

      if (supabase && applicantProfileId) {
        await upsertIntakeSectionResponses(supabase, applicantProfileId, sectionNum, data);
      }

      if (sectionNum === 7 && supabase && applicantProfileId && data.responses) {
        await syncSection7ToCandidateProfile(
          supabase,
          applicantProfileId,
          data.responses as Record<string, unknown>,
        );
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
        if (supabase && applicantProfileId) {
          const motivational_fit = computeMotivationalFitAverage(scores);
          await supabase
            .from('candidate_profiles')
            .update({
              learning_velocity: scores.learning_velocity,
              ownership_follow_through: scores.ownership_follow_through,
              resilience: scores.resilience,
              communication_confidence: scores.communication_confidence,
              relational_intelligence: scores.relational_intelligence,
              motivational_fit_mastery: scores.motivational_fit_mastery,
              motivational_fit_impact: scores.motivational_fit_impact,
              motivational_fit_recognition: scores.motivational_fit_recognition,
              motivational_fit_autonomy: scores.motivational_fit_autonomy,
              motivational_fit,
              updated_at: new Date().toISOString(),
            })
            .eq('id', applicantProfileId);
        }
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

  const renderProfileBuilderSection = () => {
    switch (activeStep) {
      case 1: {
        const s1 = profileData.intakeData.section1 as
          | { S1Q1?: { narrative?: string }; S1Q2?: { narrative?: string } }
          | undefined;
        return (
          <IntakeSection1
            layoutVariant="handoff"
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
            initialData={{
              S1Q1: s1?.S1Q1?.narrative != null ? { narrative: s1.S1Q1.narrative } : undefined,
              S1Q2: s1?.S1Q2?.narrative != null ? { narrative: s1.S1Q2.narrative } : undefined,
            }}
          />
        );
      }
      case 2:
        return (
          <IntakeSection2
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
          />
        );
      case 3:
        return (
          <IntakeSection3
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
          />
        );
      case 4:
        return (
          <IntakeSection4
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
          />
        );
      case 5:
        return (
          <IntakeSection5
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
          />
        );
      case 6:
        return (
          <IntakeSection6
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
          />
        );
      case 7:
        return (
          <IntakeSection7
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
          />
        );
      case 8:
        return (
          <IntakeSection8
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
          />
        );
      default: {
        const s1 = profileData.intakeData.section1 as
          | { S1Q1?: { narrative?: string }; S1Q2?: { narrative?: string } }
          | undefined;
        return (
          <IntakeSection1
            layoutVariant="handoff"
            hideFooterButton
            submitRef={profileBuilderSubmitRef}
            onComplete={(data) => void handleProfileBuilderNext(data)}
            initialData={{
              S1Q1: s1?.S1Q1?.narrative != null ? { narrative: s1.S1Q1.narrative } : undefined,
              S1Q2: s1?.S1Q2?.narrative != null ? { narrative: s1.S1Q2.narrative } : undefined,
            }}
          />
        );
      }
    }
  };

  const dashboardMonthYear = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const headerInitials = userName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const sidebarInitials = headerInitials || '—';

  const portalTopBar =
    activeSection === 'dashboard'
      ? { title: 'Dashboard', subtitle: dashboardMonthYear }
      : activeSection === 'profileBuilder'
        ? { title: 'Profile Builder', subtitle: 'Refine anytime' }
      : activeSection === 'pipeline'
        ? { title: 'Pipeline', subtitle: `${applicantPipelineMockData.length} active` }
        : activeSection === 'explore'
          ? { title: 'Explore Industries', subtitle: `${exploreIndustriesMatchedCount} matched` }
          : activeSection === 'messaging'
            ? {
                title: 'Messaging',
                subtitle:
                  applicantMessagingUnreadMockCount > 0
                    ? `${applicantMessagingUnreadMockCount} unread`
                    : 'All caught up',
              }
            : activeSection === 'settings'
              ? { title: 'Settings', subtitle: undefined as string | undefined }
              : { title: 'Dashboard', subtitle: dashboardMonthYear };

  const NavBtn = ({
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
      style={{
        borderRadius: 7,
        background: active ? 'rgba(125,187,255,0.12)' : 'transparent',
      }}
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
        className="text-[13px]"
        style={{
          fontWeight: active ? 500 : 400,
          color: active ? '#7dbbff' : 'rgba(255,255,255,0.82)',
        }}
      >
        {label}
      </span>
    </button>
  );

  // FRAME 1: Dashboard
  return (
    <div className="relative min-h-screen bg-[#fafafa] font-dashboard text-[#111827] antialiased">
      {showEditBasicInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10"
          onClick={() => setShowEditBasicInfo(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-3xl bg-white p-8 shadow-xl"
            style={{ borderRadius: 16 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
          >
            <button
              type="button"
              onClick={() => setShowEditBasicInfo(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-[#6B7280] hover:bg-[#F3F4F6]"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <EditBasicInfoPage onSaved={handleBasicInfoSaved} />
          </div>
        </div>
      )}

      <div className="relative flex min-h-screen">
        <aside
          className="sticky top-0 flex h-screen w-[224px] shrink-0 flex-col overflow-y-auto border-r border-white/[0.05] bg-[#030213]"
        >
          <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
            <div className="mb-[30px] flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#7dbbff]"
                style={{ borderRadius: 7 }}
              >
                <Compass className="h-[15px] w-[15px] text-white" strokeWidth={2} />
              </div>
              <span
                className="text-[15px] font-semibold tracking-[-0.01em] text-white"
              >
                CMe
              </span>
            </div>

            <p
              className="mb-1.5 px-2.5 text-[10px] uppercase tracking-[0.1em] text-white/35"
            >
              MENU
            </p>
            <nav className="flex flex-col gap-0.5">
              <NavBtn
                active={activeSection === 'dashboard'}
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => setActiveSection('dashboard')}
              />
              <NavBtn
                active={activeSection === 'profileBuilder'}
                icon={User}
                label="Profile Builder"
                onClick={() => handleProfileBuilderClick()}
              />
              <NavBtn
                active={activeSection === 'pipeline'}
                icon={Layers}
                label="Pipeline"
                onClick={() => setActiveSection('pipeline')}
              />
              <NavBtn
                active={activeSection === 'explore'}
                icon={Globe}
                label="Explore Industries"
                onClick={() => setActiveSection('explore')}
              />
              <NavBtn
                active={activeSection === 'messaging'}
                icon={MessageSquare}
                label="Messaging"
                onClick={() => {
                  setMessagingFocusCompany(null);
                  setActiveSection('messaging');
                }}
              />
              <NavBtn
                active={activeSection === 'settings'}
                icon={Settings}
                label="Settings"
                onClick={() => setActiveSection('settings')}
              />
            </nav>

            <div className="mt-auto border-t border-white/[0.05] pt-4">
              <div className="mb-3 flex items-center gap-2.5 px-1">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7dbbff] text-[10px] font-semibold text-white">
                  {sidebarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white/80">{userName || 'Account'}</p>
                  <p className="truncate text-[10.5px] text-white/35">{sidebarSituation || ' '}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex w-full items-center gap-2 px-1 py-1.5 text-white/35 transition-colors hover:text-white/55"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span className="text-xs">Sign out</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-[#fafafa]">
          <div
            className="sticky top-0 z-10 flex h-[52px] items-center justify-between border-b border-black/[0.08] bg-[#fafafa] px-9"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-medium text-[#111827]">{portalTopBar.title}</span>
              {portalTopBar.subtitle ? (
                <>
                  <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#D1D5DB]" />
                  <span className="text-[12.5px] text-[#9CA3AF]">{portalTopBar.subtitle}</span>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-4">
              {profileData.intakeData.isComplete ? (
                <div
                  className="flex items-center gap-2 border border-[rgba(16,185,129,0.15)] px-2.5 py-1"
                  style={{ borderRadius: 4, background: 'rgba(16,185,129,0.05)' }}
                >
                  <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#10B981]" />
                  <span className="text-[11px] font-medium text-[#10B981]">Profile complete</span>
                </div>
              ) : null}
              <NotificationBell
                userId={userId ?? ''}
                onNavigate={(url) => {
                  if (url === '#opportunities') setActiveSection('pipeline');
                }}
              />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7dbbff] text-[10px] font-semibold text-white">
                  {headerInitials || <User className="h-3.5 w-3.5 text-white" strokeWidth={2} />}
                </div>
                <span className="max-w-[140px] truncate text-[12.5px] font-medium text-[#111827]">
                  {userName || 'Account'}
                </span>
              </div>
            </div>
          </div>

          {activeSection === 'profileBuilder' ? (
            <ProfileBuilderLayout
              currentStep={activeStep}
              stepStatuses={stepStatuses}
              onStepChange={(stepId) => setActiveStep(stepId)}
              onBack={handleProfileBuilderBack}
              onFooterContinue={() => profileBuilderSubmitRef.current?.()}
            >
              {renderProfileBuilderSection()}
            </ProfileBuilderLayout>
          ) : (
          <div className="px-9 pb-12 pt-7">
            {activeSection === 'dashboard' ? (
              <DashboardContent
                onProfileBuilderClick={handleProfileBuilderClick}
                onEditProfile={() => setShowEditBasicInfo(true)}
                onViewAllPipeline={() => setActiveSection('pipeline')}
                traitScores={dbTraitScores ?? profileData.trait_scores}
                intakeComplete={profileData.intakeData.isComplete}
                intakeSection7={profileData.intakeData.section7 as Record<string, unknown> | undefined}
                profileRefreshKey={dashboardProfileRefreshKey}
                section1={(() => {
                  const s1 = profileData.intakeData.section1 as
                    | { S1Q1?: { narrative?: string }; S1Q2?: { narrative?: string } }
                    | undefined;
                  if (!s1) return null;
                  return {
                    backgroundNarrative: s1.S1Q1?.narrative,
                    proudMoment: s1.S1Q2?.narrative,
                  };
                })()}
              />
            ) : null}
            {activeSection === 'pipeline' ? (
              <ApplicantPipelinePanel
                onRequestSwitchToMessaging={(company) => {
                  setMessagingFocusCompany(company);
                  setActiveSection('messaging');
                }}
              />
            ) : null}
            {activeSection === 'explore' ? <ApplicantExploreIndustriesPanel /> : null}
            {activeSection === 'messaging' ? (
              <ApplicantMessagingPanel focusCompanyName={messagingFocusCompany} />
            ) : null}
            {activeSection === 'settings' ? (
              <div>
                <div className="mb-6 border-b border-black/[0.08] pb-6">
                  <h1 className="mb-1.5 text-xl font-semibold tracking-[-0.02em] text-[#111827]">Account Settings</h1>
                  <p className="text-[13px] text-[#9CA3AF]">Manage your account details and preferences</p>
                </div>
                <EditBasicInfoPage onSaved={handleBasicInfoSaved} showPreferencesSection />
              </div>
            ) : null}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}