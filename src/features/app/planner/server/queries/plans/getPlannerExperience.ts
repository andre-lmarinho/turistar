import "server-only";

import { eachDayOfInterval } from "date-fns";
import { notFound, redirect } from "next/navigation";

import { buildInitialDays } from "@/features/app/planner/domain/days/initialDays";
import type { DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";
import { fetchPlanBudgetEntries } from "@/features/app/planner/server/repositories/BudgetRepository";
import type { PlanWithMembersRecord } from "@/features/app/planner/server/repositories/PlanRepository";
import {
  fetchLatestPlanSnapshot,
  fetchPlanByIdWithMembers,
  fetchPlanBySlug,
} from "@/features/app/planner/server/repositories/PlanRepository";
import { mapSnapshot, SnapshotRowSchema } from "@/features/app/planner/services/supabase/planEventsSchemas";
import type { Entry } from "@/features/app/planner/types/budget";
import { getCurrentUser, requireUser, UnauthorizedError } from "@/shared/lib/auth/session";
import { isUuid } from "@/shared/lib/uuid";

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
  editToken?: string;
  initialDays?: DayPlan[];
  initialBudget?: number;
  initialEntries?: Entry[];
}

interface GetPlannerExperienceArgs {
  identifier: string;
  dest?: string;
  editToken?: string;
}

/**
 * Resolve a planner view for a given plan identifier, returning metadata, permissions, and initial plan data.
 *
 * Retrieves a plan by UUID (private access) or slug (shared access), enforces access rules, loads the latest snapshot
 * or falls back to the plan date range for initial days, and loads budget entries for initial entries.
 *
 * @param args.identifier - Plan identifier: a UUID grants private access (requires membership or ownership), otherwise treated as a shared slug.
 * @param args.dest - Optional explicit destination name to override the plan's default destination.
 * @param args.editToken - Optional edit token which, if matching the plan's token, grants edit rights.
 * @returns A PlannerExperience containing plan identifiers, resolved destination/title, viewer identity and permissions, optional edit token, and optional initialDays, initialBudget, and initialEntries.
 */
export async function getPlannerExperience({
  identifier,
  dest,
  editToken,
}: GetPlannerExperienceArgs): Promise<PlannerExperience> {
  const trimmed = identifier?.trim();
  if (!trimmed) notFound();

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

  if (!plan) notFound();

  // Permission check
  const isOwner = Boolean(viewerUserId && plan.ownerId && viewerUserId === plan.ownerId);
  const memberRow = viewerUserId ? plan.members.find((m) => m.userId === viewerUserId) : null;
  const isMember = Boolean(memberRow);
  const tokenMatches = Boolean(editToken && editToken === plan.editToken);
  const isAdmin = isOwner || memberRow?.tier === "admin";
  const canEdit = Boolean(isOwner || isMember || tokenMatches);

  // For private access (UUID), require owner/member
  if (isPrivateAccess && !isOwner && !isMember) notFound();

  const destination = dest ?? plan.destinations[0]?.name ?? "Destination TBD";

  // Load snapshot
  const snapshotRow = await fetchLatestPlanSnapshot(plan.id);
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
      ? entryRows.map((entry) => ({
          id: entry.id,
          description: entry.description ?? "",
          category: (entry.category as Entry["category"]) ?? "transport",
          amount: entry.amount ?? 0,
        }))
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
    editToken: canEdit ? plan.editToken : undefined,
    initialDays,
    initialBudget: plan.budget ?? undefined,
    initialEntries,
  };
}