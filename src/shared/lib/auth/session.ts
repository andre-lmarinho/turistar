import 'server-only';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

export type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type SupabaseSession = { session: { user: SupabaseUser | null } | null } | null;

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export async function getCurrentSession(): Promise<SupabaseSession | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data as SupabaseSession;
}

export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user as SupabaseUser | null;
}

export async function requireUser(): Promise<SupabaseUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
