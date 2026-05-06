import { lazy, Suspense, useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { OverviewScreen } from './components/OverviewScreen';
import { Sparkles, Palette } from 'lucide-react';
import { consumeRestoreTabFromSession } from './lib/postSignInNavigation';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const ApplicantScreen = lazy(() =>
  import('./components/ApplicantScreen').then((module) => ({ default: module.ApplicantScreen })),
);
const EmployerScreen = lazy(() =>
  import('./components/EmployerScreen').then((module) => ({ default: module.EmployerScreen })),
);
const DesignSystem = lazy(() =>
  import('./components/DesignSystem').then((module) => ({ default: module.DesignSystem })),
);
const AssessmentLink = lazy(() =>
  import('./pages/AssessmentLink').then((module) => ({ default: module.AssessmentLink })),
);
const PulseCheckForm = lazy(() =>
  import('./pages/PulseCheckForm').then((module) => ({ default: module.PulseCheckForm })),
);

type Tab = 'overview' | 'applicant' | 'employer' | 'design' | 'assessment' | 'pulsecheck';

export default function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const restored = consumeRestoreTabFromSession();
    if (restored) setActiveTab(restored);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthChecked(true);
      return;
    }
    void supabase.auth.getSession().then(({ data: { session: next } }) => {
      setSession(next);
      setAuthChecked(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authChecked || !isSupabaseConfigured || !supabase) return;
    if (session) return;
    if (activeTab !== 'applicant' && activeTab !== 'employer') return;
    void navigate('/onboarding/sign-in', {
      replace: true,
      state: activeTab === 'employer' ? { restoreTab: 'employer' as const } : undefined,
    });
  }, [authChecked, session, activeTab, navigate]);

  const handleNavigateToPath = (tab: 'applicant' | 'employer' | 'assessment') => {
    if (tab === 'assessment') {
      setActiveTab('assessment');
      return;
    }
    if (tab === 'applicant') {
      void navigate('/onboarding/sign-in');
      return;
    }
    if (tab === 'employer') {
      void navigate('/onboarding/sign-in', { state: { restoreTab: 'employer' } });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cme-marketing-shell-bg)] text-white">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-[var(--cme-marketing-shell-bg)]/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                  CMe
                </h1>
              </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'overview'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'overview' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Overview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('applicant')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'applicant'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'applicant' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Applicant View</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('employer')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'employer'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'employer' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Employer View</span>
                  </button>
                  <button
                    onClick={() => handleNavigateToPath('assessment')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'assessment'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'assessment' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Assessment Link</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pulsecheck')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'pulsecheck'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'pulsecheck' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Pulse Check</span>
                  </button>
                </div>
              </div>
              <div>
                <button
                  onClick={() => setActiveTab('design')}
                  className={`flex items-center gap-2 px-4 py-2 transition-all relative ${
                    activeTab === 'design'
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {activeTab === 'design' && (
                    <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                  )}
                  <Palette className="w-4 h-4 relative" strokeWidth={1.5} />
                  <span className="relative text-sm">Design System</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Screen Content */}
        <main>
          <Suspense fallback={<div className="min-h-[420px] bg-[var(--cme-onboarding-canvas)]" />}>
            {activeTab === 'overview' && <OverviewScreen onNavigate={handleNavigateToPath} />}
            {activeTab === 'applicant' &&
              (!isSupabaseConfigured || !supabase ? (
                <div className="flex min-h-[420px] items-center justify-center bg-[var(--cme-onboarding-canvas)] px-4 text-center text-sm text-[var(--cme-onboarding-muted)]">
                  Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use Applicant View.
                </div>
              ) : !authChecked ? (
                <div className="flex min-h-[420px] items-center justify-center bg-[var(--cme-onboarding-canvas)] text-sm text-[var(--cme-onboarding-muted)]">
                  Checking session…
                </div>
              ) : session ? (
                <ApplicantScreen />
              ) : null)}
            {activeTab === 'employer' &&
              (!isSupabaseConfigured || !supabase ? (
                <div className="flex min-h-[420px] items-center justify-center bg-[var(--cme-onboarding-canvas)] px-4 text-center text-sm text-[var(--cme-onboarding-muted)]">
                  Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use Employer View.
                </div>
              ) : !authChecked ? (
                <div className="flex min-h-[420px] items-center justify-center bg-[var(--cme-onboarding-canvas)] text-sm text-[var(--cme-onboarding-muted)]">
                  Checking session…
                </div>
              ) : session ? (
                <EmployerScreen />
              ) : null)}
            {activeTab === 'design' && <DesignSystem />}
            {activeTab === 'assessment' && <AssessmentLink />}
            {activeTab === 'pulsecheck' && <PulseCheckForm />}
          </Suspense>
        </main>
    </div>
  );
}