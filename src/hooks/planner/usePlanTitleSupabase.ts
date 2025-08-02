// src/hooks/planner/usePlanTitleSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { capitalize } from '@/lib/utils';

export function usePlanTitle(planId: string, defaultTitle = '') {
  const qc = useQueryClient();
  const initialTitle = capitalize(defaultTitle);

  const { data: title = initialTitle } = useQuery({
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
  });

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

  return { title, setTitle: (t: string) => mutation.mutate(t) };
}
