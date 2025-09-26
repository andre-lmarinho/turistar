// tests/unit/features/planner/hooks/persistDaysHelpers.test.ts

import { vi } from 'vitest';
import {
  fetchExistingDays,
  deleteRemovedDays,
  upsertDayActivities,
} from '@/features/planner/hooks/persistDaysHelpers';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

const mockFrom = vi.fn();
vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

describe('persistDaysHelpers', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  test('fetchExistingDays returns rows', async () => {
    const selectMock = vi.fn().mockResolvedValue({
      data: [{ id: 'd1', date: '2023-01-01', destination_id: 'dest1' }],
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'plan_days') {
        return {
          select: () => ({ eq: () => ({ abortSignal: () => selectMock() }) }),
        } as unknown;
      }
      return {} as unknown;
    });
    const res = await fetchExistingDays('p1', new AbortController().signal);
    expect(res).toEqual([{ id: 'd1', date: '2023-01-01', destination_id: 'dest1' }]);
    expect(selectMock).toHaveBeenCalled();
  });

  test('deleteRemovedDays removes missing days', async () => {
    const delActs = vi.fn().mockResolvedValue({ error: null });
    const delDays = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'activities') {
        return { delete: () => ({ in: () => ({ abortSignal: () => delActs() }) }) } as unknown;
      }
      if (table === 'plan_days') {
        return { delete: () => ({ in: () => ({ abortSignal: () => delDays() }) }) } as unknown;
      }
      return {} as unknown;
    });
    const existing = [
      { id: '1', date: '2023-01-01', destination_id: 'dest1' },
      { id: '2', date: '2023-01-02', destination_id: 'dest1' },
    ];
    const state: DayPlan[] = [{ id: '2023-01-01', label: 'd1', activities: [] }];
    await deleteRemovedDays(existing, state, new AbortController().signal);
    expect(delActs).toHaveBeenCalled();
    expect(delDays).toHaveBeenCalled();
  });

  test('upsertDayActivities upserts, inserts and deletes', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'activities') {
        return {
          upsert: () => ({ abortSignal: () => upsert() }),
          insert: () => ({ abortSignal: () => insert() }),
          delete: () => ({ in: () => ({ abortSignal: () => del() }) }),
        } as unknown;
      }
      return {} as unknown;
    });
    const acts = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: 't1',
        color: 'bg-[var(--color-1)]',
        category: 'c1',
      },
      {
        id: 'temp',
        title: 't2',
        color: 'bg-[var(--color-2)]',
        category: 'c2',
      },
    ];
    const existingActs = new Set(['old']);
    await upsertDayActivities('day1', acts, existingActs, new AbortController().signal);
    expect(upsert).toHaveBeenCalled();
    expect(insert).toHaveBeenCalled();
    expect(del).toHaveBeenCalled();
  });
});
