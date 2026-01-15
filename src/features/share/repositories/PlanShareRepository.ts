import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import type { Database } from "@/shared/types/supabase";

type PlanShareRepositoryOptions = {
  client?: SupabaseClient;
};

type PlanIdRow = Pick<Database["public"]["Tables"]["plans"]["Row"], "id">;

export type PlanShareLinkRow = Pick<
  Database["public"]["Tables"]["plan_share_links"]["Row"],
  "token" | "created_at" | "created_by" | "revoked_at"
>;

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function acceptPlanShareLink(
  token: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<Database["public"]["Functions"]["accept_plan_share_link"]["Returns"] | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc("accept_plan_share_link", {
    _token: token,
  })) as unknown as {
    data: Database["public"]["Functions"]["accept_plan_share_link"]["Returns"] | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: "acceptPlanShareLink",
      identifiers: { token },
      error,
    });
  }

  return data ?? null;
}

export async function createPlanShareLink(
  planId: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<Database["public"]["Functions"]["create_plan_share_link"]["Returns"] | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc("create_plan_share_link", {
    _plan_id: planId,
  })) as unknown as {
    data: Database["public"]["Functions"]["create_plan_share_link"]["Returns"] | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: "createPlanShareLink",
      identifiers: { planId },
      error,
    });
  }

  return data ?? null;
}

export async function fetchPlanIdBySlug(
  slug: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<string | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plans")
    .select<PlanIdRow>("id")
    .eq("public_slug", slug)
    .maybeSingle()) as unknown as { data: PlanIdRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchPlanIdBySlug",
      identifiers: { slug },
      error,
    });
  }

  return data?.id ?? null;
}

export async function fetchShareLinkByPlanId(
  planId: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<PlanShareLinkRow | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plan_share_links")
    .select<PlanShareLinkRow>("token, created_at, created_by, revoked_at")
    .eq("plan_id", planId)
    .maybeSingle()) as unknown as { data: PlanShareLinkRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchShareLinkByPlanId",
      identifiers: { planId },
      error,
    });
  }

  return data ?? null;
}

export async function revokePlanShareLink(
  planId: string,
  { client }: PlanShareRepositoryOptions = {}
): Promise<Database["public"]["Functions"]["revoke_plan_share_link"]["Returns"]> {
  const supabase = getClient(client);
  const { data, error } = (await supabase.rpc("revoke_plan_share_link", {
    _plan_id: planId,
  })) as unknown as {
    data: Database["public"]["Functions"]["revoke_plan_share_link"]["Returns"] | null;
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: "revokePlanShareLink",
      identifiers: { planId },
      error,
    });
  }

  return data ?? false;
}
