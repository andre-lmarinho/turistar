import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));

    expect(result.current).toBe("initial");
  });

  it("returns initial value for number", () => {
    const { result } = renderHook(() => useDebounce(42, 300));

    expect(result.current).toBe(42);
  });

  it("returns initial value for null", () => {
    const { result } = renderHook(() => useDebounce<null>(null, 300));

    expect(result.current).toBeNull();
  });

  it("returns initial value for undefined", () => {
    const { result } = renderHook(() => useDebounce(undefined, 300));

    expect(result.current).toBeUndefined();
  });

  it("returns initial value for empty string", () => {
    const { result } = renderHook(() => useDebounce("", 300));

    expect(result.current).toBe("");
  });

  it("returns initial value for zero", () => {
    const { result } = renderHook(() => useDebounce(0, 300));

    expect(result.current).toBe(0);
  });

  it("returns initial value for false", () => {
    const { result } = renderHook(() => useDebounce(false, 300));

    expect(result.current).toBe(false);
  });

  it("handles object reference equality", () => {
    const obj = { key: "value" };
    const { result } = renderHook(() => useDebounce(obj, 300));

    expect(result.current).toBe(obj);
  });

  it("handles array reference equality", () => {
    const arr = [1, 2, 3];
    const { result } = renderHook(() => useDebounce(arr, 300));

    expect(result.current).toBe(arr);
  });

  it("returns different types correctly", () => {
    const { result: r1 } = renderHook(() => useDebounce("string", 300));
    const { result: r2 } = renderHook(() => useDebounce(123, 300));
    const { result: r3 } = renderHook(() => useDebounce(true, 300));

    expect(r1.current).toBe("string");
    expect(r2.current).toBe(123);
    expect(r3.current).toBe(true);
  });

  it("does not update value immediately when input changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    expect(result.current).toBe("initial");

    rerender({ value: "updated" });

    expect(result.current).toBe("initial");
  });

  it("updates value after delay expires", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("only emits final value on rapid consecutive changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    rerender({ value: "c" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("c");
  });

  it("does not emit intermediate values", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "first" },
    });

    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("first");

    rerender({ value: "third" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("first");
  });

  it("resets timer on each value change", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "v1" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    rerender({ value: "v2" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("v2");
  });
});
