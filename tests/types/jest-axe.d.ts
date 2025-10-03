import 'vitest';

declare module 'vitest' {
  // Extend Vitest's expect matchers with a minimal signature
  interface Assertion {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

declare module 'jest-axe' {
  export interface AxeResults {
    violations: Array<unknown>;
    passes: Array<unknown>;
    incomplete: Array<unknown>;
    inapplicable: Array<unknown>;
  }

  export function axe(container: Element | DocumentFragment): Promise<AxeResults>;
  export const toHaveNoViolations: unknown;

  export interface AxeMatchers {
    toHaveNoViolations(): void;
  }
}

export {};
