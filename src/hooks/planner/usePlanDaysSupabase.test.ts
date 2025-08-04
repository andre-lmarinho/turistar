// src/hooks/planner/usePlanDaysSupabase.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { usePlanDays } from './usePlanDaysSupabase';

const mockFrom = vi.fn();
vi.mock('@/lib/supabaseClient', () => ({
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
          select: () => ({ eq: () => ({ order: () => selectMock() }) }),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => usePlanDays('p1'));
    await waitFor(() => expect(result.current.data).toBeTruthy());
    expect(result.current.data?.[0].activities[0]).toEqual({
      id: 'a1',
      title: 't',
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
    const selectMock = vi.fn().mockResolvedValue({
      data: [{ id: 'd1', date: '2023-01-01', destination_id: 'dest1' }],
      error: null,
    });
    const insertMock = vi.fn().mockResolvedValue({ data: { id: 'd2' }, error: null });
    const updateMock = vi.fn().mockResolvedValue({ error: null });
    const deleteMock = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plan_days') {
        return {
          select: () => ({ eq: () => selectMock() }),
          insert: () => ({ select: () => ({ single: () => insertMock() }) }),
          update: () => ({ eq: () => updateMock() }),
        } as unknown;
      }
      if (table === 'activities') {
        return {
          delete: () => ({ eq: () => deleteMock() }),
          insert: () => insertMock(),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => usePlanDays('p1'));
    await act(async () => {
      await result.current.persistDays.mutateAsync([
        { id: '2023-01-01', label: 'Sun, 01 Jan', activities: [] },
      ]);
    });
    expect(mockFrom).toHaveBeenCalledWith('plan_days');
    expect(mockFrom).toHaveBeenCalledWith('activities');
    expect(updateMock).toHaveBeenCalled();
  });

  test('fetches destination_id when none exist', async () => {
    const selectMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const planDestSelect = vi
      .fn()
      .mockResolvedValue({ data: [{ destination_id: 'dest1' }], error: null });
    const insertMock = vi.fn().mockResolvedValue({ data: { id: 'd2' }, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'plan_days') {
        return {
          select: () => ({ eq: () => selectMock() }),
          insert: () => ({ select: () => ({ single: () => insertMock() }) }),
        } as unknown;
      }
      if (table === 'plan_destinations') {
        return {
          select: () => ({
            eq: () => ({ order: () => planDestSelect() }),
          }),
        } as unknown;
      }
      if (table === 'activities') {
        return {
          delete: () => ({ eq: () => ({ error: null }) }),
          insert: () => ({ error: null }),
        } as unknown;
      }
      return {} as unknown;
    });

    const { result } = renderHook(() => usePlanDays('p1'));
    await act(async () => {
      await result.current.persistDays.mutateAsync([
        { id: '2023-01-01', label: 'Sun, 01 Jan', activities: [] },
      ]);
    });
    expect(planDestSelect).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
  });
});
