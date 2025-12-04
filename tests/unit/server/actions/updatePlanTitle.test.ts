import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/shared/lib/supabaseServer', () => ({
  supabaseServer: vi.fn(),
}));

import { supabaseServer } from '@/shared/lib/supabaseServer';
import { updatePlanTitle } from '@/server/actions/plans/updatePlanTitle';

describe('updatePlanTitle', () => {
  beforeEach(() => {
    vi.mocked(supabaseServer).mockReset();
  });

  it('invokes the update_plan_title RPC with provided values', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabaseServer).mockReturnValueOnce({ rpc } as unknown as ReturnType<
      typeof supabaseServer
    >);

    await updatePlanTitle('plan-1', 'token-123', 'New Title');

    expect(rpc).toHaveBeenCalledWith('update_plan_title', {
      _plan_id: 'plan-1',
      _edit_token: 'token-123',
      _new_title: 'New Title',
    });
  });

  it('throws when Supabase returns an error', async () => {
    const error = new Error('rpc failed');
    const rpc = vi.fn().mockResolvedValue({ error });
    vi.mocked(supabaseServer).mockReturnValueOnce({ rpc } as unknown as ReturnType<
      typeof supabaseServer
    >);

    await expect(updatePlanTitle('plan-1', 'token', 'Title')).rejects.toBe(error);
  });
});
