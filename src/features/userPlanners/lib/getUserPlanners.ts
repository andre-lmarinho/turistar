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

export async function getUserPlanners(userId: string): Promise<UserPlannerSummary[]> {
  const supabase = createSupabaseServerClient();
  const plannerSelect = `
    id,
    title,
    start_date,
    end_date,
    created_at,
    public_slug,
    edit_token,
    plan_destinations(destinations(name)),
    plan_snapshots(updated_at)
  `;

  const [ownedResult, memberResult] = await Promise.all([
    (await supabase
      .from("plans")
      .select(plannerSelect)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false, referencedTable: "plan_snapshots" })
      .limit(50)) as unknown as {
      data:
        | {
            id: string;
            title: string | null;
            start_date: string | null;
            end_date: string | null;
            created_at: string | null;
            public_slug: string;
            edit_token: string;
            plan_destinations: { destinations: { name: string | null } }[] | null;
            plan_snapshots: { updated_at: string | null }[] | null;
          }[]
        | null;
      error: unknown;
    },
    (await supabase
      .from("plan_members")
      .select(`plan_id, plans(${plannerSelect})`)
      .eq("user_id", userId)
      .limit(50)) as unknown as {
      data:
        | {
            plan_id: string;
            plans:
              | {
                  id: string;
                  title: string | null;
                  start_date: string | null;
                  end_date: string | null;
                  created_at: string | null;
                  public_slug: string;
                  edit_token: string;
                  plan_destinations: { destinations: { name: string | null } }[] | null;
                  plan_snapshots: { updated_at: string | null }[] | null;
                }
              | {
                  id: string;
                  title: string | null;
                  start_date: string | null;
                  end_date: string | null;
                  created_at: string | null;
                  public_slug: string;
                  edit_token: string;
                  plan_destinations: { destinations: { name: string | null } }[] | null;
                  plan_snapshots: { updated_at: string | null }[] | null;
                }[]
              | null;
          }[]
        | null;
      error: unknown;
    },
  ]);

  if (ownedResult.error) {
    throw ownedResult.error;
  }
  if (memberResult.error) {
    throw memberResult.error;
  }

  const plans = new Map<
    string,
    {
      id: string;
      title: string | null;
      start_date: string | null;
      end_date: string | null;
      created_at: string | null;
      public_slug: string;
      edit_token: string;
      plan_destinations: { destinations: { name: string | null } }[] | null;
      plan_snapshots: { updated_at: string | null }[] | null;
    }
  >();

  (ownedResult.data ?? []).forEach((row) => {
    plans.set(row.id, row);
  });

  (memberResult.data ?? []).forEach((row) => {
    const plan = Array.isArray(row.plans) ? row.plans[0] : row.plans;
    if (plan) {
      plans.set(plan.id, plan);
    }
  });

  const plannersWithSort = Array.from(plans.values()).map((row) => {
    const destination = row.plan_destinations?.[0]?.destinations?.name ?? null;
    const snapshots = Array.isArray(row.plan_snapshots)
      ? row.plan_snapshots
      : row.plan_snapshots
        ? [row.plan_snapshots]
        : [];
    const snapshotUpdatedAt = snapshots[0]?.updated_at ?? null;
    const updatedAt = snapshotUpdatedAt ?? row.created_at ?? null;
    const title = row.title ?? destination ?? "Untitled plan";
    const sortUpdatedAt = snapshotUpdatedAt ? new Date(snapshotUpdatedAt).getTime() : 0;

    return {
      planner: {
        id: row.id,
        title,
        destination,
        startDate: row.start_date,
        endDate: row.end_date,
        updatedAt,
        publicSlug: row.public_slug,
        editToken: row.edit_token,
      } satisfies UserPlannerSummary,
      sortUpdatedAt,
    };
  });

  // Sort by most recently updated snapshot; fallback snapshots sort last
  return plannersWithSort.sort((a, b) => b.sortUpdatedAt - a.sortUpdatedAt).map(({ planner }) => planner);
}
