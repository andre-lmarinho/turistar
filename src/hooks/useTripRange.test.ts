// src/hooks/useTripRange.test.ts

import { renderHook, act } from '@testing-library/react';
import { useTripRange } from './useTripRange';
import { vi } from 'vitest';

let params = new URLSearchParams();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => params,
  useRouter: () => ({ replace: replaceMock }),
}));

beforeEach(() => {
  replaceMock.mockClear();
  params = new URLSearchParams();
});

describe('useTripRange', () => {
  test('tripDays builds date array from search params', () => {
    const start = '2023-01-01T00:00:00.000Z';
    const end = '2023-01-03T00:00:00.000Z';
    params = new URLSearchParams({ start, end });

    const { result } = renderHook(() => useTripRange('rome'));

    const isoDays = result.current.tripDays.map((d) => d.toISOString());
    expect(isoDays).toEqual([
      '2023-01-01T00:00:00.000Z',
      '2023-01-02T00:00:00.000Z',
      '2023-01-03T00:00:00.000Z',
    ]);
  });

  test('handleRangeChange updates the url', () => {
    const { result } = renderHook(() => useTripRange('rome', 'plan1'));
    const range = {
      from: new Date('2023-05-01T00:00:00.000Z'),
      to: new Date('2023-05-05T00:00:00.000Z'),
    };

    act(() => {
      result.current.handleRangeChange(range);
    });

    expect(replaceMock).toHaveBeenCalledWith(
      '/planner?dest=rome&start=2023-05-01T00%3A00%3A00.000Z&end=2023-05-05T00%3A00%3A00.000Z&plan=plan1',
      { scroll: false }
    );
  });
});
