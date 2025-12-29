'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { revokePlanShareLink as revokePlanShareLinkRpc } from '@/features/app/planner/server/repositories/PlanShareRepository';
import { formatSupabaseError } from '@/features/app/planner/services/supabase/supabaseErrors';
import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function revokePlanShareLink(
  planId: string,
  client: SupabaseClient = supabaseServer()
): Promise<boolean> {
  const supabase = client;
  const { data, error } = await revokePlanShareLinkRpc(planId, { client: supabase });

  if (error) {
    throw formatSupabaseError({
      operation: 'revokePlanShareLink',
      identifiers: { planId },
      error,
    });
  }

  return Boolean(data);
}
