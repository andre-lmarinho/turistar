// tests/unit/features/planner/PlannerContext.test.tsx

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';

import { PlannerProvider, usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

// Mock hooks used inside PlannerContext
vi.mock('@/features/planner/hooks/usePlanner', () => {
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

vi.mock('@/features/planner/hooks/useSelectedActivity', () => ({
  useSelectedActivity: () => ({
    selectedActivity: null,
    setSelectedActivity: vi.fn(),
    changeDay: vi.fn(),
    addBlankAndSelect: vi.fn(),
    closeModal: vi.fn(),
    save: vi.fn(),
    deleteActivity: vi.fn(),
    changeColor: vi.fn(),
  }),
}));
vi.mock('@/features/planner/hooks/usePlanDaysSupabase', () => ({
  usePlanDays: () => ({ data: storedDays, persistDays }),
}));
vi.mock('@/shared/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));
vi.mock('@/shared/hooks/useLocalStorage', () => {
  const React = require('react');
  return {
    useLocalStorage: <T,>(key: string, initial: T) => {
      const [value, setValue] = React.useState(() => {
        if (typeof window === 'undefined') return initial;
        const stored = window.localStorage.getItem(key);
        if (!stored) return initial;
        try {
          return JSON.parse(stored) as T;
        } catch {
          return initial;
        }
      });
      const setAndPersist = (next: T) => {
        setValue(next as unknown);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(next));
        }
      };
      return [value as T, setAndPersist, true] as const;
    },
  };
});
// Mock usePlanDays hook state
let persistDays: { mutateAsync: Mock<() => Promise<unknown>>; isPending: boolean } = {
  mutateAsync: vi.fn(),
  isPending: false,
};
let storedDays: DayPlan[] | undefined = undefined;
const originalPersistEnv = process.env.ENABLE_PLANNER_PERSIST_TESTS;

beforeAll(() => {
  process.env.ENABLE_PLANNER_PERSIST_TESTS = 'true';
});

afterAll(() => {
  process.env.ENABLE_PLANNER_PERSIST_TESTS = originalPersistEnv;
});

describe('PlannerProvider synchronization', () => {
  const initialDays: DayPlan[] = [{ id: '2023-01-01', label: 'Day 1', activities: [] }];

  beforeEach(() => {
    persistDays = {
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    };
    storedDays = undefined;
    window.localStorage.clear();
  });

  it('syncs after storedDays load and activity addition', async () => {
    persistDays = {
      mutateAsync: vi.fn(() => {
        persistDays.isPending = true;
        return Promise.resolve().finally(() => {
          persistDays.isPending = false;
        });
      }),
      isPending: false,
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlannerProvider planId="p1" initialDays={initialDays}>
        {children}
      </PlannerProvider>
    );

    const { result, rerender } = renderHook(() => usePlannerContext(), { wrapper });

    await waitFor(() => window.localStorage.getItem('planner:p1:days') !== null);
    const initialSnapshot = window.localStorage.getItem('planner:p1:days');

    // Modify before stored days are loaded
    act(() => result.current.addBlankActivity(0));
    expect(persistDays.mutateAsync).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(window.localStorage.getItem('planner:p1:days')).not.toBe(initialSnapshot)
    );

    // Simulate stored days arriving
    storedDays = initialDays;
    rerender();

    // Subsequent changes should trigger persistence
    const snapshotAfterRemote = window.localStorage.getItem('planner:p1:days');
    act(() => result.current.addBlankActivity(0));
    await waitFor(() => expect(persistDays.mutateAsync).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(window.localStorage.getItem('planner:p1:days')).not.toBe(snapshotAfterRemote)
    );
  });

  it('reverts local state when persistence fails', async () => {
    persistDays = {
      mutateAsync: vi.fn(() => {
        persistDays.isPending = true;
        return Promise.reject(new Error('fail')).finally(() => {
          persistDays.isPending = false;
        });
      }),
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

describe('PlannerProvider local storage hydration', () => {
  const initialDays: DayPlan[] = [];

  beforeEach(() => {
    window.localStorage.clear();
    storedDays = undefined;
    persistDays = {
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    };
  });

  it('hydrates planner state from localStorage before remote data', async () => {
    const localDays: DayPlan[] = [
      {
        id: '2023-03-01',
        label: 'From local',
        activities: [
          {
            id: 'act-10',
            title: 'Saved',
            category: 'general',
            color: 'bg-[var(--color-1)]',
          },
        ],
      },
    ];
    window.localStorage.setItem('planner:p1:days', JSON.stringify(localDays));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlannerProvider planId="p1" initialDays={initialDays}>
        {children}
      </PlannerProvider>
    );

    const { result, rerender } = renderHook(() => usePlannerContext(), { wrapper });

    await waitFor(() => expect(result.current.days[0]?.label).toBe('From local'));

    const remoteDays: DayPlan[] = [{ id: '2023-03-02', label: 'From remote', activities: [] }];
    storedDays = remoteDays;
    rerender();

    const expectedStored = JSON.stringify(remoteDays);
    await waitFor(() =>
      expect(window.localStorage.getItem('planner:p1:days')).toBe(expectedStored)
    );
  });
});
