'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Syncs state with localStorage for the given key.
 * Returns the stored value and a setter that persists updates.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const initialRef = useRef(initial);
  const latestValue = useRef(value);

  useEffect(() => {
    initialRef.current = initial;
  }, [initial]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
  }, [key]);

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

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch {
          /* ignore */
        }
      }
    },
    [key]
  );

  return [value, setStoredValue, ready] as const;
}
