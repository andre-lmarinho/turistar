import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

import { formatSupabaseError } from './supabaseErrors';

type ProfileSlugRow = { slug: string | null };

export async function fetchProfileSlugByUserId(
  userId: string,
  client?: SupabaseClient
): Promise<string | null> {
  const supabase = client ?? createSupabaseServerClient();
  const { data, error } = (await supabase
    .from('profiles')
    .select('slug')
    .eq('id', userId)
    .maybeSingle()) as { data: ProfileSlugRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'fetchProfileSlugByUserId',
      identifiers: { userId },
      error,
    });
  }

  return data?.slug ?? null;
}
