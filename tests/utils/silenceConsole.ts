// Utility to silence known noisy console warnings/errors in tests.
// Use sparingly and with specific patterns to avoid hiding real issues.

import { vi, type MockInstance } from 'vitest';

export type ConsoleMethod = 'error' | 'warn';

/**
 * Temporarily silences console methods for messages that match given patterns.
 * Returns a restore function; always call it (ideally in finally).
 */
export function silenceConsole(
  patterns: Array<string | RegExp>,
  methods: ConsoleMethod[] = ['error']
): () => void {
  const spies: MockInstance[] = [];

  methods.forEach((method) => {
    const original = console[method];
    const spy = vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      const first = typeof args[0] === 'string' ? args[0] : String(args[0] ?? '');
      const matched = patterns.some((p) =>
        typeof p === 'string' ? first.includes(p) : p.test(first)
      );
      if (matched) return;
      (original as (...a: unknown[]) => void)(...args);
    });
    spies.push(spy);
  });

  return () => {
    spies.forEach((s) => s.mockRestore());
  };
}
