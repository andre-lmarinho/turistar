import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { formatSupabaseError } from "@/lib/errors";
import type { Database } from "@/supabase/types";

export type PlanIdentity = {
  id: string;
  ownerId: string | null;
};

export type PlanMemberRecord = {
  userId: string;
  tier: string;
};

export type PlanRecord = {
  id: string;
  title: string | null;
  ownerId: string | null;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  destinationName: string | null;
};

export type PlanWithMembersRecord = PlanRecord & {
  members: PlanMemberRecord[];
};

export type UserPlannerSummary = {
  id: string;
  title: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  updatedAt: string | null;
  coverImage: string | null;
};

export type UserDestination = {
  planId: string;
  planTitle: string;
  startDate: string | null;
  endDate: string | null;
  name: string;
  country: string | null;
  lat: number | null;
  lng: number | null;
  activityCount: number;
};

// private row types kept local to the repo; consumers see the mapped *Record types above.

type PlanRow = {
  id: string;
  title: string | null;
  user_id: string | null;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  destination_name: string | null;
};

type PlanMemberRow = {
  user_id: string;
  tier: string;
};

function mapPlanRow(row: PlanRow): PlanRecord {
  return {
    id: row.id,
    title: row.title,
    ownerId: row.user_id,
    budget: row.budget,
    startDate: row.start_date,
    endDate: row.end_date,
    destinationName: row.destination_name,
  };
}

function mapMembers(rows: PlanMemberRow[] | null): PlanMemberRecord[] {
  if (!rows) return [];
  return rows.map((row) => ({ userId: row.user_id, tier: row.tier }));
}

export class PlanRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetchPlanIdentityById(planId: string): Promise<PlanIdentity | null> {
    const { data, error } = await this.client
      .from("plans")
      .select("id, user_id")
      .eq("id", planId)
      .maybeSingle();

    if (error) {
      throw formatSupabaseError({ operation: "fetchPlanIdentityById", identifiers: { planId }, error });
    }

    return data ? { id: data.id, ownerId: data.user_id } : null;
  }

  async fetchPlanIdentityBySlug(slug: string): Promise<PlanIdentity | null> {
    const { data, error } = await this.client
      .from("plans")
      .select("id, user_id")
      .eq("public_slug", slug)
      .maybeSingle();

    if (error) {
      throw formatSupabaseError({ operation: "fetchPlanIdentityBySlug", identifiers: { slug }, error });
    }

    return data ? { id: data.id, ownerId: data.user_id } : null;
  }

  async fetchPlanByIdWithMembers(planId: string): Promise<PlanWithMembersRecord | null> {
    const { data, error } = await this.client
      .from("plans")
      .select(
        "id, title, user_id, budget, start_date, end_date, destination_name, plan_members!left(user_id, tier)"
      )
      .eq("id", planId)
      .maybeSingle();

    if (error) {
      throw formatSupabaseError({ operation: "fetchPlanByIdWithMembers", identifiers: { planId }, error });
    }

    return data ? { ...mapPlanRow(data), members: mapMembers(data.plan_members) } : null;
  }

  async fetchPlanBySlug(slug: string): Promise<PlanWithMembersRecord | null> {
    const { data, error } = await this.client
      .from("plans")
      .select(
        "id, title, user_id, budget, start_date, end_date, destination_name, plan_members!left(user_id, tier)"
      )
      .eq("public_slug", slug)
      .maybeSingle();

    if (error) {
      throw formatSupabaseError({ operation: "fetchPlanBySlug", identifiers: { slug }, error });
    }

    return data ? { ...mapPlanRow(data), members: mapMembers(data.plan_members) } : null;
  }

  async updatePlanTitle(planId: string, newTitle: string): Promise<void> {
    const { error } = await this.client.rpc("update_plan_title", {
      _plan_id: planId,
      _new_title: newTitle,
    });

    if (error) {
      throw formatSupabaseError({ operation: "updatePlanTitle", identifiers: { planId }, error });
    }
  }

  async fetchUserPlanSummaries() {
    const { data, error } = await this.client.rpc("get_user_plan_summaries");
    if (error) {
      throw formatSupabaseError({ operation: "fetchUserPlanSummaries", error });
    }
    return data ?? [];
  }

  async updatePlanDates(planId: string, startDate: string, endDate: string): Promise<void> {
    const { error } = await this.client.rpc("update_plan_dates", {
      _plan_id: planId,
      _start_date: startDate,
      _end_date: endDate,
    });

    if (error) {
      throw formatSupabaseError({ operation: "updatePlanDates", identifiers: { planId }, error });
    }
  }

  async updatePlanCoverImage(planId: string, coverImageUrl: string): Promise<void> {
    try {
      const { error } = await this.client
        .from("plans")
        .update({ cover_image: coverImageUrl })
        .eq("id", planId);

      if (error) {
        console.error("Failed to update plan cover image", { planId, error });
      }
    } catch (error) {
      console.error("Unexpected error updating plan cover image", { planId, error });
    }
  }

  async delete(planId: string): Promise<void> {
    const { error } = await this.client.from("plans").delete().eq("id", planId);

    if (error) {
      throw formatSupabaseError({ operation: "deletePlan", identifiers: { planId }, error });
    }
  }

  async createPlan(params: {
    title: string;
    destName: string;
    destLat?: number;
    destLong?: number;
    destCountry?: string;
    startDate: string;
    endDate: string;
    userId?: string;
    coverImage?: string;
  }): Promise<{ id: string }> {
    const { data, error } = await this.client.rpc("create_full_plan", {
      _title: params.title,
      _dest_name: params.destName,
      _dest_lat: params.destLat,
      _dest_long: params.destLong,
      _dest_country: params.destCountry,
      _start_date: params.startDate,
      _end_date: params.endDate,
      _user_id: params.userId ?? undefined,
      _cover_image: params.coverImage ?? undefined,
    });

    if (error || !data) {
      const errorMessage =
        error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error";
      throw new Error(
        `Failed to create plan: operation=createPlan title="${params.title}" destination="${params.destName}" userId=${params.userId ?? "null"} error=${errorMessage}`
      );
    }

    const row = (Array.isArray(data) ? data[0] : data) as { result_plan_id?: string | null } | undefined;

    if (!row?.result_plan_id) {
      throw new Error(
        `Failed to create plan: operation=createPlan title="${params.title}" destination="${params.destName}" userId=${params.userId ?? "null"} error=RPC returned no plan identifiers`
      );
    }

    return { id: row.result_plan_id };
  }
}
