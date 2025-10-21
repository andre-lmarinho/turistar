import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDebounce } from '@/features/planner/hooks/search/useDebounce';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useDebounce', () => {
  test('delays value updates by specified interval', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 200 } }
    );

    expect(result.current).toBe('a');

    rerender({ value: 'b', delay: 200 });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('b');
  });

  test('cleans up timers on unmount', () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(global, 'clearTimeout');
    const { rerender, unmount } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 200 } }
    );

    rerender({ value: 'b', delay: 200 });
    expect(clear).toHaveBeenCalledTimes(1);

    unmount();
    expect(clear).toHaveBeenCalledTimes(2);
  });
});
