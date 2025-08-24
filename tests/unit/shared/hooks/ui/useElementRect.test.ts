// tests/unit/shared/hooks/ui/useElementRect.test.ts

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useElementRect } from '@/shared/hooks/ui/useElementRect';
import { vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
});

test('returns bounding rect and updates on resize', () => {
  const ref = React.createRef<HTMLDivElement>();
  const first = new DOMRect(0, 0, 100, 100);
  const second = new DOMRect(0, 0, 200, 150);

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValueOnce(first)
    .mockReturnValue(second);

  const { result } = renderHook(() => useElementRect(ref), {
    wrapper: ({ children }) => React.createElement('div', { ref }, children),
  });

  expect(result.current).toEqual(first);

  act(() => {
    window.dispatchEvent(new Event('resize'));
  });

  expect(result.current).toEqual(second);
});

test('updates on scroll when enabled', () => {
  const ref = React.createRef<HTMLDivElement>();
  const first = new DOMRect(0, 0, 100, 100);
  const second = new DOMRect(0, 0, 150, 120);

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValueOnce(first)
    .mockReturnValue(second);

  const { result } = renderHook(() => useElementRect(ref, true), {
    wrapper: ({ children }) => React.createElement('div', { ref }, children),
  });

  expect(result.current).toEqual(first);

  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });

  expect(result.current).toEqual(second);
});
