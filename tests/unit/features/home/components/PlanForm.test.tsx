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

vi.mock('@/shared/ui/button', async () => {
  const actual = await vi.importActual<typeof import('@/shared/ui/button')>('@/shared/ui/button');
  return actual;
});

vi.mock('@/shared/ui/DatePicker', () => ({
  DateRangePicker: () => <div />,
}));

vi.mock('@/shared/components/LoadingScreen', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@/shared/ui/LocationSearchInput', () => ({
  __esModule: true,
  default: mockLocationSearchInput,
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
