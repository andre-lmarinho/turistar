// src/shared/lib/logger.ts

/**
 * Centralized logger that only outputs in non-production environments.
 */
const isProd = process.env.NODE_ENV === 'production';

export const logger = {
  time(label: string) {
    if (!isProd) console.time(label);
  },
  timeEnd(label: string) {
    if (!isProd) console.timeEnd(label);
  },
  log(...args: unknown[]) {
    if (!isProd) console.log(...args);
  },
};
