'use server';

import { supabaseServer } from '@/shared/lib/supabaseServer';
import { format } from 'date-fns';

export async function setPlanDateRange(planId: string, from: Date, to: Date) {
  const supabase = supabaseServer();
  const { error } = await supabase
    .from('plans')
    .update({
      start_date: format(from, 'yyyy-MM-dd'),
      end_date: format(to, 'yyyy-MM-dd'),
    })
    .eq('id', planId)
    .select('id')
    .single();
  if (error) {
    const failure = error as { message?: string } | null;
    throw new Error(failure?.message ?? 'Failed to update plan date range');
  }
}
