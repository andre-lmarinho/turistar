import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { SignupPage } from '@/features/planner/modules/signup/SignupPage';
import { useDestinationAutocomplete } from '@/features/planner/hooks/search/useDestinationAutocomplete';

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

vi.mock('@/shared/ui/calendar', () => ({
  DateRangePicker: () => <div />,
}));

vi.mock('@/shared/ui/loading/LoadingScreen', () => ({
  __esModule: true,
  LoadingScreen: () => null,
}));

vi.mock('@/features/planner/ui/input/LocationSearchInput', () => ({
  __esModule: true,
  LocationSearchInput: mockLocationSearchInput,
}));

vi.mock('@/features/planner/server/createPlan', () => ({
  createPlannerPlan: vi.fn(),
}));

vi.mock('@/features/planner/infrastructure/supabase/planEditToken', () => ({
  usePlanEditTokens: () => ({ saveEditToken: vi.fn() }),
}));

vi.mock('@/features/planner/hooks/data/useRecentPlan', () => ({
  useRecentPlan: () => ({ saveRecentPlan: vi.fn() }),
}));

describe('PlanForm destination autocomplete wiring', () => {
  beforeEach(() => {
    mockLocationSearchInput.mockClear();
  });

  it('uses the home destination autocomplete hook', () => {
    render(<SignupPage />);

    const props = getCapturedProps() as
      | { autocompleteHook?: unknown; placeholder?: string }
      | undefined;
    expect(props).toBeDefined();
    expect(props?.autocompleteHook).toBe(useDestinationAutocomplete);
    expect(props?.placeholder).toBe('Destination');
  });
});
