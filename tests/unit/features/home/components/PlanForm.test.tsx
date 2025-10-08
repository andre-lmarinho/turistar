// tests/unit/features/home/components/PlanForm.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import PlanForm from '@/features/home/components/PlanForm';
import { useDestinationAutocomplete } from '@/features/home/hooks/search/useDestinationAutocomplete';

const { getCapturedProps, mockLocationSearchInput } = vi.hoisted(() => {
  let captured: unknown;
  return {
    getCapturedProps: () => captured,
    mockLocationSearchInput: vi.fn((props: unknown) => {
      captured = props;
      return null;
    }),
  };
});

vi.mock('next/image', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock('@/shared/ui/calendar', () => ({
  DateRangePicker: () => <div />,
}));

vi.mock('@/shared/components/LoadingScreen', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@/shared/ui/input', () => ({
  __esModule: true,
  LocationSearchInput: mockLocationSearchInput,
}));

vi.mock('@/features/planner/contracts/marketing/createPlannerPlan', () => ({
  createPlannerPlan: vi.fn(),
}));

vi.mock('@/features/planner/contracts/marketing/usePlanEditTokens', () => ({
  usePlanEditTokens: () => ({ saveEditToken: vi.fn() }),
}));

vi.mock('@/features/planner/contracts/marketing/useRecentPlan', () => ({
  useRecentPlan: () => ({ saveRecentPlan: vi.fn() }),
}));

describe('PlanForm destination autocomplete wiring', () => {
  beforeEach(() => {
    mockLocationSearchInput.mockClear();
  });

  it('uses the home destination autocomplete hook', () => {
    render(<PlanForm />);

    const props = getCapturedProps() as
      | { autocompleteHook?: unknown; placeholder?: string }
      | undefined;
    expect(props).toBeDefined();
    expect(props?.autocompleteHook).toBe(useDestinationAutocomplete);
    expect(props?.placeholder).toBe('Destination');
  });
});
