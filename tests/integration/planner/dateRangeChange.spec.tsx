// tests/integration/planner/dateRangeChange.spec.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type { DateRange } from 'react-day-picker';
import type { DayPlan } from '@/shared/types';

import PlannerClient from '@/app/planner/PlannerClient';

type Bounds = { sw: [number, number]; ne: [number, number] };
interface PlannerCtx {
  planId: string;
  dest: string;
  days: DayPlan[];
  currentRange: DateRange | undefined;
  handleRangeChange: () => void;
  addBlankAndSelect: () => void;
  bounds: Bounds;
}

// Initial and updated planner state
const initialDays: DayPlan[] = [{ id: 'd1', label: 'Day 1', activities: [] }];
const updatedDays: DayPlan[] = [{ id: 'd2', label: 'Day 2', activities: [] }];
const initialBounds: Bounds = { sw: [0, 0], ne: [1, 1] };
const updatedBounds: Bounds = { sw: [2, 2], ne: [3, 3] };


// Mocks for shared UI components
vi.mock('@/shared/ui/DatePicker', () => ({
  __esModule: true,
  DateRangePicker: ({
    onChange,
  }: {
    value: DateRange | undefined;
    onChange: (r: DateRange | undefined) => void;
  }) => (
    <button
      data-testid="date-picker"
      onClick={() => onChange({ from: new Date('2025-01-01'), to: new Date('2025-01-02') })}
    >
      Pick dates
    </button>
  ),
  DateRangePickerIcon: () => <div />,
}));

vi.mock('@/shared/ui/button-especials/ModeToggleButton', () => ({
  __esModule: true,
  default: () => <div />, // not used in this test
}));

vi.mock('@/shared/ui/button', () => ({
  __esModule: true,
  Button: (props: React.ComponentProps<'button'>) => <button {...props} />,
  buttonVariants: () => '',
}));

let setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>;
let setBounds: React.Dispatch<React.SetStateAction<Bounds>>;
var getPlannerContext: () => PlannerCtx;
export const handleRangeChange = vi.fn(() => {
  setDays(updatedDays);
  setBounds(updatedBounds);
});

// Planner feature mocks
vi.mock('@/features/planner/components/modal/ActivityModal', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@/features/planner/hooks/budget/BudgetContext', () => ({
  __esModule: true,
  BudgetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/planner/hooks/usePlanTitleSupabase', () => ({
  __esModule: true,
  usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() }),
}));

vi.mock('@/features/planner/hooks/PlannerContext', async () => {
  const React = await import('react');

  type InternalPlannerCtx = PlannerCtx & {
    setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>;
    setSelectedActivity: React.Dispatch<React.SetStateAction<null>>;
    changeDay: (...args: unknown[]) => void;
    changePosition: (...args: unknown[]) => void;
    changeColor: (...args: unknown[]) => void;
    removeActivity: (...args: unknown[]) => void;
    updateActivity: (...args: unknown[]) => void;
    sensors: unknown;
    collisionDetection: (...args: unknown[]) => void;
    handleDragStart: (...args: unknown[]) => void;
    handleDragOver: (...args: unknown[]) => void;
    handleDragEnd: (...args: unknown[]) => void;
    selectedActivity: null;
  };

  const PlannerContext = React.createContext<InternalPlannerCtx | null>(null);

  function PlannerProvider({
    children,
    initialDays,
  }: {
    children: React.ReactNode;
    initialDays?: DayPlan[];
    planId: string;
    dest?: string;
    persist?: boolean;
  }) {
    const [days, _setDays] = React.useState(initialDays ?? []);
    const [bounds, _setBounds] = React.useState<Bounds>(initialBounds);
    setDays = _setDays;
    setBounds = _setBounds;
    const value: InternalPlannerCtx = {
      planId: 'p1',
      dest: 'rome',
      days,
      currentRange: undefined,
      handleRangeChange,
      addBlankAndSelect: vi.fn(),
      bounds,
      setDays: _setDays,
      setSelectedActivity: vi.fn(),
      changeDay: vi.fn(),
      changePosition: vi.fn(),
      changeColor: vi.fn(),
      removeActivity: vi.fn(),
      updateActivity: vi.fn(),
      sensors: undefined,
      collisionDetection: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      selectedActivity: null,
    };
    return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
  }

  const usePlannerContext = () => {
    const ctx = React.useContext(PlannerContext);
    if (!ctx) {
      throw new Error('PlannerContext not initialized');
    }
    return ctx;
  };
  getPlannerContext = usePlannerContext as unknown as () => PlannerCtx;

  return { __esModule: true, PlannerProvider, usePlannerContext };
});

// Onboarding mocks
vi.mock('@/features/onboarding/components/OnboardingModal', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@/features/onboarding/hooks/OnboardingContext', () => ({
  __esModule: true,
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useOnboardingContext: () => ({ showOnboarding: false, setShowOnboarding: vi.fn() }),
}));

// Downstream components that read from planner context
vi.mock('@/app/planner/PlannerBoard', () => {
  const React = require('react');
  return {
    default: function PlannerBoardMock() {
      const { days } = getPlannerContext();
      return <div data-testid="planner-board">{days.map((d: DayPlan) => d.id).join(',')}</div>;
    },
  };
});

vi.mock('@/app/planner/MapView', () => {
  const React = require('react');
  return {
    default: function MapViewMock() {
      const ctx =
        typeof getPlannerContext === 'function'
          ? getPlannerContext()
          : {
              bounds: {
                sw: [0, 0] as [number, number],
                ne: [1, 1] as [number, number],
              },
            };
      return <div data-testid="map-view">{JSON.stringify(ctx.bounds)}</div>;
    },
  };
});

vi.mock('@/app/planner/BudgetPanel', () => ({
  default: () => <div />,
}));

// Next.js router mocks
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('date range change propagation', () => {
  it('calls handleRangeChange and updates downstream components', async () => {
    render(<PlannerClient initialDays={initialDays} planId="p1" hideOnboarding />);

    const boardEl = screen.getByTestId('planner-board');
    expect(boardEl).toHaveTextContent('d1');
    const mapEl = await screen.findByTestId('map-view');
    expect(mapEl).toHaveTextContent(JSON.stringify(initialBounds));

    fireEvent.click(screen.getByTestId('date-picker'));

    expect(handleRangeChange).toHaveBeenCalled();

    await waitFor(() => {
      expect(boardEl).toHaveTextContent('d2');
      expect(mapEl).toHaveTextContent(JSON.stringify(updatedBounds));
    });
  });
});
