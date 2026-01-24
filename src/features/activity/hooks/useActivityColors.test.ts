import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useActivityColors, useCardColors } from "./useActivityColors";

describe("useActivityColors", () => {
  it("returns matching color when found by bg", () => {
    const { result } = renderHook(() => useActivityColors("bg-[var(--color-2)]"));
    expect(result.current.bg).toBe("bg-[var(--color-2)]");
    expect(result.current.border).toBe("border-[var(--color-2-border)]");
  });

  it("returns matching color when found by name", () => {
    const { result } = renderHook(() => useActivityColors("Teal"));
    expect(result.current.bg).toBe("bg-[var(--color-3)]");
    expect(result.current.border).toBe("border-[var(--color-3-border)]");
  });

  it("returns first color as fallback when no match", () => {
    const { result } = renderHook(() => useActivityColors("unknown-color"));
    expect(result.current.bg).toBe("bg-[var(--color-0)]");
    expect(result.current.border).toBe("border-[var(--color-0-border)]");
  });

  it("returns first color as fallback when undefined", () => {
    const { result } = renderHook(() => useActivityColors(undefined));
    expect(result.current.bg).toBe("bg-[var(--color-0)]");
    expect(result.current.border).toBe("border-[var(--color-0-border)]");
  });

  it("uses fallbackBg when provided and no match", () => {
    const { result } = renderHook(() => useActivityColors("unknown", "bg-[var(--color-4)]"));
    expect(result.current.bg).toBe("bg-[var(--color-4)]");
    expect(result.current.border).toBe("border-[var(--color-4-border)]");
  });

  it("memoizes result based on dependencies", () => {
    const { result, rerender } = renderHook(({ color }) => useActivityColors(color), {
      initialProps: { color: "bg-[var(--color-1)]" },
    });
    const first = result.current;
    rerender({ color: "bg-[var(--color-1)]" });
    expect(result.current).toBe(first);
  });
});

describe("useCardColors", () => {
  it("extracts colors from twBg", () => {
    const { result } = renderHook(() => useCardColors("bg-[var(--color-2)]"));
    expect(result.current.twBg).toBe("bg-[var(--color-2)]");
    expect(result.current.border).toBe("border-[var(--color-2-border)]");
  });

  it("returns undefined when no twBg", () => {
    const { result } = renderHook(() => useCardColors());
    expect(result.current.twBg).toBeUndefined();
    expect(result.current.border).toBeUndefined();
  });

  it("ignores hex colors in bgColor", () => {
    const { result } = renderHook(() => useCardColors(undefined, "#ff0000"));
    expect(result.current.twBg).toBeUndefined();
    expect(result.current.border).toBeUndefined();
  });

  it("finds border for valid twBg", () => {
    const { result } = renderHook(() => useCardColors("bg-[var(--color-5)]"));
    expect(result.current.border).toBe("border-[var(--color-5-border)]");
  });

  it("returns undefined border for unknown color", () => {
    const { result } = renderHook(() => useCardColors("bg-[var(--color-unknown)]"));
    expect(result.current.border).toBeUndefined();
  });
});
