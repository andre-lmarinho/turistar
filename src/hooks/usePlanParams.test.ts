// src/hooks/usePlanParams.test.ts

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { usePlanParams } from './usePlanParams';

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

describe('usePlanParams', () => {
  test('returns planId from url if present', () => {
    params = new URLSearchParams({ dest: 'rome', plan: 'plan1', lat: '1', lng: '2' });
    const { result } = renderHook(() => usePlanParams());
    expect(result.current.planId).toBe('plan1');
    expect(result.current.dest).toBe('rome');
    expect(result.current.destCoords).toEqual({ lat: 1, lng: 2 });
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test('generates planId and updates url when missing', () => {
    params = new URLSearchParams({ dest: 'rome' });
    const { result } = renderHook(() => usePlanParams());
    expect(result.current.dest).toBe('rome');
    expect(result.current.planId).toBeTruthy();
    expect(result.current.destCoords).toBeNull();
    const calledUrl = replaceMock.mock.calls[0][0] as string;
    const url = new URL(calledUrl, 'https://example.com');
    expect(url.searchParams.get('plan')).toBe(result.current.planId);
  });
});
