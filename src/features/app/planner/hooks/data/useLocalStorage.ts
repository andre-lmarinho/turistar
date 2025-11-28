'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type UseLocalStorageOptions = {
  enabled?: boolean;
};

/**
 * Syncs state with localStorage for the given key.
 * Returns the stored value and a setter that persists updates.
 */
export function useLocalStorage<T>(key: string, initial: T, options?: UseLocalStorageOptions) {
  const enabled = options?.enabled ?? true;
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(!enabled);
  const initialRef = useRef(initial);
  const latestValue = useRef(value);

  useEffect(() => {
    initialRef.current = initial;
  }, [initial]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let nextValue = initialRef.current as T;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        nextValue = JSON.parse(item) as T;
      }
    } catch {
      /* ignore */
    }

    if (!Object.is(latestValue.current, nextValue)) {
      latestValue.current = nextValue;
      setValue(nextValue);
    }

    setReady(true);
  }, [key, enabled]);

  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  const setStoredValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      const resolvedValue =
        typeof nextValue === 'function'
          ? (nextValue as (current: T) => T)(latestValue.current)
          : nextValue;

      latestValue.current = resolvedValue;
      setValue(resolvedValue);

      if (!enabled || typeof window === 'undefined') {
        return;
      }

      try {
        window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      } catch {
        /* ignore */
      }
    },
    [key, enabled]
  );

  return [value, setStoredValue, ready] as const;
}
