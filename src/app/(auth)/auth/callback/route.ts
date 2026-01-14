import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

interface AuthCallbackPayload {
  event: AuthChangeEvent;
  session: Session | null;
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const payloadText = await request.text();
  if (!payloadText) {
    return NextResponse.json({ success: true });
  }
  const { event, session }: AuthCallbackPayload = JSON.parse(payloadText);

  if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
    await supabase.auth.setSession(session);
  }

  if (event === "SIGNED_OUT") {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ success: true });
}
