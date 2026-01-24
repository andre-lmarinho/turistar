import { beforeEach, describe, expect, it, vi } from "vitest";

describe("snapshotsClient", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchSnapshot", () => {
    it("is exported as a function", async () => {
      const { fetchSnapshot } = await import("./snapshotsClient");
      expect(typeof fetchSnapshot).toBe("function");
    });

    it("throws error when response is not ok", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { fetchSnapshot } = await import("./snapshotsClient");

      await expect(fetchSnapshot("plan-1")).rejects.toThrow("fetchJson failed");
    });

    it("throws error when snapshot is null", async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ snapshot: null }),
      } as Response);

      const { fetchSnapshot } = await import("./snapshotsClient");

      await expect(fetchSnapshot("plan-1")).rejects.toThrow("Missing snapshot response");
    });

    it("returns snapshot when valid", async () => {
      const mockFetch = vi.mocked(fetch);
      const mockSnapshot = {
        version: 1,
        days: [],
        updatedAt: new Date().toISOString(),
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ snapshot: mockSnapshot }),
      } as Response);

      const { fetchSnapshot } = await import("./snapshotsClient");
      const result = await fetchSnapshot("plan-1");

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("plan-1"), expect.any(Object));
      expect(result.version).toBe(1);
      expect(result.days).toEqual([]);
    });
  });
});
