import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { Check, Compass } from 'lucide-react';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export type LoginScreenProps = {
  onAuthenticated?: () => void | Promise<void>;
  initialMode?: 'signin' | 'signup';
  signupRole?: 'candidate' | 'employer';
};

type Mode = 'signin' | 'signup';

const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const splitCardGridStyle: CSSProperties = {
  gridTemplateRows: 'minmax(0, 1fr)',
  boxSizing: 'border-box',
  height: 'clamp(640px, 78vh, 960px)',
  minHeight: 'clamp(640px, 78vh, 960px)',
  maxHeight: 'clamp(640px, 78vh, 960px)',
  width: '100%',
  maxWidth: 'min(1680px, calc(100vw - clamp(32px, 5vw, 96px)))',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '20px',
};

const buttonSurfaceStyle: CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: '10px',
  fontSize: '13px',
  lineHeight: '1.5',
};

const inputStyle: CSSProperties = {
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '10px',
  fontSize: '13px',
  lineHeight: '1.5',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  lineHeight: '1.5',
};

function GoogleLogo() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    </span>
  );
}

export function LoginScreen({ onAuthenticated, initialMode = 'signin', signupRole = 'candidate' }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (!forgotOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [forgotOpen]);

  const openForgotPassword = () => {
    if (loading || oauthBusy) return;
    setForgotEmail(email.trim());
    setForgotError('');
    setForgotSent(false);
    setForgotOpen(true);
  };

  const closeForgotPassword = () => {
    if (forgotBusy) return;
    setForgotOpen(false);
    setForgotError('');
    setForgotSent(false);
  };

  const submitForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setForgotError('');
    if (!isSupabaseConfigured || !supabase) {
      setForgotError('Sign in is not configured yet. Please contact support.');
      return;
    }
    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotBusy(true);
    try {
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });
      if (resetErr) {
        setForgotError(resetErr.message);
      } else {
        setForgotSent(true);
      }
    } finally {
      setForgotBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    if (!isSupabaseConfigured || !supabase) {
      setError('Sign in is not configured yet. Please contact support.');
      return;
    }
    trackEvent(AnalyticsEvents.sign_in_started, { method: 'google' });
    setOauthBusy(true);
    const redirectTo = `${window.location.origin}/onboarding/sign-in`;
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (oauthErr) {
      setError(oauthErr.message);
      setOauthBusy(false);
    }
  };

  const toggleMode = () => {
    if (loading || oauthBusy) return;
    setMode((current) => (current === 'signin' ? 'signup' : 'signin'));
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      setError('Sign in is not configured yet. Please contact support.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        trackEvent(AnalyticsEvents.sign_in_started, { method: 'password' });
        const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signErr) {
          setError(signErr.message);
        } else {
          await Promise.resolve(onAuthenticated?.());
        }
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        trackEvent(AnalyticsEvents.sign_in_started, { method: 'password_signup' });
        const roleMeta = signupRole === 'employer' ? 'employer' : 'candidate';
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role: roleMeta } },
        });
        if (signUpErr) {
          setError(signUpErr.message);
        } else if (data.session) {
          await Promise.resolve(onAuthenticated?.());
        } else {
          setConfirmSent(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (confirmSent) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[var(--cme-onboarding-canvas)] text-[#111827]"
        style={{ fontFamily: systemFont, padding: 'clamp(16px, 2.5vw, 48px)' }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="mx-auto mb-6 flex h-12 w-12 items-center justify-center bg-[#7dbbff]"
            style={{ borderRadius: '14px' }}
          >
            <Compass className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-[#111827]">Check your email</h1>
          <p className="text-sm text-[#6B7280]">
            We sent a confirmation link to{' '}
            <span className="font-medium text-[#111827]">{email}</span>. Click it to activate your account, then
            come back to sign in.
          </p>
          <button
            type="button"
            onClick={() => {
              setConfirmSent(false);
              setMode('signin');
            }}
            className="mt-6 text-sm text-[#7dbbff] hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const benefits = [
    'Six trait dimensions, scored from a 45-minute guided flow.',
    'Match scoring weighted to your role, not generic benchmarks.',
    'Post-hire performance data feeds back into smarter hiring.',
  ];

  return (
    <>
      <div
        className="flex min-h-screen items-center justify-center bg-[var(--cme-onboarding-canvas)] text-[#111827]"
        style={{ fontFamily: systemFont, padding: 'clamp(16px, 2.5vw, 48px)' }}
      >
        <div
          className="grid w-full grid-cols-1 overflow-hidden bg-white md:grid-cols-2"
          style={splitCardGridStyle}
        >
        <section
          className="relative flex h-full min-h-[320px] min-w-0 flex-1 flex-col justify-between overflow-hidden text-white md:min-h-0"
          style={{
            padding: 'clamp(32px, 4.5vw, 96px)',
            background: 'linear-gradient(135deg, #0F1419 0%, #1a2332 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute"
            style={{
              top: '-80px',
              right: '-80px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(125,187,255,0.18) 0%, rgba(125,187,255,0) 70%)',
            }}
          />
          <div
            className="pointer-events-none absolute"
            style={{
              bottom: '-60px',
              left: '-60px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(125,187,255,0.10) 0%, rgba(125,187,255,0) 70%)',
            }}
          />

          <div className="relative">
            <div className="flex items-center" style={{ gap: '10px', marginBottom: '56px' }}>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#7DBBFF]"
                style={{ borderRadius: '8px' }}
              >
                <Compass className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <span className="font-medium" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                CMe
              </span>
            </div>

            <h1
              className="mb-4 font-medium tracking-tight text-white"
              style={{
                fontSize: 'clamp(1.5rem, 1rem + 1.75vw, 2.75rem)',
                lineHeight: '1.25',
              }}
            >
              Hire for who they are,
              <br />
              <span style={{ color: '#7DBBFF' }}>not just what&apos;s on their CV.</span>
            </h1>

            <p
              className="mb-8"
              style={{
                maxWidth: 'min(480px, 100%)',
                fontSize: 'clamp(13px, 0.8rem + 0.45vw, 17px)',
                lineHeight: '1.65',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              CMe matches candidates to roles on traits and behaviours — then closes the loop with how they
              actually perform.
            </p>

            <div className="flex flex-col max-md:mb-8" style={{ maxWidth: 'min(440px, 100%)', gap: '14px' }}>
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-[#7DBBFF]"
                    style={{
                      marginTop: '1px',
                      borderRadius: '6px',
                      background: 'rgba(125,187,255,0.15)',
                    }}
                  >
                    <Check className="h-3 w-3" strokeWidth={2} />
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(12px, 0.72rem + 0.35vw, 15px)',
                      lineHeight: '1.55',
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {benefit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative max-md:mt-6"
            style={{ fontSize: '11px', lineHeight: '1.5', color: 'rgba(255,255,255,0.4)' }}
          >
            © 2026 CMe. Built in Aotearoa New Zealand.
          </div>
        </section>

        <section
          className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
          style={{
            padding:
              'clamp(20px, 3vw, 64px) clamp(28px, 4.5vw, 96px) clamp(24px, 3.5vw, 72px)',
          }}
        >
          <div
            className="absolute z-10 text-[#6B7280]"
            style={{ top: '20px', right: '24px', fontSize: '12px', lineHeight: '1.5' }}
          >
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              disabled={loading || oauthBusy}
              onClick={toggleMode}
              className="ml-1 font-medium text-[#111827] underline decoration-1 transition hover:text-[#7DBBFF] disabled:opacity-60"
              style={{ textUnderlineOffset: '3px' }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
            <h2
              className="mb-1 font-medium text-[#111827]"
              style={{ fontSize: 'clamp(1.125rem, 0.95rem + 0.55vw, 1.5rem)', lineHeight: '1.5' }}
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </h2>
            <p
              className="text-[#6B7280]"
              style={{
                marginBottom: '16px',
                fontSize: 'clamp(12px, 0.75rem + 0.35vw, 15px)',
                lineHeight: '1.5',
              }}
            >
              {mode === 'signin'
                ? 'Welcome back. Continue where you left off.'
                : 'Get started in under a minute.'}
            </p>

            <div className="mb-3 flex flex-col" style={{ gap: '8px' }}>
              <button
                type="button"
                disabled={loading || oauthBusy}
                onClick={() => void signInWithGoogle()}
                className="flex w-full cursor-pointer items-center justify-center bg-white px-4 py-2 font-medium text-[#111827] transition-colors hover:bg-[#F9F9FA] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ ...buttonSurfaceStyle, gap: '10px' }}
              >
                <GoogleLogo />
                {oauthBusy ? 'Redirecting…' : 'Continue with Google'}
              </button>
              <p
                className="text-center text-[#9CA3AF]"
                style={{ fontSize: '11px', lineHeight: '1.5' }}
              >
                Apple and Microsoft sign-in are coming soon. Use Google or email for now.
              </p>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.1)', flex: 1 }} />
              <span
                className="text-[#9CA3AF]"
                style={{ fontSize: '11px', letterSpacing: '0.06em', lineHeight: '1.5' }}
              >
                OR
              </span>
              <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.1)', flex: 1 }} />
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col" style={{ gap: '12px' }}>
              {mode === 'signup' && (
                <div>
                  <span className="mb-1.5 block font-medium text-[#6B7280]" style={labelStyle}>
                    Full name
                  </span>
                  <input
                    value={fullName}
                    onChange={(ev) => setFullName(ev.target.value)}
                    className="box-border w-full bg-white px-3 py-2.5 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
                    style={inputStyle}
                    placeholder="Alex Rivera"
                    disabled={loading || oauthBusy}
                    required
                  />
                </div>
              )}

              <div>
                <span className="mb-1.5 block font-medium text-[#6B7280]" style={labelStyle}>
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="box-border w-full bg-white px-3 py-2.5 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
                  style={inputStyle}
                  placeholder="you@example.com"
                  disabled={loading || oauthBusy}
                  required
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="font-medium text-[#6B7280]" style={labelStyle}>
                    Password
                  </span>
                  {mode === 'signin' ? (
                    <button
                      type="button"
                      className="text-[#6B7280] underline decoration-1 underline-offset-2"
                      style={{ fontSize: '11px', lineHeight: '1.5' }}
                      disabled={loading || oauthBusy}
                      onClick={openForgotPassword}
                    >
                      Forgot password?
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px' }} aria-hidden="true">
                      &nbsp;
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="box-border w-full bg-white px-3 py-2.5 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
                  style={inputStyle}
                  placeholder="Enter your password"
                  disabled={loading || oauthBusy}
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || oauthBusy}
                className="w-full bg-[#7DBBFF] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#5aaeff] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderRadius: '10px', fontSize: '13px', lineHeight: '1.5' }}
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p
              className="mt-auto pt-4 text-center text-[#9CA3AF]"
              style={{ fontSize: '11px', lineHeight: '1.5' }}
            >
              By signing in, you agree to our{' '}
              <Link
                to="/legal/terms"
                id="legal-terms"
                className="underline decoration-1 underline-offset-2 transition hover:text-[#6B7280]"
                style={{
                  fontSize: '11px',
                  lineHeight: '1.5',
                  color: '#9CA3AF',
                  fontWeight: 400,
                }}
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                to="/legal/privacy"
                id="legal-privacy"
                className="underline decoration-1 underline-offset-2 transition hover:text-[#6B7280]"
                style={{
                  fontSize: '11px',
                  lineHeight: '1.5',
                  color: '#9CA3AF',
                  fontWeight: 400,
                }}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
    {forgotOpen ? (
      <div
        role="presentation"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onMouseDown={() => {
          if (!forgotBusy) closeForgotPassword();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
          className="w-full max-w-sm rounded-[14px] bg-white p-6 shadow-lg"
          style={{ fontFamily: systemFont }}
          onMouseDown={(ev) => ev.stopPropagation()}
        >
          <h2 id="forgot-password-title" className="text-base font-semibold text-[#111827]">
            Reset password
          </h2>
          {forgotSent ? (
            <div className="mt-4">
              <p className="text-sm text-[#6B7280]">
                If an account exists for{' '}
                <span className="font-medium text-[#111827]">{forgotEmail.trim()}</span>, we sent a link to set a
                new password. Check your inbox and spam folder.
              </p>
              <button
                type="button"
                className="mt-6 w-full bg-[#7DBBFF] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#5aaeff]"
                style={{ borderRadius: '10px', fontSize: '13px', lineHeight: '1.5' }}
                onClick={closeForgotPassword}
              >
                Done
              </button>
            </div>
          ) : (
            <form
              className="mt-4 flex flex-col"
              style={{ gap: '12px' }}
              onSubmit={(e) => void submitForgotPassword(e)}
            >
              <p className="text-sm text-[#6B7280]">We will email you a link to choose a new password.</p>
              <div>
                <span className="mb-1.5 block font-medium text-[#6B7280]" style={labelStyle}>
                  Email address
                </span>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(ev) => setForgotEmail(ev.target.value)}
                  className="box-border w-full bg-white px-3 py-2.5 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
                  style={inputStyle}
                  placeholder="you@example.com"
                  disabled={forgotBusy}
                  required
                  autoComplete="email"
                />
              </div>
              {forgotError ? <p className="text-xs text-red-600">{forgotError}</p> : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={forgotBusy}
                  className="flex-1 border border-[rgba(0,0,0,0.12)] bg-white px-4 py-2.5 font-medium text-[#111827] transition-colors hover:bg-[#F9F9FA] disabled:opacity-60"
                  style={{ borderRadius: '10px', fontSize: '13px', lineHeight: '1.5' }}
                  onClick={closeForgotPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotBusy}
                  className="flex-1 bg-[#7DBBFF] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#5aaeff] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ borderRadius: '10px', fontSize: '13px', lineHeight: '1.5' }}
                >
                  {forgotBusy ? 'Sending…' : 'Send link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    ) : null}
  </>
  );
}
