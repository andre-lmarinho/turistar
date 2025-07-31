// src/hooks/catalog/useDestinationCatalog.test.ts

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks', () => ({
  fetchCatalog: vi.fn(),
}));

import { fetchCatalog } from '@/hooks';
import { useDestinationCatalog } from './useDestinationCatalog';

const mockFetchCatalog = vi.mocked(fetchCatalog);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useDestinationCatalog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('returns visibleItems on success', async () => {
    const mockActivities = [{ id: '1', name: 'Louvre', category: 'museum' }];
    mockFetchCatalog.mockResolvedValue({ activities: mockActivities });

    const { result } = renderHook(() => useDestinationCatalog(true, ['museum'], 'Paris'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.visibleItems).toEqual(mockActivities);
    expect(result.current.error).toBeNull();
  });

  test('handles errors', async () => {
    mockFetchCatalog.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useDestinationCatalog(true, ['museum'], 'Paris'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe('Failed to load catalog.'));

    expect(result.current.visibleItems).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
