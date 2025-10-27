import { useRef, useState } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { usePersistedPlannerDays } from '@/features/planner/hooks/state/planner/usePersistedPlannerDays';

interface HarnessProps {
  initialDays: DayPlan[];
  storedDays?: DayPlan[];
  persistImpl: (state: DayPlan[]) => Promise<unknown>;
  persist?: boolean;
}

function usePersistHarness({
  initialDays,
  storedDays = initialDays,
  persistImpl,
  persist = true,
}: HarnessProps) {
  const [days, setDays] = useState<DayPlan[]>(initialDays);
  const [isPending, setIsPending] = useState(false);
  const persistRef = useRef(persistImpl);
  persistRef.current = persistImpl;

  const mutateRef = useRef(
    vi.fn(async (state: DayPlan[]) => {
      setIsPending(true);
      try {
        return await persistRef.current(state);
      } finally {
        setIsPending(false);
      }
    })
  );

  usePersistedPlannerDays({
    planner: { days, setDays },
    persistDays: { mutateAsync: mutateRef.current, isPending },
    storedDays,
    persist,
  });

  return { days, setDays, persistSpy: mutateRef.current };
}

describe('usePersistedPlannerDays persistence flow', () => {
  it('persists sanitized days when local state changes', async () => {
    const breakfast: Activity = { id: 'a', title: 'Breakfast', color: '#f00' };
    const initialDays: DayPlan[] = [{ id: 'day-1', label: 'Day 1', activities: [breakfast] }];
    const persistImpl = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook((props) => usePersistHarness(props), {
      initialProps: {
        initialDays,
        storedDays: initialDays,
        persistImpl,
      },
    });

    const optimistic = {
      id: 'temp-1',
      title: 'Pending activity',
      color: '#ccc',
      _optimistic: true,
    } as Activity & { _optimistic: boolean };
    const placeholder: Activity = { id: 'blank-1', title: '', color: '#eee' };
    const museum: Activity = { id: 'm1', title: 'Museum', color: '#0f0' };

    await act(async () => {
      result.current.setDays([
        {
          id: 'day-1',
          label: 'Day 1',
          activities: [{ ...breakfast }, placeholder, museum, optimistic],
        },
      ]);
    });

    await waitFor(() => {
      expect(persistImpl).toHaveBeenCalledTimes(1);
    });

    const persistedState = persistImpl.mock.calls[0][0] as DayPlan[];
    expect(persistedState[0].activities.map((activity) => activity.id)).toEqual(['a', 'm1']);
  });

  it('rolls back to the last saved snapshot when persistence fails', async () => {
    const breakfast: Activity = { id: 'a', title: 'Breakfast', color: '#f00' };
    const initialDays: DayPlan[] = [{ id: 'day-1', label: 'Day 1', activities: [breakfast] }];
    const persistImpl = vi.fn().mockRejectedValue(new Error('network'));

    const { result } = renderHook((props) => usePersistHarness(props), {
      initialProps: {
        initialDays,
        storedDays: initialDays,
        persistImpl,
      },
    });

    await act(async () => {
      result.current.setDays([
        {
          id: 'day-1',
          label: 'Day 1',
          activities: [{ ...breakfast }, { id: 'l1', title: 'Lunch', color: '#00f' }],
        },
      ]);
    });

    await waitFor(() => {
      expect(persistImpl).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.days[0].activities.map((activity) => activity.id)).toEqual(['a']);
    });
  });
});
