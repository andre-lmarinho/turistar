import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/shared/lib/supabaseServer', () => ({
  supabaseServer: vi.fn(),
}));

import { supabaseServer } from '@/shared/lib/supabaseServer';
import { updatePlanDates } from '@/features/app/planner/server/actions/plans/updatePlanDates';

describe('updatePlanDates', () => {
  beforeEach(() => {
    vi.mocked(supabaseServer).mockReset();
  });

  function mockUpdateResponse(error: { message?: string } | null) {
    const single = vi.fn().mockResolvedValue({ error });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));

    vi.mocked(supabaseServer).mockReturnValueOnce({ from } as unknown as ReturnType<
      typeof supabaseServer
    >);

    return { from, update, eq, select, single };
  }

  it('formats dates and updates the plan record', async () => {
    const { from, update, eq } = mockUpdateResponse(null);

    await updatePlanDates(
      'plan-1',
      new Date('2024-03-10T10:30:00Z'),
      new Date('2024-03-15T15:45:00Z')
    );

    expect(from).toHaveBeenCalledWith('plans');
    expect(update).toHaveBeenCalledWith({ start_date: '2024-03-10', end_date: '2024-03-15' });
    expect(eq).toHaveBeenCalledWith('id', 'plan-1');
  });

  it('throws with the Supabase error message when available', async () => {
    const error = { message: 'update failed' };
    mockUpdateResponse(error);

    await expect(
      updatePlanDates('plan-1', new Date('2024-01-01'), new Date('2024-01-02'))
    ).rejects.toThrow('update failed');
  });

  it('falls back to a generic error message', async () => {
    mockUpdateResponse({});

    await expect(
      updatePlanDates('plan-1', new Date('2024-01-01'), new Date('2024-01-02'))
    ).rejects.toThrow('Failed to update plan date range');
  });
});
