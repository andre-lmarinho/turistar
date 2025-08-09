// src/features/planner/hooks/usePlanTitleSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import { capitalize } from '@/shared/utils';
import { getEditToken } from '@/shared/lib/planEditToken';
import { updatePlanTitle } from '@/app/planner/actions/updatePlanTitle';

export function usePlanTitle(planId: string, defaultTitle = '', persist = true) {
  const initialTitle = capitalize(defaultTitle);

  const qc = useQueryClient();

  const { data: fetchedTitle = initialTitle } = useQuery({
    queryKey: ['plan_title', planId],
    queryFn: async () => {
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
    initialData: initialTitle,
    enabled: persist,
  });

  const [localTitle, setLocalTitle] = useState(fetchedTitle);

  useEffect(() => {
    setLocalTitle(fetchedTitle);
  }, [fetchedTitle]);

  const mutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const token = getEditToken(planId);
      if (!token) throw new Error('Missing edit token');
      await updatePlanTitle(planId, token, newTitle);
      return newTitle;
    },
    onSuccess: (t) => qc.setQueryData(['plan_title', planId], t),
  });

  const saveTitle = persist ? () => mutation.mutate(localTitle) : () => {};

  return { title: localTitle, setTitle: setLocalTitle, saveTitle };
}
