import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export async function syncServerSession(event: AuthChangeEvent, session: Session | null): Promise<void> {
  if (!session) {
    throw new Error('Missing Supabase session after authentication.');
  }

  const response = await fetch('/auth/callback', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ event, session }),
  });

  if (!response.ok) {
    throw new Error('Failed to synchronize authentication with the server.');
  }
}
