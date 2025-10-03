import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useSupabaseResource } from '@/shared/hooks/useSupabaseResource';

function createWrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('useSupabaseResource', () => {
  it('does not run the fetcher when disabled', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const fetcher = vi.fn().mockResolvedValue('data');

    renderHook(
      () =>
        useSupabaseResource({
          queryKey: ['resource'],
          fetcher,
          enabled: false,
        }),
      { wrapper: createWrapper(client) }
    );

    await flushMicrotasks();

    expect(fetcher).not.toHaveBeenCalled();
    client.clear();
  });

  it('uses the persistFn, aborts previous calls, and invalidates the query on success', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');
    const persistCalls: {
      payload: string;
      signal: AbortSignal;
      resolve: (value: unknown) => void;
    }[] = [];

    const persistFn = vi.fn((payload: string, signal: AbortSignal) => {
      return new Promise((resolve) => {
        persistCalls.push({ payload, signal, resolve });
      });
    });

    const { result } = renderHook(
      () =>
        useSupabaseResource<string, string>({
          queryKey: ['resource'],
          persistFn,
        }),
      { wrapper: createWrapper(client) }
    );

    let firstPromise: Promise<unknown>;
    await act(async () => {
      firstPromise = result.current.mutateAsync('first');
    });

    await waitFor(() => expect(persistFn).toHaveBeenCalledTimes(1));
    const firstSignal = persistCalls[0].signal;

    let secondPromise: Promise<unknown>;
    await act(async () => {
      secondPromise = result.current.mutateAsync('second');
    });

    await waitFor(() => expect(persistFn).toHaveBeenCalledTimes(2));

    expect(firstSignal.aborted).toBe(true);
    expect(persistCalls[1]).toMatchObject({ payload: 'second' });
    expect(persistCalls[1].signal).toBeInstanceOf(AbortSignal);

    persistCalls[0].resolve('first-result');
    persistCalls[1].resolve('second-result');

    await act(async () => {
      await Promise.all([firstPromise!, secondPromise!]);
    });

    expect(invalidateSpy).toHaveBeenCalledTimes(2);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['resource'] });

    client.clear();
  });

  it('calls the provided onSuccess callback instead of invalidating queries', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');
    const onSuccess = vi.fn();
    const persistFn = vi.fn().mockResolvedValue('ok');

    const { result } = renderHook(
      () =>
        useSupabaseResource<string, string>({
          queryKey: ['resource'],
          persistFn,
          onSuccess,
        }),
      { wrapper: createWrapper(client) }
    );

    await act(async () => {
      await result.current.mutateAsync('payload');
    });

    expect(onSuccess).toHaveBeenCalledWith('ok', client);
    expect(invalidateSpy).not.toHaveBeenCalled();

    client.clear();
  });

  it('propagates errors from persistFn and calls onError', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const error = new Error('persist failed');
    const onError = vi.fn();
    const persistFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useSupabaseResource<string, string>({
          queryKey: ['resource'],
          persistFn,
          onError,
        }),
      { wrapper: createWrapper(client) }
    );

    await act(async () => {
      await expect(result.current.mutateAsync('payload')).rejects.toBe(error);
    });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error, 'payload', undefined));

    client.clear();
  });
});
