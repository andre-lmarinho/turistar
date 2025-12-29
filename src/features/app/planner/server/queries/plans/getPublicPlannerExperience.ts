import { notFound } from 'next/navigation';

import { SnapshotRowSchema, mapSnapshot } from '@/features/app/planner/services/supabase/planEventsSchemas';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import type { Entry } from '@/features/app/planner/types/budget';
import { buildInitialDays } from '@/features/app/planner/domain/days/initialDays';
import { fetchPlanBudgetEntries } from '@/features/app/planner/server/repositories/BudgetRepository';
import {
  fetchPlanMemberTier,
  fetchPublicPlanBySlug,
  fetchLatestPlanSnapshot,
} from '@/features/app/planner/server/repositories/PlanRepository';
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
  const planRow = await fetchPublicPlanBySlug(slug);
  if (!planRow) {
    notFound();
  }

  const planId = planRow.id;
  const planOwnerId = planRow.ownerId;
  const planEditToken = planRow.editToken;
  const initialBudget = planRow.budget ?? undefined;
  const title = planRow.title ?? undefined;
  const destination =
    dest ?? planRow.destinations[0]?.name ?? 'Destination TBD';

  const isOwner = Boolean(viewerUserId && planOwnerId && viewerUserId === planOwnerId);
  const tokenMatches = Boolean(editToken && editToken === planEditToken);
  let memberTier: string | null = null;

  if (viewerUserId && !isOwner) {
    memberTier = await fetchPlanMemberTier(planId, viewerUserId);
  }

  const isMember = Boolean(memberTier);
  const isAdmin = isOwner || memberTier === 'admin';
  const canEdit = Boolean(isOwner || tokenMatches || isMember);
  const grantedToken = canEdit ? planEditToken : undefined;

  const snapshotRow = await fetchLatestPlanSnapshot(planId);
  let initialDays: DayPlan[] | undefined;
  if (snapshotRow) {
    const snapshot = mapSnapshot(SnapshotRowSchema.parse(snapshotRow));
    if (snapshot.days.length > 0) {
      initialDays = snapshot.days;
    }
  }

  if (!initialDays || initialDays.length === 0) {
    const startDate = planRow.startDate ? new Date(planRow.startDate) : null;
    const endDate = planRow.endDate ? new Date(planRow.endDate) : null;

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

  const entryRows = await fetchPlanBudgetEntries(planId);

  const initialEntries =
    entryRows.length > 0
      ? entryRows.map((entry) => ({
          id: entry.id,
          description: entry.description ?? '',
          category: (entry.category as Entry['category']) ?? 'transport',
          amount: entry.amount ?? 0,
        }))
      : undefined;

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
