import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useIsDesktop } from '@/shared/hooks/ui/useIsDesktop';

type Listener = (event: MediaQueryListEvent) => void;

function createMatchMedia(initialMatches: boolean, options?: { legacy?: boolean }) {
  const listeners = new Set<Listener>();

  const addListener = (listener: EventListenerOrEventListenerObject) => {
    if (typeof listener === 'function') {
      listeners.add(listener as Listener);
    }
  };

  const removeListener = (listener: EventListenerOrEventListenerObject) => {
    if (typeof listener === 'function') {
      listeners.delete(listener as Listener);
    }
  };

  const mediaQueryList: MediaQueryList = {
    matches: initialMatches,
    media: '(min-width: 768px)',
    onchange: null,
    addEventListener: vi.fn((_, listener: EventListenerOrEventListenerObject) => {
      addListener(listener);
    }),
    removeEventListener: vi.fn((_, listener: EventListenerOrEventListenerObject) => {
      removeListener(listener);
    }),
    addListener: vi.fn((listener: EventListenerOrEventListenerObject) => {
      addListener(listener);
    }),
    removeListener: vi.fn((listener: EventListenerOrEventListenerObject) => {
      removeListener(listener);
    }),
    dispatchEvent: vi.fn(() => true),
  };

  if (options?.legacy) {
    (mediaQueryList as { addEventListener?: MediaQueryList['addEventListener'] }).addEventListener =
      undefined;
    (
      mediaQueryList as { removeEventListener?: MediaQueryList['removeEventListener'] }
    ).removeEventListener = undefined;
  }

  const notify = (matches: boolean) => {
    mediaQueryList.matches = matches;
    const event = { matches } as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  };

  return { mediaQueryList, notify };
}

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  if (originalMatchMedia) {
    window.matchMedia = originalMatchMedia;
  } else {
    delete (window as { matchMedia?: typeof window.matchMedia }).matchMedia;
  }
  vi.restoreAllMocks();
});

describe('useIsDesktop', () => {
  test('returns the current match state and reacts to changes', async () => {
    const { mediaQueryList, notify } = createMatchMedia(false);
    const mockMatchMedia = vi.fn(() => mediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: mockMatchMedia,
    });

    const { result, unmount } = renderHook(() => useIsDesktop('(min-width: 1024px)'));

    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)');

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    act(() => {
      notify(true);
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  test('falls back to legacy listener APIs when addEventListener is unavailable', async () => {
    const { mediaQueryList, notify } = createMatchMedia(true, { legacy: true });
    const mockMatchMedia = vi.fn(() => mediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: mockMatchMedia,
    });

    const { result, unmount } = renderHook(() => useIsDesktop());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(mediaQueryList.addListener).toHaveBeenCalledWith(expect.any(Function));
    expect(mediaQueryList.addEventListener).toBeUndefined();

    act(() => {
      notify(false);
    });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    unmount();

    expect(mediaQueryList.removeListener).toHaveBeenCalledWith(expect.any(Function));
  });
});
