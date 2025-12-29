import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export async function syncServerSession(
  event: AuthChangeEvent,
  session: Session | null
): Promise<void> {
  if (!session) {
    // Sign-up flows that require email confirmation may not include a session yet.
    return;
  }

  const response = await fetch('/auth/callback', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ event, session }),
  });

  if (!response.ok) {
    const userId = session.user?.id ?? 'unknown';
    throw new Error(
      `syncServerSession failed: event=${event} userId=${userId} status=${response.status}`
    );
  }
}
