// src/app/planner/PlannerBoard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/react';
import PlannerBoard from '@/app/planner/PlannerBoard';
import type { DayPlan, Activity } from '@/types';
import { vi } from 'vitest';
let mockCtx: any;
vi.mock('@/contexts/PlannerContext', () => ({
  usePlannerContext: () => mockCtx,
}));

function buildActivities(prefix: string, count: number): Activity[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}${i}`,
    title: `${prefix.toUpperCase()} ${i}`,
    color: 'red',
  }));
}

function renderBoard() {
  const days: DayPlan[] = [
    { id: 'd1', label: 'Day 1', activities: buildActivities('a', 15) },
    { id: 'd2', label: 'Day 2', activities: buildActivities('b', 15) },
  ];
  mockCtx = {
    days,
    activeId: null,
    sensors: [],
    collisionDetection: () => null,
    handleDragStart: () => {},
    handleDragOver: () => {},
    handleDragEnd: () => {},
    setSelectedActivity: () => {},
    addBlankAndSelect: () => {},
    updateActivity: () => {},
    changeDay: () => {},
    changePosition: () => {},
    changeColor: () => {},
    removeActivity: () => {},
  };
  render(
    <div style={{ height: '200px' }}>
      <PlannerBoard />
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
