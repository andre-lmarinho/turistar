import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import { updatePlanDates } from "./updatePlanDates";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("updatePlanDates", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it("invokes the update_plan_dates RPC with formatted dates", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await updatePlanDates("plan-1", new Date("2024-03-10T12:00:00"), new Date("2024-03-15T12:00:00"));

    expect(rpc).toHaveBeenCalledWith("update_plan_dates", {
      _plan_id: "plan-1",
      _start_date: "2024-03-10",
      _end_date: "2024-03-15",
    });
  });

  it("throws with the Supabase error message when available", async () => {
    const error = { message: "update failed" };
    const rpc = vi.fn().mockResolvedValue({ error });

    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await expect(updatePlanDates("plan-1", new Date("2024-01-01"), new Date("2024-01-02"))).rejects.toThrow(
      "Supabase error during updatePlanDates (planId=plan-1). update failed"
    );
  });

  it("falls back to a generic error message", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: {} });

    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await expect(updatePlanDates("plan-1", new Date("2024-01-01"), new Date("2024-01-02"))).rejects.toThrow(
      "Supabase error during updatePlanDates (planId=plan-1)."
    );
  });
});
