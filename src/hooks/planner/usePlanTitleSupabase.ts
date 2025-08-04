// src/hooks/planner/usePlanTitleSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { capitalize } from '@/lib/utils';

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
      const { error } = (await supabase
        .from('plans')
        .update({ title: newTitle })
        .eq('id', planId)) as unknown as { error: unknown };
      if (error) throw error;
      return newTitle;
    },
    onSuccess: (t) => qc.setQueryData(['plan_title', planId], t),
  });

  const saveTitle = persist ? () => mutation.mutate(localTitle) : () => {};

  return { title: localTitle, setTitle: setLocalTitle, saveTitle };
}
