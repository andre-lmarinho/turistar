import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import {
  acceptPlanShareLink,
  createPlanShareLink,
  revokePlanShareLink,
} from '@/features/app/planner/server/repositories/PlanShareRepository';

vi.mock('@/shared/lib/supabaseServer', () => ({
  createSupabaseServerClient: vi.fn(),
}));

type SupabaseResult<T> = {
  data: T | null;
  error: unknown;
};

function buildSupabaseRpc<T>(result: SupabaseResult<T>) {
  const rpc = vi.fn().mockResolvedValue(result);
  const supabase = { rpc } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, rpc };
}

describe('PlanShareRepository', () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it('accepts a plan share link', async () => {
    const response = { data: 'plan-1', error: null };
    const { supabase, rpc } = buildSupabaseRpc(response);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const result = await acceptPlanShareLink('token-1');

    expect(result).toEqual('plan-1');
    expect(rpc).toHaveBeenCalledWith('accept_plan_share_link', { _token: 'token-1' });
  });

  it('creates a plan share link', async () => {
    const response = { data: 'share-token', error: null };
    const { supabase, rpc } = buildSupabaseRpc(response);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const result = await createPlanShareLink('plan-2');

    expect(result).toEqual('share-token');
    expect(rpc).toHaveBeenCalledWith('create_plan_share_link', { _plan_id: 'plan-2' });
  });

  it('revokes a plan share link', async () => {
    const response = { data: true, error: null };
    const { supabase, rpc } = buildSupabaseRpc(response);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const result = await revokePlanShareLink('plan-3');

    expect(result).toEqual(true);
    expect(rpc).toHaveBeenCalledWith('revoke_plan_share_link', { _plan_id: 'plan-3' });
  });
});
