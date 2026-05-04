import { type CSSProperties, type FormEvent, type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Compass } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

type Mode = 'signin' | 'signup';

export type LoginScreenProps = {
  onAuthenticated?: () => void | Promise<void>;
};

const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const pagePadY = 'clamp(16px, 2.5vw, 48px)';
/** Fits within the viewport; avoids a 640px-tall card on short windows */
const splitCardGridStyle: CSSProperties = {
  gridTemplateRows: 'minmax(0, 1fr)',
  boxSizing: 'border-box',
  height: `min(960px, calc(100dvh - 2 * ${pagePadY}))`,
  minHeight: `min(640px, calc(100dvh - 2 * ${pagePadY}))`,
  maxHeight: `calc(100dvh - 2 * ${pagePadY})`,
  width: '100%',
  maxWidth: 'min(1680px, calc(100vw - clamp(32px, 5vw, 96px)))',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '20px',
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

function AppleLogo() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#000" aria-hidden="true">
        <path d="M17.05 12.04c-.03-3.04 2.49-4.5 2.6-4.57-1.42-2.07-3.62-2.36-4.4-2.39-1.87-.19-3.65 1.1-4.6 1.1-.95 0-2.41-1.07-3.96-1.04-2.04.03-3.92 1.18-4.97 3-2.12 3.67-.54 9.1 1.52 12.08 1.01 1.46 2.21 3.1 3.79 3.04 1.52-.06 2.1-.99 3.94-.99s2.36.99 3.97.96c1.64-.03 2.68-1.49 3.69-2.95 1.16-1.69 1.64-3.33 1.66-3.42-.04-.02-3.18-1.22-3.21-4.83zM14.06 3.34C14.88 2.34 15.43 0.96 15.28-0.42c-1.18.05-2.61.79-3.46 1.78-.76.88-1.43 2.29-1.25 3.64 1.32.1 2.66-.67 3.49-1.66z" />
      </svg>
    </span>
  );
}

function MicrosoftLogo() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect width="7" height="7" x="0.5" y="0.5" fill="#F25022" />
        <rect width="7" height="7" x="8.5" y="0.5" fill="#7FBA00" />
        <rect width="7" height="7" x="0.5" y="8.5" fill="#00A4EF" />
        <rect width="7" height="7" x="8.5" y="8.5" fill="#FFB900" />
      </svg>
    </span>
  );
}

function SocialOAuthStub({
  icon,
  label,
  shortLabel,
  dense,
}: {
  icon: ReactNode;
  label: string;
  shortLabel: string;
  dense?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => e.preventDefault()}
      className={`flex min-w-0 flex-1 cursor-default flex-col items-center justify-center gap-0.5 bg-white font-medium text-[#111827] transition-colors hover:bg-[#F9F9FA] sm:flex-row sm:gap-1.5 ${
        dense ? 'py-1.5 sm:py-1.5' : 'py-2 sm:py-2'
      }`}
      style={{
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: '10px',
        fontSize: 'clamp(10px, 0.65rem + 0.2vw, 12px)',
        lineHeight: '1.35',
        paddingLeft: 'clamp(4px, 1vw, 8px)',
        paddingRight: 'clamp(4px, 1vw, 8px)',
      }}
    >
      {icon}
      <span className="max-w-full truncate text-center">{shortLabel}</span>
    </button>
  );
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);

  const toggleMode = () => {
    if (loading) return;
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
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role: 'candidate' } },
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
        className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#111827]"
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
    <div
      className="flex min-h-dvh items-center justify-center overflow-auto bg-[#fafafa] text-[#111827]"
      style={{ fontFamily: systemFont, padding: pagePadY }}
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
            paddingBlock: 'clamp(20px, 3.5vh, 56px)',
            paddingInline: 'clamp(20px, 4.5vw, 96px)',
          }}
        >
          <div
            className="absolute z-10 max-w-[calc(100%-1.5rem)] text-right text-[#6B7280] sm:max-w-none"
            style={{ top: 'clamp(16px, 2vh, 24px)', right: 'clamp(16px, 2.5vw, 28px)', fontSize: '12px', lineHeight: '1.5' }}
          >
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              disabled={loading}
              onClick={toggleMode}
              className="ml-1 font-medium text-[#111827] underline decoration-1 transition hover:text-[#7DBBFF] disabled:opacity-60"
              style={{ textUnderlineOffset: '3px' }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col overflow-x-hidden"
            style={{ paddingTop: 'clamp(40px, 5.5vh, 60px)' }}
          >
            <div className="shrink-0">
              <h2
                className="mb-0.5 font-medium text-[#111827]"
                style={{ fontSize: 'clamp(1.125rem, 0.95rem + 0.55vw, 1.5rem)', lineHeight: '1.35' }}
              >
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </h2>
              <p
                className="text-[#6B7280]"
                style={{
                  marginBottom: mode === 'signin' ? 'clamp(10px, 1.75vh, 18px)' : 'clamp(12px, 2vh, 20px)',
                  fontSize: 'clamp(12px, 0.75rem + 0.35vw, 15px)',
                  lineHeight: '1.4',
                }}
              >
                {mode === 'signin'
                  ? 'Welcome back. Continue where you left off.'
                  : 'Get started in under a minute.'}
              </p>
            </div>

            <div
              className={`flex min-h-0 w-full flex-1 flex-col ${
                mode === 'signin' ? 'justify-center' : 'justify-start overflow-y-auto'
              }`}
            >
              <div className="w-full shrink-0">
                <div className="mb-2 grid w-full grid-cols-3 gap-1.5 sm:gap-2">
                  <SocialOAuthStub
                    icon={<GoogleLogo />}
                    label="Continue with Google — OAuth not configured; use email and password"
                    shortLabel="Google"
                    dense={mode === 'signin'}
                  />
                  <SocialOAuthStub
                    icon={<AppleLogo />}
                    label="Continue with Apple — OAuth not configured; use email and password"
                    shortLabel="Apple"
                    dense={mode === 'signin'}
                  />
                  <SocialOAuthStub
                    icon={<MicrosoftLogo />}
                    label="Continue with Microsoft — OAuth not configured; use email and password"
                    shortLabel="Microsoft"
                    dense={mode === 'signin'}
                  />
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.1)', flex: 1 }} />
                  <span
                    className="text-[#9CA3AF]"
                    style={{ fontSize: '11px', letterSpacing: '0.06em', lineHeight: '1.5' }}
                  >
                    OR
                  </span>
                  <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.1)', flex: 1 }} />
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col" style={{ gap: mode === 'signin' ? 8 : 10 }}>
                  {mode === 'signup' && (
                    <div>
                      <span className="mb-1 block font-medium text-[#6B7280]" style={labelStyle}>
                        Full name
                      </span>
                      <input
                        value={fullName}
                        onChange={(ev) => setFullName(ev.target.value)}
                        className="box-border w-full bg-white px-3 py-2 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
                        style={inputStyle}
                        placeholder="Alex Rivera"
                        disabled={loading}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <span className="mb-1 block font-medium text-[#6B7280]" style={labelStyle}>
                      Email address
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      className="box-border w-full bg-white px-3 py-2 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
                      style={inputStyle}
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="font-medium text-[#6B7280]" style={labelStyle}>
                        Password
                      </span>
                      <button
                        type="button"
                        className="shrink-0 text-[#6B7280] underline decoration-1 underline-offset-2"
                        style={{ fontSize: '11px', lineHeight: '1.5' }}
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(ev) => setPassword(ev.target.value)}
                      className="box-border w-full bg-white px-3 py-2 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
                      style={inputStyle}
                      placeholder="Enter your password"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                  </div>

                  {error && <p className="text-xs text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-0.5 w-full bg-[#7DBBFF] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#5aaeff] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ borderRadius: '10px', fontSize: '13px', lineHeight: '1.5' }}
                  >
                    {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                </form>
              </div>
            </div>

            <p
              className="shrink-0 pt-3 text-center text-[#9CA3AF] sm:pt-4"
              style={{ fontSize: '11px', lineHeight: '1.45' }}
            >
              By signing in, you agree to our{' '}
              <Link
                to="/legal/terms"
                id="legal-terms"
                className="underline decoration-1 underline-offset-2 transition hover:text-[#6B7280]"
                style={{
                  fontSize: '11px',
                  lineHeight: '1.45',
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
                  lineHeight: '1.45',
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
  );
}
