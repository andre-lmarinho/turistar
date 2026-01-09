import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import { getVisitedCountries } from "./getVisitedCountries";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

type SupabaseResult = {
  data:
    | {
        plan_destinations: { destinations: { country: string | null } | null }[] | null;
      }[]
    | null;
  error: unknown;
};

function buildSupabase(result: SupabaseResult) {
  const eq = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, select, eq };
}

describe("getVisitedCountries", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it("returns an empty array when Supabase returns no data", async () => {
    const result: SupabaseResult = { data: null, error: null };
    const { supabase } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const visited = await getVisitedCountries("user-1");

    expect(visited).toEqual([]);
  });

  it("normalizes visited countries to uppercase without duplicates", async () => {
    const result: SupabaseResult = {
      data: [
        {
          plan_destinations: [{ destinations: { country: " br " } }, { destinations: { country: "us" } }],
        },
        {
          plan_destinations: [{ destinations: { country: "us" } }, { destinations: { country: null } }],
        },
        {
          plan_destinations: null,
        },
        {
          plan_destinations: [{ destinations: { country: "fr" } }],
        },
      ],
      error: null,
    };

    const { supabase } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const visited = await getVisitedCountries("user-1");

    expect(visited).toEqual(["BR", "US", "FR"]);
  });

  it("throws when Supabase returns an error", async () => {
    const failure = new Error("boom");
    const result: SupabaseResult = { data: null, error: failure };
    const { supabase } = buildSupabase(result);
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getVisitedCountries("user-1")).rejects.toBe(failure);
  });
});
