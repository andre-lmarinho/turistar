import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useInlineAutoFocus } from "./useInlineAutoFocus";

describe("useInlineAutoFocus", () => {
  it("returns a focus function", () => {
    const inputRef = { current: null };

    const { result } = renderHook(() => useInlineAutoFocus(inputRef));

    expect(typeof result.current).toBe("function");
  });

  it("focus function does not throw when ref is null", () => {
    const inputRef = { current: null };

    const { result } = renderHook(() => useInlineAutoFocus(inputRef));

    expect(() => result.current()).not.toThrow();
  });

  it("focus function focuses input when ref exists", () => {
    const inputElement = document.createElement("input");
    inputElement.value = "test";
    const inputRef = { current: inputElement };

    const focusSpy = vi.spyOn(inputElement, "focus");
    const setSelectionRangeSpy = vi.spyOn(inputElement, "setSelectionRange");

    const { result } = renderHook(() => useInlineAutoFocus(inputRef));

    result.current();

    expect(focusSpy).toHaveBeenCalled();
    expect(setSelectionRangeSpy).toHaveBeenCalledWith(4, 4);
  });

  it("focus function sets selection range at end", () => {
    const inputElement = document.createElement("input");
    inputElement.value = "hello world";
    const inputRef = { current: inputElement };

    const setSelectionRangeSpy = vi.spyOn(inputElement, "setSelectionRange");

    const { result } = renderHook(() => useInlineAutoFocus(inputRef));

    result.current();

    expect(setSelectionRangeSpy).toHaveBeenCalledWith(11, 11);
  });
});
