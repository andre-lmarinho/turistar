import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/shared/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { usePlanResource } from '@/features/planner/hooks/internal/usePlanResource';
import { supabase } from '@/shared/lib/supabaseClient';

function createWrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function createBuilder(result: { data: unknown; error: unknown }) {
  const builder: any = {
    __updatePayload: undefined as unknown,
    select: vi.fn(() => builder),
    update: vi.fn((changes: unknown) => {
      builder.__updatePayload = changes;
      return builder;
    }),
    eq: vi.fn(() => builder),
    abortSignal: vi.fn(() => builder),
    single: vi.fn(async () => result),
  };
  return builder;
}

describe('usePlanResource', () => {
  beforeEach(() => {
    vi.mocked(supabase.from).mockReset();
  });

  it('uses the default fetcher and persist when table and column are provided', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const fetchBuilder = createBuilder({ data: { title: 'Original' }, error: null });
    const updateBuilder = createBuilder({ data: { title: 'Updated' }, error: null });
    const onSuccess = vi.fn();

    let callCount = 0;
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      expect(table).toBe('plans');
      callCount += 1;
      return callCount === 1 ? fetchBuilder : updateBuilder;
    });

    const { result } = renderHook(
      () =>
        usePlanResource<string, string>({
          planId: 'plan-1',
          resource: 'plan-title',
          table: 'plans',
          column: 'title',
          onSuccess,
        }),
      { wrapper: createWrapper(client) }
    );

    await waitFor(() => expect(result.current.data).toBe('Original'));

    expect(fetchBuilder.select).toHaveBeenCalledWith('title');
    expect(fetchBuilder.eq).toHaveBeenCalledWith('id', 'plan-1');
    expect(fetchBuilder.abortSignal).toHaveBeenCalled();
    expect(client.getQueryData(['plan-title', 'plan-1'])).toBe('Original');

    await act(async () => {
      await result.current.mutateAsync('Updated');
    });

    expect(updateBuilder.update).toHaveBeenCalledWith({ title: 'Updated' });
    expect(updateBuilder.select).toHaveBeenCalledWith('title');
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'plan-1');
    expect(onSuccess).toHaveBeenCalledWith('Updated', client);

    client.clear();
  });

  it('defaults to plan_id column for non-plan tables', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const builder = createBuilder({ data: { notes: 'Notes' }, error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      expect(table).toBe('plan_days');
      return builder;
    });

    const { result } = renderHook(
      () =>
        usePlanResource<string, string>({
          planId: 'plan-2',
          resource: ['plan', 'days'],
          table: 'plan_days',
          column: 'notes',
        }),
      { wrapper: createWrapper(client) }
    );

    await waitFor(() => expect(result.current.data).toBe('Notes'));

    expect(builder.select).toHaveBeenCalledWith('notes');
    expect(builder.eq).toHaveBeenCalledWith('plan_id', 'plan-2');
    expect(client.getQueryData(['plan', 'days', 'plan-2'])).toBe('Notes');

    client.clear();
  });

  it('supports custom fetcher and persist functions', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const fetcher = vi.fn().mockResolvedValue('Custom Data');
    const persistFn = vi.fn().mockResolvedValue('Saved');

    const { result } = renderHook(
      () =>
        usePlanResource<string, string>({
          planId: 'plan-3',
          resource: 'custom',
          fetcher,
          persistFn,
        }),
      { wrapper: createWrapper(client) }
    );

    await waitFor(() => expect(fetcher).toHaveBeenCalledWith('plan-3', expect.any(AbortSignal)));
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result.current.data).toBe('Custom Data');

    await act(async () => {
      await result.current.mutateAsync('payload');
    });

    expect(persistFn).toHaveBeenCalledWith('plan-3', 'payload', expect.any(AbortSignal));

    client.clear();
  });

  it('propagates errors from the default fetcher', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const error = new Error('fetch failed');
    const builder = createBuilder({ data: null, error: null });
    builder.single.mockRejectedValue(error);

    vi.mocked(supabase.from).mockImplementation(() => builder);

    const { result } = renderHook(
      () =>
        usePlanResource<string>({
          planId: 'plan-4',
          resource: 'error-fetch',
          table: 'plans',
          retry: false,
          enabled: false,
        }),
      { wrapper: createWrapper(client) }
    );

    let refetchResult: Awaited<ReturnType<typeof result.current.refetch>>;
    await act(async () => {
      refetchResult = await result.current.refetch({ throwOnError: false });
    });

    expect(supabase.from).toHaveBeenCalledWith('plans');
    expect(refetchResult!.error).toBe(error);

    client.clear();
  });

  it('propagates errors from the default persist function', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const error = new Error('persist failed');
    const fetchBuilder = createBuilder({ data: { title: 'Original' }, error: null });
    const updateBuilder = createBuilder({ data: null, error });

    let call = 0;
    vi.mocked(supabase.from).mockImplementation(() => {
      call += 1;
      return call === 1 ? fetchBuilder : updateBuilder;
    });

    const { result } = renderHook(
      () =>
        usePlanResource<string, string>({
          planId: 'plan-5',
          resource: 'plan-error',
          table: 'plans',
          column: 'title',
        }),
      { wrapper: createWrapper(client) }
    );

    await waitFor(() => expect(result.current.data).toBe('Original'));

    await expect(
      act(async () => {
        await result.current.mutateAsync('Next');
      })
    ).rejects.toBe(error);

    client.clear();
  });
});
