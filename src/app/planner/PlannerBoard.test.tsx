// src/app/planner/PlannerBoard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/react';
import { closestCenter } from '@dnd-kit/core';
import PlannerBoard from '@/app/planner/PlannerBoard';
import type { DayPlan, Activity } from '@/types';

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
  render(
    <div style={{ height: '200px' }}>
      <PlannerBoard
        days={days}
        activeId={null}
        sensors={[]}
        collisionDetection={closestCenter}
        handleDragStart={() => {}}
        handleDragOver={() => {}}
        handleDragEnd={() => {}}
        onSelectActivity={() => {}}
        onAddActivity={() => {}}
        onUpdateTitle={() => {}}
        onChangeDay={() => {}}
        onChangeColor={() => {}}
        onDelete={() => {}}
      />
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
