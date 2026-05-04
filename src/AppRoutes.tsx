import { useEffect, useState, type ReactNode } from 'react';
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
import { OnboardingLayout, profileOnboardingQueryKey } from './onboarding/OnboardingLayout';
import { OnboardingStepPage } from './onboarding/OnboardingStepPage';
import { pathForOnboardingDbStep, type OnboardingStepDb } from './lib/onboardingRouting';
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
  const { data, isLoading, isError } = useQuery({
    queryKey: profileOnboardingQueryKey,
    enabled: Boolean(isSupabaseConfigured && supabase),
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;
      const { data: row, error } = await supabase
        .from('profiles')
        .select('onboarding_step, onboarding_completed_at')
        .eq('id', session.user.id)
        .single();
      if (error) throw error;
      return {
        onboarding_step: row.onboarding_step as OnboardingStepDb,
        onboarding_completed_at: row.onboarding_completed_at as string | null,
      };
    },
  });

  if (!isSupabaseConfigured || !supabase) {
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

export function GuestOnly({ children }: { children: ReactNode }) {
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
  if (authed) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function OnboardingSignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SignInLocationState | null;

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
      <Route
        path="/onboarding/sign-in"
        element={
          <GuestOnly>
            <OnboardingSignInPage />
          </GuestOnly>
        }
      />
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
