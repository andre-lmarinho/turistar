import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("GeoapifyService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchGeoapifyAutocomplete", () => {
    it("keeps destinations in priority order with the country and coordinates used to create a plan", async () => {
      const result = { formatted: "Paris, France", lat: 48.86, lon: 2.35, country_code: "fr", place_id: 12 };
      vi.mocked(fetch).mockResolvedValue(
        Response.json({
          features: ["country", "building", "city"].map((result_type) => ({
            properties: { ...result, result_type, name: result_type, formatted: `${result_type} Paris` },
          })),
        })
      );
      const { fetchGeoapifyAutocomplete } = await import("./GeoapifyService");
      const items = await fetchGeoapifyAutocomplete("Paris");
      expect(items.map((item) => item.name)).toEqual(["city Paris", "country Paris"]);
      expect(items[0]).toMatchObject({ latitude: 48.86, longitude: 2.35, countryCode: "fr", placeId: "12" });
    });
    it("uses proximity bias when lat/lon provided", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response);

      const { fetchGeoapifyAutocomplete } = await import("./GeoapifyService");
      await fetchGeoapifyAutocomplete("test", 48.8566, 2.3522);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("bias=proximity%3A2.3522%2C48.8566"),
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
      await expect(fetchGeoapifyAutocomplete("test")).rejects.toThrow("v1/geocode/autocomplete: HTTP 500");
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
        "v1/geocode/autocomplete: HTTP 403"
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
      await expect(fetchGeoapifyPlaceSearch("test")).rejects.toThrow("v1/geocode/search: HTTP 429");
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
      await expect(fetchGeoapifyPlaceDetails("nonexistent")).rejects.toThrow("no place for nonexistent");
    });

    it("throws error when API fails", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const { fetchGeoapifyPlaceDetails } = await import("./GeoapifyService");
      await expect(fetchGeoapifyPlaceDetails("place-123")).rejects.toThrow("v2/place-details: HTTP 404");
    });

    it("returns the address even without optional enrichment", async () => {
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

      expect(result).toEqual({ formatted: "Some Place", description: undefined, wikidataId: undefined });
    });
  });

  describe("readGeoapifyCoordinates", () => {
    it("ignores whitespace-only coordinate values", async () => {
      const { readGeoapifyCoordinates } = await import("./GeoapifyService");
      const params = new URLSearchParams({ lat: " ", lon: " " });
      expect(readGeoapifyCoordinates(params)).toEqual({ lat: undefined, lon: undefined });
    });
  });

  describe("validateGeoapifyQuery", () => {
    it("returns an error response when the parameter is missing", async () => {
      const { validateGeoapifyQuery } = await import("./GeoapifyService");
      const result = validateGeoapifyQuery(new URLSearchParams(), "text");

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        await expect(result.json()).resolves.toEqual({ error: "Query is required." });
      }
    });

    it("returns an error response when the value is shorter than the minimum", async () => {
      const { validateGeoapifyQuery } = await import("./GeoapifyService");
      const params = new URLSearchParams({ text: "aa" });
      const result = validateGeoapifyQuery(params, "text");

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        await expect(result.json()).resolves.toEqual({
          error: "Query must be at least 3 characters.",
        });
      }
    });

    it("returns the string when the parameter is valid", async () => {
      const { validateGeoapifyQuery } = await import("./GeoapifyService");
      const params = new URLSearchParams({ text: "aaa" });
      const result = validateGeoapifyQuery(params, "text");

      expect(result).toBe("aaa");
    });
  });
});
