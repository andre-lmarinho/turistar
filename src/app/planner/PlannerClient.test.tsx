// src/app/planner/PlannerClient.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { DayPlan } from '@/types';
import PlannerClient from './PlannerClient';

let mockPlanId = 'plan1';

interface MockOpenPanelButtonProps {
  onClick: () => void;
  title?: string;
  days?: DayPlan[];
}

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    usePlanner: () => ({
      planId: mockPlanId,
      dest: 'rome',
      days: [{ id: 'd1', label: 'Day 1', activities: [] }],
      setDays: vi.fn(),
      currentRange: undefined,
      handleRangeChange: vi.fn(),
      activeId: null,
      sensors: [],
      collisionDetection: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      addActivity: vi.fn(),
      removeActivity: vi.fn(),
      updateActivity: vi.fn(),
      addBlankActivity: vi.fn(),
    }),
    usePlanTitle: () => ({ title: 'Trip', setTitle: vi.fn() }),
    useSelectedActivity: () => ({
      selectedActivity: null,
      setSelectedActivity: vi.fn(),
      changeDay: vi.fn(),
      addBlankAndSelect: vi.fn(),
      closeModal: vi.fn(),
      save: vi.fn(),
      deleteActivity: vi.fn(),
      changeColor: vi.fn(),
    }),
    useActivitiesById: () => ({}),
  };
});

vi.mock('@/app/planner/PlannerBoard', () => ({
  default: () => <div data-testid="board" />,
}));
vi.mock('@/app/planner/BudgetPanel', () => ({
  default: () => <div data-testid="budget" />,
}));
vi.mock('@/components', async () => {
  const actual = await vi.importActual<typeof import('@/components')>('@/components');
  return {
    ...actual,
    DestinationFilterPanel: (_props: any) => null,
    DateRangePicker: () => <div data-testid="date-picker" />,
    OpenPanelButton: ({ onClick }: MockOpenPanelButtonProps) => (
      <button onClick={onClick}>Open</button>
    ),
    ModeToggleButton: () => <div data-testid="mode-toggle" />,
    ActivityModal: () => null,
    LoadingScreen: () => <div>Loading...</div>,
  };
});

beforeEach(() => {
  localStorage.clear();
});

describe('PlannerClient onboarding', () => {
  it('shows onboarding for a new plan id even if another plan was seen', () => {
    localStorage.setItem('planner-onboarding-shown-plan1', 'true');
    mockPlanId = 'plan2';
    render(<PlannerClient />);
    expect(screen.getAllByText('Your planner is ready').length).toBeGreaterThan(0);
    expect(localStorage.getItem('planner-onboarding-shown-plan2')).toBe('true');
  });
});
