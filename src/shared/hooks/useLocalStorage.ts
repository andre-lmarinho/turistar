// src/shared/hooks/useLocalStorage.ts
'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Syncs state with localStorage for the given key.
 * Returns the stored value and a setter that persists updates.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item) as T);
      }
    } catch {
      /* ignore */
    } finally {
      initialized.current = true;
      setReady(true);
    }
  }, [key]);

  useEffect(() => {
    if (!initialized.current || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue, ready] as const;
}
