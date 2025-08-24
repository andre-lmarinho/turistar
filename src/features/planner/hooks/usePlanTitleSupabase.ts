// src/features/planner/hooks/usePlanTitleSupabase.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import { capitalize } from '@/shared/utils';
import { usePlanEditTokens } from '@/shared/lib/planEditToken';
import { updatePlanTitle } from '@/app/planner/actions/updatePlanTitle';
import { useSupabaseResource } from '@/shared/hooks/useSupabaseResource';

export function usePlanTitle(planId: string, defaultTitle = '', persist = true) {
  const initialTitle = capitalize(defaultTitle);

  const { getEditToken } = usePlanEditTokens();

  const { data: fetchedTitle = initialTitle, mutate } = useSupabaseResource<string, string>({
    queryKey: ['plan_title', planId],
    fetcher: async () => {
      const { data, error } = (await supabase
        .from('plans')
        .select('title')
        .eq('id', planId)
        .single()) as unknown as {
        data: { title: string } | null;
        error: unknown;
      };
      if (error) throw error;
      return data?.title ?? initialTitle;
    },
    persistFn: async (newTitle: string) => {
      const token = getEditToken(planId);
      if (!token) throw new Error('Missing edit token');
      await updatePlanTitle(planId, token, newTitle);
      return newTitle;
    },
    enabled: persist,
    onSuccess: (t, qc) => qc.setQueryData(['plan_title', planId], t),
  });

  const [localTitle, setLocalTitle] = useState(fetchedTitle);

  useEffect(() => {
    setLocalTitle(fetchedTitle);
  }, [fetchedTitle]);

  const saveTitle = persist ? () => mutate(localTitle) : () => {};

  return { title: localTitle, setTitle: setLocalTitle, saveTitle };
}
