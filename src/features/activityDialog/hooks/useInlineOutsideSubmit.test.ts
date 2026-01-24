import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useInlineOutsideSubmit } from "./useInlineOutsideSubmit";

describe("useInlineOutsideSubmit", () => {
  let containerRef: { current: HTMLElement | null };
  let handleSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    containerRef = { current: null };
    handleSubmit = vi.fn();
    vi.clearAllMocks();
  });

  it("sets up event listeners on mount", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    expect(addEventListenerSpy).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith("focusin", expect.any(Function));
  });

  it("removes event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("focusin", expect.any(Function));
  });

  it("triggers handleSubmit when clicking outside container", () => {
    containerRef.current = document.createElement("div");
    const outsideElement = document.createElement("span");

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    const pointerDownEvent = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(pointerDownEvent, "target", { value: outsideElement });

    document.dispatchEvent(pointerDownEvent);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("triggers handleSubmit when focusing outside container", () => {
    containerRef.current = document.createElement("div");
    const outsideElement = document.createElement("input");

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    const focusInEvent = new FocusEvent("focusin", { bubbles: true });
    Object.defineProperty(focusInEvent, "target", { value: outsideElement });

    document.dispatchEvent(focusInEvent);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not trigger handleSubmit when clicking inside container", () => {
    containerRef.current = document.createElement("div");
    const insideElement = document.createElement("span");
    containerRef.current.appendChild(insideElement);

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    const pointerDownEvent = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(pointerDownEvent, "target", { value: insideElement });

    document.dispatchEvent(pointerDownEvent);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("does not trigger handleSubmit when focusing inside container", () => {
    containerRef.current = document.createElement("div");
    const insideElement = document.createElement("input");
    containerRef.current.appendChild(insideElement);

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    const focusInEvent = new FocusEvent("focusin", { bubbles: true });
    Object.defineProperty(focusInEvent, "target", { value: insideElement });

    document.dispatchEvent(focusInEvent);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("does not trigger handleSubmit when containerRef is null", () => {
    containerRef.current = null;

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    const pointerDownEvent = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(pointerDownEvent, "target", { value: document.createElement("span") });

    document.dispatchEvent(pointerDownEvent);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("does not trigger handleSubmit when target is not a Node", () => {
    containerRef.current = document.createElement("div");

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    const pointerDownEvent = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(pointerDownEvent, "target", { value: null });

    document.dispatchEvent(pointerDownEvent);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("updates handleSubmit reference when it changes", () => {
    containerRef.current = document.createElement("div");
    const outsideElement = document.createElement("span");

    const mockSubmit = vi.fn();
    const { rerender } = renderHook(
      ({ handleSubmit }) =>
        useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }),
      {
        initialProps: { handleSubmit: mockSubmit },
      }
    );

    const newHandleSubmit = vi.fn();
    rerender({ handleSubmit: newHandleSubmit });

    const pointerDownEvent = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(pointerDownEvent, "target", { value: outsideElement });

    document.dispatchEvent(pointerDownEvent);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(newHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("handles nested elements correctly", () => {
    containerRef.current = document.createElement("div");
    const nestedElement = document.createElement("span");
    const deeplyNestedElement = document.createElement("strong");
    nestedElement.appendChild(deeplyNestedElement);
    containerRef.current.appendChild(nestedElement);

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    const pointerDownEvent = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(pointerDownEvent, "target", { value: deeplyNestedElement });

    document.dispatchEvent(pointerDownEvent);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("triggers for both pointerdown and focusin events", () => {
    containerRef.current = document.createElement("div");
    const outsideElement = document.createElement("span");

    renderHook(() => useInlineOutsideSubmit({ containerRef, handleSubmit: handleSubmit as () => void }));

    const pointerDownEvent = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(pointerDownEvent, "target", { value: outsideElement });

    const focusInEvent = new FocusEvent("focusin", { bubbles: true });
    Object.defineProperty(focusInEvent, "target", { value: outsideElement });

    document.dispatchEvent(pointerDownEvent);
    document.dispatchEvent(focusInEvent);

    expect(handleSubmit).toHaveBeenCalledTimes(2);
  });
});
