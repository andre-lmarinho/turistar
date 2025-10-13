import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

const KEY = 'plan_edit_tokens'; // map of plan_id -> token

/**
 * Provides helpers to persist and retrieve plan edit tokens.
 */
export function usePlanEditTokens() {
  const [tokens, setTokens] = useLocalStorage<Record<string, string>>(KEY, {});

  const saveEditToken = (planId: string, token: string) => {
    setTokens({ ...tokens, [planId]: token });
  };

  const getEditToken = (planId: string): string | undefined => tokens[planId];

  return { saveEditToken, getEditToken };
}
