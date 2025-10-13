import { useRef } from 'react';

/**
 * Provides a ref that is compatible both with <button> elements (HTMLButtonElement)
 * and with popup triggerRefs (HTMLElement).
 * This avoids repetitive casting when the same ref needs to be passed to both.
 */

export function useFlexibleRef() {
  return useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement> &
    React.RefObject<HTMLElement>;
}
