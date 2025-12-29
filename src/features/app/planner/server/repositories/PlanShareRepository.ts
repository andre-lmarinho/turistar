import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/shared/types/supabase';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

type PlanShareRepositoryOptions = {
  client?: SupabaseClient;
};

type RpcResponse<T> = {
  data: T | null;
  error: unknown;
};

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function acceptPlanShareLink(
  token: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<RpcResponse<Database['public']['Functions']['accept_plan_share_link']['Returns']>> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('accept_plan_share_link', {
    _token: token,
  })) as unknown as RpcResponse<
    Database['public']['Functions']['accept_plan_share_link']['Returns']
  >;

  return { data, error };
}

export async function createPlanShareLink(
  planId: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<RpcResponse<Database['public']['Functions']['create_plan_share_link']['Returns']>> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('create_plan_share_link', {
    _plan_id: planId,
  })) as unknown as RpcResponse<
    Database['public']['Functions']['create_plan_share_link']['Returns']
  >;

  return { data, error };
}

export async function revokePlanShareLink(
  planId: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<RpcResponse<Database['public']['Functions']['revoke_plan_share_link']['Returns']>> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc('revoke_plan_share_link', {
    _plan_id: planId,
  })) as unknown as RpcResponse<
    Database['public']['Functions']['revoke_plan_share_link']['Returns']
  >;

  return { data, error };
}
