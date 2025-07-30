// src/app/planner/PlannerBoard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/react';
import { closestCenter } from '@dnd-kit/core';
import PlannerBoard from '@/app/planner/PlannerBoard';
import { PlannerProvider } from '@/contexts';
import type { DayPlan, Activity } from '@/types';
import { vi } from 'vitest';

function buildActivities(prefix: string, count: number): Activity[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}${i}`,
    title: `${prefix.toUpperCase()} ${i}`,
    color: 'red',
  }));
}

let mockDays: DayPlan[] = [];

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    usePlanner: () => ({
      planId: 'p1',
      dest: 'rome',
      days: mockDays,
      destCoords: null,
      setDays: vi.fn(),
      currentRange: undefined,
      handleRangeChange: vi.fn(),
      activeId: null,
      sensors: [],
      collisionDetection: closestCenter,
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      addActivity: vi.fn(),
      removeActivity: vi.fn(),
      updateActivity: vi.fn(),
      addBlankActivity: vi.fn(),
    }),
    useSelectedActivity: () => ({
      selectedActivity: null,
      setSelectedActivity: vi.fn(),
      changeDay: vi.fn(),
      changePosition: vi.fn(),
      addBlankAndSelect: vi.fn(),
      closeModal: vi.fn(),
      save: vi.fn(),
      deleteActivity: vi.fn(),
      changeColor: vi.fn(),
    }),
  };
});

function renderBoard() {
  mockDays = [
    { id: 'd1', label: 'Day 1', activities: buildActivities('a', 15) },
    { id: 'd2', label: 'Day 2', activities: buildActivities('b', 15) },
  ];
  render(
    <div style={{ height: '200px' }}>
      <PlannerProvider>
        <PlannerBoard />
      </PlannerProvider>
    </div>
  );
}

describe('PlannerBoard scroll behavior', () => {
  it('keeps scrolling isolated per day column', () => {
    renderBoard();

    const board = screen.getByRole('list', { name: 'Days' });
    const dayScrolls = within(board).getAllByTestId('day-scroll');

    dayScrolls[0].scrollTop = 50;

    expect(dayScrolls[0].scrollTop).toBe(50);
    expect(dayScrolls[1].scrollTop).toBe(0);
    expect(board.scrollTop).toBe(0);
  });
});
