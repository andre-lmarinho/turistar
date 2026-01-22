import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import { getUserPlanners } from "../lib/getUserPlanners";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

type RpcRow = {
  id: string;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  public_slug: string;
  edit_token: string;
  destination_name: string | null;
  latest_snapshot_at: string | null;
};

type RpcResult = {
  data: RpcRow[] | null;
  error: unknown;
};

function buildSupabase(result: RpcResult) {
  const rpc = vi.fn().mockResolvedValue(result);
  const supabase = { rpc } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, rpc };
}

describe("getUserPlanners", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it("returns an empty array when RPC returns no rows", async () => {
    const result: RpcResult = { data: null, error: null };
    const { supabase, rpc } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const planners = await getUserPlanners();

    expect(rpc).toHaveBeenCalledWith("get_user_planners");
    expect(planners).toEqual([]);
  });

  it("maps rows with title fallbacks", async () => {
    const result: RpcResult = {
      data: [
        {
          id: "plan-1",
          title: null,
          start_date: "2024-01-01",
          end_date: "2024-01-05",
          created_at: "2023-12-31T00:00:00Z",
          public_slug: "slug-1",
          edit_token: "token-1",
          destination_name: "Lisbon",
          latest_snapshot_at: "2024-01-03T12:00:00Z",
        },
        {
          id: "plan-2",
          title: null,
          start_date: null,
          end_date: null,
          created_at: "2024-02-01T00:00:00Z",
          public_slug: "slug-2",
          edit_token: "token-2",
          destination_name: null,
          latest_snapshot_at: null,
        },
      ],
      error: null,
    };

    const { supabase, rpc } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const planners = await getUserPlanners();

    expect(rpc).toHaveBeenCalledWith("get_user_planners");
    expect(planners).toEqual([
      {
        id: "plan-1",
        title: "Lisbon",
        destination: "Lisbon",
        startDate: "2024-01-01",
        endDate: "2024-01-05",
        updatedAt: "2024-01-03T12:00:00Z",
        publicSlug: "slug-1",
        editToken: "token-1",
      },
      {
        id: "plan-2",
        title: "Untitled plan",
        destination: null,
        startDate: null,
        endDate: null,
        updatedAt: "2024-02-01T00:00:00Z",
        publicSlug: "slug-2",
        editToken: "token-2",
      },
    ]);
  });

  it("throws when RPC returns an error", async () => {
    const failure = new Error("nope");
    const result: RpcResult = { data: null, error: failure };
    const { supabase } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserPlanners()).rejects.toThrow("Supabase error during getUserPlanners. nope");
  });

  it("uses latest_snapshot_at for updatedAt when available", async () => {
    const result: RpcResult = {
      data: [
        {
          id: "plan-3",
          title: null,
          start_date: "2024-03-01",
          end_date: "2024-03-05",
          created_at: "2024-02-25T00:00:00Z",
          public_slug: "slug-3",
          edit_token: "token-3",
          destination_name: "Oslo",
          latest_snapshot_at: "2024-03-10T00:00:00Z",
        },
      ],
      error: null,
    };

    const { supabase, rpc } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const planners = await getUserPlanners();

    expect(rpc).toHaveBeenCalledWith("get_user_planners");
    expect(planners[0].updatedAt).toBe("2024-03-10T00:00:00Z");
  });

  it("falls back to created_at when latest_snapshot_at is null", async () => {
    const result: RpcResult = {
      data: [
        {
          id: "plan-4",
          title: "My Trip",
          start_date: "2024-04-01",
          end_date: "2024-04-05",
          created_at: "2024-03-15T00:00:00Z",
          public_slug: "slug-4",
          edit_token: "token-4",
          destination_name: "Paris",
          latest_snapshot_at: null,
        },
      ],
      error: null,
    };

    const { supabase, rpc } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const planners = await getUserPlanners();

    expect(rpc).toHaveBeenCalledWith("get_user_planners");
    expect(planners[0].updatedAt).toBe("2024-03-15T00:00:00Z");
  });
});
