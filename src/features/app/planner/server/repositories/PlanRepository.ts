import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export type PlanDestinationRecord = {
  name: string | null;
};

export type PlanMemberRecord = {
  userId: string;
  tier: string;
};

export type PlanRecord = {
  id: string;
  title: string | null;
  ownerId: string | null;
  editToken: string;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  destinations: PlanDestinationRecord[];
};

export type PlanWithMembersRecord = PlanRecord & {
  members: PlanMemberRecord[];
};

export type PlanSnapshotRow = {
  plan_id: string;
  version: number;
  state: unknown;
  updated_at: string;
};

type PlanRepositoryOptions = {
  client?: SupabaseClient;
};

type PlanDestinationRow = {
  destinations: { name: string | null } | null;
};

type PlanMemberRow = {
  user_id: string;
  tier: string;
};

type PlanRow = {
  id: string;
  title: string | null;
  user_id: string | null;
  edit_token: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  plan_destinations: PlanDestinationRow[] | null;
};

type PlanWithMembersRow = PlanRow & {
  plan_members: PlanMemberRow[] | null;
};

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

function mapDestinations(rows: PlanDestinationRow[] | null): PlanDestinationRecord[] {
  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    name: row.destinations?.name ?? null,
  }));
}

function mapPlanRow(row: PlanRow): PlanRecord {
  return {
    id: row.id,
    title: row.title,
    ownerId: row.user_id,
    editToken: row.edit_token,
    budget: row.budget,
    startDate: row.start_date,
    endDate: row.end_date,
    destinations: mapDestinations(row.plan_destinations),
  };
}

function mapMembers(rows: PlanMemberRow[] | null): PlanMemberRecord[] {
  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    userId: row.user_id,
    tier: row.tier,
  }));
}

export async function fetchPlanByIdWithMembers(
  planId: string,
  { client }: PlanRepositoryOptions = {}
): Promise<PlanWithMembersRecord | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plans")
    .select(
      `
        id,
        title,
        user_id,
        edit_token,
        budget,
        start_date,
        end_date,
        plan_destinations(destinations(name)),
        plan_members!left(user_id, tier)
      `
    )
    .eq("id", planId)
    .maybeSingle()) as unknown as { data: PlanWithMembersRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchPlanByIdWithMembers",
      identifiers: { planId },
      error,
    });
  }

  if (!data) {
    return null;
  }

  return {
    ...mapPlanRow(data),
    members: mapMembers(data.plan_members),
  };
}

export async function fetchPlanBySlug(
  slug: string,
  { client }: PlanRepositoryOptions = {}
): Promise<PlanWithMembersRecord | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plans")
    .select(
      `
        id,
        title,
        user_id,
        edit_token,
        budget,
        start_date,
        end_date,
        plan_destinations(destinations(name)),
        plan_members!left(user_id, tier)
      `
    )
    .eq("public_slug", slug)
    .maybeSingle()) as unknown as { data: PlanWithMembersRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchPlanBySlug",
      identifiers: { slug },
      error,
    });
  }

  if (!data) {
    return null;
  }

  return {
    ...mapPlanRow(data),
    members: mapMembers(data.plan_members),
  };
}

export async function fetchLatestPlanSnapshot(
  planId: string,
  { client }: PlanRepositoryOptions = {}
): Promise<PlanSnapshotRow | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plan_snapshots")
    .select("plan_id, version, state, updated_at")
    .eq("plan_id", planId)
    .order("version", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()) as unknown as { data: PlanSnapshotRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchLatestPlanSnapshot",
      identifiers: { planId },
      error,
    });
  }

  return data ?? null;
}
