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
