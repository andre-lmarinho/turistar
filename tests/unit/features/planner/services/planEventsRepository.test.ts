// tests/unit/features/planner/services/planEventsRepository.test.ts

import { describe, expect, it, vi } from 'vitest';

import type { SupabaseClient } from '@supabase/supabase-js';

import { PlanEventsRepository } from '@/features/planner/services/supabase/planEventsRepository';
import type { Database } from '@/shared/types/supabase';

const createSnapshotClient = (response: { data: unknown; error: unknown }) => {
  const maybeSingle = vi.fn().mockResolvedValue(response);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  const client = {
    from,
  } as unknown as SupabaseClient<Database>;

  return { client, maybeSingle };
};

describe('PlanEventsRepository.fetchSnapshot', () => {
  it('returns the default empty snapshot when no row exists', async () => {
    const { client, maybeSingle } = createSnapshotClient({ data: null, error: null });
    const repository = new PlanEventsRepository(client);

    await expect(repository.fetchSnapshot('plan-1')).resolves.toEqual({
      version: 0,
      days: [],
      updatedAt: new Date(0).toISOString(),
    });

    expect(maybeSingle).toHaveBeenCalled();
  });

  it('parses and normalizes the persisted snapshot row', async () => {
    const persisted = {
      plan_id: 'plan-1',
      version: 3,
      updated_at: '2024-01-01T00:00:00.000Z',
      state: {
        days: [
          {
            id: 'day-1',
            label: 'Day 1',
            activities: [
              {
                id: 'activity-1',
                title: 'Visit museum',
                color: 'bg-blue-500',
              },
            ],
          },
        ],
      },
    };

    const { client } = createSnapshotClient({ data: persisted, error: null });
    const repository = new PlanEventsRepository(client);

    await expect(repository.fetchSnapshot('plan-1')).resolves.toEqual({
      version: 3,
      updatedAt: '2024-01-01T00:00:00.000Z',
      days: [
        {
          id: 'day-1',
          label: 'Day 1',
          position: '1024',
          activities: [
            {
              id: 'activity-1',
              title: 'Visit museum',
              color: 'bg-blue-500',
              position: '1024',
            },
          ],
        },
      ],
    });
  });
});
