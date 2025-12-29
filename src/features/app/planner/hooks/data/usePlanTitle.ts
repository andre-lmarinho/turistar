import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { capitalize } from '@/shared/utils/capitalize';
import { usePlanEditTokens } from '@/features/app/planner/hooks/data/usePlanEditTokens';
import { updatePlanTitle } from '@/app/(webapp)/p/actions/plans/updatePlanTitle';

type PlanTitleResponse = { title?: string | null };

async function fetchPlanTitle(planId: string): Promise<string | null> {
  const response = await fetch(`/api/plans/title?planId=${encodeURIComponent(planId)}`, {
    method: 'GET',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error(
      `fetchPlanTitle failed: planId=${planId} status=${response.status}`
    );
  }

  const data = (await response.json()) as PlanTitleResponse;
  if (typeof data.title !== 'string') {
    return null;
  }

  return data.title;
}

export function usePlanTitle(
  planId: string,
  defaultTitle = '',
  persist = true,
  options?: { canEdit?: boolean; editToken?: string }
) {
  const initialTitle = capitalize(defaultTitle);

  const canEdit = options?.canEdit ?? true;
  const providedToken = options?.editToken;
  const persistEnabled = persist && Boolean(planId);
  const canPersist = persistEnabled && canEdit;
  const { getEditToken } = usePlanEditTokens({
    enabled: canPersist && !providedToken,
  });
  const qc = useQueryClient();
  const queryKey = ['plan_title', planId] as const;

  const { data: fetchedTitleRaw } = useQuery<string | null>({
    queryKey,
    enabled: persistEnabled,
    queryFn: async () => fetchPlanTitle(planId),
  });

  const fetchedTitle = fetchedTitleRaw ?? initialTitle;

  const { mutate } = useMutation({
    mutationFn: async (newTitle: string) => {
      if (!planId) {
        throw new Error('updatePlanTitle failed: missing planId');
      }
      const token = providedToken ?? getEditToken(planId);
      if (!token) {
        throw new Error(`updatePlanTitle failed: planId=${planId} missing edit token`);
      }
      await updatePlanTitle(planId, token, newTitle);
      return newTitle;
    },
    onSuccess: (title: string) => qc.setQueryData(queryKey, title),
  });

  const [localTitle, setLocalTitle] = useState(fetchedTitle);

  useEffect(() => {
    setLocalTitle(fetchedTitle);
  }, [fetchedTitle]);

  const saveTitle = canPersist ? () => mutate(localTitle) : () => {};

  return { title: localTitle, setTitle: setLocalTitle, saveTitle };
}
