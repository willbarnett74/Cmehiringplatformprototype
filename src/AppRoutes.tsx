import { useEffect, useState, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import App from './App';
import { LoginScreen } from './components/LoginScreen';
import { ApplicantScreen } from './components/ApplicantScreen';
import { OnboardingLayout, PROFILE_ONBOARDING_QUERY_ROOT } from './onboarding/OnboardingLayout';
import { OnboardingStepPage } from './onboarding/OnboardingStepPage';
import { fetchProfileOnboardingMeta } from './onboarding/profileOnboardingMeta';
import { pathForOnboardingDbStep } from './lib/onboardingRouting';
import { navigateAfterSignIn, type SignInLocationState } from './lib/postSignInNavigation';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

function FullScreenLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#6B7280]">
      Loading…
    </div>
  );
}

function LegalPlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#fafafa] p-8 text-[#111827]">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-[#6B7280]">Placeholder — replace with your legal content.</p>
    </div>
  );
}

export function RequireAuth() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setReady(true);
      setAuthed(false);
      return;
    }
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(Boolean(session));
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <FullScreenLoading />;
  }
  if (!isSupabaseConfigured || !supabase || !authed) {
    return <Navigate to="/onboarding/sign-in" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireOnboardingComplete() {
  const [authReady, setAuthReady] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthReady(true);
      setSessionUserId(null);
      return;
    }
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: [...PROFILE_ONBOARDING_QUERY_ROOT, sessionUserId ?? ''],
    enabled: Boolean(isSupabaseConfigured && supabase && authReady && sessionUserId),
    retry: false,
    queryFn: async () => {
      if (!supabase || !sessionUserId) throw new Error('Not authenticated');
      return fetchProfileOnboardingMeta(supabase, sessionUserId);
    },
  });

  if (!isSupabaseConfigured || !supabase) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }

  if (!authReady) {
    return <FullScreenLoading />;
  }

  if (!sessionUserId) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }

  if (isLoading) {
    return <FullScreenLoading />;
  }
  if (isError || !data) {
    return <Navigate to="/onboarding/sign-in" replace />;
  }
  if (!data.onboarding_completed_at) {
    return <Navigate to={pathForOnboardingDbStep(data.onboarding_step)} replace />;
  }
  return <Outlet />;
}

function OnboardingSignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SignInLocationState | null;
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const postAuthRedirectStarted = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setReady(true);
      return;
    }
    void supabase.auth.getSession().then(({ data: { session: next } }) => {
      setSession(next);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready || !session || !supabase || postAuthRedirectStarted.current) return;
    postAuthRedirectStarted.current = true;
    void navigateAfterSignIn(navigate, state, supabase);
  }, [ready, session, navigate, state]);

  if (!ready || session) {
    return <FullScreenLoading />;
  }

  return (
    <LoginScreen
      onAuthenticated={async () => {
        if (!isSupabaseConfigured || !supabase) return;
        await navigateAfterSignIn(navigate, state, supabase);
      }}
    />
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/legal/terms" element={<LegalPlaceholder title="Terms" />} />
      <Route path="/legal/privacy" element={<LegalPlaceholder title="Privacy policy" />} />
      <Route path="/onboarding/sign-in" element={<OnboardingSignInPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<OnboardingLayout />}>
          <Route path="welcome" element={<OnboardingStepPage uiStep="welcome" />} />
          <Route path="basics" element={<OnboardingStepPage uiStep="details" />} />
          <Route path="how-it-works" element={<OnboardingStepPage uiStep="how-it-works" />} />
        </Route>
        <Route element={<RequireOnboardingComplete />}>
          <Route path="/profile-builder" element={<ApplicantScreen entry="profileBuilderOnly" />} />
        </Route>
      </Route>
      <Route path="*" element={<App />} />
    </Routes>
  );
}
