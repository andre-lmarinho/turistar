// src/hooks/planner/usePlanTitleSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export function usePlanTitle(planId: string, defaultTitle = '') {
  const qc = useQueryClient();

  const { data: title = defaultTitle } = useQuery({
    queryKey: ['plan_title', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('title')
        .eq('id', planId)
        .single();
      if (error) throw error;
      return data?.title ?? defaultTitle;
    },
    initialData: defaultTitle,
  });

  const mutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const { error } = await supabase.from('plans').update({ title: newTitle }).eq('id', planId);
      if (error) throw error;
      return newTitle;
    },
    onSuccess: (t) => qc.setQueryData(['plan_title', planId], t),
  });

  return { title, setTitle: (t: string) => mutation.mutate(t) };
}
