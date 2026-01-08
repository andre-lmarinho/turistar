import "server-only";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function isAuthSessionMissingError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const maybeError = error as { message?: string; status?: number };
  return (
    maybeError.status === 400 &&
    typeof maybeError.message === "string" &&
    maybeError.message.toLowerCase().includes("auth session missing")
  );
}

export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const supabase = createSupabaseServerClient();

  try {
    const { data } = await supabase.auth.getUser();
    return data.user as SupabaseUser | null;
  } catch (error) {
    if (isAuthSessionMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function requireUser(): Promise<SupabaseUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
