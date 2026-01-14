import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGeoapifyAutocomplete } from "@/features/app/planner/services/geoapify/autocomplete";

import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import { createPlan } from "./createPlan";

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/features/app/planner/services/geoapify/autocomplete", () => ({
  fetchGeoapifyAutocomplete: vi.fn(),
}));

describe("createPlan action", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockReset();
    vi.mocked(fetchGeoapifyAutocomplete).mockReset();
    vi.mocked(fetchGeoapifyAutocomplete).mockResolvedValue([
      { name: "Brazil", latitude: -15.78, longitude: -47.93, countryCode: "BR" },
    ]);
  });

  it("sends formatted payload and supports array responses", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          result_plan_id: "plan-1",
          result_public_slug: "slug-1",
          result_edit_token: "token-1",
        },
      ],
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    const result = await createPlan(
      "Trip to Paris",
      { name: "Paris", latitude: 1.23, longitude: 4.56 },
      "2024-01-01T10:00:00Z",
      "2024-01-05T12:00:00Z"
    );

    expect(rpc).toHaveBeenCalledWith("create_full_plan", {
      _title: "Trip to Paris",
      _dest_name: "Paris",
      _dest_lat: 1.23,
      _dest_long: 4.56,
      _dest_country: "BR",
      _start_date: "2024-01-01",
      _end_date: "2024-01-05",
      _user_id: null,
    });
    expect(result).toEqual({ id: "plan-1", publicSlug: "slug-1", editToken: "token-1" });
  });

  it("supports object responses from RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        result_plan_id: "plan-2",
        result_public_slug: "slug-2",
        result_edit_token: "token-2",
      },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    const result = await createPlan("Title", { name: "Lisbon" }, "2024-02-01", "2024-02-10");

    expect(rpc).toHaveBeenCalledWith("create_full_plan", {
      _title: "Title",
      _dest_name: "Lisbon",
      _dest_lat: null,
      _dest_long: null,
      _dest_country: "BR",
      _start_date: "2024-02-01",
      _end_date: "2024-02-10",
      _user_id: null,
    });
    expect(result).toEqual({ id: "plan-2", publicSlug: "slug-2", editToken: "token-2" });
  });

  it("throws when the RPC returns an error", async () => {
    const error = new Error("failed");
    const rpc = vi.fn().mockResolvedValue({ data: null, error });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await expect(createPlan("x", { name: "Y" }, "2024-01-01", "2024-01-02")).rejects.toBe(error);
  });

  it("includes the provided user id in the RPC payload", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          result_plan_id: "plan-1",
          result_public_slug: "slug",
          result_edit_token: "token",
        },
      ],
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await createPlan("Trip", { name: "Rome" }, "2024-01-01", "2024-01-02", "user-123");

    expect(rpc).toHaveBeenCalledWith("create_full_plan", expect.objectContaining({ _user_id: "user-123" }));
  });

  it("throws when the RPC does not return data", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);

    await expect(createPlan("x", { name: "Y" }, "2024-01-01", "2024-01-02")).rejects.toThrow(
      "Failed to create plan"
    );
  });

  it("uses the provided country without hitting Geoapify when present", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        result_plan_id: "plan-3",
        result_public_slug: "slug-3",
        result_edit_token: "token-3",
      },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);
    vi.mocked(fetchGeoapifyAutocomplete).mockClear();

    await createPlan("Rome Trip", { name: "Rome", country: " it " }, "2024-03-01", "2024-03-07");

    expect(fetchGeoapifyAutocomplete).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledWith("create_full_plan", expect.objectContaining({ _dest_country: "IT" }));
  });

  it("continues when Geoapify lookup fails and leaves country null", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        result_plan_id: "plan-4",
        result_public_slug: "slug-4",
        result_edit_token: "token-4",
      },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockReturnValueOnce({
      rpc,
    } as unknown as ReturnType<typeof createSupabaseServerClient>);
    const failure = new Error("network");
    vi.mocked(fetchGeoapifyAutocomplete).mockRejectedValueOnce(failure);

    await createPlan("Failure Trip", { name: "Unknown" }, "2024-04-01", "2024-04-05");

    expect(rpc).toHaveBeenCalledWith("create_full_plan", expect.objectContaining({ _dest_country: null }));
  });
});
