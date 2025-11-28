import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createLocationAutocompleteHook } from '@/features/app/planner/hooks/search/createLocationAutocompleteHook';

const { mockUseQuery } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: mockUseQuery,
}));

describe('createLocationAutocompleteHook', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds the query key with trimmed text and coordinates', async () => {
    mockUseQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
    const hook = createLocationAutocompleteHook({
      endpoint: '/api/autocomplete',
      queryKeyPrefix: 'test-autocomplete',
      minimumQueryLength: 3,
    });

    const result = hook('  Paris  ', { enabled: true, latitude: 1, longitude: 2 });

    expect(result).toEqual({ results: [], loading: false, error: false });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['test-autocomplete', 'Paris', 1, 2],
        enabled: true,
      })
    );

    const queryFn = mockUseQuery.mock.calls[0]?.[0]?.queryFn;
    const mockJson = vi.fn().mockResolvedValue({ results: [] });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: mockJson,
    } as unknown as Response);

    const abortController = new AbortController();

    await queryFn({ signal: abortController.signal });

    expect(fetchSpy).toHaveBeenCalledWith('/api/autocomplete?text=Paris&lat=1&lon=2', {
      signal: abortController.signal,
    });
  });

  it('disables the query when below the minimum length', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });
    const hook = createLocationAutocompleteHook({
      endpoint: '/api/autocomplete/addresses',
      queryKeyPrefix: 'address',
      minimumQueryLength: 5,
    });

    const response = hook(' ab ', {});

    expect(response).toEqual({ results: [], loading: false, error: false });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['address', 'ab', undefined, undefined],
        enabled: false,
      })
    );
  });
});
