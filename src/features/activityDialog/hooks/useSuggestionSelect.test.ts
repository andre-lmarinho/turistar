import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActivitySuggestion, PlaceSelection } from "@/features/search/types";
import { useSuggestionSelect } from "../hooks/useSuggestionSelect";

describe("useSuggestionSelect", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("is exported as a function", () => {
    expect(typeof useSuggestionSelect).toBe("function");
  });

  it("returns handleSuggestionSelect function", () => {
    const { result } = renderHook(() => useSuggestionSelect({ onSelectSuggestion: vi.fn() }));

    expect(result.current).toHaveProperty("handleSuggestionSelect");
    expect(typeof result.current.handleSuggestionSelect).toBe("function");
  });

  it("calls onSelectSuggestion with suggestion data when selection is made", async () => {
    const onSelectSuggestion = vi.fn();
    const { result } = renderHook(() => useSuggestionSelect({ onSelectSuggestion }));

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ details: {}, wikidataImageUrl: undefined }), { status: 200 })
    );

    const mockSelection: PlaceSelection<ActivitySuggestion> = {
      placeId: "place-123",
      name: "Eiffel Tower",
      formatted: "Eiffel Tower, Paris",
      latitude: 48.8584,
      longitude: 2.2945,
      category: "tourism.sights",
    };

    await result.current.handleSuggestionSelect(mockSelection);

    expect(onSelectSuggestion).toHaveBeenCalledTimes(1);
    const calledWith = onSelectSuggestion.mock.calls[0][0];
    expect(calledWith).toHaveProperty("title", "Eiffel Tower");
    expect(calledWith).toHaveProperty("address", "Eiffel Tower, Paris");
    expect(calledWith).toHaveProperty("latitude", 48.8584);
    expect(calledWith).toHaveProperty("longitude", 2.2945);
  });

  it("calls onSuggestionProcessed after processing suggestion", async () => {
    const onSuggestionProcessed = vi.fn();
    const { result } = renderHook(() => useSuggestionSelect({ onSuggestionProcessed }));

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ details: {}, wikidataImageUrl: undefined }), { status: 200 })
    );

    const mockSelection: PlaceSelection<ActivitySuggestion> = {
      placeId: "place-456",
      name: "Louvre Museum",
      formatted: "Louvre, Paris",
      latitude: 48.8606,
      longitude: 2.3376,
    };

    await result.current.handleSuggestionSelect(mockSelection);

    expect(onSuggestionProcessed).toHaveBeenCalledTimes(1);
    expect(onSuggestionProcessed.mock.calls[0][0]).toHaveProperty("title", "Louvre Museum");
  });

  it("calls both callbacks when both are provided", async () => {
    const onSelectSuggestion = vi.fn();
    const onSuggestionProcessed = vi.fn();
    const { result } = renderHook(() => useSuggestionSelect({ onSelectSuggestion, onSuggestionProcessed }));

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ details: {}, wikidataImageUrl: undefined }), { status: 200 })
    );

    const mockSelection: PlaceSelection<ActivitySuggestion> = {
      placeId: "place-789",
      name: "Notre Dame",
      latitude: 48.853,
      longitude: 2.3499,
    };

    await result.current.handleSuggestionSelect(mockSelection);

    expect(onSelectSuggestion).toHaveBeenCalledTimes(1);
    expect(onSuggestionProcessed).toHaveBeenCalledTimes(1);
  });

  it("does not throw when callbacks are not provided", async () => {
    const { result } = renderHook(() => useSuggestionSelect({}));

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ details: {}, wikidataImageUrl: undefined }), { status: 200 })
    );

    const mockSelection: PlaceSelection<ActivitySuggestion> = {
      placeId: "place-abc",
      name: "Arc de Triomphe",
      latitude: 48.8738,
      longitude: 2.295,
    };

    // Should complete without throwing - function returns activity data when successful
    await result.current.handleSuggestionSelect(mockSelection);
  });

  it("handles fetch error gracefully and still calls callback with basic data", async () => {
    const onSelectSuggestion = vi.fn();
    const { result } = renderHook(() => useSuggestionSelect({ onSelectSuggestion }));

    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    const mockSelection: PlaceSelection<ActivitySuggestion> = {
      placeId: "place-error",
      name: "Test Place",
      latitude: 0,
      longitude: 0,
    };

    await result.current.handleSuggestionSelect(mockSelection);

    expect(onSelectSuggestion).toHaveBeenCalledTimes(1);
    expect(onSelectSuggestion.mock.calls[0][0]).toHaveProperty("title", "Test Place");
    expect(onSelectSuggestion.mock.calls[0][0]).toHaveProperty("latitude", 0);
    expect(onSelectSuggestion.mock.calls[0][0]).toHaveProperty("longitude", 0);
  });

  it("aborts previous request when new selection is made", async () => {
    const onSelectSuggestion = vi.fn();
    const { result } = renderHook(() => useSuggestionSelect({ onSelectSuggestion }));

    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(
      (_url, options) =>
        new Promise((resolve, reject) => {
          callCount++;
          const timeoutId = setTimeout(() => {
            resolve(
              new Response(JSON.stringify({ details: {}, wikidataImageUrl: undefined }), {
                status: 200,
              })
            );
          }, 50);

          options?.signal?.addEventListener("abort", () => {
            clearTimeout(timeoutId);
            reject(new DOMException("Aborted", "AbortError"));
          });
        })
    );

    const firstSelection: PlaceSelection<ActivitySuggestion> = {
      placeId: "place-first",
      name: "First Place",
      latitude: 1,
      longitude: 1,
    };

    const secondSelection: PlaceSelection<ActivitySuggestion> = {
      placeId: "place-second",
      name: "Second Place",
      latitude: 2,
      longitude: 2,
    };

    const firstPromise = result.current.handleSuggestionSelect(firstSelection);
    await result.current.handleSuggestionSelect(secondSelection);
    await firstPromise;

    expect(callCount).toBe(2);
    expect(onSelectSuggestion).toHaveBeenCalledTimes(1);
    expect(onSelectSuggestion.mock.calls[0][0]).toHaveProperty("title", "Second Place");
  });
});
