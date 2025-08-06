// src/hooks/catalog/useGeoapifySearch.test.ts

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('./fetchSearch', () => ({
  fetchSearch: vi.fn(),
}));
import { fetchSearch } from './fetchSearch';
import { useGeoapifySearch } from './useGeoapifySearch';

const mockFetchSearch = vi.mocked(fetchSearch);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useGeoapifySearch', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('provides results on success', async () => {
    const mockActivities = [{ id: '1', name: 'Louvre', category: 'museum' }];
    mockFetchSearch.mockResolvedValue(mockActivities);

    const { result } = renderHook(() => useGeoapifySearch('pari'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.results).toEqual(mockActivities);
    expect(result.current.error).toBe(false);
  });

  test('handles errors', async () => {
    mockFetchSearch.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useGeoapifySearch('pari'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe(true));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
