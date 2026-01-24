import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("GeoapifyService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchGeoapifyAutocomplete", () => {
    it("uses proximity bias when lat/lon provided", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response);

      const { fetchGeoapifyAutocomplete } = await import("./GeoapifyService");
      await fetchGeoapifyAutocomplete("test", 48.8566, 2.3522);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("bias=proximity:2.3522,48.8566"),
        expect.any(Object)
      );
    });

    it("throws error when fetch fails", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { fetchGeoapifyAutocomplete } = await import("./GeoapifyService");
      await expect(fetchGeoapifyAutocomplete("test")).rejects.toThrow(
        "fetchGeoapifyAutocompleteInternal failed"
      );
    });

    it("handles empty response", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const { fetchGeoapifyAutocomplete } = await import("./GeoapifyService");
      const result = await fetchGeoapifyAutocomplete("test");

      expect(result).toEqual([]);
    });
  });

  describe("fetchGeoapifyAddressAutocomplete", () => {
    it("throws error when API returns error status", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      } as Response);

      const { fetchGeoapifyAddressAutocomplete } = await import("./GeoapifyService");
      await expect(fetchGeoapifyAddressAutocomplete("test")).rejects.toThrow(
        "fetchGeoapifyAutocompleteInternal failed"
      );
    });
  });

  describe("fetchGeoapifyPlaceSearch", () => {
    it("throws error when search fails", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
      } as Response);

      const { fetchGeoapifyPlaceSearch } = await import("./GeoapifyService");
      await expect(fetchGeoapifyPlaceSearch("test")).rejects.toThrow("fetchGeoapifyPlaceSearch failed");
    });
  });

  describe("fetchGeoapifyPlaceDetails", () => {
    it("throws error when place not found", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ features: [] }),
      } as Response);

      const { fetchGeoapifyPlaceDetails } = await import("./GeoapifyService");
      await expect(fetchGeoapifyPlaceDetails("nonexistent")).rejects.toThrow(
        "fetchGeoapifyPlaceDetails failed: placeId=nonexistent reason=no_features"
      );
    });

    it("throws error when API fails", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const { fetchGeoapifyPlaceDetails } = await import("./GeoapifyService");
      await expect(fetchGeoapifyPlaceDetails("place-123")).rejects.toThrow(
        "fetchGeoapifyPlaceDetails failed: placeId=place-123 status=404"
      );
    });

    it("handles missing timezone gracefully", async () => {
      const mockFeature = {
        properties: {
          place_id: "place-123",
          name: "Some Place",
          formatted: "Some Place",
          lat: 0,
          lon: 0,
        },
      };

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ features: [mockFeature] }),
      } as Response);

      const { fetchGeoapifyPlaceDetails } = await import("./GeoapifyService");
      const result = await fetchGeoapifyPlaceDetails("place-123");

      expect(result.timezone).toBeUndefined();
    });
  });
});
