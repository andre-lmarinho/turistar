import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('writes to localStorage only once per setter call', async () => {
    const storagePrototype = Object.getPrototypeOf(window.localStorage) as Storage;
    const setItemSpy = vi.spyOn(storagePrototype, 'setItem');

    const { result } = renderHook(() => useLocalStorage('counter', 0));

    await waitFor(() => expect(result.current[2]).toBe(true));

    expect(setItemSpy).not.toHaveBeenCalled();

    act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenLastCalledWith('counter', JSON.stringify(1));

    act(() => {
      result.current[1]((previous) => previous + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(setItemSpy).toHaveBeenCalledTimes(2);
    expect(setItemSpy).toHaveBeenLastCalledWith('counter', JSON.stringify(2));
  });

  it('hydrates from the active key without triggering extra writes', async () => {
    window.localStorage.setItem('alpha', JSON.stringify('stored-alpha'));
    window.localStorage.setItem('beta', JSON.stringify('stored-beta'));

    const storagePrototype = Object.getPrototypeOf(window.localStorage) as Storage;
    const setItemSpy = vi.spyOn(storagePrototype, 'setItem');

    const { result, rerender } = renderHook(
      ({ storageKey }: { storageKey: string }) => useLocalStorage(storageKey, 'fallback'),
      { initialProps: { storageKey: 'alpha' } }
    );

    await waitFor(() => expect(result.current[2]).toBe(true));
    expect(result.current[0]).toBe('stored-alpha');

    setItemSpy.mockClear();

    rerender({ storageKey: 'beta' });

    await waitFor(() => expect(result.current[0]).toBe('stored-beta'));
    expect(setItemSpy).not.toHaveBeenCalled();

    setItemSpy.mockClear();

    rerender({ storageKey: 'gamma' });

    await waitFor(() => expect(result.current[0]).toBe('fallback'));
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('can be disabled to avoid touching localStorage', async () => {
    const storagePrototype = Object.getPrototypeOf(window.localStorage) as Storage;
    const setItemSpy = vi.spyOn(storagePrototype, 'setItem');

    const { result } = renderHook(() => useLocalStorage('disabled-key', 42, { enabled: false }));

    expect(result.current[2]).toBe(true);

    act(() => {
      result.current[1](99);
    });

    expect(result.current[0]).toBe(99);
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
