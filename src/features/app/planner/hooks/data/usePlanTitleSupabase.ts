import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { capitalize } from '@/shared/utils/capitalize';
import { usePlanEditTokens } from '@/features/app/planner/hooks/data/usePlanEditTokens';
import { updatePlanTitle } from '@/app/(webapp)/p/actions/plans/updatePlanTitle';
import { supabase } from '@/shared/lib/supabaseClient';

type PlanTitleRow = { title: string | null };

export function usePlanTitle(
  planId: string,
  defaultTitle = '',
  persist = true,
  options?: { canEdit?: boolean; editToken?: string }
) {
  const initialTitle = capitalize(defaultTitle);

  const canEdit = options?.canEdit ?? true;
  const providedToken = options?.editToken;
  const { getEditToken } = usePlanEditTokens({ enabled: !providedToken });
  const qc = useQueryClient();
  const queryKey = ['plan_title', planId] as const;

  const { data: fetchedTitleRaw } = useQuery<string | null>({
    queryKey,
    enabled: persist,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = (await supabase
        .from('plans')
        .select('title')
        .eq('id', planId)
        .single()) as { data: PlanTitleRow | null; error: unknown };
      if (error) throw error;
      return data?.title ?? null;
    },
  });

  const fetchedTitle = fetchedTitleRaw ?? initialTitle;

  const { mutate } = useMutation({
    mutationFn: async (newTitle: string) => {
      const token = providedToken ?? getEditToken(planId);
      if (!token) throw new Error('Missing edit token');
      await updatePlanTitle(planId, token, newTitle);
      return newTitle;
    },
    onSuccess: (title: string) => qc.setQueryData(queryKey, title),
  });

  const [localTitle, setLocalTitle] = useState(fetchedTitle);

  useEffect(() => {
    setLocalTitle(fetchedTitle);
  }, [fetchedTitle]);

  const saveTitle = persist && canEdit ? () => mutate(localTitle) : () => {};

  return { title: localTitle, setTitle: setLocalTitle, saveTitle };
}
