import { supabase } from '@/shared/lib/supabaseClient';
import { useSupabaseResource } from './useSupabaseResource';
import type { QueryClient, QueryKey } from '@tanstack/react-query';

interface UsePlanResourceArgs<TData, TPayload> {
  planId: string;
  resource: string | QueryKey;
  table?: string;
  column?: string;
  idColumn?: string;
  fetcher?: (planId: string, signal: AbortSignal) => Promise<TData>;
  persistFn?: (planId: string, payload: TPayload, signal: AbortSignal) => Promise<unknown>;
  enabled?: boolean;
  onSuccess?: (data: unknown, qc: QueryClient) => void;
  onError?: (error: unknown) => void;
}

export function usePlanResource<TData = unknown, TPayload = unknown>({
  planId,
  resource,
  table,
  column,
  idColumn = table === 'plans' ? 'id' : 'plan_id',
  fetcher,
  persistFn,
  ...rest
}: UsePlanResourceArgs<TData, TPayload>) {
  const queryKey = Array.isArray(resource) ? [...resource, planId] : [resource, planId];

  const defaultFetcher = table
    ? async (id: string, signal: AbortSignal) => {
        const { data, error } = await supabase
          .from(table)
          .select(column ?? '*')
          .eq(idColumn, id)
          // @ts-expect-error abortSignal not typed in supabase-js
          .abortSignal?.(signal)
          .single();
        if (error) throw error;
        return column ? ((data as Record<string, unknown>)[column] as TData) : (data as TData);
      }
    : undefined;

  const defaultPersist = table
    ? async (id: string, payload: TPayload, signal: AbortSignal) => {
        const changes = column ? { [column]: payload } : (payload as Record<string, unknown>);
        const { data, error } = await supabase
          .from(table)
          .update(changes)
          .eq(idColumn, id)
          .select(column ?? '*')
          // @ts-expect-error abortSignal not typed in supabase-js
          .abortSignal?.(signal)
          .single();
        if (error) throw error;
        return column ? ((data as Record<string, unknown>)[column] as TData) : (data as TData);
      }
    : undefined;

  return useSupabaseResource<TData, TPayload>({
    queryKey,
    fetcher: fetcher
      ? (signal) => fetcher(planId, signal)
      : table
        ? (signal) => defaultFetcher!(planId, signal)
        : undefined,
    persistFn: persistFn
      ? (payload, signal) => persistFn(planId, payload, signal)
      : table
        ? (payload, signal) => defaultPersist!(planId, payload, signal)
        : undefined,
    ...rest,
  });
}
