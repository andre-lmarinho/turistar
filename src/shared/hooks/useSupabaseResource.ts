import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
  type QueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useRef } from 'react';

interface UseSupabaseResourceArgs<TData, TPayload> {
  queryKey: QueryKey;
  fetcher?: (signal: AbortSignal) => Promise<TData>;
  persistFn?: (payload: TPayload, signal: AbortSignal) => Promise<unknown>;
  enabled?: boolean;
  onSuccess?: (data: unknown, qc: QueryClient) => void;
  onError?: (error: unknown) => void;
}

export function useSupabaseResource<TData = unknown, TPayload = unknown>({
  queryKey,
  fetcher,
  persistFn,
  enabled = true,
  onSuccess,
  onError,
}: UseSupabaseResourceArgs<TData, TPayload>) {
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const query = useQuery<TData>({
    queryKey,
    queryFn: ({ signal }) => (fetcher ? fetcher(signal) : Promise.resolve(null as TData)),
    enabled: enabled && Boolean(fetcher),
  }) as UseQueryResult<TData>;

  const mutation = useMutation<unknown, unknown, TPayload>({
    mutationFn: async (payload: TPayload) => {
      if (!persistFn) return undefined;
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      return persistFn(payload, abortRef.current.signal);
    },
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data, qc);
      else qc.invalidateQueries({ queryKey });
    },
    onError,
  }) as UseMutationResult<unknown, unknown, TPayload>;

  return {
    ...query,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export default useSupabaseResource;
