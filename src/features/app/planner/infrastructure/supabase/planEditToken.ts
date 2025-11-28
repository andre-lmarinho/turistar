import { useCallback } from 'react';

import { useLocalStorage } from '@/features/app/planner/hooks/data/useLocalStorage';

const KEY = 'plan_edit_tokens'; // map of plan_id -> token

type UsePlanEditTokensOptions = {
  enabled?: boolean;
};

/**
 * Provides helpers to persist and retrieve plan edit tokens.
 */
export function usePlanEditTokens(options?: UsePlanEditTokensOptions) {
  const enabled = options?.enabled ?? true;
  const [tokens, setTokens] = useLocalStorage<Record<string, string>>(KEY, {}, { enabled });

  const saveEditToken = useCallback(
    (planId: string, token: string) => {
      if (!enabled) return;
      setTokens((previous) => ({ ...previous, [planId]: token }));
    },
    [enabled, setTokens]
  );

  const getEditToken = useCallback(
    (planId: string): string | undefined => {
      if (!enabled) {
        return undefined;
      }
      return tokens[planId];
    },
    [enabled, tokens]
  );

  return { saveEditToken, getEditToken };
}
