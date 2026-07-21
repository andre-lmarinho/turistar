import "server-only";

import { eachDayOfInterval } from "date-fns";
import { notFound, redirect } from "next/navigation";

import { buildInitialDays } from "@/features/activity/lib/dayOperations";
import type { DayPlan } from "@/features/activity/types";
import { fetchPlanBudgetEntries } from "@/features/budget/repositories/BudgetRepository";
import { CATEGORIES, type CategoryKey, type Entry } from "@/features/budget/types";
import { fetchProfileByUserId } from "@/features/profile/repositories/ProfileRepository";
import { mapSnapshot, SnapshotRowSchema } from "@/features/snapshots/services/snapshotsSchemas";
import { getCurrentUser } from "@/shared/lib/auth/session";
import { isUuid } from "@/shared/lib/uuid";

import {
  fetchLatestSnapshot,
  fetchPlanByIdWithMembers,
  fetchPlanBySlug,
  fetchPublicPlanById,
  fetchPublicPlanBySlug,
  type PlanRecord,
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
  isPublic: boolean;
  initialDays?: DayPlan[];
  initialBudget?: number;
  initialEntries?: Entry[];
  authorName?: string;
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

  // UUID = direct id; anything else = public_slug. Both resolve here.
  const bySlug = !isUuid(trimmed);
  const user = await getCurrentUser();

  // Anonymous viewers see only public plans (RLS enforces is_public). The members-free fetch
  // keeps anon off plan_members entirely; a null result means private-or-missing -> login.
  if (!user) {
    const plan = bySlug ? await fetchPublicPlanBySlug(trimmed) : await fetchPublicPlanById(trimmed);
    if (!plan) redirect("/login");
    return buildReadOnlyExperience(plan, { slug: bySlug ? trimmed : undefined, dest, viewerUserId: null });
  }

  // Authenticated: RLS also exposes public plans to non-members, so one fetch covers both
  // members (edit) and non-members of a public plan (read-only). Private + non-member -> notFound.
  const plan = bySlug ? await fetchPlanBySlug(trimmed) : await fetchPlanByIdWithMembers(trimmed);
  if (!plan) return notFound();

  const isOwner = Boolean(plan.ownerId && user.id === plan.ownerId);
  const memberRow = plan.members.find((m) => m.userId === user.id);

  if (isOwner || memberRow) {
    const isAdmin = isOwner || memberRow?.tier === "admin";
    const [snapshotRow, entryRows] = await Promise.all([
      fetchLatestSnapshot(plan.id),
      fetchPlanBudgetEntries(plan.id),
    ]);
    const snapshotDays = snapshotRow ? mapSnapshot(SnapshotRowSchema.parse(snapshotRow)).days : [];

    return {
      planId: plan.id,
      slug: bySlug ? trimmed : undefined,
      destination: dest ?? plan.destinations[0]?.name ?? "Destination TBD",
      title: plan.title ?? undefined,
      viewerUserId: user.id,
      // Reaching this branch requires ownership or membership, which is exactly edit access.
      canEdit: true,
      isOwner,
      isAdmin,
      canManageMembers: isAdmin,
      isPublic: plan.isPublic,
      initialDays: snapshotDays.length > 0 ? snapshotDays : buildDaysFromRange(plan.startDate, plan.endDate),
      initialBudget: plan.budget ?? undefined,
      initialEntries: entryRows.length > 0 ? entryRows.map(mapBudgetEntry) : undefined,
    };
  }

  // Authenticated non-member: read-only when the plan is public, otherwise hidden.
  if (!plan.isPublic) return notFound();
  return buildReadOnlyExperience(plan, { slug: bySlug ? trimmed : undefined, dest, viewerUserId: user.id });
}

interface ReadOnlyArgs {
  slug?: string;
  dest?: string;
  viewerUserId: string | null;
}

async function buildReadOnlyExperience(
  plan: PlanRecord,
  { slug, dest, viewerUserId }: ReadOnlyArgs
): Promise<PlannerExperience> {
  const [snapshotRow, entryRows, author] = await Promise.all([
    fetchLatestSnapshot(plan.id),
    fetchPlanBudgetEntries(plan.id),
    plan.ownerId ? fetchProfileByUserId(plan.ownerId) : Promise.resolve(null),
  ]);
  const snapshotDays = snapshotRow ? mapSnapshot(SnapshotRowSchema.parse(snapshotRow)).days : [];

  return {
    planId: plan.id,
    slug,
    destination: dest ?? plan.destinations[0]?.name ?? "Destination TBD",
    title: plan.title ?? undefined,
    viewerUserId,
    canEdit: false,
    isOwner: false,
    isAdmin: false,
    canManageMembers: false,
    isPublic: plan.isPublic,
    initialDays: snapshotDays.length > 0 ? snapshotDays : buildDaysFromRange(plan.startDate, plan.endDate),
    initialBudget: plan.budget ?? undefined,
    initialEntries: entryRows.length > 0 ? entryRows.map(mapBudgetEntry) : undefined,
    authorName: author?.displayName ?? undefined,
  };
}

function buildDaysFromRange(start: string | null, end: string | null): DayPlan[] | undefined {
  if (!start || !end) return undefined;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) return undefined;
  // eachDayOfInterval throws RangeError on a reversed interval.
  if (startDate > endDate) return undefined;
  return buildInitialDays(eachDayOfInterval({ start: startDate, end: endDate }));
}

type BudgetEntryRow = Awaited<ReturnType<typeof fetchPlanBudgetEntries>>[number];

function mapBudgetEntry(entry: BudgetEntryRow): Entry {
  return {
    id: entry.id,
    description: entry.description ?? "",
    // unknown categories still coerce to "transport"; reject at the DB
    // with a CHECK constraint when the schema hardens (item 10 of the audit list).
    category: VALID_CATEGORY_KEYS.includes(entry.category as CategoryKey)
      ? (entry.category as CategoryKey)
      : "transport",
    amount: entry.amount ?? 0,
  };
}
