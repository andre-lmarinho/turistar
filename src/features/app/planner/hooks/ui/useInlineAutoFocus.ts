import { type RefObject, useCallback, useEffect } from "react";

export function useInlineAutoFocus(inputRef: RefObject<HTMLInputElement | null>) {
  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    const length = input.value.length;
    input.setSelectionRange(length, length);
    if (typeof input.scrollIntoView === "function") {
      input.scrollIntoView({ block: "center" });
    }
  }, [inputRef]);

  useEffect(() => {
    const frame = requestAnimationFrame(focusInput);

    if (typeof window !== "undefined") {
      const viewport = window.visualViewport ?? null;
      if (viewport) {
        const handler = () => focusInput();
        viewport.addEventListener("resize", handler);
        return () => {
          cancelAnimationFrame(frame);
          viewport.removeEventListener("resize", handler);
        };
      }
    }

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [focusInput]);

  return focusInput;
}
