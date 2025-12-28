'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { supabaseServer } from '@/shared/lib/supabaseServer';

type PlanMemberTier = 'admin' | 'member';

type AddPlanMemberRow = {
  user_id: string;
  tier: PlanMemberTier;
};

export type AddPlanMemberResult = {
  userId: string;
  tier: PlanMemberTier;
};

export async function addPlanMemberByEmail(
  planId: string,
  email: string,
  tier: PlanMemberTier,
  client: SupabaseClient = supabaseServer()
): Promise<AddPlanMemberResult> {
  const supabase = client;
  const { data, error } = await supabase.rpc('add_plan_member_by_email', {
    _plan_id: planId,
    _email: email,
    _tier: tier,
  });

  if (error) {
    const rawMessage =
      typeof (error as { message?: unknown }).message === 'string'
        ? String((error as { message?: unknown }).message)
        : '';
    const message = rawMessage.toLowerCase();
    const details = typeof (error as { details?: string }).details === 'string'
      ? String((error as { details?: string }).details).toLowerCase()
      : '';
    const code = typeof (error as { code?: string }).code === 'string'
      ? String((error as { code?: string }).code)
      : '';
    if (
      message.includes('not registered') ||
      message.includes('user not found') ||
      message.includes('no user') ||
      details.includes('not registered') ||
      details.includes('user not found') ||
      code === '23503' ||
      code === 'P0001'
    ) {
      const err = new Error('USER_NOT_REGISTERED');
      (err as { code?: string }).code = 'USER_NOT_REGISTERED';
      throw err;
    }
    const err = new Error(
      rawMessage.length > 0
        ? rawMessage
        : 'Unable to add member.'
    );
    (err as { code?: string }).code = code || undefined;
    throw err;
  }

  const row = Array.isArray(data) ? (data[0] as AddPlanMemberRow | undefined) : null;

  if (!row) {
    const err = new Error('USER_NOT_REGISTERED');
    (err as { code?: string }).code = 'USER_NOT_REGISTERED';
    throw err;
  }

  return { userId: row.user_id, tier: row.tier };
}
