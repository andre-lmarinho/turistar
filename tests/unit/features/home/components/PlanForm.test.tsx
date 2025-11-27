import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { PlannerCreationForm } from '@/features/app/user/ui/PlannerCreationForm';
import { useDestinationAutocomplete } from '@/features/app/planner/hooks/search/useDestinationAutocomplete';

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

vi.mock('@/shared/ui/loading', () => ({
  __esModule: true,
  LoadingScreen: () => null,
}));

vi.mock('@/features/app/planner/components/ui/LocationSearchInput', () => ({
  __esModule: true,
  LocationSearchInput: mockLocationSearchInput,
}));

vi.mock('@/features/app/planner/server/createPlan', () => ({
  createPlannerPlan: vi.fn(),
}));

vi.mock('@/features/app/planner/infrastructure/supabase/planEditToken', () => ({
  usePlanEditTokens: () => ({ saveEditToken: vi.fn() }),
}));

vi.mock('@/features/app/planner/hooks/data/useRecentPlan', () => ({
  useRecentPlan: () => ({ saveRecentPlan: vi.fn() }),
}));

describe('PlannerCreationForm destination autocomplete wiring', () => {
  beforeEach(() => {
    mockLocationSearchInput.mockClear();
  });

  it('uses the home destination autocomplete hook', () => {
    render(<PlannerCreationForm persistEditTokens={false} />);

    const props = getCapturedProps() as
      | { autocompleteHook?: unknown; placeholder?: string }
      | undefined;
    expect(props).toBeDefined();
    expect(props?.autocompleteHook).toBe(useDestinationAutocomplete);
    expect(props?.placeholder).toBe('Destination');
  });
});
