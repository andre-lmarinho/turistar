//src/lib/storage.ts
import { useEffect, useRef } from 'react';

/**
 * Syncs a value with localStorage.
 * Loads the stored value on mount and saves on change.
 */
export function useLocalStorageSync<T>(
  key: string,
  value: T,
  setValue: React.Dispatch<React.SetStateAction<T>>
) {
  const lastSaved = useRef<string | null>(null);

  // Load stored value
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (stored) {
      try {
        setValue(JSON.parse(stored));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on change
  useEffect(() => {
    const serialized = JSON.stringify(value);
    if (lastSaved.current !== serialized) {
      lastSaved.current = serialized;
      localStorage.setItem(key, serialized);
    }
  }, [key, value]);
}
