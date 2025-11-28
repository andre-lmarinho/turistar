import { RefObject, useEffect, useRef } from 'react';

interface UseInlineOutsideSubmitParams {
  containerRef: RefObject<HTMLElement | null>;
  handleSubmit: () => void;
}

export function useInlineOutsideSubmit({
  containerRef,
  handleSubmit,
}: UseInlineOutsideSubmitParams) {
  const handlerRef = useRef(handleSubmit);

  useEffect(() => {
    handlerRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    const shouldTrigger = (target: EventTarget | null) => {
      if (!containerRef.current || !(target instanceof Node)) {
        return false;
      }

      return !containerRef.current.contains(target);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (shouldTrigger(event.target)) {
        handlerRef.current();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (shouldTrigger(event.target)) {
        handlerRef.current();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [containerRef]);
}
