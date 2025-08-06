// tests/unit/features/planner/hooks/useTripRange.test.ts

import { renderHook, act } from '@testing-library/react';
import { useTripRange } from '@/features/planner/hooks/useTripRange';
import { vi } from 'vitest';

let params = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => params,
}));

beforeEach(() => {
  params = new URLSearchParams();
});

describe('useTripRange', () => {
  test('tripDays builds date array from search params', () => {
    const start = '2023-01-01T00:00:00.000Z';
    const end = '2023-01-03T00:00:00.000Z';
    params = new URLSearchParams({ start, end });

    const { result } = renderHook(() => useTripRange());

    const isoDays = result.current.tripDays.map((d) => d.toISOString());
    expect(isoDays).toEqual([
      '2023-01-01T00:00:00.000Z',
      '2023-01-02T00:00:00.000Z',
      '2023-01-03T00:00:00.000Z',
    ]);
  });

  test('handleRangeChange updates the range', () => {
    const { result } = renderHook(() => useTripRange());
    const range = {
      from: new Date('2023-05-01T00:00:00.000Z'),
      to: new Date('2023-05-03T00:00:00.000Z'),
    };

    act(() => {
      result.current.handleRangeChange(range);
    });

    const isoDays = result.current.tripDays.map((d) => d.toISOString());
    expect(isoDays).toEqual([
      '2023-05-01T00:00:00.000Z',
      '2023-05-02T00:00:00.000Z',
      '2023-05-03T00:00:00.000Z',
    ]);
  });
});
