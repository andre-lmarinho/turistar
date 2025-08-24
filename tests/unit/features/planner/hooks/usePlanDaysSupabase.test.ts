// tests/unit/features/planner/hooks/usePlanDaysSupabase.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { usePlanDays } from '@/features/planner/hooks/usePlanDaysSupabase';

const mockFrom = vi.fn();
vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

describe('usePlanDaysSupabase', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  test('loads days with camelCased activities', async () => {
    const selectMock = vi.fn().mockResolvedValue({
      data: [
        {
          date: '2023-01-01',
          activities: [
            {
              id: 'a1',
              title: 't',
              category: 'c',
              color: 'bg-[var(--color-1)]',
              address: 'addr',
              description: null,
              start_time: '09:00',
              duration: 60,
              latitude: 1,
              longitude: 2,
              budget: 10,
              image_url: 'img',
            },
          ],
        },
      ],
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plan_days') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({ order: () => selectMock() }),
            }),
          }),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => usePlanDays('p1'));
    await waitFor(() => expect(result.current.data).toBeTruthy());
    expect(result.current.data?.[0].activities[0]).toEqual({
      id: 'a1',
      title: 't',
      color: 'bg-[var(--color-1)]',
      address: 'addr',
      category: 'c',
      description: undefined,
      startTime: '09:00',
      duration: 60,
      latitude: 1,
      longitude: 2,
      budget: 10,
      imageUrl: 'img',
    });
  });

  test('persists days and activities', async () => {
    const selectDays = vi.fn().mockResolvedValue({
      data: [{ id: 'd1', date: '2023-01-01', destination_id: 'dest1' }],
      error: null,
    });
    const selectActs = vi.fn().mockResolvedValue({ data: [], error: null });
    const upsertActs = vi.fn().mockResolvedValue({ error: null });
    const insertActs = vi.fn().mockResolvedValue({ error: null });
    const deleteActs = vi.fn().mockResolvedValue({ error: null });
    const updateDay = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plan_days') {
        return {
          select: () => ({ eq: () => ({ abortSignal: () => selectDays() }) }),
          update: () => ({ eq: () => ({ abortSignal: () => updateDay() }) }),
          insert: () => ({
            select: () => ({
              single: () => ({ abortSignal: () => ({ data: { id: 'd1' }, error: null }) }),
            }),
          }),
          delete: () => ({ in: () => ({ abortSignal: () => deleteActs() }) }),
        } as unknown;
      }
      if (table === 'activities') {
        return {
          select: () => ({ in: () => ({ abortSignal: () => selectActs() }) }),
          upsert: () => ({ abortSignal: () => upsertActs() }),
          insert: () => ({ abortSignal: () => insertActs() }),
          delete: () => ({ in: () => ({ abortSignal: () => deleteActs() }) }),
        } as unknown;
      }
      if (table === 'plan_destinations') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                abortSignal: () => ({ data: [{ destination_id: 'dest1' }], error: null }),
              }),
            }),
          }),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => usePlanDays('p1', false));
    await act(async () => {
      await result.current.persistDays.mutateAsync([
        {
          id: '2023-01-01',
          label: 'Sun, 01 Jan',
          activities: [
            {
              id: '11111111-1111-1111-1111-111111111111',
              title: 't',
              category: 'c',
              color: 'bg-[var(--color-1)]',
            },
          ],
        },
      ]);
    });
    expect(upsertActs).toHaveBeenCalled();
    expect(insertActs).not.toHaveBeenCalled();
  });

  test('fetches destination_id when none exist', async () => {
    const selectDays = vi.fn().mockResolvedValue({ data: [], error: null });
    const planDestSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ destination_id: 'dest1' }], error: null });
    const insertDay = vi.fn().mockResolvedValue({ data: { id: 'd2' }, error: null });
    const selectActs = vi.fn().mockResolvedValue({ data: [], error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plan_days') {
        return {
          select: () => ({ eq: () => ({ abortSignal: () => selectDays() }) }),
          insert: () => ({
            select: () => ({ single: () => ({ abortSignal: () => insertDay() }) }),
          }),
          delete: () => ({ in: () => ({ abortSignal: () => ({ error: null }) }) }),
        } as unknown;
      }
      if (table === 'plan_destinations') {
        return {
          select: () => ({
            eq: () => ({ order: () => ({ abortSignal: () => planDestSelect() }) }),
          }),
        } as unknown;
      }
      if (table === 'activities') {
        return {
          select: () => ({ in: () => ({ abortSignal: () => selectActs() }) }),
          delete: () => ({
            eq: () => ({ abortSignal: () => ({ error: null }) }),
            in: () => ({ abortSignal: () => ({ error: null }) }),
          }),
          insert: () => ({ abortSignal: () => ({ error: null }) }),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => usePlanDays('p1', false));
    await result.current.persistDays.mutateAsync([
      { id: '2023-01-01', label: 'Sun, 01 Jan', activities: [] },
    ]);
    expect(planDestSelect).toHaveBeenCalled();
    expect(insertDay).toHaveBeenCalled();
  });
});
