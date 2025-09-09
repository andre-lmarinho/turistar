// Global type augmentations and test helpers

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
