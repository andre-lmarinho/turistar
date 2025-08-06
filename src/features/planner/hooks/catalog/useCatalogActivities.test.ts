// src/hooks/catalog/useCatalogActivities.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useCatalogActivities } from './useCatalogActivities';

const mockFrom = vi.fn();
vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: { from: (table: string) => mockFrom(table) },
}));

const { mockFetchCatalog } = vi.hoisted(() => ({ mockFetchCatalog: vi.fn() }));
vi.mock('./fetchCatalog', () => ({ fetchCatalog: mockFetchCatalog }));

describe('useCatalogActivities', () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockFetchCatalog.mockReset();
  });

  test('returns activities from database', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'plan_destinations') {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: [{ destination_id: 'd1' }],
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'catalog') {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [{ id: '1', name: 'Louvre', category: 'museum' }],
                error: null,
              }),
          }),
        };
      }
      return {};
    });
    const { result } = renderHook(() => useCatalogActivities('p1', 'rome', { enabled: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activities).toEqual([{ id: '1', name: 'Louvre', category: 'museum' }]);
    expect(mockFetchCatalog).not.toHaveBeenCalled();
    expect(result.current.isError).toBe(false);
  });

  test('handles missing data', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'plan_destinations') {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: [{ destination_id: 'd1' }],
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'catalog') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      return {};
    });
    mockFetchCatalog.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useCatalogActivities('p1', 'rome', { enabled: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activities).toEqual([]);
    expect(result.current.isError).toBe(true);
  });
});
