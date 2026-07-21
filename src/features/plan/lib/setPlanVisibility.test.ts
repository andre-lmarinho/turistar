import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import { setPlanVisibility } from "./setPlanVisibility";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

function buildUpdateMock(error: Error | null) {
  const eq = vi.fn(() => Promise.resolve({ error }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));
  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from, update, eq };
}

describe("setPlanVisibility", () => {
  beforeEach(() => vi.mocked(createSupabaseServerClient).mockReset());

  it("updates is_public for the given plan", async () => {
    const { supabase, from, update, eq } = buildUpdateMock(null);
    vi.mocked(createSupabaseServerClient).mockReturnValue(supabase);

    await setPlanVisibility("plan-1", true);

    expect(from).toHaveBeenCalledWith("plans");
    expect(update).toHaveBeenCalledWith({ is_public: true });
    expect(eq).toHaveBeenCalledWith("id", "plan-1");
  });

  it("throws a contextual error when the update fails", async () => {
    const { supabase } = buildUpdateMock(new Error("db down"));
    vi.mocked(createSupabaseServerClient).mockReturnValue(supabase);

    await expect(setPlanVisibility("plan-9", false)).rejects.toThrow(/setPlanVisibility/);
  });
});
