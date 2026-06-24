import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const SESSION_CHECK_MS = 22_000;

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
      .then(async ({ data: { session: next } }) => {
        if (cancelled || timedOutRef.current) return;
        window.clearTimeout(t);

        if (!next?.user?.id) {
          setSession(null);
          setReady(true);
          setTimedOut(false);
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          await supabase.auth.signOut();
          setSession(null);
          setReady(true);
          setTimedOut(false);
          return;
        }

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

    const client = supabase;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, next) => {
      if (!next?.user?.id) {
        setSession(null);
        setReady(true);
        return;
      }

      void client.auth.getUser().then(({ data: { user }, error: userError }) => {
        if (userError || !user) {
          void client.auth.signOut();
          setSession(null);
        } else {
          setSession(next);
        }
        setTimedOut(false);
        setReady(true);
      });
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
