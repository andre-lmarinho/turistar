import "server-only";

import { eachDayOfInterval } from "date-fns";
import { notFound, redirect } from "next/navigation";

import { buildInitialDays } from "@/features/activity/lib/dayOperations";
import type { DayPlan } from "@/features/activity/types";
import { fetchPlanBudgetEntries } from "@/features/budget/repositories/BudgetRepository";
import { CATEGORIES, type CategoryKey, type Entry } from "@/features/budget/types";
import { mapSnapshot, SnapshotRowSchema } from "@/features/snapshots/services/snapshotsSchemas";
import { getCurrentUser, requireUser, UnauthorizedError } from "@/shared/lib/auth/session";
import { isUuid } from "@/shared/lib/uuid";

import type { PlanWithMembersRecord } from "../repositories/PlanRepository";
import {
  fetchLatestSnapshot,
  fetchPlanByIdWithMembers,
  fetchPlanBySlug,
} from "../repositories/PlanRepository";

const VALID_CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as readonly CategoryKey[];

export interface PlannerExperience {
  planId: string;
  slug?: string;
  destination: string;
  title?: string;
  viewerUserId: string | null;
  canEdit: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canManageMembers: boolean;
  initialDays?: DayPlan[];
  initialBudget?: number;
  initialEntries?: Entry[];
}

interface GetPlannerExperienceArgs {
  identifier: string;
  dest?: string;
}

export async function getPlannerExperience({
  identifier,
  dest,
}: GetPlannerExperienceArgs): Promise<PlannerExperience> {
  const trimmed = identifier?.trim();
  if (!trimmed) return notFound();

  // Determine if UUID (private access) or slug (shared access)
  const isPrivateAccess = isUuid(trimmed);

  let plan: PlanWithMembersRecord | null;
  let viewerUserId: string | null = null;

  if (isPrivateAccess) {
    try {
      const user = await requireUser();
      viewerUserId = user.id;
      plan = await fetchPlanByIdWithMembers(trimmed);
    } catch (error) {
      if (error instanceof UnauthorizedError) redirect("/login");
      throw error;
    }
  } else {
    const user = await getCurrentUser();
    viewerUserId = user?.id ?? null;
    plan = await fetchPlanBySlug(trimmed);
  }

  if (!plan) return notFound();

  // Permission check
  const isOwner = Boolean(viewerUserId && plan.ownerId && viewerUserId === plan.ownerId);
  const memberRow = viewerUserId ? plan.members.find((m) => m.userId === viewerUserId) : null;
  const isMember = Boolean(memberRow);
  const isAdmin = isOwner || memberRow?.tier === "admin";
  const canEdit = Boolean(isOwner || isMember);

  // For private access (UUID), require owner/member
  if (isPrivateAccess && !isOwner && !isMember) return notFound();

  const destination = dest ?? plan.destinations[0]?.name ?? "Destination TBD";

  // Load snapshot
  const snapshotRow = await fetchLatestSnapshot(plan.id);
  let initialDays: DayPlan[] | undefined;
  if (snapshotRow) {
    const snapshot = mapSnapshot(SnapshotRowSchema.parse(snapshotRow));
    if (snapshot.days.length > 0) initialDays = snapshot.days;
  }

  // Fallback to date range if no snapshot
  if (!initialDays || initialDays.length === 0) {
    const startDate = plan.startDate ? new Date(plan.startDate) : null;
    const endDate = plan.endDate ? new Date(plan.endDate) : null;
    if (startDate && endDate && !Number.isNaN(startDate.valueOf()) && !Number.isNaN(endDate.valueOf())) {
      initialDays = buildInitialDays(eachDayOfInterval({ start: startDate, end: endDate }));
    }
  }

  // Load budget entries
  const entryRows = await fetchPlanBudgetEntries(plan.id);
  const initialEntries =
    entryRows.length > 0
      ? entryRows.map((entry) => {
          const rawCategory = entry.category;
          const category: CategoryKey = VALID_CATEGORY_KEYS.includes(rawCategory as CategoryKey)
            ? (rawCategory as CategoryKey)
            : "transport";
          return {
            id: entry.id,
            description: entry.description ?? "",
            category,
            amount: entry.amount ?? 0,
          };
        })
      : undefined;

  return {
    planId: plan.id,
    slug: isPrivateAccess ? undefined : trimmed,
    destination,
    title: plan.title ?? undefined,
    viewerUserId,
    canEdit,
    isOwner,
    isAdmin,
    canManageMembers: isAdmin,
    initialDays,
    initialBudget: plan.budget ?? undefined,
    initialEntries,
  };
}
