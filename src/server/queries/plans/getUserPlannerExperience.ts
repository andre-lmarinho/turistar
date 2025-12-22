import 'server-only';

import { notFound } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import type { Entry } from '@/features/app/planner/types/budget';
import { SnapshotRowSchema, mapSnapshot } from '@/features/app/planner/services/supabase/planEventsSchemas';

export interface UserPlannerExperience {
  planId: string;
  title?: string;
  destination: string;
  initialDays?: DayPlan[];
  initialBudget?: number;
  initialEntries?: Entry[];
  editToken: string;
  isOwner: boolean;
  isAdmin: boolean;
  canManageMembers: boolean;
}

export async function getUserPlannerExperience(
  planId: string,
  userId: string
): Promise<UserPlannerExperience> {
  const supabase = createSupabaseServerClient();
  const { data, error } = (await supabase
    .from('plans')
    .select(
      `
        id,
        title,
        plan_destinations(destinations(name)),
        edit_token,
        budget,
        user_id,
        start_date,
        end_date,
        plan_members!left(user_id, tier)
      `
    )
    .eq('id', planId)
    .maybeSingle()) as unknown as {
    data: {
      id: string;
      title: string | null;
      edit_token: string;
      budget: number | null;
      user_id: string | null;
      start_date: string | null;
      end_date: string | null;
      plan_destinations: { destinations: { name: string | null } }[] | null;
      plan_members: { user_id: string; tier: string }[] | null;
    } | null;
    error: unknown;
  };

  if (error) {
    throw error;
  }

  if (!data) {
    notFound();
  }

  const ownerId = data.user_id;
  const memberRow = data.plan_members?.find((member) => member.user_id === userId) ?? null;
  const isOwner = ownerId === userId;
  const isMember = Boolean(memberRow);
  const isAdmin = isOwner || memberRow?.tier === 'admin';

  if (!isOwner && !isMember) {
    notFound();
  }

  const destination = data.plan_destinations?.[0]?.destinations?.name ?? undefined;

  if (!destination) {
    notFound();
  }

  const { data: snapshotRow, error: snapshotErr } = (await supabase
    .from('plan_snapshots')
    .select('plan_id, version, state, updated_at')
    .eq('plan_id', planId)
    .maybeSingle()) as unknown as {
    data: unknown;
    error: unknown;
  };

  if (snapshotErr) {
    throw snapshotErr;
  }

  let initialDays: DayPlan[] | undefined;
  if (snapshotRow) {
    const snapshot = mapSnapshot(SnapshotRowSchema.parse(snapshotRow));
    initialDays = snapshot.days.length > 0 ? snapshot.days : undefined;
  }

  const { data: entryRows, error: entryErr } = (await supabase
    .from('budget_entries')
    .select('id, description, category, amount')
    .eq('plan_id', planId)) as unknown as {
    data:
      | {
          id: string;
          description: string | null;
          category: string | null;
          amount: number | null;
        }[]
      | null;
    error: unknown;
  };

  if (entryErr) {
    throw entryErr;
  }

  const initialEntries = entryRows?.map((entry) => ({
    id: entry.id,
    description: entry.description ?? '',
    category: (entry.category as Entry['category']) ?? 'transport',
    amount: entry.amount ?? 0,
  }));

  return {
    planId,
    title: data.title ?? undefined,
    destination,
    initialDays,
    initialBudget: data.budget ?? undefined,
    initialEntries,
    editToken: data.edit_token,
    isOwner,
    isAdmin,
    canManageMembers: isAdmin,
  };
}
