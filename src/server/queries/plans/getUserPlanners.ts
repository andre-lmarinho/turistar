import 'server-only';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

export type UserPlannerSummary = {
  id: string;
  title: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  updatedAt: string | null;
  publicSlug: string;
  editToken: string;
};

export async function getUserPlanners(userId: string): Promise<UserPlannerSummary[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = (await supabase
    .from('plans')
    .select(
      `
        id,
        title,
        start_date,
        end_date,
        created_at,
        public_slug,
        edit_token,
        plan_destinations(destinations(name)),
        plan_snapshots(updated_at)
      `
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false, referencedTable: 'plan_snapshots' })
    .limit(50)) as unknown as {
    data: {
      id: string;
      title: string | null;
      start_date: string | null;
      end_date: string | null;
      created_at: string | null;
      public_slug: string;
      edit_token: string;
      plan_destinations: { destinations: { name: string | null } }[] | null;
      plan_snapshots: { updated_at: string | null }[] | null;
    }[] | null;
    error: unknown;
  };

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map((row) => {
    const destination = row.plan_destinations?.[0]?.destinations?.name ?? null;
    const updatedAt = row.plan_snapshots?.[0]?.updated_at ?? row.created_at ?? null;
    const title = row.title ?? destination ?? 'Untitled plan';

    return {
      id: row.id,
      title,
      destination,
      startDate: row.start_date,
      endDate: row.end_date,
      updatedAt,
      publicSlug: row.public_slug,
      editToken: row.edit_token,
    } satisfies UserPlannerSummary;
  });
}
