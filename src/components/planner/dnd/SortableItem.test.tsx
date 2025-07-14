// src/components/planner/dnd/SortableItem.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableItem } from './SortableItem';
import { vi } from 'vitest';
import type { DayPlan } from '@/types';

describe('SortableItem', () => {
  const activity = { id: 'x', title: 'Hello', color: 'red' } as const;

  // props mínimas que o SortableItem exige
  const defaultProps = {
    availableDays: [] as DayPlan[],
    onChangeDay: vi.fn(),
    onChangeColor: vi.fn(),
    bgColor: '',
  };

  it('renders the activity title', () => {
    render(
      <DndContext>
        <ul>
          <SortableItem id="x" activity={activity} {...defaultProps} />
        </ul>
      </DndContext>
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
