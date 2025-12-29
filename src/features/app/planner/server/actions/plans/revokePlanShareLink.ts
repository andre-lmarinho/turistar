'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { revokePlanShareLink as revokePlanShareLinkRpc } from '@/features/app/planner/server/repositories/PlanShareRepository';
import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function revokePlanShareLink(
  planId: string,
  client: SupabaseClient = supabaseServer()
): Promise<boolean> {
  const supabase = client;
  const revoked = await revokePlanShareLinkRpc(planId, { client: supabase });

  return Boolean(revoked);
}
