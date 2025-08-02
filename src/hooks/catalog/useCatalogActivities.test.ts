// src/hooks/catalog/useCatalogActivities.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useCatalogActivities } from './useCatalogActivities';

vi.mock('./fetchCatalog', () => ({
  fetchCatalog: vi.fn(() => Promise.reject(new Error('fail'))),
}));

describe('useCatalogActivities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns activities from storage', async () => {
    const mockActivities = [{ id: '1', name: 'Louvre', category: 'museum' }];
    localStorage.setItem('catalog-p1', JSON.stringify(mockActivities));

    const { result } = renderHook(() => useCatalogActivities('p1', 'rome', { enabled: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activities).toEqual(mockActivities);
    expect(result.current.isError).toBe(false);
  });

  test('handles missing data', async () => {
    const { result } = renderHook(() => useCatalogActivities('p1', 'rome', { enabled: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activities).toEqual([]);
    expect(result.current.isError).toBe(true);
  });
});
