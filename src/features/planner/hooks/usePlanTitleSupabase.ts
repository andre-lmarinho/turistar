// src/features/planner/hooks/usePlanTitleSupabase.ts
import { useEffect, useState } from 'react';
import { capitalize } from '@/shared/utils/utils';
import { usePlanEditTokens } from '@/shared/lib/planEditToken';
import { updatePlanTitle } from '@/app/planner/actions/updatePlanTitle';
import { usePlanResource } from '@/shared/hooks/usePlanResource';

export function usePlanTitle(planId: string, defaultTitle = '', persist = true) {
  const initialTitle = capitalize(defaultTitle);

  const { getEditToken } = usePlanEditTokens();

  const { data: fetchedTitleRaw, mutate } = usePlanResource<string, string>({
    planId,
    resource: 'plan_title',
    table: 'plans',
    column: 'title',
    enabled: persist,
    persistFn: async (id, newTitle) => {
      const token = getEditToken(id);
      if (!token) throw new Error('Missing edit token');
      await updatePlanTitle(id, token, newTitle);
      return newTitle;
    },
    onSuccess: (t, qc) => qc.setQueryData(['plan_title', planId], t),
  });
  const fetchedTitle = fetchedTitleRaw ?? initialTitle;

  const [localTitle, setLocalTitle] = useState(fetchedTitle);

  useEffect(() => {
    setLocalTitle(fetchedTitle);
  }, [fetchedTitle]);

  const saveTitle = persist ? () => mutate(localTitle) : () => {};

  return { title: localTitle, setTitle: setLocalTitle, saveTitle };
}
