// src/shared/hooks/useDebounce.ts
'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of a value that only updates after the delay passes.
 */
export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
