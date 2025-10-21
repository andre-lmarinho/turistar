'use client';

import { createContext, useContext } from 'react';

export function createStrictContext<T>(errorMessage: string) {
  const context = createContext<T | undefined>(undefined);

  const useStrictContext = () => {
    const value = useContext(context);
    if (value === undefined) {
      throw new Error(errorMessage);
    }
    return value;
  };

  return [context.Provider, useStrictContext] as const;
}
