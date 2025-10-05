// tests/unit/features/planner/hooks/usePlanner.test.ts

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { usePlanner } from '@/features/planner/hooks/usePlanner';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

let params = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => params,
}));

describe('usePlanner', () => {
  test('builds days from trip range when no initial days', () => {
    const start = '2023-01-01T00:00:00.000Z';
    const end = '2023-01-02T00:00:00.000Z';
    params = new URLSearchParams({ start, end });

    const { result } = renderHook(() => usePlanner({ initialDays: [] }));
    expect(result.current.days.map((d) => d.id)).toEqual(['2023-01-01', '2023-01-02']);
  });

  test('uses incoming initial days after mount', () => {
    const start = '2023-01-01T00:00:00.000Z';
    const end = '2023-01-02T00:00:00.000Z';
    params = new URLSearchParams({ start, end });

    const plan: DayPlan[] = [
      {
        id: '2023-01-01',
        label: 'Sun, 01 Jan',
        activities: [{ id: 'a1', title: 'A1', color: 'bg-[var(--color-1)]' }],
      },
      { id: '2023-01-02', label: 'Mon, 02 Jan', activities: [] },
    ];

    const { result, rerender } = renderHook(({ init }) => usePlanner({ initialDays: init }), {
      initialProps: { init: [] as DayPlan[] },
    });

    // Starts empty but aligned with range
    expect(result.current.days.map((d) => d.id)).toEqual(['2023-01-01', '2023-01-02']);

    // After asynchronous load of days, planner should adopt them
    rerender({ init: plan });
    expect(result.current.days).toEqual(plan);
  });

  test('ignores non-finite destination coordinates from query params', () => {
    const start = '2023-01-01T00:00:00.000Z';
    const end = '2023-01-02T00:00:00.000Z';
    params = new URLSearchParams({ start, end, lat: `${Number.POSITIVE_INFINITY}`, lng: `${Number.NEGATIVE_INFINITY}` });

    const { result } = renderHook(() => usePlanner({ initialDays: [] }));

    expect(result.current.destCoords).toBeNull();
  });
});
