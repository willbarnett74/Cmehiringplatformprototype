import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { OverviewScreen } from './components/OverviewScreen';
import { APPLICANT_PORTAL_PATH } from './lib/onboardingRouting';
import { persistRestoreTabToSession } from './lib/postSignInNavigation';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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

  const goApplicantPortal = () => {
    if (!isSupabaseConfigured || !supabase) {
      void navigate('/onboarding/sign-in');
      return;
    }
    if (!authChecked) return;
    if (!session) {
      void navigate('/onboarding/sign-in');
      return;
    }
    void navigate(APPLICANT_PORTAL_PATH);
  };

  const handleNavigateToPath = (tab: 'applicant' | 'employer' | 'assessment') => {
    if (tab === 'assessment') {
      void navigate('/assessment-link');
      return;
    }
    if (tab === 'applicant') {
      goApplicantPortal();
      return;
    }
    if (tab === 'employer') {
      persistRestoreTabToSession('employer');
      void navigate('/onboarding/sign-in', { state: { restoreTab: 'employer', signupRole: 'employer', initialMode: 'signup' } });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cme-marketing-shell-bg)]">
      <OverviewScreen onNavigate={handleNavigateToPath} />
    </div>
  );
}
