import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/shared/types/supabase';
import { formatSupabaseError } from '@/shared/lib/supabaseErrors';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

type PlanShareRepositoryOptions = {
  client?: SupabaseClient;
};

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function acceptPlanShareLink(
  token: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<Database['public']['Functions']['accept_plan_share_link']['Returns'] | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('accept_plan_share_link', {
    _token: token,
  })) as unknown as {
    data: Database['public']['Functions']['accept_plan_share_link']['Returns'] | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: 'acceptPlanShareLink',
      identifiers: { token },
      error,
    });
  }

  return data ?? null;
}

export async function createPlanShareLink(
  planId: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<Database['public']['Functions']['create_plan_share_link']['Returns'] | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('create_plan_share_link', {
    _plan_id: planId,
  })) as unknown as {
    data: Database['public']['Functions']['create_plan_share_link']['Returns'] | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: 'createPlanShareLink',
      identifiers: { planId },
      error,
    });
  }

  return data ?? null;
}

export async function revokePlanShareLink(
  planId: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<Database['public']['Functions']['revoke_plan_share_link']['Returns']> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('revoke_plan_share_link', {
    _plan_id: planId,
  })) as unknown as {
    data: Database['public']['Functions']['revoke_plan_share_link']['Returns'] | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: 'revokePlanShareLink',
      identifiers: { planId },
      error,
    });
  }

  return data ?? false;
}
