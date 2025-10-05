import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/shared/lib/supabaseServer', () => ({
  supabaseServer: vi.fn(),
}));

import { supabaseServer } from '@/shared/lib/supabaseServer';
import { createPlan } from '@/server/actions/createPlan';

function mockSupabaseRpc(response: unknown) {
  const rpc = vi.fn().mockResolvedValue(response);
  vi.mocked(supabaseServer).mockReturnValueOnce({ rpc } as unknown as ReturnType<typeof supabaseServer>);
  return rpc;
}

describe('createPlan action', () => {
  beforeEach(() => {
    vi.mocked(supabaseServer).mockReset();
  });

  it('sends formatted payload and supports array responses', async () => {
    const rpc = mockSupabaseRpc({
      data: [
        {
          plan_id: 'plan-1',
          public_slug: 'slug-1',
          edit_token: 'token-1',
        },
      ],
      error: null,
    });

    const result = await createPlan(
      '  Trip to Paris  ',
      { name: '  Paris  ', latitude: 1.23, longitude: 4.56 },
      '2024-01-01T10:00:00Z',
      '2024-01-05T12:00:00Z'
    );

    expect(rpc).toHaveBeenCalledWith('create_full_plan', {
      _title: 'Trip to Paris',
      _dest_name: 'Paris',
      _dest_lat: 1.23,
      _dest_long: 4.56,
      _start_date: '2024-01-01',
      _end_date: '2024-01-05',
    });
    expect(result).toEqual({ id: 'plan-1', publicSlug: 'slug-1', editToken: 'token-1' });
  });

  it('supports object responses from RPC', async () => {
    const rpc = mockSupabaseRpc({
      data: {
        plan_id: 'plan-2',
        public_slug: 'slug-2',
        edit_token: 'token-2',
      },
      error: null,
    });

    const result = await createPlan('Title', { name: 'Lisbon' }, '2024-02-01', '2024-02-10');

    expect(rpc).toHaveBeenCalledWith('create_full_plan', {
      _title: 'Title',
      _dest_name: 'Lisbon',
      _dest_lat: null,
      _dest_long: null,
      _start_date: '2024-02-01',
      _end_date: '2024-02-10',
    });
    expect(result).toEqual({ id: 'plan-2', publicSlug: 'slug-2', editToken: 'token-2' });
  });

  it('throws when the RPC returns an error', async () => {
    const error = new Error('failed');
    mockSupabaseRpc({ data: null, error });

    await expect(createPlan('x', { name: 'Y' }, '2024-01-01', '2024-01-02')).rejects.toBe(error);
  });

  it('throws when the RPC does not return data', async () => {
    mockSupabaseRpc({ data: null, error: null });

    await expect(createPlan('x', { name: 'Y' }, '2024-01-01', '2024-01-02')).rejects.toThrow(
      'Failed to create plan'
    );
  });

  it('throws a friendly error when destination name is empty', async () => {
    await expect(
      createPlan('Trip', { name: '   ' }, '2024-03-01', '2024-03-02')
    ).rejects.toThrow('Destination name cannot be empty.');
    expect(supabaseServer).not.toHaveBeenCalled();
  });

  it('throws a friendly error when end date is before start date', async () => {
    await expect(
      createPlan('Trip', { name: 'Tokyo' }, '2024-05-05', '2024-05-01')
    ).rejects.toThrow('End date must be on or after the start date.');
    expect(supabaseServer).not.toHaveBeenCalled();
  });
});
