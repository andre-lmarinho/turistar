import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useActivitySuggestions, useAddressAutocomplete, useDestinationAutocomplete } from "./searchHooks";

function createTestWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, wrapper };
}

const hookTestCases = [
  { name: "useActivitySuggestions", hook: useActivitySuggestions, input: "test" },
  { name: "useAddressAutocomplete", hook: useAddressAutocomplete, input: "test" },
  { name: "useDestinationAutocomplete", hook: useDestinationAutocomplete, input: "Paris" },
] as const;

describe.each(hookTestCases)("$name", ({ hook, input }) => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("is exported as a function", () => {
    expect(typeof hook).toBe("function");
  });

  it("returns expected properties", () => {
    const { result } = renderHook(() => hook("test"));

    expect(result.current).toHaveProperty("results");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(Array.isArray(result.current.results)).toBe(true);
  });

  it("returns empty results for empty query", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const { result } = renderHook(() => hook(""));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns empty results for whitespace-only query", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const { result } = renderHook(() => hook("   "));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns empty results for single character query", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const { result } = renderHook(() => hook("a"));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns empty results for two character query", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const { result } = renderHook(() => hook("ab"));

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("initiates fetch for valid query length", () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ results: [{ name: "Test", latitude: 0, longitude: 0 }] }), {
        status: 200,
      })
    );

    const { result } = renderHook(() => hook(input));

    expect(fetchSpy).toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it("passes query parameters to fetch endpoint", () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ results: [] }), { status: 200 }));

    renderHook(() => hook("paris"));

    expect(fetchSpy).toHaveBeenCalled();
    expect(fetchSpy.mock.calls[0][0]).toContain("/api/");
    expect(fetchSpy.mock.calls[0][0]).toContain("paris");
  });

  it("handles fetch rejection without throwing", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => hook(input), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(true));
  });

  it("handles HTTP error response without throwing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
    );
    const { wrapper } = createTestWrapper();

    const { result } = renderHook(() => hook(input), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(true));
  });
});
