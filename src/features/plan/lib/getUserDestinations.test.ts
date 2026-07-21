import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import { getUserDestinations } from "./getUserDestinations";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));

type Row = {
  destination_name: string | null;
  destination_country: string | null;
  latitude: number | null;
  longitude: number | null;
};

function buildSupabase(result: { data: Row[] | null; error: unknown }) {
  const not = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ not });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  const supabase = { from } as unknown as ReturnType<typeof createSupabaseServerClient>;
  return { supabase, from, select, eq, not };
}

describe("getUserDestinations", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
  });

  it("returns an empty array when there is no data", async () => {
    const { supabase } = buildSupabase({ data: null, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserDestinations("user-1")).resolves.toEqual([]);
  });

  it("dedupes by name and keeps country + (nullable) coordinates", async () => {
    const { supabase } = buildSupabase({
      data: [
        { destination_name: "Paris", destination_country: "FR", latitude: 48.8, longitude: 2.3 },
        { destination_name: "Tokyo", destination_country: "JP", latitude: 35.6, longitude: 139.7 },
        { destination_name: "Paris", destination_country: "FR", latitude: 48.8, longitude: 2.3 }, // dup
        { destination_name: "Lisbon", destination_country: "PT", latitude: null, longitude: null }, // no pin
      ],
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    const destinations = await getUserDestinations("user-1");

    expect(destinations).toEqual([
      { name: "Paris", country: "FR", lat: 48.8, lng: 2.3 },
      { name: "Tokyo", country: "JP", lat: 35.6, lng: 139.7 },
      { name: "Lisbon", country: "PT", lat: null, lng: null },
    ]);
  });

  it("throws a descriptive error when Supabase fails", async () => {
    const { supabase } = buildSupabase({ data: null, error: { message: "boom" } });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce(supabase);

    await expect(getUserDestinations("user-1")).rejects.toThrow(/getUserDestinations.*userId=user-1.*boom/s);
  });
});
