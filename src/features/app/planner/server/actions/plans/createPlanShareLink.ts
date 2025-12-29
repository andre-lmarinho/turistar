'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createPlanShareLink as createPlanShareLinkRpc } from '@/features/app/planner/server/repositories/PlanShareRepository';
import { formatSupabaseError } from '@/features/app/planner/services/supabase/supabaseErrors';
import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function createPlanShareLink(
  planId: string,
  client: SupabaseClient = supabaseServer()
): Promise<string> {
  const supabase = client;
  const { data, error } = await createPlanShareLinkRpc(planId, { client: supabase });

  if (error) {
    throw formatSupabaseError({
      operation: 'createPlanShareLink',
      identifiers: { planId },
      error,
    });
  }

  if (!data) {
    throw new Error('Share link not created');
  }

  return data as string;
}
