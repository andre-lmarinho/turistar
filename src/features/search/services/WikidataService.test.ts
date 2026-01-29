import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchWikidataImage } from "./WikidataService";

describe("fetchWikidataImage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns undefined for empty entityId", async () => {
    const result = await fetchWikidataImage("");

    expect(result).toBeUndefined();
  });

  it("returns undefined when entity has no image claim", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ entities: { Q123: { claims: {} } } }),
    });

    const result = await fetchWikidataImage("Q123");

    expect(result).toBeUndefined();
  });

  it("returns image URL when entity has image claim", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          entities: {
            Q123: {
              claims: {
                P18: [
                  {
                    mainsnak: {
                      datavalue: {
                        value: "Eiffel Tower.jpg",
                      },
                    },
                  },
                ],
              },
            },
          },
        }),
    });

    const result = await fetchWikidataImage("Q123");

    expect(result).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/Eiffel%20Tower.jpg?width=400");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://www.wikidata.org/wiki/Special:EntityData/Q123.json",
      { signal: undefined }
    );
  });

  it("returns undefined when fetch fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const result = await fetchWikidataImage("Q123");

    expect(result).toBeUndefined();
  });

  it("returns undefined when fetch throws", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await fetchWikidataImage("Q123");

    expect(result).toBeUndefined();
  });

  it("uses signal when provided", async () => {
    const abortController = new AbortController();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ entities: { Q123: { claims: {} } } }),
    });

    await fetchWikidataImage("Q123", abortController.signal);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://www.wikidata.org/wiki/Special:EntityData/Q123.json",
      { signal: abortController.signal }
    );
  });

  it("handles multiple image claims, returning first", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          entities: {
            Q123: {
              claims: {
                P18: [
                  {
                    mainsnak: {
                      datavalue: {
                        value: "First Image.jpg",
                      },
                    },
                  },
                  {
                    mainsnak: {
                      datavalue: {
                        value: "Second Image.jpg",
                      },
                    },
                  },
                ],
              },
            },
          },
        }),
    });

    const result = await fetchWikidataImage("Q123");

    expect(result).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/First%20Image.jpg?width=400");
  });

  it("URL encodes the filename", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          entities: {
            Q123: {
              claims: {
                P18: [
                  {
                    mainsnak: {
                      datavalue: {
                        value: "Image With Spaces.jpg",
                      },
                    },
                  },
                ],
              },
            },
          },
        }),
    });

    const result = await fetchWikidataImage("Q123");

    expect(result).toBe(
      "https://commons.wikimedia.org/wiki/Special:FilePath/Image%20With%20Spaces.jpg?width=400"
    );
  });

  it("handles entities without claims property", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ entities: { Q123: {} } }),
    });

    const result = await fetchWikidataImage("Q123");

    expect(result).toBeUndefined();
  });

  it("handles entities with null claims", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ entities: { Q123: { claims: null } } }),
    });

    const result = await fetchWikidataImage("Q123");

    expect(result).toBeUndefined();
  });
});
