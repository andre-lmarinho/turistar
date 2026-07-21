import { buildSupabaseMock } from "@tests/utils/testHelpers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import {
  fetchLatestSnapshot,
  fetchPlanByIdWithMembers,
  fetchPlanBySlug,
  fetchPlanIdentityById,
  fetchPlanIdentityBySlug,
  fetchPublicPlanById,
  fetchPublicPlanBySlug,
  resolvePlanIdentity,
} from "./PlanRepository";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

type PlanIdentityRow = {
  id: string;
  user_id: string | null;
};

type PlanMemberRow = {
  user_id: string;
  tier: string;
};

type PlanRow = {
  id: string;
  title: string | null;
  user_id: string | null;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  destination_name: string | null;
};

type PlanWithMembersRow = PlanRow & {
  plan_members: PlanMemberRow[] | null;
};

type SnapshotRow = {
  plan_id: string;
  version: number;
  state: { days: unknown[] };
  updated_at: string;
};

describe("PlanRepository", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  describe("fetchPlanIdentityById", () => {
    it("maps the plan identity", async () => {
      const data: PlanIdentityRow = { id: "plan-1", user_id: "owner-1" };
      const { supabase, from, chain: planQuery } = buildSupabaseMock("plans", { data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanIdentityById("plan-1");

      expect(result).toEqual({ id: "plan-1", ownerId: "owner-1" });
      expect(from).toHaveBeenCalledWith("plans");
      expect(planQuery.select).toHaveBeenCalledWith("id, user_id");
      expect(planQuery.eq).toHaveBeenCalledWith("id", "plan-1");
    });

    it("returns null when no plan exists", async () => {
      const { supabase } = buildSupabaseMock<PlanIdentityRow>("plans", { data: null, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanIdentityById("plan-2");

      expect(result).toBeNull();
    });

    it("throws a formatted error when Supabase fails", async () => {
      const failure = new Error("plan failure");
      const { supabase } = buildSupabaseMock<PlanIdentityRow>("plans", { data: null, error: failure });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanIdentityById("plan-3");
        throw new Error("Expected fetchPlanIdentityById to throw");
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error("Expected an Error instance");
        }
        expect(error.message).toContain("fetchPlanIdentityById");
        expect(error.message).toContain("planId=plan-3");
      }
    });
  });

  describe("fetchPlanIdentityBySlug", () => {
    it("maps the plan identity by slug", async () => {
      const data: PlanIdentityRow = { id: "plan-10", user_id: "owner-10" };
      const { supabase, from, chain: planQuery } = buildSupabaseMock("plans", { data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanIdentityBySlug("public-slug");

      expect(result).toEqual({ id: "plan-10", ownerId: "owner-10" });
      expect(from).toHaveBeenCalledWith("plans");
      expect(planQuery.select).toHaveBeenCalledWith("id, user_id");
      expect(planQuery.eq).toHaveBeenCalledWith("public_slug", "public-slug");
    });
  });

  describe("resolvePlanIdentity", () => {
    it("resolves by id when the input is a UUID", async () => {
      const data: PlanIdentityRow = { id: "00000000-0000-0000-0000-000000000000", user_id: "owner-1" };
      const { supabase } = buildSupabaseMock("plans", { data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await resolvePlanIdentity("00000000-0000-0000-0000-000000000000");

      expect(result).toEqual({ id: "00000000-0000-0000-0000-000000000000", ownerId: "owner-1" });
    });

    it("resolves by slug when the input is not a UUID", async () => {
      const data: PlanIdentityRow = { id: "plan-42", user_id: "owner-42" };
      const { supabase } = buildSupabaseMock("plans", { data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await resolvePlanIdentity("public-slug");

      expect(result).toEqual({ id: "plan-42", ownerId: "owner-42" });
    });
  });

  describe("fetchPlanByIdWithMembers", () => {
    it("maps plan and members", async () => {
      const data: PlanWithMembersRow = {
        id: "plan-1",
        title: "Trip",
        user_id: "owner-1",
        budget: 100,
        start_date: "2024-01-01",
        end_date: "2024-01-05",
        destination_name: "Berlin",
        plan_members: [{ user_id: "member-1", tier: "admin" }],
      };
      const { supabase, from, chain: planQuery } = buildSupabaseMock("plans", { data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanByIdWithMembers("plan-1");

      expect(result).toEqual({
        id: "plan-1",
        title: "Trip",
        ownerId: "owner-1",
        budget: 100,
        startDate: "2024-01-01",
        endDate: "2024-01-05",
        destinationName: "Berlin",
        members: [{ userId: "member-1", tier: "admin" }],
      });
      expect(from).toHaveBeenCalledWith("plans");
      expect(planQuery.select).toHaveBeenCalledWith(expect.stringContaining("plan_members!left"));
      expect(planQuery.select).toHaveBeenCalledWith(expect.not.stringContaining("edit_token"));
      expect(planQuery.eq).toHaveBeenCalledWith("id", "plan-1");
    });

    it("returns null when no plan exists", async () => {
      const { supabase } = buildSupabaseMock<PlanWithMembersRow>("plans", { data: null, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanByIdWithMembers("plan-2");

      expect(result).toBeNull();
    });

    it("throws a formatted error when Supabase fails", async () => {
      const failure = new Error("plan failure");
      const { supabase } = buildSupabaseMock<PlanWithMembersRow>("plans", { data: null, error: failure });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      try {
        await fetchPlanByIdWithMembers("plan-3");
        throw new Error("Expected fetchPlanByIdWithMembers to throw");
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error("Expected an Error instance");
        }
        expect(error.message).toContain("fetchPlanByIdWithMembers");
        expect(error.message).toContain("planId=plan-3");
      }
    });
  });

  describe("fetchPlanBySlug", () => {
    it("maps a plan row with members", async () => {
      const data: PlanWithMembersRow = {
        id: "plan-10",
        title: "Public trip",
        user_id: "owner-10",
        budget: 250,
        start_date: "2024-02-01",
        end_date: "2024-02-03",
        destination_name: "Oslo",
        plan_members: [{ user_id: "member-1", tier: "viewer" }],
      };
      const { supabase, from, chain: planQuery } = buildSupabaseMock("plans", { data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPlanBySlug("public-slug");

      expect(result).toEqual({
        id: "plan-10",
        title: "Public trip",
        ownerId: "owner-10",
        budget: 250,
        startDate: "2024-02-01",
        endDate: "2024-02-03",
        destinationName: "Oslo",
        members: [{ userId: "member-1", tier: "viewer" }],
      });
      expect(from).toHaveBeenCalledWith("plans");
      expect(planQuery.select).toHaveBeenCalledWith(expect.stringContaining("destination_name"));
      expect(planQuery.select).toHaveBeenCalledWith(expect.stringContaining("plan_members"));
      expect(planQuery.select).toHaveBeenCalledWith(expect.not.stringContaining("edit_token"));
      expect(planQuery.eq).toHaveBeenCalledWith("public_slug", "public-slug");
    });
  });

  describe("fetchPublicPlanBySlug", () => {
    it("maps a members-free public plan and never selects members or edit_token", async () => {
      const data = {
        id: "plan-20",
        title: "Public trip",
        user_id: "owner-20",
        budget: 100,
        start_date: "2024-05-01",
        end_date: "2024-05-04",
        is_public: true,
        destination_name: "Lisbon",
      };
      const { supabase, from, chain } = buildSupabaseMock("plans", { data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPublicPlanBySlug("public-slug");

      expect(result).toEqual({
        id: "plan-20",
        title: "Public trip",
        ownerId: "owner-20",
        budget: 100,
        startDate: "2024-05-01",
        endDate: "2024-05-04",
        isPublic: true,
        destinationName: "Lisbon",
      });
      expect(from).toHaveBeenCalledWith("plans");
      expect(chain.select).toHaveBeenCalledWith(expect.stringContaining("is_public"));
      expect(chain.select).toHaveBeenCalledWith(expect.not.stringContaining("plan_members"));
      expect(chain.select).toHaveBeenCalledWith(expect.not.stringContaining("edit_token"));
      expect(chain.eq).toHaveBeenCalledWith("public_slug", "public-slug");
    });

    it("returns null when no public plan matches", async () => {
      const { supabase } = buildSupabaseMock("plans", { data: null, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      expect(await fetchPublicPlanBySlug("missing")).toBeNull();
    });
  });

  describe("fetchPublicPlanById", () => {
    it("queries by id", async () => {
      const data = {
        id: "plan-21",
        title: null,
        user_id: null,
        budget: null,
        start_date: null,
        end_date: null,
        is_public: false,
        destination_name: null,
      };
      const { supabase, chain } = buildSupabaseMock("plans", { data, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchPublicPlanById("plan-21");

      expect(result?.isPublic).toBe(false);
      expect(chain.eq).toHaveBeenCalledWith("id", "plan-21");
    });

    it("throws a contextual error when the query fails", async () => {
      const { supabase } = buildSupabaseMock("plans", { data: null, error: new Error("boom") });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      await expect(fetchPublicPlanById("plan-x")).rejects.toThrow(/fetchPublicPlanById/);
    });
  });

  describe("fetchLatestSnapshot", () => {
    it("returns the latest snapshot row", async () => {
      const snapshot: SnapshotRow = {
        plan_id: "plan-30",
        version: 2,
        state: { days: [] },
        updated_at: "2024-03-01T00:00:00.000Z",
      };
      const {
        supabase,
        from,
        chain: snapshotQuery,
      } = buildSupabaseMock("plan_snapshots", { data: snapshot, error: null });
      vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

      const result = await fetchLatestSnapshot("plan-30");

      expect(result).toEqual(snapshot);
      expect(from).toHaveBeenCalledWith("plan_snapshots");
      expect(snapshotQuery.select).toHaveBeenCalledWith("plan_id, version, state, updated_at");
      expect(snapshotQuery.eq).toHaveBeenCalledWith("plan_id", "plan-30");
      expect(snapshotQuery.order).toHaveBeenNthCalledWith(1, "version", { ascending: false });
      expect(snapshotQuery.order).toHaveBeenNthCalledWith(2, "updated_at", { ascending: false });
      expect(snapshotQuery.limit).toHaveBeenCalledWith(1);
    });
  });
});
