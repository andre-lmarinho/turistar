// tests/unit/features/planner/hooks/useOptimisticReorder.test.tsx

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { useOptimisticReorder } from '@/features/planner/hooks/useOptimisticReorder';
import * as toastModule from '@/features/planner/ui/usePlannerToast';

const INITIAL_DAYS: DayPlan[] = [
  {
    id: 'day-1',
    label: 'Day 1',
    activities: [
      { id: 'a-1', title: 'One', color: '#fff', position: '1024' },
      { id: 'a-2', title: 'Two', color: '#fff', position: '2048' },
    ],
  },
  {
    id: 'day-2',
    label: 'Day 2',
    activities: [{ id: 'b-1', title: 'Three', color: '#fff', position: '1024' }],
  },
];

describe('useOptimisticReorder', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('updates the UI immediately before the network round-trip resolves', async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );

    const { result } = renderHook(() => {
      const [days, setDays] = React.useState<DayPlan[]>(INITIAL_DAYS);
      const hook = useOptimisticReorder({
        planId: 'plan-1',
        getDaysSnapshot: () => days,
        setDays,
      });
      return { ...hook, days };
    });

    let mutationPromise: Promise<unknown> | undefined;
    await act(async () => {
      mutationPromise = result.current.reorder({
        itemId: 'a-1',
        fromDayId: 'day-1',
        toDayId: 'day-1',
        toIndex: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.days[0].activities.map((a) => a.id)).toEqual(['a-2', 'a-1']);
    });

    expect(fetchSpy).toHaveBeenCalled();
    const resolver = resolveFetch;
    if (resolver) {
      resolver(new Response(JSON.stringify({ position: '1536' }), { status: 200 }));
    }
    await act(async () => {
      await mutationPromise;
    });
  });

  it('rolls back optimistic state and shows a toast on failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('nope', { status: 500, statusText: 'fail' })
    );
    const toastSpy = vi.spyOn(toastModule, 'showPlannerToast').mockImplementation(() => {});

    const { result } = renderHook(() => {
      const [days, setDays] = React.useState<DayPlan[]>(INITIAL_DAYS);
      const hook = useOptimisticReorder({
        planId: 'plan-1',
        getDaysSnapshot: () => days,
        setDays,
      });
      return { ...hook, days };
    });

    await act(async () => {
      await expect(
        result.current.reorder({
          itemId: 'a-1',
          fromDayId: 'day-1',
          toDayId: 'day-2',
          toIndex: 1,
        })
      ).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.days).toEqual(INITIAL_DAYS);
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Mudança desfeita. Não foi possível salvar.' })
      );
    });
  });
});

