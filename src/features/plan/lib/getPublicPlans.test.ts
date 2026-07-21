import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import { getPublicPlans } from "./getPublicPlans";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

function buildSelectMock(result: { data: unknown; error: Error | null }) {
  const order = vi.fn(() => Promise.resolve(result));
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from, select, eq, order };
}

describe("getPublicPlans", () => {
  beforeEach(() => vi.mocked(createSupabaseServerClient).mockReset());

  it("maps public plans to summaries and falls back on a missing title", async () => {
    const rows = [
      { id: "p1", title: "Rome", cover_image: "/img.jpg", public_slug: "slug-1" },
      { id: "p2", title: null, cover_image: null, public_slug: "slug-2" },
    ];
    const { supabase, from, select, eq } = buildSelectMock({ data: rows, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValue(supabase);

    const result = await getPublicPlans();

    expect(from).toHaveBeenCalledWith("plans");
    expect(select).toHaveBeenCalledWith("id, title, cover_image, public_slug");
    expect(eq).toHaveBeenCalledWith("is_public", true);
    expect(result).toEqual([
      { id: "p1", title: "Rome", coverImage: "/img.jpg", publicSlug: "slug-1" },
      { id: "p2", title: "Untitled trip", coverImage: null, publicSlug: "slug-2" },
    ]);
  });

  it("returns an empty array when there are no public plans", async () => {
    const { supabase } = buildSelectMock({ data: [], error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValue(supabase);

    expect(await getPublicPlans()).toEqual([]);
  });

  it("throws a contextual error when the query fails", async () => {
    const { supabase } = buildSelectMock({ data: null, error: new Error("db down") });
    vi.mocked(createSupabaseServerClient).mockReturnValue(supabase);

    await expect(getPublicPlans()).rejects.toThrow(/getPublicPlans/);
  });
});
