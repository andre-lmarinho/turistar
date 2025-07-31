// src/hooks/catalog/useDestinationAutocomplete.test.ts

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks', () => ({
  fetchAutocomplete: vi.fn(),
}));

import { fetchAutocomplete } from '@/hooks';
import { useDestinationAutocomplete } from './useDestinationAutocomplete';

const mockFetchAutocomplete = vi.mocked(fetchAutocomplete);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useDestinationAutocomplete', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('provides results on success', async () => {
    const mockResults = [{ name: 'Paris', latitude: 1, longitude: 2 }];
    mockFetchAutocomplete.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useDestinationAutocomplete('pari'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.results).toEqual(mockResults);
    expect(result.current.error).toBe(false);
  });

  test('handles errors', async () => {
    mockFetchAutocomplete.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useDestinationAutocomplete('pari'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe(true));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
