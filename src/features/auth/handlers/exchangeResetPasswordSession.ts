import { syncServerSession } from "@/features/auth/lib/syncServerSession";
import { supabase } from "@/shared/lib/supabaseClient";

export type ResetPasswordExchangeResult = { status: "ready" } | { status: "error"; error: unknown };

export async function exchangeResetPasswordSession(code: string): Promise<ResetPasswordExchangeResult> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    return { status: "error", error: sessionError };
  }

  if (sessionData.session) {
    return { status: "ready" };
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return { status: "error", error: error ?? new Error("Missing session.") };
  }

  try {
    await syncServerSession("SIGNED_IN", data.session);
    return { status: "ready" };
  } catch (syncError) {
    return { status: "error", error: syncError };
  }
}
