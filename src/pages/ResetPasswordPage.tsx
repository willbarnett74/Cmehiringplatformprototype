import { type CSSProperties, type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { navigateAfterSignIn } from '../lib/postSignInNavigation';

/**
 * Supabase Dashboard → Authentication → URL Configuration → Redirect URLs must include:
 * - http://localhost:5174/auth/reset-password (matches vite.config.ts port)
 * - https://<production-host>/auth/reset-password
 *
 * Must match redirectTo passed from resetPasswordForEmail in LoginScreen.
 */
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

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

async function pollForSession(maxAttempts = 12, intervalMs = 200): Promise<boolean> {
  if (!supabase) return false;
  for (let i = 0; i < maxAttempts; i += 1) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [canSetPassword, setCanSetPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [initError, setInitError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setInitError('Sign in is not configured yet. Please contact support.');
      setReady(true);
      return;
    }

    const client = supabase;
    let cancelled = false;

    const stripRecoveryQueryParams = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('token_hash');
      url.searchParams.delete('type');
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, '', next);
    };

    const tryVerifyOtpFromUrl = async (): Promise<boolean> => {
      const url = new URL(window.location.href);
      const token_hash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type');
      if (!token_hash || type !== 'recovery') return true;

      const { error: verifyErr } = await client.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      });
      if (verifyErr) {
        if (!cancelled) setInitError(verifyErr.message);
        return false;
      }
      stripRecoveryQueryParams();
      return true;
    };

    void (async () => {
      const verified = await tryVerifyOtpFromUrl();
      if (!verified) {
        if (!cancelled) setReady(true);
        return;
      }
      const {
        data: { session: immediate },
      } = await client.auth.getSession();
      if (immediate && !cancelled) {
        setCanSetPassword(true);
      } else if (!cancelled) {
        const ok = await pollForSession();
        if (ok && !cancelled) setCanSetPassword(true);
      }
      if (!cancelled) setReady(true);
    })();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (
        session &&
        (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
      ) {
        setCanSetPassword(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    if (!supabase) return;

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        setFormError(updateErr.message);
        return;
      }
      await navigateAfterSignIn(navigate, null, supabase);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#6B7280]"
        style={{ fontFamily: systemFont }}
      >
        Loading…
      </div>
    );
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 text-center"
        style={{ fontFamily: systemFont }}
      >
        <p className="text-sm text-[#6B7280]">{initError}</p>
        <Link to="/onboarding/sign-in" className="mt-4 text-sm text-[#7dbbff] underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  if (initError && !canSetPassword) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 text-center"
        style={{ fontFamily: systemFont }}
      >
        <p className="max-w-sm text-sm text-red-600">{initError}</p>
        <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
          Request a new link from the sign-in page if it expired.
        </p>
        <Link to="/onboarding/sign-in" className="mt-6 text-sm text-[#7dbbff] underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  if (!canSetPassword) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 text-center"
        style={{ fontFamily: systemFont }}
      >
        <p className="max-w-sm text-sm text-[#6B7280]">
          This link is invalid or has expired. Open the reset link from your email again, or request a new one.
        </p>
        <Link to="/onboarding/sign-in" className="mt-6 text-sm text-[#7dbbff] underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#111827]"
      style={{ fontFamily: systemFont, padding: 'clamp(16px, 2.5vw, 48px)' }}
    >
      <div className="w-full max-w-sm">
        <div
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center bg-[#7dbbff]"
          style={{ borderRadius: '14px' }}
        >
          <Compass className="h-6 w-6 text-white" strokeWidth={2} />
        </div>
        <h1 className="mb-2 text-center text-xl font-semibold text-[#111827]">Set a new password</h1>
        <p className="mb-6 text-center text-sm text-[#6B7280]">
          Choose a password for your CMe account.
        </p>
        <form onSubmit={(ev) => void handleSubmit(ev)} className="flex flex-col" style={{ gap: '12px' }}>
          <div>
            <span className="mb-1.5 block font-medium text-[#6B7280]" style={labelStyle}>
              New password
            </span>
            <input
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="box-border w-full bg-white px-3 py-2.5 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
              style={inputStyle}
              placeholder="At least 6 characters"
              disabled={loading}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <span className="mb-1.5 block font-medium text-[#6B7280]" style={labelStyle}>
              Confirm password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              className="box-border w-full bg-white px-3 py-2.5 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff]"
              style={inputStyle}
              placeholder="Repeat password"
              disabled={loading}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7DBBFF] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#5aaeff] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderRadius: '10px', fontSize: '13px', lineHeight: '1.5' }}
          >
            {loading ? 'Please wait…' : 'Update password'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-[#9CA3AF]">
          <Link to="/onboarding/sign-in" className="text-[#7dbbff] underline underline-offset-2">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
