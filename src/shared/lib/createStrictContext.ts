"use client";

import { createContext, useContext } from "react";

export function createStrictContext<T>(errorMessage: string) {
  const context = createContext<T | undefined>(undefined);

  const useStrictContext = () => {
    const value = useContext(context);
    if (value === undefined) {
      throw new Error(
        `createStrictContext failed for "${errorMessage}": missing provider in component tree.`
      );
    }
    return value;
  };

  return [context.Provider, useStrictContext] as const;
}
