'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { acceptPlanShareLink } from '@/server/actions/plans/acceptPlanShareLink';
import { supabase } from '@/shared/lib/supabaseClient';
import { syncServerSession } from '@/shared/lib/auth/sync-server-session';

type ShareLinkAutoJoinProps = {
  token: string;
};

type JoinStatus = 'idle' | 'joining' | 'error';

export function ShareLinkAutoJoin({ token }: ShareLinkAutoJoinProps) {
  const router = useRouter();
  const joinRef = useRef(false);
  const [status, setStatus] = useState<JoinStatus>('idle');

  useEffect(() => {
    let active = true;

    const attemptJoin = async (session: Session | null, event?: AuthChangeEvent) => {
      if (!session || joinRef.current) {
        return;
      }
      joinRef.current = true;
      setStatus('joining');
      try {
        await syncServerSession(event ?? 'SIGNED_IN', session);
        const planId = await acceptPlanShareLink(token);
        if (!active) {
          return;
        }
        router.replace(`/p/${planId}`);
        router.refresh();
      } catch {
        if (!active) {
          return;
        }
        joinRef.current = false;
        setStatus('error');
      }
    };

    const boot = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          url.searchParams.delete('code');
          window.history.replaceState(null, '', url.toString());
          await attemptJoin(data.session, 'SIGNED_IN');
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      await attemptJoin(data.session);
    };

    void boot();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      void attemptJoin(session, event);
    });

    return () => {
      active = false;
      data?.subscription.unsubscribe();
    };
  }, [router, token]);

  if (status === 'joining') {
    return (
      <p className="text-muted-foreground mt-4 text-xs">
        Joining this planner...
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="text-muted-foreground mt-4 text-xs">
        We could not join automatically. Please refresh the page or try again.
      </p>
    );
  }

  return null;
}
