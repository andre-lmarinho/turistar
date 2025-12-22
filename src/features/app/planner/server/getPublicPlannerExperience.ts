import { notFound } from 'next/navigation';
import { supabaseServer } from '@/shared/lib/supabaseServer';

import { SnapshotRowSchema, mapSnapshot } from '../services/supabase/planEventsSchemas';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import type { Entry } from '@/features/app/planner/types/budget';
import { buildInitialDays } from '@/features/app/planner/services/days/initialDays';
import { eachDayOfInterval } from 'date-fns';

export interface PlannerExperiencePayload {
  planId: string;
  title?: string;
  destination: string;
  initialDays?: DayPlan[];
  initialBudget?: number;
  initialEntries?: Entry[];
  canEdit: boolean;
  editToken?: string;
  isOwner: boolean;
  isAdmin: boolean;
  canManageMembers: boolean;
}

interface GetPublicPlannerExperienceArgs {
  slug: string;
  dest?: string;
  viewerUserId?: string;
  editToken?: string;
}

export async function getPublicPlannerExperience({
  slug,
  dest,
  viewerUserId,
  editToken,
}: GetPublicPlannerExperienceArgs): Promise<PlannerExperiencePayload> {
  const supabase = supabaseServer();

  const { data: planRow, error: planErr } = (await supabase
    .from('plans')
    .select(
      'id, title, plan_destinations(destinations(name)), user_id, edit_token, budget, start_date, end_date'
    )
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()) as unknown as {
    data: {
      id: string;
      title: string | null;
      user_id: string | null;
      edit_token: string;
      budget: number | null;
      plan_destinations: { destinations: { name: string } }[] | null;
      start_date: string | null;
      end_date: string | null;
    } | null;
    error: unknown;
  };

  if (planErr || !planRow) {
    notFound();
  }

  const planId = planRow.id;
  const planOwnerId = planRow.user_id;
  const planEditToken = planRow.edit_token;
  const initialBudget = planRow.budget ?? undefined;
  const title = planRow.title ?? undefined;
  const destination =
    dest ?? planRow.plan_destinations?.[0]?.destinations?.name ?? 'Destination TBD';

  const isOwner = Boolean(viewerUserId && planOwnerId && viewerUserId === planOwnerId);
  const tokenMatches = Boolean(editToken && editToken === planEditToken);
  let memberTier: string | null = null;

  if (viewerUserId && !isOwner) {
    const { data: memberRow, error: memberError } = (await supabase
      .from('plan_members')
      .select('tier')
      .eq('plan_id', planId)
      .eq('user_id', viewerUserId)
      .maybeSingle()) as unknown as {
      data: { tier: string } | null;
      error: unknown;
    };

    if (memberError) {
      throw memberError;
    }

    memberTier = memberRow?.tier ?? null;
  }

  const isMember = Boolean(memberTier);
  const isAdmin = isOwner || memberTier === 'admin';
  const canEdit = Boolean(isOwner || tokenMatches || isMember);
  const grantedToken = canEdit ? planEditToken : undefined;

  const { data: snapshotRow, error: snapshotErr } = (await supabase
    .from('plan_snapshots')
    .select('plan_id, version, state, updated_at')
    .eq('plan_id', planId)
    .maybeSingle()) as unknown as {
    data: unknown;
    error: unknown;
  };

  let initialDays: DayPlan[] | undefined;
  if (!snapshotErr && snapshotRow) {
    const snapshot = mapSnapshot(SnapshotRowSchema.parse(snapshotRow));
    if (snapshot.days.length > 0) {
      initialDays = snapshot.days;
    }
  }

  if (!initialDays || initialDays.length === 0) {
    const startDate = planRow.start_date ? new Date(planRow.start_date) : null;
    const endDate = planRow.end_date ? new Date(planRow.end_date) : null;

    if (
      startDate &&
      endDate &&
      !Number.isNaN(startDate.valueOf()) &&
      !Number.isNaN(endDate.valueOf())
    ) {
      const tripDays = eachDayOfInterval({ start: startDate, end: endDate });
      initialDays = buildInitialDays(tripDays);
    }
  }

  const { data: entryRows } = (await supabase
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
  };

  const initialEntries = entryRows?.map((entry) => ({
    id: entry.id,
    description: entry.description ?? '',
    category: (entry.category as Entry['category']) ?? 'transport',
    amount: entry.amount ?? 0,
  }));

  return {
    planId,
    title,
    destination,
    initialDays,
    initialBudget,
    initialEntries,
    canEdit,
    editToken: grantedToken,
    isOwner,
    isAdmin,
    canManageMembers: isAdmin,
  };
}
