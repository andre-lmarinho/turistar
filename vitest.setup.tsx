// vitest.setup.ts
process.env.TZ = 'UTC';
import '@testing-library/jest-dom';
import React from 'react';

vi.mock('focus-trap-react', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
