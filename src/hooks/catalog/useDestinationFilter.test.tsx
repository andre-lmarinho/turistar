// src/hooks/catalog/useDestinationFilter.test.tsx

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDestinationFilter } from './useDestinationFilter';

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
  },
  {
    id: '2',
    name: 'Museum Tour',
    description: 'History museum',
    duration: 3,
    image_url: '',
    price: '$20',
    category: 'culture',
  },
  {
    id: '3',
    name: 'City Walk',
    description: 'Walking around the city',
    duration: 1,
    image_url: '',
    price: '$5',
    category: 'outdoors',
  },
];

describe('useDestinationFilter', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ activities }),
    } as unknown as Response);
  });

  it('returns the starter city and filters by category and search', async () => {
    const { result } = renderHook(() => useDestinationFilter(true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.city).toBe('Salvador');

    act(() => {
      result.current.toggleCat('outdoors');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual(['Beach Fun', 'City Walk']);

    act(() => {
      result.current.setSearch('city');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual(['City Walk']);
  });

  it('resets filter when category toggled off', async () => {
    const { result } = renderHook(() => useDestinationFilter(true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.toggleCat('outdoors');
    });

    expect(result.current.visibleItems).toHaveLength(2);

    act(() => {
      result.current.toggleCat('outdoors');
    });

    expect(result.current.visibleItems).toHaveLength(3);

    act(() => {
      result.current.setSearch('museum');
    });

    expect(result.current.visibleItems.map((a) => a.name)).toEqual(['Museum Tour']);
  });
});
