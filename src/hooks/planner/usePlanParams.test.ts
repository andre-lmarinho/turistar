// src/hooks/usePlanParams.test.ts

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { usePlanParams } from './usePlanParams';

let params = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => params,
}));

beforeEach(() => {
  params = new URLSearchParams();
});

describe('usePlanParams', () => {
  test('returns dest and coordinates from url', () => {
    params = new URLSearchParams({ dest: 'rome', lat: '1', lng: '2' });
    const { result } = renderHook(() => usePlanParams());
    expect(result.current.dest).toBe('rome');
    expect(result.current.destCoords).toEqual({ lat: 1, lng: 2 });
  });

  test('handles missing params', () => {
    const { result } = renderHook(() => usePlanParams());
    expect(result.current.dest).toBe('');
    expect(result.current.destCoords).toBeNull();
  });
});
