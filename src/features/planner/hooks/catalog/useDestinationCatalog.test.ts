// src/hooks/catalog/useDestinationCatalog.test.ts

import { renderHook } from '@testing-library/react';

vi.mock('./useCatalogActivities', () => ({
  useCatalogActivities: vi.fn(),
}));

import { useCatalogActivities } from './useCatalogActivities';
import { useDestinationCatalog } from './useDestinationCatalog';

const mockUseCatalogActivities = vi.mocked(useCatalogActivities);

describe('useDestinationCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns activities and categories', () => {
    const mockActivities = [
      { id: '1', name: 'Louvre', category: 'museum' },
      { id: '2', name: 'Arc', category: 'monument' },
    ];
    mockUseCatalogActivities.mockReturnValue({
      activities: mockActivities,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useDestinationCatalog(true, 'p1', 'rome'));

    expect(result.current.activities).toEqual(mockActivities);
    expect(result.current.categories).toEqual(['monument', 'museum']);
    expect(result.current.error).toBeNull();
  });

  test('handles errors', () => {
    mockUseCatalogActivities.mockReturnValue({
      activities: [],
      isLoading: false,
      isError: true,
    });

    const { result } = renderHook(() => useDestinationCatalog(true, 'p1', 'rome'));

    expect(result.current.error).toBe('Failed to load catalog.');
    expect(result.current.activities).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
