import React from 'react';
import { render, screen } from '@testing-library/react';
import PlannerBoard from './PlannerBoard';
import { closestCorners } from '@dnd-kit/core';
import { vi } from 'vitest';
import type { DayPlan } from '@/types';

describe('PlannerBoard layout', () => {
  it('applies items-start to the board container', () => {
    const days: DayPlan[] = [
      { id: 'd1', label: 'Day 1', activities: [] },
      { id: 'd2', label: 'Day 2', activities: [] },
    ];
    render(
      <PlannerBoard
        days={days}
        activeId={null}
        sensors={[]}
        collisionDetection={closestCorners}
        handleDragStart={vi.fn()}
        handleDragOver={vi.fn()}
        handleDragEnd={vi.fn()}
        onSelectActivity={vi.fn()}
        onAddActivity={vi.fn()}
        onUpdateTitle={vi.fn()}
        onChangeDay={vi.fn()}
        onChangeColor={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const list = screen.getByRole('list');
    expect(list).toHaveClass('items-start');
  });
});
