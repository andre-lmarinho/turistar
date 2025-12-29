import 'server-only';

import { notFound } from 'next/navigation';

import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import { buildInitialDays } from '@/features/app/planner/domain/days/initialDays';
import { SnapshotRowSchema, mapSnapshot } from '@/features/app/planner/services/supabase/planEventsSchemas';
import type { Entry } from '@/features/app/planner/types/budget';
import { fetchPlanBudgetEntries } from '@/features/app/planner/server/repositories/BudgetRepository';
import {
  fetchPlanByIdWithMembers,
  fetchLatestPlanSnapshot,
} from '@/features/app/planner/server/repositories/PlanRepository';
import { eachDayOfInterval } from 'date-fns';

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
  const plan = await fetchPlanByIdWithMembers(planId);
  if (!plan) {
    notFound();
  }

  const ownerId = plan.ownerId;
  const memberRow = plan.members.find((member) => member.userId === userId) ?? null;
  const isOwner = ownerId === userId;
  const isMember = Boolean(memberRow);
  const isAdmin = isOwner || memberRow?.tier === 'admin';

  if (!isOwner && !isMember) {
    notFound();
  }

  const destination = plan.destinations[0]?.name ?? undefined;

  if (!destination) {
    notFound();
  }

  const snapshotRow = await fetchLatestPlanSnapshot(planId);

  let initialDays: DayPlan[] | undefined;
  if (snapshotRow) {
    const snapshot = mapSnapshot(SnapshotRowSchema.parse(snapshotRow));
    initialDays = snapshot.days.length > 0 ? snapshot.days : undefined;
  }
  if (!initialDays || initialDays.length === 0) {
    const startDate = plan.startDate ? new Date(plan.startDate) : null;
    const endDate = plan.endDate ? new Date(plan.endDate) : null;

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
    title: plan.title ?? undefined,
    destination,
    initialDays,
    initialBudget: plan.budget ?? undefined,
    initialEntries,
    editToken: plan.editToken,
    isOwner,
    isAdmin,
    canManageMembers: isAdmin,
  };
}
