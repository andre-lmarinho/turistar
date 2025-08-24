// src/shared/hooks/ui/useKeyListener.ts
'use client';

import { useEffect } from 'react';

interface KeyListenerOptions {
  keys: Record<string, () => void>;
  isActive?: boolean;
  filter?: (event: KeyboardEvent) => boolean;
}

/**
 * Attaches a keydown listener for provided key callbacks.
 * Normalizes single-character keys to lowercase to avoid shift issues.
 */
export function useKeyListener({ keys, isActive = true, filter }: KeyListenerOptions) {
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (filter && !filter(e)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const handler = keys[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, filter, keys]);
}
