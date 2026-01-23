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

  it("formats dates and updates the plan record", async () => {
    const single = vi.fn().mockResolvedValue({ error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));

    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      from,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await updatePlanDates("plan-1", new Date("2024-03-10T12:00:00"), new Date("2024-03-15T12:00:00"));

    expect(from).toHaveBeenCalledWith("plans");
    expect(update).toHaveBeenCalledWith({ start_date: "2024-03-10", end_date: "2024-03-15" });
    expect(eq).toHaveBeenCalledWith("id", "plan-1");
  });

  it("throws with the Supabase error message when available", async () => {
    const error = { message: "update failed" };
    const single = vi.fn().mockResolvedValue({ error });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));

    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      from,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await expect(updatePlanDates("plan-1", new Date("2024-01-01"), new Date("2024-01-02"))).rejects.toThrow(
      "Supabase error during updatePlanDates (planId=plan-1). update failed"
    );
  });

  it("falls back to a generic error message", async () => {
    const single = vi.fn().mockResolvedValue({ error: {} });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));

    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      from,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await expect(updatePlanDates("plan-1", new Date("2024-01-01"), new Date("2024-01-02"))).rejects.toThrow(
      "Supabase error during updatePlanDates (planId=plan-1)."
    );
  });
});
