import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import type { ShareLink } from "../types";

type RepositoryOptions = {
  client?: SupabaseClient;
};

type ShareLinkRow = {
  token: string;
  created_at: string;
  created_by: string;
  revoked_at: string | null;
};

function getClient(options?: RepositoryOptions): SupabaseClient {
  return options?.client ?? createSupabaseServerClient();
}

function mapShareLink(row: ShareLinkRow): ShareLink {
  return {
    token: row.token,
    createdAt: row.created_at,
    createdBy: row.created_by,
    revokedAt: row.revoked_at,
  };
}

export async function fetchShareLink(planId: string, options?: RepositoryOptions): Promise<ShareLink | null> {
  const client = getClient(options);

  const { data, error } = (await client
    .from("plan_share_links")
    .select("token, created_at, created_by, revoked_at")
    .eq("plan_id", planId)
    .maybeSingle()) as { data: ShareLinkRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchShareLink",
      identifiers: { planId },
      error,
    });
  }

  if (!data) return null;
  return mapShareLink(data);
}

export async function createShareLink(planId: string, options?: RepositoryOptions): Promise<string> {
  const client = getClient(options);

  const { data, error } = (await client.rpc("create_plan_share_link", {
    _plan_id: planId,
  })) as { data: string | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "createShareLink",
      identifiers: { planId },
      error,
    });
  }

  if (!data) {
    throw new Error("createShareLink: no token returned");
  }

  return data;
}

export async function revokeShareLink(planId: string, options?: RepositoryOptions): Promise<boolean> {
  const client = getClient(options);

  const { data, error } = (await client.rpc("revoke_plan_share_link", {
    _plan_id: planId,
  })) as { data: boolean | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "revokeShareLink",
      identifiers: { planId },
      error,
    });
  }

  return data ?? false;
}

export async function acceptShareLink(token: string, options?: RepositoryOptions): Promise<string> {
  const client = getClient(options);

  const { data, error } = (await client.rpc("accept_plan_share_link", {
    _token: token,
  })) as { data: string | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "acceptShareLink",
      identifiers: { tokenPrefix: token.slice(0, 8) },
      error,
    });
  }

  if (!data) {
    throw new Error("acceptShareLink: no plan_id returned");
  }

  return data;
}
