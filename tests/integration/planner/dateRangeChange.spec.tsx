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
vi.mock('@/shared/ui', () => ({
  ModeToggleButton: () => <div />, // not used in this test
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
  Button: (props: React.ComponentProps<'button'>) => <button {...props} />,
}));

let setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>;
let setBounds: React.Dispatch<React.SetStateAction<Bounds>>;
var getPlannerContext: () => PlannerCtx;
export const handleRangeChange = vi.fn(() => {
  setDays(updatedDays);
  setBounds(updatedBounds);
});

// Planner feature mocks
vi.mock('@/features/planner', async () => {
  const React = await import('react');
  const { DateRangePicker } = await import('@/shared/ui');
  const PlannerContext = React.createContext({
    planId: '',
    dest: '',
    days: [] as DayPlan[],
    currentRange: undefined as DateRange | undefined,
    handleRangeChange: () => {},
    addBlankAndSelect: () => {},
    bounds: { sw: [0, 0], ne: [1, 1] } as Bounds,
  });

  function PlannerProvider({
    children,
    initialDays,
  }: {
    children: React.ReactNode;
    initialDays: DayPlan[];
  }) {
    const [days, _setDays] = React.useState(initialDays);
    const [bounds, _setBounds] = React.useState(initialBounds);
    setDays = _setDays;
    setBounds = _setBounds;
    const value = {
      planId: 'p1',
      dest: 'rome',
      days,
      currentRange: undefined as DateRange | undefined,
      handleRangeChange,
      addBlankAndSelect: vi.fn(),
      bounds,
    };
    return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
  }

  const usePlannerContext = () => React.useContext(PlannerContext);
  getPlannerContext = usePlannerContext;
  const usePlanTitle = () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() });
  const ActivityModal = () => null;
  const PlannerControls = () => {
    const { currentRange, handleRangeChange } = usePlannerContext();
    return (
      <div>
        <DateRangePicker value={currentRange} onChange={handleRangeChange} />
      </div>
    );
  };

  return {
    PlannerProvider,
    usePlannerContext,
    usePlanTitle,
    ActivityModal,
    PlannerControls,
    BudgetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Onboarding mocks
vi.mock('@/features/onboarding', () => ({
  OnboardingModal: () => null,
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
        typeof getPlannerContext === 'function' ? getPlannerContext() : { bounds: initialBounds };
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
