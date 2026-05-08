import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const SESSION_CHECK_MS = 12_000;

/**
 * Initial getSession + onAuthStateChange, with a bounded wait so offline / hung requests
 * surface retry instead of an infinite spinner.
 */
export function useSupabaseSessionBootstrap() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setReady(true);
      setSession(null);
      setTimedOut(false);
      return;
    }

    let cancelled = false;
    const timedOutRef = { current: false };
    setReady(false);
    setTimedOut(false);

    const t = window.setTimeout(() => {
      timedOutRef.current = true;
      if (!cancelled) {
        setTimedOut(true);
        setReady(true);
      }
    }, SESSION_CHECK_MS);

    void supabase.auth
      .getSession()
      .then(({ data: { session: next } }) => {
        if (cancelled || timedOutRef.current) return;
        window.clearTimeout(t);
        setSession(next);
        setReady(true);
        setTimedOut(false);
      })
      .catch(() => {
        if (cancelled || timedOutRef.current) return;
        window.clearTimeout(t);
        setSession(null);
        setReady(true);
        setTimedOut(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      subscription.unsubscribe();
    };
  }, [retryKey]);

  const hasClient = isSupabaseConfigured && Boolean(supabase);

  return { ready, session, timedOut, retry, hasClient };
}
