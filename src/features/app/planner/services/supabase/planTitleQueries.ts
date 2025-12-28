import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

import { formatSupabaseError } from './supabaseErrors';

type PlanTitleRow = { title: string | null };

export async function fetchPlanTitle(
  planId: string,
  client?: SupabaseClient
): Promise<string | null> {
  const supabase = client ?? createSupabaseServerClient();
  const { data, error } = (await supabase
    .from('plans')
    .select('title')
    .eq('id', planId)
    .single()) as { data: PlanTitleRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'fetchPlanTitle',
      identifiers: { planId },
      error,
    });
  }
  return data?.title ?? null;
}
