'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { ensureProfile } from '@/features/auth/server/actions/profile/ensureProfile';
import { supabaseServer } from '@/shared/lib/supabaseServer';

export async function acceptPlanShareLink(
  token: string,
  client: SupabaseClient = supabaseServer()
): Promise<string> {
  const supabase = client;
  await ensureProfile({ client: supabase });
  const { data, error } = await supabase.rpc('accept_plan_share_link', {
    _token: token,
  });

  if (error) {
    const message =
      typeof (error as { message?: unknown }).message === 'string'
        ? String((error as { message?: unknown }).message)
        : '';
    const err = new Error(message.length > 0 ? message : 'Unable to join planner.');
    (err as { code?: string }).code = (error as { code?: string }).code;
    (err as { details?: string }).details = (error as { details?: string }).details;
    throw err;
  }

  if (!data) {
    throw new Error('Share link not accepted');
  }

  return data as string;
}
