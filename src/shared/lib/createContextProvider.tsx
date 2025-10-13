'use client';

import React, { type PropsWithChildren } from 'react';
import { createStrictContext } from './createStrictContext';

/**
 * Creates a context provider and hook using the given hook to supply the value.
 * The hook receives the provider props (excluding `children`) and returns the context value.
 */
export function createContextProvider<P extends object, T>(
  useValue: (props: P) => T,
  errorMessage: string
) {
  const [Provider, useContext] = createStrictContext<T>(errorMessage);

  function ContextProvider({ children, ...props }: PropsWithChildren<P>) {
    const value = useValue(props as P);
    return <Provider value={value}>{children}</Provider>;
  }

  return [ContextProvider, useContext] as const;
}
