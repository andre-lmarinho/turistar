// src/hooks/catalog/useDestinationCatalog.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDestinationCatalog } from './useDestinationCatalog';

afterEach(() => {
  vi.restoreAllMocks();
});

const activities = [
  {
    id: '1',
    name: 'Beach Fun',
    description: 'Sun and sand',
    duration: 2,
    image_url: '',
    price: '$15',
    category: 'outdoors',
    rating: 4.2,
    reviewcount: '100',
  },
  {
    id: '2',
    name: 'Museum Tour',
    description: 'History museum',
    duration: 3,
    image_url: '',
    price: '$20',
    category: 'culture',
    rating: 4.8,
    reviewcount: '50',
  },
  {
    id: '3',
    name: 'City Walk',
    description: 'Walking around the city',
    duration: 1,
    image_url: '',
    price: '$5',
    category: 'outdoors',
    rating: 3.9,
    reviewcount: '150',
  },
];

describe('useDestinationCatalog', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ activities }),
    } as unknown as Response);
  });

  it('filters by search term and category', async () => {
    const { result } = renderHook(() => useDestinationCatalog(true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.toggleCat('outdoors');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual(['Beach Fun', 'City Walk']);

    act(() => {
      result.current.setSearch('city');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual(['City Walk']);
  });

  it('sorts by price and duration', async () => {
    const { result } = renderHook(() => useDestinationCatalog(true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSortMode('Price');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual([
      'Beach Fun',
      'Museum Tour',
      'City Walk',
    ]);

    act(() => {
      result.current.setSortMode('Duration');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual([
      'City Walk',
      'Beach Fun',
      'Museum Tour',
    ]);
  });

  it('sorts by rating and reviews', async () => {
    const { result } = renderHook(() => useDestinationCatalog(true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSortMode('Rating');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual([
      'Museum Tour',
      'Beach Fun',
      'City Walk',
    ]);

    act(() => {
      result.current.setSortMode('Reviews');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual([
      'City Walk',
      'Beach Fun',
      'Museum Tour',
    ]);
  });
});
