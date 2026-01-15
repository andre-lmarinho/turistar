import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlanIdentityRecord } from "@/features/share/repositories/PlanMembersRepository";
import {
  fetchPlanIdentityById,
  fetchPlanIdentityBySlug,
} from "@/features/share/repositories/PlanMembersRepository";
import { resolvePlanId } from "./resolvePlanId";

vi.mock("@/features/share/repositories/PlanMembersRepository", () => ({
  fetchPlanIdentityById: vi.fn(),
  fetchPlanIdentityBySlug: vi.fn(),
}));

const client = {} as SupabaseClient;
const uuid = "00000000-0000-4000-8000-000000000000";

describe("resolvePlanId", () => {
  beforeEach(() => {
    vi.mocked(fetchPlanIdentityById).mockReset();
    vi.mocked(fetchPlanIdentityBySlug).mockReset();
  });

  it("returns the plan identity when uuid lookup succeeds", async () => {
    const plan: PlanIdentityRecord = { id: "plan-1", ownerId: "owner-1" };
    vi.mocked(fetchPlanIdentityById).mockResolvedValue(plan);
    vi.mocked(fetchPlanIdentityBySlug).mockResolvedValue(null);

    const result = await resolvePlanId(uuid, client);

    expect(result).toEqual(plan);
    expect(fetchPlanIdentityById).toHaveBeenCalledWith(uuid, { client });
    expect(fetchPlanIdentityBySlug).not.toHaveBeenCalled();
  });

  it("falls back to slug lookup when uuid lookup returns null", async () => {
    const plan: PlanIdentityRecord = { id: "plan-2", ownerId: null };
    vi.mocked(fetchPlanIdentityById).mockResolvedValue(null);
    vi.mocked(fetchPlanIdentityBySlug).mockResolvedValue(plan);

    const result = await resolvePlanId(uuid, client);

    expect(result).toEqual(plan);
    expect(fetchPlanIdentityById).toHaveBeenCalledWith(uuid, { client });
    expect(fetchPlanIdentityBySlug).toHaveBeenCalledWith(uuid, { client });
  });

  it("uses slug lookup for non-uuid input", async () => {
    const plan: PlanIdentityRecord = { id: "plan-3", ownerId: "owner-2" };
    vi.mocked(fetchPlanIdentityBySlug).mockResolvedValue(plan);

    const result = await resolvePlanId("summer-trip", client);

    expect(result).toEqual(plan);
    expect(fetchPlanIdentityById).not.toHaveBeenCalled();
    expect(fetchPlanIdentityBySlug).toHaveBeenCalledWith("summer-trip", { client });
  });

  it("returns null for empty input", async () => {
    const result = await resolvePlanId("   ", client);

    expect(result).toBeNull();
    expect(fetchPlanIdentityById).not.toHaveBeenCalled();
    expect(fetchPlanIdentityBySlug).not.toHaveBeenCalled();
  });
});
