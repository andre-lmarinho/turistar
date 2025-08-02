// src/hooks/catalog/useCatalog.test.ts

import { renderHook } from '@testing-library/react';

vi.mock('./useCatalogActivities', () => ({
  useCatalogActivities: vi.fn(),
}));

import { useCatalogActivities } from './useCatalogActivities';
import { useCatalog } from './useCatalog';
import type { CatalogActivity } from '@/types';

const mockUseCatalogActivities = vi.mocked(useCatalogActivities);

describe('useCatalog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('splits activities into day buckets', () => {
    const activities = [
      { id: '1', name: 'A', category: 'c1', imageUrl: 'img1' },
      { id: '2', name: 'B', category: 'c1', imageUrl: 'img2' },
      { id: '3', name: 'C', category: 'c1', imageUrl: 'img3' },
      { id: '4', name: 'D', category: 'c1', imageUrl: 'img4' },
    ];
    mockUseCatalogActivities.mockReturnValue({
      activities,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useCatalog('p1', 'rome', { enabled: true }));

    expect(result.current.days).toHaveLength(2);
    expect(result.current.days?.[0].activities).toHaveLength(3);
    expect(result.current.days?.[1].activities).toHaveLength(1);
    expect(result.current.isError).toBe(false);
  });

  test('propagates error state', () => {
    mockUseCatalogActivities.mockReturnValue({
      activities: undefined as unknown as CatalogActivity[],
      isLoading: false,
      isError: true,
    });

    const { result } = renderHook(() => useCatalog('p1', 'rome', { enabled: true }));

    expect(result.current.days).toBeUndefined();
    expect(result.current.isError).toBe(true);
  });
});
