// src/hooks/catalog/useCatalogActivities.test.ts

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks', () => ({
  fetchCatalog: vi.fn(),
}));

import { fetchCatalog } from '@/hooks';
import { useCatalogActivities } from './useCatalogActivities';

const mockFetchCatalog = vi.mocked(fetchCatalog);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useCatalogActivities', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('returns activities on success', async () => {
    const mockActivities = [{ id: '1', name: 'Louvre', category: 'museum' }];
    mockFetchCatalog.mockResolvedValue({ activities: mockActivities });

    const { result } = renderHook(() => useCatalogActivities('Paris', { enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activities).toEqual(mockActivities);
    expect(result.current.isError).toBe(false);
  });

  test('handles errors', async () => {
    mockFetchCatalog.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useCatalogActivities('Paris', { enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.activities).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});
