import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';

import { SortableItem } from './SortableItem';

describe('SortableItem', () => {
  const activity = { id: 'x', title: 'Hello', color: 'bg-[var(--color-1)]' } as const;

  // minimum props required by SortableItem
  const defaultProps = {
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
