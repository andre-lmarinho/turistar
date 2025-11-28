import { NextResponse } from 'next/server';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

interface AuthCallbackPayload {
  event: AuthChangeEvent;
  session: Session | null;
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { event, session }: AuthCallbackPayload = await request.json();

  if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
    await supabase.auth.setSession(session);
  }

  if (event === 'SIGNED_OUT') {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ success: true });
}
