import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

type ExchangePayload = { code?: string };

export async function POST(request: Request) {
  let payload: ExchangePayload;
  try {
    payload = (await request.json()) as ExchangePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const code = typeof payload.code === "string" ? payload.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Missing code." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.json({ error: "Unable to exchange auth code." }, { status: 400 });
  }

  return NextResponse.json({ authenticated: Boolean(data.session) });
}
