import "server-only";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

export type UserPlannerSummary = {
  id: string;
  title: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  updatedAt: string | null;
  publicSlug: string;
  editToken: string;
};

interface RpcRow {
  id: string;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  public_slug: string;
  edit_token: string;
  destination_name: string | null;
  latest_snapshot_at: string | null;
}

export async function getUserPlanners(userId: string): Promise<UserPlannerSummary[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.rpc("get_user_planners", {
    p_user_id: userId,
  });

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to fetch user planners: operation=getUserPlanners userId=${userId} error=${errorMessage}`
    );
  }

  const rows = (data ?? []) as RpcRow[];

  return rows.map((row) => {
    const title = row.title ?? row.destination_name ?? "Untitled plan";
    const updatedAt = row.latest_snapshot_at ?? row.created_at ?? null;

    return {
      id: row.id,
      title,
      destination: row.destination_name,
      startDate: row.start_date,
      endDate: row.end_date,
      updatedAt,
      publicSlug: row.public_slug,
      editToken: row.edit_token,
    };
  });
}
