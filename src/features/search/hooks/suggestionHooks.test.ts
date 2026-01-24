import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hookTestCases = [
  { name: "useActivitySuggestions", path: "./useActivitySuggestions", input: "test" },
  { name: "useAddressAutocomplete", path: "./useAddressAutocomplete", input: "test" },
  { name: "useDestinationAutocomplete", path: "./useDestinationAutocomplete", input: "Paris" },
] as const;

describe.each(hookTestCases)("$name", ({ name, path, input }) => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("is exported as a function", async () => {
    const module = await import(path);
    expect(typeof module[name]).toBe("function");
  });

  it("returns expected properties", async () => {
    const module = await import(path);
    const { result } = renderHook(() => module[name]("test"));

    expect(result.current).toHaveProperty("results");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(Array.isArray(result.current.results)).toBe(true);
  });

  it("returns empty results for empty query", async () => {
    const module = await import(path);
    const { result } = renderHook(() => module[name](""));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it("returns empty results for whitespace-only query", async () => {
    const module = await import(path);
    const { result } = renderHook(() => module[name]("   "));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it("returns empty results for single character query", async () => {
    const module = await import(path);
    const { result } = renderHook(() => module[name]("a"));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it("returns empty results for two character query", async () => {
    const module = await import(path);
    const { result } = renderHook(() => module[name]("ab"));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it("initiates fetch for valid query length", async () => {
    const module = await import(path);
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ results: [{ name: "Test", latitude: 0, longitude: 0 }] }), {
        status: 200,
      })
    );

    const { result } = renderHook(() => module[name](input));

    expect(fetchSpy).toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it("passes query parameters to fetch endpoint", async () => {
    const module = await import(path);
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ results: [] }), { status: 200 }));

    renderHook(() => module[name]("paris"));

    expect(fetchSpy).toHaveBeenCalled();
    expect(fetchSpy.mock.calls[0][0]).toContain("/api/");
    expect(fetchSpy.mock.calls[0][0]).toContain("paris");
  });

  it("handles fetch rejection without throwing", async () => {
    const module = await import(path);
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    expect(() => renderHook(() => module[name](input))).not.toThrow();
  });

  it("handles HTTP error response without throwing", async () => {
    const module = await import(path);
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));

    expect(() => renderHook(() => module[name](input))).not.toThrow();
  });
});
