import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import { updatePlanTitle } from "./updatePlanTitle";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("updatePlanTitle", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it("invokes the update_plan_title RPC with provided values", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await updatePlanTitle("plan-1", "token-123", "New Title");

    expect(rpc).toHaveBeenCalledWith("update_plan_title", {
      _plan_id: "plan-1",
      _edit_token: "token-123",
      _new_title: "New Title",
    });
  });

  it("throws when Supabase returns an error", async () => {
    const error = new Error("rpc failed");
    const rpc = vi.fn().mockResolvedValue({ error });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await expect(updatePlanTitle("plan-1", "token", "Title")).rejects.toThrow(
      "Supabase error during updatePlanTitle (planId=plan-1). rpc failed"
    );
  });
});
