'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createPlanShareLink as createPlanShareLinkRpc } from '@/features/app/planner/server/repositories/PlanShareRepository';
import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function createPlanShareLink(
  planId: string,
  client: SupabaseClient = supabaseServer()
): Promise<string> {
  const supabase = client;
  const shareLink = await createPlanShareLinkRpc(planId, { client: supabase });

  if (!shareLink) {
    throw new Error(`createPlanShareLink failed: planId=${planId}`);
  }

  return shareLink;
}
