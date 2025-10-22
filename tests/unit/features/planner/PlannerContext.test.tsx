import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';

import { PlannerProvider, usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

// Mock hooks used inside PlannerContext
vi.mock('@/features/planner/hooks/state/planner/usePlanner', () => {
  const React = require('react');
  return {
    usePlanner: ({ initialDays }: { initialDays?: DayPlan[] }) => {
      const [days, setDays] = React.useState(initialDays ?? []);
      return {
        planId: 'p1',
        dest: 'rome',
        days,
        setDays,
        currentRange: undefined,
        handleRangeChange: vi.fn(),
        activeId: null,
        sensors: [],
        collisionDetection: vi.fn(),
        handleDragStart: vi.fn(),
        handleDragOver: vi.fn(),
        handleDragEnd: vi.fn(),
        addActivity: vi.fn(),
        removeActivity: vi.fn(),
        updateActivity: vi.fn(),
        addBlankActivity: (dayIndex: number) =>
          setDays((prev: DayPlan[]) => {
            const day = prev[dayIndex];
            if (!day) return prev;
            const next = [...prev];
            next[dayIndex] = {
              ...day,
              activities: [
                ...day.activities,
                {
                  id: Math.random().toString(),
                  title: 'New',
                  category: 'general',
                  color: 'bg-[var(--color-1)]',
                },
              ],
            };
            return next;
          }),
      };
    },
  };
});

vi.mock('@/features/planner/hooks/state/planner/useSelectedActivity', () => ({
  useSelectedActivity: () => ({
    selectedActivity: null,
    setSelectedActivity: vi.fn(),
    changeDay: vi.fn(),
    addBlankAndSelect: vi.fn(),
    closeDialog: vi.fn(),
    save: vi.fn(),
    deleteActivity: vi.fn(),
    changeColor: vi.fn(),
  }),
}));
vi.mock('@/features/planner/hooks/data/usePlanCollaboration', () => ({
  usePlanCollaboration: () => ({
    data: storedDays,
    persistDays,
    status: {
      state: 'ready',
      isLoading: false,
      isPending: persistDays.isPending,
      error: null,
      version: 1,
    },
  }),
}));
vi.mock('@/shared/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));
// Mock usePlanCollaboration hook state
let persistDays: {
  mutateAsync: Mock<() => Promise<unknown>>;
  mutate: Mock<() => unknown>;
  isPending: boolean;
} = {
  mutateAsync: vi.fn(),
  mutate: vi.fn(),
  isPending: false,
};
let storedDays: DayPlan[] | undefined = undefined;

describe('PlannerProvider synchronization', () => {
  const initialDays: DayPlan[] = [{ id: '2023-01-01', label: 'Day 1', activities: [] }];

  it('syncs after storedDays load and activity addition', async () => {
    persistDays = {
      mutateAsync: vi.fn(() => {
        persistDays.isPending = true;
        return Promise.resolve().finally(() => {
          persistDays.isPending = false;
        });
      }),
      mutate: vi.fn(),
      isPending: false,
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlannerProvider planId="p1" initialDays={initialDays}>
        {children}
      </PlannerProvider>
    );

    const { result, rerender } = renderHook(() => usePlannerContext(), { wrapper });

    // Modify before stored days are loaded
    act(() => result.current.addBlankActivity(0));
    expect(persistDays.mutateAsync).not.toHaveBeenCalled();

    // Simulate stored days arriving
    storedDays = initialDays;
    rerender();

    // Subsequent changes should trigger persistence
    act(() => result.current.addBlankActivity(0));
    await waitFor(() => expect(persistDays.mutateAsync).toHaveBeenCalledTimes(1));
  });

  it('reverts local state when persistence fails', async () => {
    persistDays = {
      mutateAsync: vi.fn(() => {
        persistDays.isPending = true;
        return Promise.reject(new Error('fail')).finally(() => {
          persistDays.isPending = false;
        });
      }),
      mutate: vi.fn(),
      isPending: false,
    };
    storedDays = initialDays;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlannerProvider planId="p1" initialDays={initialDays}>
        {children}
      </PlannerProvider>
    );

    const { result } = renderHook(() => usePlannerContext(), { wrapper });

    act(() => result.current.addBlankActivity(0));
    await waitFor(() => persistDays.mutateAsync.mock.calls.length === 1);
    await waitFor(() => result.current.days[0].activities.length === 0);
  });
});
