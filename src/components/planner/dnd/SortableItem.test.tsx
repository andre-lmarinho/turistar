import React from 'react';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableItem } from './SortableItem';

describe('SortableItem', () => {
  it('renders the activity title', () => {
    const activity = { id: 'x', title: 'Hello', color: 'red' };
    render(
      <DndContext>
        <ul>
          <SortableItem id="x" activity={activity} />
        </ul>
      </DndContext>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
