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
  let payload: AuthCallbackPayload;
  try {
    payload = JSON.parse(payloadText) as AuthCallbackPayload;
  } catch (error) {
    console.error("Unable to parse auth callback payload.", error);
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const { event, session } = payload;

  if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
    const { error } = await supabase.auth.setSession(session);
    if (error) {
      console.error("Unable to set auth session.", {
        event,
        userId: session.user?.id ?? "unknown",
        error,
      });
      return NextResponse.json({ error: "Unable to set auth session." }, { status: 500 });
    }
  }

  if (event === "SIGNED_OUT") {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Unable to sign out.", { event, error });
      return NextResponse.json({ error: "Unable to sign out." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
