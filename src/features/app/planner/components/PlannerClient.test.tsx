import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DateRange } from 'react-day-picker';

import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import { PlannerClient } from './PlannerClient';

type Mode = 'planner' | 'map' | 'budget';

const shared = vi.hoisted(() => ({
  fixtures: {
    initialDays: [{ id: 'd1', label: 'Day 1', activities: [] }] as DayPlan[],
    updatedDays: [{ id: 'd2', label: 'Day 2', activities: [] }] as DayPlan[],
    initialDestCoords: { lat: 0, lng: 0 },
    updatedDestCoords: { lat: 9, lng: 8 },
  },
  spies: {
    handleRangeChange: vi.fn<(r: DateRange | undefined) => void>(),
  },
  usePlannerContext: null as unknown as () => {
    days: DayPlan[];
    destCoords: { lat: number; lng: number } | null;
  },
}));

function mockModeToggleButton() {
  return {
    __esModule: true,
    ModeToggleButton: ({ onChange }: { value: Mode; onChange: (m: Mode) => void }) => (
      <div>
        <button type="button" onClick={() => onChange('planner')}>
          Planner
        </button>
        <button type="button" onClick={() => onChange('map')}>
          Map
        </button>
        <button type="button" onClick={() => onChange('budget')}>
          Budget
        </button>
      </div>
    ),
  };
}

vi.mock('../ui/buttons/ModeToggleButton', mockModeToggleButton);
vi.mock('@/features/app/planner/ui/buttons/ModeToggleButton', mockModeToggleButton);

vi.mock('@/shared/ui/calendar', () => ({
  __esModule: true,
  DateRangePicker: () => <div />,
  DateRangePickerIcon: ({
    onChange,
  }: {
    value: DateRange | undefined;
    onChange: (r: DateRange | undefined) => void;
  }) => (
    <button
      type="button"
      data-testid="date-picker-icon"
      onClick={() => onChange({ from: new Date('2025-01-01'), to: new Date('2025-01-02') })}
    >
      Pick dates
    </button>
  ),
}));

vi.mock('./dialog/ActivityDialog', () => ({ __esModule: true, ActivityDialog: () => null }));
vi.mock('@/features/app/planner/components/dialog/ActivityDialog', () => ({
  __esModule: true,
  ActivityDialog: () => null,
}));

vi.mock('../hooks/budget/BudgetContext', () => ({
  __esModule: true,
  BudgetProvider: ({ children }: { children: unknown }) => <>{children}</>,
}));
vi.mock('@/features/app/planner/hooks/budget/BudgetContext', () => ({
  __esModule: true,
  BudgetProvider: ({ children }: { children: unknown }) => <>{children}</>,
}));

vi.mock('../hooks/data/usePlanTitle', () => ({
  __esModule: true,
  usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() }),
}));
vi.mock('@/features/app/planner/hooks/data/usePlanTitle', () => ({
  __esModule: true,
  usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn(), saveTitle: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function plannerContextFactory() {
  return (async () => {
    const React = await import('react');

    type DestCoords = { lat: number; lng: number } | null;

    type PlannerCtx = {
      planId: string;
      dest: string;
      days: DayPlan[];
      destCoords: DestCoords;
      currentRange: DateRange | undefined;
      handleRangeChange: (r: DateRange | undefined) => void;
      addBlankAndSelect: (...args: unknown[]) => void;
      setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>;
      setSelectedActivity: (...args: unknown[]) => void;
      changeDay: (...args: unknown[]) => void;
      changePosition: (...args: unknown[]) => void;
      changeColor: (...args: unknown[]) => void;
      insertActivityAt: (...args: unknown[]) => void;
      replaceActivity: (...args: unknown[]) => void;
      removeActivity: (...args: unknown[]) => void;
      updateActivity: (...args: unknown[]) => void;
      sensors: unknown;
      collisionDetection: (...args: unknown[]) => void;
      handleDragStart: (...args: unknown[]) => void;
      handleDragOver: (...args: unknown[]) => void;
      handleDragEnd: (...args: unknown[]) => void;
      selectedActivity: unknown;
      canEdit: boolean;
    };

    const Ctx = React.createContext<PlannerCtx | null>(null);

    function PlannerProvider({
      children,
      initialDays,
      planId,
    }: {
      children: React.ReactNode;
      initialDays?: DayPlan[];
      planId: string;
      dest?: string;
      persist?: boolean;
    }) {
      const [days, setDays] = React.useState<DayPlan[]>(initialDays ?? []);
      const [destCoords, setDestCoords] = React.useState<DestCoords>(
        shared.fixtures.initialDestCoords
      );

      const handleRangeChange = (range: DateRange | undefined) => {
        shared.spies.handleRangeChange(range);
        setDays(shared.fixtures.updatedDays);
        setDestCoords(shared.fixtures.updatedDestCoords);
      };

      const value: PlannerCtx = {
        planId,
        dest: 'rome',
        days,
        destCoords,
        currentRange: undefined,
        handleRangeChange,
        addBlankAndSelect: vi.fn(),
        setDays,
        setSelectedActivity: vi.fn(),
        changeDay: vi.fn(),
        changePosition: vi.fn(),
        changeColor: vi.fn(),
        insertActivityAt: vi.fn(),
        replaceActivity: vi.fn(),
        removeActivity: vi.fn(),
        updateActivity: vi.fn(),
        sensors: undefined,
        collisionDetection: vi.fn(),
        handleDragStart: vi.fn(),
        handleDragOver: vi.fn(),
        handleDragEnd: vi.fn(),
        selectedActivity: null,
        canEdit: true,
      };

      return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
    }

    function usePlannerContext() {
      const ctx = React.useContext(Ctx);
      if (!ctx) throw new Error('PlannerContext not initialized');
      return ctx;
    }

    shared.usePlannerContext = usePlannerContext as unknown as typeof shared.usePlannerContext;

    return { __esModule: true, PlannerProvider, usePlannerContext };
  })();
}

vi.mock('../hooks/PlannerContext', plannerContextFactory);
vi.mock('@/features/app/planner/hooks/PlannerContext', plannerContextFactory);

function mockPlannerBoardModule() {
  return {
    __esModule: true,
    PlannerBoard: function PlannerBoardMock() {
      const { days } = shared.usePlannerContext();
      return <div data-testid="planner-board">{days.map((d) => d.id).join(',')}</div>;
    },
  };
}

function mockMapBoardModule() {
  function MapBoardMock() {
    const { destCoords } = shared.usePlannerContext();
    return <div data-testid="map-view">{JSON.stringify(destCoords)}</div>;
  }
  return { __esModule: true, default: MapBoardMock, MapBoard: MapBoardMock };
}

function mockBudgetBoardModule() {
  return { __esModule: true, BudgetBoard: () => <div data-testid="budget-panel" /> };
}

vi.mock('./dnd/PlannerBoard', mockPlannerBoardModule);
vi.mock('@/features/app/planner/components/dnd/PlannerBoard', mockPlannerBoardModule);

vi.mock('./map/MapBoard', mockMapBoardModule);
vi.mock('@/features/app/planner/components/map/MapBoard', mockMapBoardModule);

vi.mock('./budget/BudgetBoard', mockBudgetBoardModule);
vi.mock('@/features/app/planner/components/budget/BudgetBoard', mockBudgetBoardModule);

describe('PlannerClient', () => {
  beforeEach(() => {
    shared.spies.handleRangeChange.mockClear();
  });

  it('shows only the active panel when toggling modes', async () => {
    render(<PlannerClient planId="p1" />);

    const plannerBtn = screen.getAllByRole('button', { name: /planner/i })[0];
    const mapBtn = screen.getAllByRole('button', { name: /map/i })[0];
    const budgetBtn = screen.getAllByRole('button', { name: /budget/i })[0];

    const board = await screen.findByTestId('planner-board');
    const map = await screen.findByTestId('map-view');
    const budget = await screen.findByTestId('budget-panel');

    expect(board.parentElement).toHaveStyle({ pointerEvents: 'auto' });
    expect(map.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(budget.parentElement).toHaveStyle({ pointerEvents: 'none' });

    fireEvent.click(mapBtn);
    expect(board.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(map.parentElement).toHaveStyle({ pointerEvents: 'auto' });
    expect(budget.parentElement).toHaveStyle({ pointerEvents: 'none' });

    fireEvent.click(budgetBtn);
    expect(board.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(map.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(budget.parentElement).toHaveStyle({ pointerEvents: 'auto' });

    fireEvent.click(plannerBtn);
    expect(board.parentElement).toHaveStyle({ pointerEvents: 'auto' });
    expect(map.parentElement).toHaveStyle({ pointerEvents: 'none' });
    expect(budget.parentElement).toHaveStyle({ pointerEvents: 'none' });
  });

  it('propagates date range changes to downstream panels', async () => {
    render(<PlannerClient initialDays={shared.fixtures.initialDays} planId="p1" />);

    const boardEl = screen.getByTestId('planner-board');
    expect(boardEl).toHaveTextContent('d1');

    const mapEl = await screen.findByTestId('map-view');
    expect(mapEl).toHaveTextContent(JSON.stringify(shared.fixtures.initialDestCoords));

    fireEvent.click(screen.getByTestId('date-picker-icon'));

    expect(shared.spies.handleRangeChange).toHaveBeenCalled();

    await waitFor(() => {
      expect(boardEl).toHaveTextContent('d2');
      expect(mapEl).toHaveTextContent(JSON.stringify(shared.fixtures.updatedDestCoords));
    });
  });
});
