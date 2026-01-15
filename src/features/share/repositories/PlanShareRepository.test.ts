import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import {
  acceptPlanShareLink,
  createPlanShareLink,
  fetchPlanIdBySlug,
  fetchShareLinkByPlanId,
  revokePlanShareLink,
} from "./PlanShareRepository";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

type SupabaseResult<T> = {
  data: T | null;
  error: unknown;
};

type PlanIdRow = {
  id: string;
};

type PlanShareLinkRow = {
  token: string;
  created_at: string;
  created_by: string;
  revoked_at: string | null;
};

interface MaybeSingleQueryChain<T> {
  select: ReturnType<typeof vi.fn<(columns: string) => MaybeSingleQueryChain<T>>>;
  eq: ReturnType<typeof vi.fn<(column: string, value: unknown) => MaybeSingleQueryChain<T>>>;
  maybeSingle: ReturnType<typeof vi.fn<() => Promise<SupabaseResult<T>>>>;
}

function buildMaybeSingleQuery<T>(result: SupabaseResult<T>) {
  const chain = {
    select: vi.fn<(columns: string) => MaybeSingleQueryChain<T>>(),
    eq: vi.fn<(column: string, value: unknown) => MaybeSingleQueryChain<T>>(),
    maybeSingle: vi.fn<() => Promise<SupabaseResult<T>>>(),
  } as unknown as MaybeSingleQueryChain<T>;

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

function buildSupabaseFrom<T>(table: string, chain: T) {
  const from = vi.fn((tableName: string) => {
    if (tableName === table) return chain;
    throw new Error(`Unexpected table ${tableName}`);
  });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from };
}

function buildSupabaseRpc<T>(result: SupabaseResult<T>) {
  const rpc = vi.fn().mockResolvedValue(result);
  const supabase = { rpc } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, rpc };
}

describe("PlanShareRepository", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it("accepts a plan share link", async () => {
    const response = { data: "plan-1", error: null };
    const { supabase, rpc } = buildSupabaseRpc(response);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const result = await acceptPlanShareLink("token-1");

    expect(result).toEqual("plan-1");
    expect(rpc).toHaveBeenCalledWith("accept_plan_share_link", { _token: "token-1" });
  });

  it("creates a plan share link", async () => {
    const response = { data: "share-token", error: null };
    const { supabase, rpc } = buildSupabaseRpc(response);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const result = await createPlanShareLink("plan-2");

    expect(result).toEqual("share-token");
    expect(rpc).toHaveBeenCalledWith("create_plan_share_link", { _plan_id: "plan-2" });
  });

  it("revokes a plan share link", async () => {
    const response = { data: true, error: null };
    const { supabase, rpc } = buildSupabaseRpc(response);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const result = await revokePlanShareLink("plan-3");

    expect(result).toEqual(true);
    expect(rpc).toHaveBeenCalledWith("revoke_plan_share_link", { _plan_id: "plan-3" });
  });

  describe("fetchPlanIdBySlug", () => {
    it("returns the plan id", async () => {
      const planQuery = buildMaybeSingleQuery<PlanIdRow>({ data: { id: "plan-1" }, error: null });
      const { supabase, from } = buildSupabaseFrom("plans", planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanIdBySlug("summer-trip");

      expect(result).toEqual("plan-1");
      expect(from).toHaveBeenCalledWith("plans");
      expect(planQuery.select).toHaveBeenCalledWith("id");
      expect(planQuery.eq).toHaveBeenCalledWith("public_slug", "summer-trip");
    });

    it("returns null when no plan exists", async () => {
      const planQuery = buildMaybeSingleQuery<PlanIdRow>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom("plans", planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanIdBySlug("missing");

      expect(result).toBeNull();
    });

    it("throws a formatted error when Supabase fails", async () => {
      const failure = new Error("slug failure");
      const planQuery = buildMaybeSingleQuery<PlanIdRow>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom("plans", planQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      await expect(fetchPlanIdBySlug("bad-slug")).rejects.toThrow(/fetchPlanIdBySlug.*slug=bad-slug/);
    });
  });

  describe("fetchShareLinkByPlanId", () => {
    it("returns the share link row", async () => {
      const shareLinkQuery = buildMaybeSingleQuery<PlanShareLinkRow>({
        data: {
          token: "token-1",
          created_at: "2024-01-01T00:00:00Z",
          created_by: "user-1",
          revoked_at: null,
        },
        error: null,
      });
      const { supabase, from } = buildSupabaseFrom("plan_share_links", shareLinkQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchShareLinkByPlanId("plan-1");

      expect(result).toEqual({
        token: "token-1",
        created_at: "2024-01-01T00:00:00Z",
        created_by: "user-1",
        revoked_at: null,
      });
      expect(from).toHaveBeenCalledWith("plan_share_links");
      expect(shareLinkQuery.select).toHaveBeenCalledWith("token, created_at, created_by, revoked_at");
      expect(shareLinkQuery.eq).toHaveBeenCalledWith("plan_id", "plan-1");
    });

    it("returns null when no share link exists", async () => {
      const shareLinkQuery = buildMaybeSingleQuery<PlanShareLinkRow>({ data: null, error: null });
      const { supabase } = buildSupabaseFrom("plan_share_links", shareLinkQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchShareLinkByPlanId("plan-missing");

      expect(result).toBeNull();
    });

    it("throws a formatted error when Supabase fails", async () => {
      const failure = new Error("share link failure");
      const shareLinkQuery = buildMaybeSingleQuery<PlanShareLinkRow>({ data: null, error: failure });
      const { supabase } = buildSupabaseFrom("plan_share_links", shareLinkQuery);
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      await expect(fetchShareLinkByPlanId("plan-error")).rejects.toThrow(
        /fetchShareLinkByPlanId.*planId=plan-error/
      );
    });
  });
});
